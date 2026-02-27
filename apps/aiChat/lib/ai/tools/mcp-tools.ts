import { tool } from "ai";
import { z } from "zod";
import { executeMCPTool } from "../../mcp/client";

// 项目协作 MCP 工具
export const projectCollaborationMCPTools = {
  project_create: tool({
    description: "创建新项目。需要参数：name(项目名称), description(描述), owner_id(负责人ID), start_date(开始日期), end_date(结束日期), budget(预算)",
    inputSchema: z.object({
      name: z.string(),
      description: z.string().optional(),
      owner_id: z.string(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
      budget: z.number().optional(),
      team_members: z.array(z.string()).optional()
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'project_create', args)
  }),
  milestone_create: tool({
    description: "创建项目里程碑。参数：project_id(项目ID), title(里程碑标题), due_date(截止日期), description(描述)",
    inputSchema: z.object({
      project_id: z.string(),
      title: z.string(),
      due_date: z.string(),
      description: z.string().optional(),
      dependencies: z.array(z.string()).optional()
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'milestone_create', args)
  }),
  requirement_create: tool({
    description: "创建项目需求。参数：project_id(项目ID), title(需求标题), description(详细描述), priority(优先级), status(状态), assignee_id(负责人)",
    inputSchema: z.object({
      project_id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      status: z.enum(["draft", "approved", "in_progress", "completed", "rejected"]).optional(),
      assignee_id: z.string().optional(),
      estimated_hours: z.number().optional(),
      acceptance_criteria: z.array(z.string()).optional()
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'requirement_create', args)
  }),
  task_create: tool({
    description: "创建任务。参数：project_id(项目ID), requirement_id(可选:需求ID), title(任务标题), description(描述), assignee_id(负责人), estimated_hours(预计工时), priority(优先级)",
    inputSchema: z.object({
      project_id: z.string(),
      requirement_id: z.string().optional(),
      title: z.string(),
      description: z.string().optional(),
      assignee_id: z.string(),
      estimated_hours: z.number().optional(),
      priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      due_date: z.string().optional(),
      dependencies: z.array(z.string()).optional()
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'task_create', args)
  }),
  task_update_status: tool({
    description: "更新任务状态。参数：task_id(任务ID), status(新状态: pending, in_progress, completed, failed)",
    inputSchema: z.object({
      task_id: z.string(),
      status: z.enum(["pending", "in_progress", "completed", "failed"]),
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'task_update_status', args)
  }),
  collaboration_dispatch: tool({
    description: "智能体协作调度。将任务分配给特定角色的智能体，并建立依赖关系。参数：task_id(任务ID), agent_role(目标智能体角色), context(协作上下文)",
    inputSchema: z.object({
      task_id: z.string(),
      agent_role: z.string(),
      context: z.string(),
      dependencies: z.array(z.string()).optional()
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'collaboration_dispatch', args)
  }),
  milestone_monitor: tool({
    description: "监控项目里程碑状态。获取项目所有里程碑的当前进展、截止日期及风险状态。",
    inputSchema: z.object({
      project_id: z.string()
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'milestone_monitor', args)
  })
};

export const agentCollaborationMCPTools = {
  agent_collaboration_plan: tool({
    description: "基于流程图的智能体协作编排：生成任务分解与依赖关系。参数：goal(协作目标), include_flowcharts(可选)返回流程图原文",
    inputSchema: z.object({
      goal: z.string(),
      include_flowcharts: z.boolean().optional(),
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'agent_collaboration_plan', args)
  }),
  agent_collaboration_start: tool({
    description: "启动智能体协作编排：生成计划，并可选创建项目任务与执行协作调度。参数：project_id, goal, assignee_id(可选), create_tasks(默认true), dispatch(默认true), context(可选补充上下文)",
    inputSchema: z.object({
      project_id: z.string(),
      goal: z.string(),
      assignee_id: z.string().optional(),
      create_tasks: z.boolean().optional(),
      dispatch: z.boolean().optional(),
      context: z.string().optional(),
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'agent_collaboration_start', args)
  })
};

// 自由职业者服务交易 MCP 工具
export const freelancerMCPTools = {
  resume_create: tool({
    description: "创建或更新自由职业者简历。参数：freelancer_id(自由职业者ID), title(简历标题), summary(个人简介), skills(技能列表), experience(工作经验), education(教育背景), hourly_rate(时薪), availability(可工作时间)",
    inputSchema: z.object({
      freelancer_id: z.string(),
      title: z.string(),
      summary: z.string().optional(),
      skills: z.array(z.string()),
      experience: z.array(z.any()).optional(),
      education: z.array(z.any()).optional(),
      hourly_rate: z.number().optional(),
      availability: z.enum(["full_time", "part_time", "project_basis"]).optional(),
      portfolio_links: z.array(z.string()).optional(),
      certifications: z.array(z.string()).optional()
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'resume_create', args)
  }),
  freelancer_register: tool({
    description: "注册自由职业者。参数：name(姓名), email(邮箱), phone(电话), country(国家), timezone(时区), preferred_languages(首选语言), payment_methods(支付方式)",
    inputSchema: z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
      country: z.string(),
      timezone: z.string().optional(),
      preferred_languages: z.array(z.string()).optional(),
      payment_methods: z.array(z.string()).optional(),
      tax_id: z.string().optional(),
      verification_documents: z.array(z.string()).optional()
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'freelancer_register', args)
  }),
  service_create: tool({
    description: "创建自由职业者服务。参数：freelancer_id(自由职业者ID), title(服务标题), description(服务描述), category(服务类别), price_type(计价方式), price(价格), delivery_time(交付时间), revisions(修改次数)",
    inputSchema: z.object({
      freelancer_id: z.string(),
      title: z.string(),
      description: z.string(),
      category: z.enum(["web_development", "mobile_app", "design", "writing", "marketing", "consulting"]).optional(),
      price_type: z.enum(["hourly", "fixed", "milestone"]),
      price: z.number().optional(),
      delivery_time: z.string().optional(),
      revisions: z.number().int().optional(),
      requirements: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional()
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'service_create', args)
  }),
  transaction_create: tool({
    description: "创建服务交易。参数：client_id(客户ID), freelancer_id(自由职业者ID), service_id(服务ID), amount(金额), currency(货币), description(交易描述), terms(条款)",
    inputSchema: z.object({
      client_id: z.string(),
      freelancer_id: z.string(),
      service_id: z.string(),
      amount: z.number(),
      currency: z.string().default("USD"),
      description: z.string().optional(),
      terms: z.string().optional(),
      milestones: z.array(z.any()).optional(),
      start_date: z.string().optional(),
      end_date: z.string().optional()
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'transaction_create', args)
  }),
  contract_create: tool({
    description: "创建或更新合同。参数：transaction_id(交易ID), terms(详细条款), signatures(签名状态), attachments(附件列表)",
    inputSchema: z.object({
      transaction_id: z.string(),
      terms: z.string(),
      signatures: z.array(z.string()).optional(),
      attachments: z.array(z.string()).optional()
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'contract_create', args)
  }),
  talent_match: tool({
    description: "智能人才匹配。根据技能、预算和工期从人才库中搜索并匹配最合适的自由职业者。",
    inputSchema: z.object({
      skills: z.array(z.string()).describe("所需技能列表，例如 ['React', 'Node.js', 'TypeScript']"),
      budget: z.number().optional().describe("项目预算"),
      duration: z.string().optional().describe("预计项目工期")
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'talent_match', args)
  }),
  skill_analyzer: tool({
    description: "技能需求分析工具。分析项目描述以提取所需的关键技能、经验要求和专业领域。",
    inputSchema: z.object({
      project_description: z.string(),
      industry: z.string().optional()
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'skill_analyzer', args)
  }),
  marketplace_integrator: tool({
    description: "人才市场集成工具。跨平台同步人才数据，搜索第三方平台的人才信息。",
    inputSchema: z.object({
      platforms: z.array(z.string()).optional(),
      query: z.string(),
      filters: z.record(z.any()).optional()
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'marketplace_integrator', args)
  }),
  compliance_checker: tool({
    description: "合同合规性检查工具。验证合同条款是否符合法律法规、公司政策及特定项目要求。",
    inputSchema: z.object({
      contract_terms: z.string(),
      region: z.string().optional(),
      compliance_type: z.array(z.string()).optional()
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'compliance_checker', args)
  }),
  growth_strategy_analyzer: tool({
    description: "增长策略分析工具。提供 A/B 测试设计、用户转化漏斗优化及留存率分析建议。",
    inputSchema: z.object({
      metrics: z.record(z.any()).optional(),
      goal: z.string(),
      platform: z.string().optional()
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'growth_strategy_analyzer', args)
  }),
  ux_design_reviewer: tool({
    description: "UX 设计评审工具。评审交互原型、用户旅程及设计系统一致性。",
    inputSchema: z.object({
      prototype_link: z.string(),
      user_persona: z.string().optional(),
      focus_areas: z.array(z.string()).optional()
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'ux_design_reviewer', args)
  }),
  devops_pipeline_optimizer: tool({
    description: "DevOps 流水线优化工具。评估 CI/CD 流程、IaC 管理及自动化测试集成。",
    inputSchema: z.object({
      current_stack: z.array(z.string()).optional(),
      deployment_frequency: z.string().optional(),
      automation_level: z.number().optional()
    }),
    execute: async (args) => executeMCPTool('uxin-mcp', 'devops_pipeline_optimizer', args)
  })
};
