// @ts-nocheck
import { PrismaClient, Document_kind, DocumentStatus } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') })
}

const prisma = new PrismaClient()

async function main() {
  console.log('开始插入发现页种子数据...')

  // 1. 获取林一用户作为创作者
  const linyi = await prisma.user.findUnique({
    where: { email: 'linyi@renrenvc.com' }
  })

  if (!linyi) {
    console.error('未找到林一用户，请先运行主种子脚本')
    return
  }

  // 1.1 为林一创建 Chat 会话
  const linyiChat = await prisma.chat.upsert({
    where: { id: 'seed-chat-linyi' },
    update: {},
    create: {
      id: 'seed-chat-linyi',
      userId: linyi.id,
      title: '关于数字化平台的深度探讨',
      visibility: 'public'
    }
  })
  console.log('已创建/获取林一的 Chat 会话')

  const publicDocs = [
    // 1. admin
    {
      id: 'disc-admin-1',
      title: '系统管理控制台',
      kind: Document_kind.admin,
      content: JSON.stringify({
        stats: { users: 1205, projects: 85, active: 320 },
        systemHealth: 'Good',
        lastBackup: '2023-10-27T08:00:00Z'
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 2. agent
    {
      id: 'disc-agent-1',
      title: '智能客服 Agent 配置',
      kind: Document_kind.agent,
      content: JSON.stringify({
        name: 'Customer Support Bot',
        model: 'gpt-4',
        temperature: 0.7,
        instructions: 'You are a helpful customer support assistant.'
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 3. agent-dashboard (mapped to agent_dashboard)
    {
      id: 'disc-agent-dashboard-1',
      title: 'Agent 运行监控看板',
      kind: Document_kind.agent_dashboard,
      content: JSON.stringify({
        activeAgents: 5,
        totalRequests: 15420,
        averageLatency: '240ms',
        errorRate: '0.5%'
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 4. approval
    {
      id: 'disc-approval-1',
      title: 'Q4 预算审批申请',
      kind: Document_kind.approval,
      content: JSON.stringify({
        title: 'Q4 Marketing Budget',
        requester: 'Lin Yi',
        amount: 50000,
        currency: 'CNY',
        status: 'PENDING',
        approvers: ['Manager A', 'Finance B']
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 5. code
    {
      id: 'disc-code-1',
      title: '系统架构拓扑图 (Mermaid)',
      kind: Document_kind.code,
      content: 'graph TD\n  A[用户浏览器] -->|HTTPS| B[Next.js App]\n  B -->|RPC| C[Node.js API]\n  C -->|Prisma| D[(PostgreSQL)]\n  C -->|Redis| E[(Cache)]\n  B -->|WebSocket| F[Realtime Service]',
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 6. contract
    {
      id: 'disc-contract-1',
      title: '软件开发服务合同',
      kind: Document_kind.contract,
      content: JSON.stringify({
        partyA: 'Tech Corp',
        partyB: 'Dev Studio',
        startDate: '2023-11-01',
        endDate: '2024-11-01',
        value: 100000,
        terms: ['Confidentiality', 'IP Rights', 'Payment Schedule']
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 7. defect
    {
      id: 'disc-defect-1',
      title: '登录页面响应慢问题',
      kind: Document_kind.defect,
      content: JSON.stringify({
        id: 'BUG-101',
        title: 'Slow response on login page',
        severity: 'High',
        priority: 'Urgent',
        status: 'Open',
        reporter: 'Tester A'
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 8. document (new kind)
    {
      id: 'disc-document-1',
      title: '项目启动会议纪要',
      kind: Document_kind.document,
      content: JSON.stringify({
        title: 'Project Kickoff Meeting',
        date: '2023-10-25',
        attendees: ['Alice', 'Bob', 'Charlie'],
        notes: 'Discussed project scope, timeline, and key deliverables.',
        actionItems: ['Setup repo', 'Define architecture']
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 9. entity-dashboard (new kind, mapped to entity_dashboard)
    {
      id: 'disc-entity-dashboard-1',
      title: '实体数据概览',
      kind: Document_kind.entity_dashboard,
      content: JSON.stringify({
        entityType: 'User',
        totalCount: 5000,
        newToday: 12,
        activeNow: 45
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 10. financial (new kind)
    {
      id: 'disc-financial-1',
      title: '2023年度财务报表',
      kind: Document_kind.financial,
      content: JSON.stringify({
        revenue: 1200000,
        expenses: 800000,
        profit: 400000,
        breakdown: { marketing: 200000, rnd: 400000, ops: 200000 }
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 11. image
    {
      id: 'disc-image-1',
      title: '未来城市景观 (AI绘画)',
      kind: Document_kind.image,
      content: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&w=800&q=80',
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 12. inquiry (new kind)
    {
      id: 'disc-inquiry-1',
      title: '企业级 CRM 系统开发询价',
      kind: Document_kind.inquiry,
      content: JSON.stringify({
        title: 'Enterprise CRM Development',
        budget: '50k - 100k',
        deadline: '3 months',
        requirements: ['User Management', 'Sales Pipeline', 'Reporting']
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 13. iteration
    {
      id: 'disc-iteration-1',
      title: 'Sprint 4 迭代计划',
      kind: Document_kind.iteration,
      content: JSON.stringify({
        name: 'Sprint 4',
        goal: 'Complete User Profile Module',
        startDate: '2023-11-01',
        endDate: '2023-11-14',
        status: 'Planned'
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 14. matching
    {
      id: 'disc-matching-1',
      title: '人才匹配结果 - 前端工程师',
      kind: Document_kind.matching,
      content: JSON.stringify({
        position: 'Frontend Engineer',
        candidates: [
          { name: 'Candidate A', score: 95, skills: ['React', 'TS'] },
          { name: 'Candidate B', score: 88, skills: ['Vue', 'JS'] }
        ]
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 15. message
    {
      id: 'disc-message-1',
      title: '系统通知消息',
      kind: Document_kind.message,
      content: JSON.stringify({
        from: 'System',
        to: 'User',
        subject: 'Maintenance Update',
        body: 'Scheduled maintenance will occur on Sunday at 2 AM.'
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 16. milestone
    {
      id: 'disc-milestone-1',
      title: 'MVP 发布里程碑',
      kind: Document_kind.milestone,
      content: JSON.stringify({
        title: 'MVP Release',
        dueDate: '2023-12-31',
        status: 'On Track',
        deliverables: ['Core Features', 'Basic UI', 'Documentation']
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 17. portfolio (new kind)
    {
      id: 'disc-portfolio-1',
      title: 'UI/UX 设计作品集',
      kind: Document_kind.portfolio,
      content: JSON.stringify({
        designer: 'Lin Yi',
        projects: [
          { name: 'E-commerce App', role: 'Lead Designer', year: 2022 },
          { name: 'Finance Dashboard', role: 'UX Researcher', year: 2023 }
        ]
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 18. position
    {
      id: 'disc-position-1',
      title: '高级后端工程师招聘',
      kind: Document_kind.position,
      content: JSON.stringify({
        title: 'Senior Backend Engineer',
        department: 'Engineering',
        location: 'Remote',
        salary: '40k-60k',
        requirements: ['Node.js', 'Microservices', '5+ years experience']
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 19. project
    {
      id: 'disc-project-1',
      title: 'UXIN 数字化协作平台',
      kind: Document_kind.project,
      content: JSON.stringify({
        name: 'UXIN Platform',
        description: 'AI-driven collaboration platform for freelancers and enterprises.',
        status: 'In Progress',
        pm: 'Lin Yi'
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 20. project-requirement (new kind, mapped to project_requirement)
    {
      id: 'disc-project-req-1',
      title: '项目核心需求文档',
      kind: Document_kind.project_requirement,
      content: JSON.stringify({
        title: 'Core Requirements',
        version: '1.0',
        functional: ['Auth', 'Chat', 'Payments'],
        nonFunctional: ['Performance', 'Security']
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 21. qna (new kind)
    {
      id: 'disc-qna-1',
      title: '常见问题解答',
      kind: Document_kind.qna,
      content: JSON.stringify({
        question: 'How to reset password?',
        answer: 'Go to settings and click "Reset Password".',
        tags: ['account', 'security']
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 22. quote
    {
      id: 'disc-quote-1',
      title: '云服务迁移报价单',
      kind: Document_kind.quote,
      content: JSON.stringify({
        item: 'Cloud Migration Service',
        price: 5000,
        currency: 'USD',
        validUntil: '2023-12-31'
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 23. report
    {
      id: 'disc-report-1',
      title: 'Q3 市场分析报告',
      kind: Document_kind.report,
      content: JSON.stringify({
        title: 'Q3 Market Analysis',
        summary: 'Growth in AI sector is strong.',
        metrics: { growth: '15%', userAcquisition: '2000+' }
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 24. requirement
    {
      id: 'disc-requirement-1',
      title: '用户注册功能需求',
      kind: Document_kind.requirement,
      content: JSON.stringify({
        feature: 'User Registration',
        acceptanceCriteria: ['Email validation', 'Password strength check'],
        priority: 'High'
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 25. resume
    {
      id: 'disc-resume-1',
      title: '林一的个人简历 (AI生成)',
      kind: Document_kind.resume,
      content: JSON.stringify({
        id: 'seed-worker-linyi',
        userId: linyi.id,
        title: '资深全栈开发工程师 & AI 架构师',
        bio: '拥有 10 年以上互联网产品开发经验，精通 React, Node.js, Python 及 AI 模型集成。',
        languages: ['中文', '英语'],
        skills: ['React', 'Next.js', 'Node.js', 'Python', 'OpenAI', 'LangChain'],
        badges: ['Top Rated', 'Verified'],
        rating: 5,
        reviewCount: 128,
        location: '北京',
        consultationEnabled: true,
        onlineStatus: true,
        isVerified: true,
        verifiedDomains: ['github.com', 'linkedin.com'],
        createdAt: new Date(),
        updatedAt: new Date()
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 26. review (new kind)
    {
      id: 'disc-review-1',
      title: '客户评价 - 项目 A',
      kind: Document_kind.review,
      content: JSON.stringify({
        reviewer: 'Client X',
        rating: 5,
        comment: 'Excellent work, delivered on time.',
        project: 'Project A'
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 27. risk
    {
      id: 'disc-risk-1',
      title: '项目延期风险评估',
      kind: Document_kind.risk,
      content: JSON.stringify({
        risk: 'Project Delay',
        probability: 'Medium',
        impact: 'High',
        mitigation: 'Add more resources'
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 28. service
    {
      id: 'disc-service-1',
      title: 'n8n 工作流与 AI 自动化设置服务',
      kind: Document_kind.service,
      content: JSON.stringify({
        title: 'n8n 工作流与 AI 自动化设置',
        description: '我将为您设置专业的 n8n 自动化流程、AI 代理以及复杂的工作流集成。',
        priceAmount: 350,
        priceCurrency: 'USD',
        unit: '项目',
        category: '自动化与 AI',
        coverImageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80'
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 29. sheet
    {
      id: 'disc-sheet-1',
      title: '2024年项目排期表',
      kind: Document_kind.sheet,
      content: JSON.stringify({
        columns: ['Task', 'Owner', 'Due Date', 'Status'],
        rows: [
          ['Design', 'Alice', '2024-01-15', 'Done'],
          ['Dev', 'Bob', '2024-02-01', 'In Progress']
        ]
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 30. task
    {
      id: 'disc-task-1',
      title: 'UXIN 数字化平台研发任务规划',
      kind: Document_kind.task,
      content: JSON.stringify({
        tasks: [
          { id: 't1', title: '核心架构 design', status: 'completed', priority: 'high', assignee: '林一' },
          { id: 't2', title: '发现页功能实现', status: 'in_progress', priority: 'high', assignee: '林一' },
          { id: 't3', title: '性能优化与压测', status: 'pending', priority: 'medium', assignee: '张三' },
          { id: 't4', title: '单元测试覆盖', status: 'pending', priority: 'low' }
        ]
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 31. text
    {
      id: 'disc-text-1',
      title: '关于优薪数字化平台的思考',
      kind: Document_kind.text,
      content: '# 优薪数字化平台思考\n\n我们的目标是打造一个零门槛的 AI 驱动协作平台。\n\n## 核心优势\n1. **AI 原生**：所有功能深度集成 LLM。\n2. **即时生成**：输入需求，即刻获得应用、文档 or 代码。\n3. **高效协作**：打通项目、任务与文档的边界。',
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    },
    // 32. web
    {
      id: 'disc-web-1',
      title: '官方网站首页设计',
      kind: Document_kind.web,
      content: JSON.stringify({
        url: 'https://uxin.com',
        layout: 'Landing Page',
        sections: ['Hero', 'Features', 'Testimonials', 'Footer']
      }),
      visibility: 'public',
      userId: linyi.id,
      chatId: linyiChat.id
    }
  ]

  for (const doc of publicDocs) {
    const docWithStatus = {
        ...doc,
        status: DocumentStatus.APPROVED
    };
    await prisma.document.upsert({
      where: {
        id_createdAt: {
          id: doc.id,
          createdAt: new Date('2025-01-01T00:00:00Z')
        }
      },
      update: docWithStatus,
      create: {
        ...docWithStatus,
        createdAt: new Date('2025-01-01T00:00:00Z')
      }
    })
    console.log(`- 已插入文档: ${doc.title} (${doc.kind})`)
  }

  console.log('发现页种子数据插入完成！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
