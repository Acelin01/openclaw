/**
 * AI 智能匹配服务
 * 基于技能标签、历史评分、响应速度等多维度匹配最优服务商
 */

import { DatabaseService } from '../lib/db/service.js';

export interface MatchingCriteria {
  requirements: string;
  budget?: number;
  deliveryTime?: string;
  serviceType?: 'robot' | 'human' | 'hybrid';
  minRating?: number;
  industry?: string;
}

export interface MatchedService {
  serviceId: string;
  serviceName: string;
  matchScore: number;
  matchReasons: string[];
  price: number;
  rating: number;
  responseTime: string;
}

export class AIMatchingService {
  private static instance: AIMatchingService;
  private db: DatabaseService;

  // 权重配置
  private weights = {
    skillMatch: 0.40,      // 技能标签匹配 40%
    historicalRating: 0.20, // 历史评分 20%
    responseSpeed: 0.15,   // 响应速度 15%
    priceCompetitiveness: 0.15, // 价格竞争力 15%
    completionRate: 0.10,  // 完成率 10%
  };

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): AIMatchingService {
    if (!AIMatchingService.instance) {
      AIMatchingService.instance = new AIMatchingService();
    }
    return AIMatchingService.instance;
  }

  // 智能匹配
  async matchServices(criteria: MatchingCriteria, limit: number = 10): Promise<MatchedService[]> {
    try {
      // 1. 提取关键词
      const keywords = this.extractKeywords(criteria.requirements);
      
      // 2. 获取候选服务
      const candidates = await this.getCandidateServices(criteria);
      
      // 3. 计算匹配分数
      const matchedServices = await Promise.all(
        candidates.map(service => this.calculateMatchScore(service, keywords, criteria))
      );
      
      // 4. 排序并返回
      matchedServices.sort((a, b) => b.matchScore - a.matchScore);
      
      return matchedServices.slice(0, limit);
    } catch (error) {
      console.error('[AI Matching] 匹配失败:', error);
      return [];
    }
  }

  // 提取关键词
  private extractKeywords(requirements: string): string[] {
    // 分词 (简化版，实际可用 NLP 库)
    const stopWords = ['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个'];
    
    return requirements
      .split(/[\s,，.。]+/)
      .filter(word => word.length > 1 && !stopWords.includes(word))
      .slice(0, 10); // 最多 10 个关键词
  }

  // 获取候选服务
  private async getCandidateServices(criteria: MatchingCriteria): Promise<any[]> {
    let query = `SELECT * FROM services WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (criteria.industry) {
      query += ` AND industry = $${paramIndex++}`;
      params.push(criteria.industry);
    }

    if (criteria.serviceType) {
      query += ` AND service_type = $${paramIndex++}`;
      params.push(criteria.serviceType);
    }

    if (criteria.minRating) {
      query += ` AND rating >= $${paramIndex++}`;
      params.push(criteria.minRating);
    }

    if (criteria.budget) {
      query += ` AND base_price <= $${paramIndex++}`;
      params.push(criteria.budget * 1.2); // 允许 20% 浮动
    }

    query += ' ORDER BY rating DESC, review_count DESC LIMIT 50';
    
    const result = await this.db.query(query, params);
    return result.rows;
  }

  // 计算匹配分数
  private async calculateMatchScore(
    service: any,
    keywords: string[],
    criteria: MatchingCriteria
  ): Promise<MatchedService> {
    // 1. 技能标签匹配 (40%)
    const skillScore = this.calculateSkillMatch(service, keywords);
    
    // 2. 历史评分 (20%)
    const ratingScore = (service.rating / 5.0) * 100;
    
    // 3. 响应速度 (15%)
    const responseScore = this.calculateResponseScore(service.response_time);
    
    // 4. 价格竞争力 (15%)
    const priceScore = this.calculatePriceScore(service.base_price, criteria.budget);
    
    // 5. 完成率 (10%)
    const completionScore = service.completion_rate || 90;

    // 加权总分
    const totalScore = 
      skillScore * this.weights.skillMatch +
      ratingScore * this.weights.historicalRating +
      responseScore * this.weights.responseSpeed +
      priceScore * this.weights.priceCompetitiveness +
      completionScore * this.weights.completionRate;

    // 生成匹配理由
    const matchReasons = this.generateMatchReasons(service, keywords, totalScore);

    return {
      serviceId: service.id,
      serviceName: service.name,
      matchScore: Math.round(totalScore * 100) / 100,
      matchReasons,
      price: service.base_price,
      rating: service.rating,
      responseTime: service.response_time,
    };
  }

  // 计算技能匹配度
  private calculateSkillMatch(service: any, keywords: string[]): number {
    const serviceTags = service.tags || [];
    const serviceDesc = (service.description || '').toLowerCase();
    
    let matchCount = 0;
    const matchedKeywords: string[] = [];

    keywords.forEach(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      
      // 标签匹配
      if (serviceTags.some(tag => tag.toLowerCase().includes(lowerKeyword))) {
        matchCount++;
        matchedKeywords.push(keyword);
      }
      // 描述匹配
      else if (serviceDesc.includes(lowerKeyword)) {
        matchCount += 0.5;
        matchedKeywords.push(keyword);
      }
    });

    return (matchCount / keywords.length) * 100;
  }

  // 计算响应速度分数
  private calculateResponseScore(responseTime: string): number {
    // 解析响应时间 (例如："30min", "2h", "1 天")
    const match = responseTime.match(/(\d+)(min|h|小时 | 天|day)/i);
    if (!match) return 50;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    // 转换为分钟
    let minutes = value;
    if (unit.includes('h') || unit.includes('小时')) minutes = value * 60;
    if (unit.includes('天') || unit.includes('day')) minutes = value * 24 * 60;

    // 评分 (越快分数越高)
    if (minutes <= 30) return 100;
    if (minutes <= 60) return 90;
    if (minutes <= 120) return 80;
    if (minutes <= 240) return 70;
    if (minutes <= 1440) return 60;
    return 50;
  }

  // 计算价格竞争力分数
  private calculatePriceScore(price: number, budget?: number): number {
    if (!budget) return 70; // 无预算时给平均分

    const ratio = price / budget;
    
    if (ratio <= 0.8) return 100; // 价格低于预算 20%
    if (ratio <= 1.0) return 90;  // 价格在预算内
    if (ratio <= 1.2) return 70;  // 价格略超预算
    if (ratio <= 1.5) return 50;  // 价格超出较多
    return 30; // 价格远超预算
  }

  // 生成匹配理由
  private generateMatchReasons(service: any, keywords: string[], score: number): string[] {
    const reasons: string[] = [];

    // 高分理由
    if (score >= 85) {
      reasons.push('高度匹配您的需求');
    }

    // 评分高
    if (service.rating >= 4.8) {
      reasons.push(`评分优秀 (${service.rating}/5.0)`);
    }

    // 响应快
    if (this.calculateResponseScore(service.response_time) >= 90) {
      reasons.push('响应速度快');
    }

    // 价格优
    if (service.base_price && (!service.budget || service.base_price <= service.budget)) {
      reasons.push('价格在预算内');
    }

    // 完成率高
    if (service.completion_rate >= 95) {
      reasons.push('完成率高达' + service.completion_rate + '%');
    }

    return reasons.slice(0, 4); // 最多 4 个理由
  }

  // 更新权重配置
  updateWeights(weights: Partial<typeof this.weights>): void {
    this.weights = { ...this.weights, ...weights };
    console.log('[AI Matching] 权重已更新:', this.weights);
  }

  // 获取当前权重
  getWeights(): typeof this.weights {
    return { ...this.weights };
  }
}

export const aiMatchingService = AIMatchingService.getInstance();
