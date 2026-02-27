import express, { Router, Response } from 'express';
import crypto from 'node:crypto';
import { prisma } from '../lib/db/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router: Router = express.Router();

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

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
  if (!name) {
    res.status(400).json({ success: false, message: 'name_required' });
    return;
  }
  const client = await prisma.apiClient.create({
    data: {
      name,
      description,
      rateLimitPerMin,
      ownerUserId: req.user?.id ?? null,
    },
  });
  res.json({ success: true, data: client });
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
