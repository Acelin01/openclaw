import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { isAdminAuthorized } from "../../../../lib/auth";

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: { project: true },
  });
  return NextResponse.json({ ok: true, tasks });
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
  const projectId = getString(payload.projectId).trim();
  const title = getString(payload.title).trim();
  const status = getString(payload.status || "pending").trim();
  if (!projectId || !title) {
    return NextResponse.json({ ok: false, error: "projectId_and_title_required" }, { status: 400 });
  }
  const task = await prisma.task.create({ data: { projectId, title, status } });
  return NextResponse.json({ ok: true, task });
}
