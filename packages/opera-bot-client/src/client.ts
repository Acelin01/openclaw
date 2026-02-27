import { EventEmitter } from "events";
import {
  OperaBotClientConfig,
  ChatMessage,
  OperaBotEvent,
  BotResponse,
  QuickReply,
  ClientAnalytics,
  UserBehavior,
} from "./types";

export class OperaBotClient extends EventEmitter {
  private config: OperaBotClientConfig;
  private messages: ChatMessage[] = [];
  private isConnected: boolean = false;
  private sessionId: string;
  private ws?: WebSocket;
  private analytics: ClientAnalytics;
  private messageQueue: string[] = [];
  private isTyping: boolean = false;

  constructor(config: OperaBotClientConfig) {
    super();
    this.config = {
      serverUrl: "wss://api.uxin.com/opera-bot",
      userId: `user-${Date.now()}`,
      language: "zh-CN",
      position: "bottom-right",
      features: {
        enableVoice: false,
        enableFileUpload: false,
        enableQuickReplies: true,
        showTypingIndicator: true,
      },
      ...config,
    };

    this.sessionId = `session-${Date.now()}`;
    this.analytics = {
      sessionId: this.sessionId,
      userId: this.config.userId!,
      messages: 0,
      intents: {},
      averageResponseTime: 0,
      satisfaction: 0,
      timestamp: new Date(),
    };
  }

  async initialize(): Promise<void> {
    try {
      await this.connectWebSocket();
      this.emit("ready", { sessionId: this.sessionId });
      this.injectStyles();
    } catch (error) {
      console.error("OperaBot Client initialization failed:", error);
      throw error;
    }
  }

  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.config.serverUrl!);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.sendData({
          type: "initialize",
          data: {
            apiKey: this.config.apiKey,
            userId: this.config.userId,
            sessionId: this.sessionId,
            language: this.config.language,
          },
        });
        this.emit("connection", { status: "connected" });
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          this.handleMessage(response);
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.emit("error", { type: "connection", error });
        reject(error);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.emit("connection", { status: "disconnected" });
        // Attempt reconnection after 5 seconds
        setTimeout(() => {
          if (!this.isConnected) {
            this.connectWebSocket().catch(console.error);
          }
        }, 5000);
      };
    });
  }

  private handleMessage(response: any): void {
    const { type, data } = response;

    switch (type) {
      case "message":
        this.handleBotMessage(data);
        break;
      case "typing":
        this.handleTypingIndicator(data);
        break;
      case "error":
        this.handleError(data);
        break;
      default:
        console.log("Unknown message type:", type);
    }
  }

  private handleBotMessage(data: BotResponse): void {
    const { message, quickReplies, suggestions } = data;

    // Update analytics
    this.analytics.messages++;
    if (message.metadata?.intent) {
      this.analytics.intents[message.metadata.intent] =
        (this.analytics.intents[message.metadata.intent] || 0) + 1;
    }

    // Track user behavior for advanced analytics
    const behavior: UserBehavior = {
      userId: this.config.userId!,
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      timestamp: Date.now(),
      action: "message_received",
      metadata: {
        messageId: message.id,
        intent: message.metadata?.intent,
        quickReplies: quickReplies?.length || 0,
        suggestions: suggestions?.length || 0,
      },
    };
    this.emit("behavior_tracked", behavior);

    // Add to message history
    this.messages.push(message);

    // Emit events
    this.emit("message", { message, quickReplies, suggestions });

    // Hide typing indicator
    this.isTyping = false;
    this.emit("typing", { isTyping: false });
  }

  private handleTypingIndicator(data: { isTyping: boolean }): void {
    this.isTyping = data.isTyping;
    this.emit("typing", data);
  }

  private handleError(error: any): void {
    console.error("OperaBot error:", error);
    this.emit("error", error);
  }

  send(message: string): void {
    if (!this.isConnected) {
      console.warn("Not connected to OperaBot server");
      return;
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    this.messages.push(userMessage);
    this.analytics.messages++;

    // Track user behavior for advanced analytics
    const behavior: UserBehavior = {
      userId: this.config.userId!,
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      timestamp: Date.now(),
      action: "message_sent",
      metadata: {
        messageId: userMessage.id,
        messageLength: message.length,
        messageType: "text",
      },
    };
    this.emit("behavior_tracked", behavior);

    this.sendData({
      type: "message",
      data: {
        content: message,
        sessionId: this.sessionId,
        userId: this.config.userId,
      },
    });

    // Show typing indicator
    if (this.config.features?.showTypingIndicator) {
      this.isTyping = true;
      this.emit("typing", { isTyping: true });
    }

    this.emit("message_sent", { message: userMessage });
  }

  private sendData(data: any): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket not connected, queuing message");
      this.messageQueue.push(JSON.stringify(data));
    }
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  getAnalytics(): ClientAnalytics {
    return { ...this.analytics };
  }

  getSessionId(): string {
    return this.sessionId;
  }

  clearMessages(): void {
    this.messages = [];
    this.emit("messages_cleared", {});
  }

  setUserId(userId: string): void {
    this.config.userId = userId;
    this.analytics.userId = userId;

    if (this.isConnected) {
      this.sendData({
        type: "update_user",
        data: { userId },
      });
    }
  }

  destroy(): void {
    if (this.ws) {
      this.ws.close();
    }
    this.removeAllListeners();
  }

  private injectStyles(): void {
    const styles = `
      .opera-bot-widget {
        position: fixed;
        ${this.getPositionStyles()}
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .opera-bot-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .opera-bot-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
      }
      
      .opera-bot-chat {
        width: 380px;
        height: 600px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        display: none;
        flex-direction: column;
        overflow: hidden;
      }
      
      .opera-bot-chat.open {
        display: flex;
      }
      
      .opera-bot-header {
        padding: 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .opera-bot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
      }
      
      .opera-bot-input-container {
        padding: 16px;
        border-top: 1px solid #e5e7eb;
      }
      
      .opera-bot-input {
        width: 100%;
        padding: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        resize: none;
        font-family: inherit;
      }
      
      .opera-bot-typing {
        padding: 8px 16px;
        font-style: italic;
        color: #6b7280;
        font-size: 14px;
      }
    `;

    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  private getPositionStyles(): string {
    switch (this.config.position) {
      case "bottom-right":
        return "bottom: 20px; right: 20px;";
      case "bottom-left":
        return "bottom: 20px; left: 20px;";
      case "top-right":
        return "top: 20px; right: 20px;";
      case "top-left":
        return "top: 20px; left: 20px;";
      default:
        return "bottom: 20px; right: 20px;";
    }
  }
}
