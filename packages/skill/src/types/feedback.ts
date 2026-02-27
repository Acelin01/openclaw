export enum FeedbackType {
  TECHNICAL_FEASIBILITY = "technical_feasibility", // 技术可行性
  PRODUCT_MARKET_FIT = "product_market_fit", // 产品市场匹配度
  ARCHITECTURE_CONSISTENCY = "architecture_consistency", // 架构一致性
  USER_EXPERIENCE = "user_experience", // 用户体验
  BUSINESS_VALUE = "business_value", // 商业价值
  SECURITY_CONCERN = "security_concern", // 安全担忧
  PERFORMANCE_ISSUE = "performance_issue", // 性能问题
  MAINTAINABILITY = "maintainability", // 可维护性
}

export enum FeedbackSeverity {
  CRITICAL = "critical", // 关键问题 - 必须解决
  HIGH = "high", // 严重问题 - 应该解决
  MEDIUM = "medium", // 一般问题 - 建议解决
  LOW = "low", // 轻微问题 - 可考虑解决
  INFO = "info", // 信息反馈 - 仅供参考
}

export interface SkillBasedFeedback {
  id: string;
  agentId: string;
  agentRole: string;
  requirementId: string;
  type: FeedbackType;
  severity: FeedbackSeverity;
  skillUsed: string;
  confidence: number;
  problemDescription: string;
  impactAnalysis: Record<string, any>;
  correctionSuggestions: string[];
  expectedImprovement: number;
  timestamp: string;
  priorityScore: number;
}

export interface AdjustmentPlan {
  id: string;
  requirementId: string;
  feedbackIds: string[];
  suggestedChanges: string;
  status: "pending" | "accepted" | "rejected" | "discussed";
  rationale?: string;
}
