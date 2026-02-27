import { PrismaClient } from '@prisma/client';
import { generateText } from 'ai';
import { myProvider } from '../src/lib/ai/providers.js';
import { systemPrompt } from '../src/lib/ai/prompts.js';
import { createDocument } from '../src/lib/ai/tools/create-document.js';
import { updateDocument } from '../src/lib/ai/tools/update-document.js';
import { generateUUID } from '../src/lib/utils.js';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function runRealFlowTest() {
  console.log('\n\x1b[36m%s\x1b[0m', '--- 开始真实模型接口逻辑测试 ---');

  let testUser, testAgent, chatId;

  try {
    // 1. 准备基础数据
    console.log('\n\x1b[34m%s\x1b[0m', 'Step 1: 准备基础数据...');
    testUser = await prisma.user.findFirst({ where: { email: 'artem.p@freelancer.com' } });
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'artem.p@freelancer.com',
          password: 'password123',
        },
      });
    }
    console.log(`使用测试用户: ${testUser.email}`);

    testAgent = await prisma.agent.create({
      data: {
        id: generateUUID().substring(0, 8),
        name: '资深架构师专家',
        prompt: '你是一位资深软件架构师，专注于分布式系统设计、高并发处理和云原生架构。你的回复应专业、严谨且具有深度。',
        selectedTools: JSON.stringify(['createDocument', 'updateDocument', 'getWeather']),
        userId: testUser.id,
        mermaid: '',
      },
    });
    console.log(`创建了测试智能体: ${testAgent.name} (ID: ${testAgent.id})`);

    chatId = generateUUID().substring(0, 12);
    await prisma.chat.create({
      data: {
        id: chatId,
        title: '高并发技术咨询',
        userId: testUser.id,
        agentId: testAgent.id,
      },
    });
    console.log(`✅ 已保存对话并关联智能体: ChatID=${chatId}, AgentID=${testAgent.id}`);

    // 2. 构造 System Prompt
    const finalSystemPrompt = systemPrompt({
      selectedChatModel: 'chat-model',
      requestHints: { city: 'Beijing', country: 'China', latitude: '39.9', longitude: '116.4' },
      agentPrompt: testAgent.prompt,
      selectedAgent: { id: testAgent.id, name: testAgent.name }
    });

    // 3. 模拟工具定义 (为了 generateText 能够识别)
    // 注意：这里需要一个 mock 的 dataStream，因为真实工具需要它写数据
    const mockDataStream = {
      write: (data) => console.log(`\x1b[90m[DataStream] ${JSON.stringify(data)}\x1b[0m`),
    };

    const tools = {
      createDocument: createDocument({
        session: { user: testUser },
        dataStream: mockDataStream,
        chatId: chatId,
        agentId: testAgent.id,
      }),
      updateDocument: updateDocument({
        session: { user: testUser },
        dataStream: mockDataStream,
      }),
    };

    // --- 场景 1：简短询问（触发对话回复） ---
    console.log('\n\x1b[34m%s\x1b[0m', 'Step 2: 场景 1 - 简短询问 (期待文本回复)');
    const input1 = "你能简单说说高并发的核心挑战吗？";
    console.log(`用户输入: "${input1}"`);

    const result1 = await generateText({
      model: myProvider.languageModel('chat-model'),
      system: finalSystemPrompt,
      prompt: input1,
      tools: tools,
    });

    console.log(`\x1b[32mAI 回复:\x1b[0m ${result1.text}`);
    
    // 保存 AI 消息
    await prisma.message.create({
        data: {
            id: generateUUID(),
            chatId: chatId,
            senderType: 'AI',
            content: result1.text.substring(0, 191), // 严格限制长度以符合数据库字段
        }
    });
    console.log(`✅ AI 消息已保存至数据库 (已截断以适应字段限制)`);

    // --- 场景 2：详细方案请求（触发工具调用） ---
    console.log('\n\x1b[34m%s\x1b[0m', 'Step 3: 场景 2 - 详细方案请求 (期待触发 createDocument)');
    const input2 = "请帮我写一份详细的高并发系统架构设计方案，必须使用 createDocument 工具来创建这个文档。";
    console.log(`用户输入: "${input2}"`);

    const result2 = await generateText({
      model: myProvider.languageModel('chat-model'),
      system: finalSystemPrompt,
      prompt: input2,
      tools: tools,
      maxSteps: 5, // 允许工具调用后的后续处理
    });

    if (result2.toolCalls && result2.toolCalls.length > 0) {
      console.log(`\x1b[32mAI 触发了工具调用:\x1b[0m`);
      for (const toolCall of result2.toolCalls) {
        console.log(`- 工具: ${toolCall.toolName}`);
        console.log(`- 参数: ${JSON.stringify(toolCall.args)}`);
      }
    } else {
      console.log(`\x1b[31mAI 未触发工具调用，可能是模型认为不需要或 Prompt 引导不足。\x1b[0m`);
      console.log(`AI 回复内容: ${result2.text}`);
    }

    // 4. 最终验证
    console.log('\n\x1b[34m%s\x1b[0m', 'Step 4: 最终数据库验证...');
    
    const messagesCount = await prisma.message.count({ where: { chatId: chatId } });
    console.log(`- 该对话下的消息总数: ${messagesCount}`);

    const verifiedDoc = await prisma.document.findFirst({
      where: { 
        agentId: testAgent.id,
        chatId: chatId 
      },
      orderBy: { createdAt: 'desc' }
    });

    if (verifiedDoc) {
      console.log(`✅ 成功在数据库中找到关联智能体的文档!`);
      console.log(`   文档标题: ${verifiedDoc.title}`);
      console.log(`   关联智能体: ${verifiedDoc.agentId}`);
      console.log(`   关联对话: ${verifiedDoc.chatId}`);
    } else {
      console.log(`❌ 未能在数据库中找到关联文档。`);
    }

    console.log('\n\x1b[32m%s\x1b[0m', '--- 真实模型测试完成 ---');

  } catch (error) {
    console.error('\n\x1b[31m测试过程中出现错误:\x1b[0m', error);
  } finally {
    await prisma.$disconnect();
  }
}

runRealFlowTest();
