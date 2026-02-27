import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { isAdminAuthorized } from "../../../../lib/auth";

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, tenants });
}

export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const getString = (value: unknown) => (typeof value === "string" ? value : "");
  const contentType = request.headers.get("content-type") ?? "";
  const payload =
    contentType.includes("application/json")
      ? ((await request.json()) as Record<string, string>)
      : Object.fromEntries((await request.formData()).entries());
  const name = getString(payload.name).trim();
  if (!name) {
    return NextResponse.json({ ok: false, error: "name_required" }, { status: 400 });
  }
  const tenant = await prisma.tenant.create({ data: { name } });
  return NextResponse.json({ ok: true, tenant });
}
