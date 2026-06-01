export type UserRole = "owner" | "admin" | "member" | "viewer";

/**
 * Access Control Table
 * Defines boolean mappings for core workspace operations
 */
export const permissions = {
  manageWorkspace: ["owner", "admin"] as UserRole[],
  inviteMembers: ["owner", "admin"] as UserRole[],
  uploadFiles: ["owner", "admin", "member"] as UserRole[],
  runAiFlows: ["owner", "admin", "member"] as UserRole[],
  viewBilling: ["owner", "admin"] as UserRole[],
  deleteWorkspace: ["owner"] as UserRole[],
};

export const canManageWorkspace = (role: UserRole) =>
  permissions.manageWorkspace.includes(role);
export const canInviteMembers = (role: UserRole) =>
  permissions.inviteMembers.includes(role);
export const canUploadFiles = (role: UserRole) =>
  permissions.uploadFiles.includes(role);
export const canRunAiFlows = (role: UserRole) =>
  permissions.runAiFlows.includes(role);
export const canViewBilling = (role: UserRole) =>
  permissions.viewBilling.includes(role);
export const canDeleteWorkspace = (role: UserRole) =>
  permissions.deleteWorkspace.includes(role);
export type PermissionsType = typeof permissions;
export default permissions;
