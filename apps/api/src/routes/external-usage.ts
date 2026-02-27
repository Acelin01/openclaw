import express, { Router, Response } from 'express';
import { prisma } from '../lib/db/index.js';
import { ApiTokenRequest, apiRateLimit, authenticateApiToken } from '../middleware/api-token.js';

const router: Router = express.Router();

router.get(
  '/usage',
  authenticateApiToken,
  apiRateLimit(),
  async (req: ApiTokenRequest, res: Response): Promise<void> => {
    if (!prisma || !req.apiClient) {
      res.status(503).json({ success: false, message: '数据库连接不可用' });
      return;
    }
    const limit = Math.min(Number(req.query.limit ?? '50'), 200);
    const from = req.query.from ? new Date(String(req.query.from)) : undefined;
    const to = req.query.to ? new Date(String(req.query.to)) : undefined;
    const tool = typeof req.query.tool === 'string' ? req.query.tool : undefined;
    const where: Record<string, unknown> = { clientId: req.apiClient.id };
    if (tool) where.tool = tool;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
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
  },
);

export default router;
