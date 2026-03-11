/**
 * 通知服务
 * 支持邮件、短信、站内信通知
 */

import { DatabaseService } from '../lib/db/service.js';

export type NotificationType = 'email' | 'sms' | 'inapp';
export type NotificationTemplate = 
  | 'auto_recharge_success'
  | 'auto_recharge_failed'
  | 'withdrawal_approved'
  | 'withdrawal_rejected'
  | 'payment_success'
  | 'order_completed'
  | 'welcome';

export interface NotificationConfig {
  email: {
    enabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    fromEmail: string;
    fromName: string;
  };
  sms: {
    enabled: boolean;
    provider: 'aliyun' | 'tencent';
    accessKeyId: string;
    accessKeySecret: string;
    signName: string;
  };
}

export class NotificationService {
  private static instance: NotificationService;
  private db: DatabaseService;
  private config: NotificationConfig;

  private constructor() {
    this.db = DatabaseService.getInstance();
    this.config = this.loadConfig();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private loadConfig(): NotificationConfig {
    return {
      email: {
        enabled: process.env.EMAIL_ENABLED === 'true',
        smtpHost: process.env.SMTP_HOST || '',
        smtpPort: parseInt(process.env.SMTP_PORT || '587'),
        smtpUser: process.env.SMTP_USER || '',
        smtpPass: process.env.SMTP_PASS || '',
        fromEmail: process.env.EMAIL_FROM || '',
        fromName: process.env.EMAIL_FROM_NAME || '机器人技能平台',
      },
      sms: {
        enabled: process.env.SMS_ENABLED === 'true',
        provider: (process.env.SMS_PROVIDER as any) || 'aliyun',
        accessKeyId: process.env.SMS_ACCESS_KEY_ID || '',
        accessKeySecret: process.env.SMS_ACCESS_KEY_SECRET || '',
        signName: process.env.SMS_SIGN_NAME || '机器人技能平台',
      },
    };
  }

  // 发送通知
  async sendNotification(
    userId: string,
    type: NotificationType,
    template: NotificationTemplate,
    data: any
  ): Promise<boolean> {
    try {
      const user = await this.getUser(userId);
      if (!user) return false;

      let success = false;

      switch (type) {
        case 'email':
          success = await this.sendEmail(user.email, template, data);
          break;
        case 'sms':
          if (user.phone) {
            success = await this.sendSms(user.phone, template, data);
          }
          break;
        case 'inapp':
          success = await this.sendInApp(userId, template, data);
          break;
      }

      // 记录通知日志
      await this.logNotification(userId, type, template, success);

      return success;
    } catch (error) {
      console.error('[Notification] 发送失败:', error);
      return false;
    }
  }

  // 发送邮件
  private async sendEmail(to: string, template: NotificationTemplate, data: any): Promise<boolean> {
    if (!this.config.email.enabled) {
      console.log('[Email] 邮件服务未启用');
      return false;
    }

    const { subject, body } = this.getEmailTemplate(template, data);

    // TODO: 集成实际邮件发送服务 (nodemailer)
    console.log(`[Email] 发送邮件至 ${to}: ${subject}`);
    console.log(`[Email] 内容：${body}`);

    // 模拟发送成功
    return true;
  }

  // 发送短信
  private async sendSms(phone: string, template: NotificationTemplate, data: any): Promise<boolean> {
    if (!this.config.sms.enabled) {
      console.log('[SMS] 短信服务未启用');
      return false;
    }

    const message = this.getSmsTemplate(template, data);

    // TODO: 集成实际短信服务 (阿里云/腾讯云)
    console.log(`[SMS] 发送短信至 ${phone}: ${message}`);

    // 模拟发送成功
    return true;
  }

  // 发送站内信
  private async sendInApp(userId: string, template: NotificationTemplate, data: any): Promise<boolean> {
    const title = this.getInAppTitle(template);
    const content = this.getInAppContent(template, data);

    await this.db.query(
      `INSERT INTO notifications (user_id, title, content, type, is_read, created_at)
       VALUES ($1, $2, $3, $4, false, NOW())`,
      [userId, title, content, template]
    );

    return true;
  }

  // 获取邮件模板
  private getEmailTemplate(template: NotificationTemplate, data: any): { subject: string; body: string } {
    switch (template) {
      case 'auto_recharge_success':
        return {
          subject: '自动充值成功通知',
          body: `尊敬的${data.userName}，您的账户已成功自动充值¥${data.amount}，当前余额¥${data.newBalance}。`,
        };
      case 'auto_recharge_failed':
        return {
          subject: '自动充值失败通知',
          body: `尊敬的${data.userName}，您的自动充值失败 (¥${data.amount})，原因：${data.reason}。请及时处理。`,
        };
      case 'withdrawal_approved':
        return {
          subject: '提现申请已批准',
          body: `尊敬的${data.userName}，您的提现申请 (¥${data.amount}) 已批准，预计 T+1 工作日到账。`,
        };
      case 'withdrawal_rejected':
        return {
          subject: '提现申请被拒绝',
          body: `尊敬的${data.userName}，您的提现申请 (¥${data.amount}) 被拒绝，原因：${data.reason}。冻结金额已解冻。`,
        };
      default:
        return { subject: '平台通知', body: '您有一条新消息' };
    }
  }

  // 获取短信模板
  private getSmsTemplate(template: NotificationTemplate, data: any): string {
    switch (template) {
      case 'auto_recharge_success':
        return `【机器人技能平台】自动充值成功，金额¥${data.amount}，当前余额¥${data.newBalance}`;
      case 'withdrawal_approved':
        return `【机器人技能平台】提现申请已批准，金额¥${data.amount}，预计 T+1 到账`;
      default:
        return '【机器人技能平台】您有一条新通知';
    }
  }

  // 获取站内信标题
  private getInAppTitle(template: NotificationTemplate): string {
    switch (template) {
      case 'auto_recharge_success':
        return '自动充值成功';
      case 'auto_recharge_failed':
        return '自动充值失败';
      case 'withdrawal_approved':
        return '提现申请已批准';
      case 'withdrawal_rejected':
        return '提现申请被拒绝';
      default:
        return '平台通知';
    }
  }

  // 获取站内信内容
  private getInAppContent(template: NotificationTemplate, data: any): string {
    return this.getEmailTemplate(template, data).body;
  }

  // 获取用户信息
  private async getUser(userId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT email, phone FROM users WHERE id = $1`,
      [userId]
    );
    return result.rows[0];
  }

  // 记录通知日志
  private async logNotification(
    userId: string,
    type: NotificationType,
    template: NotificationTemplate,
    success: boolean
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO notification_logs (user_id, type, template, success, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, type, template, success]
    );
  }

  // 批量发送通知
  async batchSendNotification(
    userIds: string[],
    type: NotificationType,
    template: NotificationTemplate,
    data: any
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const userId of userIds) {
      const result = await this.sendNotification(userId, type, template, data);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }

  // 获取用户未读通知
  async getUnreadNotifications(userId: string, limit: number = 20): Promise<any[]> {
    const result = await this.db.query(
      `SELECT * FROM notifications WHERE user_id = $1 AND is_read = false ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  // 标记为已读
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.db.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    );
  }

  // 标记全部为已读
  async markAllAsRead(userId: string): Promise<void> {
    await this.db.query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1`,
      [userId]
    );
  }
}

export const notificationService = NotificationService.getInstance();
