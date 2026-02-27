import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { isAdminAuthorized } from "../../../../lib/auth";

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "50"), 200);
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" }, take: limit });
  return NextResponse.json({ ok: true, jobs });
}

export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const payload = (await request.json()) as Record<string, unknown>;
  const type = typeof payload.type === "string" ? payload.type.trim() : "";
  if (!type) {
    return NextResponse.json({ ok: false, error: "type_required" }, { status: 400 });
  }
  const job = await prisma.job.create({
    data: {
      type,
      tenantId: typeof payload.tenantId === "string" ? payload.tenantId : undefined,
      payload: payload.payload ?? undefined,
      maxAttempts: typeof payload.maxAttempts === "number" ? payload.maxAttempts : 5,
      runAt: new Date(),
    },
  });
  return NextResponse.json({ ok: true, job });
}
