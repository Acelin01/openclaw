import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { isAdminAuthorized } from "../../../../../lib/auth";
import { computeDailyMetrics, resolveMetricDate } from "../../../../../lib/metrics";

export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const date = resolveMetricDate();
  const metrics = await computeDailyMetrics(prisma);
  const record = await prisma.metricDaily.upsert({
    where: { scope_date: { scope: "global", date } },
    update: { metrics },
    create: { scope: "global", date, metrics },
  });
  return NextResponse.json({ ok: true, record });
}
