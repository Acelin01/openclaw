import type { PrismaClient } from "@prisma/client";

export function resolveMetricDate(date = new Date()) {
  const utc = new Date(date);
  utc.setUTCHours(0, 0, 0, 0);
  return utc;
}

export async function computeDailyMetrics(prisma: PrismaClient) {
  const [tenants, users, projects, tasks, gateways, requests] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.project.count(),
    prisma.task.count(),
    prisma.gatewayInstance.count(),
    prisma.gatewayCallRequest.count(),
  ]);
  return { tenants, users, projects, tasks, gateways, requests };
}
