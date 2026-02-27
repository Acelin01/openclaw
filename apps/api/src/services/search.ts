import { DatabaseService } from '../lib/db/service.js';
import { Service, SearchFilters } from '@uxin/types';

interface SearchResult {
  services: Service[];
  total: number;
  page: number;
  totalPages: number;
  suggestions: any[];
}

export class SearchService {
  private static instance: SearchService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Search services with full-text search and filtering
   */
  async searchServices(
    query: string,
    filters: SearchFilters = {},
    page: number = 1,
    limit: number = 20,
    sortBy: 'relevance' | 'price' | 'rating' | 'created_at' = 'relevance',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<SearchResult> {
    const offset = (page - 1) * limit;
    
    // Build where conditions
    const where: any = { status: 'ACTIVE' };
    
    // Full-text search on title and description
    if (query && query.trim()) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } }
      ];
    }

    // Category filter
    if (filters.category) {
      where.category = filters.category;
    }

    // Price range filter
    if (filters.minPrice !== undefined) {
      where.priceAmount = { gte: filters.minPrice };
    }
    if (filters.maxPrice !== undefined) {
      where.priceAmount = { ...where.priceAmount, lte: filters.maxPrice };
    }

    // Rating filter
    // Quotations 不包含 rating 字段，这里暂不按评分过滤

    // Service type filter
    if (filters.serviceType) {
      where.priceType = filters.serviceType;
    }

    // Build sort options (DatabaseService 使用 sortBy/sortOrder)
    let sortKey: string = 'createdAt';
    switch (sortBy) {
      case 'price':
        sortKey = 'priceAmount';
        break;
      case 'created_at':
        sortKey = 'createdAt';
        break;
      case 'relevance':
      default:
        // 相关性暂用创建时间排序
        sortKey = 'createdAt';
        break;
    }

    try {
      // Get services using the DatabaseService
      const services = await this.db.getQuotations(where, {
        skip: offset,
        take: limit,
        sortBy: sortKey,
        sortOrder
      });

      // Get total count
      const total = await this.db.getQuotationsCount(where);
      const totalPages = Math.ceil(total / limit);

      // Generate search suggestions
      const suggestions = await this.generateSearchSuggestions(query);

      return {
        services: services as unknown as Service[],
        total,
        page,
        totalPages,
        suggestions
      };
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('搜索服务失败');
    }
  }

  /**
   * Generate search suggestions based on query and popular searches
   */
  private async generateSearchSuggestions(
    query: string
  ): Promise<any[]> {
    const suggestions: any[] = [];

    if (!query || query.trim().length < 2) {
      return suggestions;
    }

    try {
      // Get suggestions from service titles (quotations)
      const quotations = await this.db.getQuotations({
        title: { contains: query, mode: 'insensitive' },
        status: 'ACTIVE'
      }, { take: 5 });

      quotations.forEach((quotation: any) => {
        suggestions.push({
          type: 'service',
          text: quotation.title,
          category: quotation.category,
          relevance: 0.8
        });
      });

      // Get suggestions from categories
      const categories = await this.db.getQuotationCategories();
      const matchingCategories = categories.filter((cat: string) => 
        cat.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3);

      matchingCategories.forEach((category: string) => {
        suggestions.push({
          type: 'category',
          text: category,
          category: category,
          relevance: 0.7
        });
      });

      // Sort by relevance and remove duplicates
      return suggestions
        .sort((a, b) => b.relevance - a.relevance)
        .filter((suggestion, index, self) => 
          index === self.findIndex(s => s.text === suggestion.text)
        )
        .slice(0, 8);
    } catch (error) {
      console.error('Suggestion generation error:', error);
      return suggestions;
    }
  }

  /**
   * Get popular search queries
   */
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    try {
      // This could be enhanced with a search history table
      // For now, return popular service titles and categories
      const popularServices = await this.db.getQuotations({ status: 'ACTIVE' }, { take: limit });
      return popularServices.map((service: any) => service.title);
    } catch (error) {
      console.error('Popular searches error:', error);
      return [];
    }
  }

  /**
   * Get search filters metadata
   */
  async getSearchFilters(): Promise<{
    categories: Array<{id: string; name: string; count: number}>;
    priceRange: {min: number; max: number};
    serviceTypes: Array<{type: string; count: number}>;
  }> {
    try {
      // Get categories from quotations
      const quotations = await this.db.getQuotations({ status: 'ACTIVE' });
      const categories = [...new Set(quotations.map((q: any) => q.category))].map((cat) => ({
        id: cat as string,
        name: cat as string,
        count: quotations.filter((q: any) => q.category === cat).length
      }));
      
      // Calculate price range
      const prices = quotations.map((q: any) => q.priceAmount || 0).filter((p: number) => p > 0);
      const priceRange = {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 1000
      };
      
      // Get service types (price types)
      const serviceTypes = [...new Set(quotations.map((q: any) => q.priceType))].map((type) => ({
        type: type as string,
        count: quotations.filter((q: any) => q.priceType === type).length
      }));

      return {
        categories: categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          count: cat.count
        })),
        priceRange,
        serviceTypes: serviceTypes.map((type: any) => ({
          type: type.type,
          count: type.count
        }))
      };
    } catch (error) {
      console.error('Search filters error:', error);
      return {
        categories: [],
        priceRange: { min: 0, max: 1000 },
        serviceTypes: []
      };
    }
  }
}
