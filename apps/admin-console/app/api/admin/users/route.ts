import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { isAdminAuthorized } from "../../../../lib/auth";

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, users });
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
  const email = getString(payload.email).trim();
  const name = getString(payload.name).trim() || null;
  if (!email) {
    return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });
  }
  const user = await prisma.user.create({ data: { email, name } });
  return NextResponse.json({ ok: true, user });
}
