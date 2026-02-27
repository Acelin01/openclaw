import { ChatMessage, IntentRecognitionResult, BusinessOperation } from "./types";

// 消息格式化工具
export function formatMessage(content: string, metadata?: any): ChatMessage {
  return {
    id: generateUniqueId("msg"),
    role: "assistant",
    content,
    timestamp: new Date(),
    metadata,
  };
}

// 错误消息格式化
export function formatErrorMessage(error: string, errorType?: string): ChatMessage {
  return {
    id: generateUniqueId("msg"),
    role: "assistant",
    content: `抱歉，处理您的请求时出现了错误：${error}`,
    timestamp: new Date(),
    metadata: {
      error: true,
      errorType: errorType || "general_error",
    },
  };
}

// 验证用户输入
export function validateUserInput(message: string): { valid: boolean; error?: string } {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: "消息内容不能为空" };
  }

  if (message.length > 1000) {
    return { valid: false, error: "消息内容过长，请控制在1000字符以内" };
  }

  return { valid: true };
}

// 敏感词过滤
export function filterSensitiveWords(text: string): string {
  const sensitiveWords = [
    "密码",
    "password",
    "pwd",
    "pass",
    "信用卡",
    "credit card",
    "cvv",
    "身份证",
    "id card",
    "身份证号",
    "银行账号",
    "bank account",
    "银行卡",
  ];

  let filteredText = text;
  for (const word of sensitiveWords) {
    const regex = new RegExp(word, "gi");
    filteredText = filteredText.replace(regex, "[敏感词]");
  }

  return filteredText;
}

// 生成唯一ID
export function generateUniqueId(prefix: string = "msg"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

// 格式化时间戳
export function formatTimestamp(date: Date): string {
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// 计算消息时间差
export function getTimeDiff(date1: Date, date2: Date): string {
  const diff = Math.abs(date2.getTime() - date1.getTime());
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else {
    return `${seconds}秒前`;
  }
}

// 提取消息中的关键信息
export function extractMessageInfo(message: string): {
  hasQuestion: boolean;
  hasNumbers: boolean;
  hasDates: boolean;
  hasEmails: boolean;
  hasUrls: boolean;
  sentiment: "positive" | "negative" | "neutral";
} {
  const hasQuestion = /[？?]/.test(message);
  const hasNumbers = /\d+/.test(message);
  const hasDates =
    /\d{4}[年\-]\d{1,2}[月\-]\d{1,2}[日\s]?/.test(message) ||
    /\d{1,2}[月\-]\d{1,2}[日\s]?/.test(message);
  const hasEmails = /[\w.-]+@[\w.-]+\.\w+/.test(message);
  const hasUrls = /https?:\/\/[^\s]+/.test(message);

  // 简单的情感分析
  const positiveWords = ["好", "棒", "优秀", "满意", "喜欢", "不错", "赞"];
  const negativeWords = ["坏", "差", "糟糕", "不满", "讨厌", "问题", "错误"];

  let sentiment: "positive" | "negative" | "neutral" = "neutral";

  const lowerMessage = message.toLowerCase();
  const positiveCount = positiveWords.filter((word) => lowerMessage.includes(word)).length;
  const negativeCount = negativeWords.filter((word) => lowerMessage.includes(word)).length;

  if (positiveCount > negativeCount) {
    sentiment = "positive";
  } else if (negativeCount > positiveCount) {
    sentiment = "negative";
  }

  return {
    hasQuestion,
    hasNumbers,
    hasDates,
    hasEmails,
    hasUrls,
    sentiment,
  };
}

// 生成业务操作ID
export function generateOperationId(): string {
  return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 格式化业务操作结果
export function formatOperationResult(operation: BusinessOperation, result: any): string {
  const timestamp = formatTimestamp(operation.timestamp);

  if (result.success) {
    return `✅ 操作成功 (${operation.type})\n` + `时间: ${timestamp}\n` + `结果: ${result.message}`;
  } else {
    return `❌ 操作失败 (${operation.type})\n` + `时间: ${timestamp}\n` + `错误: ${result.message}`;
  }
}

// 创建分页数据
export function createPaginationData<T>(
  items: T[],
  page: number,
  pageSize: number,
): {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// 数据脱敏处理
export function maskSensitiveData(data: any): any {
  if (typeof data === "string") {
    // 邮箱脱敏
    if (data.includes("@")) {
      const [local, domain] = data.split("@");
      const maskedLocal =
        local.length > 3
          ? local.slice(0, 2) + "*".repeat(local.length - 3) + local.slice(-1)
          : "*".repeat(local.length);
      return `${maskedLocal}@${domain}`;
    }

    // 手机号脱敏
    if (/^1\d{10}$/.test(data)) {
      return data.slice(0, 3) + "****" + data.slice(-4);
    }

    // 身份证号脱敏
    if (/^\d{17}[\dX]$/.test(data)) {
      return data.slice(0, 4) + "*".repeat(10) + data.slice(-4);
    }

    return data;
  }

  if (typeof data === "object" && data !== null) {
    const masked: any = {};
    for (const [key, value] of Object.entries(data)) {
      // 对敏感字段进行脱敏
      if (
        key.toLowerCase().includes("password") ||
        key.toLowerCase().includes("secret") ||
        key.toLowerCase().includes("token") ||
        key.toLowerCase().includes("key")
      ) {
        masked[key] = "*".repeat(String(value).length);
      } else {
        masked[key] = maskSensitiveData(value);
      }
    }
    return masked;
  }

  return data;
}

// 性能监控工具
export class PerformanceMonitor {
  private startTime: number;
  private operationName: string;

  constructor(operationName: string) {
    this.operationName = operationName;
    this.startTime = performance.now();
  }

  end(): { duration: number; operationName: string } {
    const endTime = performance.now();
    const duration = endTime - this.startTime;

    console.log(`Performance: ${this.operationName} took ${duration.toFixed(2)}ms`);

    return {
      duration,
      operationName: this.operationName,
    };
  }
}

// 缓存工具
export class SimpleCache<T> {
  private cache: Map<string, { data: T; expiry: number }>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    // 默认5分钟
    this.cache = new Map();
    this.defaultTTL = defaultTTL;

    // 定期清理过期缓存
    setInterval(() => this.cleanup(), 60000); // 每分钟清理一次
  }

  set(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiry });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  get size(): number {
    return this.cache.size;
  }
}
