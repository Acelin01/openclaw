import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { isAdminAuthorized, resolveDefaultTenantId } from "../../../../lib/auth";
import { isGatewayMethodAllowed } from "../../../../lib/gateway/allowlist";
import { resolveMethodPermission, roleHasPermission } from "../../../../lib/permissions";

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "50"), 200);
  const tenantId = url.searchParams.get("tenantId")?.trim() || resolveDefaultTenantId();
  if (!tenantId) {
    return NextResponse.json({ ok: false, error: "tenant_required" }, { status: 400 });
  }
  const requests = await prisma.gatewayCallRequest.findMany({
    orderBy: { requestedAt: "desc" },
    take: limit,
    where: { tenantId },
  });
  return NextResponse.json({ ok: true, requests });
}

export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const contentType = request.headers.get("content-type") ?? "";
  const payload =
    contentType.includes("application/json")
      ? ((await request.json()) as Record<string, unknown>)
      : Object.fromEntries((await request.formData()).entries());
  const method = typeof payload.method === "string" ? payload.method.trim() : "";
  if (!method) {
    return NextResponse.json({ ok: false, error: "method_required" }, { status: 400 });
  }
  if (!isGatewayMethodAllowed(method)) {
    return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 403 });
  }
  const tenantId = typeof payload.tenantId === "string" ? payload.tenantId.trim() : "";
  const resolvedTenantId = tenantId || resolveDefaultTenantId();
  if (!resolvedTenantId) {
    return NextResponse.json({ ok: false, error: "tenant_required" }, { status: 400 });
  }
  const roleId = typeof payload.roleId === "string" ? payload.roleId.trim() : "";
  if (roleId) {
    const permissionKey = resolveMethodPermission(method);
    const allowed = await roleHasPermission(prisma, roleId, permissionKey);
    if (!allowed) {
      return NextResponse.json({ ok: false, error: "permission_denied" }, { status: 403 });
    }
  }
  const params = payload.params ?? null;
  const projectId = typeof payload.projectId === "string" ? payload.projectId.trim() : null;
  const channel = typeof payload.channel === "string" ? payload.channel.trim() : null;
  const requestRecord = await prisma.gatewayCallRequest.create({
    data: {
      tenantId: resolvedTenantId,
      projectId: projectId || undefined,
      channel: channel || undefined,
      method,
      params: params ?? undefined,
      status: "pending",
    },
  });
  return NextResponse.json({ ok: true, request: requestRecord });
}
