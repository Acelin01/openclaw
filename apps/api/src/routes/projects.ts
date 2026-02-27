import express, { Router } from 'express';
import { Response } from 'express';
import { optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();
const db = DatabaseService.getInstance();

router.post('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    // Allow service requests to specify userId or use a default one
    let userId = req.user?.id || data.userId || (req.isService ? 'seed-user-linyi' : null);

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let projectData: any = {};
    if (typeof data.content === 'string') {
      try {
        const parsed = JSON.parse(data.content);
        projectData = {
          name: parsed.name || parsed.title || 'Untitled Project',
          description: parsed.description || '',
          budgetMin: parsed.budgetMin || (typeof parsed.budget === 'number' ? parsed.budget : undefined),
          budgetMax: parsed.budgetMax,
          tags: parsed.skills || parsed.tags,
          location: parsed.location,
          status: parsed.status || '进行中',
          progress: parsed.progress || 0,
          memberCount: parsed.memberCount || 0,
          dueDate: parsed.dueDate ? new Date(parsed.dueDate) : undefined,
        };
      } catch (e) {
        console.warn('Failed to parse project content JSON', e);
        // Fallback to data fields if parsing fails
        projectData = { ...data };
      }
    } else {
      projectData = { ...data };
    }
    
    // Explicitly select fields for Prisma to avoid unknown field errors
    const prismaData = {
      userId,
      name: projectData.name || projectData.title || 'Untitled Project',
      description: projectData.description || '',
      tags: projectData.tags,
      status: projectData.status,
      location: projectData.location,
      budgetMin: projectData.budgetMin,
      budgetMax: projectData.budgetMax,
      progress: projectData.progress,
      memberCount: projectData.memberCount,
      dueDate: projectData.dueDate,
    };

    const project = await db.createProject(prismaData);

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add a member (user or agent) to a project
router.post('/:id/members', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    const { userId, agentId, role = 'MEMBER' } = req.body;

    if (!projectId) {
      res.status(400).json({ 
        success: false, 
        code: 'bad_request:api',
        message: 'Project ID is required' 
      });
      return;
    }

    if (!userId && !agentId) {
      res.status(400).json({ 
        success: false, 
        code: 'bad_request:api',
        message: 'User ID or Agent ID is required' 
      });
      return;
    }

    // Check if project exists
    const project = await db.getProjectById(projectId);
    if (!project) {
      res.status(404).json({ 
        success: false, 
        code: 'not_found:api',
        message: 'Project not found' 
      });
      return;
    }

    // Add member via DatabaseService
    const prisma = (await import('../lib/db/index.js')).prisma;
    if (!prisma) {
      res.status(500).json({ success: false, message: 'Database not available' });
      return;
    }
    
    const where = userId 
      ? { projectId_userId: { projectId, userId } }
      : { projectId_agentId: { projectId, agentId } };

    const member = await prisma.projectTeamMember.upsert({
      where,
      update: { role },
      create: {
        projectId,
        userId,
        agentId,
        role
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        agent: {
          select: {
            id: true,
            name: true,
            identifier: true,
            prompt: true
          }
        }
      }
    });

    res.json({ success: true, data: member });
  } catch (error) {
    console.error('Add project member error:', error);
    res.status(500).json({
      success: false,
      code: 'database:api',
      message: 'Failed to add project member',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!db.isAvailable()) {
      res.status(503).json({ success: false, message: '数据库连接不可用' });
      return;
    }
    const page = parseInt(String((req.query as any)['page'])) || 1;
    const limit = parseInt(String((req.query as any)['limit'])) || 10;
    const skip = (page - 1) * limit;

    const status = (req.query as any)['status'] as string || undefined;
    const userId = (req.query as any)['userId'] as string || req.user?.id;
    const search = (req.query as any)['search'] as string || (req.query as any)['q'] as string || undefined;

    const where: any = {};
    if (status) where['status'] = status;
    
    // 如果是管理员且没有显式指定 userId，则允许查看所有项目
    const isAdmin = req.user?.role === 'ADMIN' || req.isService;
    const forceFilterByUser = (req.query as any)['userId'] !== undefined;

    // 如果是通过 adminToken 认证的（通常没有 req.user.id），或者具有管理员权限，
    // 且没有强制要求过滤特定用户，则不按 userId 过滤
    if (userId && (forceFilterByUser || !isAdmin)) {
      where['OR'] = [
        { userId: userId },
        { members: { some: { userId: userId } } }
      ];
    } else if (!isAdmin && !userId && !req.user) {
      // 只有在既不是管理员，也没有 userId (认证失败)，且完全没有用户上下文时才返回空
      // 注意：如果 optionalAuthenticateToken 失败，req.user 为空，但如果是管理员 token 认证，我们应该允许
      res.json({
        success: true,
        data: {
          projects: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0
          }
        }
      });
      return;
    }
    if (search) {
      where['OR'] = [
        ...(where['OR'] || []),
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const [list, total] = await Promise.all([
      db.getProjects(where, { skip, take: limit, sortBy: 'createdAt', sortOrder: 'desc' }),
      db.getProjectsCount(where)
    ]);

    res.json({
      success: true,
      data: {
        projects: list,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取项目列表失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取项目任务列表
router.get('/:id/tasks', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    if (!projectId) {
      res.status(400).json({ success: false, message: 'Missing project ID' });
      return;
    }

    const tasks = await db.getProjectTasks({ projectId });
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取项目任务失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取项目成员列表
router.get('/:id/members', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    if (!projectId) {
      res.status(400).json({ success: false, message: 'Missing project ID' });
      return;
    }

    const project = await db.getProjectById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: '项目未找到' });
      return;
    }

    res.json({ success: true, data: project.members || [] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取项目成员失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/:id', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ 
        success: false, 
        code: 'bad_request:api',
        message: 'Missing project ID' 
      });
      return;
    }
    const trimmedId = id.trim();
    let project = await db.getProjectById(trimmedId);
    
    // Fallback for prefixed IDs
    if (!project && trimmedId.startsWith('project-')) {
      const strippedId = trimmedId.replace('project-', '');
      project = await db.getProjectById(strippedId);
      
      if (!project && strippedId.startsWith('proj-')) {
        const doublyStrippedId = strippedId.replace('proj-', '');
        project = await db.getProjectById(doublyStrippedId);
      }
    } else if (!project && trimmedId.startsWith('proj-')) {
      const strippedId = trimmedId.replace('proj-', '');
      project = await db.getProjectById(strippedId);
    }

    if (!project) {
      res.status(404).json({ 
        success: false, 
        code: 'not_found:api',
        message: '项目未找到' 
      });
      return;
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: 'database:api',
      message: '获取项目详情失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.patch('/:id', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Missing project ID' });
      return;
    }

    // Sanitize input to avoid Prisma unknown field errors
    const allowedFields = [
      'name', 'description', 'tags', 'status', 'location', 
      'budgetMin', 'budgetMax', 'progress', 'memberCount', 
      'dueDate', 'startDate', 'endDate', 'milestones', 
      'documents', 'isAdminEnabled', 'adminToken', 'adminConfigs'
    ];
    
    const updateData: any = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      // Return the current project if no valid fields to update
      const current = await db.getProjectById(id);
      res.json({ success: true, data: current });
      return;
    }

    const project = await db.updateProject(id, updateData);
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新项目失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.delete('/:id', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Missing project ID' });
      return;
    }
    await db.deleteProject(id);
    res.json({ success: true, message: '项目已删除' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除项目失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// --- 项目风险相关路由 ---

// 获取项目风险列表
router.get('/:id/risks', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    if (!projectId) {
      res.status(400).json({ success: false, message: 'Missing project ID' });
      return;
    }

    const risks = await db.getProjectRisks(projectId);
    res.json({ success: true, data: risks });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取项目风险失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 创建项目风险
router.post('/:id/risks', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    if (!projectId) {
      res.status(400).json({ success: false, message: 'Missing project ID' });
      return;
    }

    const data = { ...req.body, projectId };
    const risk = await db.createProjectRisk(data);
    res.json({ success: true, data: risk });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建项目风险失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 更新项目风险
router.patch('/risks/:riskId', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { riskId } = req.params;
    if (!riskId) {
      res.status(400).json({ success: false, message: 'Missing risk ID' });
      return;
    }

    const risk = await db.updateProjectRisk(riskId, req.body);
    res.json({ success: true, data: risk });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新项目风险失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 删除项目风险
router.delete('/risks/:riskId', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { riskId } = req.params;
    if (!riskId) {
      res.status(400).json({ success: false, message: 'Missing risk ID' });
      return;
    }

    await db.deleteProjectRisk(riskId);
    res.json({ success: true, message: '项目风险已删除' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除项目风险失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// --- 项目缺陷相关路由 ---

// 获取项目缺陷列表
router.get('/:id/defects', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    if (!projectId) {
      res.status(400).json({ success: false, message: 'Missing project ID' });
      return;
    }

    const defects = await db.getProjectDefects(projectId);
    res.json({ success: true, data: defects });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取项目缺陷失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 创建项目缺陷
router.post('/:id/defects', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    if (!projectId) {
      res.status(400).json({ success: false, message: 'Missing project ID' });
      return;
    }

    const data = { ...req.body, projectId };
    const defect = await db.createProjectDefect(data);
    res.json({ success: true, data: defect });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建项目缺陷失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 更新项目缺陷
router.patch('/defects/:defectId', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { defectId } = req.params;
    if (!defectId) {
      res.status(400).json({ success: false, message: 'Missing defect ID' });
      return;
    }

    const defect = await db.updateProjectDefect(defectId, req.body);
    res.json({ success: true, data: defect });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新项目缺陷失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 删除项目缺陷
router.delete('/defects/:defectId', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { defectId } = req.params;
    if (!defectId) {
      res.status(400).json({ success: false, message: 'Missing defect ID' });
      return;
    }

    await db.deleteProjectDefect(defectId);
    res.json({ success: true, message: '项目缺陷已删除' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除项目缺陷失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// --- 项目里程碑相关路由 ---

// 获取项目里程碑列表
router.get('/:id/milestones', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    if (!projectId) {
      res.status(400).json({ success: false, message: 'Missing project ID' });
      return;
    }

    const milestones = await db.getProjectMilestones(projectId);
    res.json({ success: true, data: milestones });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取项目里程碑失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 创建项目里程碑
router.post('/:id/milestones', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    if (!projectId) {
      res.status(400).json({ success: false, message: 'Missing project ID' });
      return;
    }

    const data = { ...req.body, projectId };
    const milestone = await db.createProjectMilestone(data);
    res.json({ success: true, data: milestone });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建项目里程碑失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 更新项目里程碑
router.patch('/milestones/:milestoneId', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { milestoneId } = req.params;
    if (!milestoneId) {
      res.status(400).json({ success: false, message: 'Missing milestone ID' });
      return;
    }

    const milestone = await db.updateProjectMilestone(milestoneId, req.body);
    res.json({ success: true, data: milestone });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新项目里程碑失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 删除项目里程碑
router.delete('/milestones/:milestoneId', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { milestoneId } = req.params;
    if (!milestoneId) {
      res.status(400).json({ success: false, message: 'Missing milestone ID' });
      return;
    }

    await db.deleteProjectMilestone(milestoneId);
    res.json({ success: true, message: '项目里程碑已删除' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除项目里程碑失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取项目文档列表
router.get('/:id/documents', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    if (!projectId) {
      res.status(400).json({ success: false, message: 'Missing project ID' });
      return;
    }

    if (!db.isAvailable()) {
      res.status(503).json({ success: false, message: '数据库连接不可用' });
      return;
    }

    console.log('Fetching documents for project:', projectId);
    try {
        const documents = await db.getProjectDocuments(projectId);
        console.log('Fetched documents:', documents?.length);
        res.json({ success: true, data: documents });
    } catch (e) {
        console.error('Error fetching documents:', e);
        throw e;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取项目文档失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
