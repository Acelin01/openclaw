/**
 * OpenClaw Gateway API 客户端封装
 * 负责与 OpenClaw Gateway 通信（消息发送、技能匹配、模型调用）
 *
 * Gateway 端口：18789
 * API 端点：/tools/invoke
 */

const GATEWAY_BASE = import.meta.env.VITE_OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';
const GATEWAY_TOKEN = import.meta.env.VITE_OPENCLAW_GATEWAY_TOKEN || '';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  sessionId?: string;
  metadata?: {
    skillMatched?: string;
    modelUsed?: string;
    tokens?: number;
  };
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  messageId: string;
  content: string;
  sessionId: string;
  skillMatched?: string;
  modelUsed?: string;
  done: boolean;
}

export interface Session {
  sessionKey: string;
  label?: string;
  kind?: string;
  active?: boolean;
  lastMessageAt?: number;
  messageCount?: number;
}

class OpenClawClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string = GATEWAY_BASE, token: string = GATEWAY_TOKEN) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
    return headers;
  }

  /**
   * 调用 OpenClaw 工具（带错误处理）
   */
  private async invokeTool<T>(tool: string, args: Record<string, any> = {}, sessionKey: string = 'main'): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/tools/invoke`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          tool,
          args,
          sessionKey,
        }),
      });

      if (!response.ok) {
        // Gateway 未运行时静默失败
        if (response.status === 401 || response.status === 503 || response.status === 501) {
          console.debug(`[OpenClaw] Gateway not available: ${response.status}`);
          return {} as T;
        }
        const error = await response.text();
        throw new Error(`Tool ${tool} failed: ${response.status} - ${error}`);
      }

      const result = await response.json();
      if (result.ok) {
        return result.result;
      } else {
        throw new Error(result.error?.message || `Tool ${tool} failed`);
      }
    } catch (error) {
      // 网络错误或 Gateway 不可用时静默失败
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.debug('[OpenClaw] Gateway unavailable, skipping tool invocation');
        return {} as T;
      }
      throw error;
    }
  }

  /**
   * 获取会话列表
   */
  async getSessions(): Promise<Session[]> {
    try {
      const result = await this.invokeTool<any>('sessions_list', {});
      // 解析网关返回的格式
      if (result?.sessions && Array.isArray(result.sessions)) {
        return result.sessions.map((s: any) => ({
          sessionKey: s.key,
          label: s.displayName || s.label,
          kind: s.kind,
          active: true,
          lastMessageAt: s.updatedAt,
          messageCount: 0,
        }));
      }
      // 确保返回的是数组
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.debug('[OpenClaw] getSessions failed, returning empty array');
      return [];
    }
  }

  /**
   * 发送消息到 OpenClaw 会话
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    // 使用正确的 sessionKey 格式
    const sessionKey = request.sessionId || 'agent:main:main';

    try {
      const result = await this.invokeTool<any>('sessions_send', {
        message: request.message,
        sessionKey,
      });

      return {
        messageId: `msg-${Date.now()}`,
        content: result?.content || request.message,
        sessionId: sessionKey,
        done: true,
      };
    } catch (error) {
      console.error('[OpenClaw] sendMessage error:', error);
      throw error;
    }
  }

  /**
   * 获取会话历史
   */
  async getSessionHistory(sessionKey: string, limit: number = 50): Promise<Message[]> {
    try {
      return await this.invokeTool<Message[]>('sessions_history', { sessionKey, limit });
    } catch (error) {
      console.debug('[OpenClaw] getSessionHistory failed, returning empty array');
      return [];
    }
  }

  /**
   * 创建新会话
   */
  async createSession(label?: string): Promise<Session> {
    try {
      return await this.invokeTool<Session>('sessions_spawn', {
        mode: 'session',
        label,
      });
    } catch (error) {
      console.debug('[OpenClaw] createSession failed');
      return {
        sessionKey: `session-${Date.now()}`,
        label,
      };
    }
  }

  /**
   * 断开 WebSocket 连接 (兼容方法)
   */
  disconnectWebSocket(): void {
    // 当前使用 HTTP API，无需断开 WebSocket
    console.debug('[OpenClaw] disconnectWebSocket called (no-op for HTTP mode)');
  }
}

// 导出单例
export const openclawClient = new OpenClawClient();
