/**
 * OpenClaw WebSocket 客户端
 * 参考官方 Gateway 协议实现
 * 
 * 协议格式:
 * - 连接：{ type: 'connect', client: {...}, auth: {...} }
 * - 消息：{ type: 'req', id: string, method: string, params: object }
 * - 响应：{ type: 'res', id: string, ok: boolean, payload?: any, error?: any }
 * - 事件：{ type: 'event', event: string, payload?: any }
 */

export interface WSMessage {
  type: 'message' | 'skill' | 'system';
  content: string;
  sessionId?: string;
  params?: Record<string, any>;
  timestamp?: number;
}

export interface WSResponse {
  type: 'message' | 'error' | 'system' | 'streaming' | 'res' | 'event';
  content?: string;
  messageId?: string;
  sessionId?: string;
  artifact?: {
    kind: string;
    content: string;
  };
  done?: boolean;
  // Gateway 协议字段
  id?: string;
  ok?: boolean;
  payload?: any;
  error?: { code: string; message: string };
  event?: string;
  payload?: any;
}

export class OpenClawWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 800;
  private messageHandlers: Set<(data: WSResponse) => void> = new Set();
  private connectionState: 'connecting' | 'connected' | 'disconnected' = 'disconnected';
  private pingInterval?: number;
  private lastSeq: number | null = null;
  private pendingRequests = new Map<string, { resolve: (v: any) => void; reject: (e: any) => void }>();

  constructor(
    url: string = 'ws://localhost:18789/ws',
    token: string = 'openclaw-auto-token-2026'
  ) {
    this.url = url;
    this.token = token;
  }

  /**
   * 连接 WebSocket（参考官方 GatewayBrowserClient）
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.connectionState = 'connecting';
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('✅ WebSocket 连接成功');
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          this.sendConnect();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📥 收到:', data);
            this.handleMessage(data);
          } catch (error) {
            console.error('解析消息失败:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket 错误:', error);
          this.connectionState = 'disconnected';
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log(`🔌 WebSocket 连接关闭 (${event.code})`);
          this.connectionState = 'disconnected';
          this.stopPing();
          this.attemptReconnect();
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 发送 connect 帧（官方协议）
   */
  private sendConnect(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const connectFrame = {
      type: 'connect',
      client: {
        name: 'chat-lite',
        version: '1.0.0',
        platform: 'web',
        mode: 'operator'
      },
      auth: {
        token: this.token
      }
    };

    this.ws.send(JSON.stringify(connectFrame));
    console.log('🔐 已发送 connect 认证');
  }

  /**
   * 处理消息（参考官方协议）
   */
  private handleMessage(data: any): void {
    switch (data.type) {
      case 'hello-ok':
        console.log('👋 收到 hello-ok');
        break;

      case 'res':
        // 响应消息
        if (data.ok) {
          this.messageHandlers.forEach(handler => handler({
            type: 'res',
            ok: true,
            payload: data.payload,
            id: data.id
          }));
        } else {
          this.messageHandlers.forEach(handler => handler({
            type: 'error',
            error: data.error?.message || 'Unknown error'
          }));
        }
        break;

      case 'event':
        // 事件消息
        this.messageHandlers.forEach(handler => handler({
          type: 'event',
          event: data.event,
          payload: data.payload
        }));

        // 处理特定事件
        if (data.event === 'chat.message') {
          this.messageHandlers.forEach(handler => handler({
            type: 'message',
            content: data.payload?.content,
            messageId: data.payload?.id,
            sessionId: data.payload?.sessionId
          }));
        }
        break;

      default:
        // 兼容旧格式
        this.messageHandlers.forEach(handler => handler(data as WSResponse));
    }
  }

  /**
   * 发送请求（官方协议）
   */
  sendRequest(method: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket 未连接'));
        return;
      }

      const id = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const frame = {
        type: 'req',
        id,
        method,
        params
      };

      this.pendingRequests.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(frame));
      console.log('📤 发送请求:', frame);
    });
  }

  /**
   * 发送消息
   */
  send(message: WSMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket 未连接');
      throw new Error('WebSocket 未连接');
    }

    // 使用官方协议发送 chat 消息
    this.sendRequest('chat.send', {
      message: message.content,
      sessionId: message.sessionId
    });

    console.log('📤 发送消息:', message);
  }

  /**
   * 发送聊天消息
   */
  sendChatMessage(content: string, sessionId?: string): void {
    this.send({
      type: 'message',
      content,
      sessionId
    });
  }

  /**
   * 调用技能
   */
  invokeSkill(skillName: string, params: Record<string, any>, sessionId?: string): void {
    this.sendRequest('skill.invoke', {
      skill: skillName,
      params,
      sessionId
    });
  }

  /**
   * 注册消息处理器
   */
  onMessage(handler: (data: WSResponse) => void): void {
    this.messageHandlers.add(handler);
  }

  /**
   * 移除消息处理器
   */
  offMessage(handler: (data: WSResponse) => void): void {
    this.messageHandlers.delete(handler);
  }

  /**
   * 获取连接状态
   */
  getState(): 'connecting' | 'connected' | 'disconnected' {
    return this.connectionState;
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionState = 'disconnected';
  }

  /**
   * 启动心跳
   */
  private startPing(): void {
    this.pingInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000);
    console.log('💓 心跳已启动');
  }

  /**
   * 停止心跳
   */
  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = undefined;
    }
  }

  /**
   * 尝试重连
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(1.7, this.reconnectAttempts - 1);
      
      console.log(`🔄 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})，延迟 ${Math.round(delay)}ms`);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, delay);
    } else {
      console.error('❌ 重连失败，已达最大尝试次数');
    }
  }
}

// 导出单例
export const openclawWS = new OpenClawWebSocketClient();
