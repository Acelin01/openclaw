/**
 * 消息中心服务
 * 支持系统消息、交易消息、促销消息、消息分类管理
 */

import { DatabaseService } from '../lib/db/service.js';

export type MessageType = 'system' | 'transaction' | 'promotion' | 'support' | 'notification';
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Message {
  id: string;
  userId: string;
  type: MessageType;
  priority: MessagePriority;
  title: string;
  content: string;
  data?: any;
  isRead: boolean;
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export class MessageCenterService {
  private static instance: MessageCenterService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): MessageCenterService {
    if (!MessageCenterService.instance) {
      MessageCenterService.instance = new MessageCenterService();
    }
    return MessageCenterService.instance;
  }

  // 发送消息
  async sendMessage(userId: string, data: {
    type: MessageType;
    priority?: MessagePriority;
    title: string;
    content: string;
    linkUrl?: string;
    data?: any;
    expiresAt?: Date;
  }): Promise<Message> {
    const id = `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    await this.db.query(
      `INSERT INTO messages 
       (id, user_id, type, priority, title, content, link_url, data, is_read, expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, $9, NOW())`,
      [
        id,
        userId,
        data.type,
        data.priority || 'normal',
        data.title,
        data.content,
        data.linkUrl,
        data.data ? JSON.stringify(data.data) : null,
        data.expiresAt,
      ]
    );

    // 发送 WebSocket 推送
    await this.pushMessage(userId, id);

    return {
      id,
      userId,
      type: data.type,
      priority: data.priority || 'normal',
      title: data.title,
      content: data.content,
      data: data.data,
      isRead: false,
      createdAt: new Date(),
    };
  }

  // 批量发送消息
  async batchSendMessages(userIds: string[], data: {
    type: MessageType;
    priority?: MessagePriority;
    title: string;
    content: string;
    linkUrl?: string;
    data?: any;
    expiresAt?: Date;
  }): Promise<number> {
    let sent = 0;

    for (const userId of userIds) {
      try {
        await this.sendMessage(userId, data);
        sent++;
      } catch (error) {
        console.error(`[Message] 发送失败给用户 ${userId}:`, error);
      }
    }

    return sent;
  }

  // 获取用户消息列表
  async getUserMessages(userId: string, filters: {
    type?: MessageType;
    isRead?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Message[]> {
    let query = `SELECT * FROM messages WHERE user_id = $1`;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (filters.type) {
      query += ` AND type = $${paramIndex++}`;
      params.push(filters.type);
    }

    if (filters.isRead !== undefined) {
      query += ` AND is_read = $${paramIndex++}`;
      params.push(filters.isRead);
    }

    // 排除过期消息
    query += ` AND (expires_at IS NULL OR expires_at > NOW())`;

    query += ` ORDER BY priority DESC, created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const result = await this.db.query(query, params);
    return result.rows.map(row => this.mapToMessage(row));
  }

  // 标记消息为已读
  async markAsRead(messageId: string, userId: string): Promise<void> {
    await this.db.query(
      `UPDATE messages SET is_read = true, read_at = NOW() WHERE id = $1 AND user_id = $2`,
      [messageId, userId]
    );
  }

  // 批量标记已读
  async markAllAsRead(userId: string, type?: MessageType): Promise<void> {
    let query = `UPDATE messages SET is_read = true, read_at = NOW() WHERE user_id = $1`;
    const params: any[] = [userId];

    if (type) {
      query += ` AND type = $2`;
      params.push(type);
    }

    await this.db.query(query, params);
  }

  // 删除消息
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    await this.db.query(
      `DELETE FROM messages WHERE id = $1 AND user_id = $2`,
      [messageId, userId]
    );
  }

  // 批量删除消息
  async deleteMessages(messageIds: string[], userId: string): Promise<number> {
    const placeholders = messageIds.map((_, i) => `$${i + 1}`).join(',');
    const result = await this.db.query(
      `DELETE FROM messages WHERE id IN (${placeholders}) AND user_id = $${messageIds.length + 1}`,
      [...messageIds, userId]
    );
    return result.rowCount || 0;
  }

  // 获取未读消息数
  async getUnreadCount(userId: string, type?: MessageType): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM messages WHERE user_id = $1 AND is_read = false`;
    const params: any[] = [userId];

    if (type) {
      query += ` AND type = $2`;
      params.push(type);
    }

    query += ` AND (expires_at IS NULL OR expires_at > NOW())`;

    const result = await this.db.query(query, params);
    return parseInt(result.rows[0].count);
  }

  // 获取消息统计
  async getMessageStats(userId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_read = false THEN 1 END) as unread,
        COUNT(CASE WHEN type = 'system' THEN 1 END) as system,
        COUNT(CASE WHEN type = 'transaction' THEN 1 END) as transaction,
        COUNT(CASE WHEN type = 'promotion' THEN 1 END) as promotion,
        COUNT(CASE WHEN type = 'support' THEN 1 END) as support,
        COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high
       FROM messages
       WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW())`,
      [userId]
    );

    return result.rows[0];
  }

  // 清理过期消息
  async cleanupExpiredMessages(): Promise<number> {
    const result = await this.db.query(
      `DELETE FROM messages WHERE expires_at < NOW()`
    );
    return result.rowCount || 0;
  }

  // 清理旧消息 (保留最近 100 条)
  async cleanupOldMessages(userId: string, keepCount: number = 100): Promise<number> {
    const result = await this.db.query(
      `DELETE FROM messages 
       WHERE user_id = $1 
       AND id NOT IN (
         SELECT id FROM messages 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2
       )`,
      [userId, keepCount]
    );
    return result.rowCount || 0;
  }

  // ===== 快捷方法 =====

  // 发送系统消息
  async sendSystemMessage(userId: string, title: string, content: string, data?: any): Promise<Message> {
    return this.sendMessage(userId, {
      type: 'system',
      priority: 'normal',
      title,
      content,
      data,
    });
  }

  // 发送交易消息
  async sendTransactionMessage(userId: string, title: string, content: string, linkUrl?: string): Promise<Message> {
    return this.sendMessage(userId, {
      type: 'transaction',
      priority: 'high',
      title,
      content,
      linkUrl,
    });
  }

  // 发送促销消息
  async sendPromotionMessage(userId: string, title: string, content: string, expiresAt?: Date): Promise<Message> {
    return this.sendMessage(userId, {
      type: 'promotion',
      priority: 'low',
      title,
      content,
      expiresAt,
    });
  }

  // 发送紧急通知
  async sendUrgentNotification(userId: string, title: string, content: string): Promise<Message> {
    return this.sendMessage(userId, {
      type: 'notification',
      priority: 'urgent',
      title,
      content,
    });
  }

  // ===== 私有方法 =====

  private mapToMessage(row: any): Message {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      priority: row.priority,
      title: row.title,
      content: row.content,
      data: row.data ? JSON.parse(row.data) : undefined,
      isRead: row.is_read,
      readAt: row.read_at,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    };
  }

  private async pushMessage(userId: string, messageId: string): Promise<void> {
    // TODO: WebSocket 推送
    console.log(`[Message] 推送消息给用户 ${userId}: ${messageId}`);
  }
}

export const messageCenterService = MessageCenterService.getInstance();
