/**
 * Firestore Path Helpers
 * Centralized schema helper functions to guarantee path consistency
 * across server-side queries, client hooks, and tests.
 */

export const FirestorePaths = {
  // Users collections
  user: (userId: string) => `users/${userId}`,
  privateUser: (userId: string) => `privateUsers/${userId}`,
  usersList: () => "users",

  // Organizations collections
  organization: (orgId: string) => `organizations/${orgId}`,
  organizationsList: () => "organizations",

  // Organization members
  member: (orgId: string, userId: string) =>
    `organizations/${orgId}/members/${userId}`,
  membersList: (orgId: string) => `organizations/${orgId}/members`,

  // Organization invitations
  invitation: (orgId: string, inviteId: string) =>
    `organizations/${orgId}/invitations/${inviteId}`,
  invitationsList: (orgId: string) => `organizations/${orgId}/invitations`,

  // Files metadata
  file: (orgId: string, fileId: string) =>
    `organizations/${orgId}/files/${fileId}`,
  filesList: (orgId: string) => `organizations/${orgId}/files`,

  // AI Usage logging
  aiUsageLog: (orgId: string, logId: string) =>
    `organizations/${orgId}/aiUsage/${logId}`,
  aiUsageLogsList: (orgId: string) => `organizations/${orgId}/aiUsage`,

  // Audit Logs
  auditLog: (orgId: string, logId: string) =>
    `organizations/${orgId}/auditLogs/${logId}`,
  auditLogsList: (orgId: string) => `organizations/${orgId}/auditLogs`,
};

export const firestoreConverter = <T extends object>() => ({
  toFirestore: (data: T) => {
    // Return data, stripping undefined fields which Firestore doesn't accept
    const clean: Record<string, unknown> = {};
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined) {
        clean[key] = val;
      }
    });
    return clean;
  },
  fromFirestore: (snapshot: { data: () => unknown; id: string }) => {
    const data = snapshot.data() as Record<string, unknown>;
    return {
      ...data,
      id: snapshot.id,
    } as unknown as T;
  },
});
