"use server";

import { adminDb, adminStorage } from "@/firebase/admin";
import { FirestorePaths } from "@/firebase/firestore";
import { requireAuth } from "@/features/auth/server";
import { createAuditLog } from "@/features/audit-logs/actions";
import { registerFileInputSchema } from "./schema";
import { canUploadFiles, UserRole } from "@/features/organizations/permissions";

/**
 * Checks if a user is a member of the organization and returns their role.
 */
async function checkMemberRole(
  orgId: string,
  userId: string,
): Promise<string | null> {
  const memberRef = adminDb.doc(FirestorePaths.member(orgId, userId));
  const snap = await memberRef.get();
  return snap.exists ? snap.data()?.role : null;
}

/**
 * Registers file metadata in Firestore after client-side upload completes.
 */
export async function registerFileMetadata(data: unknown) {
  const claims = await requireAuth();

  // Validate schema
  const validated = registerFileInputSchema.parse(data);

  const {
    id: fileId,
    organizationId: orgId,
    name,
    path,
    contentType,
    size,
    status,
  } = validated;

  // Verify workspace access and upload permissions
  const role = await checkMemberRole(orgId, claims.uid);
  if (!role || !canUploadFiles(role as UserRole)) {
    throw new Error(
      "Unauthorized workspace access or insufficient upload permissions.",
    );
  }

  const now = new Date();
  const fileMetadata = {
    id: fileId,
    organizationId: orgId,
    ownerId: claims.uid,
    name,
    path,
    contentType,
    size,
    status,
    createdAt: now,
    updatedAt: now,
  };

  const fileDocRef = adminDb.doc(FirestorePaths.file(orgId, fileId));
  await fileDocRef.set(fileMetadata);

  // Log compliance audit
  await createAuditLog({
    organizationId: orgId,
    actorId: claims.uid,
    action: "file_uploaded",
    targetType: "file",
    targetId: fileId,
    metadata: { name, contentType, size },
  });

  return { success: true, metadata: fileMetadata };
}

/**
 * Deletes file metadata and physically removes the file from Firebase Storage.
 */
export async function deleteFile(orgId: string, fileId: string) {
  const claims = await requireAuth();

  // 1. Fetch file metadata
  const fileRef = adminDb.doc(FirestorePaths.file(orgId, fileId));
  const fileSnap = await fileRef.get();

  if (!fileSnap.exists) {
    throw new Error("File not found.");
  }

  const fileData = fileSnap.data()!;

  // 2. Authorization check
  const actorRole = await checkMemberRole(orgId, claims.uid);
  const isOwner = fileData.ownerId === claims.uid;
  const isOrgManager = actorRole === "owner" || actorRole === "admin";

  if (!isOwner && !isOrgManager) {
    throw new Error(
      "Unauthorized. Only the file owner, admin, or owner can delete files.",
    );
  }

  // 3. Delete from physical storage
  try {
    const bucket = adminStorage.bucket();
    const storageFile = bucket.file(fileData.path);

    // Check if file exists in Storage before calling delete to avoid crashes
    const [exists] = await storageFile.exists();
    if (exists) {
      await storageFile.delete();
      console.log(`Deleted file in storage bucket: ${fileData.path}`);
    }
  } catch (err) {
    console.error(
      "Storage delete warning (continuing to clear metadata):",
      err,
    );
  }

  // 4. Delete Firestore document
  await fileRef.delete();

  // 5. Log audit
  await createAuditLog({
    organizationId: orgId,
    actorId: claims.uid,
    action: "file_deleted",
    targetType: "file",
    targetId: fileId,
    metadata: { name: fileData.name },
  });

  return { success: true };
}
