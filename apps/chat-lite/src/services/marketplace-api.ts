/**
 * 服务市场 API 客户端
 * 与后端服务市场 API 集成
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface MarketplaceService {
  id: string;
  name: string;
  description: string;
  icon: string;
  basePrice: number;
  rating: number;
  reviewCount: number;
  sellerName: string;
  sellerAvatar: string;
  sellerType: 'robot' | 'human' | 'hybrid';
  tags: string[];
  responseTime: string;
  isFeatured?: boolean;
  isCertified?: boolean;
  industry: string;
  packages?: ServicePackage[];
}

export interface ServicePackage {
  type: 'BASIC' | 'PRO' | 'ENTERPRISE';
  name: string;
  price: number;
  features: string[];
  deliveryTime: string;
}

export interface ServiceFilter {
  industry?: string;
  serviceType?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  certification?: string[];
  search?: string;
}

export class MarketplaceAPIClient {
  private token: string | null = null;

  setToken(token: string): void {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    return headers;
  }

  // 获取服务列表
  async getServices(filter?: ServiceFilter, page: number = 1, limit: number = 20): Promise<{ services: MarketplaceService[]; total: number }> {
    const params = new URLSearchParams();
    if (filter?.industry) params.append('industry', filter.industry);
    if (filter?.serviceType) params.append('serviceType', filter.serviceType);
    if (filter?.minPrice) params.append('minPrice', filter.minPrice.toString());
    if (filter?.maxPrice) params.append('maxPrice', filter.maxPrice.toString());
    if (filter?.minRating) params.append('minRating', filter.minRating.toString());
    if (filter?.search) params.append('search', filter.search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE}/marketplace/services?${params}`, {
      headers: this.getHeaders(),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  // 获取服务详情
  async getServiceDetail(serviceId: string): Promise<MarketplaceService> {
    const response = await fetch(`${API_BASE}/marketplace/services/${serviceId}`, {
      headers: this.getHeaders(),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  // 收藏服务
  async toggleFavorite(serviceId: string): Promise<{ isFavorite: boolean }> {
    const response = await fetch(`${API_BASE}/marketplace/services/${serviceId}/favorite`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  // 获取收藏列表
  async getFavorites(): Promise<MarketplaceService[]> {
    const response = await fetch(`${API_BASE}/marketplace/favorites`, {
      headers: this.getHeaders(),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  // 创建订单
  async createOrder(serviceId: string, packageType: string, description: string): Promise<{ orderId: string }> {
    const response = await fetch(`${API_BASE}/marketplace/orders`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ serviceId, packageType, description }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  // AI 智能匹配
  async aiMatch(requirements: string): Promise<MarketplaceService[]> {
    const response = await fetch(`${API_BASE}/marketplace/ai-match`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ requirements }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }

  // 获取行业解决方案
  async getSolutions(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/marketplace/solutions`, {
      headers: this.getHeaders(),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }
}

export const marketplaceAPI = new MarketplaceAPIClient();
