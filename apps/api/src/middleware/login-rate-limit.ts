/**
 * 登录失败限制中间件
 * 防止暴力破解密码
 */

import { Request, Response, NextFunction } from 'express';

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, LoginAttempt>();
const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 15 * 60 * 1000; // 15 分钟
const ATTEMPT_WINDOW = 30 * 60 * 1000; // 30 分钟内

export function loginRateLimit(req: Request, res: Response, next: NextFunction) {
  // 仅对登录接口生效
  if (req.path !== '/auth/login' && req.path !== '/api/v1/auth/login') {
    return next();
  }

  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const email = req.body?.email?.toLowerCase();

  if (!email) {
    return next();
  }

  const key = `${ip}:${email}`;
  const attempt = loginAttempts.get(key);
  const now = Date.now();

  // 检查是否已被锁定
  if (attempt?.lockedUntil) {
    if (now < attempt.lockedUntil) {
      const remaining = Math.ceil((attempt.lockedUntil - now) / 60000);
      return res.status(429).json({
        success: false,
        message: `账户已锁定，请${remaining}分钟后重试`,
        locked: true,
        remainingMinutes: remaining,
      });
    } else {
      // 锁定期已过，重置
      loginAttempts.delete(key);
    }
  }

  // 检查尝试次数
  if (attempt && now - attempt.firstAttempt < ATTEMPT_WINDOW) {
    if (attempt.count >= MAX_ATTEMPTS) {
      // 锁定账户
      const lockedUntil = now + LOCK_DURATION;
      loginAttempts.set(key, {
        count: attempt.count,
        firstAttempt: attempt.firstAttempt,
        lockedUntil,
      });

      return res.status(429).json({
        success: false,
        message: '账户已锁定，请 15 分钟后重试',
        locked: true,
        remainingMinutes: 15,
      });
    }
  } else {
    // 超出时间窗口，重置
    loginAttempts.delete(key);
  }

  // 记录登录尝试 (在响应后)
  res.on('finish', () => {
    if (res.statusCode === 401) {
      const existing = loginAttempts.get(key) || { count: 0, firstAttempt: now };
      loginAttempts.set(key, {
        count: existing.count + 1,
        firstAttempt: existing.firstAttempt || now,
      });
    } else {
      // 登录成功，清除记录
      loginAttempts.delete(key);
    }
  });

  next();
}

// 清理过期的尝试记录 (每 10 分钟执行一次)
setInterval(() => {
  const now = Date.now();
  loginAttempts.forEach((attempt, key) => {
    if (now - attempt.firstAttempt > ATTEMPT_WINDOW) {
      loginAttempts.delete(key);
    }
  });
}, 10 * 60 * 1000);

export default loginRateLimit;
