"use client";

import { useEffect, useState } from "react";
import {
  onSnapshot,
  collectionGroup,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { Building2, ChevronDown, Plus, Check } from "lucide-react";
import { db } from "@/firebase/client";
import { useAuth } from "@/features/auth/AuthContext";
import { useRouter } from "next/navigation";

interface OrgItem {
  id: string;
  name: string;
}

export function WorkspaceSwitcher() {
  const { user } = useAuth();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<OrgItem[]>([]);
  const [activeOrg, setActiveOrg] = useState<OrgItem | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Listen to workspaces by querying the memberships collection group securely
    const membersQuery = query(
      collectionGroup(db, "members"),
      where("userId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(
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
              };
            }
          }
          return null;
        });

        const results = await Promise.all(promises);
        const orgList = results.filter((w): w is OrgItem => w !== null);
        setOrganizations(orgList);

        // Set active organization
        if (orgList.length > 0) {
          const storedActiveId = localStorage.getItem("active_org_id");
          const found = orgList.find((o) => o.id === storedActiveId);
          if (found) {
            setActiveOrg(found);
          } else {
            setActiveOrg(orgList[0]);
            localStorage.setItem("active_org_id", orgList[0].id);
          }
        } else {
          setActiveOrg(null);
        }
      },
      (error) => {
        console.warn("Unauthorized to view workspaces list:", error);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const selectOrg = (org: OrgItem) => {
    setActiveOrg(org);
    localStorage.setItem("active_org_id", org.id);
    setOpen(false);
    // Reload page to refresh dashboard context
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-between gap-2 px-3 py-1.5 border border-border bg-card rounded-md text-sm font-semibold hover:bg-muted transition-colors min-w-[160px]"
      >
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate max-w-[100px]">
            {activeOrg ? activeOrg.name : "Select Workspace"}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-md z-20 py-1.5 focus:outline-none">
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Workspaces
            </p>
            <div className="max-h-48 overflow-y-auto mt-1">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => selectOrg(org)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                >
                  <span className="truncate">{org.name}</span>
                  {activeOrg?.id === org.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
              {organizations.length === 0 && (
                <p className="px-3 py-2 text-xs text-muted-foreground italic">
                  No workspaces found
                </p>
              )}
            </div>
            <div className="border-t border-border mt-1.5 pt-1.5 px-1.5">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/organizations");
                }}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-md transition-colors text-left"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Workspace</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default WorkspaceSwitcher;
