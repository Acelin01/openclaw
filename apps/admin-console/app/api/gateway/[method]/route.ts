import { NextResponse } from "next/server";
import { callGatewayMethod } from "../../../../lib/gateway/client";
import { isGatewayMethodAllowed } from "../../../../lib/gateway/allowlist";
import { prisma } from "../../../../lib/db";
import { resolveDefaultTenantId } from "../../../../lib/auth";

export async function POST(request: Request, context: { params: { method: string } }) {
  const method = context.params.method;
  if (!isGatewayMethodAllowed(method)) {
    return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 403 });
  }
  let params: unknown = undefined;
  if (request.headers.get("content-type")?.includes("application/json")) {
    params = await request.json();
  }
  try {
    const result = await callGatewayMethod(method, params);
    const tenantId = resolveDefaultTenantId();
    if (tenantId) {
      await prisma.auditLog.create({
        data: {
          tenantId,
          action: "gateway.call",
          resource: method,
          metadata: { params, ok: true },
        },
      });
    }
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const tenantId = resolveDefaultTenantId();
    if (tenantId) {
      await prisma.auditLog.create({
        data: {
          tenantId,
          action: "gateway.call",
          resource: method,
          metadata: { params, ok: false, error: err instanceof Error ? err.message : String(err) },
        },
      });
    }
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }
}
