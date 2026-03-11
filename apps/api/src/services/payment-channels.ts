/**
 * 支付渠道服务
 * 支持：支付宝、微信支付、银行卡
 */

import { DatabaseService } from '../lib/db/service.js';

export type PaymentMethod = 'alipay' | 'wechat' | 'bank';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface PaymentOrder {
  id: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  qrCodeUrl?: string;
  paidAt?: Date;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export class PaymentService {
  private static instance: PaymentService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async createPaymentOrder(userId: string, amount: number, method: PaymentMethod): Promise<PaymentOrder> {
    const orderId = `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const order: PaymentOrder = {
      id: orderId,
      userId,
      amount,
      method,
      status: 'pending',
      createdAt: new Date(),
    };

    // 生成支付二维码 URL (开发环境模拟)
    if (method === 'alipay') {
      order.qrCodeUrl = `https://open.alipay.com/qr/${orderId}?amount=${amount}`;
    } else if (method === 'wechat') {
      order.qrCodeUrl = `https://pay.weixin.qq.com/qr/${orderId}?amount=${amount}`;
    }

    await this.saveOrder(order);
    return order;
  }

  async handlePaymentNotify(orderId: string, status: 'success' | 'failed'): Promise<void> {
    const order = await this.getOrder(orderId);
    if (!order) return;

    await this.updateOrder(orderId, status, {
      paidAt: status === 'success' ? new Date() : undefined,
    });

    if (status === 'success') {
      const { billingService } = await import('./billing.service.js');
      await billingService.updateBalance(order.userId, order.amount, 'add');
    }
  }

  private async saveOrder(order: PaymentOrder): Promise<void> {
    await this.db.query(
      `INSERT INTO payment_orders (id, user_id, amount, method, status, qr_code_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [order.id, order.userId, order.amount, order.method, order.status, order.qrCodeUrl, order.createdAt]
    );
  }

  private async updateOrder(orderId: string, status: PaymentStatus, metadata: any): Promise<void> {
    await this.db.query(
      `UPDATE payment_orders SET status = $1, paid_at = $2, updated_at = NOW() WHERE id = $3`,
      [status, metadata.paidAt, orderId]
    );
  }

  private async getOrder(orderId: string): Promise<PaymentOrder | null> {
    const result = await this.db.query('SELECT * FROM payment_orders WHERE id = $1', [orderId]);
    return result.rows[0] || null;
  }
}

export const paymentService = PaymentService.getInstance();
