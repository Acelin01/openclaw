export function isAdminAuthorized(request: Request): boolean {
  const required = process.env.ADMIN_API_KEY?.trim();
  if (!required) {
    return true;
  }
  const headerKey = request.headers.get("x-admin-key")?.trim();
  if (headerKey && headerKey === required) {
    return true;
  }
  const auth = request.headers.get("authorization")?.trim();
  if (auth && auth === `Bearer ${required}`) {
    return true;
  }
  const cookies = request.headers.get("cookie") ?? "";
  const match = cookies.match(/(?:^|;\s*)admin_key=([^;]+)/);
  if (match && decodeURIComponent(match[1]) === required) {
    return true;
  }
  return false;
}

export function resolveDefaultTenantId() {
  const tenantId = process.env.ADMIN_DEFAULT_TENANT_ID?.trim();
  if (tenantId) {
    return tenantId;
  }
  return null;
}
