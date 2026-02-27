import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { isAdminAuthorized } from "../../../../lib/auth";

export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const contentType = request.headers.get("content-type") ?? "";
  const payload =
    contentType.includes("application/json")
      ? ((await request.json()) as Record<string, string>)
      : Object.fromEntries((await request.formData()).entries());
  const roleId = typeof payload.roleId === "string" ? payload.roleId.trim() : "";
  const permissionId =
    typeof payload.permissionId === "string" ? payload.permissionId.trim() : "";
  if (!roleId || !permissionId) {
    return NextResponse.json({ ok: false, error: "roleId_and_permissionId_required" }, { status: 400 });
  }
  await prisma.rolePermission.create({ data: { roleId, permissionId } });
  return NextResponse.json({ ok: true });
}
