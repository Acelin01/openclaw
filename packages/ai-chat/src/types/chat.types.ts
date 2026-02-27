export interface ChatMessage {
  id: string;
  conversationId: string;
  role: "system" | "user" | "assistant";
  content: string;
  tokens: number;
  model?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatConversation {
  id: string;
  userId: string;
  title: string;
  status: "active" | "archived" | "deleted";
  messageCount: number;
  totalTokens: number;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatContext {
  conversationId: string;
  userId: string;
  userRole: string;
  subscriptionType: string;
  remainingTokens: number;
  contextWindow: number;
}

export interface AIProvider {
  name: string;
  apiKey: string;
  baseUrl?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  context?: Record<string, any>;
  stream?: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  message: ChatMessage;
  conversation: ChatConversation;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  remainingTokens: number;
}

export interface StreamResponse {
  chunk: string;
  done: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIUsage {
  userId: string;
  date: Date;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  conversationCount: number;
  messageCount: number;
  estimatedCost: number;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: "chat" | "completion" | "embedding";
  maxTokens: number;
  inputCost: number; // per 1K tokens
  outputCost: number; // per 1K tokens
  contextWindow: number;
  trainingCutoff: string;
  capabilities: string[];
  isActive: boolean;
}

export interface ChatTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
  category: string;
  tags: string[];
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIChatError {
  code: string;
  message: string;
  details?: any;
  retryable?: boolean;
}
