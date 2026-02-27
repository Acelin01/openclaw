import axios, { AxiosInstance } from "axios";
import { SquareWorker, SquareService } from "../types";

export class SquareApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getWorkers(params?: any): Promise<SquareWorker[]> {
    try {
      const response = await this.client.get("/api/v1/marketplace/workers/featured", { params });
      const payload = response.data?.data ?? response.data;
      if (Array.isArray(payload)) {
        return payload.map(this.transformFeaturedWorker);
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch workers:", error);
      return [];
    }
  }

  async getServices(params?: any): Promise<SquareService[]> {
    try {
      const response = await this.client.get("/api/v1/search/services", { params });
      const payload = response.data?.data?.services ?? response.data?.services ?? response.data;
      if (Array.isArray(payload)) {
        return payload.map(this.transformSearchService);
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch services:", error);
      return [];
    }
  }

  private transformFeaturedWorker(data: any): SquareWorker {
    const wp = data.workerProfile || {};
    return {
      id: data.id,
      name: data.name || "Unknown",
      avatarUrl: data.avatarUrl || "",
      title: wp.title || "",
      rating: wp.rating || 0,
      reviewCount: wp.reviewCount || 0,
      location: wp.location || "",
      languages: Array.isArray(wp.languages) ? wp.languages : [],
      badges: Array.isArray(wp.badges) ? wp.badges : [],
      hourlyRate: {
        amount: wp.hourlyRateAmount || 0,
        currency: wp.hourlyRateCurrency || "USD",
        unit: wp.hourlyRateUnit || "/小时",
      },
      consultationEnabled: !!wp.consultationEnabled,
      onlineStatus: !!wp.onlineStatus,
      skills: Array.isArray(wp.skills) ? wp.skills : [],
      services: Array.isArray(wp.services) ? wp.services.map(transformServiceSimple) : [],
      isAgency: false,
    };
  }

  private transformSearchService(data: any): SquareService {
    return {
      id: data.id,
      workerId: data.userId || "",
      title: data.title,
      description: data.description || "",
      coverImageUrl: data.coverImageUrl || "",
      price: {
        amount: data.priceAmount ?? data.priceRangeMin ?? 0,
        currency: data.priceCurrency || "USD",
        unit: data.unit || "/项目",
      },
      rating: data.rating || 0,
      reviewCount: data.reviewCount || 0,
      deliveryTime: data.deliveryTime,
      tags: Array.isArray(data.tags) ? data.tags : [],
      features: Array.isArray(data.features) ? data.features : undefined,
      provider: data.provider,
    };
  }
}

function transformServiceSimple(data: any): SquareService {
  return {
    id: data.id,
    workerId: data.workerId,
    title: data.title,
    description: data.description,
    coverImageUrl: data.coverImageUrl,
    price: {
      amount: data.priceAmount,
      currency: data.priceCurrency,
      unit: data.unit,
    },
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    deliveryTime: data.deliveryTime,
    tags: data.tags || [],
    features: Array.isArray((data as any).features) ? (data as any).features : undefined,
  };
}
