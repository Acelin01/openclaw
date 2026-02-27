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

  const global = {
    scope: "global",
    metrics: { tenants, users, projects, tasks, gateways, requests },
  };

  const tenantStats = await prisma.tenant.findMany({
    select: {
      id: true,
      projects: { select: { id: true } },
      members: { select: { id: true } },
      gateways: { select: { id: true } },
      requests: { select: { id: true } },
    },
  });

  const tenantMetrics = tenantStats.map((tenant) => ({
    scope: "tenant",
    tenantId: tenant.id,
    metrics: {
      projects: tenant.projects.length,
      members: tenant.members.length,
      gateways: tenant.gateways.length,
      requests: tenant.requests.length,
    },
  }));

  const projectStats = await prisma.project.findMany({
    select: {
      id: true,
      tenantId: true,
      tasks: { select: { id: true } },
    },
  });

  const projectMetrics = projectStats.map((project) => ({
    scope: "project",
    tenantId: project.tenantId,
    projectId: project.id,
    metrics: { tasks: project.tasks.length },
  }));

  const channelStats = await prisma.gatewayCallRequest.groupBy({
    by: ["tenantId", "channel"],
    _count: { _all: true },
    where: { channel: { not: null } },
  });

  const channelMetrics = channelStats.map((row) => ({
    scope: "channel",
    tenantId: row.tenantId,
    channel: row.channel ?? "unknown",
    metrics: { requests: row._count._all },
  }));

  return [global, ...tenantMetrics, ...projectMetrics, ...channelMetrics];
}
