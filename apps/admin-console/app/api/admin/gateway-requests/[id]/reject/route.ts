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
  const updated = await prisma.gatewayCallRequest.update({
    where: { id },
    data: { status: "rejected", approvedAt: new Date() },
  });
  return NextResponse.json({ ok: true, request: updated });
}
