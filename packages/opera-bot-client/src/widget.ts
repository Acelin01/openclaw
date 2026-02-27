import { OperaBotClient } from "./client";
import { OperaBotClientConfig } from "./types";

export interface WidgetOptions extends OperaBotClientConfig {
  container?: string | HTMLElement;
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
  };
}

export class OperaBotWidget {
  private client: OperaBotClient;
  private container: HTMLElement;
  public isOpen: boolean = false;
  private messages: any[] = [];
  private options: WidgetOptions;

  constructor(options: WidgetOptions) {
    this.options = options;
    this.client = new OperaBotClient(options);
    this.container = this.getContainer(options.container);
    this.initialize();
  }

  private getContainer(container?: string | HTMLElement): HTMLElement {
    if (typeof container === "string") {
      const element = document.querySelector(container) as HTMLElement;
      if (!element) {
        throw new Error(`Container element not found: ${container}`);
      }
      return element;
    } else if (container instanceof HTMLElement) {
      return container;
    } else {
      // Create floating widget
      return document.body;
    }
  }

  private async initialize(): Promise<void> {
    this.injectStyles();
    this.createWidget();

    // Set up client event listeners
    this.client.on("message", ({ message }) => {
      this.addMessage(message);
    });

    this.client.on("typing", ({ isTyping }) => {
      this.showTypingIndicator(isTyping);
    });

    this.client.on("connection", ({ status }) => {
      this.updateConnectionStatus(status === "connected");
    });

    this.client.on("error", (error) => {
      this.showError(error);
    });

    await this.client.initialize();
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
        background: ${this.options.theme?.primaryColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"};
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }
      
      .opera-bot-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
      }
      
      .opera-bot-chat {
        width: 380px;
        height: 600px;
        background: ${this.options.theme?.backgroundColor || "white"};
        border-radius: ${this.options.theme?.borderRadius || "12px"};
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        display: none;
        flex-direction: column;
        overflow: hidden;
        position: absolute;
        bottom: 80px;
        right: 0;
      }
      
      .opera-bot-chat.open {
        display: flex;
      }
      
      .opera-bot-header {
        padding: 16px;
        background: ${this.options.theme?.primaryColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"};
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
      
      .opera-bot-message {
        margin-bottom: 16px;
        display: flex;
        align-items: flex-start;
      }
      
      .opera-bot-message.user {
        justify-content: flex-end;
      }
      
      .opera-bot-message-bubble {
        max-width: 70%;
        padding: 12px 16px;
        border-radius: 18px;
        word-wrap: break-word;
      }
      
      .opera-bot-message.user .opera-bot-message-bubble {
        background: #007bff;
        color: white;
      }
      
      .opera-bot-message.bot .opera-bot-message-bubble {
        background: #f1f3f5;
        color: ${this.options.theme?.textColor || "#333"};
      }
      
      .opera-bot-input-container {
        padding: 16px;
        border-top: 1px solid #e5e7eb;
      }
      
      .opera-bot-input-wrapper {
        display: flex;
        gap: 8px;
      }
      
      .opera-bot-input {
        flex: 1;
        padding: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        resize: none;
        font-family: inherit;
        outline: none;
      }
      
      .opera-bot-send-button {
        padding: 12px 16px;
        background: ${this.options.theme?.primaryColor || "#007bff"};
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .opera-bot-send-button:hover {
        opacity: 0.9;
      }
      
      .opera-bot-send-button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
      
      .opera-bot-typing {
        padding: 8px 16px;
        font-style: italic;
        color: #6b7280;
        font-size: 14px;
      }
      
      .opera-bot-error {
        background: #fee;
        color: #c33;
        padding: 8px 16px;
        border-radius: 8px;
        margin: 8px 16px;
        font-size: 14px;
      }
      
      .opera-bot-connection-status {
        position: absolute;
        bottom: 8px;
        right: 8px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
      }
      
      .opera-bot-connection-status.connected {
        background: #10b981;
      }
      
      .opera-bot-connection-status.disconnected {
        background: #ef4444;
      }
    `;

    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  private createWidget(): void {
    const widget = document.createElement("div");
    widget.className = "opera-bot-widget";
    widget.innerHTML = `
      <div class="opera-bot-chat" id="opera-bot-chat">
        <div class="opera-bot-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="position: relative;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
              <div class="opera-bot-connection-status disconnected" id="connection-status"></div>
            </div>
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 600;">OperaBot AI助手</h3>
              <p style="margin: 0; font-size: 12px; opacity: 0.9;" id="connection-text">连接中...</p>
            </div>
          </div>
          <button id="close-chat" style="background: none; border: none; color: white; cursor: pointer; padding: 4px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="opera-bot-messages" id="messages-container">
          <div class="opera-bot-message bot">
            <div class="opera-bot-message-bubble">
              您好！我是OperaBot，您的AI智聊运营助手。有什么可以帮助您的吗？
            </div>
          </div>
        </div>
        <div class="opera-bot-input-container">
          <div class="opera-bot-input-wrapper">
            <textarea 
              class="opera-bot-input" 
              id="message-input" 
              placeholder="输入您的消息..."
              rows="1"
            ></textarea>
            <button class="opera-bot-send-button" id="send-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <button class="opera-bot-button" id="open-button">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </button>
    `;

    this.container.appendChild(widget);
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const openButton = document.getElementById("open-button");
    const closeButton = document.getElementById("close-chat");
    const sendButton = document.getElementById("send-button");
    const messageInput = document.getElementById("message-input") as HTMLTextAreaElement;
    const chatWindow = document.getElementById("opera-bot-chat");

    openButton?.addEventListener("click", () => {
      this.openChat();
    });

    closeButton?.addEventListener("click", () => {
      this.closeChat();
    });

    sendButton?.addEventListener("click", () => {
      this.sendMessage(messageInput.value);
      messageInput.value = "";
    });

    messageInput?.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage(messageInput.value);
        messageInput.value = "";
      }
    });

    // Auto-resize textarea
    messageInput?.addEventListener("input", () => {
      messageInput.style.height = "auto";
      messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + "px";
    });
  }

  private openChat(): void {
    this.isOpen = true;
    const chatWindow = document.getElementById("opera-bot-chat");
    const openButton = document.getElementById("open-button");

    chatWindow?.classList.add("open");
    openButton?.style.setProperty("display", "none", "important");
  }

  private closeChat(): void {
    this.isOpen = false;
    const chatWindow = document.getElementById("opera-bot-chat");
    const openButton = document.getElementById("open-button");

    chatWindow?.classList.remove("open");
    openButton?.style.setProperty("display", "flex", "important");
  }

  private sendMessage(content: string): void {
    if (!content.trim()) return;

    // Add user message to UI
    this.addMessage({
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    });

    // Send to OperaBot
    this.client.send(content.trim());
  }

  private addMessage(message: { role: string; content: string; timestamp: Date }): void {
    const messagesContainer = document.getElementById("messages-container");
    if (!messagesContainer) return;

    const messageElement = document.createElement("div");
    messageElement.className = `opera-bot-message ${message.role}`;
    messageElement.innerHTML = `
      <div class="opera-bot-message-bubble">
        ${this.escapeHtml(message.content)}
      </div>
    `;

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  private showTypingIndicator(isTyping: boolean): void {
    const messagesContainer = document.getElementById("messages-container");
    if (!messagesContainer) return;

    // Remove existing typing indicator
    const existingIndicator = document.getElementById("typing-indicator");
    if (existingIndicator) {
      existingIndicator.remove();
    }

    if (isTyping) {
      const typingElement = document.createElement("div");
      typingElement.id = "typing-indicator";
      typingElement.className = "opera-bot-typing";
      typingElement.innerHTML = "OperaBot正在输入...";
      messagesContainer.appendChild(typingElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  private updateConnectionStatus(isConnected: boolean): void {
    const statusElement = document.getElementById("connection-status");
    const textElement = document.getElementById("connection-text");

    if (statusElement) {
      statusElement.className = `opera-bot-connection-status ${isConnected ? "connected" : "disconnected"}`;
    }

    if (textElement) {
      textElement.textContent = isConnected ? "在线" : "离线";
    }
  }

  private showError(error: any): void {
    const messagesContainer = document.getElementById("messages-container");
    if (!messagesContainer) return;

    const errorElement = document.createElement("div");
    errorElement.className = "opera-bot-error";
    errorElement.textContent = `错误: ${error.message || "未知错误"}`;
    messagesContainer.appendChild(errorElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  private getPositionStyles(): string {
    switch (this.options.position) {
      case "bottom-left":
        return "bottom: 20px; left: 20px;";
      case "top-right":
        return "top: 20px; right: 20px;";
      case "top-left":
        return "top: 20px; left: 20px;";
      case "bottom-right":
      default:
        return "bottom: 20px; right: 20px;";
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  getMessages() {
    return this.client.getMessages();
  }

  getAnalytics() {
    return this.client.getAnalytics();
  }

  on(event: string, callback: (...args: any[]) => void) {
    return this.client.on(event, callback);
  }

  destroy() {
    this.client.destroy();
    const widget = document.querySelector(".opera-bot-widget");
    if (widget) {
      widget.remove();
    }
  }
}

// Export factory function for easy usage
export function createOperaBotWidget(options: WidgetOptions): OperaBotWidget {
  return new OperaBotWidget(options);
}
