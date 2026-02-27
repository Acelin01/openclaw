import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const resolveMetricDate = (date = new Date()) => {
  const utc = new Date(date);
  utc.setUTCHours(0, 0, 0, 0);
  return utc;
};

const computeDailyMetrics = async () => {
  const [tenants, users, projects, tasks, gateways, requests] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.project.count(),
    prisma.task.count(),
    prisma.gatewayInstance.count(),
    prisma.gatewayCallRequest.count(),
  ]);
  const global = { scope: "global", metrics: { tenants, users, projects, tasks, gateways, requests } };

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
};

const main = async () => {
  const date = resolveMetricDate();
  const metricsRows = await computeDailyMetrics();
  for (const row of metricsRows) {
    await prisma.metricDaily.upsert({
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
  }
  await prisma.$disconnect();
};

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
