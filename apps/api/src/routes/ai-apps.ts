import express from 'express';
import { DatabaseService } from '../lib/db/service.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const db = DatabaseService.getInstance();

// 获取所有 AI 应用
router.get('/', async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status as string;
    if (type) where.type = type as string;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const apps = await db.getAIApps(where, {
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });
    res.json({ success: true, data: apps, page, limit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取用户的 AI 应用
router.get('/user', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const userApps = await db.getUserAIApps(userId);
    res.json({ success: true, data: userApps });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取单个 AI 应用详情
router.get('/:id', async (req, res) => {
  try {
    const app = await db.getAIAppById(req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'App not found' });
    }
    return res.json({ success: true, data: app });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 添加 AI 应用到用户
router.post('/user', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { appId, isDefault } = req.body;
    const result = await db.addUserAIApp(userId, appId, isDefault);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
