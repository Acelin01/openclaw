import express, { Router, Response } from 'express';
import { Server } from 'socket.io';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../lib/db/index.js';

const router: Router = express.Router();

router.post('/notify', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const io = req.app.get('io') as Server;
    if (!io) {
      res.status(500).json({ success: false, message: 'Socket 服务未初始化' });
      return;
    }

    const { userId, type = 'info', title = '测试通知', content = '这是一条测试通知', actionUrl } = req.body || {};
    const targetUserId = userId || req.user?.id;

    if (!targetUserId) {
      res.status(400).json({ success: false, message: '缺少目标用户ID' });
      return;
    }

    io.to(`user:${targetUserId}`).emit('notification', {
      type,
      title,
      content,
      actionUrl
    });

    res.json({ success: true, message: '通知已发送', data: { userId: targetUserId } });
  } catch (error) {
    res.status(500).json({ success: false, message: '触发通知失败' });
  }
});

router.post('/order-update', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const io = req.app.get('io') as Server;
    if (!io) {
      res.status(500).json({ success: false, message: 'Socket 服务未初始化' });
      return;
    }

    const { userId, orderId = `ORDER-${Date.now()}`, status = 'COMPLETED' } = req.body || {};
    const targetUserId = userId || req.user?.id;

    if (!targetUserId) {
      res.status(400).json({ success: false, message: '缺少目标用户ID' });
      return;
    }

    io.to(`user:${targetUserId}`).emit('order-update', {
      orderId,
      status
    });

    res.json({ success: true, message: '订单更新事件已发送', data: { userId: targetUserId, orderId, status } });
  } catch (error) {
    res.status(500).json({ success: false, message: '触发订单更新失败' });
  }
});

export default router;

router.post('/seed', authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const adminEmail = 'admin@example.com';
    const admin = await prisma?.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: { email: adminEmail, name: 'Admin', role: 'ADMIN', password: '' }
    });
    const key = process.env['DASHSCOPE_API_KEY'] || process.env['ALIBABA_API_KEY'] || '';
    if (key) {
      const exists = await prisma?.aIProviderKey.findFirst({ where: { userId: admin?.id, provider: 'deepseek', region: process.env['DASHSCOPE_REGION'] || 'cn' } });
      if (!exists) {
        await prisma?.aIProviderKey.create({ data: { userId: admin?.id, provider: 'deepseek', apiKey: key, region: process.env['DASHSCOPE_REGION'] || 'cn', active: true } });
      }
    }
    res.json({ success: true, message: '种子数据执行完成', data: { adminId: admin?.id } });
  } catch (error) {
    res.status(500).json({ success: false, message: '种子数据执行失败' });
  }
});

router.post('/seed/linyi', authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    if (!prisma) {
      res.status(500).json({ success: false, message: '数据库未连接' });
      return;
    }

    const email = 'linyi@renrenvc.com';
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(404).json({ success: false, message: '用户 linyi@renrenvc.com 不存在，请先运行主种子脚本' });
      return;
    }

    console.log('Starting seeding Linyi analysis data via API...');

    // 1. 创建项目
    const project = await (prisma as any).project.upsert({
      where: { id: 'seed-project-linyi-analysis' },
      update: {
        name: '核心业务分析项目',
        description: '这是一个针对核心业务进行深度分析和报告生成的种子项目。',
        userId: user.id,
        status: '进行中',
        progress: 30,
      },
      create: {
        id: 'seed-project-linyi-analysis',
        name: '核心业务分析项目',
        description: '这是一个针对核心业务进行深度分析和报告生成的种子项目。',
        userId: user.id,
        status: '进行中',
        progress: 30,
      },
    });

    // 2. 创建需求
    const reqAData = {
      projectId: project.id,
      title: '用户增长画像分析',
      description: '分析核心用户的行为特征，构建多维度画像。',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
    };
    const requirementA = await (prisma as any).projectRequirement.upsert({
      where: { id: 'seed-req-linyi-1' },
      update: reqAData,
      create: { ...reqAData, id: 'seed-req-linyi-1' },
    });

    const reqBData = {
      projectId: project.id,
      title: '自动化投后报告系统',
      description: '实现投后管理报告的自动收集与定期生成。',
      priority: 'MEDIUM',
      status: 'PENDING',
    };
    await (prisma as any).projectRequirement.upsert({
      where: { id: 'seed-req-linyi-2' },
      update: reqBData,
      create: { ...reqBData, id: 'seed-req-linyi-2' },
    });

    // 3. 创建任务
    const tasks = [
      {
        id: 'seed-ptask-linyi-1',
        requirementId: requirementA.id,
        title: '基础数据清洗',
        description: '处理原始日志中的缺失值和异常值',
        priority: 'HIGH',
        status: 'COMPLETED',
        progress: 100,
      },
      {
        id: 'seed-ptask-linyi-2',
        requirementId: requirementA.id,
        title: '特征工程构建',
        description: '提取用户活跃度、留存率等关键特征',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        progress: 40,
      },
    ];

    for (const task of tasks) {
      const { id, ...data } = task;
      await (prisma as any).projectTask.upsert({
        where: { id },
        update: { ...data, projectId: project.id },
        create: { ...data, id, projectId: project.id },
      });
    }

    // 4. 创建智能体
    const agentAnalysis = await (prisma as any).agent.upsert({
      where: { id: 'seed-agent-linyi-analysis' },
      update: {
        name: '数据分析专家',
        identifier: 'data-analysis-expert',
        prompt: '你是一个资深的数据分析专家，擅长使用Python和SQL进行复杂的数据挖掘和画像构建。',
        mermaid: 'graph TD; A[原始数据] --> B{数据清洗}; B --> C[特征提取]; C --> D[模型训练];',
        userId: user.id,
        projects: { set: [{ id: project.id }] },
      },
      create: {
        id: 'seed-agent-linyi-analysis',
        name: '数据分析专家',
        identifier: 'data-analysis-expert',
        prompt: '你是一个资深的数据分析专家，擅长使用Python和SQL进行复杂的数据挖掘和画像构建。',
        mermaid: 'graph TD; A[原始数据] --> B{数据清洗}; B --> C[特征提取]; C --> D[模型训练];',
        userId: user.id,
        projects: { connect: [{ id: project.id }] },
      },
    });

    const agentReport = await (prisma as any).agent.upsert({
      where: { id: 'seed-agent-linyi-report' },
      update: {
        name: '报告生成助手',
        identifier: 'report-gen-helper',
        prompt: '你是一个高效的报告助手，擅长整理业务指标并生成精美的Markdown或PDF报告。',
        mermaid: 'graph LR; A[指标收集] --> B[内容撰写]; B --> C[排版优化];',
        userId: user.id,
        projects: { set: [{ id: project.id }] },
      },
      create: {
        id: 'seed-agent-linyi-report',
        name: '报告生成助手',
        identifier: 'report-gen-helper',
        prompt: '你是一个高效的报告助手，擅长整理业务指标并生成精美的Markdown或PDF报告。',
        mermaid: 'graph LR; A[指标收集] --> B[内容撰写]; B --> C[排版优化];',
        userId: user.id,
        projects: { connect: [{ id: project.id }] },
      },
    });

    // 5. 建立关联 (Requirement -> Agents)
    await (prisma as any).projectRequirement.update({
      where: { id: requirementA.id },
      data: {
        agents: {
          connect: [{ id: agentAnalysis.id }],
        },
      },
    });

    // 6. 添加到通讯录
    const contacts = [
      { agentId: agentAnalysis.id, isStarred: true },
      { agentId: agentReport.id, isStarred: false },
    ];

    for (const contact of contacts) {
      await (prisma as any).userContact.upsert({
        where: { userId_agentId: { userId: user.id, agentId: contact.agentId } },
        update: { isStarred: contact.isStarred },
        create: {
          userId: user.id,
          agentId: contact.agentId,
          groupName: '我的智能体',
          isStarred: contact.isStarred,
        },
      });
    }

    res.json({ success: true, message: 'Linyi 种子数据执行完成', data: { userId: user.id, projectId: project.id } });
  } catch (error) {
    console.error('Seed Linyi error:', error);
    res.status(500).json({ success: false, message: '种子数据执行失败', error: error instanceof Error ? error.message : String(error) });
  }
});
