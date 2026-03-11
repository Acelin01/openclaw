/**
 * 慢查询日志器
 * 记录超过阈值的数据库查询
 */

const SLOW_QUERY_THRESHOLD = 100; // 100ms
const VERY_SLOW_QUERY_THRESHOLD = 500; // 500ms

interface QueryLog {
  query: string;
  params: any[];
  duration: number;
  timestamp: Date;
  stack?: string;
}

const slowQueries: QueryLog[] = [];
const MAX_LOGS = 100;

export class SlowQueryLogger {
  private static instance: SlowQueryLogger;

  private constructor() {}

  static getInstance(): SlowQueryLogger {
    if (!SlowQueryLogger.instance) {
      SlowQueryLogger.instance = new SlowQueryLogger();
    }
    return SlowQueryLogger.instance;
  }

  // 包装数据库查询
  wrapQuery<T>(
    queryFn: () => Promise<T>,
    query: string,
    params: any[]
  ): Promise<T> {
    const startTime = Date.now();
    
    return queryFn().then(result => {
      const duration = Date.now() - startTime;
      
      if (duration > SLOW_QUERY_THRESHOLD) {
        this.logSlowQuery(query, params, duration);
      }
      
      return result;
    }).catch(error => {
      const duration = Date.now() - startTime;
      console.error(`[QueryError] ${duration}ms - ${query.substring(0, 100)}`);
      throw error;
    });
  }

  private logSlowQuery(query: string, params: any[], duration: number): void {
    const log: QueryLog = {
      query,
      params,
      duration,
      timestamp: new Date(),
      stack: new Error().stack?.split('\n').slice(2, 5).join('\n'),
    };

    slowQueries.push(log);
    if (slowQueries.length > MAX_LOGS) {
      slowQueries.shift();
    }

    // 日志输出
    if (duration > VERY_SLOW_QUERY_THRESHOLD) {
      console.error(`[VerySlowQuery] ${duration}ms`);
      console.error(`  Query: ${query.substring(0, 200)}`);
      console.error(`  Params: ${JSON.stringify(params).substring(0, 200)}`);
    } else {
      console.warn(`[SlowQuery] ${duration}ms - ${query.substring(0, 100)}`);
    }
  }

  // 获取慢查询日志
  getSlowQueries(limit: number = 10): QueryLog[] {
    return slowQueries.slice(-limit);
  }

  // 获取统计信息
  getStats(): any {
    const total = slowQueries.length;
    if (total === 0) {
      return {
        totalSlowQueries: 0,
        avgDuration: 0,
        maxDuration: 0,
      };
    }

    const durations = slowQueries.map(q => q.duration);
    const sum = durations.reduce((a, b) => a + b, 0);
    const max = Math.max(...durations);

    return {
      totalSlowQueries: total,
      avgDuration: Math.round(sum / total),
      maxDuration: max,
      verySlowQueries: slowQueries.filter(q => q.duration > VERY_SLOW_QUERY_THRESHOLD).length,
    };
  }

  // 清除日志
  clearLogs(): void {
    slowQueries.length = 0;
  }
}

export const slowQueryLogger = SlowQueryLogger.getInstance();
