import express, { Router } from 'express';
import { Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();
const db = DatabaseService.getInstance();

/**
 * MCP 工具调用端点
 * 用于从前端调用 uxin-mcp 技能服务中的工具
 */
router.post('/call-tool', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { tool_name, arguments: args } = req.body;

    if (!tool_name) {
      res.status(400).json({ success: false, message: '缺少工具名称' });
      return;
    }

    console.log(`[MCP] 调用工具：${tool_name}, 参数：`, args);

    let result;

    // 根据工具名称调用对应的数据库方法
    switch (tool_name) {
      case 'requirement_list':
        // 调用 uxin-mcp requirement_list 工具
        result = await db.getProjectRequirements({
          projectId: args.project_id,
          status: args.status,
          priority: args.priority
        }, {
          skip: args.offset || 0,
          take: args.limit || 50
        });
        break;

      case 'requirement_query':
        // 查询单个需求
        result = await db.getProjectRequirementById(args.requirement_id);
        break;

      case 'requirement_create':
        // 创建需求
        result = await db.createProjectRequirement({
          ...args,
          reporterId: req.user?.id
        });
        break;

      case 'requirement_update':
        // 更新需求
        result = await db.updateProjectRequirement(args.requirement_id, args);
        break;

      case 'collaboration_create':
        // 创建项目协作
        result = await db.createProjectCollaboration({
          ...args,
          creatorId: req.user?.id
        });
        break;

      case 'collaboration_members':
        // 获取协作者列表
        result = await db.getCollaborationMembers(args.project_id);
        break;

      case 'task_assign':
        // 分配任务
        result = await db.assignTask(args.task_id, args.user_id);
        break;

      case 'task_list':
        // 获取任务列表
        result = await db.getProjectTasks({
          projectId: args.project_id,
          requirementId: args.requirement_id
        });
        break;

      default:
        res.status(404).json({ 
          success: false, 
          message: `未知的 MCP 工具：${tool_name}` 
        });
        return;
    }

    console.log(`[MCP] 工具 ${tool_name} 执行成功，返回结果：`, result);

    res.json({ 
      success: true, 
      data: result,
      tool: tool_name
    });

  } catch (error) {
    console.error(`[MCP] 工具调用失败:`, error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'MCP 工具调用失败',
      error: error instanceof Error ? error.stack : undefined
    });
  }
});

/**
 * 获取可用的 MCP 工具列表
 */
router.get('/tools', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tools = [
      {
        name: 'requirement_list',
        description: '查询需求列表',
        parameters: {
          project_id: '项目 ID (必填)',
          status: '状态 (可选)',
          priority: '优先级 (可选)',
          limit: '数量限制 (可选)',
          offset: '偏移量 (可选)'
        }
      },
      {
        name: 'requirement_query',
        description: '查询单个需求详情',
        parameters: {
          requirement_id: '需求 ID (必填)'
        }
      },
      {
        name: 'requirement_create',
        description: '创建新需求',
        parameters: {
          title: '标题 (必填)',
          description: '描述 (可选)',
          priority: '优先级 (可选)',
          project_id: '项目 ID (可选)'
        }
      },
      {
        name: 'requirement_update',
        description: '更新需求',
        parameters: {
          requirement_id: '需求 ID (必填)',
          title: '标题 (可选)',
          description: '描述 (可选)',
          status: '状态 (可选)',
          priority: '优先级 (可选)'
        }
      },
      {
        name: 'collaboration_create',
        description: '创建项目协作',
        parameters: {
          project_id: '项目 ID',
          member_ids: '成员 ID 列表'
        }
      },
      {
        name: 'collaboration_members',
        description: '获取协作者列表',
        parameters: {
          project_id: '项目 ID (必填)'
        }
      },
      {
        name: 'task_assign',
        description: '分配任务',
        parameters: {
          task_id: '任务 ID (必填)',
          user_id: '用户 ID (必填)'
        }
      },
      {
        name: 'task_list',
        description: '获取任务列表',
        parameters: {
          project_id: '项目 ID (可选)',
          requirement_id: '需求 ID (可选)'
        }
      }
    ];

    res.json({ success: true, tools });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : '获取工具列表失败' 
    });
  }
});

export default router;
