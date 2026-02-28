import { SimpleGatewayClient, type GatewayHelloOk } from "../lib/gateway";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  artifact?: {
    kind: string;
    content: string;
  };
}

export interface SkillInfo {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}

export interface ProjectRequirement {
  id: string;
  title: string;
  description: string;
  status: "draft" | "pending_review" | "approved" | "rejected";
  createdAt: number;
  updatedAt: number;
}

export class ChatClient {
  private client: SimpleGatewayClient | null = null;
  private messageHandlers: Set<(msg: ChatMessage) => void> = new Set();
  private connected = false;

  async connect(gatewayUrl: string, token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new SimpleGatewayClient({
        url: gatewayUrl,
        clientName: "chat-lite",
        token: token ?? "test-token",
        onHello: (_hello: GatewayHelloOk) => {
          this.connected = true;
          console.log("[ChatClient] Connected to gateway");
          resolve();
        },
        onClose: (info: { code: number; reason: string }) => {
          this.connected = false;
          console.log("[ChatClient] Gateway closed:", info);
        },
      });

      this.client.connect().catch(reject);

      // 监听事件
      this.client.onEvent((evt) => {
        this.handleEvent(evt);
      });

      // 5 秒超时
      setTimeout(() => {
        if (!this.connected) {
          reject(new Error("Connection timeout"));
        }
      }, 5000);
    });
  }

  disconnect() {
    this.client?.disconnect();
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected && this.client !== null;
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.client) {
      throw new Error("Client not connected");
    }

    // 发送消息到 gateway
    await this.client.request("chat.send", {
      message,
      timestamp: Date.now(),
    });
  }

  async getAvailableSkills(): Promise<SkillInfo[]> {
    if (!this.client) {
      return this.getBuiltInSkills();
    }

    try {
      const result = await this.client.request<SkillInfo[]>("skills.list", {});
      return result || [];
    } catch {
      // 降级：返回内置技能列表
      return this.getBuiltInSkills();
    }
  }

  async invokeSkill(
    skillName: string,
    params: Record<string, unknown>
  ): Promise<unknown> {
    if (!this.client) {
      throw new Error("Client not connected");
    }

    return this.client.request(`skill.${skillName}`, params);
  }

  onMessage(handler: (msg: ChatMessage) => void): void {
    this.messageHandlers.add(handler);
  }

  private handleEvent(evt: { event: string; payload?: unknown }) {
    switch (evt.event) {
      case "chat.message": {
        const payload = evt.payload as {
          role?: string;
          content?: string;
          id?: string;
          artifact?: { kind: string; content: string };
        };
        const msg: ChatMessage = {
          id: payload.id || `msg-${Date.now()}`,
          role: (payload.role as ChatMessage["role"]) || "assistant",
          content: payload.content || "",
          timestamp: Date.now(),
          artifact: payload.artifact,
        };
        this.messageHandlers.forEach((h) => h(msg));
        break;
      }
    }
  }

  private getBuiltInSkills(): SkillInfo[] {
    return [
      {
        name: "project-manager",
        description: "项目管理全流程：需求分析、任务拆解与进度跟踪",
        parameters: {
          action: "string",
          title: "string",
          description: "string",
        },
      },
      {
        name: "requirement-analyzer",
        description: "需求分析与文档生成",
        parameters: {
          content: "string",
          format: "string",
        },
      },
      {
        name: "skill-matcher",
        description: "根据输入匹配最合适的技能",
        parameters: {
          query: "string",
          context: "string",
        },
      },
    ];
  }
}

// 导出单例
export const chatClient = new ChatClient();
