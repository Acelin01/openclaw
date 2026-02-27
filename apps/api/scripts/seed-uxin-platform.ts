
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const projectId = 'proj-uxin';
  const userId = 'seed-freelancer-f1'; // 阿尔捷姆-P

  console.log('🚀 开始插入优薪数字化平台演示数据...');

  try {
    // 1. 确保项目存在 (使用 raw SQL 避免 Prisma Client 字段不匹配问题)
    console.log('--- 准备项目数据 ---');
    const projectExists: any[] = await prisma.$queryRaw`SELECT id FROM projects WHERE id = ${projectId}`;
    
    if (projectExists.length > 0) {
      await prisma.$executeRaw`
        UPDATE projects 
        SET name = '优薪数字化平台研发', 
            description = '基于分布式智能体协议构建，实现跨角色的自动化任务流转、实时知识共享与全链路安全审计。', 
            progress = 65,
            updatedAt = NOW()
        WHERE id = ${projectId}
      `;
    } else {
      await prisma.$executeRaw`
        INSERT INTO projects (id, userId, name, description, progress, createdAt, updatedAt)
        VALUES (${projectId}, ${userId}, '优薪数字化平台研发', '基于分布式智能体协议构建，实现跨角色的自动化任务流转、实时知识共享与全链路安全审计。', 65, NOW(), NOW())
      `;
    }
    console.log(`✅ 项目已准备`);

    // 2. 获取现有智能体
    const agents: any[] = await prisma.$queryRaw`SELECT id, name FROM agents LIMIT 5`;
    if (agents.length === 0) {
      console.log('⚠️ 未找到智能体，脚本将继续插入其他数据');
    }

    // 3. 清理并插入项目成员
    console.log('--- 准备成员数据 ---');
    await prisma.$executeRaw`DELETE FROM project_team_members WHERE projectId = ${projectId}`;
    
    // 插入人类成员
    await prisma.$executeRaw`
      INSERT INTO project_team_members (id, projectId, userId, role, joinedAt)
      VALUES (UUID(), ${projectId}, ${userId}, '项目负责人', NOW())
    `;

    // 插入智能体成员
    for (const agent of agents) {
      await prisma.$executeRaw`
        INSERT INTO project_team_members (id, projectId, agentId, role, joinedAt)
        VALUES (UUID(), ${projectId}, ${agent.id}, ${agent.name.includes('研发') ? '研发助手' : '智能协作单元'}, NOW())
      `;
    }
    console.log(`✅ 已关联成员`);

    // 4. 插入实时任务
    console.log('--- 准备任务数据 ---');
    await prisma.$executeRaw`DELETE FROM project_tasks WHERE projectId = ${projectId}`;
    const tasks = [
      { title: '分布式智能体协议(ACP)核心模块开发', progress: 85, status: 'IN_PROGRESS', priority: 'HIGH' },
      { title: '全链路安全审计日志系统对接', progress: 40, status: 'IN_PROGRESS', priority: 'MEDIUM' },
      { title: '多角色自动化任务流转逻辑验证', progress: 100, status: 'COMPLETED', priority: 'HIGH' },
      { title: '跨智能体知识共享机制优化', progress: 20, status: 'IN_PROGRESS', priority: 'LOW' },
    ];

    for (const task of tasks) {
      await prisma.$executeRaw`
        INSERT INTO project_tasks (id, projectId, title, progress, status, priority, createdAt, updatedAt)
        VALUES (UUID(), ${projectId}, ${task.title}, ${task.progress}, ${task.status}, ${task.priority}, NOW(), NOW())
      `;
    }
    console.log(`✅ 已插入演示任务`);

    // 5. 插入协作动态
    console.log('--- 准备动态数据 ---');
    await prisma.$executeRaw`DELETE FROM project_activities WHERE projectId = ${projectId}`;
    const activities = [
      { action: '完成了核心协议校验', targetName: 'ACP Hub', fromName: agents[0]?.name || '研发助手' },
      { action: '上传了新的安全策略文档', targetName: '安全审计模块', fromName: '阿尔捷姆-P' },
      { action: '触发了跨单元知识同步', targetName: '全局知识库', fromName: agents[2]?.name || '知识助手' },
      { action: '启动了性能压力测试', targetName: '系统内核', fromName: agents[1]?.name || '性能专家' },
      { action: '更新了任务进度至 85%', targetName: 'ACP 开发任务', fromName: agents[0]?.name || '研发助手' },
    ];

    for (const act of activities) {
      const details = JSON.stringify({ targetName: act.targetName, fromName: act.fromName });
      await prisma.$executeRaw`
        INSERT INTO project_activities (id, projectId, userId, action, details, createdAt)
        VALUES (UUID(), ${projectId}, ${userId}, ${act.action}, ${details}, NOW())
      `;
    }
    console.log(`✅ 已插入协作动态`);

    // 6. 插入项目文档
    console.log('--- 准备文档数据 ---');
    // 根据 schema.prisma: model Document { id, createdAt, title, content, kind, userId, projectId }
    await prisma.$executeRaw`DELETE FROM Document WHERE projectId = ${projectId}`;
    const docs = [
      { title: 'ACP_Protocol_Specification_v2.pdf', kind: 'text' },
      { title: 'Security_Audit_Framework.docx', kind: 'text' },
      { title: 'Agent_Collaboration_Flow_Diagram.png', kind: 'image' },
      { title: 'System_Kernel_Log_Audit.csv', kind: 'sheet' },
    ];

    for (const doc of docs) {
      await prisma.$executeRaw`
        INSERT INTO Document (id, projectId, userId, title, kind, createdAt)
        VALUES (UUID(), ${projectId}, ${userId}, ${doc.title}, ${doc.kind}, NOW())
      `;
    }
    console.log(`✅ 已插入项目文档`);

    console.log('\n✨ 演示数据准备完成！现在您可以刷新界面查看“优薪数字化平台”的真实协作效果。');

  } catch (error) {
    console.error('❌ 数据插入失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
