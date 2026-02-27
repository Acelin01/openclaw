import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { computeDailyMetrics, resolveMetricDate } from "../../../../../lib/metrics";

export async function POST(request: Request) {
  const required = process.env.METRICS_CRON_KEY?.trim();
  if (required) {
    const headerKey = request.headers.get("x-cron-key")?.trim();
    if (!headerKey || headerKey !== required) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
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
