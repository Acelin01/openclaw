import { Request, Response } from 'express';
import { logError } from './errorHandler.js';

export const notFound = (req: Request, res: Response) => {
  // Log 404 errors for monitoring
  logError({
    message: 'Resource not found',
    endpoint: req.originalUrl,
    method: req.method,
    userId: (req as any).user?.id || '',
    level: 'WARN',
    ip: req.ip || '',
    userAgent: req.get('User-Agent') || '',
  });
  
  res.status(404).json({
    success: false,
    message: '请求的资源不存在',
    path: req.originalUrl
  });
};
