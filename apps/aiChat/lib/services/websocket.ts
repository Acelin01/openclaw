import { io, Socket } from 'socket.io-client';
import { toast } from '@/components/toast';
import { getWsUrl } from "@uxin/artifact-ui";

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private token: string | null = null;
  private userId: string | null = null;
  private navigate?: (path: string) => void;

  constructor() {
    // Setup event listeners if needed, but connection is manual
  }

  registerNavigate(navigate: (path: string) => void) {
    this.navigate = navigate;
  }

  setToken(token: string) {
    this.token = token;
    if (this.isConnected && this.socket) {
        // If token updates while connected, we might need to update auth
        // Usually simpler to reconnect
        // this.disconnect();
        // this.connect(token);
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
    if (this.isConnected && this.socket) {
      this.socket.emit('join', { userId });
    }
  }

  connect(token?: string) {
    if (token) this.token = token;
    
    if (!this.token) {
      console.warn('Cannot connect to WebSocket: No token provided');
      return;
    }

    // Try to extract userId from token
    try {
      const parts = this.token.split('.');
      if (parts.length === 3) {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        // Adjust field name based on your JWT structure (sub, id, userId, etc.)
        const userId = payload.sub || payload.userId || payload.id;
        if (userId) {
          this.userId = userId;
        }
      }
    } catch (e) {
      console.warn('Failed to decode token for userId extraction', e);
    }

    if (this.socket?.connected) return;

    try {
      const wsUrl = getWsUrl(false);
      console.log('Connecting to WebSocket at:', wsUrl || '(relative)');
      
      this.socket = io(wsUrl, {
        auth: {
          token: this.token
        },
        // Prefer polling first for stability in dev environments, then upgrade to websocket.
        transports: ['polling', 'websocket'],
        upgrade: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        path: '/socket.io',
        // Disable extra headers that might interfere with CORS/Proxies
        extraHeaders: {}
      });

      this.setupSocketHandlers();
    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private setupSocketHandlers() {
    if (!this.socket) return;

    this.socket.on('connect_error', (err) => {
      console.error('WebSocket connection error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack,
        // @ts-ignore - engine is a private property but useful for debugging
        transport: this.socket?.io?.engine?.transport?.name
      });
      this.isConnected = false;
      this.scheduleReconnect();
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected via:', this.socket?.io?.engine?.transport?.name);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      if (this.userId) {
        this.socket?.emit('join', { userId: this.userId });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        this.scheduleReconnect();
      }
    });

    // Handle incoming notifications
    this.socket.on('notification', (notification) => {
      this.handleNotification(notification);
    });

    // Handle new message notifications
    this.socket.on('new-message', (message) => {
      this.handleNewMessage(message);
    });
  }

  private handleNotification(notification: any) {
    const actionUrl = notification.metadata?.actionUrl;
    
    // 如果有 conversationId，构造跳转链接
    const conversationId = notification.metadata?.conversationId || notification.conversationId;
    // 优先使用 actionUrl，否则使用 conversationId 构造链接
    // 根据路由结构，对话页面的路径是 /chat/[id]
    const targetUrl = actionUrl || (conversationId ? `/chat/${conversationId}` : undefined);

    toast({
      type: notification.type === 'error' ? 'error' : 'success', 
      description: notification.content || notification.message || notification.title,
      // 如果有跳转链接，显示“查看”按钮，并且点击整个 toast 也可以跳转
      action: targetUrl ? {
        label: '查看',
        onClick: () => {
          if (this.navigate) this.navigate(targetUrl);
        }
      } : undefined,
      onClick: targetUrl ? () => {
        if (this.navigate) this.navigate(targetUrl);
      } : undefined
    });
  }

  private handleNewMessage(message: any) {
    // Only show if not from current user
    if (message.senderId === this.userId) return;

    const conversationId = message.conversationId;
    const targetUrl = conversationId ? `/chat/${conversationId}` : undefined;

    toast({
        type: 'success', 
        description: `新消息: ${message.content?.substring(0, 50) || 'Received a message'}`,
        action: targetUrl ? {
          label: '回复',
          onClick: () => {
            if (this.navigate) this.navigate(targetUrl);
          }
        } : undefined,
        onClick: targetUrl ? () => {
          if (this.navigate) this.navigate(targetUrl);
        } : undefined
    });
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      if (this.token) {
        this.connect();
      }
    }, delay);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export const webSocketService = new WebSocketService();
