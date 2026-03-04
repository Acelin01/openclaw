/**
 * 里程碑 Artifact 预览处理器
 * 用于在 Chat-Lite 中显示里程碑组件预览
 */

import type { Milestone, MilestoneListContent } from './list-element';
import type { MilestoneDetailContent } from './detail-element';
import type { MilestoneCreateData } from './create-element';

/**
 * 创建里程碑列表预览数据
 */
export function createMilestoneListPreview(
  projectId: string,
  title: string = '里程碑列表'
): MilestoneListContent {
  return {
    kind: 'milestone-list',
    title,
    projectId,
    milestones: [
      {
        id: 'ms-001',
        title: '用户界面重构',
        description: '完成新版用户界面的设计和开发',
        status: 'progress',
        assignee: {
          id: 'user-001',
          name: 'User 001',
          email: 'user-001@uxin.ai'
        },
        dueDate: '2026-03-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ms-002',
        title: '核心功能开发',
        description: '开发产品核心功能模块',
        status: 'notstarted',
        assignee: {
          id: 'user-002',
          name: 'User 002',
          email: 'user-002@uxin.ai'
        },
        dueDate: '2026-03-15',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ms-003',
        title: '测试用例编写',
        description: '编写完整的测试用例',
        status: 'completed',
        assignee: {
          id: 'user-003',
          name: 'User 003',
          email: 'user-003@uxin.ai'
        },
        dueDate: '2026-02-28',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  };
}

/**
 * 创建里程碑详情预览数据
 */
export function createMilestoneDetailPreview(
  milestoneId: string
): MilestoneDetailContent {
  return {
    kind: 'milestone-detail',
    milestone: {
      id: milestoneId,
      title: '用户界面重构',
      description: '完成新版用户界面的设计和开发，提升用户体验。包括：\n\n1. 重新设计用户界面\n2. 优化交互流程\n3. 提升视觉体验\n4. 适配移动端设备',
      status: 'progress',
      assignee: {
        id: 'user-001',
        name: 'User 001',
        email: 'user-001@uxin.ai',
        avatarUrl: undefined
      },
      dueDate: '2026-03-01',
      projectId: '03e88668-5cac-4112-8287-3f3f6c7b9e7d',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
}

/**
 * 创建里程碑新建预览数据
 */
export function createMilestoneCreatePreview(
  projectId: string
): { kind: 'milestone-create'; data: { projectId: string } } {
  return {
    kind: 'milestone-create',
    data: {
      projectId
    }
  };
}

/**
 * 获取所有预览类型
 */
export type MilestonePreviewType = 'list' | 'detail' | 'create';

/**
 * 创建预览数据
 */
export function createMilestonePreview(
  type: MilestonePreviewType,
  projectId: string = '03e88668-5cac-4112-8287-3f3f6c7b9e7d',
  milestoneId: string = 'ms-001'
): MilestoneListContent | MilestoneDetailContent | { kind: 'milestone-create'; data: { projectId: string } } {
  switch (type) {
    case 'list':
      return createMilestoneListPreview(projectId);
    case 'detail':
      return createMilestoneDetailPreview(milestoneId);
    case 'create':
      return createMilestoneCreatePreview(projectId);
    default:
      return createMilestoneListPreview(projectId);
  }
}
