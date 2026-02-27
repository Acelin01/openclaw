// Core client
export { OperaBotClient } from "./client";
export { OperaBotWidget, createOperaBotWidget } from "./widget";
export { OperaBotWidget as ReactOperaBotWidget } from "./react-widget";

// i18n
export { initOperaBotI18n, supportedLanguages } from "./i18n";

// Types
export type {
  OperaBotClientConfig,
  ChatMessage,
  OperaBotEvent,
  QuickReply,
  BotResponse,
  ClientAnalytics,
} from "./types";

// Import types for utility functions
import type { OperaBotClientConfig } from "./types";

// Utility functions
export const utils = {
  // Generate unique widget ID
  generateWidgetId: (prefix: string = "opera-bot") => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Validate configuration
  validateConfig: (config: OperaBotClientConfig): boolean => {
    if (!config.apiKey || config.apiKey.trim() === "") {
      console.error("OperaBot: API key is required");
      return false;
    }

    if (config.serverUrl && !config.serverUrl.startsWith("ws")) {
      console.warn("OperaBot: Server URL should use WebSocket protocol (ws:// or wss://)");
    }

    return true;
  },

  // Quick setup function
  quickSetup: (apiKey: string, options: Partial<OperaBotClientConfig> = {}) => {
    const config: OperaBotClientConfig = {
      apiKey,
      serverUrl: "wss://api.uxin.com/opera-bot",
      position: "bottom-right",
      language: "zh-CN",
      features: {
        enableQuickReplies: true,
        showTypingIndicator: true,
        enableVoice: false,
        enableFileUpload: false,
      },
      ...options,
    };

    if (!utils.validateConfig(config)) {
      throw new Error("Invalid OperaBot configuration");
    }

    return createOperaBotWidget(config);
  },
};

// Re-export for convenience
import { createOperaBotWidget } from "./widget";
