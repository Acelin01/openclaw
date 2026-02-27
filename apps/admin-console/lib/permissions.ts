import type { PrismaClient } from "@prisma/client";

const METHOD_PERMISSIONS: Record<string, string> = {
  health: "gateway.read",
  status: "gateway.read",
  "channels.status": "gateway.read",
  "sessions.list": "gateway.read",
  "sessions.history": "gateway.read",
  "devices.list": "gateway.read",
  "sessions.send": "gateway.write",
  "device.approvals.list": "gateway.approval",
  "device.approvals.approve": "gateway.approval",
  "device.approvals.reject": "gateway.approval",
};

export function resolveMethodPermission(method: string) {
  return METHOD_PERMISSIONS[method] ?? "gateway.write";
}

export function resolveApprovalLevel(method: string) {
  const perm = resolveMethodPermission(method);
  if (perm === "gateway.read") {
    return 1;
  }
  if (perm === "gateway.approval") {
    return 1;
  }
  return 2;
}

export async function roleHasPermission(
  prisma: PrismaClient,
  roleId: string,
  permissionKey: string,
) {
  const match = await prisma.rolePermission.findFirst({
    where: { roleId, permission: { key: permissionKey } },
  });
  return Boolean(match);
}
