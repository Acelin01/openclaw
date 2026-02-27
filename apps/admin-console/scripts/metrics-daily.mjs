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
  return { tenants, users, projects, tasks, gateways, requests };
};

const main = async () => {
  const date = resolveMetricDate();
  const metrics = await computeDailyMetrics();
  await prisma.metricDaily.upsert({
    where: { scope_date: { scope: "global", date } },
    update: { metrics },
    create: { scope: "global", date, metrics },
  });
  await prisma.$disconnect();
};

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
