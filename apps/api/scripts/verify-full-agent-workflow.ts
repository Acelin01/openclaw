
import { PrismaClient } from '@prisma/client';
import { connectDatabase, disconnectDatabase, getPrisma } from '../src/lib/db/index.js';
import { DatabaseService } from '../src/lib/db/service.js';
import { generateUUID } from '../src/lib/utils.js';
import { createDocument } from '../src/lib/ai/tools/create-document.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🚀 开始验证全流程：智能体协作与文档审核...');

  // Connect to DB
  await connectDatabase();
  const prisma = getPrisma();
  const dbService = DatabaseService.getInstance();

  try {
    // --- 1. 准备基础数据 ---
    console.log(`\n--- 步骤 1: 准备基础环境 ---`);
    
    // 创建测试用户 (拥有项目经理智能体权限的用户)
    const pmUserId = generateUUID();
    const pmUser = await prisma.user.create({
      data: {
        id: pmUserId,
        email: `pm-user-${Date.now()}@example.com`,
        name: '项目经理账户',
        password: 'password123',
      }
    });
    console.log(`✅ 创建项目经理账户: ${pmUser.name} (${pmUser.id})`);

    // 创建项目 (Project Manager Agent 所在的项目)
    const projectId = generateUUID();
    const project = await prisma.project.create({
      data: {
        id: projectId,
        name: 'AI全流程测试项目',
        description: '用于验证智能体协作的项目',
        status: '进行中',
        userId: pmUserId,
        // Associate user as a member
        members: {
            create: {
                userId: pmUserId,
                role: 'OWNER'
            }
        }
      }
    });
    console.log(`✅ 创建测试项目: ${project.name} (${project.id})`);

    // --- 2. 创建并关联智能体 ---
    console.log(`\n--- 步骤 2: 创建并关联智能体 ---`);

    // 创建项目经理智能体
    const pmAgentId = generateUUID();
    const pmAgent = await prisma.agent.create({
      data: {
        id: pmAgentId,
        name: 'PM Agent', // Shortened name to fit varchar(20)
        identifier: 'project_manager_agent',
        user: { connect: { id: pmUserId } }, // Associated with the user
        prompt: 'You are a Project Manager.',
        mermaid: '{}',
        projects: { connect: { id: projectId } } // Associated with the project
      }
    });
    console.log(`✅ 创建项目经理智能体: ${pmAgent.name}`);

    // 读取操作手册提示词
    const promptPath = '/Users/acelin/Documents/Next/AIGC/uxin/.trae/documents/提示词/操作手册.md';
    let promptContent = 'Default Prompt';
    if (fs.existsSync(promptPath)) {
        promptContent = fs.readFileSync(promptPath, 'utf-8');
        console.log(`✅ 已读取操作手册提示词`);
    } else {
        console.warn(`⚠️ 未找到提示词文件，使用默认提示词`);
    }

    // 创建产品经理智能体 (关联到项目经理)
    const productAgentId = generateUUID();
    const productAgent = await prisma.agent.create({
      data: {
        id: productAgentId,
        name: 'Prod Agent', // Shortened name to fit varchar(20)
        identifier: 'product_manager_agent',
        prompt: promptContent,
        mermaid: '{}',
        // 关联到项目经理智能体 (Using agents_A as per previous verification)
        agents_A: {
            connect: { id: pmAgentId }
        },
        // Also associate with project for visibility context
        projects: { connect: { id: projectId } }
      }
    });
    console.log(`✅ 创建产品经理智能体: ${productAgent.name}`);

    // 验证关联
    const pmWithAgents = await prisma.agent.findUnique({
        where: { id: pmAgentId },
        include: { agents_B: true }
    });
    const isAssociated = pmWithAgents?.agents_B.some(a => a.id === productAgentId);
    if (isAssociated) {
        console.log(`✅ 智能体关联验证成功: PM Agent -> Product Agent`);
    } else {
        throw new Error(`❌ 智能体关联验证失败`);
    }

    // --- 3. 模拟指令与文档创建 ---
    console.log(`\n--- 步骤 3: 模拟指令与文档创建 ---`);

    // 创建对话上下文
    const chatId = generateUUID();
    await prisma.chat.create({
        data: {
            id: chatId,
            userId: pmUserId,
            title: '智能体协作对话',
            projectId: projectId
        }
    });

    // 模拟项目经理发送指令
    const instructionContent = "请根据需求分析，撰写一份操作手册。";
    const instructionMessageId = generateUUID();
    await prisma.chatMessage.create({
        data: {
            id: instructionMessageId,
            chatId,
            role: 'assistant',
            content: instructionContent,
            parts: [],
            attachments: [],
            createdAt: new Date(),
            userId: pmUserId,
            agentId: pmAgentId // 关联了 PM Agent
        }
    });
    console.log(`✅ 项目经理发送指令: "${instructionContent}" (MessageId: ${instructionMessageId}, AgentId: ${pmAgentId})`);

    // 模拟产品经理收到指令，调用 createDocument 工具
    console.log(`🔄 产品经理智能体正在执行文档创建工具...`);
    
    // Mock session/stream
    const mockSession = { user: { id: pmUserId, email: pmUser.email } }; // PM User triggers or context owner
    const mockDataStream = { write: () => {} };

    const toolInstance = createDocument({
        session: mockSession as any,
        dataStream: mockDataStream as any,
        chatId: chatId,
        agentId: productAgentId // 关键: 确保传入了 Prod Agent ID
    });

    // 产品经理生成的文档内容 (基于提示词)
    // 模拟真实模型生成：解析提示词框架并填充内容
    const manualContent = `
# 操作手册 v1.0

**文档控制**：
*   **版本**：V1.0.0
*   **生效日期**：${new Date().toISOString().split('T')[0]}
*   **密级**：内部公开

## 1. 核心目的
本手册旨在指导用户使用智能体协作平台。

## 2. 快速入门
*   **环境要求**：Chrome 浏览器 v100+
*   **访问路径**：https://platform.uxin.ai

## 3. 核心业务流程
\`\`\`mermaid
graph LR
    A[登录] --> B[创建项目]
    B --> C[添加智能体]
\`\`\`

## 4. 功能操作详解
### 4.1 创建项目
1.  **场景描述**：新建一个协作项目。
2.  **操作步骤**：
    - 步骤1：点击“新建项目”按钮。
    - 步骤2：输入项目名称并保存。
    
> **注意：** 项目名称不可重复。

## 5. 故障排除
| 异常现象 | 解决步骤 |
| :--- | :--- |
| 无法登录 | 检查网络连接 |
`;
    
    const toolResult = await toolInstance.execute({
        title: "AI生成操作手册",
        kind: "message", // "使用消息文档类型"
        initialData: {
            content: manualContent
        }
    });

    console.log(`✅ 工具执行完成，返回:`, toolResult);

    if (!toolResult.id) throw new Error("工具未返回文档ID");

    // --- 4. 验证文档状态与审核流程 ---
    console.log(`\n--- 步骤 4: 验证文档状态与审核流程 ---`);

    const doc = await prisma.document.findFirst({
        where: { id: toolResult.id }
    });

    if (!doc) throw new Error("数据库中未找到文档");
    
    console.log(`📄 文档详情: ID=${doc.id}, Status=${doc.status}, Kind=${doc.kind}, AgentId=${doc.agentId}`);

    // 验证关联关系
    if (doc.agentId !== productAgentId) {
        throw new Error(`❌ 文档未正确关联产品经理智能体 (Expected: ${productAgentId}, Actual: ${doc.agentId})`);
    }
    console.log(`✅ 文档关联验证通过: Document -> Prod Agent (${productAgentId})`);

    // 验证消息指令关联
    const msg = await prisma.chatMessage.findUnique({ where: { id: instructionMessageId } });
    if (msg?.agentId !== pmAgentId) {
        throw new Error(`❌ 消息指令未正确关联项目经理智能体`);
    }
    console.log(`✅ 消息指令关联验证通过: Message -> PM Agent (${pmAgentId})`);

    // 验证内容是否符合提示词特征
    if (!doc.content?.includes("操作手册 v1.0") || !doc.content?.includes("核心目的")) {
        throw new Error(`❌ 文档内容不符合提示词框架要求`);
    }
    console.log(`✅ 文档内容验证通过: 符合操作手册提示词结构`);

    if (doc.status !== 'PENDING') {
        throw new Error(`❌ 文档初始状态错误: 期望 PENDING, 实际 ${doc.status}`);
    }
    console.log(`✅ 文档初始状态验证通过: PENDING`);

    // 查找项目经理智能体所在项目拥有权限的关联用户
    // Logic: Document -> Agent (Product) -> Linked Agent (PM) -> Project -> Members
    // Or simply: Document -> Project -> Members (since we passed chatId linked to project, or tool inferred it)
    
    // Check if document is linked to project (tool might not link it automatically if not passed explicitly, 
    // but chatId is linked to project. Let's see if createDocument picks up projectId from chat)
    // Actually createDocument doesn't automatically infer projectId from chat unless we updated it.
    // However, the scenario says "Find Project Manager Agent's associated users".
    // Let's manually verify we can find the user.
    
    const projectMembers = await prisma.projectTeamMember.findMany({
        where: { projectId: projectId },
        include: { user: true }
    });
    
    const approver = projectMembers.find(m => m.userId === pmUserId); // The PM User
    if (approver) {
        console.log(`✅ 找到有权审核的用户: ${approver.user.name}`);
    } else {
        console.warn(`⚠️ 未直接找到项目关联用户 (可能是因为文档未直接关联项目，需通过智能体上下文查找)`);
    }

    // 模拟审核操作 (由 PM User 执行)
    console.log(`🔄 用户 ${pmUser.name} 正在执行审核操作...`);
    
    const updatedDoc = await prisma.document.update({
        where: { 
            id_createdAt: {
                id: doc.id,
                createdAt: doc.createdAt
            }
        },
        data: { status: 'APPROVED' }
    });

    console.log(`✅ 审核完成，文档状态: ${updatedDoc.status}`);
    
    if (updatedDoc.status === 'APPROVED') {
        console.log(`✅ 全流程验证成功！`);
        console.log(`\n================= 操作手册内容 =================`);
        console.log(updatedDoc.content);
        console.log(`==================================================\n`);
    } else {
        throw new Error(`❌ 审核状态更新失败`);
    }

  } catch (error) {
    console.error('❌ 验证失败:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

main();
