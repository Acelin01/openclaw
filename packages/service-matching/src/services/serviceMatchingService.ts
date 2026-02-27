import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import {
  ServiceRequest,
  ServiceProvider,
  MatchScore,
  MatchResult,
  MatchingCriteria,
  MatchingRequest,
  ServiceRecommendation,
} from "../types/matching.types";
import { MatchingEngine } from "./matchingEngine";
import { RecommendationEngine } from "./recommendationEngine";

export class ServiceMatchingService {
  private prisma: PrismaClient;
  private matchingEngine: MatchingEngine;
  private recommendationEngine: RecommendationEngine;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.matchingEngine = new MatchingEngine();
    this.recommendationEngine = new RecommendationEngine();
  }

  async createServiceRequest(
    requestData: Omit<ServiceRequest, "id" | "createdAt" | "updatedAt">,
  ): Promise<ServiceRequest> {
    try {
      const request = await this.prisma.serviceRequest.create({
        data: {
          id: uuidv4(),
          ...requestData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // 触发匹配算法
      if (requestData.status === "published") {
        this.triggerMatching(request.id).catch(console.error);
      }

      return this.mapPrismaServiceRequest(request);
    } catch (error) {
      throw new Error(`创建服务需求失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  async createServiceProvider(
    providerData: Omit<ServiceProvider, "id" | "rating" | "createdAt" | "updatedAt">,
  ): Promise<ServiceProvider> {
    try {
      const provider = await this.prisma.serviceProvider.create({
        data: {
          id: uuidv4(),
          ...providerData,
          rating: {
            average: 0,
            count: 0,
            breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return this.mapPrismaServiceProvider(provider);
    } catch (error) {
      throw new Error(`创建服务提供者失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  async matchServiceProviders(
    requestId: string,
    matchingRequest?: MatchingRequest,
  ): Promise<MatchResult> {
    const startTime = Date.now();

    try {
      // 获取服务需求
      const request = await this.prisma.serviceRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        throw new Error("服务需求不存在");
      }

      // 获取所有可用的服务提供者
      const providers = await this.prisma.serviceProvider.findMany({
        where: {
          status: "active",
          category: request.category,
        },
      });

      // 应用过滤器
      const filteredProviders = this.applyFilters(providers, matchingRequest?.criteria?.filters);

      // 计算匹配分数
      const matches = await this.matchingEngine.calculateMatches(
        this.mapPrismaServiceRequest(request),
        filteredProviders.map((p) => this.mapPrismaServiceProvider(p)),
        matchingRequest?.criteria || this.getDefaultCriteria(),
      );

      // 保存匹配结果
      await this.saveMatchResults(requestId, matches);

      // 生成推荐
      const topMatches = matches.slice(0, matchingRequest?.maxResults || 10);

      return {
        request: this.mapPrismaServiceRequest(request),
        matches,
        topMatches,
        totalProviders: providers.length,
        filteredProviders: filteredProviders.length,
        matchedProviders: matches.length,
        matchingAlgorithm: matchingRequest?.algorithmId || "default",
        executionTime: Date.now() - startTime,
        createdAt: new Date(),
      };
    } catch (error) {
      throw new Error(`服务匹配失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  async getServiceRecommendations(
    userId: string,
    type: "provider" | "request",
    limit: number = 10,
  ): Promise<ServiceRecommendation[]> {
    try {
      // 获取用户历史数据
      const userHistory = await this.getUserMatchingHistory(userId);

      // 生成推荐
      const recommendations = await this.recommendationEngine.generateRecommendations(
        userId,
        type,
        userHistory,
        limit,
      );

      // 保存推荐结果
      await this.saveRecommendations(recommendations);

      return recommendations;
    } catch (error) {
      throw new Error(`获取推荐失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  async getServiceRequest(id: string): Promise<ServiceRequest | null> {
    try {
      const request = await this.prisma.serviceRequest.findUnique({
        where: { id },
      });

      return request ? this.mapPrismaServiceRequest(request) : null;
    } catch (error) {
      throw new Error(`获取服务需求失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  async getServiceProvider(id: string): Promise<ServiceProvider | null> {
    try {
      const provider = await this.prisma.serviceProvider.findUnique({
        where: { id },
      });

      return provider ? this.mapPrismaServiceProvider(provider) : null;
    } catch (error) {
      throw new Error(`获取服务提供者失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  async getServiceRequests(filters: {
    userId?: string;
    category?: string;
    status?: string;
    budgetMin?: number;
    budgetMax?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    requests: ServiceRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (filters.userId) where.userId = filters.userId;
      if (filters.category) where.category = filters.category;
      if (filters.status) where.status = filters.status;
      if (filters.budgetMin || filters.budgetMax) {
        where.budget = {};
        if (filters.budgetMin) where.budget.gte = filters.budgetMin;
        if (filters.budgetMax) where.budget.lte = filters.budgetMax;
      }

      const [requests, total] = await Promise.all([
        this.prisma.serviceRequest.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.serviceRequest.count({ where }),
      ]);

      return {
        requests: requests.map((r) => this.mapPrismaServiceRequest(r)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(
        `获取服务需求列表失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  async getServiceProviders(filters: {
    category?: string;
    status?: string;
    minRating?: number;
    maxHourlyRate?: number;
    location?: string;
    skills?: string[];
    page?: number;
    limit?: number;
  }): Promise<{
    providers: ServiceProvider[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = { status: "active" };
      if (filters.category) where.category = filters.category;
      if (filters.minRating) {
        where.rating = {
          path: ["average"],
          gte: filters.minRating,
        };
      }
      if (filters.maxHourlyRate) {
        where.pricing = {
          path: ["hourlyRate"],
          lte: filters.maxHourlyRate,
        };
      }
      if (filters.location) {
        where.location = {
          path: ["city"],
          contains: filters.location,
        };
      }
      if (filters.skills && filters.skills.length > 0) {
        where.skills = {
          hasSome: filters.skills,
        };
      }

      const [providers, total] = await Promise.all([
        this.prisma.serviceProvider.findMany({
          where,
          skip,
          take: limit,
          orderBy: { "rating.average": "desc" },
        }),
        this.prisma.serviceProvider.count({ where }),
      ]);

      return {
        providers: providers.map((p) => this.mapPrismaServiceProvider(p)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(
        `获取服务提供者列表失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  async updateServiceRequest(
    id: string,
    updates: Partial<ServiceRequest>,
  ): Promise<ServiceRequest> {
    try {
      const request = await this.prisma.serviceRequest.update({
        where: { id },
        data: {
          ...updates,
          updatedAt: new Date(),
        },
      });

      // 如果状态变为已发布，触发匹配
      if (updates.status === "published") {
        this.triggerMatching(id).catch(console.error);
      }

      return this.mapPrismaServiceRequest(request);
    } catch (error) {
      throw new Error(`更新服务需求失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  async updateServiceProvider(
    id: string,
    updates: Partial<ServiceProvider>,
  ): Promise<ServiceProvider> {
    try {
      const provider = await this.prisma.serviceProvider.update({
        where: { id },
        data: {
          ...updates,
          updatedAt: new Date(),
        },
      });

      return this.mapPrismaServiceProvider(provider);
    } catch (error) {
      throw new Error(`更新服务提供者失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  private async triggerMatching(requestId: string): Promise<void> {
    // 异步触发匹配算法
    setTimeout(async () => {
      try {
        await this.matchServiceProviders(requestId);
        console.log(`自动匹配完成: ${requestId}`);
      } catch (error) {
        console.error(`自动匹配失败: ${requestId}`, error);
      }
    }, 5000); // 5秒后执行
  }

  private applyFilters(providers: any[], filters?: MatchingCriteria["filters"]): any[] {
    if (!filters) return providers;

    return providers.filter((provider) => {
      // 工作类型过滤
      if (filters.workTypes && filters.workTypes.length > 0) {
        if (!filters.workTypes.includes(provider.location.type)) {
          return false;
        }
      }

      // 位置过滤
      if (filters.locations && filters.locations.length > 0) {
        const providerLocation = provider.location.city || provider.location.country;
        if (!filters.locations.some((loc) => providerLocation?.includes(loc))) {
          return false;
        }
      }

      // 可用性过滤
      if (filters.availability && filters.availability !== "any") {
        if (provider.availability.status !== filters.availability) {
          return false;
        }
      }

      // 时薪过滤
      if (filters.maxHourlyRate) {
        if (provider.pricing.hourlyRate > filters.maxHourlyRate) {
          return false;
        }
      }

      // 评分过滤
      if (filters.minRating) {
        if (provider.rating.average < filters.minRating) {
          return false;
        }
      }

      // 语言过滤
      if (filters.languages && filters.languages.length > 0) {
        if (!filters.languages.some((lang) => provider.experience.languages.includes(lang))) {
          return false;
        }
      }

      // 验证级别过滤
      if (filters.verificationLevels && filters.verificationLevels.length > 0) {
        const hasRequiredVerification = filters.verificationLevels.some(
          (level) => provider.verification[level],
        );
        if (!hasRequiredVerification) {
          return false;
        }
      }

      return true;
    });
  }

  private getDefaultCriteria(): MatchingCriteria {
    return {
      weights: {
        category: 0.2,
        skills: 0.3,
        budget: 0.15,
        timeline: 0.1,
        location: 0.1,
        experience: 0.1,
        rating: 0.05,
      },
      thresholds: {
        minOverallScore: 60,
        minCategoryScore: 80,
        maxBudgetDifference: 0.3, // 30%
        maxTimelineDifference: 7, // 7 days
        minExperience: 1,
        minRating: 3.0,
      },
      filters: {},
    };
  }

  private async saveMatchResults(requestId: string, matches: MatchScore[]): Promise<void> {
    // 批量保存匹配结果
    const matchData = matches.map((match) => ({
      id: uuidv4(),
      requestId,
      providerId: match.providerId,
      overallScore: match.overallScore,
      categoryScore: match.categoryScore,
      skillsScore: match.skillsScore,
      budgetScore: match.budgetScore,
      timelineScore: match.timelineScore,
      locationScore: match.locationScore,
      experienceScore: match.experienceScore,
      ratingScore: match.ratingScore,
      factors: match.factors,
      explanation: match.explanation,
      createdAt: new Date(),
    }));

    await this.prisma.serviceMatch.createMany({
      data: matchData,
    });
  }

  private async saveRecommendations(recommendations: ServiceRecommendation[]): Promise<void> {
    // 批量保存推荐结果
    const recommendationData = recommendations.map((rec) => ({
      id: rec.id,
      userId: rec.userId,
      type: rec.type,
      itemId: rec.itemId,
      score: rec.score,
      reason: rec.reason,
      factors: rec.factors,
      createdAt: rec.createdAt,
      expiresAt: rec.expiresAt,
      clicked: false,
      converted: false,
    }));

    await this.prisma.serviceRecommendation.createMany({
      data: recommendationData,
    });
  }

  private async getUserMatchingHistory(userId: string): Promise<any> {
    // 获取用户的历史匹配数据
    const [requests, providers, matches] = await Promise.all([
      this.prisma.serviceRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      this.prisma.serviceProvider.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      this.prisma.serviceMatch.findMany({
        where: { request: { userId } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return { requests, providers, matches };
  }

  private mapPrismaServiceRequest(prismaRequest: any): ServiceRequest {
    return {
      id: prismaRequest.id,
      userId: prismaRequest.userId,
      title: prismaRequest.title,
      description: prismaRequest.description,
      category: prismaRequest.category,
      skills: prismaRequest.skills,
      budget: prismaRequest.budget,
      timeline: prismaRequest.timeline,
      location: prismaRequest.location,
      requirements: prismaRequest.requirements,
      status: prismaRequest.status,
      createdAt: prismaRequest.createdAt,
      updatedAt: prismaRequest.updatedAt,
    };
  }

  private mapPrismaServiceProvider(prismaProvider: any): ServiceProvider {
    return {
      id: prismaProvider.id,
      userId: prismaProvider.userId,
      title: prismaProvider.title,
      description: prismaProvider.description,
      category: prismaProvider.category,
      skills: prismaProvider.skills,
      portfolio: prismaProvider.portfolio,
      pricing: prismaProvider.pricing,
      availability: prismaProvider.availability,
      location: prismaProvider.location,
      experience: prismaProvider.experience,
      rating: prismaProvider.rating,
      verification: prismaProvider.verification,
      status: prismaProvider.status,
      createdAt: prismaProvider.createdAt,
      updatedAt: prismaProvider.updatedAt,
    };
  }
}
