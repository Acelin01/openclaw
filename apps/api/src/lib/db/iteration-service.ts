/**
 * 迭代管理服务
 * 提供迭代的创建、查询、规划、统计等功能
 */

import { prisma } from './index.js';
import type { Iteration } from '@prisma/client';

interface IterationCreateData {
  title: string;
  projectId: string;
  startDate: string;
  endDate: string;
  description?: string;
  goal?: string[];
  ownerId?: string;
}

interface IterationWorkitem {
  id: string;
  type: 'requirement' | 'task' | 'defect';
  title: string;
  status: string;
  priority?: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: number;
}

export class IterationService {
  /**
   * 创建迭代
   */
  async createIteration(data: any) {
    if (!prisma) throw new Error('Database not available');

    // 确保 data 不为 undefined
    if (!data) {
      throw new Error('createIteration: data is undefined');
    }

    console.log('[IterationService.createIteration] Received data:', JSON.stringify(data, null, 2));

    const iteration = await prisma.iteration.create({
      data: {
        name: data.title || data.name || '未命名迭代',
        description: data.description || '',
        goals: data.goal || data.goals || [],
        projectId: data.project_id || data.projectId,
        startDate: new Date(data.start_date || data.startDate),
        endDate: new Date(data.end_date || data.endDate),
        ownerId: data.owner_id || data.ownerId || 'system',
        status: 'PLANNING',
      },
      include: {
        project: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    console.log('[IterationService.createIteration] Created iteration:', iteration.id);
    return iteration;
  }

  /**
   * 查询迭代列表
   */
  async getIterations(where: any = {}, options: any = {}) {
    if (!prisma) return [];

    const { skip = 0, take = 50, sortBy = 'createdAt', sortOrder = 'desc' } = options || {};
    const query: any = {
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        project: true,
      },
    };

    // 支持搜索
    if (where.search) {
      const search = where.search;
      delete query.where.search;
      query.where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.iteration.findMany(query);
  }

  /**
   * 获取迭代列表（带统计）
   */
  async getIterationList(projectId: string, options: any = {}) {
    if (!prisma) return [];

    const { limit = 20 } = options || {};

    const iterations = await prisma.iteration.findMany({
      where: { projectId },
      take: limit,
      orderBy: { startDate: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            requirements: true,
            tasks: true,
            defects: true,
          },
        },
      },
    });

    return iterations.map(iter => ({
      ...iter,
      stats: {
        requirements: iter._count.requirements,
        tasks: iter._count.tasks,
        defects: iter._count.defects,
        total: iter._count.requirements + iter._count.tasks + iter._count.defects,
      },
    }));
  }

  /**
   * 根据 ID 获取迭代
   */
  async getIterationById(id: string) {
    if (!prisma) return null;

    return prisma.iteration.findUnique({
      where: { id },
      include: {
        project: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        requirements: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        defects: {
          select: {
            id: true,
            title: true,
            status: true,
            level: true,
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * 获取迭代概览（统计分析）
   */
  async getIterationOverview(iterationId: string) {
    if (!prisma) return null;

    const iteration = await this.getIterationById(iterationId);
    if (!iteration) return null;

    const requirements = iteration.requirements || [];
    const tasks = iteration.tasks || [];
    const defects = iteration.defects || [];

    // 统计完成情况
    const completedReqs = requirements.filter(r => r.status === 'APPROVED').length;
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;
    const completedDefects = defects.filter(d => d.status === 'CLOSED').length;

    const total = requirements.length + tasks.length + defects.length;
    const completed = completedReqs + completedTasks + completedDefects;

    return {
      id: iteration.id,
      name: iteration.name,
      description: iteration.description,
      goals: iteration.goals as string[] || [],
      status: iteration.status.toLowerCase(),
      startDate: iteration.startDate.getTime(),
      endDate: iteration.endDate.getTime(),
      owner: iteration.owner,
      stats: {
        total,
        requirements: requirements.length,
        tasks: tasks.length,
        defects: defects.length,
        completed,
        inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        todo: total - completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
      workitems: {
        requirements,
        tasks,
        defects,
      },
    };
  }

  /**
   * 获取迭代统计数据
   */
  async getIterationStats(iterationId: string, options: any = {}) {
    if (!prisma) return null;

    const overview = await this.getIterationOverview(iterationId);
    if (!overview) return null;

    const stats = overview.stats;

    return {
      total: stats.total,
      byType: {
        requirements: stats.requirements,
        tasks: stats.tasks,
        defects: stats.defects,
      },
      byStatus: {
        completed: stats.completed,
        inProgress: stats.inProgress,
        todo: stats.todo,
      },
      completionRate: stats.completionRate,
      trend: options.include_trend ? {
        // 可以添加趋势数据
        daily: [],
        weekly: [],
      } : undefined,
    };
  }

  /**
   * 获取迭代工作项
   */
  async getIterationWorkitems(iterationId: string, options: any = {}) {
    if (!prisma) return [];

    const { type = 'all', status, assignee_id, limit = 100 } = options || {};
    const workitems: any[] = [];

    // 查询需求
    if (type === 'all' || type === 'requirement') {
      const requirements = await prisma.projectRequirement.findMany({
        where: {
          iterationId,
          ...(status && { status }),
          ...(assignee_id && { assigneeId: assignee_id }),
        },
        take: limit,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      workitems.push(...requirements.map(r => ({
        id: r.id,
        type: 'requirement' as const,
        title: r.title,
        status: r.status,
        priority: r.priority,
        assignee: r.assignee,
        createdAt: r.createdAt.getTime(),
      })));
    }

    // 查询任务
    if (type === 'all' || type === 'task') {
      const tasks = await prisma.projectTask.findMany({
        where: {
          iterationId,
          ...(status && { status }),
          ...(assignee_id && { assigneeId: assignee_id }),
        },
        take: limit,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      workitems.push(...tasks.map(t => ({
        id: t.id,
        type: 'task' as const,
        title: t.title,
        status: t.status,
        priority: t.priority,
        assignee: t.assignee,
        createdAt: t.createdAt.getTime(),
      })));
    }

    // 查询缺陷
    if (type === 'all' || type === 'defect') {
      const defects = await prisma.projectDefect.findMany({
        where: {
          iterationId,
          ...(status && { status }),
          ...(assignee_id && { assigneeId: assignee_id }),
        },
        take: limit,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      workitems.push(...defects.map(d => ({
        id: d.id,
        type: 'defect' as const,
        title: d.title,
        status: d.status,
        priority: d.severity,
        assignee: d.assignee,
        createdAt: d.createdAt.getTime(),
      })));
    }

    // 按创建时间排序
    workitems.sort((a, b) => b.createdAt - a.createdAt);

    return workitems.slice(0, limit);
  }

  /**
   * 获取迭代工作项统计
   */
  async getIterationWorkitemStats(iterationId: string, options: any = {}) {
    if (!prisma) return null;

    const { group_by = 'type' } = options || {};
    const workitems = await this.getIterationWorkitems(iterationId, { type: 'all' });

    // 按类型分组
    if (group_by === 'type') {
      return {
        requirements: workitems.filter(w => w.type === 'requirement').length,
        tasks: workitems.filter(w => w.type === 'task').length,
        defects: workitems.filter(w => w.type === 'defect').length,
        total: workitems.length,
      };
    }

    // 按状态分组
    if (group_by === 'status') {
      const byStatus: any = {};
      workitems.forEach(w => {
        byStatus[w.status] = (byStatus[w.status] || 0) + 1;
      });
      return byStatus;
    }

    // 按优先级分组
    if (group_by === 'priority') {
      const byPriority: any = {};
      workitems.forEach(w => {
        const priority = w.priority || 'UNSET';
        byPriority[priority] = (byPriority[priority] || 0) + 1;
      });
      return byPriority;
    }

    // 按负责人分组
    if (group_by === 'assignee') {
      const byAssignee: any = {};
      workitems.forEach(w => {
        const assignee = w.assignee?.email || 'UNASSIGNED';
        byAssignee[assignee] = (byAssignee[assignee] || 0) + 1;
      });
      return byAssignee;
    }

    return null;
  }

  /**
   * 迭代规划（批量关联工作项）
   * 工作项包括：需求、任务、缺陷
   */
  async planIteration(iterationId: string, options: {
    requirement_ids?: string[];
    task_ids?: string[];
    defect_ids?: string[];
  }) {
    if (!prisma) throw new Error('Database not available');

    const results = {
      requirements: 0,
      tasks: 0,
      defects: 0,
    };

    // 批量关联需求
    if (options.requirement_ids && options.requirement_ids.length > 0) {
      const result = await prisma.projectRequirement.updateMany({
        where: {
          id: { in: options.requirement_ids },
        },
        data: { iterationId },
      });
      results.requirements = result.count;
    }

    // 批量关联任务
    if (options.task_ids && options.task_ids.length > 0) {
      const result = await prisma.projectTask.updateMany({
        where: {
          id: { in: options.task_ids },
        },
        data: { iterationId },
      });
      results.tasks = result.count;
    }

    // 批量关联缺陷
    if (options.defect_ids && options.defect_ids.length > 0) {
      const result = await prisma.projectDefect.updateMany({
        where: {
          id: { in: options.defect_ids },
        },
        data: { iterationId },
      });
      results.defects = result.count;
    }

    return {
      success: true,
      ...results,
      total: results.requirements + results.tasks + results.defects,
    };
  }

  /**
   * 更新迭代
   */
  async updateIteration(id: string, data: Partial<Iteration>) {
    if (!prisma) throw new Error('Database not available');

    return prisma.iteration.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除迭代
   */
  async deleteIteration(id: string) {
    if (!prisma) throw new Error('Database not available');

    return prisma.iteration.delete({
      where: { id },
    });
  }
}

export default IterationService;
