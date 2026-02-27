import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { isAdminAuthorized } from "../../../../lib/auth";

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const alerts = await prisma.alertChannel.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, alerts });
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
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const type = typeof payload.type === "string" ? payload.type.trim() : "";
  const target = typeof payload.target === "string" ? payload.target.trim() : "";
  const tenantId = typeof payload.tenantId === "string" ? payload.tenantId.trim() : "";
  if (!name || !type || !target) {
    return NextResponse.json({ ok: false, error: "name_type_target_required" }, { status: 400 });
  }
  const alert = await prisma.alertChannel.create({
    data: {
      name,
      type,
      target,
      tenantId: tenantId || null,
    },
  });
  return NextResponse.json({ ok: true, alert });
}
