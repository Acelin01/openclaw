import express, { Router } from 'express';
import { Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();

// 获取当前用户的通知列表
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestedUserId = (req.query as any)['userId'] as string | undefined;
    const userId = req.user?.role === 'ADMIN' && requestedUserId ? requestedUserId : req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: '未认证用户' });
    }
    const page = parseInt((req.query as any)['page'] as string) || 1;
    const limit = parseInt((req.query as any)['limit'] as string) || 20;
    const skip = (page - 1) * limit;
    const db = DatabaseService.getInstance();
    const rawNotifications = await db.getNotifications({ userId }, { take: limit, skip, orderBy: { createdAt: 'desc' } });
    const unreadCount = await db.getUnreadNotificationCount(userId);

    // 映射通知数据，适配前端需求
    const notifications = rawNotifications.map((n: any) => ({
      ...n,
      isRead: n.read, // 适配前端 isRead 属性
      actionUrl: n.metadata?.actionUrl || (n.metadata?.jumpTo === 'ai-chat' ? `/ai-assistant?conversationId=${n.metadata?.conversationId}` : undefined)
    }));

    return res.json({
      success: true,
      data: { notifications, unreadCount },
      message: '通知列表获取成功'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '获取通知失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 标记单条通知为已读（占位）
router.put('/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      return res.status(401).json({ success: false, message: '未认证用户' });
    }
    if (!id) {
      return res.status(400).json({ success: false, message: '通知ID不能为空' });
    }
    const db = DatabaseService.getInstance();
    const notif = await db.getNotificationById(id);
    if (!notif) {
      return res.status(404).json({ success: false, message: '通知不存在' });
    }
    if ((notif as any).userId !== userId) {
      return res.status(403).json({ success: false, message: '无权操作该通知' });
    }
    await db.markNotificationAsRead(id);
    return res.json({ success: true, message: '通知标记为已读' });
  } catch (error) {
    return res.status(500).json({ success: false, message: '标记通知失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 标记所有通知为已读（占位）
router.put('/read-all', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: '未认证用户' });
    }
    const db = DatabaseService.getInstance();
    await db.markAllNotificationsAsRead(userId);
    return res.json({ success: true, message: '全部通知标记为已读' });
  } catch (error) {
    return res.status(500).json({ success: false, message: '标记全部通知失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
