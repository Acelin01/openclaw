/**
 * 发票服务
 * 支持增值税专票、普通发票、电子发票
 */

import { DatabaseService } from '../lib/db/service.js';

export type InvoiceType = 'vat' | 'normal' | 'electronic';
export type InvoiceStatus = 'pending' | 'processing' | 'sent' | 'rejected';

export interface InvoiceRequest {
  userId: string;
  type: InvoiceType;
  title: string;
  taxId: string;
  amount: number;
  period: string;
  email: string;
  phone?: string;
  address?: string;
  bankName?: string;
  bankAccount?: string;
}

export interface InvoiceResult {
  success: boolean;
  invoiceId?: string;
  message?: string;
  invoiceUrl?: string;
}

export class InvoiceService {
  private static instance: InvoiceService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): InvoiceService {
    if (!InvoiceService.instance) {
      InvoiceService.instance = new InvoiceService();
    }
    return InvoiceService.instance;
  }

  // 申请发票
  async applyInvoice(request: InvoiceRequest): Promise<InvoiceResult> {
    try {
      // 1. 验证用户信息
      const user = await this.getUser(request.userId);
      if (!user) {
        return { success: false, message: '用户不存在' };
      }

      // 2. 验证可开票金额
      const availableAmount = await this.getAvailableInvoiceAmount(request.userId);
      if (availableAmount < request.amount) {
        return { 
          success: false, 
          message: `可开票金额不足，当前可开：¥${availableAmount}` 
        };
      }

      // 3. 生成发票号
      const invoiceId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // 4. 创建发票记录
      await this.createInvoiceRecord(invoiceId, request);

      // 5. 冻结可开票金额
      await this.freezeInvoiceAmount(request.userId, request.amount);

      // 6. 发送发票申请通知
      await this.sendInvoiceNotification(request.userId, invoiceId, 'pending');

      console.log(`[Invoice] 发票申请成功：${invoiceId}, 金额：¥${request.amount}`);

      return {
        success: true,
        invoiceId,
        message: '发票申请已提交，3 个工作日内处理',
      };

    } catch (error: any) {
      console.error('[Invoice] 申请失败:', error.message);
      return { success: false, message: error.message };
    }
  }

  // 创建发票记录
  private async createInvoiceRecord(invoiceId: string, request: InvoiceRequest): Promise<void> {
    await this.db.query(
      `INSERT INTO invoices 
       (id, user_id, type, title, tax_id, amount, period, email, phone, address, bank_name, bank_account, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending', NOW())`,
      [
        invoiceId,
        request.userId,
        request.type,
        request.title,
        request.taxId,
        request.amount,
        request.period,
        request.email,
        request.phone,
        request.address,
        request.bankName,
        request.bankAccount,
      ]
    );
  }

  // 获取可开票金额
  private async getAvailableInvoiceAmount(userId: string): Promise<number> {
    const result = await this.db.query(
      `SELECT COALESCE(SUM(actual_amount), 0) as total_earnings
       FROM earnings
       WHERE user_id = $1 AND status = 'settled'`,
      [userId]
    );

    const totalEarnings = parseFloat(result.rows[0].total_earnings);

    const invoicedResult = await this.db.query(
      `SELECT COALESCE(SUM(amount), 0) as total_invoiced
       FROM invoices
       WHERE user_id = $1 AND status IN ('pending', 'processing', 'sent')`,
      [userId]
    );

    const totalInvoiced = parseFloat(result.rows[0].total_invoiced);

    return totalEarnings - totalInvoiced;
  }

  // 冻结可开票金额
  private async freezeInvoiceAmount(userId: string, amount: number): Promise<void> {
    // 在用户余额表中记录已申请发票金额
    await this.db.query(
      `UPDATE user_balances 
       SET invoiced_amount = COALESCE(invoiced_amount, 0) + $1 
       WHERE user_id = $2`,
      [amount, userId]
    );
  }

  // 获取用户信息
  private async getUser(userId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM users WHERE id = $1`,
      [userId]
    );
    return result.rows[0];
  }

  // 发送发票通知
  private async sendInvoiceNotification(userId: string, invoiceId: string, status: InvoiceStatus): Promise<void> {
    // TODO: 集成通知服务
    console.log(`[Invoice] 发送通知：用户 ${userId}, 发票 ${invoiceId}, 状态 ${status}`);
  }

  // 获取用户的发票列表
  async getUserInvoices(userId: string, limit: number = 20): Promise<any[]> {
    const result = await this.db.query(
      `SELECT * FROM invoices WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  // 获取发票详情
  async getInvoiceDetail(invoiceId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM invoices WHERE id = $1`,
      [invoiceId]
    );
    return result.rows[0];
  }

  // 更新发票状态
  async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus, metadata?: any): Promise<void> {
    const updates: string[] = ['status = $1'];
    const values: any[] = [status];
    let paramIndex = 2;

    if (metadata?.invoiceUrl) {
      updates.push(`invoice_url = $${paramIndex++}`);
      values.push(metadata.invoiceUrl);
    }

    if (metadata?.sentAt) {
      updates.push(`sent_at = $${paramIndex++}`);
      values.push(metadata.sentAt);
    }

    if (metadata?.rejectedReason) {
      updates.push(`rejected_reason = $${paramIndex++}`);
      values.push(metadata.rejectedReason);
    }

    updates.push(`processed_at = NOW()`);

    await this.db.query(
      `UPDATE invoices SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      [...values, invoiceId]
    );

    // 获取发票记录
    const invoice = await this.getInvoiceDetail(invoiceId);
    if (invoice) {
      // 发送状态变更通知
      await this.sendInvoiceNotification(invoice.user_id, invoiceId, status);
    }
  }

  // 撤销发票申请
  async cancelInvoice(invoiceId: string, userId: string): Promise<boolean> {
    const invoice = await this.getInvoiceDetail(invoiceId);
    if (!invoice) {
      return false;
    }

    if (invoice.user_id !== userId) {
      throw new Error('无权操作此发票');
    }

    if (invoice.status !== 'pending') {
      return false;
    }

    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      // 恢复可开票金额
      await client.query(
        `UPDATE user_balances 
         SET invoiced_amount = COALESCE(invoiced_amount, 0) - $1 
         WHERE user_id = $2`,
        [invoice.amount, userId]
      );

      // 删除发票记录
      await client.query(
        `DELETE FROM invoices WHERE id = $1`,
        [invoiceId]
      );

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 获取待处理发票
  async getPendingInvoices(limit: number = 50): Promise<any[]> {
    const result = await this.db.query(
      `SELECT * FROM invoices WHERE status = 'pending' ORDER BY created_at ASC LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  // 批量生成发票 (财务后台使用)
  async batchGenerateInvoices(invoiceIds: string[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const invoiceId of invoiceIds) {
      try {
        // TODO: 对接实际发票生成系统
        const invoiceUrl = `https://invoice.example.com/${invoiceId}`;
        
        await this.updateInvoiceStatus(invoiceId, 'sent', {
          invoiceUrl,
          sentAt: new Date(),
        });

        success++;
      } catch (error) {
        failed++;
      }
    }

    return { success, failed };
  }

  // 获取发票统计
  async getInvoiceStats(userId: string): Promise<any> {
    const result = await this.db.query(
      `SELECT 
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending,
        COALESCE(SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END), 0) as processing,
        COALESCE(SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END), 0) as sent,
        COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected,
        COALESCE(SUM(amount), 0) as total_amount
       FROM invoices
       WHERE user_id = $1`,
      [userId]
    );

    return result.rows[0];
  }
}

export const invoiceService = InvoiceService.getInstance();
