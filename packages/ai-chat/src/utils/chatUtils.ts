/**
 * 估算文本的token数量
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;

  // 中文字符每个约2个token
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;

  // 英文单词每个约1.3个token
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;

  // 数字和特殊字符
  const specialChars = (text.match(/[^\u4e00-\u9fff\w\s]/g) || []).length;

  return Math.ceil(chineseChars * 2 + englishWords * 1.3 + specialChars * 0.5);
}

/**
 * 计算聊天成本
 */
export function calculateChatCost(
  promptTokens: number,
  completionTokens: number,
  inputCostPer1K: number = 0.001,
  outputCostPer1K: number = 0.002,
): number {
  const inputCost = (promptTokens / 1000) * inputCostPer1K;
  const outputCost = (completionTokens / 1000) * outputCostPer1K;
  return inputCost + outputCost;
}

/**
 * 格式化聊天历史
 */
export function formatChatHistory(
  messages: Array<{
    role: string;
    content: string;
    timestamp?: Date;
  }>,
): string {
  return messages
    .map((msg) => {
      const time = msg.timestamp ? `[${msg.timestamp.toLocaleString("zh-CN")}] ` : "";
      return `${time}${msg.role}: ${msg.content}`;
    })
    .join("\n");
}

/**
 * 验证聊天请求
 */
export function validateChatRequest(request: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!request.message || typeof request.message !== "string") {
    errors.push("消息内容不能为空且必须是字符串");
  } else if (request.message.length > 4000) {
    errors.push("消息内容不能超过4000个字符");
  }

  if (request.conversationId && typeof request.conversationId !== "string") {
    errors.push("对话ID必须是字符串");
  }

  if (request.temperature !== undefined) {
    if (
      typeof request.temperature !== "number" ||
      request.temperature < 0 ||
      request.temperature > 2
    ) {
      errors.push("温度参数必须在0-2之间");
    }
  }

  if (request.maxTokens !== undefined) {
    if (
      typeof request.maxTokens !== "number" ||
      request.maxTokens < 1 ||
      request.maxTokens > 4096
    ) {
      errors.push("最大token数必须在1-4096之间");
    }
  }

  if (request.stream !== undefined && typeof request.stream !== "boolean") {
    errors.push("流式参数必须是布尔值");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 生成系统提示词
 */
export function generateSystemPrompt(
  userRole: string,
  subscriptionType: string,
  context?: Record<string, any>,
): string {
  const basePrompt = `你是一个专业的AI助手，帮助用户解决各种问题。请保持友好、专业、准确的回答。`;

  const rolePrompts = {
    FREELANCER: "用户是自由职业者，可能需要帮助处理项目、客户沟通、技能提升等问题。",
    ENTERPRISE: "用户是企业客户，可能需要商业咨询、项目管理、团队协作等支持。",
    CLIENT: "用户是客户，可能需要服务咨询、项目需求分析、合作建议等帮助。",
  };

  const subscriptionPrompts = {
    BASIC: "用户使用的是基础套餐，请提供标准质量的服务。",
    PROFESSIONAL: "用户使用的是专业套餐，请提供更详细、更专业的回答。",
    ENTERPRISE: "用户使用的是企业套餐，请提供最全面、最深入的专业建议。",
  };

  const rolePrompt = rolePrompts[userRole as keyof typeof rolePrompts] || "";
  const subscriptionPrompt =
    subscriptionPrompts[subscriptionType as keyof typeof subscriptionPrompts] || "";
  const contextPrompt = context ? `额外上下文: ${JSON.stringify(context)}` : "";

  return [basePrompt, rolePrompt, subscriptionPrompt, contextPrompt].filter(Boolean).join("\n");
}

/**
 * 检测敏感内容
 */
export function detectSensitiveContent(text: string): {
  hasSensitive: boolean;
  reasons: string[];
} {
  const sensitivePatterns = [
    { pattern: /\b\d{15,18}\b/g, reason: "疑似身份证号码" },
    { pattern: /\b1[3-9]\d{9}\b/g, reason: "疑似手机号码" },
    { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, reason: "疑似邮箱地址" },
    { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, reason: "疑似银行卡号" },
    { pattern: /password|密码|pwd/gi, reason: "包含密码相关词汇" },
  ];

  const reasons: string[] = [];

  sensitivePatterns.forEach(({ pattern, reason }) => {
    if (pattern.test(text)) {
      reasons.push(reason);
    }
  });

  return {
    hasSensitive: reasons.length > 0,
    reasons,
  };
}

/**
 * 生成对话标题
 */
export function generateConversationTitle(firstMessage: string): string {
  if (!firstMessage) return "新对话";

  // 提取前50个字符作为标题
  const title = firstMessage.slice(0, 50);

  // 如果包含问号，可能是问题
  if (title.includes("？") || title.includes("?")) {
    return title.replace(/[？?]/, "").trim() + "？";
  }

  // 否则截取到第一个句号或换行
  const endIndex = Math.min(
    title.indexOf("。") > 0 ? title.indexOf("。") : 50,
    title.indexOf("\n") > 0 ? title.indexOf("\n") : 50,
    title.indexOf(".") > 0 ? title.indexOf(".") : 50,
  );

  return title.slice(0, endIndex).trim() || "新对话";
}

/**
 * 格式化token使用报告
 */
export function formatTokenUsageReport(usage: {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCost: number;
}): string {
  return `Token使用报告:
- 总Token数: ${usage.totalTokens.toLocaleString()}
- 输入Token: ${usage.promptTokens.toLocaleString()}
- 输出Token: ${usage.completionTokens.toLocaleString()}
- 预估成本: $${usage.estimatedCost.toFixed(4)}`;
}
