/**
 * 性能监控中间件
 * 监控 API 响应时间、慢查询、资源使用
 */

import { Request, Response, NextFunction } from 'express';

interface RequestMetrics {
  path: string;
  method: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  statusCode?: number;
}

const activeRequests = new Map<string, RequestMetrics>();
const metricsHistory: RequestMetrics[] = [];
const MAX_HISTORY = 1000;

// 性能告警阈值
const SLOW_REQUEST_THRESHOLD = 500; // 500ms
const VERY_SLOW_REQUEST_THRESHOLD = 1000; // 1000ms

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 中间件
  middleware(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const requestId = `${req.method}:${req.path}:${Date.now()}`;
      const startTime = Date.now();

      // 记录请求开始
      activeRequests.set(requestId, {
        path: req.path,
        method: req.method,
        startTime,
      });

      // 监听响应结束
      res.on('finish', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const metrics = activeRequests.get(requestId);

        if (metrics) {
          metrics.endTime = endTime;
          metrics.duration = duration;
          metrics.statusCode = res.statusCode;

          // 慢请求日志
          if (duration > SLOW_REQUEST_THRESHOLD) {
            console.warn(`[SlowRequest] ${req.method} ${req.path}: ${duration}ms`);
            
            // 性能告警
            if (duration > VERY_SLOW_REQUEST_THRESHOLD) {
              console.error(`[PerformanceAlert] 严重慢请求：${duration}ms - ${req.method} ${req.path}`);
            }
          }

          // 保存到历史记录
          metricsHistory.push(metrics);
          if (metricsHistory.length > MAX_HISTORY) {
            metricsHistory.shift();
          }

          activeRequests.delete(requestId);
        }
      });

      next();
    };
  }

  // 获取性能统计
  getStats(): any {
    if (metricsHistory.length === 0) {
      return {
        totalRequests: 0,
        avgDuration: 0,
        p95Duration: 0,
        p99Duration: 0,
        slowRequests: 0,
      };
    }

    const durations = metricsHistory.map(m => m.duration || 0).sort((a, b) => a - b);
    const total = durations.length;
    const sum = durations.reduce((a, b) => a + b, 0);
    const avg = sum / total;
    
    const p95Index = Math.floor(total * 0.95);
    const p99Index = Math.floor(total * 0.99);
    
    const slowRequests = durations.filter(d => d > SLOW_REQUEST_THRESHOLD).length;

    return {
      totalRequests: total,
      avgDuration: Math.round(avg),
      p95Duration: durations[p95Index] || 0,
      p99Duration: durations[p99Index] || 0,
      slowRequests,
      slowRequestRate: ((slowRequests / total) * 100).toFixed(2) + '%',
      activeRequests: activeRequests.size,
    };
  }

  // 重置统计
  resetStats(): void {
    metricsHistory.length = 0;
    activeRequests.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
export const performanceMiddleware = performanceMonitor.middleware();
