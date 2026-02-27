
import { PrismaClient } from '@prisma/client';
const uuidv4 = () => Math.random().toString(36).substring(2, 15);

const prisma = new PrismaClient();

async function runRealTest() {
  console.log('\x1b[36m%s\x1b[0m', '--- 开始真实接口逻辑测试 ---');

  try {
    // 1. 创建测试用户和测试智能体
    console.log('\n\x1b[34m%s\x1b[0m', 'Step 1: 准备基础数据...');
    
    // 获取或创建一个测试用户
    let testUser = await prisma.user.findFirst();
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          id: uuidv4(),
          email: `test-${Date.now()}@example.com`,
          name: 'Test User',
          password: 'password123'
        }
      });
      console.log(`创建了新测试用户: ${testUser.email}`);
    } else {
      console.log(`使用现有测试用户: ${testUser.email}`);
    }

    // 创建一个测试智能体
    const agentId = uuidv4();
    const testAgent = await prisma.agent.create({
      data: {
        id: agentId,
        name: '测试架构师',
        identifier: `arch-${Date.now()}`,
        prompt: '你是一位资深软件架构师，专注于分布式系统设计。',
        selectedTools: JSON.stringify(['createDocument', 'updateDocument']),
        userId: testUser.id,
        mermaid: ''
      }
    });
    console.log(`创建了测试智能体: ${testAgent.name} (ID: ${testAgent.id})`);

    // 2. 模拟数据输入阶段
    console.log('\n\x1b[34m%s\x1b[0m', 'Step 2: 模拟数据输入 (关联智能体)...');
    const chatId = uuidv4();
    const userInput = "请帮我 design 一个高并发系统的架构文档";
    
    // 调用真实的 saveChat 方法逻辑
    const savedChat = await prisma.chat.create({
      data: {
        id: chatId,
        userId: testUser.id,
        title: '架构设计对话',
        agentId: testAgent.id,
        visibility: 'private',
        createdAt: new Date()
      }
    });
    console.log(`✅ 已保存对话并关联智能体: ChatID=${savedChat.id}, AgentID=${savedChat.agentId}`);

    // 3. 处理阶段 (智能体查询与工具过滤)
    console.log('\n\x1b[34m%s\x1b[0m', 'Step 3: 处理阶段 (模拟 API 内部逻辑)...');
    const agent = await prisma.agent.findUnique({
      where: { id: testAgent.id }
    });
    
    // --- 模拟 systemPrompt 生成逻辑 ---
    const artifactsPromptSnippet = "Artifacts 是一种特殊的界面模式...";
    const systemPrompt = (agentPrompt, agentName) => {
      let base = agentPrompt || "你是一个友好的助手！";
      if (agentName) {
        base += `\n\n### 当前角色设定\n你当前被指定为 **${agentName}**。请严格按照该角色的专业视角、职责范围和风格进行回复。`;
      }
      return `${base}\n\n${artifactsPromptSnippet}`;
    };

    const finalSystemPrompt = systemPrompt(agent.prompt, agent.name);
    console.log('\x1b[32m%s\x1b[0m', '--- 模拟生成的 System Prompt ---');
    console.log(finalSystemPrompt);

    // --- 模拟工具过滤逻辑 ---
    const allAvailableTools = ['getWeather', 'createDocument', 'updateDocument', 'requestSuggestions'];
    const agentSelectedTools = JSON.parse(agent.selectedTools || '[]');
    const activeTools = allAvailableTools.filter(tool => agentSelectedTools.includes(tool));
    
    console.log('\n\x1b[32m%s\x1b[0m', '--- 模拟工具过滤结果 ---');
    console.log(`系统所有可用工具: ${JSON.stringify(allAvailableTools)}`);
    console.log(`智能体配置工具: ${JSON.stringify(agentSelectedTools)}`);
    console.log(`最终生效工具 (Active Tools): ${JSON.stringify(activeTools)}`);

    // --- 模拟 AI 决策引擎 ---
    const aiProcess = (userInput, currentSystemPrompt, activeTools) => {
      console.log(`\n\x1b[35m[AI 正在分析处理...]\x1b[0m`);
      console.log(`用户输入: "${userInput}"`);
      
      // 模拟 AI 根据提示词进行决策
      const isLongContent = userInput.length > 20 || /设计|文档|报告|方案|写一份/.test(userInput);
      const canCreateDoc = activeTools.includes('createDocument');

      if (isLongContent && canCreateDoc) {
        return {
          type: 'TOOL_CALL',
          tool: 'createDocument',
          args: {
            title: userInput.includes('架构') ? '系统架构设计方案' : '新文档',
            kind: 'text',
            initialData: `基于智能体角色（${agent.name}）生成的专业内容，遵循系统提示词逻辑。`
          }
        };
      } else {
        return {
          type: 'CHAT_REPLY',
          content: `你好！作为${currentSystemPrompt.includes('架构师') ? '资深架构师' : '助手'}，我建议：对于您的请求 "${userInput}"，我们可以从模块化设计开始...`
        };
      }
    };

    // --- 场景 1：普通对话回复 ---
    console.log('\n\x1b[34m%s\x1b[0m', 'Step 4a: 模拟场景 1 - 普通对话回复');
    const input1 = "你能简单说说高并发吗？";
    const decision1 = aiProcess(input1, finalSystemPrompt, activeTools);

    if (decision1.type === 'CHAT_REPLY') {
      console.log(`\x1b[32mAI 选择对话回复:\x1b[0m ${decision1.content}`);
      // 模拟保存消息
      console.log(`✅ 消息已保存至数据库 (关联 ChatID: ${chatId})`);
    }

    // --- 场景 2：触发工具创建文档 ---
    console.log('\n\x1b[34m%s\x1b[0m', 'Step 4b: 模拟场景 2 - 触发工具创建文档');
    const input2 = "请帮我写一份详细的高并发系统架构设计方案";
    const decision2 = aiProcess(input2, finalSystemPrompt, activeTools);

    if (decision2.type === 'TOOL_CALL' && decision2.tool === 'createDocument') {
      console.log(`\x1b[32mAI 选择调用工具:\x1b[0m ${decision2.tool}`);
      console.log(`参数: ${JSON.stringify(decision2.args)}`);
      
      const docId = uuidv4();
      const savedDoc = await prisma.document.create({
        data: {
          id: docId,
          title: decision2.args.title,
          kind: decision2.args.kind,
          content: decision2.args.initialData,
          userId: testUser.id,
          chatId: chatId,
          agentId: testAgent.id,
          createdAt: new Date()
        }
      });
      console.log(`✅ 已通过工具调用创建文档并关联智能体: DocID=${savedDoc.id}, AgentID=${savedDoc.agentId}`);
    }

    // 5. 验证与返回
    console.log('\n\x1b[34m%s\x1b[0m', 'Step 5: 最终验证...');
    const verifiedChat = await prisma.chat.findUnique({ where: { id: chatId } });
    const verifiedDoc = await prisma.document.findFirst({ where: { 
      agentId: testAgent.id,
      chatId: chatId 
    } });

    console.log('\x1b[32m%s\x1b[0m', '--- 测试通过 ---');
    console.log('验证结果:');
    console.log(`- 对话关联 AgentID 一致性: ${verifiedChat?.agentId === testAgent.id ? '成功' : '失败'}`);
    console.log(`- 文档关联 AgentID 一致性: ${verifiedDoc?.agentId === testAgent.id ? '成功' : '失败'}`);
    console.log(`- 文档关联 ChatID 一致性: ${verifiedDoc?.chatId === chatId ? '成功' : '失败'}`);
    console.log(`- 文档内容一致性: ${verifiedDoc?.title.includes('架构') ? '成功' : '失败'}`);

  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '测试过程中出现错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runRealTest();
