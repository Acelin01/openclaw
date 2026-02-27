
import { PrismaClient } from '@prisma/client';
import { connectDatabase, disconnectDatabase, getPrisma } from '../src/lib/db/index.js';
import { DatabaseService } from '../src/lib/db/service.js';
import { handleProjectApproval } from '../src/routes/document.js';

// Simple UUID generator fallback
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function main() {
  console.log('🚀 开始验证文档审核流程 (集成测试)...');

  // Connect to DB
  await connectDatabase();
  const prisma = getPrisma();
  const dbService = DatabaseService.getInstance();

  // 1. 准备测试数据
  const testUserId = generateUUID();
  const otherUserId = generateUUID();
  const testChatId = generateUUID();
  const testMessageId = generateUUID();

  // Mock generateText function with access to local variables
  const mockGenerateText = async (options: any) => {
      console.log('[Mock AI] generateText called with system prompt:', options.system.substring(0, 50) + '...');
      console.log('[Mock AI] Tools available:', Object.keys(options.tools));
      
      // Simulate tool execution: createTasks
      if (options.tools && options.tools.createTasks) {
          console.log('[Mock AI] Simulating Tech Agent deciding to create tasks...');
          const tool = options.tools.createTasks;
          
          const dummyTasks = [
               {
                  title: '初始化项目结构 (AI Generated)',
                  description: '搭建 TypeScript + Node.js 基础框架',
                  priority: 'HIGH',
                  status: 'PENDING',
                  // Assign to creator (default)
              },
              {
                  title: '设计数据库 Schema (AI Generated)',
                  description: '根据需求设计 Prisma Schema',
                  priority: 'MEDIUM',
                  status: 'PENDING',
                  assigneeId: otherUserId, // Assign to correct other user
              }
          ];
          
          console.log('[Mock AI] Calling createTasks tool with tasks:', dummyTasks);
          const toolResult = await tool.execute({ tasks: dummyTasks });
          console.log('[Mock AI] Tool execution result:', toolResult);
          
          return {
              text: "I have created the tasks as requested.",
              toolResults: [
                  {
                      toolName: 'createTasks',
                      args: { tasks: dummyTasks },
                      result: toolResult
                  }
              ]
          };
      }
      
      return {
          text: "No tools used.",
          toolResults: []
      };
  };


  console.log(`\n--- 步骤 0: 准备基础数据 ---`);
  // 创建测试用户 (PM/Creator)
  const user = await prisma.user.create({
    data: {
      id: testUserId,
      email: `test-${testUserId.slice(0, 8)}@example.com`,
      name: '测试用户(PM)',
      password: 'password123',
    }
  });
  console.log(`✅ 创建测试用户: ${user.name} (${user.id})`);

  // 创建其他用户 (Developer)
  const otherUser = await prisma.user.create({
    data: {
      id: otherUserId,
      email: `other-${otherUserId.slice(0, 8)}@example.com`,
      name: '其他开发人员',
      password: 'password123',
    }
  });
  console.log(`✅ 创建其他用户: ${otherUser.name} (${otherUser.id})`);

  // 创建测试会话
  const chat = await prisma.chat.create({
    data: {
      id: testChatId,
      userId: testUserId,
      title: '测试文档审核会话',
    }
  });

  // 创建关联消息
  await prisma.chatMessage.create({
    data: {
      id: testMessageId,
      chatId: testChatId,
      role: 'user',
      content: 'Create a project document',
      parts: [],
      attachments: [],
      createdAt: new Date(),
      userId: testUserId,
    }
  });

  // 1.5 创建智能体 (PM 和 Tech Lead)
  console.log(`\n--- 步骤 0.5: 准备智能体数据 ---`);
  
  // 创建技术经理智能体
  const techAgentId = generateUUID();
  const techAgent = await prisma.agent.create({
    data: {
      id: techAgentId,
      name: '技术经理',
      identifier: 'technical_manager',
      user: { connect: { id: testUserId } },
      prompt: 'You are a Technical Manager.',
      mermaid: '',
    }
  });
  console.log(`✅ 创建技术经理智能体: ${techAgent.name}`);

  // 创建项目经理智能体 (关联技术经理)
  const pmAgentId = generateUUID();
  const pmAgent = await prisma.agent.create({
    data: {
      id: pmAgentId,
      name: '项目经理',
      identifier: 'project_manager',
      user: { connect: { id: testUserId } },
      prompt: 'You are a Project Manager.',
      mermaid: '',
      agents_B: {
        connect: [{ id: techAgentId }]
      }
    }
  });
  console.log(`✅ 创建项目经理智能体: ${pmAgent.name}`);

  // 2. 模拟从对话消息创建文档 (PENDING 状态)
  console.log(`\n--- 步骤 1: 模拟对话生成文档 (PENDING) ---`);
  const docId = `project-doc-${generateUUID().slice(0, 8)}`;
  const projectContent = JSON.stringify({
    name: "验证测试项目(Auto)",
    description: "这是一个通过脚本验证生成的测试项目",
    budget: 50000,
    tags: ["TypeScript", "Node.js"],
    status: "进行中"
  });

  const document = await prisma.document.create({
    data: {
      id: docId,
      title: "测试项目文档",
      kind: 'project',
      content: projectContent,
      userId: testUserId,
      chatId: testChatId,
      messageId: testMessageId,
      agentId: pmAgentId,     // Set PM Agent ID
      status: 'PENDING',
      createdAt: new Date(),
    }
  });
  console.log(`✅ 创建待审核文档: ${document.id}, 状态: ${document.status}`);

  // 3. 执行审核通过流程 (调用 handleProjectApproval)
  console.log(`\n--- 步骤 2: 执行审核通过 (调用 handleProjectApproval) ---`);
  
  // 更新状态为 APPROVED
  const approvedDoc = await prisma.document.update({
    where: { 
        id_createdAt: {
            id: document.id,
            createdAt: document.createdAt
        }
    },
    data: { status: 'APPROVED' }
  });

  // 调用处理函数 (注入 mockGenerateText)
  await handleProjectApproval(approvedDoc, dbService, mockGenerateText);
  
  console.log(`✅ handleProjectApproval 执行完成`);

  // 4. 验证结果
  console.log(`\n--- 步骤 3: 验证结果 ---`);

  const projects = await prisma.project.findMany({
    where: { name: "验证测试项目(Auto)", userId: testUserId },
    orderBy: { createdAt: 'desc' },
    take: 1
  });
  if (projects.length > 0) {
    console.log(`✅ 项目已自动创建: ${projects[0].name} (ID: ${projects[0].id})`);
  } else {
    console.error(`❌ 项目未创建!`);
  }

  // B. 验证消息指令 (PM -> Tech)
  const instructions = await prisma.chatMessage.findMany({
    where: { 
        chatId: testChatId,
        agentId: pmAgentId,
        content: { contains: `@${techAgent.name}` }
    }
  });
  if (instructions.length > 0) {
      console.log(`✅ PM智能体已发送指令消息: "${instructions[0].content}"`);
  } else {
      console.error(`❌ 未找到PM指令消息!`);
  }

  // C. 验证 Tech Agent 回复
  const responses = await prisma.chatMessage.findMany({
    where: { 
        chatId: testChatId,
        agentId: techAgentId,
        role: 'assistant'
    }
  });
  if (responses.length > 0) {
      console.log(`✅ Tech智能体已回复: "${responses[0].content}"`);
  } else {
      console.error(`❌ 未找到Tech智能体回复!`);
  }

  // D. 验证任务创建
  if (projects.length > 0) {
      const tasks = await prisma.projectTask.findMany({
          where: { projectId: projects[0].id }
      });
      console.log(`✅ 已创建任务数量: ${tasks.length}`);
      tasks.forEach(t => {
          console.log(`   - [${t.priority}] ${t.title} (Assignee: ${t.assigneeId === otherUserId ? 'Other User' : 'Creator'})`);
      });

      // 验证 Other User 可见性
      const otherUserTasks = tasks.filter(t => t.assigneeId === otherUserId);
      if (otherUserTasks.length > 0) {
          console.log(`✅ 验证通过: 其他用户 (${otherUser.name}) 有 ${otherUserTasks.length} 个分配的任务。`);
      } else {
          console.error(`❌ 验证失败: 没有分配给其他用户的任务。`);
      }
  }

  console.log(`\n--- 验证完成 ---`);
}

main()
  .catch(e => {
    console.error('❌ 验证过程中发生错误:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDatabase();
  });
