import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { isAdminAuthorized } from "../../../../lib/auth";

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const permissions = await prisma.permission.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ ok: true, permissions });
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
  const key = typeof payload.key === "string" ? payload.key.trim() : "";
  const group = typeof payload.group === "string" ? payload.group.trim() : "general";
  if (!key) {
    return NextResponse.json({ ok: false, error: "key_required" }, { status: 400 });
  }
  const permission = await prisma.permission.create({ data: { key, group: group || "general" } });
  return NextResponse.json({ ok: true, permission });
}
