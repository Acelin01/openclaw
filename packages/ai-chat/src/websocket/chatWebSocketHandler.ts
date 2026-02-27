import { WebSocket } from "ws";
import { ChatService } from "../services/chatService";
import { ChatRequest, StreamResponse } from "../types/chat.types";
import { validateChatRequest } from "../utils/chatUtils";

interface WebSocketClient {
  id: string;
  userId: string;
  ws: WebSocket;
  conversationId?: string;
  isStreaming: boolean;
}

export class ChatWebSocketHandler {
  private clients: Map<string, WebSocketClient>;
  private chatService: ChatService;

  constructor(chatService: ChatService) {
    this.clients = new Map();
    this.chatService = chatService;
  }

  handleConnection(ws: WebSocket, userId: string, clientId: string): void {
    const client: WebSocketClient = {
      id: clientId,
      userId,
      ws,
      isStreaming: false,
    };

    this.clients.set(clientId, client);

    // 发送连接确认
    this.sendToClient(clientId, {
      type: "connected",
      message: "WebSocket连接已建立",
    });

    // 处理消息
    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleMessage(clientId, message);
      } catch (error) {
        this.sendToClient(clientId, {
          type: "error",
          error: "消息格式错误",
        });
      }
    });

    // 处理断开连接
    ws.on("close", () => {
      this.handleDisconnect(clientId);
    });

    // 处理错误
    ws.on("error", (error) => {
      console.error(`WebSocket错误 (client: ${clientId}):`, error);
      this.handleDisconnect(clientId);
    });

    // 心跳检测
    this.setupHeartbeat(clientId);
  }

  private async handleMessage(clientId: string, message: any): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      switch (message.type) {
        case "chat":
          await this.handleChatMessage(clientId, message);
          break;
        case "stream":
          await this.handleStreamMessage(clientId, message);
          break;
        case "history":
          await this.handleHistoryRequest(clientId, message);
          break;
        case "conversations":
          await this.handleConversationsRequest(clientId, message);
          break;
        case "create_conversation":
          await this.handleCreateConversation(clientId, message);
          break;
        case "archive_conversation":
          await this.handleArchiveConversation(clientId, message);
          break;
        case "pong":
          // 心跳响应，不需要处理
          break;
        default:
          this.sendToClient(clientId, {
            type: "error",
            error: "未知的消息类型",
          });
      }
    } catch (error) {
      console.error(`处理消息失败 (client: ${clientId}):`, error);
      this.sendToClient(clientId, {
        type: "error",
        error: error instanceof Error ? error.message : "处理消息失败",
      });
    }
  }

  private async handleChatMessage(clientId: string, message: any): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;

    // 验证请求
    const validation = validateChatRequest(message.data);
    if (!validation.valid) {
      this.sendToClient(clientId, {
        type: "error",
        error: "请求验证失败",
        details: validation.errors,
      });
      return;
    }

    const chatRequest: ChatRequest = {
      message: message.data.message,
      conversationId: message.data.conversationId,
      context: message.data.context,
      stream: false,
      model: message.data.model,
      temperature: message.data.temperature,
      maxTokens: message.data.maxTokens,
    };

    try {
      // 获取用户上下文
      const context = await this.getUserChatContext(client.userId, chatRequest.conversationId);

      // 发送开始消息
      this.sendToClient(clientId, {
        type: "chat_start",
        conversationId: chatRequest.conversationId,
      });

      // 生成响应
      const response = await this.chatService.sendMessage(client.userId, chatRequest, context);

      // 发送完成消息
      this.sendToClient(clientId, {
        type: "chat_complete",
        data: response,
      });
    } catch (error) {
      this.sendToClient(clientId, {
        type: "chat_error",
        error: error instanceof Error ? error.message : "聊天失败",
      });
    }
  }

  private async handleStreamMessage(clientId: string, message: any): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (client.isStreaming) {
      this.sendToClient(clientId, {
        type: "error",
        error: "已有正在进行的流式对话",
      });
      return;
    }

    // 验证请求
    const validation = validateChatRequest(message.data);
    if (!validation.valid) {
      this.sendToClient(clientId, {
        type: "error",
        error: "请求验证失败",
        details: validation.errors,
      });
      return;
    }

    const chatRequest: ChatRequest = {
      message: message.data.message,
      conversationId: message.data.conversationId,
      context: message.data.context,
      stream: true,
      model: message.data.model,
      temperature: message.data.temperature,
      maxTokens: message.data.maxTokens,
    };

    try {
      // 获取用户上下文
      const context = await this.getUserChatContext(client.userId, chatRequest.conversationId);

      // 标记为流式状态
      client.isStreaming = true;
      client.conversationId = chatRequest.conversationId;

      // 发送开始消息
      this.sendToClient(clientId, {
        type: "stream_start",
        conversationId: chatRequest.conversationId,
      });

      // 流式生成响应
      let fullContent = "";
      let usage: any = null;

      for await (const chunk of this.chatService.streamMessage(
        client.userId,
        chatRequest,
        context,
      )) {
        if (chunk.chunk) {
          fullContent += chunk.chunk;
          this.sendToClient(clientId, {
            type: "stream_chunk",
            chunk: chunk.chunk,
          });
        }

        if (chunk.usage) {
          usage = chunk.usage;
        }

        if (chunk.done) {
          break;
        }
      }

      // 发送完成消息
      this.sendToClient(clientId, {
        type: "stream_complete",
        content: fullContent,
        usage,
      });
    } catch (error) {
      this.sendToClient(clientId, {
        type: "stream_error",
        error: error instanceof Error ? error.message : "流式对话失败",
      });
    } finally {
      // 重置状态
      client.isStreaming = false;
      client.conversationId = undefined;
    }
  }

  private async handleHistoryRequest(clientId: string, message: any): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { conversationId, limit = 50 } = message.data;

    try {
      const history = await this.chatService.getConversationHistory(conversationId);
      const recentHistory = history.slice(-limit);

      this.sendToClient(clientId, {
        type: "history",
        data: {
          conversationId,
          messages: recentHistory,
        },
      });
    } catch (error) {
      this.sendToClient(clientId, {
        type: "error",
        error: "获取对话历史失败",
      });
    }
  }

  private async handleConversationsRequest(clientId: string, message: any): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { page = 1, limit = 20 } = message.data;

    try {
      const result = await this.chatService.getConversations(client.userId, page, limit);

      this.sendToClient(clientId, {
        type: "conversations",
        data: result,
      });
    } catch (error) {
      this.sendToClient(clientId, {
        type: "error",
        error: "获取对话列表失败",
      });
    }
  }

  private async handleCreateConversation(clientId: string, message: any): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { title = "新对话" } = message.data;

    try {
      const conversation = await this.chatService.createConversation(client.userId, title);

      this.sendToClient(clientId, {
        type: "conversation_created",
        data: conversation,
      });
    } catch (error) {
      this.sendToClient(clientId, {
        type: "error",
        error: "创建对话失败",
      });
    }
  }

  private async handleArchiveConversation(clientId: string, message: any): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { conversationId } = message.data;

    try {
      const success = await this.chatService.archiveConversation(conversationId, client.userId);

      this.sendToClient(clientId, {
        type: "conversation_archived",
        data: { conversationId, success },
      });
    } catch (error) {
      this.sendToClient(clientId, {
        type: "error",
        error: "归档对话失败",
      });
    }
  }

  private async getUserChatContext(userId: string, conversationId?: string): Promise<any> {
    // 获取用户订阅信息
    const subscription = await this.chatService["prisma"].subscription.findFirst({
      where: {
        userId,
        status: "active",
        endDate: { gte: new Date() },
      },
      include: { package: true },
    });

    if (!subscription) {
      throw new Error("用户订阅无效");
    }

    const packageFeatures = subscription.package.features as any;
    const aiConfig = packageFeatures?.aiChat || { dailyLimit: 1000, enabled: true };

    // 获取今日使用情况
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const usage = await this.chatService.getUsageStats(userId, today, tomorrow);
    const remainingTokens = Math.max(0, aiConfig.dailyLimit - usage.totalTokens);

    return {
      conversationId,
      userId,
      userRole: subscription.user.role,
      subscriptionType: subscription.package.type,
      remainingTokens,
      contextWindow: aiConfig.contextWindow || 4000,
    };
  }

  private sendToClient(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  private handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      console.log(`客户端断开连接: ${clientId}`);
      this.clients.delete(clientId);
    }
  }

  private setupHeartbeat(clientId: string): void {
    const interval = setInterval(() => {
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.ping();
      } else {
        clearInterval(interval);
        this.handleDisconnect(clientId);
      }
    }, 30000); // 30秒心跳

    // 清理函数
    const cleanup = () => {
      clearInterval(interval);
    };

    client.ws.on("pong", () => {
      // 心跳响应，保持连接
    });

    client.ws.on("close", cleanup);
    client.ws.on("error", cleanup);
  }

  // 广播消息给所有连接的客户端
  broadcast(message: any, userId?: string): void {
    for (const [clientId, client] of this.clients) {
      if (userId && client.userId !== userId) {
        continue;
      }

      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    }
  }

  // 获取在线用户数
  getOnlineUserCount(): number {
    return this.clients.size;
  }

  // 获取特定用户的连接
  getUserConnections(userId: string): string[] {
    const connections: string[] = [];
    for (const [clientId, client] of this.clients) {
      if (client.userId === userId) {
        connections.push(clientId);
      }
    }
    return connections;
  }
}
