import express, { Router } from 'express';
import { Response } from 'express';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();
const db = DatabaseService.getInstance();

router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(String((req.query as any)['page'])) || 1;
    const limit = parseInt(String((req.query as any)['limit'])) || 10;
    const skip = (page - 1) * limit;
    const type = String((req.query as any)['type'] || '') || undefined;
    const status = String((req.query as any)['status'] || '') || undefined;
    const where: any = {};
    if (type) where['type'] = type;
    if (status) where['status'] = status;
    const [list, total] = await Promise.all([
      db.getTemplates(where, { skip, take: limit, orderBy: { updatedAt: 'desc' } }),
      db.getTemplatesCount(where)
    ]);
    res.json({ success: true, data: { templates: list, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } } });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取模版列表失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const tpl = await db.getTemplateById(id);
    if (!tpl) { res.status(404).json({ success: false, message: '模版不存在' }); return; }
    res.json({ success: true, data: tpl });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取模版详情失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const body = req.body || {};
    const created = await db.createTemplate({
      name: body.name,
      type: body.type,
      schemaVersion: body.schemaVersion || '1.0.0',
      styleAssets: body.styleAssets || {},
      status: body.status || 'ACTIVE'
    });
    res.json({ success: true, data: created, message: '模版创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '创建模版失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.patch('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const updated = await db.updateTemplate(id, req.body || {});
    if (!updated) { res.status(404).json({ success: false, message: '模版不存在' }); return; }
    res.json({ success: true, data: updated, message: '模版更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新模版失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const ok = await db.deleteTemplate(id);
    if (!ok) { res.status(404).json({ success: false, message: '模版不存在或已删除' }); return; }
    res.json({ success: true, message: '模版删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除模版失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/:id/usage', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const updated = await db.incrementTemplateUsage(id);
    if (!updated) { res.status(404).json({ success: false, message: '模版不存在' }); return; }
    res.json({ success: true, data: updated, message: '使用次数已更新' });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新使用次数失败', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
