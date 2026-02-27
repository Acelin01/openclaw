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
  const tenantId = typeof payload.tenantId === "string" ? payload.tenantId.trim() : "";
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  if (!tenantId || !name) {
    return NextResponse.json({ ok: false, error: "tenantId_and_name_required" }, { status: 400 });
  }
  const role = await prisma.role.create({ data: { tenantId, name } });
  return NextResponse.json({ ok: true, role });
}
