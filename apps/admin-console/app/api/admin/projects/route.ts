import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { isAdminAuthorized } from "../../../../lib/auth";

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const projects = await prisma.project.findMany({
    include: { tasks: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ ok: true, projects });
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
  const tenantId = getString(payload.tenantId).trim();
  const name = getString(payload.name).trim();
  const status = getString(payload.status || "active").trim();
  if (!tenantId || !name) {
    return NextResponse.json({ ok: false, error: "tenantId_and_name_required" }, { status: 400 });
  }
  const project = await prisma.project.create({ data: { tenantId, name, status } });
  return NextResponse.json({ ok: true, project });
}
