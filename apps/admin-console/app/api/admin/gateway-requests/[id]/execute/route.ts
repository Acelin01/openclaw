import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { isAdminAuthorized } from "../../../../../../lib/auth";
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
  const job = await prisma.job.create({
    data: {
      type: "gateway.execute",
      status: "pending",
      tenantId: record.tenantId,
      payload: { requestId: record.id },
    },
  });
  const updated = await prisma.gatewayCallRequest.update({
    where: { id },
    data: { status: "queued", queuedAt: new Date() },
  });
  await prisma.auditLog.create({
    data: {
      tenantId: record.tenantId,
      action: "gateway.queue",
      resource: record.method,
      metadata: { requestId: record.id, jobId: job.id },
    },
  });
  return NextResponse.json({ ok: true, request: updated, jobId: job.id });
}
