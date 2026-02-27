import { Request, Response, NextFunction } from 'express';
import { ChatSDKError } from '../lib/errors.js';

interface ErrorLog {
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO';
  message: string;
  endpoint: string;
  method: string;
  userId?: string;
  stack?: string;
  ip?: string;
  userAgent?: string;
}

// Simple in-memory error log storage (in production, use a proper logging service)
const errorLogs: ErrorLog[] = [];

export const logError = (error: Partial<ErrorLog>) => {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    level: (error.level as any) || 'ERROR',
    message: error.message || 'Unknown error',
    endpoint: error.endpoint || 'unknown',
    method: error.method || 'UNKNOWN',
    userId: error.userId || '',
    stack: error.stack || '',
    ip: error.ip || '',
    userAgent: error.userAgent || '',
  };
  
  errorLogs.push(errorLog);
  
  // Keep only last 100 errors to prevent memory issues
  if (errorLogs.length > 100) {
    errorLogs.shift();
  }
  
  // Log to console in development
  if (process.env['NODE_ENV'] === 'development') {
    console.error(`[${errorLog.timestamp}] ${errorLog.level}: ${errorLog.message}`);
    if (errorLog.stack) {
      console.error(errorLog.stack);
    }
  }
};

export const getErrorLogs = (): ErrorLog[] => {
  return [...errorLogs];
};

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  // Log the error with context
  logError({
    message: err?.message || 'Unknown error',
    endpoint: req.path,
    method: req.method,
    userId: (req as any).user?.id || '',
    stack: err.stack || '',
    ip: req.ip || '',
    userAgent: req.get('User-Agent') || '',
  });
  
  // Determine status code
  let statusCode = 500;
  let message = '服务器内部错误';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = '输入数据验证失败';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = '未授权访问';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = '权限不足';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = '请求的资源不存在';
  } else if (err.name === 'ChatSDKError') {
    const sdkError = err as ChatSDKError;
    statusCode = sdkError.statusCode;
    message = sdkError.message;
  }
  
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env['NODE_ENV'] === 'development' ? err.message : 'Internal server error',
    path: req.path,
    timestamp: new Date().toISOString()
  });
};
