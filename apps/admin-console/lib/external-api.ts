export function resolveExternalApiBase() {
  const base =
    process.env.ADMIN_API_BASE_URL?.trim() ||
    process.env.OPENCLAW_API_BASE_URL?.trim() ||
    process.env.API_BASE_URL?.trim() ||
    "http://localhost:3000";
  return base.replace(/\/$/, "");
}

export function resolveExternalServiceSecret() {
  return (
    process.env.ADMIN_API_SERVICE_SECRET?.trim() ||
    process.env.SERVICE_SECRET?.trim() ||
    ""
  );
}
