/**
 * 客服支持服务
 * 支持在线客服、工单系统、常见问题 FAQ
 */

import { DatabaseService } from '../lib/db/service.js';

export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'payment' | 'refund' | 'technical' | 'account' | 'other';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  content: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string; // 客服 ID
  createdAt: Date;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'user' | 'support';
  content: string;
  attachments?: string[];
  createdAt: Date;
}

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpful: number;
  notHelpful: number;
  order: number;
}

export class CustomerSupportService {
  private static instance: CustomerSupportService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): CustomerSupportService {
    if (!CustomerSupportService.instance) {
      CustomerSupportService.instance = new CustomerSupportService();
    }
    return CustomerSupportService.instance;
  }

  // ===== 工单系统 =====

  // 创建工单
  async createTicket(userId: string, data: {
    subject: string;
    content: string;
    category: TicketCategory;
    priority?: TicketPriority;
    attachments?: string[];
  }): Promise<SupportTicket> {
    const id = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    await this.db.query(
      `INSERT INTO support_tickets 
       (id, user_id, subject, content, category, priority, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'open', NOW())`,
      [id, userId, data.subject, data.content, data.category, data.priority || 'medium']
    );

    // 添加第一条消息
    if (data.content) {
      await this.addTicketMessage(id, userId, 'user', data.content, data.attachments);
    }

    // 自动分配客服
    await this.autoAssignTicket(id);

    return {
      id,
      userId,
      subject: data.subject,
      content: data.content,
      category: data.category,
      priority: data.priority || 'medium',
      status: 'open',
      createdAt: new Date(),
    };
  }

  // 添加工单消息
  async addTicketMessage(ticketId: string, senderId: string, senderType: 'user' | 'support', content: string, attachments?: string[]): Promise<TicketMessage> {
    const id = `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    await this.db.query(
      `INSERT INTO ticket_messages 
       (id, ticket_id, sender_id, sender_type, content, attachments, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [id, ticketId, senderId, senderType, content, attachments ? JSON.stringify(attachments) : null]
    );

    // 更新工单状态
    if (senderType === 'user') {
      await this.updateTicketStatus(ticketId, 'waiting_customer');
    } else {
      await this.updateTicketStatus(ticketId, 'in_progress');
    }

    // 发送通知
    await this.notifyTicketMessage(ticketId, senderType);

    return {
      id,
      ticketId,
      senderId,
      senderType,
      content,
      attachments,
      createdAt: new Date(),
    };
  }

  // 更新工单状态
  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<void> {
    await this.db.query(
      `UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, ticketId]
    );
  }

  // 分配工单给客服
  async assignTicket(ticketId: string, supportId: string): Promise<void> {
    await this.db.query(
      `UPDATE support_tickets 
       SET assigned_to = $1, status = 'in_progress', updated_at = NOW()
       WHERE id = $2`,
      [supportId, ticketId]
    );

    await this.notifyTicketAssigned(ticketId, supportId);
  }

  // 关闭工单
  async closeTicket(ticketId: string, supportId: string): Promise<void> {
    await this.db.query(
      `UPDATE support_tickets 
       SET status = 'resolved', resolved_at = NOW(), resolved_by = $1
       WHERE id = $2`,
      [supportId, ticketId]
    );

    await this.notifyTicketResolved(ticketId);
  }

  // 获取用户工单列表
  async getUserTickets(userId: string, limit: number = 20): Promise<SupportTicket[]> {
    const result = await this.db.query(
      `SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return result.rows.map(row => this.mapToTicket(row));
  }

  // 获取工单详情
  async getTicket(ticketId: string): Promise<SupportTicket & { messages: TicketMessage[] }> {
    const ticketResult = await this.db.query(
      `SELECT * FROM support_tickets WHERE id = $1`,
      [ticketId]
    );

    if (ticketResult.rows.length === 0) {
      throw new Error('工单不存在');
    }

    const messagesResult = await this.db.query(
      `SELECT * FROM ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC`,
      [ticketId]
    );

    return {
      ...this.mapToTicket(ticketResult.rows[0]),
      messages: messagesResult.rows.map(row => this.mapToMessage(row)),
    };
  }

  // 获取待处理工单
  async getPendingTickets(limit: number = 50): Promise<SupportTicket[]> {
    const result = await this.db.query(
      `SELECT * FROM support_tickets 
       WHERE status IN ('open', 'waiting_customer')
       ORDER BY 
         CASE priority 
           WHEN 'urgent' THEN 1 
           WHEN 'high' THEN 2 
           WHEN 'medium' THEN 3 
           WHEN 'low' THEN 4 
         END,
         created_at ASC
       LIMIT $1`,
      [limit]
    );
    return result.rows.map(row => this.mapToTicket(row));
  }

  // 获取客服工单统计
  async getSupportStats(supportId?: string): Promise<any> {
    const whereClause = supportId ? 'WHERE assigned_to = $1' : '';
    const params = supportId ? [supportId] : [];

    const result = await this.db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed
       FROM support_tickets ${whereClause}`,
      params
    );

    return result.rows[0];
  }

  // ===== FAQ 系统 =====

  // 获取 FAQ 列表
  async getFAQs(category?: string): Promise<FAQ[]> {
    let query = `SELECT * FROM faqs`;
    let params: any[] = [];

    if (category) {
      query += ` WHERE category = $1`;
      params.push(category);
    }

    query += ` ORDER BY order ASC, helpful DESC`;

    const result = await this.db.query(query, params);
    return result.rows.map(row => this.mapToFAQ(row));
  }

  // 搜索 FAQ
  async searchFAQs(keyword: string): Promise<FAQ[]> {
    const result = await this.db.query(
      `SELECT * FROM faqs 
       WHERE question ILIKE $1 OR answer ILIKE $1
       ORDER BY helpful DESC
       LIMIT 20`,
      [`%${keyword}%`]
    );
    return result.rows.map(row => this.mapToFAQ(row));
  }

  // 创建 FAQ
  async createFAQ(data: {
    category: string;
    question: string;
    answer: string;
    order?: number;
  }): Promise<FAQ> {
    const id = `FAQ-${Date.now()}`;

    await this.db.query(
      `INSERT INTO faqs 
       (id, category, question, answer, helpful, not_helpful, order, created_at)
       VALUES ($1, $2, $3, $4, 0, 0, $5, NOW())`,
      [id, data.category, data.question, data.answer, data.order || 0]
    );

    return {
      id,
      category: data.category,
      question: data.question,
      answer: data.answer,
      helpful: 0,
      notHelpful: 0,
      order: data.order || 0,
    };
  }

  // 评价 FAQ 有用性
  async rateFAQ(faqId: string, helpful: boolean): Promise<void> {
    const field = helpful ? 'helpful' : 'not_helpful';
    await this.db.query(
      `UPDATE faqs SET ${field} = ${field} + 1 WHERE id = $1`,
      [faqId]
    );
  }

  // ===== 在线聊天 (简化版) =====

  // 发起聊天
  async startChat(userId: string): Promise<{ chatId: string }> {
    const chatId = `CHAT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    await this.db.query(
      `INSERT INTO support_chats 
       (id, user_id, status, started_at)
       VALUES ($1, $2, 'waiting', NOW())`,
      [chatId, userId]
    );

    // 分配客服
    await this.assignChatSupport(chatId);

    return { chatId };
  }

  // 发送聊天消息
  async sendChatMessage(chatId: string, senderId: string, senderType: 'user' | 'support', content: string): Promise<void> {
    await this.db.query(
      `INSERT INTO chat_messages 
       (chat_id, sender_id, sender_type, content, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [chatId, senderId, senderType, content]
    );
  }

  // 结束聊天
  async endChat(chatId: string): Promise<void> {
    await this.db.query(
      `UPDATE support_chats SET status = 'ended', ended_at = NOW() WHERE id = $1`,
      [chatId]
    );
  }

  // ===== 私有方法 =====

  private async autoAssignTicket(ticketId: string): Promise<void> {
    // 简单的轮询分配逻辑
    const result = await this.db.query(
      `SELECT id FROM users WHERE role = 'support' ORDER BY RANDOM() LIMIT 1`
    );

    if (result.rows.length > 0) {
      await this.assignTicket(ticketId, result.rows[0].id);
    }
  }

  private async assignChatSupport(chatId: string): Promise<void> {
    // 分配客服到聊天
    const result = await this.db.query(
      `SELECT id FROM users WHERE role = 'support' AND status = 'online' ORDER BY RANDOM() LIMIT 1`
    );

    if (result.rows.length > 0) {
      await this.db.query(
        `UPDATE support_chats SET assigned_to = $1, status = 'active' WHERE id = $2`,
        [result.rows[0].id, chatId]
      );
    }
  }

  private mapToTicket(row: any): SupportTicket {
    return {
      id: row.id,
      userId: row.user_id,
      subject: row.subject,
      content: row.content,
      category: row.category,
      priority: row.priority,
      status: row.status,
      assignedTo: row.assigned_to,
      createdAt: row.created_at,
    };
  }

  private mapToMessage(row: any): TicketMessage {
    return {
      id: row.id,
      ticketId: row.ticket_id,
      senderId: row.sender_id,
      senderType: row.sender_type,
      content: row.content,
      attachments: row.attachments ? JSON.parse(row.attachments) : undefined,
      createdAt: row.created_at,
    };
  }

  private mapToFAQ(row: any): FAQ {
    return {
      id: row.id,
      category: row.category,
      question: row.question,
      answer: row.answer,
      helpful: row.helpful,
      notHelpful: row.not_helpful,
      order: row.order,
    };
  }

  private async notifyTicketMessage(ticketId: string, senderType: string): Promise<void> {
    console.log(`[Support] 工单消息通知：工单${ticketId}, 发送方${senderType}`);
  }

  private async notifyTicketAssigned(ticketId: string, supportId: string): Promise<void> {
    console.log(`[Support] 工单分配通知：工单${ticketId}, 客服${supportId}`);
  }

  private async notifyTicketResolved(ticketId: string): Promise<void> {
    console.log(`[Support] 工单解决通知：工单${ticketId}`);
  }
}

export const customerSupportService = CustomerSupportService.getInstance();
