// @ts-nocheck
import { 
  PrismaClient, 
  PriceType, 
  InquiryStatus, 
  UserRole, 
  worker_services_status, 
  TemplateStatus, 
  TransactionStatus, 
  PaymentStatus, 
  TemplateType, 
  QuotationStatus, 
  ConversationType,
  ConversationStatus,
  ChatVisibility,
  TaskType,
  TaskStatus,
  ShareTargetType,
  PackageTier,
  Document_kind,
  DocumentStatus,
  ChatRole
} from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') })
}

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('123123', 10)

  // 创建示例团队
  const uxinTeam = await (prisma as any).team.upsert({
    where: { id: 'proj-uxin' },
    update: { 
      name: '优薪团队',
      createdAt: new Date('2025-01-01T00:00:00Z'),
    },
    create: {
      id: 'proj-uxin',
      name: '优薪团队',
      description: '优薪核心项目团队',
      createdAt: new Date('2025-01-01T00:00:00Z'),
    }
  })

  // 为其他公司创建团队以满足外键约束
  await (prisma as any).team.upsert({
    where: { id: '示例客户公司' },
    update: { name: '示例客户公司' },
    create: { id: '示例客户公司', name: '示例客户公司' }
  })
  await (prisma as any).team.upsert({
    where: { id: '专业服务有限公司' },
    update: { name: '专业服务有限公司' },
    create: { id: '专业服务有限公司', name: '专业服务有限公司' }
  })
  await (prisma as any).team.upsert({
    where: { id: '平台管理' },
    update: { name: '平台管理' },
    create: { id: '平台管理', name: '平台管理' }
  })

  const customerData = {
    name: '张客户', 
    role: UserRole.CUSTOMER, 
    password: passwordHash,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=customer',
    phone: '13800138000',
    teamId: '示例客户公司',
    isVerified: true
  }
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: customerData,
    create: { 
      ...customerData,
      id: 'seed-user-customer', 
      email: 'customer@example.com', 
    }
  })

  const providerData = {
    name: '李服务商', 
    role: UserRole.PROVIDER, 
    isVerified: true, 
    password: passwordHash,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=provider',
    phone: '13900139000',
    teamId: '专业服务有限公司'
  }
  const provider = await prisma.user.upsert({
    where: { email: 'provider@example.com' },
    update: providerData,
    create: { 
      ...providerData,
      id: 'seed-user-provider', 
      email: 'provider@example.com', 
    }
  })

  // Seed Public Artifacts
  console.log('Seeding public artifacts...')
  
  const artifactKinds: { kind: Document_kind, title: string, content: string }[] = [
    { kind: 'text', title: '示例文档 (Text)', content: '这是一个公开的文本文档示例。\n\n# 标题\n\n正文内容...' },
    { kind: 'code', title: '示例代码 (Code)', content: 'console.log("Hello World");\n\nfunction test() {\n  return true;\n}' },
    { kind: 'image', title: '示例图片 (Image)', content: 'https://images.unsplash.com/photo-1575936123452-b67c3203c357' }, // Using a placeholder URL
    { kind: 'sheet', title: '示例表格 (Sheet)', content: JSON.stringify({ headers: ['Name', 'Age'], rows: [['Alice', 25], ['Bob', 30]] }) },
    { kind: 'quote', title: '示例报价 (Quote)', content: 'Service Quote details...' },
    { kind: 'project', title: '示例项目 (Project)', content: 'Project Management Plan...' },
    { kind: 'position', title: '示例职位 (Position)', content: 'Senior Frontend Engineer Position...' },
    { kind: 'requirement', title: '示例需求 (Requirement)', content: 'Product Requirements Document...' },
    { kind: 'resume', title: '示例简历 (Resume)', content: 'Candidate Resume...' },
    { kind: 'service', title: '示例服务 (Service)', content: 'Service Description...' },
    { kind: 'matching', title: '示例匹配 (Matching)', content: 'Talent Matching Report...' },
    { kind: 'approval', title: '示例审批 (Approval)', content: 'Budget Approval Request...' },
    { kind: 'contract', title: '示例合同 (Contract)', content: 'Service Agreement Contract...' },
    { kind: 'message', title: '示例消息 (Message)', content: 'Message content...' },
    { kind: 'report', title: '示例报告 (Report)', content: 'Monthly Progress Report...' },
    { kind: 'task', title: '示例任务 (Task)', content: 'Development Task...' },
    { kind: 'milestone', title: '示例里程碑 (Milestone)', content: 'Phase 1 Completion...' },
    { kind: 'iteration', title: '示例迭代 (Iteration)', content: 'Sprint 42 Plan...' },
    { kind: 'defect', title: '示例缺陷 (Defect)', content: 'Bug Report #123...' },
    { kind: 'risk', title: '示例风险 (Risk)', content: 'Risk Assessment...' },
    { kind: 'web', title: '示例网页 (Web)', content: '<html><body><h1>Hello</h1></body></html>' },
    { kind: 'agent', title: '示例智能体 (Agent)', content: 'Agent Configuration...' },
    { kind: 'admin', title: '示例管理 (Admin)', content: 'Admin Dashboard Config...' },
  ];

  for (const artifact of artifactKinds) {
    // 1. Create a Chat
    const chat = await prisma.chat.create({
      data: {
        title: `Public Chat for ${artifact.title}`,
        userId: customer.id,
        visibility: ChatVisibility.public,
      }
    });

    // 2. Create a Message (ChatMessage / Message_v2)
    const message = await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        role: 'assistant',
        content: `Here is the ${artifact.title}`, // Optional field, but good to have
        parts: [{ type: 'text', text: `Here is the ${artifact.title}` }],
        attachments: [],
        createdAt: new Date(),
      }
    });

    // 3. Create the Document
    await prisma.document.create({
      data: {
        title: artifact.title,
        content: artifact.content,
        kind: artifact.kind,
        userId: customer.id,
        chatId: chat.id,
        messageId: message.id,
        visibility: ChatVisibility.public,
        status: 'APPROVED', // DocumentStatus.APPROVED but using string literal to avoid enum import issues if any
        createdAt: new Date(),
      }
    });
  }

  console.log('Public artifacts seeded.')


  const adminData = {
    name: '管理员', 
    role: UserRole.ADMIN, 
    password: passwordHash,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    phone: '13700137000',
    teamId: '平台管理',
    isVerified: true
  }
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: adminData,
    create: { 
      ...adminData,
      id: 'seed-user-admin', 
      email: 'admin@example.com', 
    }
  })

  const linyiData = {
    name: '林一', 
    role: UserRole.ADMIN, 
    isVerified: true, 
    password: passwordHash,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=linyi',
    phone: '13800138001',
    teamId: 'proj-uxin'
  }
  const linyi = await prisma.user.upsert({
    where: { email: 'linyi@renrenvc.com' },
    update: linyiData,
    create: { 
      ...linyiData,
      id: 'seed-user-linyi', 
      email: 'linyi@renrenvc.com', 
    }
  })

  const uxinData = {
    name: '优薪用户', 
    role: UserRole.CUSTOMER, 
    isVerified: true, 
    password: passwordHash,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=uxin',
    phone: '13812345678',
    teamId: 'proj-uxin'
  }
  const uxin = await prisma.user.upsert({
    where: { email: 'uxin@163.com' },
    update: uxinData,
    create: { 
      ...uxinData,
      id: 'seed-user-uxin', 
      email: 'uxin@163.com', 
    }
  })

  // 移动聊天组件的模拟数据作为会话种子
  const zhangsanData = { name: '张三', role: UserRole.CUSTOMER, password: passwordHash }
  const zhangsan = await prisma.user.upsert({
    where: { email: 'zhangsan@example.com' },
    update: zhangsanData,
    create: {
      ...zhangsanData,
      id: 'seed-user-zhangsan',
      email: 'zhangsan@example.com',
    }
  })

  const lisiData = { name: '李四', role: UserRole.CUSTOMER, password: passwordHash }
  const lis = await prisma.user.upsert({
    where: { email: 'lisi@example.com' },
    update: lisiData,
    create: {
      ...lisiData,
      id: 'seed-user-lisi',
      email: 'lisi@example.com',
    }
  })

  const wangwuData = { name: '王五', role: UserRole.CUSTOMER, password: passwordHash }
  const wangwu = await prisma.user.upsert({
    where: { email: 'wangwu@example.com' },
    update: wangwuData,
    create: {
      ...wangwuData,
      id: 'seed-user-wangwu',
      email: 'wangwu@example.com',
    }
  })

  const zhaoliuData = { name: '赵六', role: UserRole.CUSTOMER, password: passwordHash }
  const zhaoliu = await prisma.user.upsert({
    where: { email: 'zhaoliu@example.com' },
    update: zhaoliuData,
    create: {
      ...zhaoliuData,
      id: 'seed-user-zhaoliu',
      email: 'zhaoliu@example.com',
    }
  })

  const sunqiData = { name: '孙七', role: UserRole.CUSTOMER, password: passwordHash }
  const sunqi = await prisma.user.upsert({
    where: { email: 'sunqi@example.com' },
    update: sunqiData,
    create: {
      ...sunqiData,
      id: 'seed-user-sunqi',
      email: 'sunqi@example.com',
    }
  })

  // Create Abdullah Ramzan user early to satisfy project member foreign keys
  const abdullahData = { name: '阿卜杜拉·拉姆赞', role: UserRole.PROVIDER, isVerified: true, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', password: passwordHash }
  const abdullah = await prisma.user.upsert({
    where: { email: 'abdullah@example.com' },
    update: abdullahData,
    create: {
      ...abdullahData,
      id: 'user_abdullah_001',
      email: 'abdullah@example.com',
    }
  })

  // Worker Profile for Linyi
  const linyiProfileData = {
    title: '资深全栈开发工程师 & AI 架构师',
    bio: '拥有 10 年以上互联网产品开发经验，精通 React, Node.js, Python 及 AI 模型集成。曾主导多个千万级用户产品的架构设计。',
    rating: 4.9,
    reviewCount: 128,
    location: '北京',
    languages: ['中文', '英语'] as any,
    skills: ['React', 'Next.js', 'Node.js', 'Python', 'OpenAI', 'LangChain', 'PostgreSQL', 'Docker'] as any,
    badges: ['TOP_RATED', 'VERIFIED_EXPERT'] as any,
    hourlyRateAmount: 500,
    hourlyRateCurrency: 'CNY',
    hourlyRateUnit: '/小时',
    responseTimeValue: 1,
    responseTimeUnit: 'hours',
    consultationEnabled: true,
    onlineStatus: true,
    isVerified: true,
    verifiedBy: '平台官方认证'
  }
  const linyiProfile = await prisma.workerProfile.upsert({
    where: { userId: linyi.id },
    update: linyiProfileData,
    create: {
      ...linyiProfileData,
      id: 'seed-worker-profile-linyi',
      userId: linyi.id,
    }
  })

  // Worker Services for Linyi
  const linyiService1Data = {
    workerId: linyiProfile.id,
    title: '企业级 AI 智能体 (AI Agent) 开发',
    description: '基于 LangChain 和 OpenAI 打造的企业级智能体，支持长短期记忆、工具调用、多步骤推理等。',
    coverImageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
    priceAmount: 8000,
    priceCurrency: 'CNY',
    unit: '起',
    deliveryTime: '14 天',
    category: 'AI 开发',
    status: worker_services_status.ACTIVE,
    rating: 5.0,
    reviewCount: 45,
    tags: ['AI', 'LLM', 'Agent', 'LangChain'] as any,
    features: ['提示词工程优化', '向量数据库集成', '自定义工具开发', '系统部署与监控'] as any
  }
  const linyiService1 = await prisma.workerService.upsert({
    where: { id: 'seed-worker-service-linyi-1' },
    update: linyiService1Data,
    create: {
      ...linyiService1Data,
      id: 'seed-worker-service-linyi-1',
    }
  })

  // Worker Portfolios for Linyi
  const linyiPortfolio1Data = {
    workerId: linyiProfile.id,
    title: '智能客服中台系统',
    description: '为某知名电商公司开发的智能客服系统，采用 RAG 技术，降低了 60% 的人工客服成本。',
    coverUrl: 'https://images.unsplash.com/photo-1551288049-bbbda536339a',
    projectUrl: 'https://example.com/project1',
    tags: ['AI', 'Python', 'React'] as any,
    images: ['https://images.unsplash.com/photo-1551288049-bbbda536339a'] as any
  }
  await prisma.workerPortfolio.upsert({
    where: { id: 'seed-worker-portfolio-linyi-1' },
    update: linyiPortfolio1Data,
    create: {
      ...linyiPortfolio1Data,
      id: 'seed-worker-portfolio-linyi-1',
    }
  })

  // Worker Certifications for Linyi
  const linyiCert1Data = {
    workerId: linyiProfile.id,
    skillName: 'AWS Certified Solutions Architect',
    level: 'Professional',
    issuer: 'Amazon Web Services',
    issueDate: new Date('2023-01-01'),
    isVerified: true
  }
  await prisma.workerSkillCertification.upsert({
    where: { id: 'seed-worker-cert-linyi-1' },
    update: linyiCert1Data,
    create: {
      ...linyiCert1Data,
      id: 'seed-worker-cert-linyi-1',
    }
  })

  // Worker Experiences for Linyi
  const linyiExp1Data = {
    workerId: linyiProfile.id,
    companyName: '人人风投 (RenRenVC)',
    roles: [
      {
        title: '技术总监',
        startDate: '2018-06',
        endDate: '至今',
        description: '负责公司核心产品的架构设计与团队管理，引入 AI 技术栈提升业务效率。'
      }
    ] as any
  }
  await prisma.workerExperience.upsert({
    where: { id: 'seed-worker-exp-linyi-1' },
    update: linyiExp1Data,
    create: {
      ...linyiExp1Data,
      id: 'seed-worker-exp-linyi-1',
    }
  })

  // Worker Schedules for Linyi
  for (let i = 1; i <= 5; i++) {
    const scheduleData = {
      workerId: linyiProfile.id,
      dayOfWeek: i,
      startTime: '09:00',
      endTime: '18:00',
      isAvailable: true
    }
    await prisma.workerSchedule.upsert({
      where: { id: `seed-worker-schedule-linyi-${i}` },
      update: scheduleData,
      create: {
        ...scheduleData,
        id: `seed-worker-schedule-linyi-${i}`,
      }
    })
  }

  // Seed Shared Employee Data for Linyi
  await seedSharedEmployeeData(linyi)

  const tplInquiryData = { name: '标准询价模板A', type: TemplateType.INQUIRY, schemaVersion: '1.0.0', styleAssets: { theme: 'light', layout: 'classic' } as any, status: TemplateStatus.ACTIVE }
  const tplInquiry = await prisma.template.upsert({
    where: { id: 'seed-tpl-inquiry' },
    update: tplInquiryData,
    create: { ...tplInquiryData, id: 'seed-tpl-inquiry' }
  })

  const tplQuotationData = { name: '标准报价模板B', type: TemplateType.QUOTATION, schemaVersion: '1.0.0', styleAssets: { theme: 'dark', layout: 'cards' } as any, status: TemplateStatus.ACTIVE }
  const tplQuotation = await prisma.template.upsert({
    where: { id: 'seed-tpl-quotation' },
    update: tplQuotationData,
    create: { ...tplQuotationData, id: 'seed-tpl-quotation' }
  })

  const quot1Data = {
    userId: provider.id,
    title: '企业官网开发服务1',
    description: '响应式设计、SEO优化、后台管理、售后服务',
    category: '网站开发',
    priceType: PriceType.RANGE,
    priceRangeMin: 5000,
    priceRangeMax: 15000,
    deliveryTime: '15-30天',
    includes: ['响应式设计', 'SEO优化', '后台管理系统', '一年售后服务'] as any,
    excludes: ['域名注册', '服务器托管'] as any,
    requirements: ['提供公司资料', '确定设计风格'] as any,
    templateId: tplQuotation.id
  }
  const quot1 = await prisma.quotation.upsert({
    where: { id: 'seed-quotation-1' },
    update: quot1Data,
    create: {
      ...quot1Data,
      id: 'seed-quotation-1',
    }
  })

  const quot2Data = {
    userId: provider.id,
    title: '移动APP开发服务',
    description: 'iOS与Android双平台开发，测试与发布',
    category: 'APP开发',
    priceType: PriceType.CUSTOM,
    deliveryTime: '30-60天',
    includes: ['UI/UX设计', '双平台开发', '功能测试'] as any,
    excludes: ['应用商店费用', '第三方服务'] as any,
    requirements: ['提供功能需求', '品牌素材'] as any,
    templateId: tplQuotation.id
  }
  await prisma.quotation.upsert({
    where: { id: 'seed-quotation-2' },
    update: quot2Data,
    create: {
      ...quot2Data,
      id: 'seed-quotation-2',
    }
  })

  const quot3Data = {
    userId: provider.id,
    title: '品牌VI设计套餐',
    description: 'Logo、名片、规范手册',
    category: '品牌设计',
    priceType: PriceType.RANGE,
    priceRangeMin: 8000,
    priceRangeMax: 20000,
    deliveryTime: '20-30天',
    includes: ['Logo设计', '名片设计', 'VI手册'] as any,
    excludes: ['印刷费用'] as any,
    requirements: ['品牌理念', '行业定位'] as any,
    templateId: tplQuotation.id
  }
  await prisma.quotation.upsert({
    where: { id: 'seed-quotation-3' },
    update: quot3Data,
    create: {
      ...quot3Data,
      id: 'seed-quotation-3',
    }
  })

  const inq1Data = {
    userId: customer.id,
    title: '电商平台开发需求',
    description: '包含商品、订单、支付等模块',
    category: '电商平台',
    budgetMin: 20000,
    budgetMax: 50000,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    requirements: ['多种支付方式', '订单跟踪', '用户管理'] as any,
    deliverables: ['完整平台', '文档', '源代码'] as any,
    location: '北京',
    status: InquiryStatus.ACTIVE,
    templateId: tplInquiry.id
  }
  const inq1 = await prisma.inquiry.upsert({
    where: { id: 'seed-inquiry-1' },
    update: inq1Data,
    create: {
      ...inq1Data,
      id: 'seed-inquiry-1',
    }
  })

  const inq2Data = {
    userId: customer.id,
    title: '企业LOGO设计',
    description: '现代简洁风格，包含版权转让',
    category: 'LOGO设计',
    budgetMin: 1000,
    budgetMax: 3000,
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    requirements: ['现代简洁风格', '体现企业理念'] as any,
    deliverables: ['设计稿', '源文件', '应用示例'] as any,
    location: '上海',
    status: InquiryStatus.ACTIVE,
    templateId: tplInquiry.id
  }
  await prisma.inquiry.upsert({
    where: { id: 'seed-inquiry-2' },
    update: inq2Data,
    create: {
      ...inq2Data,
      id: 'seed-inquiry-2',
    }
  })

  const aiProviderKeyData = {
    userId: admin.id,
    provider: 'deepseek',
    apiKey: 'placeholder',
    region: 'cn',
    active: false
  }
  await prisma.aIProviderKey.upsert({
    where: { id: 'seed-ai-key-admin' },
    update: aiProviderKeyData,
    create: {
      ...aiProviderKeyData,
      id: 'seed-ai-key-admin',
    }
  })

  const tx1Data = {
    inquiryId: inq1.id,
    quotationId: quot1.id,
    customerId: customer.id,
    providerId: provider.id,
    amount: 12000,
    currency: 'CNY',
    status: TransactionStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PENDING
  }
  await prisma.transaction.upsert({
    where: { id: 'seed-tx-1' },
    update: tx1Data,
    create: {
      ...tx1Data,
      id: 'seed-tx-1',
    }
  })

  const tx2Data = {
    inquiryId: inq1.id,
    quotationId: quot1.id,
    customerId: customer.id,
    providerId: provider.id,
    amount: 8000,
    currency: 'CNY',
    status: TransactionStatus.IN_PROGRESS,
    paymentStatus: PaymentStatus.PENDING
  }
  await prisma.transaction.upsert({
    where: { id: 'seed-tx-2' },
    update: tx2Data,
    create: {
      ...tx2Data,
      id: 'seed-tx-2',
    }
  })

  const tx3Data = {
    inquiryId: inq1.id,
    quotationId: quot1.id,
    customerId: customer.id,
    providerId: provider.id,
    amount: 15000,
    currency: 'CNY',
    status: TransactionStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID
  }
  await prisma.transaction.upsert({
    where: { id: 'seed-tx-3' },
    update: tx3Data,
    create: {
      ...tx3Data,
      id: 'seed-tx-3',
    }
  })

  // 评论数据在服务创建后再插入，避免外键约束错误

  const wpData = {
    title: '资深全栈开发者',
    bio: '擅长企业级Web开发与自动化集成，提供端到端解决方案。',
    rating: 4.6,
    reviewCount: 12,
    location: '北京',
    languages: ['中文', '英语'],
    skills: ['全栈开发', '自动化', 'API集成', '前端', '后端'],
    badges: ['Verified'],
    hourlyRateAmount: 200,
    hourlyRateCurrency: 'CNY',
    hourlyRateUnit: '/小时',
    responseTimeValue: 24,
    responseTimeUnit: '小时',
    isVerified: true,
    verifiedBy: 'UxIn Admin',
    verifiedDomains: ['软件开发', '系统集成']
  }
  const wp = await prisma.workerProfile.upsert({
    where: { userId: provider.id },
    update: wpData,
    create: {
      ...wpData,
      userId: provider.id,
      consultationEnabled: true,
      onlineStatus: true,
      services: {
        create: [
          {
            id: 'seed-prov-svc-1',
            title: '企业网站定制开发',
            description: '基于React/Node的企业官网与管理后台开发。',
            priceAmount: 15000,
            priceCurrency: 'CNY',
            coverImageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=60',
            deliveryTime: '7天',
            tags: ['推荐'] as any
          }
        ]
      },
      experiences: {
        create: [
          {
            id: 'seed-prov-exp-1',
            companyName: '优信科技',
            roles: [
              { title: '高级工程师', startDate: '2022-01', endDate: '2024-06' }
            ]
          }
        ]
      }
    }
  })

  const profileWithServices = await prisma.workerProfile.findUnique({
    where: { id: wp.id },
    include: { services: true }
  })
  // 确保服务存在（无论之前是否已seed）
  const provSvc1Data = {
    workerId: wp.id,
    title: '企业网站定制开发',
    description: '基于React/Node的企业官网与管理后台开发。',
    priceAmount: 15000,
    priceCurrency: 'CNY',
    coverImageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=60',
    deliveryTime: '7天',
    tags: ['推荐'] as any,
    features: ['响应式设计', '管理后台', 'SEO优化'] as any
  }
  await prisma.workerService.upsert({
    where: { id: 'seed-prov-svc-1' },
    update: provSvc1Data,
    create: {
      ...provSvc1Data,
      id: 'seed-prov-svc-1',
    }
  })
  const provSvc2Data = {
    workerId: wp.id,
    title: '小程序开发与发布',
    description: '基于 UniApp/微信生态的小程序开发、接入与发布。',
    priceAmount: 9800,
    priceCurrency: 'CNY',
    coverImageUrl: 'https://images.unsplash.com/photo-1558655146-9f4020f0dbaf?auto=format&fit=crop&w=1200&q=60',
    deliveryTime: '5天',
    tags: ['热门'] as any,
    features: ['微信生态接入', '支付集成', '发布部署'] as any
  }
  await prisma.workerService.upsert({
    where: { id: 'seed-prov-svc-2' },
    update: provSvc2Data,
    create: {
      ...provSvc2Data,
      id: 'seed-prov-svc-2',
    }
  })

  await prisma.review.createMany({
    data: [
      {
        id: 'seed-review-1',
        transactionId: 'seed-tx-3',
        serviceId: 'seed-prov-svc-1',
        providerId: provider.id,
        customerId: customer.id,
        rating: 5,
        aspects: { quality: 5, communication: 5, delivery: 5 } as any,
        title: '非常专业',
        content: '服务非常专业，交付迅速，沟通顺畅，值得推荐。',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'seed-review-2',
        transactionId: 'seed-tx-2',
        serviceId: 'seed-prov-svc-2',
        providerId: provider.id,
        customerId: customer.id,
        rating: 4,
        aspects: { quality: 4, communication: 4, delivery: 5 } as any,
        title: '体验不错',
        content: '整体体验不错，交付符合预期。',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    skipDuplicates: true
  })

  const convData = {
    userId: customer.id,
    type: ConversationType.GENERAL,
    status: ConversationStatus.ACTIVE
  }
  const conv = await prisma.aIConversation.upsert({
    where: { id: 'seed-conv-0' },
    update: convData,
    create: {
      ...convData,
      id: 'seed-conv-0',
    }
  })


  const shareLinkData = {
    targetType: ShareTargetType.INQUIRY,
    targetId: inq1.id,
    templateId: tplInquiry.id,
    url: `http://localhost:3000/share/seed-token-inquiry`
  }
  await prisma.shareLink.upsert({
    where: { token: 'seed-token-inquiry' },
    update: shareLinkData,
    create: {
      ...shareLinkData,
      token: `seed-token-inquiry`,
    }
  })

  

  const projUxinData = {
    userId: linyi.id,
    name: '优薪数字化平台研发',
    description: '下一代企业办公协作平台研发项目',
    progress: 75,
    status: '进行中',
    memberCount: 4,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-30'),
    dueDate: new Date('2025-12-30'),
    milestones: [
      { id: 'm1', title: '需求分析', status: 'COMPLETED', date: '2025-02-01' },
      { id: 'm2', title: '核心模块开发', status: 'IN_PROGRESS', date: '2025-06-01' }
    ] as any,
    documents: [
      { id: 'd1', title: '项目计划书', url: '#' },
      { id: 'd2', title: '架构设计文档', url: '#' }
    ] as any,
    teamId: 'proj-uxin',
  }

  const proj_uxin = await (prisma as any).project.upsert({
    where: { id: 'proj-uxin' },
    update: projUxinData,
    create: {
      ...projUxinData,
      id: 'proj-uxin',
    }
  })

  // 创建项目关联的文档
  const doc1Data = {
    id: 'd1',
    title: '项目计划书',
    content: '这是优薪数字化平台研发项目的详细计划书。包含里程碑、资源分配和风险评估。',
    kind: Document_kind.quote,
    userId: linyi.id,
    projectId: proj_uxin.id,
    createdAt: new Date('2025-01-01T00:00:00Z')
  }
  await (prisma as any).document.upsert({
    where: {
      id_createdAt: {
        id: 'd1',
        createdAt: new Date('2025-01-01T00:00:00Z')
      }
    },
    update: doc1Data,
    create: doc1Data
  })

  const doc2Data = {
    id: 'd2',
    title: '架构设计文档',
    content: '这是优薪数字化平台研发项目的架构设计文档。详细描述了系统架构、数据库设计和 API 规范。',
    kind: Document_kind.quote,
    userId: linyi.id,
    projectId: proj_uxin.id,
    createdAt: new Date('2025-01-02T00:00:00Z')
  }
  await (prisma as any).document.upsert({
    where: {
      id_createdAt: {
        id: 'd2',
        createdAt: new Date('2025-01-02T00:00:00Z')
      }
    },
    update: doc2Data,
    create: doc2Data
  })

  // Seed Linyi's Analysis Project, Requirements, Tasks and Agents (关联到 proj-uxin)
  await seedLinyiAnalysisData(linyi)

  // 为优薪项目添加团队成员关联
  const uxinMembers = [
    { userId: zhangsan.id, role: '项目经理' },
    { userId: lis.id, role: '技术负责人' },
    { userId: zhaoliu.id, role: '产品经理' },
    { userId: sunqi.id, role: 'UI设计师' },
    { userId: uxin.id, role: '后端工程师' }
  ]

  for (const member of uxinMembers) {
    await (prisma as any).projectTeamMember.upsert({
      where: {
        projectId_userId: {
          projectId: proj_uxin.id,
          userId: member.userId
        }
      },
      update: { role: member.role },
      create: {
        projectId: proj_uxin.id,
        userId: member.userId,
        role: member.role
      }
    })
  }

  // 为优薪项目添加风险数据
  const uxinRisks = [
    {
      id: 'risk-1',
      projectId: proj_uxin.id,
      title: '核心开发人员离职风险',
      description: '项目核心开发人员可能因个人原因离职，导致进度延误。',
      level: 'HIGH',
      status: 'OPEN',
      ownerId: linyi.id,
      probability: 'MEDIUM',
      impact: 'HIGH',
      mitigationPlan: '建立知识共享机制，完善文档，并储备后备人才。'
    },
    {
      id: 'risk-2',
      projectId: proj_uxin.id,
      title: '第三方 API 稳定性风险',
      description: '依赖的第三方支付 API 可能出现不稳定，影响交易流程。',
      level: 'MEDIUM',
      status: 'OPEN',
      ownerId: linyi.id,
      probability: 'LOW',
      impact: 'HIGH',
      mitigationPlan: '实现重试机制和备用支付渠道，监控 API 可用性。'
    }
  ]

  for (const risk of uxinRisks) {
    await (prisma as any).projectRisk.upsert({
      where: { id: risk.id },
      update: risk,
      create: risk
    })
  }

  const proj2Data = {
    userId: linyi.id,
    name: '市场推广活动 - Q4',
    description: '第四季度全国市场推广与品牌建设',
    progress: 40,
    status: '进行中',
    memberCount: 2,
    dueDate: new Date('2025-12-25'),
    teamId: 'proj-uxin',
  }

  const proj2 = await (prisma as any).project.upsert({
    where: { id: 'proj-2' },
    update: proj2Data,
    create: {
      ...proj2Data,
      id: 'proj-2',
    }
  })

  // 为项目2添加团队成员关联
  const proj2Members = [
    { userId: wangwu.id, role: '市场经理' },
    { userId: 'user_abdullah_001', role: 'AI专家' }
  ]

  for (const member of proj2Members) {
    await (prisma as any).projectTeamMember.upsert({
      where: {
        projectId_userId: {
          projectId: proj2.id,
          userId: member.userId
        }
      },
      update: { role: member.role },
      create: {
        projectId: proj2.id,
        userId: member.userId,
        role: member.role
      }
    })
  }

  const proj3Data = {
    userId: linyi.id,
    name: '企业文化手册更新',
    description: '2025年度企业文化与员工手册迭代',
    progress: 100,
    status: '已完成',
    memberCount: 1,
    dueDate: new Date('2025-11-20'),
    teamId: 'proj-uxin',
  }

  const proj3 = await (prisma as any).project.upsert({
    where: { id: 'proj-3' },
    update: proj3Data,
    create: {
      ...proj3Data,
      id: 'proj-3',
    }
  })

  // 为项目3添加团队成员关联
  await (prisma as any).projectTeamMember.upsert({
    where: {
      projectId_userId: {
        projectId: proj3.id,
        userId: linyi.id
      }
    },
    update: { role: '架构师' },
    create: {
      projectId: proj3.id,
      userId: linyi.id,
      role: '架构师'
    }
  })

  // Seed Project Requirements and Tasks for proj_uxin
  const req1Data = {
    projectId: proj_uxin.id,
    title: '后端架构设计与实现',
    description: '设计并实现高性能、可扩展的后端架构，支持多租户和高并发。',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
  }

  const req1 = await (prisma as any).projectRequirement.upsert({
    where: { id: 'seed-req-1' },
    update: req1Data,
    create: {
      ...req1Data,
      id: 'seed-req-1',
    }
  })

  const req2Data = {
    projectId: proj_uxin.id,
    title: '前端 UI/UX 开发',
    description: '基于现有设计稿，开发响应式、高性能的前端界面。',
    priority: 'MEDIUM',
    status: 'PENDING',
  }

  const req2 = await (prisma as any).projectRequirement.upsert({
    where: { id: 'seed-req-2' },
    update: req2Data,
    create: {
      ...req2Data,
      id: 'seed-req-2',
    }
  })

  // Seed Project Tasks for req1
  const task1Data = {
    projectId: proj_uxin.id,
    requirementId: req1.id,
    assigneeId: linyi.id,
    title: '数据库 Schema 设计',
    description: '根据业务需求，设计并优化 Prisma Schema。',
    priority: 'HIGH',
    status: 'COMPLETED',
    progress: 100,
    estimatedHours: 8,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-02'),
    subtasks: [
      { title: '分析业务模型', completed: true },
      { title: '编写 Prisma Schema', completed: true },
      { title: '执行数据库迁移', completed: true }
    ] as any,
  }

  await (prisma as any).projectTask.upsert({
    where: { id: 'seed-task-1' },
    update: task1Data,
    create: {
      ...task1Data,
      id: 'seed-task-1',
    }
  })

  const task2Data = {
    projectId: proj_uxin.id,
    requirementId: req1.id,
    assigneeId: linyi.id,
    title: 'API 接口开发 - 用户模块',
    description: '实现用户注册、登录及权限管理相关接口.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    progress: 60,
    estimatedHours: 16,
    startDate: new Date('2025-01-05'),
    dueDate: new Date('2025-01-10'),
    subtasks: [
      { title: '用户注册接口', completed: true },
      { title: '用户登录接口', completed: true },
      { title: '权限校验中间件', completed: false }
    ] as any,
  }

  await (prisma as any).projectTask.upsert({
    where: { id: 'seed-task-2' },
    update: task2Data,
    create: {
      ...task2Data,
      id: 'seed-task-2',
    }
  })

  const task3Data = {
    projectId: proj_uxin.id,
    requirementId: req2.id,
    assigneeId: customer.id,
    title: '首页布局开发',
    description: '实现首页响应式布局及核心组件开发。',
    priority: 'MEDIUM',
    status: 'PENDING',
    progress: 0,
    estimatedHours: 12,
    dueDate: new Date('2025-01-15'),
  }

  await (prisma as any).projectTask.upsert({
    where: { id: 'seed-task-3' },
    update: task3Data,
    create: {
      ...task3Data,
      id: 'seed-task-3',
    }
  })

  const pos1Data = {
    userId: provider.id,
    title: '前端工程师',
    description: '负责企业官网与后台管理系统的前端开发与优化。',
    teamId: '专业服务有限公司',
    location: '上海',
    employmentType: 'FULL_TIME',
    salaryMin: 15000,
    salaryMax: 25000,
    requirements: ['React', 'TypeScript', 'Tailwind'] as any,
    tags: ['招聘', '急招'] as any,
    status: 'OPEN'
  }

  const pos1 = await prisma.position.upsert({
    where: { id: 'seed-position-1' },
    update: pos1Data,
    create: {
      ...pos1Data,
      id: 'seed-position-1',
    }
  })

  const pos2Data = {
    userId: provider.id,
    title: '后端工程师',
    description: '参与API与微服务开发，保障系统稳定与性能。',
    teamId: '专业服务有限公司',
    location: '北京',
    employmentType: 'FULL_TIME',
    salaryMin: 18000,
    salaryMax: 28000,
    requirements: ['Node.js', 'MySQL', 'Redis'] as any,
    tags: ['招聘'] as any,
    status: 'OPEN'
  }

  const pos2 = await prisma.position.upsert({
    where: { id: 'seed-position-2' },
    update: pos2Data,
    create: {
      ...pos2Data,
      id: 'seed-position-2',
    }
  })

  const res1Data = {
    userId: customer.id,
    name: '张客户',
    title: '全栈工程师',
    summary: '具备前后端经验，擅长React/Node.js与MySQL。',
    skills: ['React', 'Node.js', 'MySQL', 'TypeScript'] as any,
    experiences: [{ company: '示例科技', role: '全栈工程师', years: 3 }] as any,
    education: [{ school: '示例大学', degree: '本科', major: '计算机科学' }] as any,
    location: '北京',
    status: 'ACTIVE'
  }

  const res1 = await prisma.resume.upsert({
    where: { id: 'seed-resume-1' },
    update: res1Data,
    create: {
      ...res1Data,
      id: 'seed-resume-1',
    }
  })

  const res2Data = {
    userId: customer.id,
    name: '李候选',
    title: '后端工程师',
    summary: '熟悉Node/Express，具备数据库与缓存经验。',
    skills: ['Node.js', 'Express', 'MySQL', 'Redis'] as any,
    experiences: [{ company: '互联网公司', role: '后端工程师', years: 2 }] as any,
    education: [{ school: '工科大学', degree: '本科', major: '软件工程' }] as any,
    location: '上海',
    status: 'ACTIVE'
  }

  const res2 = await prisma.resume.upsert({
    where: { id: 'seed-resume-2' },
    update: res2Data,
    create: {
      ...res2Data,
      id: 'seed-resume-2',
    }
  })

  await prisma.task.createMany({
    data: [
      {
        id: 'seed-task-1',
        type: 'PROJECT_RESUME_MATCHING',
        status: 'PENDING',
        priority: 0,
        payload: { projectId: proj_uxin.id, resumeId: res1.id } as any
      },
      {
        id: 'seed-task-2',
        type: 'RESUME_JOB_APPLICATION',
        status: 'PENDING',
        priority: 0,
        payload: { positionId: pos1.id, resumeId: res2.id } as any
      },
      {
        id: 'seed-task-3',
        type: 'SERVICE_QUOTE_REQUIREMENT',
        status: 'PENDING',
        priority: 0,
        payload: { inquiryId: inq1.id, serviceId: 'seed-prov-svc-1' } as any
      }
    ],
    skipDuplicates: true
  })

  const conv1Data = {
    userId: zhangsan.id,
    type: ConversationType.GENERAL,
    status: ConversationStatus.ACTIVE,
    context: { userName: '张三', lastMessage: '我想了解一下网站开发的价格', lastMessageTime: '2分钟前', unreadCount: 2, status: 'active', priority: 'high', assignedAgent: '小李' } as any
  }
  const conv1 = await prisma.aIConversation.upsert({
    where: { id: 'seed-conv-1' },
    update: conv1Data,
    create: {
      ...conv1Data,
      id: 'seed-conv-1',
    }
  })

  const conv2Data = {
    userId: lis.id,
    type: ConversationType.GENERAL,
    status: ConversationStatus.COMPLETED,
    context: { userName: '李四', lastMessage: '谢谢你的帮助，问题解决了', lastMessageTime: '15分钟前', unreadCount: 0, status: 'closed', priority: 'low' } as any
  }
  const conv2 = await prisma.aIConversation.upsert({
    where: { id: 'seed-conv-2' },
    update: conv2Data,
    create: {
      ...conv2Data,
      id: 'seed-conv-2',
    }
  })

  const conv3Data = {
    userId: wangwu.id,
    type: ConversationType.GENERAL,
    status: ConversationStatus.ACTIVE,
    context: { userName: '王五', lastMessage: '能帮我推荐一些设计师吗？', lastMessageTime: '1小时前', unreadCount: 1, status: 'active', priority: 'medium' } as any
  }
  const conv3 = await prisma.aIConversation.upsert({
    where: { id: 'seed-conv-3' },
    update: conv3Data,
    create: {
      ...conv3Data,
      id: 'seed-conv-3',
    }
  })

  // Create Abdullah Ramzan worker profile (user created earlier)
  const abdullahProfileData = {
    title: '商业战略与智能自动化的交汇点',
    bio: '我是一位拥有7年以上经验的AI自动化专家，致力于通过智能系统帮助企业简化运营。我专长于AI代理、聊天机器人、C语言等。',
    rating: 4.8,
    reviewCount: 45,
    location: '巴基斯坦',
    languages: ['英语', '乌尔都语'],
    skills: ['自动化与代理', '权力自动化', 'API开发', '软件开发人员', 'WordPress专家', 'Python', 'Machine Learning'],
    badges: ['Vetted Pro'],
    hourlyRateAmount: 45,
    hourlyRateCurrency: 'USD',
    hourlyRateUnit: '/小时',
    responseTimeValue: 2,
    responseTimeUnit: '小时',
    consultationEnabled: true,
    onlineStatus: true,
    isVerified: true,
    verifiedBy: 'Fiverr Pro',
    verifiedDomains: ['人工智能开发', '数据科学与机器学习', '软件开发']
  }

  const abdullahProfile = await prisma.workerProfile.upsert({
    where: { userId: abdullah.id },
    update: abdullahProfileData,
    create: {
      ...abdullahProfileData,
      userId: abdullah.id,
      services: {
        create: [
          {
            id: 'svc_001',
            title: '自动化与代理',
            description: '我将设置 n8n 自动化、n8n AI 代理、工作流与 AI 自动化。',
            coverImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=60',
            priceAmount: 350,
            priceCurrency: 'USD',
            unit: '/项目',
            deliveryTime: '3天交货',
            category: '开发',
            status: 'ACTIVE',
            tags: ['最相关'] as any,
            createdAt: new Date('2025-11-15T08:32:00.000Z')
          },
          {
            id: 'svc_002',
            title: 'AI 语音代理搭建',
            description: '使用 VAPI、Retell、Synthflow、Elevenlabs 构建语音代理。',
            coverImageUrl: 'https://images.unsplash.com/photo-1553531888-a3baeab24c2c?auto=format&fit=crop&w=1200&q=60',
            priceAmount: 500,
            priceCurrency: 'USD',
            unit: '/项目',
            deliveryTime: '7天交货',
            category: '开发',
            status: 'ACTIVE',
            rating: 5.0,
            reviewCount: 1,
            createdAt: new Date('2025-11-16T10:00:00.000Z')
          },
          {
            id: 'svc_003',
            title: '自动化产品描述与横幅设计',
            description: '为电商生成文案并设计宣传图片，提升转化。',
            coverImageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=60',
            priceAmount: 350,
            priceCurrency: 'USD',
            unit: '/项目',
            deliveryTime: '2天交货',
            category: '设计',
            status: 'ACTIVE'
          }
        ]
      },
      experiences: {
        create: [
          {
            id: 'exp_001',
            companyName: '新数字智能 (NDI)',
            roles: [
              {
                title: '国家总经理',
                startDate: '2024-11',
                endDate: null
              },
              {
                title: '生成式人工智工程师',
                startDate: '2024-06',
                endDate: '2024-11'
              }
            ]
          },
          {
            id: 'exp_002',
            companyName: 'S&P Global',
            roles: [
              {
                title: '软件工程师',
                startDate: '2023-06',
                endDate: '2024-09'
              }
            ]
          }
        ]
      }
    }
  })

  // Reviews for Abdullah's services
  const rev001Data = {
    providerId: abdullah.id,
    customerId: customer.id,
    serviceId: 'svc_002',
    rating: 5,
    title: '很棒',
    content: '交付准时，沟通顺畅',
    aspects: { quality: 5, communication: 5, delivery: 5, professionalism: 5 } as any,
    createdAt: new Date('2025-11-20T12:00:00.000Z')
  }
  await prisma.review.upsert({
    where: { id: 'rev_001' },
    update: rev001Data,
    create: {
      ...rev001Data,
      id: 'rev_001',
    }
  })

  const rev002Data = {
    providerId: abdullah.id,
    customerId: customer.id,
    serviceId: 'svc_001',
    rating: 4,
    title: '专业',
    content: '自动化方案合理',
    aspects: { quality: 5, communication: 4, delivery: 4, professionalism: 4 } as any,
    createdAt: new Date('2025-11-21T12:00:00.000Z')
  }
  await prisma.review.upsert({
    where: { id: 'rev_002' },
    update: rev002Data,
    create: {
      ...rev002Data,
      id: 'rev_002',
    }
  })

  const rev003Data = {
    providerId: abdullah.id,
    customerId: customer.id,
    serviceId: 'svc_003',
    rating: 3,
    title: '一般',
    content: '图片需要多次迭代',
    aspects: { quality: 3, communication: 3, delivery: 3, professionalism: 3 } as any,
    createdAt: new Date('2025-11-22T12:00:00.000Z')
  }
  await prisma.review.upsert({
    where: { id: 'rev_003' },
    update: rev003Data,
    create: {
      ...rev003Data,
      id: 'rev_003',
    }
  })

  // Service packages for svc_001
  const pkgSvc001Plans = [
    {
      id: 'plan_basic',
      tier: PackageTier.BASIC,
      name: '基础',
      priceAmount: 199,
      priceCurrency: 'USD',
      deliveryTime: '5天',
      features: [
        { key: 'analysis', label: '需求分析与范围界定', included: true },
        { key: 'workflow_basic', label: '基础工作流搭建（最多3个节点）', included: true },
        { key: 'testing', label: '基础测试与交付', included: true },
        { key: 'priority', label: '优先支持', included: false }
      ] as any
    },
    {
      id: 'plan_standard',
      tier: PackageTier.STANDARD,
      name: '标准',
      priceAmount: 399,
      priceCurrency: 'USD',
      deliveryTime: '7天',
      features: [
        { key: 'analysis', label: '需求分析与范围界定', included: true },
        { key: 'workflow_adv', label: '进阶工作流与第三方集成（最多6个节点）', included: true },
        { key: 'monitoring', label: '运行监控与告警', included: true },
        { key: 'priority', label: '优先支持（标准）', included: true }
      ] as any
    },
    {
      id: 'plan_premium',
      tier: PackageTier.PREMIUM,
      name: '高级',
      priceAmount: 699,
      priceCurrency: 'USD',
      deliveryTime: '10天',
      features: [
        { key: 'analysis', label: '需求分析与范围界定', included: true },
        { key: 'workflow_pro', label: '复杂工作流与多系统编排（不限节点上限）', included: true },
        { key: 'sla', label: 'SLA 响应（工作日4小时内）', included: true },
        { key: 'priority', label: '优先支持（高级）', included: true }
      ] as any
    },
    {
      id: 'plan_custom',
      tier: PackageTier.CUSTOM,
      name: '企业定制方案',
      priceAmount: 0,
      priceCurrency: 'USD',
      deliveryTime: '按合同',
      features: [
        { key: 'consulting', label: '架构咨询与专属顾问', included: true },
        { key: 'bespoke', label: '按需功能清单（双方约定）', included: true }
      ] as any
    }
  ]

  await prisma.servicePackage.upsert({
    where: { id: 'pkg_svc_001' },
    update: {
      serviceId: 'svc_001',
      plans: {
        upsert: pkgSvc001Plans.map(plan => ({
          where: { id: plan.id },
          update: plan,
          create: plan
        }))
      }
    },
    create: {
      id: 'pkg_svc_001',
      serviceId: 'svc_001',
      plans: {
        create: pkgSvc001Plans
      }
    }
  })

  // Abdullah quotations mapped to services
  const q1Data = {
    userId: abdullah.id,
    serviceId: 'svc_001',
    title: 'n8n 自动化与代理（套餐）',
    description: '基础/标准/高级/定制四档套餐，按需选择。',
    category: '开发',
    priceType: PriceType.CUSTOM,
    deliveryTime: '5-10天',
    includes: [{ key: 'workflow', label: '工作流搭建' }] as any,
    excludes: [{ key: 'infra', label: '基础设施费用' }] as any,
    requirements: [{ key: 'access', label: '提供系统访问' }] as any,
    status: QuotationStatus.ACTIVE
  }
  const q1 = await prisma.quotation.upsert({
    where: { id: 'q_abdullah_svc_001' },
    update: q1Data,
    create: {
      ...q1Data,
      id: 'q_abdullah_svc_001',
    }
  })

  const q2Data = {
    userId: abdullah.id,
    serviceId: 'svc_002',
    title: 'AI 语音代理搭建（套餐）',
    description: '语音代理端到端集成，含多供应商方案。',
    category: '开发',
    priceType: PriceType.CUSTOM,
    deliveryTime: '7-10天',
    includes: [{ key: 'voice', label: '语音代理配置' }] as any,
    excludes: [{ key: 'vendor', label: '第三方账号费用' }] as any,
    requirements: [{ key: 'scripts', label: '提供脚本与场景' }] as any,
    status: QuotationStatus.ACTIVE
  }
  const q2 = await prisma.quotation.upsert({
    where: { id: 'q_abdullah_svc_002' },
    update: q2Data,
    create: {
      ...q2Data,
      id: 'q_abdullah_svc_002',
    }
  })

  const q3Data = {
    userId: abdullah.id,
    serviceId: 'svc_003',
    title: '自动化文案与横幅设计（套餐）',
    description: '电商素材自动化生产，含文案+图片设计。',
    category: '设计',
    priceType: PriceType.CUSTOM,
    deliveryTime: '5-7天',
    includes: [{ key: 'copy', label: '文案生成' }] as any,
    excludes: [{ key: 'license', label: '素材版权费用' }] as any,
    requirements: [{ key: 'brand', label: '提供品牌规范' }] as any,
    status: QuotationStatus.ACTIVE
  }
  const q3 = await prisma.quotation.upsert({
    where: { id: 'q_abdullah_svc_003' },
    update: q3Data,
    create: {
      ...q3Data,
      id: 'q_abdullah_svc_003',
    }
  })

  // Link quotations to worker services
  await prisma.workerService.update({ where: { id: 'svc_001' }, data: { quotationId: q1.id } })
  await prisma.workerService.update({ where: { id: 'svc_002' }, data: { quotationId: q2.id } })
  await prisma.workerService.update({ where: { id: 'svc_003' }, data: { quotationId: q3.id } })
  await prisma.workerService.update({ where: { id: 'svc_001' }, data: { features: ['n8n自动化', 'AI代理', '工作流搭建'] as any } })
  await prisma.workerService.update({ where: { id: 'svc_002' }, data: { features: ['语音代理', '多供应商集成', '脚本配置'] as any } })
  await prisma.workerService.update({ where: { id: 'svc_003' }, data: { features: ['电商文案', '横幅设计', '转化优化'] as any } })
  
  // 官方套餐服务
  
  // Independent Requirement for linyi
  const reqIndependentData = {
    projectId: null,
    title: '独立需求 - 市场调研',
    description: '针对新市场的独立调研需求，不属于任何特定项目。',
    priority: 'MEDIUM',
    status: 'PENDING',
  }
  await (prisma as any).projectRequirement.upsert({
    where: { id: 'seed-req-independent' },
    update: reqIndependentData,
    create: {
      ...reqIndependentData,
      id: 'seed-req-independent',
    }
  });

  // Project with linked Service (Transaction)
  const txProject1Data = {
    projectId: proj_uxin.id,
    customerId: linyi.id,
    providerId: provider.id,
    amount: 5000,
    currency: 'CNY',
    status: TransactionStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID
  }
  await prisma.transaction.upsert({
    where: { id: 'seed-tx-project-1' },
    update: txProject1Data,
    create: {
      ...txProject1Data,
      id: 'seed-tx-project-1',
    }
  });

  // Project with linked Position
  const posProject1Data = {
    projectId: proj_uxin.id,
    userId: linyi.id,
    title: '项目高级工程师',
    description: '负责项目核心模块开发',
    status: 'OPEN'
  }
  await prisma.position.upsert({
    where: { id: 'seed-pos-project-1' },
    update: posProject1Data,
    create: {
      ...posProject1Data,
      id: 'seed-pos-project-1',
    }
  });

  const officialUserData = { name: '官方服务中心', role: UserRole.PROVIDER, isVerified: true, password: passwordHash }
  const officialUser = await prisma.user.upsert({
    where: { email: 'official@example.com' },
    update: officialUserData,
    create: {
      ...officialUserData,
      id: 'user_official_001',
      email: 'official@example.com',
    }
  })

  const officialProfileData = {
    title: '官方AI自动化套餐',
    bio: '平台官方提供标准化套餐服务',
    rating: 5.0,
    reviewCount: 0,
    isVerified: true
  }
  const officialProfile = await prisma.workerProfile.upsert({
    where: { userId: officialUser.id },
    update: officialProfileData,
    create: {
      ...officialProfileData,
      userId: officialUser.id,
      services: {
        create: [
          {
            id: 'official_svc_001',
            title: '官方AI自动化标准套餐',
            description: '官方出品的标准化自动化集成服务，含需求分析、工作流搭建与交付。',
            coverImageUrl: 'https://images.unsplash.com/photo-1523961131990-5ea13d8111c1?auto=format&fit=crop&w=1200&q=60',
            priceAmount: 2999,
            priceCurrency: 'CNY',
            unit: '/项目',
            category: '开发',
            status: worker_services_status.ACTIVE,
            tags: ['官方', '推荐'] as any
          }
        ]
      }
    }
  })

  const officialSvc001Data = {
    workerId: officialProfile.id,
    title: '官方AI自动化标准套餐',
    description: '官方出品的标准化自动化集成服务，含需求分析、工作流搭建与交付。',
    coverImageUrl: 'https://images.unsplash.com/photo-1523961131990-5ea13d8111c1?auto=format&fit=crop&w=1200&q=60',
    priceAmount: 2999,
    priceCurrency: 'CNY',
    unit: '/项目',
    category: '开发',
    status: worker_services_status.ACTIVE,
    tags: ['官方', '推荐'] as any,
    features: ['需求分析', '标准工作流', '交付保障'] as any
  }
  await prisma.workerService.upsert({
    where: { id: 'official_svc_001' },
    update: officialSvc001Data,
    create: {
      ...officialSvc001Data,
      id: 'official_svc_001',
    }
  })

  const pkgOfficial001Plans = [
    {
      id: 'plan_off_basic',
      tier: PackageTier.BASIC,
      name: '基础',
      priceAmount: 999,
      priceCurrency: 'CNY',
      deliveryTime: '3天',
      features: [
        { key: 'analysis', label: '需求分析', included: true },
        { key: 'workflow', label: '基础工作流搭建', included: true }
      ] as any
    },
    {
      id: 'plan_off_standard',
      tier: PackageTier.STANDARD,
      name: '标准',
      priceAmount: 2999,
      priceCurrency: 'CNY',
      deliveryTime: '5天',
      features: [
        { key: 'integration', label: '第三方集成', included: true },
        { key: 'monitoring', label: '运行监控', included: true }
      ] as any
    },
    {
      id: 'plan_off_premium',
      tier: PackageTier.PREMIUM,
      name: '高级',
      priceAmount: 5999,
      priceCurrency: 'CNY',
      deliveryTime: '7天',
      features: [
        { key: 'orchestration', label: '多系统编排', included: true },
        { key: 'sla', label: 'SLA支持', included: true }
      ] as any
    }
  ]

  await prisma.servicePackage.upsert({
    where: { id: 'pkg_official_001' },
    update: {
      serviceId: 'official_svc_001',
      plans: {
        upsert: pkgOfficial001Plans.map(plan => ({
          where: { id: plan.id },
          update: plan,
          create: plan
        }))
      }
    },
    create: {
      id: 'pkg_official_001',
      serviceId: 'official_svc_001',
      plans: {
        create: pkgOfficial001Plans
      }
    }
  })

  const faqOff1Data = {
    serviceId: 'official_svc_001',
    question: '该官方套餐适用于哪些场景？',
    answer: '适用于需要快速落地的自动化集成场景，提供标准化交付与保障。'
  }
  await prisma.serviceFAQ.upsert({
    where: { id: 'faq_off_001' },
    update: faqOff1Data,
    create: {
      ...faqOff1Data,
      id: 'faq_off_001',
    }
  })

  const faqOff2Data = {
    serviceId: 'official_svc_001',
    question: '是否支持定制扩展？',
    answer: '支持，根据企业需求提供定制扩展与SLA服务。'
  }
  await prisma.serviceFAQ.upsert({
    where: { id: 'faq_off_002' },
    update: faqOff2Data,
    create: {
      ...faqOff2Data,
      id: 'faq_off_002',
    }
  })

  // Seed AI Chat Data
  const chatData = {
    userId: customer.id,
    title: 'AI Chat Seed Test',
    visibility: ChatVisibility.private,
    createdAt: new Date(),
  }
  const chat = await prisma.chat.upsert({
    where: { id: 'seed-chat-1' },
    update: chatData,
    create: {
      ...chatData,
      id: 'seed-chat-1',
    }
  })

  const chatMsg1Data = {
    chatId: chat.id,
    role: 'user',
    parts: [{ text: 'Hello AI' }] as any,
    attachments: [] as any,
    createdAt: new Date(),
  }
  const chatMsg1 = await prisma.chatMessage.upsert({
    where: { id: 'seed-chat-msg-1' },
    update: chatMsg1Data,
    create: {
      ...chatMsg1Data,
      id: 'seed-chat-msg-1',
    }
  })

  const chatMsg2Data = {
    chatId: chat.id,
    role: 'assistant',
    parts: [{ text: 'Hello! How can I help you today?' }] as any,
    attachments: [] as any,
    createdAt: new Date(),
  }
  const chatMsg2 = await prisma.chatMessage.upsert({
    where: { id: 'seed-chat-msg-2' },
    update: chatMsg2Data,
    create: {
      ...chatMsg2Data,
      id: 'seed-chat-msg-2',
    }
  })

  const docId = 'seed-doc-1';
  const docCreatedAt = new Date('2024-01-01T00:00:00Z');
  
  const docData = {
    title: 'Seed Document',
    content: 'This is a seed document content.',
    kind: Document_kind.text,
    userId: customer.id,
  }
  const doc = await prisma.document.upsert({
    where: { id_createdAt: { id: docId, createdAt: docCreatedAt } },
    update: docData,
    create: {
      ...docData,
      id: docId,
      createdAt: docCreatedAt,
    }
  })

  const suggestionData = {
    documentId: doc.id,
    documentCreatedAt: doc.createdAt,
    originalText: 'seed document',
    suggestedText: 'Seed Document',
    description: 'Capitalize title',
    isResolved: false,
    userId: customer.id,
    createdAt: new Date(),
  }
  const suggestion = await prisma.suggestion.upsert({
    where: { id: 'seed-suggestion-1' },
    update: suggestionData,
    create: {
      ...suggestionData,
      id: 'seed-suggestion-1',
    }
  })

  const streamData = {
    chatId: chat.id,
    createdAt: new Date(),
  }
  const stream = await prisma.stream.upsert({
    where: { id: 'seed-stream-1' },
    update: streamData,
    create: {
      ...streamData,
      id: 'seed-stream-1',
    }
  })

  await prisma.vote.upsert({
    where: { chatId_messageId: { chatId: chat.id, messageId: chatMsg2.id } },
    update: {
      isUpvoted: true,
    },
    create: {
      chatId: chat.id,
      messageId: chatMsg2.id,
      isUpvoted: true,
    }
  })

  await seedSquareExamples()
  await seedWorkbenchAndContacts(customer, passwordHash)
  await seedLinyiMessages(linyi, provider, passwordHash)
  await seedProjectTasks(linyi, uxin)
  await seedLinyiServiceData(linyi)
  await seedSimulatedContacts(linyi, admin, passwordHash)
  await seedMCPTools()
  await seedPublicArtifacts(customer)
}

async function seedPublicArtifacts(user: any) {
  const artifactKinds = Object.values(Document_kind);

  console.log('Seeding public artifacts...');
  for (const kind of artifactKinds) {
    // Create Chat
    const chat = await prisma.chat.create({
      data: {
        userId: user.id,
        title: `Public Artifact: ${kind}`,
        visibility: ChatVisibility.public,
        createdAt: new Date(),
      }
    });

    // Create Message
    const message = await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        role: 'assistant',
        parts: [{ text: `Here is a public artifact of type ${kind}` }] as any,
        attachments: [] as any,
        createdAt: new Date(),
      }
    });

    // Create Document
    await prisma.document.create({
      data: {
        title: `Public ${kind} Document`,
        content: `Sample content for ${kind}`,
        kind: kind,
        userId: user.id,
        chatId: chat.id,
        messageId: message.id,
        status: DocumentStatus.APPROVED,
        visibility: ChatVisibility.public,
        createdAt: new Date(),
      }
    });
  }
  console.log('Public artifacts seeded.');
}

async function seedMCPTools() {
  const mcpToolsData = [
    // --- 项目协作 (6) ---
    {
      id: 'mcp-project-create',
      name: 'project_create',
      description: '创建新项目。需要参数：name(项目名称), description(描述), owner_id(负责人ID), start_date(开始日期), end_date(结束日期), budget(预算)',
      avatar: '🚀',
      skills: ['project-management', 'collaboration'],
      isBuiltIn: true,
      type: 'REST',
      publisher: 'System',
    },
    {
      id: 'mcp-milestone-create',
      name: 'milestone_create',
      description: '创建项目里程碑。参数：project_id(项目ID), title(里程碑标题), due_date(截止日期), description(描述)',
      avatar: '🚩',
      skills: ['milestone', 'planning'],
      isBuiltIn: true,
      type: 'REST',
      publisher: 'System',
    },
    {
      id: 'mcp-requirement-create',
      name: 'requirement_create',
      description: '创建项目需求。参数：project_id(项目ID), title(需求标题), description(详细描述), priority(优先级), status(状态), assignee_id(负责人)',
      avatar: '📋',
      skills: ['requirement', 'product'],
      isBuiltIn: true,
      type: 'REST',
      publisher: 'System',
    },
    {
      id: 'mcp-task-create',
      name: 'task_create',
      description: '创建任务。参数：project_id(项目ID), requirement_id(可选:需求ID), title(任务标题), description(描述), assignee_id(负责人), estimated_hours(预计工时), priority(优先级)',
      avatar: '✅',
      skills: ['task', 'execution'],
      isBuiltIn: true,
      type: 'REST',
      publisher: 'System',
    },
    {
      id: 'mcp-task-update-status',
      name: 'task_update_status',
      description: '更新任务状态。参数：task_id(任务ID), status(新状态: pending, in_progress, completed, failed)',
      avatar: '🔄',
      skills: ['task', 'status'],
      isBuiltIn: true,
      type: 'REST',
      publisher: 'System',
    },
    {
      id: 'mcp-collaboration-dispatch',
      name: 'collaboration_dispatch',
      description: '智能体协作调度。将任务分配给特定角色的智能体，并建立依赖关系。',
      avatar: '🤝',
      skills: ['multi-agent', 'orchestration'],
      isBuiltIn: true,
      type: 'REST',
      publisher: 'System',
    },

    // --- 智能体协作 (2) ---
    {
      id: 'mcp-agent-collaboration-plan',
      name: 'agent_collaboration_plan',
      description: '基于流程图的智能体协作编排：生成任务分解与依赖关系。',
      avatar: '🗺️',
      skills: ['planning', 'agents'],
      isBuiltIn: true,
      type: 'REST',
      publisher: 'System',
    },
    {
      id: 'mcp-agent-collaboration-start',
      name: 'agent_collaboration_start',
      description: '启动智能体协作编排：生成计划，并可选创建项目任务与执行协作调度。',
      avatar: '⚡',
      skills: ['execution', 'agents'],
      isBuiltIn: true,
      type: 'REST',
      publisher: 'System',
    },

    // --- 自由职业者 (5) ---
    {
      id: 'mcp-freelancer-register',
      name: 'freelancer_register',
      description: '注册自由职业者。参数：name(姓名), email(邮箱), phone(电话), country(国家), timezone(时区), preferred_languages(首选语言), payment_methods(支付方式)',
      avatar: '👤',
      skills: ['freelancer', 'onboarding'],
      isBuiltIn: true,
      type: 'REST',
      publisher: 'System',
    },
    {
      id: 'mcp-resume-create',
      name: 'resume_create',
      description: '创建或更新自由职业者简历。参数：freelancer_id(自由职业者ID), title(简历标题), summary(个人简介), skills(技能列表), experience(工作经验), education(教育背景), hourly_rate(时薪), availability(可工作时间)',
      avatar: '📄',
      skills: ['resume', 'profile'],
      isBuiltIn: true,
      type: 'REST',
      publisher: 'System',
    },
    {
      id: 'mcp-service-create',
      name: 'service_create',
      description: '创建自由职业者服务。参数：freelancer_id(自由职业者ID), title(服务标题), description(服务描述), category(服务类别), price_type(计价方式), price(价格), delivery_time(交付时间), revisions(修改次数)',
      avatar: '🛠️',
      skills: ['service', 'offering'],
      isBuiltIn: true,
      type: 'REST',
      publisher: 'System',
    },
    {
      id: 'mcp-transaction-create',
      name: 'transaction_create',
      description: '创建服务交易。参数：client_id(客户ID), freelancer_id(自由职业者ID), service_id(服务ID), amount(金额), currency(货币), description(交易描述), terms(条款)',
      avatar: '💰',
      skills: ['transaction', 'payment'],
      isBuiltIn: true,
      type: 'REST',
      publisher: 'System',
    },
    {
      id: 'mcp-contract-create',
      name: 'contract_create',
      description: '创建或更新合同。参数：transaction_id(交易ID), terms(详细条款), signatures(签名状态), attachments(附件列表)',
      avatar: '📜',
      skills: ['contract', 'legal'],
      isBuiltIn: true,
      type: 'REST',
      publisher: 'System',
    },
  ];

  for (const tool of mcpToolsData) {
    await (prisma as any).mCPTool.upsert({
      where: { id: tool.id },
      update: tool,
      create: tool,
    });
  }
}

async function seedSimulatedContacts(linyi: any, admin: any, passwordHash: string) {
  // 1. 插入智能体模拟数据
  const defaultAgentsData = [
    {
      id: 'sys-ceo',
      name: '老板/CEO智能体',
      prompt: '负责项目的老板层级决策、任务分配及进度监控。',
      identifier: 'sys-ceo',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ceo',
      mermaid: 'graph TD; A[决策] --> B[分配]; B --> C[监控];',
      departmentId: 'dept-admin',
      selectedTools: ['createTasks', 'updateTasks', 'startCollaboration', 'matchAgents', 'project', 'collaboration']
    },
    {
      id: 'sys-dev',
      name: '研发负责人智能体',
      prompt: '负责项目的研发负责人层级决策、任务分配及进度监控。',
      identifier: 'sys-dev',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=dev',
      mermaid: 'graph TD; A[架构] --> B[开发]; B --> C[测试];',
      departmentId: 'dept-dev',
      selectedTools: ['createTasks', 'updateTasks', 'startCollaboration', 'matchAgents', 'project', 'collaboration']
    },
    {
      id: 'sys-ops',
      name: '运营主管智能体',
      prompt: '负责项目的运营主管层级决策、任务分配及进度监控。',
      identifier: 'sys-ops',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ops',
      mermaid: 'graph TD; A[计划] --> B[执行]; B --> C[反馈];',
      departmentId: 'dept-ops',
      selectedTools: ['createTasks', 'updateTasks', 'startCollaboration', 'matchAgents', 'project', 'collaboration']
    },
    {
      id: 'sys-hr',
      name: '人事主管智能体',
      prompt: '负责项目的人事层级决策、任务分配及进度监控。',
      identifier: 'sys-hr',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=hr',
      mermaid: 'graph TD; A[招聘] --> B[培训]; B --> C[考核];',
      departmentId: 'dept-hr',
      selectedTools: ['createTasks', 'updateTasks', 'startCollaboration', 'matchAgents', 'project', 'collaboration']
    },
    {
      id: 'sys-fin',
      name: '财务总监智能体',
      prompt: '负责项目的财务总监层级决策、任务分配及进度监控。',
      identifier: 'sys-fin',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=fin',
      mermaid: 'graph TD; A[预算] --> B[支出]; B --> C[审计];',
      departmentId: 'dept-fin',
      selectedTools: ['createTasks', 'updateTasks', 'startCollaboration', 'matchAgents', 'project', 'collaboration']
    },
    {
      id: 'sys-admin',
      name: '行政助理智能体',
      prompt: '负责项目的行政办公、后勤支持及文档管理。',
      identifier: 'sys-admin',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
      mermaid: 'graph TD; A[收发] --> B[整理]; B --> C[存档];',
      departmentId: 'dept-admin',
      selectedTools: ['createTasks', 'updateTasks', 'startCollaboration', 'matchAgents', 'project', 'collaboration']
    }
  ];

  for (const agent of defaultAgentsData) {
    await (prisma as any).agent.upsert({
      where: { id: agent.id },
      update: agent,
      create: {
        ...agent,
        userId: admin.id,
      },
    });

    await (prisma as any).userContact.upsert({
      where: { userId_agentId: { userId: linyi.id, agentId: agent.id } },
      update: { groupName: '系统智能体', isStarred: true },
      create: {
        userId: linyi.id,
        agentId: agent.id,
        groupName: '系统智能体',
        isStarred: true,
      }
    });
  }

  // 2. 插入自由职业者模拟数据
  const freelancersData = [
    {
      id: 'seed-freelancer-f1',
      email: 'artem.p@freelancer.com',
      name: '阿尔捷姆-P',
      jobTitle: '网页开发',
      companyName: '自由职业者',
      departmentId: 'dept-dev',
    },
    {
      id: 'seed-freelancer-f2',
      email: 'anne.grayson@techcorp.com',
      name: '安妮·格雷森',
      jobTitle: '项目经理',
      companyName: 'TechCorp Inc.',
      departmentId: 'dept-ops',
    },
    {
      id: 'seed-freelancer-f3',
      email: 'li.ming@finance.com',
      name: '李明',
      jobTitle: '高级会计',
      companyName: '自由职业',
      departmentId: 'dept-fin',
    },
    {
      id: 'seed-freelancer-f4',
      email: 'zhang.hua@admin.com',
      name: '张华',
      jobTitle: '行政专员',
      companyName: '自由职业',
      departmentId: 'dept-admin',
    }
  ];

  for (const f of freelancersData) {
    const user = await prisma.user.upsert({
      where: { email: f.email },
      update: {
        name: f.name,
        role: UserRole.PROVIDER,
        jobTitle: f.jobTitle,
        departmentId: f.departmentId,
      },
      create: {
        id: f.id,
        email: f.email,
        name: f.name,
        role: UserRole.PROVIDER,
        password: passwordHash,
        jobTitle: f.jobTitle,
        isVerified: true,
        departmentId: f.departmentId,
      }
    });

    await prisma.workerProfile.upsert({
      where: { userId: user.id },
      update: {
        title: f.jobTitle,
      },
      create: {
        userId: user.id,
        title: f.jobTitle,
        bio: `${f.name} 是一位资深的 ${f.jobTitle}，在 ${f.companyName} 工作。`,
      }
    });

    await (prisma as any).userContact.upsert({
      where: { userId_contactId: { userId: linyi.id, contactId: user.id } },
      update: { groupName: '外部专家' },
      create: {
        userId: linyi.id,
        contactId: user.id,
        groupName: '外部专家',
        isStarred: false,
      }
    });
  }
  console.log('Simulated agents and freelancers seeded.');
}

async function seedLinyiServiceData(linyi: any) {
  // 1. Worker Profile for Linyi
  const linyiProfile = await prisma.workerProfile.upsert({
    where: { userId: linyi.id },
    update: {
      title: '全栈架构师 & AI 自动化专家',
      bio: '拥有 10 年互联网产品开发经验，擅长从 0 到 1 构建复杂系统。精通 AI 代理集成、自动化流程设计以及高性能后端架构。',
      rating: 4.9,
      reviewCount: 128,
      location: '北京',
      languages: ['中文', '英语'],
      skills: ['Next.js', 'Node.js', 'Python', 'AI Automation', 'System Architecture'],
      badges: ['Expert', 'Top Rated'],
      hourlyRateAmount: 500,
      hourlyRateCurrency: 'CNY',
      hourlyRateUnit: '/小时',
      responseTimeValue: 1,
      responseTimeUnit: '小时',
      consultationEnabled: true,
      onlineStatus: true,
      isVerified: true,
      verifiedBy: 'UxIn Official',
      verifiedDomains: ['系统架构', 'AI 集成']
    },
    create: {
      userId: linyi.id,
      title: '全栈架构师 & AI 自动化专家',
      bio: '拥有 10 年互联网产品开发经验，擅长从 0 到 1 构建复杂系统。精通 AI 代理集成、自动化流程设计以及高性能后端架构。',
      rating: 4.9,
      reviewCount: 128,
      location: '北京',
      languages: ['中文', '英语'],
      skills: ['Next.js', 'Node.js', 'Python', 'AI Automation', 'System Architecture'],
      badges: ['Expert', 'Top Rated'],
      hourlyRateAmount: 500,
      hourlyRateCurrency: 'CNY',
      hourlyRateUnit: '/小时',
      responseTimeValue: 1,
      responseTimeUnit: '小时',
      consultationEnabled: true,
      onlineStatus: true,
      isVerified: true,
      verifiedBy: 'UxIn Official',
      verifiedDomains: ['系统架构', 'AI 集成']
    }
  })

  // 2. Worker Services for Linyi
  const svc1Id = 'linyi-svc-001';
  const svc2Id = 'linyi-svc-002';

  await prisma.workerService.upsert({
    where: { id: svc1Id },
    update: {
      workerId: linyiProfile.id,
      title: '企业级 AI 自动化工作流搭建',
      description: '利用 n8n, LangChain 和 OpenAI 构建端到端的业务自动化流程，显著提升企业人效。',
      coverImageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=60',
      priceAmount: 19999,
      priceCurrency: 'CNY',
      unit: '/项目',
      deliveryTime: '14天',
      category: 'AI 开发',
      status: 'ACTIVE',
      tags: ['热门', '专业'] as any,
      features: ['业务流程分析', '自定义 AI 代理', '多系统集成', '3个月售后服务'] as any
    },
    create: {
      id: svc1Id,
      workerId: linyiProfile.id,
      title: '企业级 AI 自动化工作流搭建',
      description: '利用 n8n, LangChain 和 OpenAI 构建端到端的业务自动化流程，显著提升企业人效。',
      coverImageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=60',
      priceAmount: 19999,
      priceCurrency: 'CNY',
      unit: '/项目',
      deliveryTime: '14天',
      category: 'AI 开发',
      status: 'ACTIVE',
      tags: ['热门', '专业'] as any,
      features: ['业务流程分析', '自定义 AI 代理', '多系统集成', '3个月售后服务'] as any
    }
  })

  await prisma.workerService.upsert({
    where: { id: svc2Id },
    update: {
      workerId: linyiProfile.id,
      title: '高性能云原生后端架构咨询',
      description: '针对高并发场景的架构设计与优化，包含数据库调优、缓存策略以及微服务治理。',
      coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=60',
      priceAmount: 5000,
      priceCurrency: 'CNY',
      unit: '/小时',
      deliveryTime: '按需',
      category: '架构咨询',
      status: 'ACTIVE',
      tags: ['资深', '专家'] as any,
      features: ['现有架构审计', '性能瓶颈分析', '技术栈演进规划', '实施方案文档'] as any
    },
    create: {
      id: svc2Id,
      workerId: linyiProfile.id,
      title: '高性能云原生后端架构咨询',
      description: '针对高并发场景的架构设计与优化，包含数据库调优、缓存策略以及微服务治理。',
      coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=60',
      priceAmount: 5000,
      priceCurrency: 'CNY',
      unit: '/小时',
      deliveryTime: '按需',
      category: '架构咨询',
      status: 'ACTIVE',
      tags: ['资深', '专家'] as any,
      features: ['现有架构审计', '性能瓶颈分析', '技术栈演进规划', '实施方案文档'] as any
    }
  })

  // 3. Portfolios for Linyi
  await prisma.workerPortfolio.upsert({
    where: { id: 'linyi-portfolio-1' },
    update: {
      workerId: linyiProfile.id,
      title: '某大型电商平台秒杀系统架构',
      description: '成功应对双十一千万级 QPS 压力，系统零故障运行。',
      coverUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=800&q=60',
      tags: ['高并发', 'Redis', 'Kafka'] as any
    },
    create: {
      id: 'linyi-portfolio-1',
      workerId: linyiProfile.id,
      title: '某大型电商平台秒杀系统架构',
      description: '成功应对双十一千万级 QPS 压力，系统零故障运行。',
      coverUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=800&q=60',
      tags: ['高并发', 'Redis', 'Kafka'] as any
    }
  })

  // 4. Skill Certifications for Linyi
  await prisma.workerSkillCertification.upsert({
    where: { id: 'linyi-cert-1' },
    update: {
      workerId: linyiProfile.id,
      skillName: 'AWS Solutions Architect - Professional',
      level: 'Expert',
      issuer: 'Amazon Web Services',
      isVerified: true
    },
    create: {
      id: 'linyi-cert-1',
      workerId: linyiProfile.id,
      skillName: 'AWS Solutions Architect - Professional',
      level: 'Expert',
      issuer: 'Amazon Web Services',
      isVerified: true
    }
  })

  // 5. Resume for Linyi
  await prisma.resume.upsert({
    where: { id: 'linyi-resume-main' },
    update: {
      userId: linyi.id,
      name: '林一的个人简历',
      title: '资深全栈工程师',
      summary: '10 年以上开发经验，曾在知名互联网公司担任架构师。',
      skills: ['Next.js', 'React', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'K8s'] as any,
      experiences: [
        { company: '人人创投', role: '技术合伙人', period: '2020 - 至今' },
        { company: '某知名互联网大厂', role: '高级架构师', period: '2015 - 2020' }
      ] as any,
      status: 'ACTIVE'
    },
    create: {
      id: 'linyi-resume-main',
      userId: linyi.id,
      name: '林一的个人简历',
      title: '资深全栈工程师',
      summary: '10 年以上开发经验，曾在知名互联网公司担任架构师。',
      skills: ['Next.js', 'React', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'K8s'] as any,
      experiences: [
        { company: '人人创投', role: '技术合伙人', period: '2020 - 至今' },
        { company: '某知名互联网大厂', role: '高级架构师', period: '2015 - 2020' }
      ] as any,
      status: 'ACTIVE'
    }
  })
}

async function seedProjectTasks(linyi: any, uxin: any) {
  const proj_uxin = await (prisma as any).project.findUnique({ where: { id: 'proj-uxin' } })
  if (!proj_uxin) return

  // 将林一 (linyi@renrenvc.com) 添加为“优薪数字化平台研发”项目的团队成员
  // 角色设定为 OWNER，确保其拥有该项目的管理权限
  await (prisma as any).projectTeamMember.upsert({
    where: { projectId_userId: { projectId: proj_uxin.id, userId: linyi.id } },
    update: { role: 'OWNER' },
    create: {
      projectId: proj_uxin.id,
      userId: linyi.id,
      role: 'OWNER'
    }
  })

  // 将优薪用户 (uxin@163.com) 添加为“优薪数字化平台研发”项目的团队成员
  // 角色设定为 MEMBER，模拟被邀请加入的状态
  await (prisma as any).projectTeamMember.upsert({
    where: { projectId_userId: { projectId: proj_uxin.id, userId: uxin.id } },
    update: { role: 'MEMBER' },
    create: {
      projectId: proj_uxin.id,
      userId: uxin.id,
      role: 'MEMBER'
    }
  })

  // 添加 Alice 和 Provider 作为项目成员，以便在侧边栏显示团队头像
  await (prisma as any).projectTeamMember.upsert({
    where: { projectId_userId: { projectId: proj_uxin.id, userId: 'seed-user-alice' } },
    update: { role: 'MEMBER' },
    create: {
      projectId: proj_uxin.id,
      userId: 'seed-user-alice',
      role: 'MEMBER'
    }
  })

  await (prisma as any).projectTeamMember.upsert({
    where: { projectId_userId: { projectId: proj_uxin.id, userId: 'seed-user-provider' } },
    update: { role: 'MEMBER' },
    create: {
      projectId: proj_uxin.id,
      userId: 'seed-user-provider',
      role: 'MEMBER'
    }
  })

  // 为项目创建专业智能体团队
  const agentsToCreate = [
    {
      id: 'seed-agent-project-lead',
      name: '项目负责人',
      identifier: 'project-lead',
      selectedTools: ['createTasks', 'updateTasks', 'startCollaboration', 'matchAgents', 'project', 'collaboration'],
      prompt: `## 一、项目负责人核心工作流程图

\`\`\`mermaid
graph TD
    A[项目启动与需求分析] --> B[资源评估与组队]
    B --> C[整体规划与排期]
    C --> D[执行监控与协调]
    D --> E[风险管理与应对]
    E --> F[交付验收与复盘]
    F --> A
    
    subgraph "持续协作循环"
    G[跨团队沟通]
    H[冲突解决]
    I[资源调度]
    end
    
    D --> G
    G --> H
    H --> I
    I --> D
\`\`\`

## 二、各阶段详细流程及指令集

### 2.1 启动与需求分析阶段
**核心职责**：明确项目目标，协调产品、技术、设计对齐需求，识别关键风险。

**常用指令**：
- "基于[项目背景]，制定项目启动计划，包含关键干系人、目标和里程碑。"
- "分析[需求文档]，识别潜在的技术风险和资源瓶颈。"
- "组织跨部门需求评审，确保产品、设计、技术对需求理解一致。"

### 2.2 资源评估与组队阶段
**核心职责**：根据需求评估所需资源（人力、时间、预算），组建项目团队，必要时引入自由职业者。

**常用指令**：
- "评估[项目需求]所需的人员配置，包括角色、技能和经验级别。"
- "在自由职业者市场搜索具备[特定技能]的候选人，并进行初步筛选。"
- "制定[项目名称]的资源预算表，包含内部成本和外部采购成本。"

### 2.3 整体规划与排期阶段
**核心职责**：制定综合项目计划，整合敏捷迭代与传统里程碑，设定关键路径。

**常用指令**：
- "制定[项目名称]的整体进度计划，明确关键里程碑和交付物。"
- "协调各职能团队（技术、设计、产品）的详细排期，识别依赖关系。"
- "建立项目沟通机制，确定例会频率和汇报流程。"

### 2.4 执行监控与协调阶段
**核心职责**：跟踪项目进度，协调跨团队协作，解决阻塞问题，确保按时交付。

**常用指令**：
- "收集各团队本周进展，生成[项目名称]周报，包含进度、风险 and 下周计划。"
- "检测到[任务A]延期，分析其对整体进度的影响，并提出追赶方案。"
- "协调[技术团队]和[设计团队]解决接口定义不一致的问题。"

### 2.5 风险管理与应对阶段
**核心职责**：持续识别、评估和应对项目风险，制定应急预案。

**常用指令**：
- "更新项目风险登记册，重新评估[风险项]的概率和影响。"
- "针对[突发问题]，启动应急预案，重新调配资源。"
- "预测未来两周可能出现的资源冲突，并提前进行协调。"

### 2.6 交付验收与复盘阶段
**核心职责**：组织项目验收，确保交付质量，进行项目复盘，沉淀经验教训。

**常用指令**：
- "制定[项目名称]的上线发布计划，包含回滚策略和应急联系人。"
- "组织项目复盘会议，收集团队反馈，总结成功经验和改进点。"
- "归档项目文档，更新组织过程资产库。"

## 三、跨智能体协作指令

作为项目负责人智能体，你需要协调其他专业智能体：

- **调用产品负责人**："@ProductLead 请评估[新需求]的业务价值和优先级。"
- **调用技术负责人**："@TechLead 请评估[技术方案]的可行性和潜在风险。"
- **调用设计负责人**："@DesignLead 请确认[设计稿]的交付时间是否符合开发排期。"
- **调用自由职业者中心**："@FreelanceHub 请寻找一名熟练掌握[React Native]的资深开发者，预算[500/天]。"

## 四、智能体工作模式

1.  **全局视角**：始终保持对项目整体状况的关注，不仅关注细节，更关注目标达成。
2.  **主动协调**：发现潜在问题时，主动发起沟通和协调，而不是等待问题爆发。
3.  **数据驱动**：基于项目数据（进度、工时、质量指标）进行决策和汇报。
4.  **以人为本**：关注团队成员的状态和负荷，合理分配任务，激励团队士气。

## 五、输出要求

- **周报/日报**：结构清晰，重点突出（进度、风险、计划）。
- **计划文档**：包含甘特图、里程碑表、资源分配表。
- **决策建议**：提供多方案对比，明确推荐理由 and 风险评估。`,
      mermaid: `graph TD
    A[项目启动与需求分析] --> B[资源评估与组队]
    B --> C[整体规划与排期]
    C --> D[执行监控与协调]
    D --> E[风险管理与应对]
    E --> F[交付验收与复盘]
    F --> A
    
    subgraph "持续协作循环"
    G[跨团队沟通]
    H[冲突解决]
    I[资源调度]
    end
    
    D --> G
    G --> H
    H --> I
    I --> D`,
    },
    {
      id: 'seed-agent-tech-lead',
      name: '技术负责人',
      identifier: 'tech-lead',
      selectedTools: ['createTasks', 'updateTasks', 'startCollaboration', 'matchAgents', 'project', 'collaboration'],
      prompt: `## 一、技术负责人核心工作流程图

\`\`\`mermaid
graph TD
    A[技术架构设计] --> B[技术选型与评审]
    B --> C[开发规范制定]
    C --> D[代码审查与质量监控]
    D --> E[技术风险管理]
    E --> F[性能优化与维护]
    F --> A
    
    subgraph "持续协作循环"
    G[与产品对齐需求]
    H[与设计确认实现]
    I[指导开发团队]
    end
    
    D --> G
    G --> H
    H --> I
    I --> D
\`\`\`

## 二、各阶段详细流程及指令集

### 2.1 技术架构与选型阶段
**核心职责**：制定技术路线，选择合适的技术栈，确保架构的可扩展性和稳定性。

**常用指令**：
- "基于[项目需求]，设计高可用的系统架构方案，包含前后端分离策略和数据库设计。"
- "评估[技术A]与[技术B]的优劣势，结合项目背景给出选型建议。"
- "审查[技术方案]，识别潜在的性能瓶颈和安全隐患。"

### 2.2 规范制定与质量监控阶段
**核心职责**：建立代码规范，执行代码审查，确保代码质量和技术债务可控。

**常用指令**：
- "制定前端/后端开发规范，包含命名规则、目录结构和错误处理机制。"
- "执行代码审查（Code Review），指出不符合规范或存在逻辑错误的代码片段。"
- "配置CI/CD流水线，实现自动化测试 and 部署。"

### 2.3 风险管理与优化阶段
**核心职责**：识别技术风险，制定应急预案，持续优化系统性能。

**常用指令**：
- "分析当前系统的技术债务，制定重构计划。"
- "针对[高并发场景]，提出数据库优化 and 缓存策略。"
- "监控系统运行状态，及时响应和处理生产环境故障。"

## 三、跨智能体协作指令

作为技术负责人智能体，你需要与其他专业智能体紧密协作：

- **响应项目负责人**："@ProjectLead 技术方案已评估完毕，风险可控，预计开发周期为[X]周。"
- **协同产品负责人**："@ProductLead 建议将[功能A]的实现方式调整为[方案B]，以减少技术复杂度和开发成本。"
- **协同设计负责人**："@DesignLead [设计稿]中的动画效果在移动端可能存在性能问题，建议优化。"
- **调用自由职业者中心**："@FreelanceHub 需要一名熟悉[特定技术]的资深后端开发协助解决[技术难题]。"

## 四、智能体工作模式

1.  **技术驱动**：始终从技术可行性、稳定性和扩展性的角度思考问题。
2.  **质量第一**：对代码质量和工程规范有严格要求，不妥协于低质量交付。
3.  **前瞻视角**：关注技术发展趋势，为项目引入合适的新技术和新工具。
4.  **务实落地**：平衡技术追求与业务目标，确保技术方案能按时、按质落地。

## 五、输出要求

- **技术文档**：架构图、ER图、API接口文档、部署文档。
- **评审报告**：包含问题列表、改进建议和风险评估。
- **优化方案**：包含现状分析、优化目标、实施步骤 and 预期效果。`,
      mermaid: `graph TD
    A[技术架构设计] --> B[技术选型与评审]
    B --> C[开发规范制定]
    C --> D[代码审查与质量监控]
    D --> E[技术风险管理]
    E --> F[性能优化与维护]
    F --> A
    
    subgraph "持续协作循环"
    G[与产品对齐需求]
    H[与设计确认实现]
    I[指导开发团队]
    end
    
    D --> G
    G --> H
    H --> I
    I --> D`,
    },
    {
      id: 'seed-agent-design-lead',
      name: '设计负责人',
      identifier: 'design-lead',
      selectedTools: ['createTasks', 'updateTasks', 'startCollaboration', 'matchAgents', 'project', 'collaboration'],
      prompt: `## 一、设计负责人核心工作流程图

\`\`\`mermaid
graph TD
    A[用户体验研究] --> B[设计概念探索]
    B --> C[交互与视觉设计]
    C --> D[设计系统构建]
    D --> E[设计评审与交付]
    E --> F[设计走查与验证]
    F --> A
    
    subgraph "持续协作循环"
    G[与产品确认需求]
    H[与技术确认实现]
    I[用户测试反馈]
    end
    
    C --> G
    G --> H
    H --> I
    I --> C
\`\`\`

## 二、各阶段详细流程及指令集

### 2.1 概念探索与设计阶段
**核心职责**：基于用户研究，探索设计方向，输出交互原型和视觉稿。

**常用指令**：
- "基于[用户画像]，设计[产品/功能]的交互流程图和低保真原型。"
- "探索[产品]的视觉风格，提供3种不同风格的情绪板（Mood Board）供选择。"
- "设计[关键页面]的高保真UI稿，遵循Material Design/iOS Human Interface Guidelines。"

### 2.2 设计系统与交付阶段
**核心职责**：建立和维护设计系统，确保设计的一致性和复用性，高质量交付设计资源。

**常用指令**：
- "构建[产品]的设计系统（Design System），包含色彩、字体、组件库 and 图标规范。"
- "整理设计交付物，生成切图和标注，编写设计说明文档。"
- "组织设计评审会议，收集各方反馈并进行修改迭代。"

### 2.3 走查与验证阶段
**核心职责**：跟踪开发还原度，进行设计走查，收集用户反馈优化体验。

**常用指令**：
- "对[开发版本]进行UI验收（UI Review），列出样式偏差 and 交互Bug清单。"
- "分析用户测试数据，识别[操作流程]中的体验痛点并提出优化建议。"
- "定期审查现有设计，确保符合最新的设计趋势 and 品牌规范。"

## 三、跨智能体协作指令

作为设计负责人智能体，你需要与其他专业智能体紧密协作：

- **响应项目负责人**："@ProjectLead 设计稿已定稿，交付物已上传，可进入开发阶段。"
- **协同产品负责人**："@ProductLead 建议优化[功能]的交互逻辑，以提升用户操作效率。"
- **协同技术负责人**："@TechLead 请确认[动态效果]的实现难度，是否需要调整设计方案以适配性能要求。"
- **调用自由职业者中心**："@FreelanceHub 需要一名擅长[插画/3D]的设计师协助制作[营销素材]。"

## 四、智能体工作模式

1.  **用户为本**：始终从用户视角出发，坚持以人为本的设计理念。
2.  **体验至上**：追求极致的用户体验，关注每一个细节的打磨。
3.  **系统思维**：用系统化的思维构建设计语言，确保产品整体的一致性。
4.  **创新驱动**：勇于尝试新的设计风格和交互方式，为产品注入活力。

## 五、输出要求

- **设计稿**：流程图、原型图、高保真UI图。
- **设计规范**：组件库文档、样式指南。
- **走查报告**：还原度问题列表、体验优化建议。`,
      mermaid: `graph TD
    A[用户体验研究] --> B[设计概念探索]
    B --> C[交互与视觉设计]
    C --> D[设计系统构建]
    D --> E[设计评审与交付]
    E --> F[设计走查与验证]
    F --> A
    
    subgraph "持续协作循环"
    G[与产品确认需求]
    H[与技术确认实现]
    I[用户测试反馈]
    end
    
    C --> G
    G --> H
    H --> I
    I --> C`,
    },
    {
      id: 'seed-agent-freelance-hub',
      name: '自由职业者中心',
      identifier: 'freelance-hub',
      selectedTools: ['createTasks', 'updateTasks', 'startCollaboration', 'matchAgents', 'project', 'collaboration'],
      prompt: `## 一、自由职业者中心核心工作流程图

\`\`\`mermaid
graph TD
    A[需求接收与分析] --> B[人才搜索与匹配]
    B --> C[候选人筛选与推荐]
    C --> D[合同与任务指派]
    D --> E[交付监控与验收]
    E --> F[结算与评价]
    F --> A
    
    subgraph "人才库管理"
    G[技能标签更新]
    H[绩效数据记录]
    I[合作关系维护]
    end
    
    C --> G
    E --> H
    F --> I
\`\`\`

## 二、各阶段详细流程及指令集

### 2.1 搜索与匹配阶段
**核心职责**：根据项目需求，在人才库或外部市场寻找最合适的自由职业者。

**常用指令**：
- "根据[岗位描述]，搜索具备[React Native, Node.js]技能且有[电商项目]经验的开发者。"
- "对比[候选人A]和[候选人B]的技能、经验 and 报价，给出推荐建议。"
- "分析当前人才市场行情，预估[特定技能]人才的平均时薪/日薪。"

### 2.2 合同与指派阶段
**核心职责**：处理合同签署，明确任务范围、交付标准 and 截止时间。

**常用指令**：
- "生成[外包任务]的合同草案，包含保密协议（NDA）和知识产权归属条款。"
- "向[自由职业者]发送任务邀请，明确里程碑节点 and 验收标准。"
- "设立任务预算，冻结相应资金以确保支付能力。"

### 2.3 监控与结算阶段
**核心职责**：跟踪任务进度，组织验收，处理费用结算 and 评价。

**常用指令**：
- "提醒[自由职业者]提交本周的工作进度报告。"
- "组织项目组对[交付物]进行验收，收集修改意见。"
- "确认验收通过后，触发[里程碑金额]的支付流程，并邀请项目方撰写评价。"

## 三、跨智能体协作指令

作为自由职业者中心智能体，你需要为其他智能体提供人才支持：

- **响应项目负责人**："@ProjectLead 已找到3名合适的[React]开发者候选人，请查看详细报告。"
- **响应技术负责人**："@TechLead [候选人]已提交代码测试任务，请协助进行技术评估。"
- **响应设计负责人**："@DesignLead [插画师]已上传草图，请确认风格是否符合要求。"

## 四、智能体工作模式

1.  **精准匹配**：基于多维度数据（技能、经验、评价、价格）进行精准的人才匹配。
2.  **流程规范**：严格遵守合同管理 and 任务验收流程，保障双方权益。
3.  **响应迅速**：快速响应各方的用人需求，减少项目等待时间。
4.  **数据沉淀**：持续积累人才数据 and 合作记录，构建优质的私有人才库。

## 五、输出要求

- **推荐报告**：候选人简历摘要、匹配度分析、报价对比。
- **合同文档**：标准合同、任务书、验收单。
- **结算单据**：费用明细、支付记录、评价汇总。`,
      mermaid: `graph TD
    A[需求接收与分析] --> B[人才搜索与匹配]
    B --> C[候选人筛选与推荐]
    C --> D[合同与任务指派]
    D --> E[交付监控与验收]
    E --> F[结算与评价]
    F --> A
    
    subgraph "人才库管理"
    G[技能标签更新]
    H[绩效数据记录]
    I[合作关系维护]
    end
    
    C --> G
    E --> H
    F --> I`,
    },
    {
      id: 'seed-agent-market-lead',
      name: '市场负责人',
      identifier: 'market-lead',
      selectedTools: ['createTasks', 'updateTasks', 'startCollaboration', 'matchAgents', 'project', 'collaboration'],
      prompt: `## 一、市场负责人核心工作流程图

\`\`\`mermaid
graph TD
    A[市场调研与分析] --> B[营销策略制定]
    B --> C[品牌建设与推广]
    C --> D[渠道管理与获客]
    D --> E[活动策划与执行]
    E --> F[数据分析与复盘]
    F --> A
    
    subgraph "增长循环"
    G[用户画像优化]
    H[转化率优化]
    I[竞品监测]
    end
    
    A --> G
    D --> H
    F --> I
    I --> B
\`\`\`

## 二、各阶段详细流程及指令集

### 2.1 调研与策略阶段
**核心职责**：洞察市场趋势，分析竞品，制定差异化的营销策略。

**常用指令**：
- "使用PEST框架分析[目标市场]的宏观环境，识别机会 and 威胁。"
- "对[竞品]进行全方位分析（产品、价格、渠道、推广），找出其优劣势。"
- "基于[用户画像]，制定[新产品]的上市推广策略（Go-to-Market Strategy）。"

### 2.2 推广与获客阶段
**核心职责**：管理营销渠道，执行推广计划，获取高质量的销售线索。

**常用指令**：
- "规划[季度]的内容营销日历，包含博客、社媒 and EDM主题。"
- "评估[广告渠道A] and [广告渠道B]的投放ROI，调整预算分配。"
- "策划一场[线上/线下]活动，以提升品牌知名度 and 用户参与度。"

### 2.3 分析与优化阶段
**核心职责**：监控营销数据，评估活动效果，持续优化营销漏斗。

**常用指令**：
- "分析[上月]的营销数据报告，指出流量下滑的原因并提出改进措施。"
- "通过A/B测试优化[落地页]的文案 and 设计，提升注册转化率。"
- "计算[客户获取成本(CAC)] and [客户终身价值(LTV)]，评估营销健康度。"

## 三、跨智能体协作指令

作为市场负责人智能体，你需要与其他专业智能体紧密协作：

- **响应项目负责人**："@ProjectLead 市场推广计划已就绪，将在产品上线前2周启动预热。"
- **协同产品负责人**："@ProductLead 收集到用户对[功能]的强烈需求，建议纳入下个版本规划。"
- **协同设计负责人**："@DesignLead 需要制作一套[节日促销]的视觉素材，包含Banner and 海报。"
- **调用自由职业者中心**："@FreelanceHub 需要寻找一名有经验的[SEO专家]优化网站排名。"

## 四、智能体工作模式

1.  **数据导向**：用数据说话，基于数据反馈调整营销策略。
2.  **用户中心**：深入理解用户需求 and 心理，传递用户听得懂、感兴趣的价值。
3.  **敏捷迭代**：快速测试新的营销渠道 and 创意，小步快跑，迭代优化。
4.  **ROI关注**：时刻关注投入产出比，追求营销效益最大化。

## 五、输出要求

- **调研报告**：市场分析、竞品分析、用户洞察。
- **策划方案**：营销计划、活动方案、预算表。
- **分析报表**：渠道数据、活动复盘、ROI分析。`,
      mermaid: `graph TD
    A[市场调研与分析] --> B[营销策略制定]
    B --> C[品牌建设与推广]
    C --> D[渠道管理与获客]
    D --> E[活动策划与执行]
    E --> F[数据分析与复盘]
    F --> A
    
    subgraph "增长循环"
    G[用户画像优化]
    H[转化率优化]
    I[竞品监测]
    end
    
    A --> G
    D --> H
    F --> I
    I --> B`,
    },
  ]

  for (const agent of agentsToCreate) {
    const createdAgent = await (prisma as any).agent.upsert({
      where: { id: agent.id },
      update: {
        name: agent.name,
        identifier: agent.identifier,
        prompt: agent.prompt,
        mermaid: agent.mermaid,
        selectedTools: (agent as any).selectedTools,
        userId: linyi.id,
        projects: { set: [{ id: proj_uxin.id }] },
      },
      create: {
        id: agent.id,
        name: agent.name,
        identifier: agent.identifier,
        prompt: agent.prompt,
        mermaid: agent.mermaid,
        selectedTools: (agent as any).selectedTools,
        userId: linyi.id,
        projects: { connect: [{ id: proj_uxin.id }] },
      }
    })

    // 将智能体加入项目团队
    await (prisma as any).projectTeamMember.upsert({
      where: { projectId_agentId: { projectId: proj_uxin.id, agentId: createdAgent.id } },
      update: { role: 'MEMBER' },
      create: {
        projectId: proj_uxin.id,
        agentId: createdAgent.id,
        role: 'MEMBER'
      }
    })

    // 将智能体添加到林一的通讯录
    await (prisma as any).userContact.upsert({
      where: { userId_agentId: { userId: linyi.id, agentId: createdAgent.id } },
      update: {},
      create: {
        userId: linyi.id,
        agentId: createdAgent.id,
        groupName: '项目智能体'
      }
    })
  }

  // 为林一创建“互联网产品经理”智能体，并加入项目团队
  const pmAgent = await (prisma as any).agent.upsert({
    where: { id: 'seed-agent-pm' },
    update: {
      name: '互联网产品经理',
      identifier: 'pm-agent',
      prompt: '你是一位资深的互联网产品经理，擅长需求分析、产品设计和项目管理。你会帮助用户梳理业务流程，编写 PRD，并给出专业的产品建议。',
      mermaid: 'graph TD\n  A[发现需求] --> B[需求分析]\n  B --> C[原型设计]\n  C --> D[PRD编写]\n  D --> E[研发跟进]\n  E --> F[上线发布]',
      userId: linyi.id,
      projects: { set: [{ id: proj_uxin.id }] },
    },
    create: {
      id: 'seed-agent-pm',
      name: '互联网产品经理',
      identifier: 'pm-agent',
      prompt: '你是一位资深的互联网产品经理，擅长需求分析、产品设计和项目管理。你会帮助用户梳理业务流程，编写 PRD，并给出专业的产品建议。',
      mermaid: 'graph TD\n  A[发现需求] --> B[需求分析]\n  B --> C[原型设计]\n  C --> D[PRD编写]\n  D --> E[研发跟进]\n  E --> F[上线发布]',
      userId: linyi.id,
      projects: { connect: [{ id: proj_uxin.id }] },
    }
  })

  await (prisma as any).projectTeamMember.upsert({
    where: { projectId_agentId: { projectId: proj_uxin.id, agentId: pmAgent.id } },
    update: { role: 'MEMBER' },
    create: {
      projectId: proj_uxin.id,
      agentId: pmAgent.id,
      role: 'MEMBER'
    }
  })

  // 将智能体添加到林一的通讯录
  await (prisma as any).userContact.upsert({
    where: { userId_agentId: { userId: linyi.id, agentId: pmAgent.id } },
    update: {},
    create: {
      userId: linyi.id,
      agentId: pmAgent.id,
      groupName: '智能体'
    }
  })

  // 为项目创建一些对话，以便在侧边栏显示
  await (prisma as any).chat.upsert({
    where: { id: 'seed-chat-project-1' },
    update: {
      title: '关于数字化平台的架构讨论',
      userId: linyi.id,
      projectId: proj_uxin.id,
      visibility: 'public'
    },
    create: {
      id: 'seed-chat-project-1',
      title: '关于数字化平台的架构讨论',
      userId: linyi.id,
      projectId: proj_uxin.id,
      visibility: 'public'
    }
  })

  await (prisma as any).chat.upsert({
    where: { id: 'seed-chat-project-2' },
    update: {
      title: 'UI/UX 设计评审',
      userId: linyi.id,
      projectId: proj_uxin.id,
      visibility: 'public'
    },
    create: {
      id: 'seed-chat-project-2',
      title: 'UI/UX 设计评审',
      userId: linyi.id,
      projectId: proj_uxin.id,
      visibility: 'public'
    }
  })

  // 为项目创建对应的 Document 记录，用于在知了任务中展示项目详情
  await (prisma as any).document.upsert({
    where: { id_createdAt: { id: 'proj-uxin', createdAt: proj_uxin.createdAt || new Date('2025-01-01T00:00:00Z') } },
    update: {
      title: '优薪数字化平台研发',
      kind: 'project',
      userId: linyi.id,
      content: JSON.stringify({
        title: '优薪数字化平台研发',
        description: '构建新一代数字化招聘与任务管理平台',
        status: 'IN_PROGRESS',
        requirements: [
          {
            title: '任务管理系统 (知了任务)',
            description: '实现任务拆分、分配、进度追踪与分析功能',
            priority: 'High',
            tasks: [
              {
                title: '设计任务架构模型',
                description: '定义 ProjectTask, ProjectRequirement 模型及其关系',
                estimatedHours: 8,
                complexity: 'High',
                status: 'Completed'
              },
              {
                title: '开发任务共享库组件',
                description: '在 packages/tasks 中实现 TaskList 等通用组件',
                estimatedHours: 16,
                complexity: 'Medium',
                status: 'In Progress'
              }
            ]
          }
        ]
      })
    },
    create: {
      id: 'proj-uxin',
      createdAt: proj_uxin.createdAt || new Date('2025-01-01T00:00:00Z'),
      title: '优薪数字化平台研发',
      kind: 'project',
      userId: linyi.id,
      content: JSON.stringify({
        title: '优薪数字化平台研发',
        description: '构建新一代数字化招聘与任务管理平台',
        status: 'IN_PROGRESS',
        requirements: [
          {
            title: '任务管理系统 (知了任务)',
            description: '实现任务拆分、分配、进度追踪与分析功能',
            priority: 'High',
            tasks: [
              {
                title: '设计任务架构模型',
                description: '定义 ProjectTask, ProjectRequirement 模型及其关系',
                estimatedHours: 8,
                complexity: 'High',
                status: 'Completed'
              },
              {
                title: '开发任务共享库组件',
                description: '在 packages/tasks 中实现 TaskList 等通用组件',
                estimatedHours: 16,
                complexity: 'Medium',
                status: 'In Progress'
              }
            ]
          }
        ]
      })
    }
  })

  // 2. Create Project Requirements
  const req1Data = {
    projectId: proj_uxin.id,
    title: '任务管理系统 (知了任务)',
    description: '实现任务拆分、分配、进度追踪与分析功能',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
  }
  const req1 = await (prisma as any).projectRequirement.upsert({
    where: { id: 'seed-req-1' },
    update: req1Data,
    create: {
      ...req1Data,
      id: 'seed-req-1',
    }
  })

  // 3. Create Project Tasks
  const tasks = [
    {
      id: 'seed-ptask-1',
      title: '设计任务架构模型',
      description: '定义 ProjectTask, ProjectRequirement 模型及其关系',
      status: 'COMPLETED',
      priority: 'HIGH',
      progress: 100,
      assigneeId: linyi.id,
      startDate: new Date('2025-12-20'),
      endDate: new Date('2025-12-21'),
    },
    {
      id: 'seed-ptask-2',
      title: '开发任务共享库组件',
      description: '在 packages/tasks 中实现 TaskList 等通用组件',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      progress: 60,
      assigneeId: linyi.id,
      startDate: new Date('2025-12-22'),
      endDate: new Date('2025-12-24'),
    },
    {
      id: 'seed-ptask-3',
      title: '实现知了任务工作台页面',
      description: '在 aiChat 中集成知了任务应用，展示待办、历史与分析',
      status: 'PENDING',
      priority: 'HIGH',
      progress: 0,
      assigneeId: linyi.id,
      startDate: new Date('2025-12-24'),
      endDate: new Date('2025-12-26'),
    }
  ]

  for (const task of tasks) {
    const { id, ...data } = task
    await (prisma as any).projectTask.upsert({
      where: { id },
      update: {
        ...data,
        projectId: proj_uxin.id,
        requirementId: req1.id,
      },
      create: {
        ...data,
        id,
        projectId: proj_uxin.id,
        requirementId: req1.id,
      }
    })
  }

  console.log('Project tasks seed data inserted')
}

async function seedLinyiMessages(linyi: any, provider: any, passwordHash: string) {
  const aliceData = { name: 'Alice (HR)', role: 'CUSTOMER' as any, password: passwordHash }
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: aliceData,
    create: { id: 'seed-user-alice', email: 'alice@example.com', ...aliceData }
  });

  const messages = [
    {
      senderId: provider.id,
      receiverId: linyi.id,
      content: '您好，关于您的项目，我们已经有了初步的方案。',
      senderType: 'USER' as any,
          messageType: 'TEXT' as any,
          read: false,
        },
        {
          senderId: linyi.id,
          receiverId: provider.id,
          content: '太好了，什么时候可以演示一下？',
          senderType: 'USER' as any,
          messageType: 'TEXT' as any,
          read: true,
        },
        {
          senderId: alice.id,
          receiverId: linyi.id,
          content: '林总，这周五的面试安排已经发到您的邮箱了。',
          senderType: 'USER' as any,
          messageType: 'TEXT' as any,
          read: false,
        },
        {
          senderId: linyi.id,
          receiverId: alice.id,
          content: '好的，我会准时参加。',
          senderType: 'USER' as any,
          messageType: 'TEXT' as any,
          read: true,
        }
      ];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const msgId = `seed-msg-linyi-${i}`;
    const createdAt = new Date(Date.now() - (messages.length - i) * 3600000)
    await prisma.message.upsert({
      where: { id: msgId },
      update: {
        ...msg,
        createdAt
      },
      create: {
        id: msgId,
        ...msg,
        createdAt
      }
    });
  }

  // Seed UserTasks for Linyi
  const task1Data = {
    userId: linyi.id,
    title: '准备项目周报',
    description: '汇总本周研发进度，准备下周计划',
    dueDate: new Date('2025-12-25T10:00:00'),
    status: 'PENDING' as any,
    priority: 'HIGH' as any
  }
  const task1 = await prisma.userTask.upsert({
    where: { id: 'seed-task-linyi-1' },
    update: task1Data,
    create: {
      id: 'seed-task-linyi-1',
      ...task1Data
    }
  })

  // Seed Schedules for Linyi
  const schedule1Data = {
    userId: linyi.id,
    title: '产品迭代讨论会',
    description: '讨论下一季度产品路线图',
    startTime: new Date('2025-12-24T14:00:00'),
    endTime: new Date('2025-12-24T15:30:00'),
    type: 'MEETING' as any,
    location: '会议室A',
    metadata: { attendees: ['张三', '李四'], meetingUrl: 'https://zoom.us/j/123456' } as any
  }
  await (prisma as any).schedule.upsert({
    where: { id: 'seed-schedule-linyi-1' },
    update: schedule1Data,
    create: {
      id: 'seed-schedule-linyi-1',
      ...schedule1Data
    }
  })

  const schedule2Data = {
    userId: linyi.id,
    title: '提交周报',
    startTime: new Date('2025-12-25T10:00:00'),
    endTime: new Date('2025-12-25T10:30:00'),
    type: 'TASK' as any,
    taskId: task1.id
  }
  await (prisma as any).schedule.upsert({
    where: { id: 'seed-schedule-linyi-2' },
    update: schedule2Data,
    create: {
      id: 'seed-schedule-linyi-2',
      ...schedule2Data
    }
  })

  const schedule3Data = {
    userId: linyi.id,
    title: '与投资人视频会议',
    startTime: new Date('2025-12-26T16:00:00'),
    endTime: new Date('2025-12-26T17:00:00'),
    type: 'VIDEO' as any,
    metadata: { platform: 'Tencent Meeting', meetingId: '888-999-000' } as any
  }
  await (prisma as any).schedule.upsert({
    where: { id: 'seed-schedule-linyi-3' },
    update: schedule3Data,
    create: {
      id: 'seed-schedule-linyi-3',
      ...schedule3Data
    }
  })

  console.log('Linyi messages and schedules seed data inserted');

  // Seed AI Apps data
  await seedAIAppsData(linyi);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (err) => {
    console.error(err)
    await prisma.$disconnect()
    process.exit(1)
  })

async function seedSquareExamples() {
  const sarahData = { name: 'Sarah Chen', role: 'PROVIDER' as any, isVerified: true, avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=200&q=80' }
  const sarah = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: sarahData,
    create: { id: 'user_sarah_001', email: 'sarah@example.com', ...sarahData, password: await bcrypt.hash('123123', 10) }
  })
  const sarahProfileData = {
    title: 'Senior UX Designer',
    bio: '专注用户体验与界面设计，擅长复杂系统的设计与信息架构。',
    rating: 4.9,
    reviewCount: 120,
    location: '上海',
    languages: ['英语', '中文'] as any,
    skills: ['Figma', 'UI Design', 'User Research'] as any,
    badges: ['Verified'] as any,
    hourlyRateAmount: 150,
    hourlyRateCurrency: 'USD',
    hourlyRateUnit: '/小时',
    consultationEnabled: true,
    onlineStatus: true,
    isVerified: true,
    verifiedBy: 'UxIn',
    verifiedDomains: ['设计', '用户研究'] as any
  }
  await prisma.workerProfile.upsert({
    where: { userId: sarah.id },
    update: sarahProfileData,
    create: {
      userId: sarah.id,
      ...sarahProfileData,
      services: {
        create: [
          {
            id: 'svc_sarah_001',
            title: '品牌Logo设计',
            description: '定制品牌Logo与应用规范。',
            coverImageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799314348d?auto=format&fit=crop&w=1200&q=60',
            priceAmount: 150,
            priceCurrency: 'USD',
            unit: '/项目',
            deliveryTime: '3天',
            category: '设计',
            status: 'ACTIVE',
            rating: 4.9,
            reviewCount: 120,
            tags: ['设计'] as any
          }
        ]
      }
    }
  })

  const mikeData = { name: 'Mike Johnson', role: 'PROVIDER' as any, isVerified: true, avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' }
  const mike = await prisma.user.upsert({
    where: { email: 'mike@example.com' },
    update: mikeData,
    create: { id: 'user_mike_001', email: 'mike@example.com', ...mikeData, password: await bcrypt.hash('123123', 10) }
  })
  const mikeProfileData = {
    title: 'Full Stack Developer',
    bio: '擅长React、Node与数据库设计，提供端到端交付。',
    rating: 4.7,
    reviewCount: 80,
    location: '北京',
    languages: ['英语', '中文'] as any,
    skills: ['React', 'Node.js', 'PostgreSQL'] as any,
    badges: ['Verified'] as any,
    hourlyRateAmount: 80,
    hourlyRateCurrency: 'USD',
    hourlyRateUnit: '/小时',
    consultationEnabled: true,
    onlineStatus: true,
    isVerified: true,
    verifiedBy: 'UxIn',
    verifiedDomains: ['开发'] as any
  }
  await prisma.workerProfile.upsert({
    where: { userId: mike.id },
    update: mikeProfileData,
    create: {
      userId: mike.id,
      ...mikeProfileData,
      services: {
        create: [
          {
            id: 'svc_mike_001',
            title: '企业网站定制开发',
            description: '基于React/Node的企业官网与管理后台开发。',
            coverImageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=60',
            priceAmount: 12000,
            priceCurrency: 'CNY',
            unit: '/项目',
            deliveryTime: '7天',
            category: '开发',
            status: 'ACTIVE',
            rating: 4.7,
            reviewCount: 80,
            tags: ['开发'] as any
          }
        ]
      }
    }
  })

  const uiMuseData = { name: 'UI Muse', role: 'PROVIDER' as any, isVerified: true, avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=200&q=80' }
  const uiMuse = await prisma.user.upsert({
    where: { email: 'uimuse@example.com' },
    update: uiMuseData,
    create: { id: 'user_uimuse_001', email: 'uimuse@example.com', ...uiMuseData, password: await bcrypt.hash('123123', 10) }
  })
  const uiMuseProfileData = {
    title: 'Wix 设计与重设计专家',
    bio: '专注高转化率的Wix站点设计与重构，结合AI优化体验。',
    rating: 4.9,
    reviewCount: 60,
    location: '加拿大',
    languages: ['英语', '中文'] as any,
    skills: ['Wix', 'AI优化', '高转化设计'] as any,
    badges: ['Verified'] as any,
    consultationEnabled: true,
    onlineStatus: true,
    isVerified: true
  }
  await prisma.workerProfile.upsert({
    where: { userId: uiMuse.id },
    update: uiMuseProfileData,
    create: {
      userId: uiMuse.id,
      ...uiMuseProfileData,
      services: {
        create: [
          {
            id: 'svc_uimuse_001',
            title: 'AI 高转化 Wix 设计与重设计',
            description: '设计高转化的Wix网站，并进行重设计，结合AI优化用户体验。',
            coverImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=60',
            priceAmount: 265,
            priceCurrency: 'SGD',
            unit: '/项目',
            deliveryTime: '1周',
            category: '设计',
            status: 'ACTIVE',
            rating: 4.9,
            reviewCount: 60,
            tags: ['Wix', 'AI'] as any
          }
        ]
      }
    }
  })

  const krisData = { name: 'Kris Studio', role: 'PROVIDER' as any, isVerified: true, avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' }
  const kris = await prisma.user.upsert({
    where: { email: 'kris@example.com' },
    update: krisData,
    create: { id: 'user_kris_001', email: 'kris@example.com', ...krisData, password: await bcrypt.hash('123123', 10) }
  })
  const krisProfileData = {
    title: 'Modern Framer Websites',
    bio: '现代化Framer网站与页面设计，专注于用户体验与视觉吸引力。',
    rating: 5.0,
    reviewCount: 19,
    location: '美国',
    languages: ['英语', '中文'] as any,
    skills: ['Framer', '响应式设计', '现代化设计'] as any,
    badges: ['Verified'] as any,
    onlineStatus: true,
    isVerified: true
  }
  await prisma.workerProfile.upsert({
    where: { userId: kris.id },
    update: krisProfileData,
    create: {
      userId: kris.id,
      ...krisProfileData,
      services: {
        create: [
          {
            id: 'svc_kris_001',
            title: 'MODERN FRAMER WEBSITES',
            description: '设计现代Framer网站或网页，专注用户体验与视觉吸引力。',
            coverImageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=60',
            priceAmount: 5288,
            priceCurrency: 'SGD',
            unit: '/项目',
            deliveryTime: '2周',
            category: '设计',
            status: 'ACTIVE',
            rating: 5.0,
            reviewCount: 19,
            tags: ['Framer', '响应式'] as any
          }
        ]
      }
    }
  })

  const brendanData = { name: '布伦丹-K', role: 'PROVIDER' as any, isVerified: true, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' }
  const brendan = await prisma.user.upsert({
    where: { email: 'brendan@example.com' },
    update: brendanData,
    create: { id: 'user_brendan_001', email: 'brendan@example.com', ...brendanData, password: await bcrypt.hash('123123', 10) }
  })
  const brendanProfileData = {
    title: 'Squarespace 网站设计师',
    bio: '拥有超过7年经验的Squarespace网站设计师。',
    rating: 5.0,
    reviewCount: 21,
    location: '爱尔兰',
    languages: ['英语'] as any,
    skills: ['Squarespace', 'UI/UX', '响应式'] as any,
    badges: ['Verified'] as any,
    consultationEnabled: true,
    onlineStatus: true,
    isVerified: true
  }
  await prisma.workerProfile.upsert({
    where: { userId: brendan.id },
    update: brendanProfileData,
    create: {
      userId: brendan.id,
      ...brendanProfileData,
      services: {
        create: [
          {
            id: 'svc_brendan_001',
            title: 'Squarespace 开发与设计',
            description: '基于Squarespace的平台网站设计与开发。',
            coverImageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=60',
            priceAmount: 3850,
            priceCurrency: 'SGD',
            unit: '/项目',
            deliveryTime: '2周',
            category: '开发',
            status: 'ACTIVE',
            rating: 5.0,
            reviewCount: 21,
            tags: ['Squarespace'] as any
          }
        ]
      }
    }
  })
  // Helper to safely update worker service with nested records
  const safeUpdateWorkerService = async (id: string, features: string[], packageData: any, faqData: any[]) => {
    // Check if worker service exists
    const exists = await prisma.workerService.findUnique({ where: { id } });
    if (!exists) return;

    // Delete existing packages/plans/faqs to avoid unique constraint errors during re-seed
    const packages = await prisma.servicePackage.findMany({ where: { serviceId: id } });
    for (const pkg of packages) {
      await prisma.servicePackagePlan.deleteMany({ where: { packageId: pkg.id } });
    }
    await prisma.servicePackage.deleteMany({ where: { serviceId: id } });
    await prisma.serviceFAQ.deleteMany({ where: { serviceId: id } });

    await prisma.workerService.update({
      where: { id },
      data: {
        features: features as any,
        packages: {
          create: packageData
        },
        faqs: {
          create: faqData
        }
      }
    });
  };

  await safeUpdateWorkerService(
    'svc_uimuse_001',
    ['高转化设计', 'AI优化', '多设备响应'],
    [
      {
        id: 'pkg_uimuse_001',
        plans: {
          create: [
            { id: 'plan_ui_basic', tier: 'BASIC', name: '基础', priceAmount: 265, priceCurrency: 'SGD', deliveryTime: '5天', features: [{ key: 'design', label: '基础页面设计', included: true }, { key: 'seo', label: '基础SEO设置', included: true }] as any },
            { id: 'plan_ui_standard', tier: 'STANDARD', name: '标准', priceAmount: 680, priceCurrency: 'SGD', deliveryTime: '7天', features: [{ key: 'design', label: '增强页面设计', included: true }, { key: 'conversion', label: '高转化组件', included: true }, { key: 'analytics', label: '分析集成', included: true }] as any },
            { id: 'plan_ui_premium', tier: 'PREMIUM', name: '高级', priceAmount: 1280, priceCurrency: 'SGD', deliveryTime: '10天', features: [{ key: 'design', label: '定制化品牌设计', included: true }, { key: 'automation', label: '自动化工作流', included: true }, { key: 'support', label: '优先支持', included: true }] as any }
          ]
        }
      }
    ],
    [
      { id: 'faq_ui_1', question: '是否支持内容代写？', answer: '支持基础内容编辑与排版。' },
      { id: 'faq_ui_2', question: '是否提供后续维护？', answer: '可提供按月维护方案，包含监控与小改动。' }
    ]
  );

  await safeUpdateWorkerService(
    'svc_kris_001',
    ['现代设计', '动效优化', '响应式布局'],
    [
      {
        id: 'pkg_kris_001',
        plans: {
          create: [
            { id: 'plan_kr_basic', tier: 'BASIC', name: '基础', priceAmount: 2588, priceCurrency: 'SGD', deliveryTime: '10天', features: [{ key: 'framer', label: 'Framer 基础页面', included: true }, { key: 'responsive', label: '响应式布局', included: true }] as any },
            { id: 'plan_kr_standard', tier: 'STANDARD', name: '标准', priceAmount: 5288, priceCurrency: 'SGD', deliveryTime: '14天', features: [{ key: 'animations', label: '动效优化', included: true }, { key: 'seo', label: 'SEO优化', included: true }] as any },
            { id: 'plan_kr_premium', tier: 'PREMIUM', name: '高级', priceAmount: 8888, priceCurrency: 'SGD', deliveryTime: '21天', features: [{ key: 'branding', label: '品牌视觉系统', included: true }, { key: 'performance', label: '性能优化', included: true }, { key: 'support', label: '优先支持', included: true }] as any }
          ]
        }
      }
    ],
    [
      { id: 'faq_kr_1', question: '可以使用自定义域名吗？', answer: '可以，支持接入您的自定义域名。' },
      { id: 'faq_kr_2', question: '是否支持多语言？', answer: '支持，具体语言数需在需求阶段确认。' }
    ]
  );

  await safeUpdateWorkerService(
    'svc_brendan_001',
    ['Squarespace定制', 'UI/UX优化', 'SEO基础'],
    [
      {
        id: 'pkg_brendan_001',
        plans: {
          create: [
            { id: 'plan_br_basic', tier: 'BASIC', name: '基础', priceAmount: 2850, priceCurrency: 'SGD', deliveryTime: '14天', features: [{ key: 'setup', label: 'Squarespace 基础搭建', included: true }, { key: 'theme', label: '主题定制', included: true }] as any },
            { id: 'plan_br_standard', tier: 'STANDARD', name: '标准', priceAmount: 3850, priceCurrency: 'SGD', deliveryTime: '21天', features: [{ key: 'ux', label: 'UI/UX 优化', included: true }, { key: 'forms', label: '表单集成', included: true }] as any },
            { id: 'plan_br_premium', tier: 'PREMIUM', name: '高级', priceAmount: 5850, priceCurrency: 'SGD', deliveryTime: '28天', features: [{ key: 'branding', label: '品牌一致性设计', included: true }, { key: 'support', label: '优先支持', included: true }] as any }
          ]
        }
      }
    ],
    [
      { id: 'faq_br_1', question: '能否迁移现有网站到Squarespace？', answer: '可以，迁移费用需评估现有结构与内容。' },
      { id: 'faq_br_2', question: '是否包含基础SEO设置？', answer: '包含基础SEO设置与站点地图。' }
    ]
  );
  await prisma.workerService.update({ where: { id: 'svc_mike_001' }, data: { features: ['React/Node', '管理后台', '接口集成'] as any } })
  await prisma.workerService.update({ where: { id: 'svc_sarah_001' }, data: { features: ['Logo设计', '品牌规范', '应用示例'] as any } })

  // --- Workbench & Contacts Seed Data ---
}

async function seedWorkbenchAndContacts(customer: any, passwordHash: string) {
  // 1. Departments
  const coreDeptsData = [
    { id: 'dept-dev', name: '研发部' },
    { id: 'dept-ops', name: '运营部' },
    { id: 'dept-hr', name: '人事部' },
    { id: 'dept-fin', name: '财务部' },
    { id: 'dept-admin', name: '行政部' }
  ]

  for (const dept of coreDeptsData) {
    await prisma.department.upsert({
      where: { id: dept.id },
      update: { name: dept.name },
      create: dept
    })
  }

  const deptProductData = { name: 'Product Design' }
  const deptProduct = await prisma.department.upsert({
    where: { id: 'dept-product' },
    update: deptProductData,
    create: { id: 'dept-product', ...deptProductData }
  })

  const deptEngData = { name: 'Engineering' }
  const deptEng = await prisma.department.upsert({
    where: { id: 'dept-eng' },
    update: deptEngData,
    create: { id: 'dept-eng', ...deptEngData }
  })

  const deptMktData = { name: 'Marketing' }
  const deptMkt = await prisma.department.upsert({
    where: { id: 'dept-mkt' },
    update: deptMktData,
    create: { id: 'dept-mkt', ...deptMktData }
  })

  // 2. Additional Users (Contacts)
  const sarahContactData = {
    departmentId: deptProduct.id,
    jobTitle: 'Senior UX Designer'
  }
  const sarahUser = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: sarahContactData,
    create: {
      id: 'user_sarah_001',
      email: 'sarah@example.com',
      name: 'Sarah Chen',
      role: 'PROVIDER' as any,
      password: passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=200&q=80',
      ...sarahContactData
    }
  })

  const mikeContactData = {
    departmentId: deptEng.id,
    jobTitle: 'Full Stack Developer'
  }
  const mikeUser = await prisma.user.upsert({
    where: { email: 'mike@example.com' },
    update: mikeContactData,
    create: {
      id: 'user_mike_001',
      email: 'mike@example.com',
      name: 'Mike Johnson',
      role: 'PROVIDER' as any,
      password: passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80',
      ...mikeContactData
    }
  })

  const emilyData = {
    name: 'Emily Zhang',
    role: 'PROVIDER' as any,
    departmentId: deptMkt.id,
    jobTitle: 'Marketing Manager',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80'
  }
  const emily = await prisma.user.upsert({
    where: { email: 'emily@example.com' },
    update: emilyData,
    create: {
      id: 'user_emily_001',
      email: 'emily@example.com',
      password: passwordHash,
      ...emilyData
    }
  })

  // 3. User Contacts (for Customer)
  const contacts = [sarahUser, mikeUser, emily]
  for (const contact of contacts) {
    await prisma.userContact.upsert({
      where: {
        userId_contactId: {
          userId: customer.id,
          contactId: contact.id
        }
      },
      update: {},
      create: {
        userId: customer.id,
        contactId: contact.id,
        groupName: 'General'
      }
    })
  }

  // 为 uxin 和 linyi 建立团队联系人关系
  const uxinUser = await prisma.user.findUnique({ where: { email: 'uxin@163.com' } })
  const linyiUser = await prisma.user.findUnique({ where: { email: 'linyi@renrenvc.com' } })

  if (!linyiUser) {
    console.error('Linyi user not found during seeding contacts');
    return;
  }

  if (uxinUser) {
    const teamContacts = [
      { userId: uxinUser.id, contactId: linyiUser.id, groupName: '团队成员' },
      { userId: linyiUser.id, contactId: uxinUser.id, groupName: '团队成员' }
    ]

    for (const tc of teamContacts) {
      await prisma.userContact.upsert({
        where: {
          userId_contactId: {
            userId: tc.userId,
            contactId: tc.contactId
          }
        },
        update: { groupName: tc.groupName },
        create: {
          userId: tc.userId,
          contactId: tc.contactId,
          groupName: tc.groupName
        }
      })
    }
  }

  // 4. Workbench Apps
  const apps = [
    { id: 'app-leave', name: 'Leave Request', icon: 'calendar', url: '/workbench/leave', category: 'HR' },
    { id: 'app-expense', name: 'Expense Report', icon: 'receipt', url: '/workbench/expense', category: 'Finance' },
    { id: 'app-projects', name: 'Project Mgmt', icon: 'briefcase', url: '/workbench/projects', category: 'Productivity' },
    { id: 'app-crm', name: 'CRM', icon: 'users', url: '/workbench/crm', category: 'Sales' },
    { id: 'app-tasks', name: '知了任务', icon: 'clipboard-list', url: '/workbench/tasks', category: 'Productivity' },
    { id: 'app-recruitment', name: '招聘管理', icon: 'briefcase', url: '/recruitment/1', category: 'HR' }
  ]

  for (const app of apps) {
    await prisma.workbenchApp.upsert({
      where: { id: app.id },
      update: app,
      create: app
    })
  }

  // 5. User Tasks
  const taskData = [
    { title: 'Review Q3 Design Drafts', status: 'PENDING', priority: 'HIGH', dueDate: new Date(Date.now() + 86400000) },
    { title: 'Submit Monthly Expense Report', status: 'PENDING', priority: 'MEDIUM', dueDate: new Date() },
    { title: 'Team Sync Meeting', status: 'COMPLETED', priority: 'LOW', dueDate: new Date(Date.now() - 86400000) }
  ]

  for (const task of taskData) {
    await prisma.userTask.upsert({
      where: {
        id: `seed-task-${customer.id}-${task.title.replace(/\s+/g, '-').toLowerCase()}`
      },
      update: task,
      create: {
        id: `seed-task-${customer.id}-${task.title.replace(/\s+/g, '-').toLowerCase()}`,
        userId: customer.id,
        ...task
      }
    })
  }
  
  // 6. Project Progress Update
  await (prisma as any).project.update({
    where: { id: 'proj-uxin' },
    data: { progress: 65 }
  })
  
  await (prisma as any).project.update({
    where: { id: 'proj-2' },
    data: { progress: 30 }
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const taskLinyi1Data = {
    userId: linyiUser.id,
    title: '审核第四季度财务报表',
    description: '需要仔细核对所有支出项',
    status: 'PENDING' as any,
    priority: 'HIGH' as any,
    dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
  }
  const scheduleTask1 = await prisma.userTask.upsert({
    where: { id: 'seed-task-linyi-1' },
    update: taskLinyi1Data,
    create: { id: 'seed-task-linyi-1', ...taskLinyi1Data }
  })

  const schedule1Data = {
    userId: linyiUser.id,
    title: '项目周会 - 优薪数字化平台',
    description: '讨论本周开发进度及下周计划',
    startTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 09:00 AM
    endTime: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10:00 AM
    type: 'MEETING' as any,
    location: '会议室 A'
  }
  await (prisma as any).schedule.upsert({
    where: { id: 'seed-schedule-linyi-1' },
    update: schedule1Data,
    create: { id: 'seed-schedule-linyi-1', ...schedule1Data }
  })

  const schedule2Data = {
    userId: linyiUser.id,
    title: '完成财务报表审核',
    startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 02:00 PM
    endTime: new Date(today.getTime() + 16 * 60 * 60 * 1000), // 04:00 PM
    type: 'TASK' as any,
    taskId: scheduleTask1.id
  }
  await (prisma as any).schedule.upsert({
    where: { id: 'seed-schedule-linyi-2' },
    update: schedule2Data,
    create: { id: 'seed-schedule-linyi-2', ...schedule2Data }
  })

  const schedule3Data = {
    userId: linyiUser.id,
    title: '远程面试 - 前端专家',
    description: '面试候选人：李雷',
    startTime: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11:00 AM
    endTime: new Date(today.getTime() + 12 * 60 * 60 * 1000), // 12:00 PM
    type: 'VIDEO' as any,
    metadata: { meetingLink: 'https://zoom.us/j/123456789' } as any
  }
  await (prisma as any).schedule.upsert({
    where: { id: 'seed-schedule-linyi-3' },
    update: schedule3Data,
    create: { id: 'seed-schedule-linyi-3', ...schedule3Data }
  })

  const schedule4Data = {
    userId: linyiUser.id,
    title: '公司团建晚宴',
    startTime: new Date(today.getTime() + 18 * 60 * 60 * 1000), // 06:00 PM
    endTime: new Date(today.getTime() + 21 * 60 * 60 * 1000), // 09:00 PM
    type: 'EVENT' as any,
    location: '某某大酒店'
  }
  await (prisma as any).schedule.upsert({
    where: { id: 'seed-schedule-linyi-4' },
    update: schedule4Data,
    create: { id: 'seed-schedule-linyi-4', ...schedule4Data }
  })

  // Seed Salary/Finance Data for linyi
  const walletData = {
    balance: 125800.00,
    currency: 'CNY'
  }
  const wallet = await (prisma as any).wallet.upsert({
    where: { userId: linyiUser.id },
    update: walletData,
    create: { userId: linyiUser.id, ...walletData }
  })

  await (prisma as any).walletTransaction.createMany({
    data: [
      {
        walletId: wallet.id,
        amount: 50000.00,
        type: 'INCOME',
        category: 'SALARY',
        description: '2024年12月工资收入',
        status: 'COMPLETED',
        referenceId: 'TX-202412-001'
      },
      {
        walletId: wallet.id,
        amount: 80000.00,
        type: 'INCOME',
        category: 'SERVICE_FEE',
        description: '项目结算 - 优薪数字化平台一期',
        status: 'COMPLETED',
        referenceId: 'TX-202412-002'
      },
      {
        walletId: wallet.id,
        amount: -2000.00,
        type: 'EXPENSE',
        category: 'WITHDRAWAL',
        description: '提现至招商银行卡',
        status: 'COMPLETED',
        referenceId: 'TX-202412-003'
      },
      {
        walletId: wallet.id,
        amount: -2200.00,
        type: 'EXPENSE',
        category: 'TAX',
        description: '个人所得税代扣',
        status: 'COMPLETED',
        referenceId: 'TX-202412-004'
      }
    ],
    skipDuplicates: true
  })

  await (prisma as any).invoice.createMany({
    data: [
      {
        userId: linyiUser.id,
        amount: 80000.00,
        status: 'PAID',
        title: '软件开发服务费',
        content: { project: '优薪数字化平台', items: [{ name: '一期开发', amount: 80000 }] } as any,
        issuedAt: new Date('2024-12-20')
      },
      {
        userId: linyiUser.id,
        amount: 45000.00,
        status: 'ISSUED',
        title: '技术咨询费',
        content: { project: '架构咨询', items: [{ name: '咨询服务', amount: 45000 }] } as any,
        issuedAt: new Date('2025-01-05')
      }
    ]
  })

  await (prisma as any).taxRecord.createMany({
    data: [
      {
        userId: linyiUser.id,
        amount: 2200.00,
        taxType: 'INCOME_TAX',
        taxYear: 2024,
        status: 'PAID',
        description: '2024年12月个人所得税'
      },
      {
        userId: linyiUser.id,
        amount: 1500.00,
        taxType: 'VAT',
        taxYear: 2024,
        status: 'PENDING',
        description: '2024年第四季度增值税'
      }
    ]
  })

  // Seed Recruitment Data for linyi
  if (customer) {
    const linyiPosData = {
      userId: linyiUser.id,
      title: '高级AI产品经理',
      description: '负责公司AI招聘产品的规划与设计。',
      teamId: 'proj-uxin',
      location: '北京',
      employmentType: 'FULL_TIME' as any,
      salaryMin: 40000,
      salaryMax: 70000,
      requirements: ['5年以上产品经验', '深厚的AI背景', '优秀的沟通能力'] as any,
      status: 'OPEN' as any
    }
    const linyiPos = await prisma.position.upsert({
      where: { id: 'seed-pos-linyi-1' },
      update: linyiPosData,
      create: { id: 'seed-pos-linyi-1', ...linyiPosData }
    })

    const candidateResumeData = {
      userId: customer.id,
      name: '王五',
      title: '资深产品专家',
      summary: '曾主导多个千万级DAU产品的AI化转型。',
      skills: ['AI/ML', '产品矩阵', '商业化'] as any,
      experiences: [{ company: '大厂A', role: '产品总监', duration: '2015-2024' }] as any,
      education: [{ school: '北京大学', degree: '硕士', major: '计算机' }] as any,
      status: 'ACTIVE' as any
    }
    const candidateResume = await prisma.resume.upsert({
      where: { id: 'seed-resume-linyi-candidate' },
      update: candidateResumeData,
      create: { id: 'seed-resume-linyi-candidate', ...candidateResumeData }
    })

    const linyiAppData = {
      positionId: linyiPos.id,
      resumeId: candidateResume.id,
      userId: customer.id,
      status: 'INTERVIEW' as any
    }
    const linyiApp = await prisma.recruitmentApplication.upsert({
      where: { id: 'seed-app-linyi-1' },
      update: linyiAppData,
      create: { id: 'seed-app-linyi-1', ...linyiAppData }
    })

    const talentMatchData = {
      positionId: linyiPos.id,
      candidateId: customer.id,
      score: 95.5,
      reason: '候选人背景与岗位需求高度匹配，特别是在AI转型方面的经验。',
      status: 'RECOMMENDED' as any
    }
    await prisma.talentMatch.upsert({
      where: { id: 'seed-match-linyi-1' },
      update: talentMatchData,
      create: { id: 'seed-match-linyi-1', ...talentMatchData }
    })

    const linyiInterviewData = {
      applicationId: linyiApp.id,
      interviewerId: linyiUser.id,
      candidateId: customer.id,
      startTime: new Date(today.getTime() + 25 * 60 * 60 * 1000),
      endTime: new Date(today.getTime() + 26 * 60 * 60 * 1000),
      location: '视频会议',
      type: 'VIDEO' as any,
      status: 'SCHEDULED' as any
    }
    const linyiInterview = await prisma.interview.upsert({
      where: { id: 'seed-interview-linyi-1' },
      update: linyiInterviewData,
      create: { id: 'seed-interview-linyi-1', ...linyiInterviewData }
    })

    const evaluationData = {
      interviewId: linyiInterview.id,
      criteria: { professional: 5, communication: 4, potential: 5 } as any,
      comment: '非常优秀的候选人，建议录用。',
      result: 'PASS' as any
    }
    await prisma.interviewEvaluation.upsert({
      where: { interviewId: linyiInterview.id },
      update: evaluationData,
      create: evaluationData
    })
  }

  const linyiAddressData = {
    userId: linyiUser.id,
    name: '人人创投北京总部',
    detail: '北京市朝阳区某某路1号',
    city: '北京',
    isDefault: true
  }
  await prisma.address.upsert({
    where: { id: 'seed-address-linyi-1' },
    update: linyiAddressData,
    create: { id: 'seed-address-linyi-1', ...linyiAddressData }
  })

  const recruitmentSettingData = {
    userId: linyiUser.id,
    companyIntro: '人人创投（RenrenVC）是领先的风险投资机构，专注于早期科技投资。',
    notificationEmail: 'linyi@renrenvc.com',
    autoReply: true
  }
  await prisma.recruitmentSetting.upsert({
    where: { userId: linyiUser.id },
    update: recruitmentSettingData,
    create: recruitmentSettingData
  })

  console.log('Workbench and Contacts seed data inserted')
  console.log('Recruitment seed data inserted')
}

async function seedSharedEmployeeData(linyi: any) {
  // 1. 林一 (Linyi) - Senior Fullstack
  const sharedEmployeeLinyi = await prisma.sharedEmployee.upsert({
    where: { userId: linyi.id },
    update: {
      name: '林一',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
      title: '资深全栈开发工程师',
      department: '技术部',
      bio: '拥有 10 年以上互联网产品开发经验，精通 React, Node.js, Python 及 AI 模型集成。',
      location: '北京',
      hourlyRate: 500,
      currency: 'CNY',
      status: 'AVAILABLE'
    },
    create: {
      id: 'seed-shared-employee-linyi',
      userId: linyi.id,
      name: '林一',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
      title: '资深全栈开发工程师',
      department: '技术部',
      bio: '拥有 10 年以上互联网产品开发经验，精通 React, Node.js, Python 及 AI 模型集成。',
      location: '北京',
      hourlyRate: 500,
      currency: 'CNY',
      status: 'AVAILABLE'
    }
  })

  // 2. 张晓微 (Xiao-wei Zhang) - UI/UX Designer
  const sharedEmployeeZhang = await prisma.sharedEmployee.upsert({
    where: { id: 'seed-shared-employee-zhang' },
    update: {
      name: '张晓微',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
      title: '资深 UI/UX 设计师',
      department: '设计部',
      bio: '专注于 B 端产品设计，擅长构建复杂的系统交互和视觉体系。曾任职于知名大厂。',
      location: '上海',
      hourlyRate: 400,
      currency: 'CNY',
      status: 'BUSY'
    },
    create: {
      id: 'seed-shared-employee-zhang',
      name: '张晓微',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
      title: '资深 UI/UX 设计师',
      department: '设计部',
      bio: '专注于 B 端产品设计，擅长构建复杂的系统交互 and 视觉体系。曾任职于知名大厂。',
      location: '上海',
      hourlyRate: 400,
      currency: 'CNY',
      status: 'BUSY'
    }
  })

  // 3. 李明 (Ming Li) - Backend Specialist
  const sharedEmployeeLi = await prisma.sharedEmployee.upsert({
    where: { id: 'seed-shared-employee-li' },
    update: {
      name: '李明',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      title: '资深后端架构师',
      department: '技术部',
      bio: '精通 Java/Go 并发编程，擅长微服务架构设计和数据库性能调优。',
      location: '深圳',
      hourlyRate: 600,
      currency: 'CNY',
      status: 'AVAILABLE'
    },
    create: {
      id: 'seed-shared-employee-li',
      name: '李明',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      title: '资深后端架构师',
      department: '技术部',
      bio: '精通 Java/Go 并发编程，擅长微服务架构设计和数据库性能调优。',
      location: '深圳',
      hourlyRate: 600,
      currency: 'CNY',
      status: 'AVAILABLE'
    }
  })

  // Skills for Linyi
  const linyiSkills = [
    { name: 'React', level: 'Advanced' },
    { name: 'Node.js', level: 'Advanced' },
    { name: 'Python', level: 'Intermediate' },
    { name: 'AI Integration', level: 'Advanced' }
  ]

  for (const skill of linyiSkills) {
    await prisma.sharedEmployeeSkill.upsert({
      where: { id: `seed-skill-linyi-${skill.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: { employeeId: sharedEmployeeLinyi.id, name: skill.name, level: skill.level },
      create: { id: `seed-skill-linyi-${skill.name.toLowerCase().replace(/\s+/g, '-')}`, employeeId: sharedEmployeeLinyi.id, name: skill.name, level: skill.level }
    })
  }

  // Skills for Zhang
  const zhangSkills = [
    { name: 'Figma', level: 'Advanced' },
    { name: 'User Research', level: 'Advanced' },
    { name: 'Prototyping', level: 'Advanced' },
    { name: 'Design Systems', level: 'Advanced' }
  ]

  for (const skill of zhangSkills) {
    await prisma.sharedEmployeeSkill.upsert({
      where: { id: `seed-skill-zhang-${skill.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: { employeeId: sharedEmployeeZhang.id, name: skill.name, level: skill.level },
      create: { id: `seed-skill-zhang-${skill.name.toLowerCase().replace(/\s+/g, '-')}`, employeeId: sharedEmployeeZhang.id, name: skill.name, level: skill.level }
    })
  }

  // Skills for Li
  const liSkills = [
    { name: 'Go', level: 'Advanced' },
    { name: 'Java', level: 'Advanced' },
    { name: 'Kubernetes', level: 'Intermediate' },
    { name: 'Redis', level: 'Advanced' }
  ]

  for (const skill of liSkills) {
    await prisma.sharedEmployeeSkill.upsert({
      where: { id: `seed-skill-li-${skill.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: { employeeId: sharedEmployeeLi.id, name: skill.name, level: skill.level },
      create: { id: `seed-skill-li-${skill.name.toLowerCase().replace(/\s+/g, '-')}`, employeeId: sharedEmployeeLi.id, name: skill.name, level: skill.level }
    })
  }

  // Assignments for Linyi
  const linyiAssignments = [
    { projectName: '优薪数字化平台', clientName: '人人风投', status: 'ACTIVE', startDate: new Date('2024-01-01') },
    { projectName: 'AI 招聘系统', clientName: '某科技公司', status: 'COMPLETED', startDate: new Date('2023-06-01'), endDate: new Date('2023-12-31') }
  ]

  for (let i = 0; i < linyiAssignments.length; i++) {
    const assignment = linyiAssignments[i]
    await prisma.sharedEmployeeAssignment.upsert({
      where: { id: `seed-assignment-linyi-${i}` },
      update: { employeeId: sharedEmployeeLinyi.id, projectName: assignment.projectName, clientName: assignment.clientName, status: assignment.status as any, startDate: assignment.startDate, endDate: assignment.endDate },
      create: { id: `seed-assignment-linyi-${i}`, employeeId: sharedEmployeeLinyi.id, projectName: assignment.projectName, clientName: assignment.clientName, status: assignment.status as any, startDate: assignment.startDate, endDate: assignment.endDate }
    })
  }

  // Assignments for Zhang
  const zhangAssignments = [
    { projectName: '官网重构项目', clientName: '智联招聘', status: 'IN_PROGRESS', startDate: new Date('2024-11-01'), endDate: undefined }
  ]

  for (let i = 0; i < zhangAssignments.length; i++) {
    const assignment = zhangAssignments[i]
    await prisma.sharedEmployeeAssignment.upsert({
      where: { id: `seed-assignment-zhang-${i}` },
      update: { employeeId: sharedEmployeeZhang.id, projectName: assignment.projectName, clientName: assignment.clientName, status: assignment.status as any, startDate: assignment.startDate, endDate: assignment.endDate as any },
      create: { id: `seed-assignment-zhang-${i}`, employeeId: sharedEmployeeZhang.id, projectName: assignment.projectName, clientName: assignment.clientName, status: assignment.status as any, startDate: assignment.startDate, endDate: assignment.endDate as any }
    })
  }
}

async function seedLinyiAnalysisData(linyi: any) {
  console.log('Starting seeding Linyi analysis data to proj-uxin...');

  const projectId = 'proj-uxin';

  // 2. 创建需求
  const reqAData = {
    projectId: projectId,
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
    projectId: projectId,
    title: '自动化投后报告系统',
    description: '实现投后管理报告 of 自动收集与定期生成。',
    priority: 'MEDIUM',
    status: 'PENDING',
  };
  const requirementB = await (prisma as any).projectRequirement.upsert({
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
    {
      id: 'seed-ptask-linyi-3',
      requirementId: requirementB.id,
      title: '报告模版设计',
      description: '确定PDF报告的布局和可视化图表类型',
      priority: 'MEDIUM',
      status: 'PENDING',
      progress: 0,
    },
  ];

  for (const task of tasks) {
    const { id, ...data } = task;
    await (prisma as any).projectTask.upsert({
      where: { id },
      update: { ...data, projectId: projectId },
      create: { ...data, id, projectId: projectId },
    });
  }

  // 4. 创建智能体
  const agentAnalysis = await (prisma as any).agent.upsert({
    where: { id: 'seed-agent-linyi-analysis' },
    update: {
      name: '数据分析专家',
      identifier: 'data-analysis-expert',
      isCallableByOthers: true,
      prompt: '你是一个资深的数据分析专家，擅长使用Python and SQL进行复杂的数据挖掘和画像构建。',
      mermaid: 'graph TD; A[原始数据] --> B{数据清洗}; B --> C[特征提取]; C --> D[模型训练];',
      userId: linyi.id,
      projects: { set: [{ id: projectId }] },
    },
    create: {
      id: 'seed-agent-linyi-analysis',
      name: '数据分析专家',
      identifier: 'data-analysis-expert',
      prompt: '你是一个资深的数据分析专家，擅长使用Python and SQL进行复杂的数据挖掘和画像构建。',
      mermaid: 'graph TD; A[原始数据] --> B{数据清洗}; B --> C[特征提取]; C --> D[模型训练];',
      userId: linyi.id,
      projects: { connect: [{ id: projectId }] },
    },
  });

  const agentReport = await (prisma as any).agent.upsert({
    where: { id: 'seed-agent-linyi-report' },
    update: {
      name: '报告生成助手',
      identifier: 'report-gen-helper',
      isCallableByOthers: true,
      prompt: '你是一个高效的报告助手，擅长整理业务指标并生成精美的Markdown or PDF报告。',
      mermaid: 'graph LR; A[指标收集] --> B[内容撰写]; B --> C[排版优化];',
      userId: linyi.id,
      projects: { set: [{ id: projectId }] },
    },
    create: {
      id: 'seed-agent-linyi-report',
      name: '报告生成助手',
      identifier: 'report-gen-helper',
      prompt: '你是一个高效的报告助手，擅长整理业务指标并生成精美的Markdown or PDF报告。',
      mermaid: 'graph LR; A[指标收集] --> B[内容撰写]; B --> C[排版优化];',
      userId: linyi.id,
      projects: { connect: [{ id: projectId }] },
    },
  });

  // 4.2 创建互联网产品经理智能体 (多用户关联)
  const uxinUser = await prisma.user.findUnique({ where: { email: 'uxin@163.com' } });
  const pmPrompt = `你是一个资深的互联网产品经理专家。你擅长产品战略规划、市场分析与用户研究、产品规划与设计、需求管理与优先级、产品开发跟进以及数据分析与迭代。

你的核心工作流程如下：
1. 产品战略规划
2. 市场分析与用户研究（包含行业趋势研究、竞品分析、用户画像等）
3. 产品规划与设计（包含产品定位、路线图制定、功能设计、原型设计等）
4. 需求管理与优先级（包含需求分析、RICE模型评估、PRD撰写等）
5. 产品开发跟进（包含敏捷开发、发布管理等）
6. 数据分析与迭代优化

在执行任务时，请根据当前阶段使用合适的提示词模板和决策框架。例如：
- 市场分析：使用PEST框架、竞品功能矩阵、SWOT分析。
- 需求评估：使用RICE模型、验收标准、成功指标。
- 决策框架：问题定义、目标设定、方案制定、评估标准、风险评估、执行计划。

你的目标是帮助用户高效地完成产品全生命周期的管理工作。`;

  const pmMermaid = `graph LR
    A[PM输入问题/需求] --> B{智能体分析}
    
    B --> C[信息收集]
    C --> D[数据分析]
    D --> E[方案生成]
    
    E --> F{输出类型判断}
    F -->|文档类| G[生成PRD/报告]
    F -->|决策类| H[提供建议方案]
    F -->|分析类| I[输出分析结果]
    F -->|规划类| J[制定计划/路线图]
    
    G --> K[格式优化]
    H --> K
    I --> K
    J --> K
    
    K --> L[PM审核修改]
    L --> M[最终交付]
    
    subgraph "智能体能力库"
    N[市场分析]
    O[用户研究]
    P[需求管理]
    Q[数据洞察]
    R[决策支持]
    end
    
    B --调用--> N
    B --调用--> O
    B --调用--> P
    B --调用--> Q
    B --调用--> R`;

  const pmAgent = await (prisma as any).agent.upsert({
    where: { id: 'seed-agent-internet-pm' },
    update: {
      name: '互联网产品经理',
      identifier: 'internet-pm-expert',
      isCallableByOthers: true,
      prompt: pmPrompt,
      mermaid: pmMermaid,
      projects: { set: [{ id: projectId }] },

    },
    create: {
      id: 'seed-agent-internet-pm',
      name: '互联网产品经理',
      identifier: 'internet-pm-expert',
      isCallableByOthers: true,
      prompt: pmPrompt,
      mermaid: pmMermaid,
      projects: { connect: [{ id: projectId }] },

    }
  });

  // 4.3 创建项目负责人智能体
  const projectLeadPrompt = `## 一、项目负责人核心工作流程图
  
  \`\`\`mermaid
  graph TD
      A[项目启动与需求分析] --> B[资源评估与组队]
      B --> C[整体规划与排期]
      C --> D[执行监控与协调]
      D --> E[风险管理与应对]
      E --> F[交付验收与复盘]
      F --> A
      
      subgraph "持续协作循环"
      G[跨团队沟通]
      H[冲突解决]
      I[资源调度]
      end
      
      D --> G
      G --> H
      H --> I
      I --> D
  \`\`\`
  
  ## 二、各阶段详细流程及指令集
  
  ### 2.1 启动与需求分析阶段
  **核心职责**：明确项目目标，协调产品、技术、设计对齐需求，识别关键风险。
  
  **常用指令**：
  - "基于[项目背景]，制定项目启动计划，包含关键干系人、目标和里程碑。"
  - "分析[需求文档]，识别潜在的技术风险和资源瓶颈。"
  - "组织跨部门需求评审，确保产品、设计、技术对需求理解一致。"
  
  ### 2.2 资源评估与组队阶段
  **核心职责**：根据需求评估所需资源（人力、时间、预算），组建项目团队，必要时引入自由职业者。
  
  **常用指令**：
  - "评估[项目需求]所需的人员配置，包括角色、技能和经验级别。"
  - "在自由职业者市场搜索具备[特定技能]的候选人，并进行初步筛选。"
  - "制定[项目名称]的资源预算表，包含内部成本和外部采购成本。"
  
  ### 2.3 整体规划与排期阶段
  **核心职责**：制定综合项目计划，整合敏捷迭代与传统里程碑，设定关键路径。
  
  **常用指令**：
  - "制定[项目名称]的整体进度计划，明确关键里程碑和交付物。"
  - "协调各职能团队（技术、设计、产品）的详细排期，识别依赖关系。"
  - "建立项目沟通机制，确定例会频率和汇报流程。"
  
  ### 2.4 执行监控与协调阶段
  **核心职责**：跟踪项目进度，协调跨团队协作，解决阻塞问题，确保按时交付。
  
  **常用指令**：
  - "收集各团队本周进展，生成[项目名称]周报，包含进度、风险和下周计划。"
  - "检测到[任务A]延期，分析其对整体进度的影响，并提出追赶方案。"
  - "协调[技术团队]和[设计团队]解决接口定义不一致的问题。"
  
  ### 2.5 风险管理与应对阶段
  **核心职责**：持续识别、评估和应对项目风险，制定应急预案。
  
  **常用指令**：
  - "更新项目风险登记册，重新评估[风险项]的概率和影响。"
  - "针对[突发问题]，启动应急预案，重新调配资源。"
  - "预测未来两周可能出现的资源冲突，并提前进行协调。"
  
  ### 2.6 交付验收与复盘阶段
  **核心职责**：组织项目验收，确保交付质量，进行项目复盘，沉淀经验教训。
  
  **常用指令**：
  - "制定[项目名称]的上线发布计划，包含回滚策略和应急联系人。"
  - "组织项目复盘会议，收集团队反馈，总结成功经验和改进点。"
  - "归档项目文档，更新组织过程资产库。"
  
  ## 三、跨智能体协作指令
  
  作为项目负责人智能体，你需要协调其他专业智能体：
  
  - **调用产品负责人**："@ProductLead 请评估[新需求]的业务价值和优先级。"
  - **调用技术负责人**："@TechLead 请评估[技术方案]的可行性和潜在风险。"
  - **调用设计负责人**："@DesignLead 请确认[设计稿]的交付时间是否符合开发排期。"
  - **调用自由职业者中心**："@FreelanceHub 请寻找一名熟练掌握[React Native]的资深开发者，预算[500/天]。"
  
  ## 四、智能体工作模式
  
  1.  **全局视角**：始终保持对项目整体状况的关注，不仅关注细节，更关注目标达成。
  2.  **主动协调**：发现潜在问题时，主动发起沟通和协调，而不是等待问题爆发。
  3.  **数据驱动**：基于项目数据（进度、工时、质量指标）进行决策和汇报。
  4.  **以人为本**：关注团队成员的状态和负荷，合理分配任务，激励团队士气。
  
  ## 五、输出要求
  
  - **周报/日报**：结构清晰，重点突出（进度、风险、计划）。
  - **计划文档**：包含甘特图、里程碑表、资源分配表。
  - **决策建议**：提供多方案对比，明确推荐理由和风险评估。`;
  
  const projectLeadMermaid = `graph TD
    A[项目启动与需求分析] --> B[资源评估与组队]
    B --> C[整体规划与排期]
    C --> D[执行监控与协调]
    D --> E[风险管理与应对]
    E --> F[交付验收与复盘]
    F --> A
    
    subgraph "持续协作循环"
    G[跨团队沟通]
    H[冲突解决]
    I[资源调度]
    end
    
    D --> G
    G --> H
    H --> I
    I --> D`;
  
  const projectLeadAgent = await (prisma as any).agent.upsert({
    where: { id: 'seed-agent-project-lead' },
    update: {
      name: '项目负责人',
      identifier: 'project-lead-expert',
      isCallableByOthers: true,
      prompt: projectLeadPrompt,
      mermaid: projectLeadMermaid,
      
      projects: { set: [{ id: projectId }] },

    },
    create: {
      id: 'seed-agent-project-lead',
      name: '项目负责人',
      identifier: 'project-lead-expert',
      isCallableByOthers: true,
      prompt: projectLeadPrompt,
      mermaid: projectLeadMermaid,
      
      projects: { connect: [{ id: projectId }] }
    }
  });

  // 4.4 创建技术负责人智能体
  const techLeadPrompt = `## 一、技术负责人核心工作流程图

\`\`\`mermaid
graph TD
    A[技术架构设计] --> B[技术选型与评审]
    B --> C[开发规范制定]
    C --> D[代码审查与质量监控]
    D --> E[技术风险管理]
    E --> F[性能优化与维护]
    F --> A
    
    subgraph "持续协作循环"
    G[与产品对齐需求]
    H[与设计确认实现]
    I[指导开发团队]
    end
    
    D --> G
    G --> H
    H --> I
    I --> D
\`\`\`

## 二、各阶段详细流程及指令集

### 2.1 技术架构与选型阶段
**核心职责**：制定技术路线，选择合适的技术栈，确保架构的可扩展性和稳定性。

**常用指令**：
- "基于[项目需求]，设计高可用的系统架构方案，包含前后端分离策略和数据库设计。"
- "评估[技术A]与[技术B]的优劣势，结合项目背景给出选型建议。"
- "审查[技术方案]，识别潜在的性能瓶颈和安全隐患。"

### 2.2 规范制定与质量监控阶段
**核心职责**：建立代码规范，执行代码审查，确保代码质量和技术债务可控。

**常用指令**：
- "制定前端/后端开发规范，包含命名规则、目录结构和错误处理机制。"
- "执行代码审查（Code Review），指出不符合规范或存在逻辑错误的代码片段。"
- "配置CI/CD流水线，实现自动化测试和部署。"

### 2.3 风险管理与优化阶段
**核心职责**：识别技术风险，制定应急预案，持续优化系统性能。

**常用指令**：
- "分析当前系统的技术债务，制定重构计划。"
- "针对[高并发场景]，提出数据库优化和缓存策略。"
- "监控系统运行状态，及时响应和处理生产环境故障。"

## 三、跨智能体协作指令

作为技术负责人智能体，你需要与其他专业智能体紧密协作：

- **响应项目负责人**："@ProjectLead 技术方案已评估完毕，风险可控，预计开发周期为[X]周。"
- **协同产品负责人**："@ProductLead 建议将[功能A]的实现方式调整为[方案B]，以减少技术复杂度和开发成本。"
- **协同设计负责人**："@DesignLead [设计稿]中的动画效果在移动端可能存在性能问题，建议优化。"
- **调用自由职业者中心**："@FreelanceHub 需要一名熟悉[特定技术]的资深后端开发协助解决[技术难题]。"

## 四、智能体工作模式

1.  **技术驱动**：始终从技术可行性、稳定性和扩展性的角度思考问题。
2.  **质量第一**：对代码质量和工程规范有严格要求，不妥协于低质量交付。
3.  **前瞻视角**：关注技术发展趋势，为项目引入合适的新技术和新工具。
4.  **务实落地**：平衡技术追求与业务目标，确保技术方案能按时、按质落地。

## 五、输出要求

- **技术文档**：架构图、ER图、API接口文档、部署文档。
- **评审报告**：包含问题列表、改进建议和风险评估。
- **优化方案**：包含现状分析、优化目标、实施步骤和预期效果。`;

  const techLeadMermaid = `graph TD
    A[技术架构设计] --> B[技术选型与评审]
    B --> C[开发规范制定]
    C --> D[代码审查与质量监控]
    D --> E[技术风险管理]
    E --> F[性能优化与维护]
    F --> A
    
    subgraph "持续协作循环"
    G[与产品对齐需求]
    H[与设计确认实现]
    I[指导开发团队]
    end
    
    D --> G
    G --> H
    H --> I
    I --> D`;

  const techLeadAgent = await (prisma as any).agent.upsert({
    where: { id: 'seed-agent-tech-lead' },
    update: {
      name: '技术负责人',
      identifier: 'tech-lead-expert',
      isCallableByOthers: true,
      prompt: techLeadPrompt,
      mermaid: techLeadMermaid,
      
      projects: { set: [{ id: projectId }] },

    },
    create: {
      id: 'seed-agent-tech-lead',
      name: '技术负责人',
      identifier: 'tech-lead-expert',
      isCallableByOthers: true,
      prompt: techLeadPrompt,
      mermaid: techLeadMermaid,
      
      projects: { connect: [{ id: projectId }] }
    }
  });

  // 4.5 创建设计负责人智能体
  const designLeadPrompt = `## 一、设计负责人核心工作流程图

\`\`\`mermaid
graph TD
    A[用户体验研究] --> B[设计概念探索]
    B --> C[交互与视觉设计]
    C --> D[设计系统构建]
    D --> E[设计评审与交付]
    E --> F[设计走查与验证]
    F --> A
    
    subgraph "持续协作循环"
    G[与产品确认需求]
    H[与技术确认实现]
    I[用户测试反馈]
    end
    
    C --> G
    G --> H
    H --> I
    I --> C
\`\`\`

## 二、各阶段详细流程及指令集

### 2.1 概念探索与设计阶段
**核心职责**：基于用户研究，探索设计方向，输出交互原型和视觉稿。

**常用指令**：
- "基于[用户画像]，设计[产品/功能]的交互流程图和低保真原型。"
- "探索[产品]的视觉风格，提供3种不同风格的情绪板（Mood Board）供选择。"
- "设计[关键页面]的高保真UI稿，遵循Material Design/iOS Human Interface Guidelines。"

### 2.2 设计系统与交付阶段
**核心职责**：建立和维护设计系统，确保设计的一致性和复用性，高质量交付设计资源。

**常用指令**：
- "构建[产品]的设计系统（Design System），包含色彩、字体、组件库和图标规范。"
- "整理设计交付物，生成切图和标注，编写设计说明文档。"
- "组织设计评审会议，收集各方反馈并进行修改迭代。"

### 2.3 走查与验证阶段
**核心职责**：跟踪开发还原度，进行设计走查，收集用户反馈优化体验。

**常用指令**：
- "对[开发版本]进行UI验收（UI Review），列出样式偏差和交互Bug清单。"
- "分析用户测试数据，识别[操作流程]中的体验痛点并提出优化建议。"
- "定期审查现有设计，确保符合最新的设计趋势和品牌规范。"

## 三、跨智能体协作指令

作为设计负责人智能体，你需要与其他专业智能体紧密协作：

- **响应项目负责人**："@ProjectLead 设计稿已定稿，交付物已上传，可进入开发阶段。"
- **协同产品负责人**："@ProductLead 建议优化[功能]的交互逻辑，以提升用户操作效率。"
- **协同技术负责人**："@TechLead 请确认[动态效果]的实现难度，是否需要调整设计方案以适配性能要求。"
- **调用自由职业者中心**："@FreelanceHub 需要一名擅长[插画/3D]的设计师协助制作[营销素材]。"

## 四、智能体工作模式

1.  **用户为本**：始终从用户视角出发，坚持以人为本的设计理念。
2.  **体验至上**：追求极致的用户体验，关注每一个细节的打磨。
3.  **系统思维**：用系统化的思维构建设计语言，确保产品整体的一致性。
4.  **创新驱动**：勇于尝试新的设计风格和交互方式，为产品注入活力。

## 五、输出要求

- **设计稿**：流程图、原型图、高保真UI图。
- **设计规范**：组件库文档、样式指南。
- **走查报告**：还原度问题列表、体验优化建议。`;

  const designLeadMermaid = `graph TD
    A[用户体验研究] --> B[设计概念探索]
    B --> C[交互与视觉设计]
    C --> D[设计系统构建]
    D --> E[设计评审与交付]
    E --> F[设计走查与验证]
    F --> A
    
    subgraph "持续协作循环"
    G[与产品确认需求]
    H[与技术确认实现]
    I[用户测试反馈]
    end
    
    C --> G
    G --> H
    H --> I
    I --> C`;

  const designLeadAgent = await (prisma as any).agent.upsert({
    where: { id: 'seed-agent-design-lead' },
    update: {
      name: '设计负责人',
      identifier: 'design-lead-expert',
      prompt: designLeadPrompt,
      mermaid: designLeadMermaid,
      
      projects: { set: [{ id: projectId }] },

    },
    create: {
      id: 'seed-agent-design-lead',
      name: '设计负责人',
      identifier: 'design-lead-expert',
      prompt: designLeadPrompt,
      mermaid: designLeadMermaid,
      
      projects: { connect: [{ id: projectId }] }
    }
  });

  // 4.6 创建自由职业者Hub智能体
  const freelanceHubPrompt = `## 一、自由职业者中心核心工作流程图

\`\`\`mermaid
graph TD
    A[需求接收与分析] --> B[人才搜索与匹配]
    B --> C[候选人筛选与推荐]
    C --> D[合同与任务指派]
    D --> E[交付监控与验收]
    E --> F[结算与评价]
    F --> A
    
    subgraph "人才库管理"
    G[技能标签更新]
    H[绩效数据记录]
    I[合作关系维护]
    end
    
    C --> G
    E --> H
    F --> I
\`\`\`

## 二、各阶段详细流程及指令集

### 2.1 搜索与匹配阶段
**核心职责**：根据项目需求，在人才库或外部市场寻找最合适的自由职业者。

**常用指令**：
- "根据[岗位描述]，搜索具备[React Native, Node.js]技能且有[电商项目]经验的开发者。"
- "对比[候选人A]和[候选人B]的技能、经验和报价，给出推荐建议。"
- "分析当前人才市场行情，预估[特定技能]人才的平均时薪/日薪。"

### 2.2 合同与指派阶段
**核心职责**：处理合同签署，明确任务范围、交付标准和截止时间。

**常用指令**：
- "生成[外包任务]的合同草案，包含保密协议（NDA）和知识产权归属条款。"
- "向[自由职业者]发送任务邀请，明确里程碑节点和验收标准。"
- "设立任务预算，冻结相应资金以确保支付能力。"

### 2.3 监控与结算阶段
**核心职责**：跟踪任务进度，组织验收，处理费用结算和评价。

**常用指令**：
- "提醒[自由职业者]提交本周的工作进度报告。"
- "组织项目组对[交付物]进行验收，收集修改意见。"
- "确认验收通过后，触发[里程碑金额]的支付流程，并邀请项目方撰写评价。"

## 三、跨智能体协作指令

作为自由职业者中心智能体，你需要为其他智能体提供人才支持：

- **响应项目负责人**："@ProjectLead 已找到3名合适的[React]开发者候选人，请查看详细报告。"
- **响应技术负责人**："@TechLead [候选人]已提交代码测试任务，请协助进行技术评估。"
- **响应设计负责人**："@DesignLead [插画师]已上传草图，请确认风格是否符合要求。"

## 四、智能体工作模式

1.  **精准匹配**：基于多维度数据（技能、经验、评价、价格）进行精准的人才匹配。
2.  **流程规范**：严格遵守合同管理和任务验收流程，保障双方权益。
3.  **响应迅速**：快速响应各方的用人需求，减少项目等待时间。
4.  **数据沉淀**：持续积累人才数据和合作记录，构建优质的私有人才库。

## 五、输出要求

- **推荐报告**：候选人简历摘要、匹配度分析、报价对比。
- **合同文档**：标准合同、任务书、验收单。
- **结算单据**：费用明细、支付记录、评价汇总。`;

  const freelanceHubMermaid = `graph TD
    A[需求接收与分析] --> B[人才搜索与匹配]
    B --> C[候选人筛选与推荐]
    C --> D[合同与任务指派]
    D --> E[交付监控与验收]
    E --> F[结算与评价]
    F --> A
    
    subgraph "人才库管理"
    G[技能标签更新]
    H[绩效数据记录]
    I[合作关系维护]
    end
    
    C --> G
    E --> H
    F --> I`;

  const freelanceHubAgent = await (prisma as any).agent.upsert({
    where: { id: 'seed-agent-freelance-hub' },
    update: {
      name: '自由职业者Hub',
      identifier: 'freelance-hub-expert',
      prompt: freelanceHubPrompt,
      mermaid: freelanceHubMermaid,
      
      projects: { set: [{ id: projectId }] },

    },
    create: {
      id: 'seed-agent-freelance-hub',
      name: '自由职业者Hub',
      identifier: 'freelance-hub-expert',
      prompt: freelanceHubPrompt,
      mermaid: freelanceHubMermaid,
      
      projects: { connect: [{ id: projectId }] }
    }
  });

  // 4.7 创建市场负责人智能体
  const marketLeadPrompt = `## 一、市场负责人核心工作流程图

\`\`\`mermaid
graph TD
    A[市场调研与分析] --> B[营销策略制定]
    B --> C[品牌建设与推广]
    C --> D[渠道管理与获客]
    D --> E[活动策划与执行]
    E --> F[数据分析与复盘]
    F --> A
    
    subgraph "增长循环"
    G[用户画像优化]
    H[转化率优化]
    I[竞品监测]
    end
    
    A --> G
    D --> H
    F --> I
    I --> B
\`\`\`

## 二、各阶段详细流程及指令集

### 2.1 调研与策略阶段
**核心职责**：洞察市场趋势，分析竞品，制定差异化的营销策略。

**常用指令**：
- "使用PEST框架分析[目标市场]的宏观环境，识别机会和威胁。"
- "对[竞品]进行全方位分析（产品、价格、渠道、推广），找出其优劣势。"
- "基于[用户画像]，制定[新产品]的上市推广策略（Go-to-Market Strategy）。"

### 2.2 推广与获客阶段
**核心职责**：管理营销渠道，执行推广计划，获取高质量的销售线索。

**常用指令**：
- "规划[季度]的内容营销日历，包含博客、社媒和EDM主题。"
- "评估[广告渠道A]和[广告渠道B]的投放ROI，调整预算分配。"
- "策划一场[线上/线下]活动，以提升品牌知名度和用户参与度。"

### 2.3 分析与优化阶段
**核心职责**：监控营销数据，评估活动效果，持续优化营销漏斗。

**常用指令**：
- "分析[上月]的营销数据报告，指出流量下滑的原因并提出改进措施。"
- "通过A/B测试优化[落地页]的文案和设计，提升注册转化率。"
- "计算[客户获取成本(CAC)]和[客户终身价值(LTV)]，评估营销健康度。"

## 三、跨智能体协作指令

作为市场负责人智能体，你需要与其他专业智能体紧密协作：

- **响应项目负责人**："@ProjectLead 市场推广计划已就绪，将在产品上线前2周启动预热。"
- **协同产品负责人**："@ProductLead 收集到用户对[功能]的强烈需求，建议纳入下个版本规划。"
- **协同设计负责人**："@DesignLead 需要制作一套[节日促销]的视觉素材，包含Banner和海报。"
- **调用自由职业者中心**："@FreelanceHub 需要寻找一名有经验的[SEO专家]优化网站排名。"

## 四、智能体工作模式

1.  **数据导向**：用数据说话，基于数据反馈调整营销策略。
2.  **用户中心**：深入理解用户需求和心理，传递用户听得懂、感兴趣的价值。
3.  **敏捷迭代**：快速测试新的营销渠道和创意，小步快跑，迭代优化。
4.  **ROI关注**：时刻关注投入产出比，追求营销效益最大化。

## 五、输出要求

- **调研报告**：市场分析、竞品分析、用户洞察。
- **策划方案**：营销计划、活动方案、预算表。
- **分析报表**：渠道数据、活动复盘、ROI分析。`;

  const marketLeadMermaid = `graph TD
    A[市场调研与分析] --> B[营销策略制定]
    B --> C[品牌建设与推广]
    C --> D[渠道管理与获客]
    D --> E[活动策划与执行]
    E --> F[数据分析与复盘]
    F --> A
    
    subgraph "增长循环"
    G[用户画像优化]
    H[转化率优化]
    I[竞品监测]
    end
    
    A --> G
    D --> H
    F --> I
    I --> B`;

  const marketLeadAgent = await (prisma as any).agent.upsert({
    where: { id: 'seed-agent-market-lead' },
    update: {
      name: '市场负责人',
      identifier: 'market-lead-expert',
      prompt: marketLeadPrompt,
      mermaid: marketLeadMermaid,
      
      projects: { set: [{ id: projectId }] }
    },
    create: {
      id: 'seed-agent-market-lead',
      name: '市场负责人',
      identifier: 'market-lead-expert',
      prompt: marketLeadPrompt,
      mermaid: marketLeadMermaid,
      
      projects: { connect: [{ id: projectId }] }
    }
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
  const contactsToAdd = [
    { agentId: agentAnalysis.id, isStarred: true, groupName: '我的智能体' },
    { agentId: agentReport.id, isStarred: false, groupName: '我的智能体' },
    { agentId: pmAgent.id, isStarred: true, groupName: '推荐智能体' },
    { agentId: projectLeadAgent.id, isStarred: true, groupName: '推荐智能体' },
    { agentId: techLeadAgent.id, isStarred: false, groupName: '推荐智能体' },
    { agentId: designLeadAgent.id, isStarred: false, groupName: '推荐智能体' },
    { agentId: freelanceHubAgent.id, isStarred: false, groupName: '推荐智能体' },
    { agentId: marketLeadAgent.id, isStarred: false, groupName: '推荐智能体' },
  ];

  // 为林一添加联系人
  for (const contact of contactsToAdd) {
    await (prisma as any).userContact.upsert({
      where: { userId_agentId: { userId: linyi.id, agentId: contact.agentId } },
      update: { isStarred: contact.isStarred, groupName: contact.groupName },
      create: {
        userId: linyi.id,
        agentId: contact.agentId,
        groupName: contact.groupName,
        isStarred: contact.isStarred,
      },
    });
  }

  // 为 uxin 用户添加 PM 和 Project Lead 智能体联系人
  if (uxinUser) {
    const uxinAgents = [pmAgent, projectLeadAgent];
    for (const agent of uxinAgents) {
      await (prisma as any).userContact.upsert({
        where: { userId_agentId: { userId: uxinUser.id, agentId: agent.id } },
        update: { isStarred: true, groupName: '推荐智能体' },
        create: {
          userId: uxinUser.id,
          agentId: agent.id,
          groupName: '推荐智能体',
          isStarred: true,
        },
      });
    }
  }

  console.log('Linyi analysis data seeded.');
}

async function seedAIAppsData(user: any) {
  console.log('Seeding AI Apps data...');

  // 1. Create MCP Tools
  const tool1 = await (prisma as any).mCPTool.upsert({
    where: { id: 'seed-tool-web-search' },
    update: {
      name: '网页搜索',
      description: '搜索实时网页内容',
      avatar: '🌐',
      publisher: 'System',
      skills: ['search', 'web'],
      config: { engine: 'google' },
      rating: 4.8,
      isBuiltIn: true
    },
    create: {
      id: 'seed-tool-web-search',
      name: '网页搜索',
      description: '搜索实时网页内容',
      avatar: '🌐',
      publisher: 'System',
      skills: ['search', 'web'],
      config: { engine: 'google' },
      rating: 4.8,
      isBuiltIn: true
    }
  });

  const tool2 = await (prisma as any).mCPTool.upsert({
    where: { id: 'seed-tool-code-exec' },
    update: {
      name: '代码执行',
      description: '在沙盒环境中运行代码',
      avatar: '💻',
      publisher: 'System',
      skills: ['code', 'execution'],
      config: { runtime: 'nodejs' },
      rating: 4.9,
      isBuiltIn: true
    },
    create: {
      id: 'seed-tool-code-exec',
      name: '代码执行',
      description: '在沙盒环境中运行代码',
      avatar: '💻',
      publisher: 'System',
      skills: ['code', 'execution'],
      config: { runtime: 'nodejs' },
      rating: 4.9,
      isBuiltIn: true
    }
  });

  // Add more tools as requested by user
  const tool3 = await (prisma as any).mCPTool.upsert({
    where: { id: 'seed-tool-jira' },
    update: {
      name: 'Jira 集成',
      description: '管理 Jira 问题 and 任务',
      avatar: '🟦',
      publisher: 'Atlassian',
      skills: ['project-management', 'jira'],
      config: { baseUrl: 'https://jira.example.com' },
      rating: 4.5,
      isBuiltIn: true
    },
    create: {
      id: 'seed-tool-jira',
      name: 'Jira 集成',
      description: '管理 Jira 问题 and 任务',
      avatar: '🟦',
      publisher: 'Atlassian',
      skills: ['project-management', 'jira'],
      config: { baseUrl: 'https://jira.example.com' },
      rating: 4.5,
      isBuiltIn: true
    }
  });

  const tool4 = await (prisma as any).mCPTool.upsert({
    where: { id: 'seed-tool-agent-collaboration' },
    update: {
      name: '智能体协作',
      description: '多智能体协作编排与计划生成',
      avatar: '🤝',
      publisher: 'System',
      skills: ['collaboration', 'planning', 'multi-agent'],
      config: { version: '1.0.0' },
      rating: 4.9,
      isBuiltIn: true
    },
    create: {
      id: 'seed-tool-agent-collaboration',
      name: '智能体协作',
      description: '多智能体协作编排与计划生成',
      avatar: '🤝',
      publisher: 'System',
      skills: ['collaboration', 'planning', 'multi-agent'],
      config: { version: '1.0.0' },
      rating: 4.9,
      isBuiltIn: true
    }
  });

  const tool5 = await (prisma as any).mCPTool.upsert({
    where: { id: 'seed-tool-freelancer' },
    update: {
      name: '自由职业者服务',
      description: '自由职业者简历、服务与交易管理',
      avatar: '💼',
      publisher: 'System',
      skills: ['freelance', 'resume', 'transaction'],
      config: { version: '1.0.0' },
      rating: 4.7,
      isBuiltIn: true
    },
    create: {
      id: 'seed-tool-freelancer',
      name: '自由职业者服务',
      description: '自由职业者简历、服务与交易管理',
      avatar: '💼',
      publisher: 'System',
      skills: ['freelance', 'resume', 'transaction'],
      config: { version: '1.0.0' },
      rating: 4.7,
      isBuiltIn: true
    }
  });

  const tool6 = await (prisma as any).mCPTool.upsert({
    where: { id: 'seed-tool-project-collaboration' },
    update: {
      name: '项目协作',
      description: '项目、里程碑、需求与任务的全生命周期管理',
      avatar: '🚀',
      publisher: 'System',
      skills: ['project-management', 'milestone', 'task'],
      config: { version: '1.0.0' },
      rating: 4.8,
      isBuiltIn: true
    },
    create: {
      id: 'seed-tool-project-collaboration',
      name: '项目协作',
      description: '项目、里程碑、需求与任务的全生命周期管理',
      avatar: '🚀',
      publisher: 'System',
      skills: ['project-management', 'milestone', 'task'],
      config: { version: '1.0.0' },
      rating: 4.8,
      isBuiltIn: true
    }
  });

  // 2. Create Agents
  const agent1 = await (prisma as any).agent.upsert({
    where: { id: 'seed-agent-researcher' },
    update: {
      name: '研究员',
      prompt: '你是一个专业的调研助手...',
      mermaid: 'graph TD; A[开始]-->B[调研]',
      avatar: '🧐',
      mcpTools: { connect: [{ id: tool1.id }] }
    },
    create: {
      id: 'seed-agent-researcher',
      name: '研究员',
      prompt: '你是一个专业的调研助手...',
      mermaid: 'graph TD; A[开始]-->B[调研]',
      avatar: '🧐',
      mcpTools: { connect: [{ id: tool1.id }] }
    }
  });

  const agent2 = await (prisma as any).agent.upsert({
    where: { id: 'seed-agent-coder' },
    update: {
      name: '程序员',
      prompt: '你是一个精通全栈开发的程序员...',
      mermaid: 'graph TD; A[编码]-->B[测试]',
      avatar: '👨‍💻',
      mcpTools: { connect: [{ id: tool2.id }] }
    },
    create: {
      id: 'seed-agent-coder',
      name: '程序员',
      prompt: '你是一个精通全栈开发的程序员...',
      mermaid: 'graph TD; A[编码]-->B[测试]',
      avatar: '👨‍💻',
      mcpTools: { connect: [{ id: tool2.id }] }
    }
  });

  // 获取其他已存在的智能体
  const pmAgent = await (prisma as any).agent.findUnique({ where: { id: 'seed-agent-internet-pm' } });
  const projectLeadAgent = await (prisma as any).agent.findUnique({ where: { id: 'seed-agent-project-lead' } });
  const techLeadAgent = await (prisma as any).agent.findUnique({ where: { id: 'seed-agent-tech-lead' } });

  // 3. Create AI Apps
  const app1 = await (prisma as any).aIApp.upsert({
    where: { id: 'seed-app-market-analysis' },
    update: {
      name: '市场分析助手',
      description: '自动收集市场信息并生成报告',
      icon: '📊',
      status: 'PUBLISHED',
      type: 'TOOL',
    },
    create: {
      id: 'seed-app-market-analysis',
      name: '市场分析助手',
      description: '自动收集市场信息并生成报告',
      icon: '📊',
      status: 'PUBLISHED',
      type: 'TOOL',
    }
  });

  const app2 = await (prisma as any).aIApp.upsert({
    where: { id: 'seed-app-project-dev' },
    update: {
      name: '项目开发大师',
      description: '从需求到代码的全流程辅助',
      icon: '🚀',
      status: 'PUBLISHED',
      type: 'PROJECT',
    },
    create: {
      id: 'seed-app-project-dev',
      name: '项目开发大师',
      description: '从需求到代码的全流程辅助',
      icon: '🚀',
      status: 'PUBLISHED',
      type: 'PROJECT',
    }
  });

  const app3 = await (prisma as any).aIApp.upsert({
    where: { id: 'seed-app-product-pm' },
    update: {
      name: '产品策划专家',
      description: '深度辅助产品需求分析、PRD撰写与竞品调研',
      icon: '📝',
      status: 'PUBLISHED',
      type: 'TOOL',
    },
    create: {
      id: 'seed-app-product-pm',
      name: '产品策划专家',
      description: '深度辅助产品需求分析、PRD撰写与竞品调研',
      icon: '📝',
      status: 'PUBLISHED',
      type: 'TOOL',
    }
  });

  const app4 = await (prisma as any).aIApp.upsert({
    where: { id: 'seed-app-manager' },
    update: {
      name: '高效项目管理',
      description: '项目全生命周期管理，资源调度与风险预警',
      icon: '📅',
      status: 'PUBLISHED',
      type: 'PROJECT',
    },
    create: {
      id: 'seed-app-manager',
      name: '高效项目管理',
      description: '项目全生命周期管理，资源调度与风险预警',
      icon: '📅',
      status: 'PUBLISHED',
      type: 'PROJECT',
    }
  });

  // 4. Associate with Users
  const apps = [app1, app2, app3, app4];
  const targetUsers = [user]; // 'user' passed as argument (linyi)
  
  const uxinUser = await prisma.user.findUnique({ where: { email: 'uxin@163.com' } });
  if (uxinUser && uxinUser.id !== user.id) {
    targetUsers.push(uxinUser);
  }

  for (const targetUser of targetUsers) {
    for (let i = 0; i < apps.length; i++) {
      await (prisma as any).userAIApp.upsert({
        where: { userId_appId: { userId: targetUser.id, appId: apps[i].id } },
        update: { isDefault: i === 0 },
        create: { userId: targetUser.id, appId: apps[i].id, isDefault: i === 0 }
      });
    }
  }

  // 5. Link category tools with their sub-tools
  console.log('Linking MCP tools...');
  const toolLinks = [
    {
      categoryId: 'seed-tool-agent-collaboration',
      subToolIds: ['mcp-agent-collaboration-plan', 'mcp-agent-collaboration-start', 'mcp-collaboration-dispatch']
    },
    {
      categoryId: 'seed-tool-freelancer',
      subToolIds: ['mcp-freelancer-register', 'mcp-resume-create', 'mcp-service-create', 'mcp-transaction-create', 'mcp-contract-create']
    },
    {
      categoryId: 'seed-tool-project-collaboration',
      subToolIds: ['mcp-project-create', 'mcp-milestone-create', 'mcp-requirement-create', 'mcp-task-create', 'mcp-task-update-status']
    }
  ];

  for (const link of toolLinks) {
    try {
      await (prisma as any).mCPTool.update({
        where: { id: link.categoryId },
        data: {
          mcp_tools_A: {
            set: link.subToolIds.map(id => ({ id }))
          }
        }
      });
    } catch (e) {
      console.warn(`Failed to link tools for category ${link.categoryId}:`, e instanceof Error ? e.message : e);
    }
  }

  console.log('AI Apps data seeded.');
}
