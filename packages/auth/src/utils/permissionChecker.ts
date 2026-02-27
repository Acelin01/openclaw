import { TeamMember, Permission } from "../types/team.types";

export const hasPermission = (member: TeamMember, requiredPermission: Permission): boolean => {
  // Owner 拥有所有权限
  if (member.role === "owner") return true;

  // Admin 拥有除特定敏感操作外的所有权限
  if (member.role === "admin") {
    const adminRestricted: Permission[] = ["manage_billing"]; // Example restriction
    return !adminRestricted.includes(requiredPermission);
  }

  // 普通成员检查自定义权限列表或角色默认权限
  const memberDefaultPermissions: Permission[] = ["read"];
  const permissions = member.customPermissions || memberDefaultPermissions;

  return permissions.includes(requiredPermission);
};

export const canManageTeam = (member: TeamMember): boolean => {
  return member.role === "owner" || member.role === "admin";
};
