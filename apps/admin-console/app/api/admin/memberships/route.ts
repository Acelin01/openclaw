import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { isAdminAuthorized } from "../../../../lib/auth";

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const memberships = await prisma.membership.findMany({
    orderBy: { createdAt: "desc" },
    include: { tenant: true, user: true, role: true },
  });
  return NextResponse.json({ ok: true, memberships });
}

export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const contentType = request.headers.get("content-type") ?? "";
  const payload =
    contentType.includes("application/json")
      ? ((await request.json()) as Record<string, string>)
      : Object.fromEntries((await request.formData()).entries());
  const tenantId = typeof payload.tenantId === "string" ? payload.tenantId.trim() : "";
  const userId = typeof payload.userId === "string" ? payload.userId.trim() : "";
  const roleId = typeof payload.roleId === "string" ? payload.roleId.trim() : "";
  if (!tenantId || !userId) {
    return NextResponse.json({ ok: false, error: "tenantId_and_userId_required" }, { status: 400 });
  }
  const membership = await prisma.membership.upsert({
    where: { tenantId_userId: { tenantId, userId } },
    update: { roleId: roleId || null },
    create: { tenantId, userId, roleId: roleId || null },
  });
  return NextResponse.json({ ok: true, membership });
}
