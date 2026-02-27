import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { prisma } from '../lib/db/index.js';
import { getRedis } from '../services/redis.js';

export interface ApiTokenRequest extends Request {
  apiClient?: { id: string; name: string; rateLimitPerMin: number };
  apiToken?: { id: string; name: string };
}

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const extractToken = (req: Request) => {
  const headerKey = req.headers['x-api-key'];
  if (typeof headerKey === 'string' && headerKey.trim()) return headerKey.trim();
  const auth = req.headers['authorization'];
  if (typeof auth === 'string') {
    const parts = auth.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    }
  }
  return '';
};

export const authenticateApiToken = async (req: ApiTokenRequest, res: Response, next: NextFunction) => {
  if (!prisma) {
    res.status(503).json({ success: false, message: '数据库连接不可用' });
    return;
  }
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ success: false, message: 'API Token 缺失' });
    return;
  }
  const tokenHash = hashToken(token);
  const record = await prisma.apiToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: { client: true },
  });
  if (!record || !record.client || record.client.status !== 'ACTIVE') {
    res.status(403).json({ success: false, message: 'API Token 无效' });
    return;
  }
  req.apiClient = {
    id: record.client.id,
    name: record.client.name,
    rateLimitPerMin: record.client.rateLimitPerMin ?? 60,
  };
  req.apiToken = { id: record.id, name: record.name };
  prisma.apiToken
    .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});
  next();
};

export const apiRateLimit = () => async (req: ApiTokenRequest, res: Response, next: NextFunction) => {
  const clientId = req.apiClient?.id ?? String(req.ip ?? 'unknown');
  const max = req.apiClient?.rateLimitPerMin ?? 60;
  const windowMs = 60_000;
  const now = Date.now();
  const redis = getRedis && getRedis();
  if (redis) {
    const bucket = `rate:api:${clientId}:${Math.floor(now / windowMs)}`;
    try {
      const count = await redis.incr(bucket);
      if (count === 1) await redis.pexpire(bucket, windowMs);
      if (count > max) {
        res.status(429).json({ success: false, message: '请求过多，请稍后再试' });
        return;
      }
      next();
      return;
    } catch {
      // fallback below
    }
  }
  const memKey = `rate:api:${clientId}`;
  const memory = (globalThis as any).__apiRateLimit ?? new Map<string, { count: number; first: number }>();
  (globalThis as any).__apiRateLimit = memory;
  const entry = memory.get(memKey);
  if (entry && now - entry.first < windowMs) {
    if (entry.count >= max) {
      res.status(429).json({ success: false, message: '请求过多，请稍后再试' });
      return;
    }
    memory.set(memKey, { count: entry.count + 1, first: entry.first });
  } else {
    memory.set(memKey, { count: 1, first: now });
  }
  next();
};

export const recordApiUsage = () => async (req: ApiTokenRequest, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    if (!prisma || !req.apiClient) return;
    const message: any = (req as any).body?.message;
    const tool = message?.body?.action ?? undefined;
    prisma.apiUsageLog
      .create({
        data: {
          clientId: req.apiClient.id,
          tokenId: req.apiToken?.id,
          tool,
          endpoint: req.originalUrl,
          statusCode: res.statusCode,
          latencyMs: Date.now() - start,
        },
      })
      .catch(() => {});
  });
  next();
};
