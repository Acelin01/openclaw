import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { isAdminAuthorized, resolveDefaultTenantId } from "../../../../lib/auth";
import { isGatewayMethodAllowed } from "../../../../lib/gateway/allowlist";

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "50"), 200);
  const requests = await prisma.gatewayCallRequest.findMany({
    orderBy: { requestedAt: "desc" },
    take: limit,
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
  const params = payload.params ?? null;
  const requestRecord = await prisma.gatewayCallRequest.create({
    data: {
      tenantId: resolvedTenantId,
      method,
      params: params ?? undefined,
      status: "pending",
    },
  });
  return NextResponse.json({ ok: true, request: requestRecord });
}
