
import { connectDatabase, disconnectDatabase, getPrisma } from '../src/lib/db/index.js';
import { generateUUID } from '../src/lib/utils.js';
import { createDocument } from '../src/lib/ai/tools/create-document.js';
import * as fs from 'fs';
 

async function main() {
  console.log('🚀 开始验证产品经理智能体流程...');

  try {
    await connectDatabase();
    const prisma = getPrisma();
    const promptPath = '/Users/acelin/Documents/Next/AIGC/uxin/.trae/documents/提示词/操作手册.md';
    if (!fs.existsSync(promptPath)) {
        console.error(`❌ 提示词文件不存在: ${promptPath}`);
        process.exit(1);
    }
    const promptContent = fs.readFileSync(promptPath, 'utf-8');
    console.log('✅ 已读取提示词文件');

    const testUserId = generateUUID();
    const testChatId = generateUUID();
    const user = await prisma.user.create({
        data: {
            id: testUserId,
            email: `test-pm-${Date.now()}@example.com`,
            name: 'Test User',
            password: 'password', 
        }
    });
    console.log(`✅ 创建测试用户: ${user.id}`);

    const chat = await prisma.chat.create({
        data: {
            id: testChatId,
            userId: testUserId,
            title: 'Test Chat',
        }
    });
    console.log(`✅ 创建测试对话: ${chat.id}`);

    const pmAgent = await prisma.agent.create({
        data: {
            id: generateUUID(),
            name: 'Project Manager',
            prompt: 'You are a Project Manager.',
            userId: testUserId,
            mermaid: '{}',
        }
    });
    console.log(`✅ 创建项目经理智能体: ${pmAgent.id}`);

    const productAgent = await prisma.agent.create({
        data: {
            id: generateUUID(),
            name: 'Product Manager',
            prompt: promptContent,
            userId: testUserId,
            mermaid: '{}',
            agents_A: {
                connect: { id: pmAgent.id }
            }
        }
    });
    console.log(`✅ 创建产品经理智能体: ${productAgent.id}`);
    
    // Verify association
    const pmWithAgents = await prisma.agent.findUnique({
        where: { id: pmAgent.id },
        include: { agents_B: true }
    });
    const associated = pmWithAgents?.agents_B.find(a => a.id === productAgent.id);
    if (associated) {
        console.log(`✅ 智能体关联验证成功: Project Manager -> Product Manager`);
    } else {
        console.error(`❌ 智能体关联验证失败`);
    }

    console.log('🔄 模拟产品经理调用文档创建工具...');
    const mockSession = { user: { id: testUserId, email: user.email } };
    const mockDataStream = {
        write: (data: any) => {
        }
    };

    const toolInstance = createDocument({
        session: mockSession as any,
        dataStream: mockDataStream as any,
        chatId: testChatId,
        agentId: productAgent.id
    });

    const manualContent = "# 操作手册 v1.0\n\n这是一个测试手册。";
    const result = await toolInstance.execute({
        title: "Test Operation Manual",
        kind: "message",
        initialData: {
            content: manualContent
        }
    });

    console.log('✅ 工具执行完成:', result);

    if (!result.id) {
        throw new Error("工具未返回文档ID");
    }

    const doc = await prisma.document.findFirst({
        where: { id: result.id }
    });

    if (!doc) {
        throw new Error("数据库中未找到文档");
    }

    console.log(`📄 文档详情:
    ID: ${doc.id}
    Title: ${doc.title}
    Kind: ${doc.kind}
    Status: ${doc.status}
    AgentId: ${doc.agentId}
    `);

    if (doc.status === 'PENDING') {
        console.log('✅ 验证成功: 文档状态为待审核 (PENDING)');
    } else {
        console.error(`❌ 验证失败: 文档状态为 ${doc.status}, 期望为 PENDING`);
    }
    console.log('✅ 流程验证完成');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await disconnectDatabase();
  }
}

main();
