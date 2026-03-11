/**
 * 计费结算 API 客户端
 * 提供与后端计费服务的完整交互
 */

import { io, Socket } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8000';

export interface UserBalance {
  userId: string;
  balance: number;
  frozenBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalRecharge: number;
  totalWithdrawal: number;
  updatedAt: string;
}

export interface BillingStats {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  pendingWithdrawal: number;
  couponCount: number;
  couponTotalValue: number;
}

export interface BillingRecord {
  id: string;
  userId: string;
  orderId: string;
  type: 'charge' | 'deduction' | 'income' | 'withdrawal' | 'refund';
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}

export interface EarningsRecord {
  id: string;
  orderId: string;
  acceptTime: string;
  serviceFee: number;
  actualAmount: number;
  status: 'settled' | 'pending';
}

export interface WithdrawalRecord {
  id: string;
  userId: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  rejectedReason?: string;
}

export interface Coupon {
  id: string;
  userId: string;
  amount: number;
  name: string;
  condition: number;
  expiryDate: string;
  used: boolean;
  usedAt?: string;
}

export interface AutoRechargeConfig {
  userId: string;
  enabled: boolean;
  threshold: number;
  rechargeAmount: number;
  paymentMethod: 'alipay' | 'wechat' | 'bank';
}

export interface BillingTickData {
  orderId: string;
  elapsedSeconds: number;
  currentCost: number;
  ratePerInterval: number;
  balance: number;
}

export interface PermissionInfo {
  role: string;
  permissions: string[];
  canViewBalance: boolean;
  canRecharge: boolean;
  canViewBilling: boolean;
  canExportBilling: boolean;
  canViewEarnings: boolean;
  canWithdraw: boolean;
  canViewCoupons: boolean;
  canRedeemCoupons: boolean;
  canCreateInvoice: boolean;
  isAdmin: boolean;
}

export class BillingAPIClient {
  private token: string | null = null;
  private socket: Socket | null = null;
  private eventListeners: Map<string, Set<Function>> = new Map();

  setToken(token: string): void {
    this.token = token;
    if (this.socket?.connected) {
      this.socket.disconnect();
      this.connectSocket();
    }
  }

  clearToken(): void {
    this.token = null;
    this.disconnectSocket();
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    return headers;
  }

  async getBalance(): Promise<{ balance: UserBalance; stats: BillingStats }> {
    const res = await fetch(`${API_BASE}/billing/balance`, { headers: this.getHeaders() });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  async recharge(amount: number, method: 'alipay' | 'wechat' | 'bank'): Promise<any> {
    const res = await fetch(`${API_BASE}/billing/recharge`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ amount, method }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  async getAutoRechargeConfig(): Promise<AutoRechargeConfig | null> {
    const res = await fetch(`${API_BASE}/billing/auto-recharge`, { headers: this.getHeaders() });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  async updateAutoRechargeConfig(config: Partial<AutoRechargeConfig>): Promise<AutoRechargeConfig> {
    const res = await fetch(`${API_BASE}/billing/auto-recharge`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(config),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  async startBilling(orderId: string, ratePerHour: number, intervalSeconds: number = 6): Promise<void> {
    const res = await fetch(`${API_BASE}/billing/billing/start`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ orderId, ratePerHour, intervalSeconds }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
  }

  async stopBilling(orderId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/billing/billing/stop`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ orderId }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
  }

  async getBillingRecords(options?: any): Promise<BillingRecord[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.type) params.append('type', options.type);
    const res = await fetch(`${API_BASE}/billing/records?${params}`, { headers: this.getHeaders() });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  async getEarnings(limit: number = 50): Promise<EarningsRecord[]> {
    const res = await fetch(`${API_BASE}/billing/earnings?limit=${limit}`, { headers: this.getHeaders() });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  async requestWithdrawal(amount: number, bankName: string, bankAccount: string): Promise<WithdrawalRecord> {
    const res = await fetch(`${API_BASE}/billing/withdrawal`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ amount, bankName, bankAccount }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  async getWithdrawals(limit: number = 50): Promise<WithdrawalRecord[]> {
    const res = await fetch(`${API_BASE}/billing/withdrawals?limit=${limit}`, { headers: this.getHeaders() });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  async getCoupons(): Promise<Coupon[]> {
    const res = await fetch(`${API_BASE}/billing/coupons`, { headers: this.getHeaders() });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  async redeemCoupon(code: string): Promise<Coupon> {
    const res = await fetch(`${API_BASE}/billing/coupons/redeem`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ code }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  async useCoupon(couponId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/billing/coupons/${couponId}/use`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
  }

  async exportData(format: 'csv' | 'json' | 'xlsx', type: 'billing' | 'earnings' | 'withdrawal', startDate?: string, endDate?: string): Promise<Blob> {
    const res = await fetch(`${API_BASE}/billing/export`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ format, type, startDate, endDate }),
    });
    if (!res.ok) throw new Error('Export failed');
    return await res.blob();
  }

  async getStats(): Promise<BillingStats> {
    const res = await fetch(`${API_BASE}/billing/stats`, { headers: this.getHeaders() });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  async getPermissionInfo(): Promise<PermissionInfo> {
    const res = await fetch(`${API_BASE}/billing/permissions`, { headers: this.getHeaders() });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  connectSocket(): void {
    if (this.socket?.connected) return;
    this.socket = io(`${WS_URL}/billing`, { auth: { token: this.token }, transports: ['websocket', 'polling'] });
    this.socket.on('connect', () => { console.log('[BillingAPI] WebSocket connected'); this.emit('connected'); });
    this.socket.on('disconnect', () => { console.log('[BillingAPI] WebSocket disconnected'); this.emit('disconnected'); });
    this.socket.on('balance:updated', (data) => this.emit('balance:updated', data));
    this.socket.on('billing:tick', (data: BillingTickData) => this.emit('billing:tick', data));
    this.socket.on('billing:started', (data) => this.emit('billing:started', data));
    this.socket.on('billing:stopped', (data) => this.emit('billing:stopped', data));
    this.socket.on('billing:low_balance', (data) => this.emit('billing:low_balance', data));
    this.socket.on('earnings:updated', (data) => this.emit('earnings:updated', data));
    this.socket.on('withdrawal:requested', (data) => this.emit('withdrawal:requested', data));
  }

  disconnectSocket(): void {
    if (this.socket) { this.socket.disconnect(); this.socket = null; }
  }

  subscribeToBilling(orderId?: string): void {
    if (this.socket?.connected) this.socket.emit('billing:subscribe', { orderId });
  }

  unsubscribeFromBilling(orderId?: string): void {
    if (this.socket?.connected) this.socket.emit('billing:unsubscribe', { orderId });
  }

  startRemoteBilling(orderId: string, ratePerHour: number, intervalSeconds?: number): void {
    if (this.socket?.connected) this.socket.emit('billing:start', { orderId, ratePerHour, intervalSeconds });
  }

  stopRemoteBilling(orderId: string): void {
    if (this.socket?.connected) this.socket.emit('billing:stop', { orderId });
  }

  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) this.eventListeners.set(event, new Set());
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) listeners.delete(callback);
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) listeners.forEach(cb => cb(data));
  }
}

export const billingAPI = new BillingAPIClient();
