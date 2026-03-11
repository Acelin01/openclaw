/**
 * Redis 缓存中间件
 * 自动缓存 API 响应
 */

import { Request, Response } from 'express';
import { redisClient } from '../lib/redis/redis-client';

export interface CacheOptions {
  expireSeconds: number;
  keyPrefix?: string;
  skipWhen?: (req: Request, res: Response) => boolean;
}

export function cache(options: CacheOptions) {
  return async (req: Request, res: Response, next: Function) => {
    // 跳过缓存的情况
    if (req.method !== 'GET') {
      return next();
    }

    if (options.skipWhen && options.skipWhen(req, res)) {
      return next();
    }

    // 生成缓存键
    const key = generateCacheKey(req, options.keyPrefix);

    try {
      // 尝试从缓存获取
      const cached = await redisClient.get(key);
      
      if (cached) {
        const data = JSON.parse(cached);
        console.log(`[Cache] 命中：${key}`);
        return res.json(data);
      }

      // 缓存未命中，拦截响应
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        // 缓存响应
        if (res.statusCode === 200) {
          redisClient.set(key, JSON.stringify(data), options.expireSeconds);
          console.log(`[Cache] 缓存：${key} (${options.expireSeconds}s)`);
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('[Cache] 错误:', error);
      next();
    }
  };
}

// 生成缓存键
function generateCacheKey(req: Request, prefix?: string): string {
  const path = req.path.replace(/\//g, ':');
  const query = JSON.stringify(req.query);
  return `${prefix || 'api'}:${path}:${query}`;
}

// 清除缓存的辅助函数
export async function invalidateCache(pattern: string): Promise<void> {
  await redisClient.invalidateCache(pattern);
}

export default cache;
