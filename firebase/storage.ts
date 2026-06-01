/**
 * Firebase Storage Path Helpers
 * Standardizes paths for tenant files and user avatars.
 */
export const StoragePaths = {
  // Path for file uploads within a workspace/organization
  organizationFile: (orgId: string, fileId: string, fileName: string) => {
    // Sanitize fileName to prevent path traversal issues
    const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    return `organizations/${orgId}/files/${fileId}/${sanitized}`;
  },

  // Path for user avatar uploads
  userAvatar: (userId: string, fileName: string) => {
    const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    return `users/${userId}/avatars/${sanitized}`;
  },
};
