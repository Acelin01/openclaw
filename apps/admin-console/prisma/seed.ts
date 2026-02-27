
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始填充模拟数据...')

  // 1. 创建默认用户 (User)
  const adminEmail = 'admin@example.com'
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })
  
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: '管理员',
      },
    })
    console.log(`已创建用户: ${admin.name} (${admin.id})`)
  }

  // 2. 创建默认租户 (Tenant)
  let tenant = await prisma.tenant.findFirst({
    where: { name: '默认租户' },
  })

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: '默认租户',
      },
    })
    console.log(`已创建租户: ${tenant.name} (${tenant.id})`)
  }

  // 3. 创建会员关系与角色 (Membership & Role)
  const membership = await prisma.membership.findUnique({
    where: {
      tenantId_userId: {
        tenantId: tenant.id,
        userId: admin.id,
      },
    },
  })

  if (!membership) {
    // 先创建 "管理员" 角色
    let adminRole = await prisma.role.findUnique({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: '管理员',
        },
      },
    })

    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          name: '管理员',
          tenantId: tenant.id,
        },
      })
      console.log(`已创建角色: ${adminRole.name} (${adminRole.id})`)
    }

    // 创建 "普通成员" 角色
    let memberRole = await prisma.role.findUnique({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: '普通成员',
        },
      },
    })

    if (!memberRole) {
      memberRole = await prisma.role.create({
        data: {
          name: '普通成员',
          tenantId: tenant.id,
        },
      })
      console.log(`已创建角色: ${memberRole.name} (${memberRole.id})`)
    }

    await prisma.membership.create({
      data: {
        tenantId: tenant.id,
        userId: admin.id,
        roleId: adminRole.id,
      },
    })
    console.log(`已为用户 ${admin.name} 在租户 ${tenant.name} 中创建管理员会籍`)
  }

  // 4. 创建项目 (Project)
  const projectsData = [
    { name: 'AI 客服助手', status: 'active' },
    { name: '内部知识库', status: 'active' },
    { name: '营销活动 2026', status: 'archived' },
  ]

  for (const pData of projectsData) {
    let project = await prisma.project.findFirst({
      where: { 
        tenantId: tenant.id,
        name: pData.name 
      },
    })

    if (!project) {
      project = await prisma.project.create({
        data: {
          name: pData.name,
          tenantId: tenant.id,
          status: pData.status,
        },
      })
      console.log(`已创建项目: ${project.name} (${project.id})`)
    }

    // 5. 创建任务 (Task)
    // 仅为第一个项目添加详细任务
    if (pData.name === 'AI 客服助手') {
      const taskCount = await prisma.task.count({
        where: { projectId: project.id },
      })

      if (taskCount === 0) {
        await prisma.task.createMany({
          data: [
            { projectId: project.id, title: '配置开发环境', status: 'completed' },
            { projectId: project.id, title: '设计数据库结构', status: 'completed' },
            { projectId: project.id, title: '接入 OpenClaw Gateway', status: 'in_progress' },
            { projectId: project.id, title: '实现用户认证模块', status: 'pending' },
            { projectId: project.id, title: '编写 API 文档', status: 'pending' },
          ],
        })
        console.log(`已为项目 ${project.name} 创建示例任务`)
      }
    }
  }

  // 6. 创建网关实例 (GatewayInstance)
  const gatewaysData = [
    { name: '本地开发网关', wsUrl: 'ws://127.0.0.1:18789', status: 'online' },
    { name: '测试环境网关', wsUrl: 'ws://192.168.1.100:18789', status: 'offline' },
  ]

  for (const gData of gatewaysData) {
    let gateway = await prisma.gatewayInstance.findFirst({
      where: { 
        tenantId: tenant.id,
        name: gData.name
      },
    })

    if (!gateway) {
      gateway = await prisma.gatewayInstance.create({
        data: {
          name: gData.name,
          wsUrl: gData.wsUrl,
          status: gData.status,
          tenantId: tenant.id,
        },
      })
      console.log(`已创建网关: ${gateway.name} (${gateway.id})`)
    }

    // 创建网关快照 (GatewaySnapshot)
    const snapshotCount = await prisma.gatewaySnapshot.count({
      where: { instanceId: gateway.id }
    })

    if (snapshotCount === 0) {
      await prisma.gatewaySnapshot.create({
        data: {
          instanceId: gateway.id,
          health: { status: gData.status === 'online' ? 'healthy' : 'unhealthy', uptime: 3600, version: '2026.2.3' },
          channels: { whatsapp: { status: 'connected' }, telegram: { status: 'disconnected' } },
        }
      })
      console.log(`已为网关 ${gateway.name} 创建快照`)
    }
  }

  // 7. 创建权限 (Permission)
  const permissions = [
    { key: 'project.read', group: 'project', level: 1 },
    { key: 'project.write', group: 'project', level: 2 },
    { key: 'project.delete', group: 'project', level: 3 },
    { key: 'gateway.read', group: 'gateway', level: 1 },
    { key: 'gateway.control', group: 'gateway', level: 3 },
    { key: 'user.read', group: 'user', level: 1 },
    { key: 'user.manage', group: 'user', level: 3 },
  ]

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: {},
      create: p,
    })
  }
  console.log('已更新权限定义')

  // 8. 创建审计日志 (AuditLog)
  const auditCount = await prisma.auditLog.count({
    where: { tenantId: tenant.id },
  })

  if (auditCount === 0) {
    await prisma.auditLog.createMany({
      data: [
        {
          tenantId: tenant.id,
          actorId: admin.id,
          action: 'project.create',
          resource: `project:demo`,
          metadata: { name: 'AI 客服助手' },
        },
        {
          tenantId: tenant.id,
          actorId: admin.id,
          action: 'user.login',
          resource: `user:${admin.id}`,
          metadata: { ip: '127.0.0.1', userAgent: 'Chrome/120.0' },
        },
        {
          tenantId: tenant.id,
          actorId: admin.id,
          action: 'gateway.restart',
          resource: `gateway:local`,
          metadata: { reason: 'config_update' },
        },
      ],
    })
    console.log('已创建示例审计日志')
  }
  
  // 9. 创建网关调用请求 (GatewayCallRequest)
  const requestCount = await prisma.gatewayCallRequest.count({
    where: { tenantId: tenant.id }
  })
  
  if (requestCount === 0) {
    const localGateway = await prisma.gatewayInstance.findFirst({ where: { name: '本地开发网关' }})
    const aiProject = await prisma.project.findFirst({ where: { name: 'AI 客服助手' }})

    if (localGateway && aiProject) {
      await prisma.gatewayCallRequest.createMany({
        data: [
          {
            tenantId: tenant.id,
            actorId: admin.id,
            gatewayId: localGateway.id,
            projectId: aiProject.id,
            method: 'system.status',
            params: { verbose: true },
            status: 'executed',
            result: { status: 'ok', uptime: 3600 },
            executedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          },
          {
            tenantId: tenant.id,
            actorId: admin.id,
            gatewayId: localGateway.id,
            projectId: aiProject.id,
            method: 'message.send',
            params: { to: '+1234567890', content: 'Hello World' },
            status: 'pending',
            approvalLevelRequired: 1,
            approvalLevelCurrent: 0,
            requestedAt: new Date(),
          },
          {
            tenantId: tenant.id,
            actorId: admin.id,
            gatewayId: localGateway.id,
            projectId: aiProject.id,
            method: 'config.update',
            params: { debug: true },
            status: 'rejected',
            error: 'Permission denied',
            executedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          }
        ]
      })
      console.log('已创建示例网关调用请求')
    }
  }

  // 10. 创建每日指标 (MetricDaily)
  const metricCount = await prisma.metricDaily.count({
    where: { tenantId: tenant.id }
  })

  if (metricCount === 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    await prisma.metricDaily.create({
      data: {
        scope: 'tenant',
        tenantId: tenant.id,
        date: today,
        metrics: {
          active_users: 15,
          api_calls: 1250,
          errors: 5,
          gateway_uptime: 99.9
        }
      }
    })
    console.log('已创建每日指标数据')
  }

  // 11. 创建告警通道 (AlertChannel)
  const alertCount = await prisma.alertChannel.count({
    where: { tenantId: tenant.id }
  })

  if (alertCount === 0) {
    await prisma.alertChannel.createMany({
      data: [
        {
          tenantId: tenant.id,
          name: '运维钉钉群',
          type: 'webhook',
          target: 'https://oapi.dingtalk.com/robot/send?access_token=xxx',
          enabled: true
        },
        {
          tenantId: tenant.id,
          name: '管理员邮箱',
          type: 'email',
          target: 'admin@example.com',
          enabled: true
        }
      ]
    })
    console.log('已创建告警通道')
  }

  // 12. 创建后台任务 (Job)
  const jobCount = await prisma.job.count({
    where: { tenantId: tenant.id }
  })

  if (jobCount === 0) {
    await prisma.job.createMany({
      data: [
        {
          type: 'report.generate',
          status: 'pending',
          tenantId: tenant.id,
          payload: { reportType: 'weekly', recipients: ['admin@example.com'] },
          runAt: new Date(Date.now() + 1000 * 60 * 60) // 1 hour later
        },
        {
          type: 'data.sync',
          status: 'completed',
          tenantId: tenant.id,
          payload: { source: 'gateway-01' },
          runAt: new Date(Date.now() - 1000 * 60 * 60)
        },
        {
          type: 'notification.send',
          status: 'failed',
          tenantId: tenant.id,
          payload: { templateId: 'welcome_email', userId: 'user-123' },
          lastError: 'SMTP connection timeout',
          attempts: 3,
          maxAttempts: 5,
          runAt: new Date(Date.now() - 1000 * 60 * 30)
        }
      ]
    })
    console.log('已创建后台任务示例')
  }

  console.log('所有模拟数据填充完成。')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
