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
  private status: ConnectionStatus = 'disconnected';
  private messageHandlers: Set<(data: any) => void> = new Set();
  private statusHandlers: Set<(status: ConnectionStatus) => void> = new Set();

  constructor(config?: Partial<OpenClawConfig>) {
    this.config = {
      gatewayUrl: config?.gatewayUrl || import.meta.env.VITE_OPENCLAW_GATEWAY_URL || '',
      httpUrl: config?.httpUrl || import.meta.env.VITE_OPENCLAW_GATEWAY_HTTP_URL || '',
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

  // 连接到 Gateway（HTTP 模式，通过 Vite 代理）
  async connect(): Promise<boolean> {
    if (this.status === 'connected') {
      return true;
    }

    this.setStatus('connecting');

    try {
      // 测试根端点（检查服务器可达性）
      const response = await fetch('/', {
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
        },
      });

      if (response.ok) {
        // 服务器可达
        this.setStatus('connected');
        console.log('[OpenClaw] ✅ HTTP 连接成功');
        return true;
      } else {
        this.setStatus('error');
        console.error('[OpenClaw] ❌ HTTP 连接失败:', response.status);
        return false;
      }
    } catch (error) {
      this.setStatus('error');
      console.error('[OpenClaw] ❌ HTTP 连接错误:', error);
      return false;
    }
  }

  // 生成简单的设备 ID（本地存储）
  private getDeviceId(): string {
    const stored = localStorage.getItem('chatlite_device_id');
    if (stored) return stored;
    const newId = `chatlite-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('chatlite_device_id', newId);
    return newId;
  }

  // 发送消息（通过 WebSocket 发送到 Gateway，使用正确的协议帧格式）
  async sendMessage(sessionKey: string, content: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // 创建 WebSocket 连接
      const wsUrl = this.config.gatewayUrl.replace('http', 'ws').replace('https', 'wss');
      const ws = new WebSocket(`${wsUrl}/ws`);
      let requestId = `req-${Date.now()}`;
      let authenticated = false;
      
      ws.onopen = () => {
        console.log('[OpenClaw] WebSocket 已连接，发送 connect 请求');
        
        // 发送 connect 请求（使用正确的 Gateway 协议帧格式）
        const deviceId = this.getDeviceId();
        ws.send(JSON.stringify({
          type: 'req',
          id: requestId,
          method: 'connect',
          params: {
            minProtocol: 3,
            maxProtocol: 3,
            client: {
              id: 'webchat',
              displayName: 'ChatLite Web',
              version: '1.0.0',
              platform: 'web',
              mode: 'webchat',
            },
            role: 'user',
            scopes: ['operator.admin'],
            auth: {
              token: this.config.token,
            },
            device: {
              id: deviceId,
              publicKey: 'webchat',
              signature: '',
              signedAt: Date.now(),
            },
          },
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[OpenClaw] 收到消息:', data.type, data.id, data.ok, data.event);
          
          // 处理 connect 响应
          if (data.type === 'res' && data.id === requestId && !authenticated) {
            if (data.ok) {
              console.log('[OpenClaw] 认证成功');
              authenticated = true;
              requestId = `req-${Date.now()}`;
              
              // 发送 chat.send 请求（使用正确的 RPC 格式）
              ws.send(JSON.stringify({
                type: 'req',
                id: requestId,
                method: 'chat.send',
                params: {
                  sessionKey,
                  message: content,
                  timestamp: Date.now(),
                },
              }));
            } else {
              console.error('[OpenClaw] 认证失败:', data.error);
              reject(new Error(data.error?.message || '认证失败'));
              ws.close();
            }
            return;
          }
          
          // 处理 chat.send 响应
          if (data.type === 'res' && data.id === requestId && data.ok && authenticated) {
            console.log('[OpenClaw] chat.send 已接受，等待 chat.message 事件');
            return;
          }
          
          // 处理 chat.message 事件
          if (data.type === 'event' && data.event === 'chat.message') {
            console.log('[OpenClaw] 收到 chat.message 事件:', data.payload);
            resolve({
              content: data.payload?.content || '',
              done: true,
              artifact: data.payload?.artifact,
              skillMatched: data.payload?.skillMatched,
            });
            ws.close();
          }
          
          // 处理错误
          if (data.type === 'res' && !data.ok) {
            console.error('[OpenClaw] 错误响应:', data.error);
            reject(new Error(data.error?.message || 'Gateway 错误'));
            ws.close();
          }
        } catch (e) {
          console.error('[OpenClaw] 消息解析失败:', e);
        }
      };

      ws.onerror = (error) => {
        console.error('[OpenClaw] WebSocket 错误:', error);
        reject(new Error('WebSocket 连接失败'));
      };

      ws.onclose = (code, reason) => {
        console.log('[OpenClaw] WebSocket 已关闭:', code, reason);
      };

      // 超时处理
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          resolve({
            content: '消息已发送，等待响应...',
            done: true,
          });
          ws.close();
        }
      }, 30000);
    });
  }

  // 获取 Agent 列表（从配置读取）
  async getAgents(): Promise<AgentInfo[]> {
    // OpenClaw Gateway 没有 Agent API，返回预设列表
    // 实际使用时可以从配置文件或工具调用获取
    const defaultAgents: AgentInfo[] = [
      {
        id: 'agent_main',
        name: '主助手',
        identity: {
          name: 'Assistant',
          emoji: '🤖',
        },
      },
      {
        id: 'agent_dev',
        name: '开发助手',
        identity: {
          name: 'Dev',
          emoji: '🧱',
        },
      },
      {
        id: 'agent_pm',
        name: '产品助手',
        identity: {
          name: 'PM',
          emoji: '📋',
        },
      },
    ];

    console.log('[OpenClaw] 返回默认 Agent 列表:', defaultAgents);
    return defaultAgents;
  }

  // 获取会话列表
  async getSessions(agentId?: string): Promise<SessionInfo[]> {
    try {
      // 使用工具调用获取会话列表
      const result = await this.invokeTool('sessions_list', {
        limit: 50,
        messageLimit: 1,
      });

      if (result?.ok && result?.result?.content) {
        const contentItem = result.result.content[0];
        if (contentItem?.type === 'text' && contentItem?.text) {
          try {
            const parsed = JSON.parse(contentItem.text);
            return parsed.sessions || [];
          } catch (e) {
            console.error('[OpenClaw] 解析会话列表失败:', e);
          }
        }
      }

      return [];
    } catch (error) {
      console.error('[OpenClaw] 获取会话列表失败:', error);
      return [];
    }
  }

  // 创建会话（本地模式）
  async createSession(agentId: string, label?: string): Promise<SessionInfo> {
    // OpenClaw Gateway 没有会话创建 API，返回本地 session
    return {
      sessionKey: `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      label: label || '新会话',
      kind: 'chat',
      active: true,
      lastMessageAt: Date.now(),
      messageCount: 0,
    };
  }

  // 获取消息历史（本地模式）
  async getSessionMessages(sessionKey: string): Promise<MessageInfo[]> {
    // OpenClaw Gateway 没有消息历史 API，返回空数组
    return [];
  }

  // 调用工具
  async invokeTool(tool: string, args: Record<string, any>, sessionKey?: string): Promise<any> {
    try {
      const response = await fetch('/tools/invoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.token}`,
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

  // 断开连接（HTTP 模式）
  disconnect(): void {
    this.setStatus('disconnected');
  }

  // 检查连接状态
  isConnected(): boolean {
    return this.status === 'connected';
  }
}

// 创建单例
export const openclawConnector = new OpenClawConnector();
