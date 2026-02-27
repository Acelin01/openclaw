export enum MessageType {
  TASK_ASSIGNMENT = "task_assignment", // 任务分配
  DOCUMENT_REVIEW = "document_review", // 文档评审
  STATUS_UPDATE = "status_update", // 状态更新
  GENERAL_MESSAGE = "general_message", // 普通消息
}

export interface AgentMessage {
  messageId: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  messageType: MessageType;
  content: any;
  timestamp: string;
  metadata?: Record<string, any>;
}

export enum WorkflowStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export interface WorkflowStage {
  id: string;
  name: string;
  description?: string;
  executorRole: string;
  conditions?: Record<string, any>;
  nextStages?: string[];
}

export interface WorkflowTemplate {
  type: string;
  name: string;
  version: string;
  stages: WorkflowStage[];
  fallbackActions?: string[];
}

export interface WorkflowInstance {
  id: string;
  templateType: string;
  status: WorkflowStatus;
  currentStageId: string;
  context: Record<string, any>;
  startTime: string;
  endTime?: string;
  metrics?: Record<string, any>;
}

export enum AgentRole {
  PROJECT_MANAGER = "PM",
  BUSINESS_ANALYST = "BA",
  PRODUCT_MANAGER = "PD",
  TECH_MANAGER = "TM",
  QA_EXPERT = "QA",
  ARCHITECT = "ARCH",
  DEVELOPER = "DEV",
  DESIGNER = "UI",
  SECURITY_EXPERT = "SE",
  PERFORMANCE_EXPERT = "PE",
  COMMUNICATION_COORDINATOR = "CC",
  MEETING_MANAGER = "MM",
  DOCUMENT_CONTROLLER = "DC",
}

export interface AgentCapability {
  name: string;
  description: string;
  metrics: string[];
  thresholds: Record<string, number>;
}
