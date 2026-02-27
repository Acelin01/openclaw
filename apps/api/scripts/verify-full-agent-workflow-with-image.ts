
import { PrismaClient } from '@prisma/client';
import { connectDatabase, disconnectDatabase, getPrisma } from '../src/lib/db/index.js';
import { DatabaseService } from '../src/lib/db/service.js';
import { generateUUID } from '../src/lib/utils.js';
import { createDocument } from '../src/lib/ai/tools/create-document.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🚀 开始验证全流程：带图片的多模态需求分析与文档生成...');

  // Connect to DB
  await connectDatabase();
  const prisma = getPrisma();
  const dbService = DatabaseService.getInstance();

  try {
    // --- 1. 准备基础环境 ---
    console.log(`\n--- 步骤 1: 准备基础环境 ---`);
    
    // 创建测试用户
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

    // 创建项目
    const projectId = generateUUID();
    const project = await prisma.project.create({
      data: {
        id: projectId,
        name: 'AI多模态测试项目',
        description: '验证图片上传与需求分析',
        status: '进行中',
        userId: pmUserId,
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

    // 创建项目经理智能体 (具备多模态能力)
    const pmAgentId = generateUUID();
    const pmAgent = await prisma.agent.create({
      data: {
        id: pmAgentId,
        name: 'PM Agent',
        identifier: 'project_manager_agent',
        user: { connect: { id: pmUserId } },
        prompt: 'You are a Project Manager with multimodal analysis capabilities. You can analyze UI screenshots to extract requirements.',
        mermaid: '{}',
        projects: { connect: { id: projectId } }
      }
    });
    console.log(`✅ 创建项目经理智能体: ${pmAgent.name}`);

    // 读取操作手册提示词
    const promptPath = '/Users/acelin/Documents/Next/AIGC/uxin/.trae/documents/提示词/操作手册.md';
    let promptContent = 'Default Prompt';
    if (fs.existsSync(promptPath)) {
        promptContent = fs.readFileSync(promptPath, 'utf-8');
        console.log(`✅ 已读取操作手册提示词`);
    }

    // 创建产品经理智能体
    const productAgentId = generateUUID();
    const productAgent = await prisma.agent.create({
      data: {
        id: productAgentId,
        name: 'Prod Agent',
        identifier: 'product_manager_agent',
        prompt: promptContent,
        mermaid: '{}',
        agents_A: { connect: { id: pmAgentId } }, // 关联到 PM Agent
        projects: { connect: { id: projectId } }
      }
    });
    console.log(`✅ 创建产品经理智能体: ${productAgent.name}`);

    // --- 3. 模拟用户发送带图片的指令 ---
    console.log(`\n--- 步骤 3: 模拟用户发送带图片的指令 ---`);

    const chatId = generateUUID();
    await prisma.chat.create({
        data: {
            id: chatId,
            userId: pmUserId,
            title: '租筐订单系统需求分析',
            projectId: projectId
        }
    });

    // 模拟图片 URL (在实际场景中是上传后的 URL)
    const imageUrl = "https://example.com/rent-basket-order.png";
    const userMessageContent = "这是'租筐订单'列表页面的截图。请分析页面功能和字段，并生成一份详细的操作手册。";

    const userMessageId = generateUUID();
    await prisma.chatMessage.create({
        data: {
            id: userMessageId,
            chatId,
            role: 'user',
            content: userMessageContent,
            // 模拟包含图片的消息部分
            parts: [
                { type: 'text', text: userMessageContent },
                { type: 'file', url: imageUrl, mediaType: 'image/png', name: 'rent-basket-order.png' }
            ],
            // 模拟附件元数据
            attachments: [
                { url: imageUrl, name: 'rent-basket-order.png', contentType: 'image/png' }
            ],
            createdAt: new Date(),
            userId: pmUserId,
            agentId: pmAgentId
        }
    });
    console.log(`✅ 用户发送带图片的消息: "${userMessageContent}" (包含图片: ${imageUrl})`);

    // --- 4. 模拟项目经理智能体进行需求分析并发送指令 ---
    console.log(`\n--- 步骤 4: 模拟项目经理智能体需求分析 ---`);

    // 模拟 PM Agent 分析图片后生成的指令
    // 注意：这里我们手动模拟 AI "看"懂了图片并转化为详细指令
    // 模拟 DeepSeek R1 的思考过程输出
    const analysisResult = `
<think>
用户上传了一张“租筐订单”列表页面的截图，要求分析功能和字段，并生成操作手册。
1.  **图像内容识别**：
    *   页面标题：“租筐订单”。
    *   顶部筛选区：日期范围、单据编号、客户、仓库、经手人、订单状态（下拉框）、结算状态、下单方式。
    *   工具栏：查询、重置、打印、导出、设置。
    *   表格列头：操作、单据日期、单据编号、订单状态、结算状态、下单方式、客户、联系人...
    *   数据行：示例数据展示了待出库、部分出库等状态。
    *   底部：合计金额。
2.  **需求转化**：
    *   核心功能：订单管理（增删改查）、状态流转、财务统计。
    *   操作手册结构：概述 -> 流程 -> 功能详解 -> 常见问题。
3.  **生成策略**：
    *   基于识别到的字段和按钮，描述具体操作步骤。
    *   使用 Mermaid 画出推测的状态流转图。
</think>

    经分析，该页面为“租筐订单”管理列表。
    主要功能点：
    1. 顶部筛选：日期范围、单据编号、客户、仓库、经手人、订单状态、结算状态、下单方式。
    2. 操作按钮：查询、重置、打印、导出、设置。
    3. 列表字段：操作（终止、进度、备注）、单据日期、单据编号、订单状态（待出库、部分出库、已完成、已取消）、结算状态、下单方式、客户、联系人、电话、仓库、租金、押金、其他费用、本单金额、实收金额、租借数量、已出库、未出库、经手人、预约时间、创建时间。
    4. 底部统计：显示金额合计。
    请基于以上分析，生成操作手册。
    `;
    
    const instructionMessageId = generateUUID();
    await prisma.chatMessage.create({
        data: {
            id: instructionMessageId,
            chatId,
            role: 'assistant',
            content: analysisResult,
            parts: [{ type: 'text', text: analysisResult }],
            attachments: [],
            createdAt: new Date(),
            userId: pmUserId, // Agent 消息通常也会记录 userId 或 senderId
            agentId: pmAgentId
        }
    });
    console.log(`✅ 项目经理完成需求分析并发送指令:\n${analysisResult}`);

    // --- 5. 模拟产品经理创建文档 ---
    console.log(`\n--- 步骤 5: 模拟产品经理创建详细操作手册 ---`);

    // [新增] 打印 Prod Agent 模型处理相关参数
    console.log(`\n🔍 [Model Input] Prod Agent (Document Generation)`);
    console.log(`-------------------------------------------`);
    console.log(`🤖 Agent Prompt: \n${productAgent.prompt}`);
    console.log(`📝 User Input (Instruction): \n${analysisResult.trim()}`);
    console.log(`🛠️  Tools Available: \n- createDocument`);
    console.log(`-------------------------------------------\n`);

    // 模拟 Session
    const mockSession = { user: { id: pmUserId, email: pmUser.email } };
    const mockDataStream = { write: () => {} };

    const toolInstance = createDocument({
        session: mockSession as any,
        dataStream: mockDataStream as any,
        chatId: chatId,
        agentId: productAgentId
    });

    // 基于图片分析生成的详细文档内容
    const manualContent = `
# 租筐订单系统操作手册 v1.0

**文档控制**：
*   **版本**：V1.0.0
*   **生效日期**：${new Date().toISOString().split('T')[0]}
*   **密级**：内部公开

## 1. 系统概述
本模块用于管理租筐业务的订单全生命周期，支持订单查询、状态跟踪及财务统计。

## 2. 核心业务流程
\`\`\`mermaid
graph LR
    A[新建订单] --> B{订单状态}
    B -- 待出库 --> C[执行出库]
    C -- 部分出库 --> D[继续出库]
    C -- 全部出库 --> E[已完成]
    B -- 取消 --> F[已取消]
\`\`\`

## 3. 功能操作详解

### 3.1 订单查询
支持多维度组合查询，快速定位订单：
*   **日期范围**：按单据日期筛选（如 2021-11 至 2022-03-12）。
*   **基础信息**：单据编号、客户名称、仓库、经手人。
*   **状态筛选**：
    *   **订单状态**：待出库、部分出库、已完成、已取消。
    *   **结算状态**：未结算、部分结算、已结算。
    *   **下单方式**：自主下单、代下单。

### 3.2 列表管理
列表展示详细业务数据，支持以下操作：
*   **终止**：强制结束未完成的订单。
*   **进度**：查看订单执行进度详情。
*   **备注**：添加订单维度的备注信息。

**关键字段说明**：
*   **租金/押金/其他费用**：构成订单总金额。
*   **本单金额 vs 实收金额**：对比应收与实收，监控财务状况。
*   **租借/已出/未出数量**：监控物资流转情况。

### 3.3 数据导出与打印
*   点击右上角 **[打印]** 按钮可打印当前列表或选中单据。
*   点击 **[导出]** 按钮可下载 Excel 报表。

## 4. 常见问题
| 问题 | 解决方案 |
| :--- | :--- |
| 订单无法取消 | 已产生出库记录的订单无法直接取消，请先红冲出库单。 |
| 金额不一致 | 检查是否有未审核的费用调整单。 |
`;

    const toolResult = await toolInstance.execute({
        title: "租筐订单操作手册",
        kind: "message",
        initialData: { content: manualContent } // 传入详细内容
    });

    console.log(`✅ 文档创建结果: ${JSON.stringify(toolResult)}`);
    console.log(`📄 文档 ID: ${toolResult.id}`);

    // --- 6. 验证文档内容与状态 ---
    console.log(`\n--- 步骤 6: 验证文档内容与状态 ---`);

  // 验证文档是否创建成功
      const doc = await prisma.document.findFirst({
        where: { id: toolResult.id },
      include: { 
        agent: true,
        message: true
      }
    });

    if (!doc) throw new Error("文档未找到");
    if (doc.status !== 'PENDING') throw new Error(`文档状态错误: ${doc.status} (预期: PENDING)`);
    if (doc.content.includes("租筐订单")) {
        console.log(`✅ 文档内容验证通过 (包含"租筐订单")`);
    } else {
        throw new Error("文档内容验证失败");
    }

    // 打印文档内容到控制台供用户检查
    console.log(`\n📄 --- 生成的操作手册内容 --- 📄\n`);
    console.log(doc.content);
    console.log(`\n📄 --------------------------- 📄\n`);

    // --- 7. 模拟审核 ---
    console.log(`\n--- 步骤 7: 模拟审核流程 ---`);
    
    // 查找有权审核的用户 (项目成员)
    const projectMembers = await prisma.projectTeamMember.findMany({
        where: { projectId: projectId },
        include: { user: true }
    });
    
    const approver = projectMembers.find(m => m.user.id === pmUserId)?.user;
    if (!approver) throw new Error("未找到审核人");
    console.log(`Found approver: ${approver.name}`);

    // 更新状态为 APPROVED
    await prisma.document.update({
        where: { 
            id_createdAt: {
                id: doc.id,
                createdAt: doc.createdAt
            }
        },
        data: { status: 'APPROVED' }
    });
    console.log(`✅ 文档审核通过`);

  } catch (error) {
    console.error('❌ 验证失败:', error);
  } finally {
    await disconnectDatabase();
  }
}

main();
