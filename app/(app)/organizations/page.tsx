"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  collectionGroup,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Building2,
  Plus,
  UserPlus,
  Shield,
  Trash2,
  User,
  Loader2,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { db } from "@/firebase/client";
import { useAuth } from "@/features/auth/AuthContext";
import {
  createOrganization,
  inviteMember,
  removeMember,
  updateMemberRole,
} from "@/features/organizations/actions";
import {
  createOrgSchema,
  inviteMemberSchema,
  CreateOrgInput,
  InviteMemberInput,
} from "@/features/organizations/schema";

interface Member {
  userId: string;
  email: string;
  role: string;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  ownerId: string;
}

export default function OrganizationsPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  // States
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [invitingUser, setInvitingUser] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [removingUser, setRemovingUser] = useState<string | null>(null);

  // Forms
  const {
    register: registerOrg,
    handleSubmit: handleSubmitOrg,
    reset: resetOrg,
    formState: { errors: errorsOrg },
  } = useForm<CreateOrgInput>({
    resolver: zodResolver(createOrgSchema),
  });

  const {
    register: registerInvite,
    handleSubmit: handleSubmitInvite,
    reset: resetInvite,
    formState: { errors: errorsInvite },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      role: "member",
    },
  });

  useEffect(() => {
    if (!user) return;

    // Listen to workspaces by querying the memberships collection group securely
    const membersQuery = query(
      collectionGroup(db, "members"),
      where("userId", "==", user.uid),
    );

    const unsubMembers = onSnapshot(
      membersQuery,
      async (snapshot) => {
        const promises = snapshot.docs.map(async (memberDoc) => {
          const orgRef = memberDoc.ref.parent.parent;
          if (orgRef) {
            const orgSnap = await getDoc(orgRef);
            if (orgSnap.exists()) {
              const data = orgSnap.data();
              return {
                id: orgSnap.id,
                name: data.name,
                slug: data.slug,
                plan: data.plan || "free",
                ownerId: data.ownerId,
              };
            }
          }
          return null;
        });

        const results = await Promise.all(promises);
        const activeWorkspaces = results.filter(
          (w): w is Workspace => w !== null,
        );
        setWorkspaces(activeWorkspaces);

        // Auto-set active org
        const storedActiveId = localStorage.getItem("active_org_id");
        if (activeWorkspaces.length > 0) {
          if (
            storedActiveId &&
            activeWorkspaces.some((o) => o.id === storedActiveId)
          ) {
            setActiveOrgId(storedActiveId);
          } else {
            setActiveOrgId(activeWorkspaces[0].id);
            localStorage.setItem("active_org_id", activeWorkspaces[0].id);
          }
        } else {
          setActiveOrgId(null);
        }
      },
      (error) => {
        console.warn("Unauthorized to view workspaces list:", error);
      },
    );

    return () => unsubMembers();
  }, [user]);

  // Listen to members of active org
  useEffect(() => {
    if (!activeOrgId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMembers([]);
      return;
    }

    const membersRef = collection(db, "organizations", activeOrgId, "members");
    const unsubMembers = onSnapshot(
      membersRef,
      (snapshot) => {
        const list: Member[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            userId: doc.id,
            email: data.email,
            role: data.role,
          });
        });
        setMembers(list);
      },
      (error) => {
        console.warn("Unauthorized to view members list for this org:", error);
      },
    );

    return () => unsubMembers();
  }, [activeOrgId]);

  const handleCreateOrg = async (values: CreateOrgInput) => {
    setCreatingOrg(true);
    try {
      const res = await createOrganization(values);
      if (res.success) {
        toast.success("Workspace created successfully!");
        localStorage.setItem("active_org_id", res.orgId);
        setActiveOrgId(res.orgId);
        resetOrg();
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create workspace.",
      );
    } finally {
      setCreatingOrg(false);
    }
  };

  const handleInviteMember = async (values: InviteMemberInput) => {
    if (!activeOrgId) return;
    setInvitingUser(true);
    try {
      await inviteMember(activeOrgId, values);
      toast.success(`Invitation sent to ${values.email}`);
      resetInvite();
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Invitation failed.",
      );
    } finally {
      setInvitingUser(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    if (!activeOrgId) return;
    setUpdatingRole(targetUserId);
    try {
      await updateMemberRole(activeOrgId, {
        userId: targetUserId,
        role: newRole,
      });
      toast.success("Role updated successfully");
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update role",
      );
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!activeOrgId) return;
    setRemovingUser(targetUserId);
    try {
      await removeMember(activeOrgId, targetUserId);
      toast.success("Member removed from workspace");
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to remove member",
      );
    } finally {
      setRemovingUser(null);
    }
  };

  const switchWorkspace = (orgId: string) => {
    setActiveOrgId(orgId);
    localStorage.setItem("active_org_id", orgId);
    toast.success("Switched workspace");
  };

  const activeWorkspace = workspaces.find((w) => w.id === activeOrgId);
  const currentUserRole = members.find((m) => m.userId === user?.uid)?.role;

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-sm text-muted-foreground">
            Create or manage organizations and control team access.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Workspaces list & Creation */}
        <div className="space-y-6 lg:col-span-1">
          {/* Create Workspace Form */}
          <div className="bg-card border border-border/80 rounded-lg p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-primary" />
              <span>Create Workspace</span>
            </h3>
            <form
              onSubmit={handleSubmitOrg(handleCreateOrg)}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  {...registerOrg("name")}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Acme Corp"
                />
                {errorsOrg.name && (
                  <p className="mt-1 text-xs text-destructive">
                    {errorsOrg.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  {...registerOrg("slug")}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="acme-corp"
                />
                {errorsOrg.slug && (
                  <p className="mt-1 text-xs text-destructive">
                    {errorsOrg.slug.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={creatingOrg}
                className="w-full inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 h-9 text-sm transition-all disabled:opacity-50 shadow-sm"
              >
                {creatingOrg ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create"
                )}
              </button>
            </form>
          </div>

          {/* Workspaces List */}
          <div className="bg-card border border-border/80 rounded-lg p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-4.5 w-4.5 text-primary" />
              <span>My Workspaces</span>
            </h3>
            <div className="space-y-2">
              {workspaces.map((org) => {
                const isActive = org.id === activeOrgId;
                return (
                  <button
                    key={org.id}
                    onClick={() => switchWorkspace(org.id)}
                    className={`w-full flex items-center justify-between p-3 border rounded-md transition-all text-left ${
                      isActive
                        ? "border-primary bg-primary/5 font-semibold text-primary"
                        : "border-border/80 hover:bg-muted hover:border-border text-foreground"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="text-sm truncate">{org.name}</p>
                      <p className="text-xs text-muted-foreground truncate font-mono">
                        /{org.slug}
                      </p>
                    </div>
                    {isActive && (
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                    )}
                  </button>
                );
              })}
              {workspaces.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  No workspaces created yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Active workspace members management (2/3 col) */}
        <div className="lg:col-span-2 space-y-6">
          {activeWorkspace ? (
            <>
              {/* Member Invite Form */}
              {(currentUserRole === "owner" || currentUserRole === "admin") && (
                <div className="bg-card border border-border/80 rounded-lg p-6 space-y-4 shadow-sm">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <UserPlus className="h-4.5 w-4.5 text-primary" />
                    <span>Invite Team Member</span>
                  </h3>
                  <form
                    onSubmit={handleSubmitInvite(handleInviteMember)}
                    className="flex flex-col sm:flex-row items-end gap-4"
                  >
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                          type="email"
                          {...registerInvite("email")}
                          className="block w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="developer@company.com"
                        />
                      </div>
                      {errorsInvite.email && (
                        <p className="mt-1 text-xs text-destructive">
                          {errorsInvite.email.message}
                        </p>
                      )}
                    </div>

                    <div className="w-full sm:w-36">
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Role
                      </label>
                      <select
                        {...registerInvite("role")}
                        className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={invitingUser}
                      className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 h-9 px-6 text-sm transition-all disabled:opacity-50 shrink-0 shadow-sm"
                    >
                      {invitingUser ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Invite"
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Members Table */}
              <div className="bg-card border border-border/80 rounded-lg p-6 space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-foreground">
                  Team Members in {activeWorkspace.name}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border/60 text-sm">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <th className="pb-3 pr-4">User</th>
                        <th className="pb-3 px-4">Role</th>
                        <th className="pb-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {members.map((member) => (
                        <tr
                          key={member.userId}
                          className="hover:bg-muted/10 transition-colors"
                        >
                          {/* User details */}
                          <td className="py-3 pr-4 flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <User className="h-4 w-4" />
                            </div>
                            <div className="truncate">
                              <p className="font-semibold text-foreground truncate">
                                {member.email}
                              </p>
                              {member.userId === user?.uid && (
                                <p className="text-xxs text-primary font-bold">
                                  You
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Role selector/badge */}
                          <td className="py-3 px-4">
                            {currentUserRole === "owner" &&
                            member.userId !== user?.uid ? (
                              <select
                                value={member.role}
                                disabled={updatingRole === member.userId}
                                onChange={(e) =>
                                  handleRoleChange(
                                    member.userId,
                                    e.target.value,
                                  )
                                }
                                className="rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                              >
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                                <option value="viewer">Viewer</option>
                                <option value="owner">Owner</option>
                              </select>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border border-border bg-muted capitalize">
                                <Shield className="h-3 w-3 text-primary" />
                                {member.role}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 pl-4 text-right">
                            {member.role !== "owner" &&
                              (currentUserRole === "owner" ||
                                (currentUserRole === "admin" &&
                                  member.role !== "admin") ||
                                member.userId === user?.uid) && (
                                <button
                                  onClick={() =>
                                    handleRemoveMember(member.userId)
                                  }
                                  disabled={removingUser === member.userId}
                                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-all"
                                  aria-label="Remove member"
                                >
                                  {removingUser === member.userId ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="border border-dashed border-border rounded-lg p-16 text-center space-y-4 bg-card shadow-sm">
              <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground italic">
                Select or create a workspace on the left panel to manage users.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
