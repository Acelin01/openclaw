
import { PrismaClient } from '@prisma/client';
import { connectDatabase, disconnectDatabase, getPrisma } from '../src/lib/db/index.js';
import { DatabaseService } from '../src/lib/db/service.js';
import { handleArtifactApproval } from '../src/routes/document.js';

// Simple UUID generator fallback
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function main() {
  console.log('🚀 开始验证自由职业者文档审核流程...');

  // Connect to DB
  await connectDatabase();
  const prisma = getPrisma();
  const dbService = DatabaseService.getInstance();

  // 1. 准备测试数据
  const testUserId = generateUUID();
  const testChatId = generateUUID();
  const testMessageId = generateUUID();

  console.log(`\n--- 步骤 0: 准备基础数据 ---`);
  // 创建测试用户
  const user = await prisma.user.create({
    data: {
      id: testUserId,
      email: `freelancer-test-${testUserId.slice(0, 8)}@example.com`,
      name: '测试自由职业者',
      password: 'password123',
    }
  });
  console.log(`✅ 创建测试用户: ${user.name} (${user.id})`);

  // 创建测试会话
  await prisma.chat.create({
    data: {
      id: testChatId,
      userId: testUserId,
      title: '自由职业者验证会话',
    }
  });
  console.log(`✅ 创建测试会话: ${testChatId}`);

  // 创建关联消息
  await prisma.chatMessage.create({
    data: {
      id: testMessageId,
      chatId: testChatId,
      role: 'user',
      content: 'Create freelancer documents',
      parts: [],
      attachments: [],
      createdAt: new Date(),
      userId: testUserId,
    }
  });
  console.log(`✅ 创建测试消息: ${testMessageId}`);

  // 2. 验证 Resume 审核
  console.log(`\n--- 步骤 1: 验证简历 (resume) 审核 ---`);
  const resumeId = `resume-${generateUUID().slice(0, 8)}`;
  const resumeContent = {
    title: "资深全栈工程师简历",
    name: "测试用户",
    content: "精通 React, Node.js, AI Agent 开发",
    skills: ["React", "Node.js", "TypeScript"]
  };

  const resumeDoc = await prisma.document.create({
    data: {
      id: resumeId,
      title: "资深全栈工程师简历",
      kind: 'resume',
      content: JSON.stringify(resumeContent),
      userId: testUserId,
      chatId: testChatId,
      messageId: testMessageId,
      status: 'APPROVED', // 直接设置为已通过进行验证
      createdAt: new Date(),
    }
  });

  await handleArtifactApproval(resumeDoc, dbService);
  
  // 验证简历是否在数据库中创建
  const resumes = await prisma.resume.findMany({
    where: { userId: testUserId, title: resumeContent.title }
  });
  if (resumes.length > 0) {
    console.log(`✅ 简历已自动创建: ${resumes[0].title}`);
  } else {
    console.error(`❌ 简历未创建!`);
  }

  // 3. 验证 Freelancer Registration 审核
  console.log(`\n--- 步骤 2: 验证自由职业者入驻 (freelancer_registration) 审核 ---`);
  const regId = `reg-${generateUUID().slice(0, 8)}`;
  const regContent = {
    bio: "专注 AI Agent 架构设计",
    hourlyRate: 500,
    skills: ["AI", "Architecture"]
  };

  const regDoc = await prisma.document.create({
    data: {
      id: regId,
      title: "自由职业者入驻申请",
      kind: 'freelancer_registration',
      content: JSON.stringify(regContent),
      userId: testUserId,
      chatId: testChatId,
      messageId: testMessageId,
      status: 'APPROVED',
      createdAt: new Date(),
    }
  });

  await handleArtifactApproval(regDoc, dbService);
  
  const profile = await prisma.workerProfile.findUnique({
    where: { userId: testUserId }
  });
  if (profile) {
    console.log(`✅ 自由职业者档案已创建/更新: ${profile.bio}`);
  } else {
    console.error(`❌ 自由职业者档案未创建!`);
  }

  // 4. 验证 Service 审核
  console.log(`\n--- 步骤 3: 验证服务 (service) 审核 ---`);
  const serviceId = `service-${generateUUID().slice(0, 8)}`;
  const serviceContent = {
    title: "AI Agent 咨询服务",
    description: "提供企业级 AI Agent 落地咨询",
    price: 2000,
    workerId: testUserId // 在 upsertWorkerProfile 中会使用 userId 作为 workerId
  };

  const serviceDoc = await prisma.document.create({
    data: {
      id: serviceId,
      title: "AI Agent 咨询服务",
      kind: 'service',
      content: JSON.stringify(serviceContent),
      userId: testUserId,
      chatId: testChatId,
      messageId: testMessageId,
      status: 'APPROVED',
      createdAt: new Date(),
    }
  });

  await handleArtifactApproval(serviceDoc, dbService);
  
  const services = await prisma.workerService.findMany({
    where: { worker: { userId: testUserId }, title: serviceContent.title }
  });
  if (services.length > 0) {
    console.log(`✅ 服务已自动创建: ${services[0].title}`);
  } else {
    console.error(`❌ 服务未创建!`);
  }

  // 5. 验证 Transaction 审核
  console.log(`\n--- 步骤 4: 验证交易 (transaction) 审核 ---`);
  const transId = `trans-${generateUUID().slice(0, 8)}`;
  const providerId = generateUUID(); // 模拟另一个用户作为服务提供者
  
  // 先创建提供者用户
  await prisma.user.create({
    data: {
      id: providerId,
      email: `provider-${providerId.slice(0, 8)}@example.com`,
      name: '测试服务提供者',
      password: 'password123',
    }
  });

  const transContent = {
    amount: 1000,
    customerId: testUserId,
    providerId: providerId,
    status: "PENDING",
    currency: "CNY"
  };

  const transDoc = await prisma.document.create({
    data: {
      id: transId,
      title: "交易凭证",
      kind: 'transaction',
      content: JSON.stringify(transContent),
      userId: testUserId,
      chatId: testChatId,
      messageId: testMessageId,
      status: 'APPROVED',
      createdAt: new Date(),
    }
  });

  await handleArtifactApproval(transDoc, dbService);
  
  const transactions = await prisma.transaction.findMany({
    where: { customerId: testUserId, amount: 1000 }
  });
  if (transactions.length > 0) {
    console.log(`✅ 交易记录已自动创建: ID ${transactions[0].id}`);
  } else {
    console.error(`❌ 交易记录未创建!`);
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
