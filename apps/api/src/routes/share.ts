import express, { Router } from 'express';
import { Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();
const db = DatabaseService.getInstance();

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const body = req.body || {};
    const targetType = String(body.targetType || '').toUpperCase();
    const targetId = String(body.targetId || '');
    const templateId = String(body.templateId || '');
    if (!targetType || !targetId) { res.status(400).json({ success: false, message: '缺少目标类型或ID' }); return; }
    const share = await db.createShareLink({ targetType, targetId, templateId: templateId || undefined, expireAt: body.expireAt || undefined });
    if (templateId) await db.incrementTemplateUsage(templateId);
    res.json({ success: true, data: share, message: '分享链接创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '创建分享链接失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/:token', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.params as { token: string };
    const share = await db.getShareLinkByToken(token);
    if (!share) { res.status(404).json({ success: false, message: '分享链接不存在' }); return; }
    const tpl = share.templateId ? await db.getTemplateById(String(share.templateId)) : null;
    let target: any = null;
    if (share.targetType === 'INQUIRY') {
      target = await db.getInquiryById(share.targetId);
    } else if (share.targetType === 'QUOTATION') {
      target = await db.getQuotationById(share.targetId);
    } else if (share.targetType === 'PROJECT') {
      target = await db.getProjectById(share.targetId);
    } else if (share.targetType === 'POSITION') {
      target = await db.getPositionById(share.targetId);
    } else if (share.targetType === 'RESUME') {
       target = await db.getResumeById(share.targetId);
     } else if (share.targetType === 'SERVICE') {
       target = await db.getQuotationById(share.targetId);
     } else if (share.targetType === 'REQUIREMENT') {
       target = await db.getInquiryById(share.targetId);
     } else if (share.targetType === 'MATCHING') {
       target = await db.getTaskById(share.targetId);
     }
    if (!target) { res.status(404).json({ success: false, message: '分享目标不存在' }); return; }
    res.json({ success: true, data: { share, template: tpl, target }, message: '分享数据获取成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取分享数据失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
