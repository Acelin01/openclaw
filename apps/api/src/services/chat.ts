import { Server, Socket } from 'socket.io';
import { DatabaseService } from '../lib/db/service.js';

interface MessageData {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file' | 'system' | 'APPLICATION' | 'CHAT';
  senderType?: 'USER' | 'AI' | 'SYSTEM';
  metadata?: Record<string, any>;
}

interface ConversationData {
  id: string;
  participants: string[];
  type: 'direct' | 'group' | 'service' | 'order';
  metadata?: Record<string, any>;
}

export class ChatService {
  private io: Server;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log('User connected:', socket.id);

      socket.on('join', async (data: { userId: string }) => {
        this.connectedUsers.set(data.userId, socket.id);
        socket.join(`user:${data.userId}`);
        
        // Update user online status
        await this.updateUserOnlineStatus(data.userId, true);
        
        // Notify other users that this user is online
        this.io.emit('user-online', { userId: data.userId });
      });

      socket.on('join-conversation', async (data: { conversationId: string; userId: string }) => {
        const hasAccess = await this.checkConversationAccess(data.conversationId, data.userId);
        if (hasAccess) {
          socket.join(`conversation:${data.conversationId}`);
          socket.emit('joined-conversation', { conversationId: data.conversationId });
        } else {
          socket.emit('error', { message: 'Access denied to conversation' });
        }
      });

      socket.on('send-message', async (data: MessageData) => {
        try {
          const message = await this.createMessage(data);
          
          // Emit to conversation room
          this.io.to(`conversation:${data.conversationId}`).emit('new-message', {
            conversationId: data.conversationId,
            message
          });

          // Send notification to receiver if they're not in the conversation
          const receiverSocketId = this.connectedUsers.get(data.receiverId);
          if (receiverSocketId) {
            const isReceiverInConversation = Array.from(
              this.io.sockets.adapter.rooms.get(`conversation:${data.conversationId}`) || []
            ).includes(receiverSocketId);

            if (!isReceiverInConversation) {
              this.io.to(`user:${data.receiverId}`).emit('notification', {
                type: 'new-message',
                conversationId: data.conversationId,
                senderId: data.senderId,
                message: data.content,
                timestamp: new Date()
              });
            }
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      socket.on('register-ai', async (data: { conversationId: string; modelId: string; provider?: string; name?: string }) => {
        try {
          await this.registerAIModel(data.conversationId, {
            modelId: data.modelId,
            provider: data.provider,
            name: data.name,
            joinedAt: new Date().toISOString()
          });
          socket.join(`conversation:${data.conversationId}`);
          socket.emit('ai-registered', { conversationId: data.conversationId, modelId: data.modelId });
          this.io.to(`conversation:${data.conversationId}`).emit('system-event', { type: 'ai-joined', modelId: data.modelId });
        } catch {
          socket.emit('error', { message: 'Failed to register AI model' });
        }
      });

      socket.on('typing', (data: { conversationId: string; userId: string; isTyping: boolean }) => {
        socket.to(`conversation:${data.conversationId}`).emit('user-typing', {
          userId: data.userId,
          isTyping: data.isTyping
        });
      });

      socket.on('mark-read', async (data: { conversationId: string; userId: string; messageIds: string[] }) => {
        try {
          await this.markMessagesAsRead(data.messageIds, data.userId);
          socket.to(`conversation:${data.conversationId}`).emit('messages-read', {
            userId: data.userId,
            messageIds: data.messageIds
          });
        } catch (error) {
          socket.emit('error', { message: 'Failed to mark messages as read' });
        }
      });

      socket.on('disconnect', async () => {
        console.log('User disconnected:', socket.id);
        
        // Find userId by socketId
        let disconnectedUserId: string | null = null;
        for (const [userId, socketId] of this.connectedUsers.entries()) {
          if (socketId === socket.id) {
            disconnectedUserId = userId;
            this.connectedUsers.delete(userId);
            break;
          }
        }

        if (disconnectedUserId) {
          await this.updateUserOnlineStatus(disconnectedUserId, false);
          this.io.emit('user-offline', { userId: disconnectedUserId });
        }
      });
    });
  }

  async createMessage(data: MessageData) {
    const db = DatabaseService.getInstance();
    const created = await db.createMessage({
      conversationId: data.conversationId,
      senderId: data.senderId,
      receiverId: data.receiverId,
      content: data.content,
      senderType: (data.senderType || 'USER').toUpperCase(),
      messageType: (data.messageType || 'TEXT').toUpperCase(),
      metadata: data.metadata || {},
      status: 'sent',
      createdAt: new Date()
    });
    return created;
  }

  async createConversation(data: ConversationData) {
    const db = DatabaseService.getInstance();
    const creatorId = data.participants[0];
    const normalizedType = (() => {
      const t = String(data.type || 'GENERAL').toLowerCase();
      if (['general', 'support', 'quotation', 'inquiry'].includes(t)) return t.toUpperCase();
      if (['direct', 'group', 'service', 'order'].includes(t)) return 'GENERAL';
      return 'GENERAL';
    })();
    const created = await db.createAIConversation({
      userId: creatorId,
      type: normalizedType,
      context: {
        participants: data.participants,
        aiModels: [],
        metadata: data.metadata || {}
      },
      status: 'ACTIVE'
    });
    return created;
  }

  async getConversationMessages(conversationId: string, userId: string, limit = 50, offset = 0): Promise<any[]> {
    const hasAccess = await this.checkConversationAccess(conversationId, userId);
    if (!hasAccess) {
      throw new Error('Access denied to conversation');
    }
    const db = DatabaseService.getInstance();
    const messages = await db.getMessages({ conversationId }, { take: limit, skip: offset });
    return messages.reverse();
  }

  async getUserConversations(userId: string): Promise<any[]> {
    const db = DatabaseService.getInstance();
    const conversations = await db.getAIConversations({ userId }, {});
    return conversations;
  }

  async checkConversationAccess(conversationId: string, userId: string): Promise<boolean> {
    const db = DatabaseService.getInstance();
    const conv = await db.getAIConversationById(conversationId);
    if (!conv) return false;
    const ctx = (conv.context as any) || {};
    const participants: string[] = ctx.participants || [];
    return participants.includes(userId) || conv.userId === userId;
  }

  async markMessagesAsRead(_messageIds: string[], _userId: string) {
    return;
  }

  async updateUserOnlineStatus(userId: string, _isOnline: boolean) {
    const db = DatabaseService.getInstance();
    try {
      // Use updateMany to avoid "record not found" errors for users that might not exist in DB (like guests)
      await db.updateUserIfExists(userId, { updatedAt: new Date() });
    } catch (error) {
      console.error('更新用户在线状态失败:', error instanceof Error ? error.message : error);
    }
  }

  // Notification methods
  async sendNotification(userId: string, notification: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
  }) {
    const record = {
      id: `notif_${Date.now()}`,
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      status: 'unread',
      createdAt: new Date()
    } as any;
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(`user:${userId}`).emit('notification', record);
    }
    return record;
  }

  // Send a pre-constructed notification object directly
  async emitNotification(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(`user:${userId}`).emit('notification', notification);
    }
  }

  async getUserNotifications(_userId: string, _limit = 20, _offset = 0) {
    return [] as any[];
  }

  async markNotificationAsRead(_notificationId: string, _userId: string) {
    return;
  }

  async markAllNotificationsAsRead(_userId: string) {
    return;
  }

  async getUnreadNotificationCount(_userId: string) {
    return 0;
  }

  async registerAIModel(conversationId: string, model: { modelId: string; provider?: string; name?: string; joinedAt?: string }) {
    const db = DatabaseService.getInstance();
    const conv = await db.getAIConversationById(conversationId);
    const ctx = (conv?.context as any) || {};
    const aiModels = Array.isArray(ctx.aiModels) ? ctx.aiModels : [];
    aiModels.push(model);
    await db.updateAIConversation(conversationId, { context: { ...ctx, aiModels } });
  }
}
