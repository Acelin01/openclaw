import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { isAdminAuthorized } from "../../../../lib/auth";

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const metrics = await prisma.metricDaily.findMany({ orderBy: { date: "desc" }, take: 30 });
  return NextResponse.json({ ok: true, metrics });
}
