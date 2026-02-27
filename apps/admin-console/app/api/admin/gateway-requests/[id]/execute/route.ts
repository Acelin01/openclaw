import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { isAdminAuthorized } from "../../../../../../lib/auth";
import { callGatewayMethod } from "../../../../../../lib/gateway/client";
import { isGatewayMethodAllowed } from "../../../../../../lib/gateway/allowlist";

export async function POST(request: Request, context: { params: { id: string } }) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const id = context.params.id;
  const record = await prisma.gatewayCallRequest.findUnique({ where: { id } });
  if (!record) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  if (record.status !== "approved") {
    return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
  }
  if (!isGatewayMethodAllowed(record.method)) {
    await prisma.gatewayCallRequest.update({
      where: { id },
      data: { status: "failed", error: "method_not_allowed", executedAt: new Date() },
    });
    return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 403 });
  }
  try {
    const result = await callGatewayMethod(record.method, record.params ?? undefined);
    const updated = await prisma.gatewayCallRequest.update({
      where: { id },
      data: { status: "executed", result, executedAt: new Date() },
    });
    await prisma.auditLog.create({
      data: {
        tenantId: record.tenantId,
        action: "gateway.execute",
        resource: record.method,
        metadata: { requestId: record.id, ok: true },
      },
    });
    return NextResponse.json({ ok: true, request: updated });
  } catch (err) {
    const updated = await prisma.gatewayCallRequest.update({
      where: { id },
      data: {
        status: "failed",
        error: err instanceof Error ? err.message : String(err),
        executedAt: new Date(),
      },
    });
    await prisma.auditLog.create({
      data: {
        tenantId: record.tenantId,
        action: "gateway.execute",
        resource: record.method,
        metadata: { requestId: record.id, ok: false },
      },
    });
    return NextResponse.json({ ok: false, request: updated }, { status: 502 });
  }
}
