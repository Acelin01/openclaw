import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { isAdminAuthorized } from "../../../../../lib/auth";
import { computeDailyMetrics, resolveMetricDate } from "../../../../../lib/metrics";

export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const date = resolveMetricDate();
  const metricsRows = await computeDailyMetrics(prisma);
  const records = [];
  for (const row of metricsRows) {
    const record = await prisma.metricDaily.upsert({
      where: {
        scope_date_tenantId_projectId_channel: {
          scope: row.scope,
          date,
          tenantId: row.tenantId ?? null,
          projectId: row.projectId ?? null,
          channel: row.channel ?? null,
        },
      },
      update: { metrics: row.metrics, tenantId: row.tenantId ?? null, projectId: row.projectId ?? null, channel: row.channel ?? null },
      create: {
        scope: row.scope,
        date,
        tenantId: row.tenantId ?? null,
        projectId: row.projectId ?? null,
        channel: row.channel ?? null,
        metrics: row.metrics,
      },
    });
    records.push(record);
  }
  return NextResponse.json({ ok: true, records });
}
