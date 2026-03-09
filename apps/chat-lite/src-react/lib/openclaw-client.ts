/**
 * OpenClaw Gateway API 客户端封装
 * 负责与 OpenClaw Gateway 通信（消息发送、技能匹配、模型调用）
 * 
 * Gateway 端口：18789
 * API 端点：/tools/invoke
 */

// 使用相对路径通过 Vite 代理访问 Gateway（避免 CORS 问题）
const GATEWAY_BASE = '';
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
   * 调用 OpenClaw 工具
   */
  private async invokeTool<T>(tool: string, args: Record<string, any> = {}, sessionKey: string = 'main'): Promise<T> {
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
      const error = await response.text();
      throw new Error(`Tool ${tool} failed: ${response.status} - ${error}`);
    }

    const result = await response.json();
    if (result.ok) {
      return result.result;
    } else {
      throw new Error(result.error?.message || `Tool ${tool} failed`);
    }
  }

  /**
   * 发送消息到 OpenClaw 会话
   * 使用 sessions_send 工具
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const sessionKey = request.sessionId || 'main';
    
    // 使用 sessions_send 工具发送消息
    await this.invokeTool('sessions_send', {
      message: request.message,
      sessionKey,
    }, sessionKey);

    // 获取最新消息历史
    const messages = await this.getSessionMessages(sessionKey);
    const lastMessage = messages[messages.length - 1];

    return {
      messageId: lastMessage?.id || `msg-${Date.now()}`,
      content: lastMessage?.content || '',
      sessionId: sessionKey,
      done: true,
    };
  }

  /**
   * 获取会话列表
   * 使用 sessions_list 工具
   */
  async getSessions(): Promise<Session[]> {
    const result = await this.invokeTool<any>('sessions_list', {
      messageLimit: 1,
      limit: 50,
    });

    // 解析返回的数据结构
    let sessions = [];
    
    // 处理 content 数组格式
    if (result?.content && Array.isArray(result.content)) {
      const content = result.content[0];
      if (content?.type === 'text' && content.text) {
        try {
          const parsed = JSON.parse(content.text);
          sessions = parsed.sessions || [];
        } catch (e) {
          console.error('解析会话列表失败:', e);
        }
      }
    } else if (result?.details?.sessions && Array.isArray(result.details.sessions)) {
      // 直接使用 details.sessions
      sessions = result.details.sessions;
    } else if (Array.isArray(result)) {
      sessions = result;
    }

    // 转换格式以匹配 Session 接口
    return sessions.map((session: any) => ({
      sessionKey: session.key || session.sessionKey || session.id,
      label: session.displayName || session.label || '未命名会话',
      kind: session.kind,
      active: true,
      lastMessageAt: session.updatedAt,
      messageCount: 0,
    }));
  }

  /**
   * 获取会话消息历史
   * 使用 sessions_history 工具
   */
  async getSessionMessages(sessionKey: string, limit: number = 50): Promise<Message[]> {
    const result = await this.invokeTool<any>('sessions_history', {
      sessionKey,
      limit,
      includeTools: false,
    });

    // 解析返回的数据结构
    let messages = [];
    
    // 处理 content 数组格式
    if (result?.content && Array.isArray(result.content)) {
      const content = result.content[0];
      if (content?.type === 'text' && content.text) {
        try {
          const parsed = JSON.parse(content.text);
          messages = parsed.messages || parsed || [];
        } catch (e) {
          console.error('解析消息历史失败:', e);
        }
      }
    } else if (result?.details?.messages && Array.isArray(result.details.messages)) {
      messages = result.details.messages;
    } else if (Array.isArray(result)) {
      messages = result;
    }

    // 转换格式以匹配 Message 接口
    return messages.map((msg: any) => ({
      id: msg.id || `msg-${Date.now()}`,
      role: this.mapRole(msg.role || msg.author || 'assistant'),
      content: this.extractMessageContent(msg.content || msg.text || msg.message || ''),
      timestamp: msg.timestamp || msg.createdAt || Date.now(),
      sessionId: sessionKey,
      metadata: msg.metadata,
    }));
  }

  /**
   * 角色映射
   */
  private mapRole(role: string): 'user' | 'assistant' | 'system' {
    const roleMap: Record<string, 'user' | 'assistant' | 'system'> = {
      'user': 'user',
      'assistant': 'assistant',
      'system': 'system',
      'tool': 'system',
    };
    return roleMap[role.toLowerCase()] || 'assistant';
  }

  /**
   * 连接 WebSocket（OpenClaw Gateway 暂不支持）
   */
  connectWebSocket(sessionKey: string, onMessage: (data: any) => void): void {
    console.warn('WebSocket 暂不支持');
  }

  /**
   * 断开 WebSocket
   */
  disconnectWebSocket(): void {
    // No-op
  }

  /**
   * 提取消息文本内容（处理 content 数组）
   */
  private extractMessageContent(content: any): string {
    if (typeof content === 'string') {
      return content;
    }
    
    if (Array.isArray(content)) {
      // 查找 text 类型的内容
      const textParts = content
        .filter((item: any) => item.type === 'text')
        .map((item: any) => item.text || '')
        .join('\n');
      
      if (textParts) {
        return textParts;
      }
      
      // 如果没有 text，返回所有内容的拼接
      return content.map((item: any) => item.text || item.thinking || JSON.stringify(item)).join('\n');
    }
    
    return JSON.stringify(content);
  }

  /**
   * 创建新会话
   * 注意：OpenClaw 会话通常由 Gateway 自动管理
   * 这里返回一个新的 sessionKey
   */
  async createSession(label?: string): Promise<Session> {
    const sessionKey = `session-${Date.now()}`;
    return {
      sessionKey,
      label: label || '新会话',
      kind: 'isolated',
      active: true,
      lastMessageAt: Date.now(),
      messageCount: 0,
    };
  }

  /**
   * 删除会话
   * 注意：OpenClaw 可能不支持直接删除会话
   */
  async deleteSession(sessionKey: string): Promise<void> {
    console.warn('删除会话可能不受支持:', sessionKey);
    // 这里可以添加会话清理逻辑
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// 导出单例
export const openclawClient = new OpenClawClient();
export default openclawClient;
