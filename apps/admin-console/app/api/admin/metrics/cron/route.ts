import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";

export async function POST(request: Request) {
  const required = process.env.METRICS_CRON_KEY?.trim();
  if (required) {
    const headerKey = request.headers.get("x-cron-key")?.trim();
    if (!headerKey || headerKey !== required) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }
  const job = await prisma.job.create({
    data: { type: "metrics.daily", status: "pending" },
  });
  return NextResponse.json({ ok: true, jobId: job.id });
}
