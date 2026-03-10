/**
 * OpenClaw Gateway 连接器
 * 负责与 OpenClaw Gateway 建立 WebSocket 连接并调用 HTTP API
 */

export interface OpenClawConfig {
  gatewayUrl: string;
  httpUrl: string;
  token: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  identity?: {
    name: string;
    emoji?: string;
  };
  skills?: string[];
}

export interface SessionInfo {
  sessionKey: string;
  agentId: string;
  label?: string;
  kind?: string;
  createdAt?: number;
  lastMessageAt?: number;
  messageCount?: number;
}

export interface MessageInfo {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  artifact?: {
    kind: string;
    content: any;
  };
  metadata?: {
    skillMatched?: string;
    modelUsed?: string;
  };
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export class OpenClawConnector {
  private config: OpenClawConfig;
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private messageHandlers: Set<(data: any) => void> = new Set();
  private statusHandlers: Set<(status: ConnectionStatus) => void> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config?: Partial<OpenClawConfig>) {
    this.config = {
      gatewayUrl: config?.gatewayUrl || import.meta.env.VITE_OPENCLAW_GATEWAY_URL || 'ws://localhost:18789',
      httpUrl: config?.httpUrl || import.meta.env.VITE_OPENCLAW_GATEWAY_HTTP_URL || 'http://localhost:18789',
      token: config?.token || import.meta.env.VITE_OPENCLAW_GATEWAY_TOKEN || 'test-token',
    };
  }

  // 更新配置
  updateConfig(config: Partial<OpenClawConfig>): void {
    if (config.gatewayUrl) this.config.gatewayUrl = config.gatewayUrl;
    if (config.httpUrl) this.config.httpUrl = config.httpUrl;
    if (config.token) this.config.token = config.token;
  }

  // 获取当前配置
  getConfig(): OpenClawConfig {
    return { ...this.config };
  }

  // 连接到 Gateway
  async connect(): Promise<boolean> {
    if (this.status === 'connected' || this.status === 'connecting') {
      return true;
    }

    this.setStatus('connecting');

    return new Promise((resolve, reject) => {
      try {
        // 确保 URL 格式正确
        let wsUrl = this.config.gatewayUrl;
        if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
          wsUrl = wsUrl.replace('http://', 'ws://').replace('https://', 'wss://');
        }
        if (!wsUrl.endsWith('/ws')) {
          wsUrl = wsUrl.endsWith('/') ? wsUrl + 'ws' : wsUrl + '/ws';
        }

        console.log('[OpenClaw] 连接 WebSocket:', wsUrl);
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[OpenClaw] ✅ WebSocket 已连接');
          this.setStatus('connected');
          this.reconnectAttempts = 0;
          resolve(true);
        };

        this.ws.onerror = (error) => {
          console.error('[OpenClaw] ❌ WebSocket 错误:', error);
          this.setStatus('error');
          reject(new Error('WebSocket 连接失败'));
        };

        this.ws.onclose = () => {
          console.log('[OpenClaw] 🔌 WebSocket 已关闭');
          this.setStatus('disconnected');
          this.attemptReconnect();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[OpenClaw] 📨 收到消息:', data);
            this.messageHandlers.forEach(handler => handler(data));
          } catch (e) {
            console.error('[OpenClaw] 消息解析失败:', e);
          }
        };

        // 连接超时
        setTimeout(() => {
          if (this.status !== 'connected') {
            this.setStatus('error');
            reject(new Error('连接超时'));
          }
        }, 10000);
      } catch (error) {
        this.setStatus('error');
        reject(error);
      }
    });
  }

  // 自动重连
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[OpenClaw] 达到最大重连次数');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`[OpenClaw] 🔄 ${delay}ms 后尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  // 停止重连
  stopReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts;
  }

  // 发送消息
  async sendMessage(sessionKey: string, content: string): Promise<void> {
    if (!this.ws || this.status !== 'connected') {
      throw new Error('未连接到 OpenClaw Gateway');
    }

    const message = {
      type: 'chat.send',
      sessionKey,
      content,
      timestamp: Date.now(),
    };

    console.log('[OpenClaw] 📤 发送消息:', message);
    this.ws.send(JSON.stringify(message));
  }

  // 获取 Agent 列表
  async getAgents(): Promise<AgentInfo[]> {
    try {
      const response = await fetch(`${this.config.httpUrl}/api/v1/agents`, {
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // 端点不存在，返回空数组
          console.warn('[OpenClaw] /api/v1/agents 端点不存在');
          return [];
        }
        throw new Error(`获取 Agent 列表失败：${response.status}`);
      }

      const data = await response.json();
      return data.agents || data.list || [];
    } catch (error) {
      console.error('[OpenClaw] 获取 Agent 列表失败:', error);
      return [];
    }
  }

  // 获取会话列表
  async getSessions(agentId?: string): Promise<SessionInfo[]> {
    try {
      let url = `${this.config.httpUrl}/api/v1/sessions`;
      if (agentId) {
        url += `?agentId=${encodeURIComponent(agentId)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('[OpenClaw] /api/v1/sessions 端点不存在');
          return [];
        }
        throw new Error(`获取会话列表失败：${response.status}`);
      }

      const data = await response.json();
      return data.sessions || data.list || [];
    } catch (error) {
      console.error('[OpenClaw] 获取会话列表失败:', error);
      return [];
    }
  }

  // 创建会话
  async createSession(agentId: string, label?: string): Promise<SessionInfo> {
    try {
      const response = await fetch(`${this.config.httpUrl}/api/v1/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.token}`,
        },
        body: JSON.stringify({ agentId, label }),
      });

      if (!response.ok) {
        throw new Error(`创建会话失败：${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[OpenClaw] 创建会话失败:', error);
      throw error;
    }
  }

  // 获取消息历史
  async getMessages(sessionKey: string, limit: number = 50): Promise<MessageInfo[]> {
    try {
      const response = await fetch(
        `${this.config.httpUrl}/api/v1/sessions/${encodeURIComponent(sessionKey)}/messages?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(`获取消息失败：${response.status}`);
      }

      const data = await response.json();
      return data.messages || data.list || [];
    } catch (error) {
      console.error('[OpenClaw] 获取消息失败:', error);
      return [];
    }
  }

  // 调用工具
  async invokeTool(tool: string, args: Record<string, any>, sessionKey?: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.httpUrl}/tools/invoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool,
          args,
          sessionKey,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`工具调用失败：${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[OpenClaw] 工具调用失败:', error);
      throw error;
    }
  }

  // 发送消息（使用工具调用）
  async sendMessageViaTool(sessionKey: string, content: string): Promise<any> {
    return this.invokeTool('sessions_send', {
      message: content,
      sessionKey,
    }, sessionKey);
  }

  // 注册消息处理器
  onMessage(handler: (data: any) => void): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  // 注册状态处理器
  onStatusChange(handler: (status: ConnectionStatus) => void): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  // 设置状态
  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.statusHandlers.forEach(handler => handler(status));
  }

  // 获取状态
  getStatus(): ConnectionStatus {
    return this.status;
  }

  // 断开连接
  disconnect(): void {
    this.stopReconnect();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  // 检查连接状态
  isConnected(): boolean {
    return this.status === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }
}

// 创建单例
export const openclawConnector = new OpenClawConnector();
