export interface OperaBotClientConfig {
  apiKey: string;
  serverUrl?: string;
  userId?: string;
  language?: "zh-CN" | "en-US";
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
  };
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  features?: {
    enableVoice?: boolean;
    enableFileUpload?: boolean;
    enableQuickReplies?: boolean;
    showTypingIndicator?: boolean;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    entities?: Record<string, any>;
    error?: boolean;
    errorType?: string;
  };
}

export interface OperaBotEvent {
  type: "message" | "typing" | "connection" | "error" | "ready";
  data: any;
  timestamp: Date;
}

export interface QuickReply {
  text: string;
  payload?: string;
  icon?: string;
}

export interface BotResponse {
  message: ChatMessage;
  quickReplies?: QuickReply[];
  suggestions?: string[];
}

export interface ClientAnalytics {
  sessionId: string;
  userId: string;
  messages: number;
  intents: Record<string, number>;
  averageResponseTime: number;
  satisfaction: number;
  timestamp: Date;
}

export interface UserBehavior {
  userId: string;
  sessionId: string;
  pageUrl: string;
  timestamp: number;
  action:
    | "message_sent"
    | "message_received"
    | "widget_opened"
    | "widget_closed"
    | "voice_used"
    | "file_uploaded"
    | "quick_reply_used";
  metadata?: Record<string, any>;
}
