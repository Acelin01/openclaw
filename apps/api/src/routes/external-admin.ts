import express, { Router, Response } from 'express';
import crypto from 'node:crypto';
import { prisma } from '../lib/db/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router: Router = express.Router();

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');
const parseList = (value: unknown) => {
  if (Array.isArray(value)) return value.filter((v) => typeof v === 'string');
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
};

router.get('/ui', async (_req: AuthenticatedRequest, res: Response) => {
  const html = `<!doctype html>
<html lang="zh">
<head><meta charset="utf-8"/><title>External MCP Admin</title></head>
<body style="font-family: sans-serif; padding: 24px;">
  <h1>External MCP 管理</h1>
  <section>
    <h2>创建 Client</h2>
    <form method="post" action="/api/v1/admin/external/clients">
      <input name="name" placeholder="名称" />
      <input name="description" placeholder="描述" />
      <input name="rateLimitPerMin" placeholder="每分钟限流" />
      <input name="defaultProjectId" placeholder="默认项目ID" />
      <input name="defaultTeamId" placeholder="默认团队ID" />
      <input name="toolAllowlist" placeholder="工具白名单(逗号分隔)" />
      <input name="permissionAllowlist" placeholder="权限白名单(逗号分隔)" />
      <button type="submit">创建</button>
    </form>
  </section>
  <section style="margin-top:24px;">
    <h2>创建 Token</h2>
    <form method="post" action="/api/v1/admin/external/clients/__CLIENT_ID__/tokens">
      <input name="name" placeholder="Token 名称" />
      <input name="expiresAt" placeholder="过期时间(ISO)" />
      <button type="submit">创建</button>
    </form>
    <div>请将 __CLIENT_ID__ 替换为实际 clientId</div>
  </section>
</body></html>`;
  res.setHeader('content-type', 'text/html');
  res.send(html);
});

router.get('/clients', async (_req: AuthenticatedRequest, res: Response) => {
  if (!prisma) {
    res.status(503).json({ success: false, message: '数据库连接不可用' });
    return;
  }
  const clients = await prisma.apiClient.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: clients });
});

router.post('/clients', async (req: AuthenticatedRequest, res: Response) => {
  if (!prisma) {
    res.status(503).json({ success: false, message: '数据库连接不可用' });
    return;
  }
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const description = typeof req.body?.description === 'string' ? req.body.description.trim() : undefined;
  const rateLimitPerMin =
    typeof req.body?.rateLimitPerMin === 'number' ? req.body.rateLimitPerMin : 60;
  const defaultProjectId =
    typeof req.body?.defaultProjectId === 'string' ? req.body.defaultProjectId.trim() : undefined;
  const defaultTeamId =
    typeof req.body?.defaultTeamId === 'string' ? req.body.defaultTeamId.trim() : undefined;
  const toolAllowlist = parseList(req.body?.toolAllowlist);
  const permissionAllowlist = parseList(req.body?.permissionAllowlist);
  if (!name) {
    res.status(400).json({ success: false, message: 'name_required' });
    return;
  }
  const client = await prisma.apiClient.create({
    data: {
      name,
      description,
      rateLimitPerMin,
      defaultProjectId: defaultProjectId || null,
      defaultTeamId: defaultTeamId || null,
      toolAllowlist: toolAllowlist.length > 0 ? toolAllowlist : undefined,
      permissionAllowlist: permissionAllowlist.length > 0 ? permissionAllowlist : undefined,
      ownerUserId: req.user?.id ?? null,
    },
  });
  res.json({ success: true, data: client });
});

router.put('/clients/:id', async (req: AuthenticatedRequest, res: Response) => {
  if (!prisma) {
    res.status(503).json({ success: false, message: '数据库连接不可用' });
    return;
  }
  const data: Record<string, unknown> = {};
  if (typeof req.body?.name === 'string') data.name = req.body.name.trim();
  if (typeof req.body?.description === 'string') data.description = req.body.description.trim();
  if (typeof req.body?.status === 'string') data.status = req.body.status.trim();
  if (typeof req.body?.rateLimitPerMin === 'number') data.rateLimitPerMin = req.body.rateLimitPerMin;
  if (typeof req.body?.defaultProjectId === 'string') {
    data.defaultProjectId = req.body.defaultProjectId.trim() || null;
  }
  if (typeof req.body?.defaultTeamId === 'string') {
    data.defaultTeamId = req.body.defaultTeamId.trim() || null;
  }
  const toolAllowlist = parseList(req.body?.toolAllowlist);
  const permissionAllowlist = parseList(req.body?.permissionAllowlist);
  if (toolAllowlist.length > 0) data.toolAllowlist = toolAllowlist;
  if (permissionAllowlist.length > 0) data.permissionAllowlist = permissionAllowlist;
  const updated = await prisma.apiClient.update({ where: { id: req.params.id }, data });
  res.json({ success: true, data: updated });
});

router.get('/clients/:id/tokens', async (req: AuthenticatedRequest, res: Response) => {
  if (!prisma) {
    res.status(503).json({ success: false, message: '数据库连接不可用' });
    return;
  }
  const tokens = await prisma.apiToken.findMany({
    where: { clientId: req.params.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: tokens });
});

router.get('/clients/:id/usage', async (req: AuthenticatedRequest, res: Response) => {
  if (!prisma) {
    res.status(503).json({ success: false, message: '数据库连接不可用' });
    return;
  }
  const limit = Math.min(Number(req.query.limit ?? '50'), 200);
  const from = req.query.from ? new Date(String(req.query.from)) : undefined;
  const to = req.query.to ? new Date(String(req.query.to)) : undefined;
  const tool = typeof req.query.tool === 'string' ? req.query.tool : undefined;
  const where: Record<string, unknown> = { clientId: req.params.id };
  if (tool) {
    where.tool = tool;
  }
  if (from || to) {
    where.createdAt = {};
    if (from) (where.createdAt as Record<string, unknown>).gte = from;
    if (to) (where.createdAt as Record<string, unknown>).lte = to;
  }
  const [logs, total] = await Promise.all([
    prisma.apiUsageLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.apiUsageLog.count({ where }),
  ]);
  res.json({ success: true, data: { total, logs } });
});

router.post('/clients/:id/tokens', async (req: AuthenticatedRequest, res: Response) => {
  if (!prisma) {
    res.status(503).json({ success: false, message: '数据库连接不可用' });
    return;
  }
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : 'default';
  const expiresAt =
    typeof req.body?.expiresAt === 'string' ? new Date(req.body.expiresAt) : null;
  const raw = `ux_${crypto.randomBytes(24).toString('hex')}`;
  const token = await prisma.apiToken.create({
    data: {
      clientId: req.params.id,
      name,
      tokenHash: hashToken(raw),
      expiresAt,
    },
  });
  res.json({ success: true, data: { token, raw } });
});

export default router;
