/**
 * Order API Client
 * 订单系统 API 客户端
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// 类型定义
export interface Order {
  id: string;
  orderNo: string;
  serviceName: string;
  serviceIcon: string;
  sellerName: string;
  sellerTitle: string;
  sellerRating: number;
  status: string;
  amount: number;
  prepayment: number;
  progress: number;
  requirements: string;
  createdAt: string;
  createdTime: string;
  tasks?: OrderTask[];
  deliveries?: OrderDelivery[];
}

export interface OrderTask {
  name: string;
  hours: string;
  status: 'done' | 'active' | 'pending';
  progress: number;
}

export interface OrderDelivery {
  name: string;
  sub: string;
  time: string;
}

export interface OrderStats {
  total: number;
  active: number;
  pending: number;
  review: number;
  done: number;
  disputed: number;
  cancelled: number;
  totalAmount: number;
}

export interface OrderFilter {
  status: string;
  search: string;
  amountRange: string;
  sortBy: string;
}

export interface CreateOrderData {
  serviceId: string;
  packageType: string;
  requirements: string;
  prepayment: number;
  paymentMethod: string;
}

export class OrderAPIClient {
  private token: string | null = null;

  setToken(token: string): void {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // 获取订单列表
  async getOrders(filter: OrderFilter): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filter.status !== 'all') params.append('status', filter.status);
    if (filter.search) params.append('search', filter.search);
    if (filter.amountRange !== 'all') params.append('amountRange', filter.amountRange);
    if (filter.sortBy !== 'latest') params.append('sortBy', filter.sortBy);

    const response = await fetch(`${API_BASE}/orders?${params}`, {
      headers: this.getHeaders(),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  // 获取订单详情
  async getOrderDetail(orderId: string): Promise<Order> {
    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      headers: this.getHeaders(),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  // 获取统计数据
  async getStats(): Promise<OrderStats> {
    const response = await fetch(`${API_BASE}/orders/stats`, {
      headers: this.getHeaders(),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  // 创建订单
  async createOrder(data: CreateOrderData): Promise<{ orderId: string }> {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  // 取消订单
  async cancelOrder(orderId: string, reason: string): Promise<void> {
    const response = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
  }

  // 修改请求
  async modifyRequest(orderId: string, content: string): Promise<void> {
    const response = await fetch(`${API_BASE}/orders/${orderId}/modify`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ content }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
  }

  // 确认验收
  async acceptOrder(orderId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/orders/${orderId}/accept`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
  }

  // 拒绝验收
  async rejectOrder(orderId: string, reason: string): Promise<void> {
    const response = await fetch(`${API_BASE}/orders/${orderId}/reject`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
  }

  // 提交评价
  async submitReview(orderId: string, rating: number, comment: string, anonymous: boolean): Promise<void> {
    const response = await fetch(`${API_BASE}/orders/${orderId}/review`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ rating, comment, anonymous }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
  }

  // 提交申诉
  async submitDispute(orderId: string, reason: string, evidence: string[]): Promise<void> {
    const response = await fetch(`${API_BASE}/orders/${orderId}/dispute`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason, evidence }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
  }

  // 提交交付物
  async submitDelivery(orderId: string, data: { name: string; files?: string[]; link?: string; description: string }): Promise<void> {
    const response = await fetch(`${API_BASE}/orders/${orderId}/delivery`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
  }

  // 导出订单
  async exportOrders(format: string, startDate: string, endDate: string, fields: string[]): Promise<Blob> {
    const response = await fetch(`${API_BASE}/orders/export`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ format, startDate, endDate, fields }),
    });

    if (!response.ok) throw new Error('导出失败');
    return await response.blob();
  }

  // 启动计费
  async startBilling(orderId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/orders/${orderId}/billing/start`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
  }

  // 停止计费
  async stopBilling(orderId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/orders/${orderId}/billing/stop`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
  }

  // 获取计费状态
  async getBillingStatus(orderId: string): Promise<{ running: boolean; elapsedSeconds: number; currentCost: number }> {
    const response = await fetch(`${API_BASE}/orders/${orderId}/billing/status`, {
      headers: this.getHeaders(),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }
}

export const orderAPI = new OrderAPIClient();
