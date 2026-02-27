import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import WebSocket from "ws";

const prisma = new PrismaClient();

const resolveGatewayUrl = () =>
  process.env.OPENCLAW_GATEWAY_WS_URL ||
  process.env.GATEWAY_WS_URL ||
  process.env.OPENCLAW_GATEWAY_URL ||
  "ws://127.0.0.1:18789";

const resolveGatewayToken = () =>
  process.env.OPENCLAW_GATEWAY_TOKEN || process.env.GATEWAY_TOKEN || "";

const sendAlert = async (message, payload, tenantId) => {
  const alertChannels = await prisma.alertChannel.findMany({
    where: {
      enabled: true,
      ...(tenantId
        ? {
            OR: [{ tenantId }, { tenantId: null }],
          }
        : {}),
    },
  });
  if (!alertChannels.length) {
    return;
  }
  await Promise.all(
    alertChannels.map(async (channel) => {
      const target = channel.target?.trim();
      if (!target) {
        return;
      }
      let body = { text: `${channel.name}: ${message}`, payload };
      if (channel.type === "feishu") {
        body = { msg_type: "text", content: { text: `${channel.name}: ${message}` } };
      }
      if (channel.type === "email") {
        body = { subject: channel.name, text: message, payload };
      }
      await fetch(target, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }).catch(() => {});
    }),
  );
};

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

const waitForMessage = (ws, predicate, timeoutMs) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.removeEventListener("message", onMessage);
      reject(new Error("gateway response timeout"));
    }, timeoutMs);
    const onMessage = (evt) => {
      try {
        const raw = typeof evt.data === "string" ? evt.data : Buffer.from(evt.data).toString("utf8");
        const parsed = JSON.parse(raw);
        if (predicate(parsed)) {
          clearTimeout(timer);
          ws.removeEventListener("message", onMessage);
          resolve(parsed);
        }
      } catch {
        return;
      }
    };
    ws.addEventListener("message", onMessage);
  });

const connectGateway = async (ws) => {
  const id = randomUUID();
  const token = resolveGatewayToken();
  const params = {
    minProtocol: 3,
    maxProtocol: 3,
    client: {
      id: "openclaw-admin-worker",
      version: "0.1.0",
      platform: "server",
      mode: "webchat",
    },
    role: "operator",
    scopes: ["operator.admin", "operator.approvals", "operator.pairing"],
    auth: token ? { token } : undefined,
    userAgent: "openclaw-admin-worker",
    locale: "zh-CN",
  };
  ws.send(JSON.stringify({ type: "req", id, method: "connect", params }));
  const res = await waitForMessage(ws, (msg) => msg.type === "res" && msg.id === id, 10_000);
  if (!res.ok) {
    throw new Error(res.error?.message ?? "gateway connect failed");
  }
};

const gatewayRpc = async (ws, method, params) => {
  const id = randomUUID();
  ws.send(JSON.stringify({ type: "req", id, method, params }));
  const res = await waitForMessage(ws, (msg) => msg.type === "res" && msg.id === id, 10_000);
  if (!res.ok) {
    throw new Error(res.error?.message ?? `gateway ${method} failed`);
  }
  return res.payload;
};

const runMetricsJob = async () => {
  const date = resolveMetricDate();
  const rows = await computeDailyMetrics();
  for (const row of rows) {
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
      update: {
        metrics: row.metrics,
        tenantId: row.tenantId ?? null,
        projectId: row.projectId ?? null,
        channel: row.channel ?? null,
      },
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
};

const runGatewayExecuteJob = async (job) => {
  const requestId = job.payload?.requestId;
  if (!requestId || typeof requestId !== "string") {
    throw new Error("invalid requestId");
  }
  const requestRecord = await prisma.gatewayCallRequest.findUnique({ where: { id: requestId } });
  if (!requestRecord) {
    throw new Error("request not found");
  }
  const ws = new WebSocket(resolveGatewayUrl());
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", () => resolve());
    ws.addEventListener("error", () => reject(new Error("gateway connection failed")));
  });
  try {
    await connectGateway(ws);
    const result = await gatewayRpc(ws, requestRecord.method, requestRecord.params ?? undefined);
    await prisma.gatewayCallRequest.update({
      where: { id: requestRecord.id },
      data: { status: "executed", result, executedAt: new Date() },
    });
    await prisma.auditLog.create({
      data: {
        tenantId: requestRecord.tenantId,
        action: "gateway.execute",
        resource: requestRecord.method,
        metadata: { requestId: requestRecord.id, ok: true },
      },
    });
  } finally {
    ws.close();
  }
};

const handleJob = async (job) => {
  if (job.type === "metrics.daily") {
    await runMetricsJob();
    return;
  }
  if (job.type === "gateway.execute") {
    await runGatewayExecuteJob(job);
    return;
  }
  throw new Error(`unknown job type: ${job.type}`);
};

const main = async () => {
  const now = new Date();
  const job = await prisma.job.findFirst({
    where: {
      status: "pending",
      runAt: { lte: now },
      lockedAt: null,
    },
    orderBy: { runAt: "asc" },
  });
  if (!job) {
    await prisma.$disconnect();
    return;
  }
  const locked = await prisma.job.update({
    where: { id: job.id },
    data: { lockedAt: new Date(), status: "running" },
  });
  try {
    await handleJob(locked);
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "succeeded", lockedAt: null, lastError: null, attempts: locked.attempts + 1 },
    });
  } catch (err) {
    const attempts = locked.attempts + 1;
    const maxAttempts = locked.maxAttempts ?? 5;
    const shouldFail = attempts >= maxAttempts;
    const backoffMs = Math.min(60_000 * 2 ** Math.min(attempts, 6), 3_600_000);
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: shouldFail ? "failed" : "pending",
        attempts,
        lastError: err instanceof Error ? err.message : String(err),
        runAt: shouldFail ? locked.runAt : new Date(Date.now() + backoffMs),
        lockedAt: null,
      },
    });
    await prisma.auditLog.create({
      data: {
        tenantId: locked.tenantId ?? undefined,
        action: "job.failed",
        resource: locked.type,
        metadata: { jobId: locked.id, error: err instanceof Error ? err.message : String(err) },
      },
    });
    if (shouldFail) {
      await sendAlert("job failed", { jobId: locked.id, type: locked.type }, locked.tenantId);
    }
  } finally {
    await prisma.$disconnect();
  }
};

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
