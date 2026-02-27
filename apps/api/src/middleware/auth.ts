import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getRedis } from '../services/redis.js';
import { DatabaseService } from '../lib/db/service.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  isService?: boolean;
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const serviceSecret = req.headers['x-service-secret'];
  if (serviceSecret && serviceSecret === (process.env['SERVICE_SECRET'] || 'uxin-service-secret-123')) {
    req.isService = true;
    next();
    return;
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '访问令牌缺失'
    });
  }

  try {
    const secret = process.env['JWT_SECRET'] || 'uxin-jwt-secret-2025';
    const decoded = jwt.verify(token, secret) as any;
    
    // Fetch latest user data from DB to ensure role is up-to-date
    try {
      const db = DatabaseService.getInstance();
      if (db.isAvailable()) {
        const userId = decoded.id || decoded.userId;
        const user = await db.getUserById(userId);
        if (user) {
          // Update role from DB
          decoded.role = (user as any).role;
          decoded.id = userId; // Ensure id field exists
        }
      }
    } catch (dbError) {
      console.warn('[AuthMiddleware] Failed to sync user role from DB:', dbError);
    }

    req.user = decoded;
    next();
    return;
  } catch (error) {
    const err = error as Error;
    if (err.name === 'TokenExpiredError') {
      console.log('[AuthMiddleware] Token expired at:', (err as any).expiredAt);
    }
    return res.status(403).json({
      success: false,
      message: '访问令牌无效: ' + err.message
    });
  }
};

export const optionalAuthenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log(`[AuthDebug] Headers: ${JSON.stringify(req.headers)}`);
  
  // Temporary bypass for local requests to help debug MCP
  const isLocal = req.ip === '127.0.0.1' || req.ip === '::1' || req.hostname === '127.0.0.1' || req.hostname === 'localhost';
  if (isLocal) {
    console.log('[AuthDebug] Local request detected, granting service access for debug');
    req.isService = true;
  }

  const serviceSecret = req.headers['x-service-secret'];
  const expectedSecret = process.env['SERVICE_SECRET'] || 'uxin-service-secret-123';
  if (serviceSecret) {
    console.log(`[AuthDebug] Service secret received: ${serviceSecret}, expected: ${expectedSecret}`);
  }
  if (serviceSecret && serviceSecret === expectedSecret) {
    req.isService = true;
    next();
    return;
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (req.isService || !token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'uxin-jwt-secret-2025') as any;
    
    // Fetch latest user data from DB
    try {
      const db = DatabaseService.getInstance();
      if (db.isAvailable()) {
        const user = await db.getUserById(decoded.id);
        if (user) {
          decoded.role = (user as any).role;
        }
      }
    } catch (dbError) {
      // Ignore DB error
    }

    req.user = decoded;
    next();
    return;
  } catch (error) {
    const err = error as Error;
    console.log(`[AuthDebug] JWT Verification failed: ${err.message}`);
    // If token is invalid, we treat it as no user (guest) or return 403.
    // For consistency with authenticateToken, let's return 403 to warn about invalid token.
    return res.status(403).json({
      success: false,
      message: '访问令牌无效'
    });
  }
};

export const authorizeRoles = (...roles: string[]): ((req: AuthenticatedRequest, res: Response, next: NextFunction) => void) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    if (!userRole) {
      res.status(403).json({ success: false, message: '无访问权限' });
      return;
    }
    if (!roles.includes(userRole)) {
      res.status(403).json({ success: false, message: '无访问权限' });
      return;
    }
    next();
  };
};

export const rateLimit = (opts: { windowMs: number; max: number; keyGenerator?: (req: Request) => string }) => {
  const memory = new Map<string, { count: number; first: number }>();
  return async (req: Request, res: Response, next: NextFunction) => {
    const key: string = opts.keyGenerator ? String(opts.keyGenerator(req) ?? req.ip ?? 'unknown') : String(req.ip ?? 'unknown');
    const now = Date.now();
    const redis = getRedis && getRedis();
    if (redis) {
      const bucket: string = `rate:${key}:${Math.floor(now / opts.windowMs)}`;
      try {
        const count = await redis.incr(bucket);
        if (count === 1) await redis.pexpire(bucket, opts.windowMs);
        if (count > opts.max) {
          res.status(429).json({ success: false, message: '请求过多，请稍后再试' });
          return;
        }
        next();
        return;
      } catch {
        // fallthrough to memory
      }
    }
    const entry = memory.get(key);
    if (entry && now - entry.first < opts.windowMs) {
      if (entry.count >= opts.max) {
        res.status(429).json({ success: false, message: '请求过多，请稍后再试' });
        return;
      }
      memory.set(key, { count: entry.count + 1, first: entry.first });
    } else {
      memory.set(key, { count: 1, first: now });
    }
    next();
  };
};
