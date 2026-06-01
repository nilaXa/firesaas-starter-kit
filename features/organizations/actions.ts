"use server";

import { adminDb } from "@/firebase/admin";
import { FirestorePaths } from "@/firebase/firestore";
import { requireAuth } from "@/features/auth/server";
import { createAuditLog } from "@/features/audit-logs/actions";
import {
  createOrgSchema,
  inviteMemberSchema,
  updateRoleSchema,
} from "./schema";
import { canManageWorkspace, UserRole } from "./permissions";

/**
 * Creates a new organization/workspace.
 * Sets the creator as the "owner" member in a atomic write transaction.
 */
export async function createOrganization(data: unknown) {
  const claims = await requireAuth();
  const userId = claims.uid;
  const email = claims.email || "";

  // Validate input schema
  const { name, slug } = createOrgSchema.parse(data);

  const orgsRef = adminDb.collection("organizations");
  const newOrgDoc = orgsRef.doc();
  const orgId = newOrgDoc.id;

  const now = new Date();

  // Create organization doc & creator member doc
  const orgDoc = {
    id: orgId,
    name,
    slug,
    ownerId: userId,
    plan: "free", // Default plan
    createdAt: now,
    updatedAt: now,
  };

  const memberDoc = {
    userId,
    email,
    role: "owner",
    joinedAt: now,
  };

  // Execute in a transaction to guarantee atomic workspace creation
  await adminDb.runTransaction(async (transaction) => {
    const orgRef = adminDb.doc(FirestorePaths.organization(orgId));
    const memberRef = adminDb.doc(FirestorePaths.member(orgId, userId));
    const userRef = adminDb.doc(FirestorePaths.user(userId));

    const userSnap = await transaction.get(userRef);

    transaction.set(orgRef, orgDoc);
    transaction.set(memberRef, memberDoc);

    if (userSnap.exists) {
      transaction.update(userRef, { defaultOrganizationId: orgId });
    } else {
      transaction.set(userRef, {
        id: userId,
        email,
        displayName: claims.name || null,
        photoURL: claims.picture || null,
        defaultOrganizationId: orgId,
        onboardingCompleted: false,
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  // Log compliance audit log
  await createAuditLog({
    organizationId: orgId,
    actorId: userId,
    action: "organization_created",
    targetType: "organization",
    targetId: orgId,
    metadata: { name, slug },
  });

  return { success: true, orgId };
}

/**
 * Fetches organization member role.
 */
async function getMemberRole(
  orgId: string,
  userId: string,
): Promise<string | null> {
  const docRef = adminDb.doc(FirestorePaths.member(orgId, userId));
  const docSnap = await docRef.get();
  return docSnap.exists ? docSnap.data()?.role : null;
}

/**
 * Invites a new member to the workspace.
 * Creates an invitation document.
 */
export async function inviteMember(orgId: string, inviteData: unknown) {
  const claims = await requireAuth();

  // Verify actor role
  const actorRole = await getMemberRole(orgId, claims.uid);
  if (!actorRole || !canManageWorkspace(actorRole as UserRole)) {
    throw new Error("Unauthorized. Only owners and admins can invite members.");
  }

  // Validate input
  const { email, role } = inviteMemberSchema.parse(inviteData);

  const inviteRef = adminDb
    .collection(FirestorePaths.invitationsList(orgId))
    .doc();
  const invitation = {
    id: inviteRef.id,
    email,
    role,
    status: "pending",
    createdAt: new Date(),
  };

  await inviteRef.set(invitation);

  // Log audit
  await createAuditLog({
    organizationId: orgId,
    actorId: claims.uid,
    action: "member_invited",
    targetType: "invitation",
    targetId: invitation.id,
    metadata: { email, role },
  });

  return { success: true, invitation };
}

/**
 * Updates a member's role.
 */
export async function updateMemberRole(orgId: string, payload: unknown) {
  const claims = await requireAuth();

  // Verify actor is owner
  const actorRole = await getMemberRole(orgId, claims.uid);
  if (actorRole !== "owner") {
    throw new Error(
      "Unauthorized. Only organization owners can change member roles.",
    );
  }

  // Validate
  const { userId, role } = updateRoleSchema.parse(payload);

  if (userId === claims.uid) {
    throw new Error(
      "Cannot change your own owner role. Transfer ownership instead.",
    );
  }

  const memberRef = adminDb.doc(FirestorePaths.member(orgId, userId));
  await memberRef.update({ role });

  // Log audit
  await createAuditLog({
    organizationId: orgId,
    actorId: claims.uid,
    action: "role_changed",
    targetType: "member",
    targetId: userId,
    metadata: { newRole: role },
  });

  return { success: true };
}

/**
 * Removes a member from the workspace.
 */
export async function removeMember(orgId: string, memberUserId: string) {
  const claims = await requireAuth();

  // Verify actor
  const actorRole = await getMemberRole(orgId, claims.uid);
  const targetRole = await getMemberRole(orgId, memberUserId);

  if (!actorRole || !targetRole) {
    throw new Error("Invalid request");
  }

  // Owners can delete anyone except themselves. Admins can delete members and viewers.
  const isOwnerAction = actorRole === "owner";
  const isAdminAction =
    actorRole === "admin" &&
    (targetRole === "member" || targetRole === "viewer");
  const isSelfLeaving = claims.uid === memberUserId && targetRole !== "owner";

  if (!isOwnerAction && !isAdminAction && !isSelfLeaving) {
    throw new Error("Unauthorized to remove this member.");
  }

  const memberRef = adminDb.doc(FirestorePaths.member(orgId, memberUserId));
  await memberRef.delete();

  // Log audit
  await createAuditLog({
    organizationId: orgId,
    actorId: claims.uid,
    action: claims.uid === memberUserId ? "member_left" : "member_removed",
    targetType: "member",
    targetId: memberUserId,
  });

  return { success: true };
}
