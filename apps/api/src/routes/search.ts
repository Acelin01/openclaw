import { Router, Request, Response } from 'express';
import { SearchService } from '../services/search.js';
import { authenticateToken } from '../middleware/auth.js';
import { prisma } from '../lib/db/index.js';

const router: Router = Router();
const searchService = SearchService.getInstance();

/**
 * Search services with full-text search and filtering
 */
router.get('/services', async (req: Request, res: Response) => {
  try {
    const {
      q: query,
      page = '1',
      limit = '20',
      category,
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = req.query;

    // Validate and parse parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const minPriceNum = minPrice ? parseFloat(minPrice as string) : undefined;
    const maxPriceNum = maxPrice ? parseFloat(maxPrice as string) : undefined;
    const minRatingNum = minRating ? parseFloat(minRating as string) : undefined;

    // Build filters
    const filters = {
      ...(category && { category: category as string }),
      ...(minPriceNum !== undefined && { minPrice: minPriceNum }),
      ...(maxPriceNum !== undefined && { maxPrice: maxPriceNum }),
      ...(minRatingNum !== undefined && { minRating: minRatingNum })
    };

    // Validate sort parameters
    const validSortBy = ['relevance', 'price', 'rating', 'created_at'];
    const validSortOrder = ['asc', 'desc'];
    
    const sortByParam = validSortBy.includes(sortBy as string) ? sortBy as string : 'relevance';
    const sortOrderParam = validSortOrder.includes(sortOrder as string) ? sortOrder as string : 'desc';

    const result = await searchService.searchServices(
      query as string,
      filters,
      pageNum,
      limitNum,
      sortByParam as any,
      sortOrderParam as any
    );

    let services = result.services;

    try {
      if (prisma) {
        const userIds = Array.from(new Set(services.map((s: any) => s.userId).filter(Boolean)));
        const quotationIds = services.map((s: any) => s.id).filter(Boolean);

        const [users, profiles, workerServices] = await Promise.all([
          prisma.user.findMany({ where: { id: { in: userIds } } }),
          prisma.workerProfile.findMany({ where: { userId: { in: userIds } } }),
          prisma.workerService.findMany({
            where: { quotationId: { in: quotationIds } }
          })
        ]);

        const usersById = Object.fromEntries(users.map(u => [u.id, u]));
        const profilesByUserId = Object.fromEntries(profiles.map(p => [p.userId, p]));
        const coverByQuotationId = Object.fromEntries(workerServices.map(ws => [ws.quotationId as string, ws]));

        services = services.map((s: any) => {
          const u = usersById[s.userId];
          const wp = profilesByUserId[s.userId];
          const ws = coverByQuotationId[s.id];
          return {
            ...s,
            coverImageUrl: ws?.coverImageUrl || s.coverImageUrl || '',
            rating: s.rating ?? wp?.rating ?? ws?.rating ?? 0,
            reviewCount: s.reviewCount ?? wp?.reviewCount ?? ws?.reviewCount ?? 0,
            provider: u
              ? {
                  name: u.name,
                  avatarUrl: u.avatarUrl || '',
                  verified: !!u.isVerified,
                  level: wp && typeof wp.rating === 'number' && wp.rating >= 4.8 ? 'Top Rated' : undefined
                }
              : undefined
          };
        });
      }
    } catch (e) {
      console.error('Augment search services failed:', e);
    }

    res.json({
      success: true,
      data: { ...result, services }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: '搜索失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get search suggestions for autocomplete
 */
router.get('/suggestions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { q: query } = req.query;

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      res.json({
        success: true,
        data: { suggestions: [] }
      });
      return;
    }

    // Use the search service to generate suggestions
    const searchResult = await searchService.searchServices(
      query,
      {},
      1,
      1
    );

    res.json({
      success: true,
      data: {
        suggestions: searchResult.suggestions
      }
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: '获取搜索建议失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
});

/**
 * Get popular search queries
 */
router.get('/popular', async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    const limitNum = parseInt(limit as string, 10);

    const popularSearches = await searchService.getPopularSearches(limitNum);

    res.json({
      success: true,
      data: { popularSearches }
    });
  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({
      success: false,
      message: '获取热门搜索失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get search filters metadata
 */
router.get('/filters', async (_req: Request, res: Response) => {
  try {
    const filters = await searchService.getSearchFilters();

    res.json({
      success: true,
      data: filters
    });
  } catch (error) {
    console.error('Search filters error:', error);
    res.status(500).json({
      success: false,
      message: '获取搜索筛选器失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Save search query (requires authentication)
 */
router.post('/save-search', authenticateToken, async (req: any, res: Response): Promise<void> => {
  try {
    const { query } = req.body;
    // const userId = req.user.id;

    if (!query || typeof query !== 'string') {
      res.status(400).json({
        success: false,
        message: '搜索查询不能为空'
      });
      return;
    }

    // Save search to database (you would need to add this to your database schema)
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: '搜索已保存'
    });
  } catch (error) {
    console.error('Save search error:', error);
    res.status(500).json({
      success: false,
      message: '保存搜索失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
