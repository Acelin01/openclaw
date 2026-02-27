import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { isAdminAuthorized } from "../../../../../../lib/auth";

export async function POST(request: Request, context: { params: { id: string } }) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const id = context.params.id;
  const record = await prisma.gatewayCallRequest.findUnique({ where: { id } });
  if (!record) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  if (record.status !== "pending" && record.status !== "second_pending") {
    return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
  }
  const nextLevel = record.approvalLevelCurrent + 1;
  const isFinal = nextLevel >= record.approvalLevelRequired;
  const updated = await prisma.gatewayCallRequest.update({
    where: { id },
    data: {
      approvalLevelCurrent: nextLevel,
      status: isFinal ? "approved" : "second_pending",
      approvedAt: isFinal ? new Date() : record.approvedAt,
      firstApprovedAt: nextLevel === 1 ? new Date() : record.firstApprovedAt,
      secondApprovedAt: isFinal && nextLevel >= 2 ? new Date() : record.secondApprovedAt,
    },
  });
  return NextResponse.json({ ok: true, request: updated });
}
