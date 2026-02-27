import express, { Router } from 'express';
import { Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';
import { getChatsByUserId, getChatById, getMessagesByChatId } from '../lib/db/queries.js';

const router: Router = express.Router();

// 获取消息线程列表（当前用户）
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(503).json({ success: false, message: '数据库连接不可用' });
    }
    const requestedUserId = (req.query as any)['userId'] as string | undefined;
    const userId = req.user?.role === 'ADMIN' && requestedUserId ? requestedUserId : req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: '未认证用户' });
    }
    console.log(`[MessagesRoute] Database isAvailable: ${db.isAvailable()}`);
    const { chats } = await getChatsByUserId({ id: userId as string, limit: 100 });

    console.log(`[MessagesRoute] Fetching threads for userId: ${userId}`);
    console.log(`[MessagesRoute] Found ${chats?.length || 0} AI chats`);

    // AI Chat 线程
    const aiThreads = await Promise.all((chats || []).map(async (c: any) => {
      let lastMsg: any = undefined;
      try {
        const msgs = await getMessagesByChatId({ id: c.id });
        lastMsg = msgs.at(-1);
      } catch {}
      const title = c?.title || c?.context?.contactName || 'AI 助手';
      const preview = Array.isArray(lastMsg?.parts)
        ? (lastMsg.parts as any[])
            .map((p: any) => (p?.type === 'text' ? p.text : ''))
            .join(' ')
        : (lastMsg?.content || '');
      let unreadCount = 0;
      try {
        const notifs = await db.getNotifications({ userId }, { orderBy: { createdAt: 'desc' } });
        unreadCount = (notifs || []).filter((n: any) => n.type === 'MESSAGE' && !n.read && String(n.content || '') === c.id).length;
      } catch {}
      return {
        id: c.id,
        title,
        preview,
        lastTime: lastMsg?.createdAt || c?.updatedAt || c?.createdAt,
        online: !!c?.context?.onlineStatus,
        context: { ...c?.context, type: 'AI' },
        unreadCount,
      };
    }));

    // 用户对话线程 (从 Message 模型中聚合)
    console.log(`[MessagesRoute] Querying messages with where:`, JSON.stringify({
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }));
    const userMessages = (await db.getMessages({
      OR: [
        { senderId: userId as string },
        { receiverId: userId as string }
      ]
    }, { orderBy: { createdAt: 'desc' } })) as any[];

    console.log(`[MessagesRoute] Found ${userMessages?.length || 0} user messages for userId: ${userId}`);
    if (userMessages?.length > 0) {
      console.log(`[MessagesRoute] Sample user message:`, JSON.stringify(userMessages[0]));
    } else {
      // 如果没有找到消息，尝试查询数据库中是否有任何消息
      const totalMessages = await db.getMessages({}, { take: 5 });
      console.log(`[MessagesRoute] Total messages in DB (first 5):`, JSON.stringify(totalMessages));
    }

    // 聚合对话
    const conversationMap = new Map<string, any>();
    for (const msg of userMessages) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!otherId) continue;
      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, {
          lastMsg: msg,
          unreadCount: (!msg.read && msg.receiverId === userId) ? 1 : 0
        });
      } else {
        if (!msg.read && msg.receiverId === userId) {
          conversationMap.get(otherId).unreadCount++;
        }
      }
    }

    const userThreads = await Promise.all(Array.from(conversationMap.entries()).map(async ([otherId, data]) => {
      const otherUser = await db.getUserById(otherId);
      return {
        id: otherId,
        title: otherUser?.name || '用户',
        preview: data.lastMsg.content,
        lastTime: data.lastMsg.createdAt,
        online: false, // 暂时硬编码
        context: { type: 'USER', avatar: otherUser?.avatarUrl },
        unreadCount: data.unreadCount,
      };
    }));

    // 合并并排序
    const allThreads = [...aiThreads, ...userThreads].sort((a, b) => 
      new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()
    );

    const unreadTotal = await db.getUnreadNotificationCount(userId);

    return res.json({
      success: true,
      data: { threads: allThreads, unreadTotal },
      message: '消息线程获取成功'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '获取消息线程失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取单个会话的消息列表（基于 chatId 或 contactId）
router.get('/:chatId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(503).json({ success: false, message: '数据库连接不可用' });
    }
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: '未认证用户' });
    }
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ success: false, message: '会话ID不能为空' });
    }
    
    // 尝试获取 AI Chat
    const chat = await getChatById({ id: chatId });
    if (chat) {
      if (chat.userId !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: '无权访问该会话' });
      }
      const messages = await getMessagesByChatId({ id: chatId });
      return res.json({
         success: true,
         data: {
           messages,
           context: chat.lastContext
         }
       });
    }

    // 如果不是 AI Chat，可能是用户对话
    const userMessages = await db.getMessages({
      OR: [
        { senderId: userId as string, receiverId: chatId },
        { senderId: chatId, receiverId: userId as string }
      ]
    }, { orderBy: { createdAt: 'asc' } });

    if (userMessages.length > 0) {
      return res.json({
        success: true,
        data: {
          messages: userMessages.map((m: any) => ({
            id: m.id,
            role: m.senderId === userId ? 'user' : 'assistant',
            content: m.content,
            createdAt: m.createdAt
          })),
          context: { type: 'USER' }
        }
      });
    }

    return res.status(404).json({ success: false, message: '未找到相关会话' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '获取消息失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 标记会话消息为已读，并清除未读通知
router.put('/:chatId/read', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(503).json({ success: false, message: '数据库连接不可用' });
    }
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: '未认证用户' });
    }
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ success: false, message: '会话ID不能为空' });
    }
    
    // 清除消息通知
    const chat = await getChatById({ id: chatId });
    if (!chat) {
      return res.status(404).json({ success: false, message: '会话不存在' });
    }
    
    if (chat.userId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: '无权操作该会话' });
    }
    
    await db.markMessagesAsRead(chatId, userId);
    await db.markChatNotificationsAsRead(userId, chatId);
    
    return res.json({ success: true, message: '已清除未读消息' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '操作失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取与特定联系人的对话
router.get('/conversation/:contactId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(503).json({ success: false, message: '数据库连接不可用' });
    }
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: '未认证用户' });
    }
    const { contactId } = req.params;
    if (!contactId) {
      return res.status(400).json({ success: false, message: '联系人ID不能为空' });
    }
    
    const messages = await db.getMessages({
      OR: [
        { senderId: userId, receiverId: contactId },
        { senderId: contactId, receiverId: userId }
      ]
    }, { orderBy: { createdAt: 'asc' } });
    
    return res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '获取对话失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 发送私信
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(503).json({ success: false, message: '数据库连接不可用' });
    }
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: '未认证用户' });
    }
    const { receiverId, content } = req.body;
    if (!receiverId || !content) {
      return res.status(400).json({ success: false, message: '接收者ID和内容不能为空' });
    }
    
    const message = await db.createMessage({
      senderId: userId,
      receiverId,
      content,
      type: 'TEXT'
    });
    
    return res.json({
      success: true,
      data: message
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '发送消息失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
