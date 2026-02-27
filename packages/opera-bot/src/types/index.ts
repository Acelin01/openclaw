// 基础类型定义
export interface OperaBotConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  database?: DatabaseConfig;
  apiConnectors?: ApiConnectorConfig[];
  permissions?: PermissionConfig;
  webSocket?: WebSocketConfig;
}

export interface DatabaseConfig {
  type: "mysql" | "postgresql" | "sqlite";
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export interface ApiConnectorConfig {
  id: string;
  name: string;
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  auth?: {
    type: "bearer" | "basic" | "api-key" | "apikey";
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
    keyName?: string;
    location?: "header" | "query";
  };
}

export interface PermissionConfig {
  roles: Record<string, string[]>;
  defaultRole: string;
}

// 对话相关类型
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context: ConversationContext;
  status: "active" | "paused" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationContext {
  userId: string;
  messages: ChatMessage[];
  metadata: {
    createdAt: Date;
    lastActivity: Date;
    conversationCount: number;
  };
}

// AI意图识别类型
export interface IntentRecognitionResult {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  contextRelevant: boolean;
  timestamp: Date;
}

export interface IntentDefinition {
  name: string;
  description: string;
  parameters: ParameterDefinition[];
  examples: string[];
  handler: string;
  confirmationRequired?: boolean;
}

export interface ParameterDefinition {
  name: string;
  type: "string" | "number" | "date" | "boolean" | "array" | "object";
  required: boolean;
  description: string;
  validation?: (value: any) => boolean;
  enum?: string[];
}

// 业务操作类型
export interface BusinessOperation {
  id: string;
  type: string;
  parameters: Record<string, any>;
  userId: string;
  timestamp: Date;
}

export interface OperationResult {
  success: boolean;
  data?: any;
  message?: string;
  affectedRecords?: number;
  executionTime?: number;
  timestamp?: Date;
  error?: string;
}

export interface OperationError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}

// 数据库操作类型
export interface DatabaseQuery {
  id: string;
  type: "select" | "insert" | "update" | "delete";
  table?: string;
  conditions?: Record<string, any>;
  data?: Record<string, any>;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
  userId: string;
  timestamp: Date;
}

export interface DatabaseResult {
  success: boolean;
  data?: any[];
  affectedRows?: number;
  executionTime?: number;
  error?: string;
}

// API连接器类型
export interface ApiRequest {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  path?: string;
  headers?: Record<string, string>;
  data?: any;
  parameters?: Record<string, any>;
  userId: string;
  timestamp: Date;
}

export interface ApiResponse {
  success: boolean;
  statusCode?: number;
  data?: any;
  error?: string;
  executionTime?: number;
}

// 内容管理类型
export interface ContentOperation {
  type: "create" | "update" | "delete" | "publish" | "unpublish";
  contentType: "article" | "product" | "banner" | "page";
  contentId?: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

// 订单操作类型
export interface OrderOperation {
  type: "create" | "update" | "cancel" | "refund" | "ship";
  orderId?: string;
  customerId?: string;
  items?: OrderItem[];
  status?: string;
  metadata?: Record<string, any>;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  sku?: string;
}

// 数据查询类型
export interface DataQuery {
  type: "sales" | "inventory" | "customer" | "performance";
  metrics: string[];
  dimensions?: string[];
  filters?: Record<string, any>;
  dateRange?: {
    start: Date;
    end: Date;
  };
  groupBy?: string[];
  orderBy?: {
    field: string;
    direction: "asc" | "desc";
  }[];
}

// 系统配置类型
export interface SystemConfig {
  intents: IntentDefinition[];
  connectors: ConnectorConfig[];
  permissions: PermissionRule[];
  templates: OperationTemplate[];
}

export interface ConnectorConfig {
  id: string;
  type: "database" | "api" | "webhook";
  config: DatabaseConfig | ApiConnectorConfig | WebhookConfig;
  enabled: boolean;
}

export interface WebhookConfig {
  url: string;
  secret: string;
  events: string[];
}

export interface WebSocketConfig {
  enabled: boolean;
  type: "socket.io" | "ws";
  port?: number;
  host?: string;
  path?: string;
  cors?: {
    origin: string | string[];
    methods: string[];
  };
}

export interface PermissionRule {
  role: string;
  operations: string[];
  conditions?: Record<string, any>;
}

export interface OperationTemplate {
  id: string;
  name: string;
  description: string;
  intent: string;
  parameters: Record<string, any>;
  examples: string[];
}

// 响应类型
export interface OperaBotResponse {
  message: string;
  type: "text" | "data" | "chart" | "table" | "confirmation" | "error";
  data?: any;
  suggestions?: string[];
  requiresConfirmation?: boolean;
  nextAction?: string;
}

// 事件类型
export interface OperaBotEvent {
  type: "message" | "operation" | "error" | "confirmation" | "completion";
  data: any;
  timestamp: Date;
  conversationId: string;
  userId: string;
}

// 统计和分析类型
export interface UsageStats {
  totalConversations: number;
  totalMessages: number;
  successfulOperations: number;
  failedOperations: number;
  averageResponseTime: number;
  topIntents: Array<{
    intent: string;
    count: number;
    successRate: number;
  }>;
  dailyStats: Array<{
    date: string;
    conversations: number;
    operations: number;
  }>;
}

// 错误类型
export interface OperaBotError extends Error {
  code: string;
  type: "validation" | "permission" | "execution" | "network" | "unknown";
  details?: any;
  retryable: boolean;
  userMessage?: string;
}
