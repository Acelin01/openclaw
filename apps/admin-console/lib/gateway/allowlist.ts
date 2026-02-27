export const GATEWAY_METHOD_ALLOWLIST = new Set<string>([
  "health",
  "status",
  "channels.status",
  "sessions.list",
  "sessions.history",
  "sessions.send",
  "devices.list",
  "device.approvals.list",
  "device.approvals.approve",
  "device.approvals.reject",
]);

export function isGatewayMethodAllowed(method: string) {
  return GATEWAY_METHOD_ALLOWLIST.has(method);
}
