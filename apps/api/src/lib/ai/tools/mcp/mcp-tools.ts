import { tool } from "ai";
import { z } from "zod";
import { executeMCPTool } from "../../../mcp/client";
import { testCaseManagementTools } from "./test-case-tools.js";
import { documentManagementTools } from "./document-tools.js";
import { iterationManagementTools } from "./iteration-tools.js";
import { milestoneManagementTools } from "./milestone-tools.js";
import { projectManagementTools } from "./project-tools.js";
import { requirementManagementTools } from "./requirement-tools.js";
import { taskManagementTools } from "./task-tools.js";
import { defectManagementTools } from "./defect-tools.js";
import { metricManagementTools } from "./metric-tools.js";
import { testPlanManagementTools } from "./testplan-tools.js";

export const projectCollaborationMCPTools = {
  project_create: {
    description: "创建新项目。需要参数：name(项目名称), description(描述), owner_id(负责人ID), start_date(开始日期), end_date(结束日期), budget(预算)",
    parameters: z.object({
      name: z.string(),
      description: z.string().optional(),
      owner_id: z.string(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
      budget: z.number().optional(),
      team_members: z.array(z.string()).optional()
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'project_create', args)
  },
  project_query: {
    description: "查询项目。参数：project_id(项目ID), filter(筛选条件)",
    parameters: z.object({
      project_id: z.string().optional(),
      filter: z.record(z.any()).optional()
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'project_query', args)
  },
  milestone_create: {
    description: "为项目创建里程碑。需要参数：project_id, title, description, due_date",
    parameters: z.object({
      project_id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      due_date: z.string().optional()
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'milestone_create', args)
  },
  requirement_create: {
    description: "创建需求。需要参数：project_id, title, description, reviewer_id(审核人ID), priority(LOW, MEDIUM, HIGH), status(DRAFT, REVIEW, APPROVED)",
    parameters: z.object({
      project_id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      reviewer_id: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      status: z.enum(['draft', 'approved', 'in_progress', 'completed', 'rejected']).optional(),
      assignee_id: z.string().optional(),
      estimated_hours: z.number().optional(),
      acceptance_criteria: z.array(z.string()).optional()
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'requirement_create', args)
  },
  task_create: {
    description: "在项目中创建新任务。需要参数：project_id, title, description, assignee_id, priority, status",
    parameters: z.object({
      project_id: z.string(),
      requirement_id: z.string().optional(),
      title: z.string(),
      description: z.string().optional(),
      assignee_id: z.string().optional(),
      due_date: z.string().optional(),
      estimated_hours: z.number().optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      dependencies: z.array(z.string()).optional()
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'task_create', args)
  },
  task_update_status: {
    description: "更新任务状态。需要参数：task_id, status",
    parameters: z.object({
      task_id: z.string(),
      status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'])
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'task_update_status', args)
  },
  task_list: {
    description: "获取任务列表。参数：project_id(项目ID), status(状态筛选), assignee_id(负责人筛选)",
    parameters: z.object({
      project_id: z.string().optional(),
      status: z.string().optional(),
      assignee_id: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional()
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'task_list', args)
  },
  collaboration_dispatch: {
    description: "调度智能体协作。需要参数：project_id, task_description, required_capabilities(能力列表)",
    parameters: z.object({
      project_id: z.string(),
      task_description: z.string(),
      required_capabilities: z.array(z.string())
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'collaboration_dispatch', args)
  },
  milestone_monitor: {
    description: "监控项目里程碑状态。获取项目所有里程碑的当前进展、截止日期及风险状态。",
    parameters: z.object({
      project_id: z.string().describe("项目ID")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'milestone_monitor', args)
  },
  defect_create: {
    description: "创建缺陷报告。参数：project_id(项目ID), title(缺陷标题), description(详细描述), severity(严重程度), priority(优先级), assignee_id(负责人)",
    parameters: z.object({
      project_id: z.string(),
      title: z.string(),
      description: z.string(),
      severity: z.enum(["trivial", "minor", "major", "critical", "blocker"]),
      priority: z.enum(["low", "medium", "high"]).optional(),
      reporter_id: z.string().optional(),
      assignee_id: z.string().optional(),
      steps_to_reproduce: z.array(z.string()).optional(),
      expected_result: z.string().optional(),
      actual_result: z.string().optional()
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'defect_create', args)
  },
  risk_create: {
    description: "创建项目风险。参数：project_id(项目ID), title(风险标题), description(描述), probability(发生概率), impact(影响程度), mitigation_plan(缓解计划)",
    parameters: z.object({
      project_id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      probability: z.enum(["low", "medium", "high"]),
      impact: z.enum(["low", "medium", "high", "critical"]),
      mitigation_plan: z.string().optional(),
      owner_id: z.string().optional()
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'risk_create', args)
  },
  document_query: {
    description: "查询文档。参数可选项目ID，默认情况下，查询当前访问用户的所有文档",
    parameters: z.object({
      project_id: z.string().optional(),
      kind: z.string().optional(),
      chat_id: z.string().optional()
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'document_query', args)
  },
  // 测试用例管理工具
  ...testCaseManagementTools,
  // 文档管理工具
  ...documentManagementTools,
  // 迭代管理工具
  ...iterationManagementTools,
  // 里程碑管理工具
  ...milestoneManagementTools,
  // 需求管理工具
  ...requirementManagementTools,
  // 任务管理工具
  ...taskManagementTools,
  // 缺陷管理工具
  ...defectManagementTools,
};

// 导出工具集
export { 
  projectManagementTools, 
  requirementManagementTools, 
  taskManagementTools, 
  defectManagementTools,
  metricManagementTools,
  testPlanManagementTools
};

export const businessSupportMCPTools = {
  resume_create: {
    description: "创建或更新自由职业者简历。参数：freelancer_id(自由职业者ID), title(简历标题), summary(个人简介), skills(技能列表), experience(工作经验), education(教育背景), hourly_rate(时薪), availability(可工作时间)",
    parameters: z.object({
      freelancer_id: z.string().describe("自由职业者ID"),
      title: z.string().describe("简历标题"),
      summary: z.string().optional().describe("个人简介"),
      skills: z.array(z.string()).describe("技能列表"),
      experience: z.array(z.any()).optional().describe("工作经验"),
      education: z.array(z.any()).optional().describe("教育背景"),
      hourly_rate: z.number().optional().describe("时薪"),
      availability: z.enum(["full_time", "part_time", "project_basis"]).optional().describe("可工作时间")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'resume_create', args)
  },
  freelancer_register: {
    description: "注册自由职业者。参数：name(姓名), email(邮箱), phone(电话), country(国家), timezone(时区), preferred_languages(首选语言), payment_methods(支付方式)",
    parameters: z.object({
      name: z.string().describe("姓名"),
      email: z.string().email().describe("邮箱"),
      phone: z.string().optional().describe("电话"),
      country: z.string().describe("国家"),
      timezone: z.string().optional().describe("时区"),
      preferred_languages: z.array(z.string()).optional().describe("首选语言"),
      payment_methods: z.array(z.string()).optional().describe("支付方式")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'freelancer_register', args)
  },
  service_create: {
    description: "创建自由职业者服务。参数：freelancer_id(自由职业者ID), title(服务标题), description(服务描述), category(服务类别), price_type(计价方式), price(价格), delivery_time(交付时间), revisions(修改次数)",
    parameters: z.object({
      freelancer_id: z.string().describe("自由职业者ID"),
      title: z.string().describe("服务标题"),
      description: z.string().describe("服务描述"),
      category: z.enum(["web_development", "mobile_app", "design", "writing", "marketing", "consulting"]).optional().describe("服务类别"),
      price_type: z.enum(["hourly", "fixed", "milestone"]).describe("计价方式"),
      price: z.number().optional().describe("价格"),
      delivery_time: z.string().optional().describe("交付时间"),
      revisions: z.number().optional().describe("修改次数")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'service_create', args)
  },
  transaction_create: {
    description: "创建服务交易。参数：client_id(客户ID), freelancer_id(自由职业者ID), service_id(服务ID), amount(金额), currency(货币), description(交易描述), terms(条款)",
    parameters: z.object({
      client_id: z.string().describe("客户ID"),
      freelancer_id: z.string().describe("自由职业者ID"),
      service_id: z.string().describe("服务ID"),
      amount: z.number().describe("金额"),
      currency: z.string().optional().describe("货币 (默认 USD)"),
      description: z.string().optional().describe("交易描述"),
      terms: z.string().optional().describe("条款")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'transaction_create', args)
  },
  contract_create: {
    description: "创建或更新合同。参数：transaction_id(交易ID), terms(详细条款), signatures(签名状态), attachments(附件列表)",
    parameters: z.object({
      transaction_id: z.string().describe("交易ID"),
      terms: z.string().describe("详细条款"),
      signatures: z.array(z.string()).optional().describe("签名状态"),
      attachments: z.array(z.string()).optional().describe("附件列表")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'contract_create', args)
  }
};

export const technicalAnalysisMCPTools = {
  talent_match: {
    description: "智能人才匹配。根据技能、预算和工期从人才库中搜索并匹配最合适的自由职业者。",
    parameters: z.object({
      skills: z.array(z.string()).describe("所需技能列表，例如 ['React', 'Node.js', 'TypeScript']"),
      budget: z.number().optional().describe("项目预算"),
      duration: z.string().optional().describe("预计项目工期")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'talent_match', args)
  },
  skill_analyzer: {
    description: "技能需求分析工具。分析项目描述以提取所需的关键技能、经验要求和专业领域。",
    parameters: z.object({
      project_description: z.string().describe("项目或任务的详细描述"),
      industry: z.string().optional().describe("所属行业（可选）")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'skill_analyzer', args)
  },
  marketplace_integrator: {
    description: "人才市场集成工具。跨平台同步人才数据，搜索第三方平台的人才信息。",
    parameters: z.object({
      platforms: z.array(z.string()).optional().describe("目标平台列表"),
      query: z.string().describe("搜索关键词"),
      filters: z.record(z.any()).optional().describe("过滤条件")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'marketplace_integrator', args)
  },
  compliance_checker: {
    description: "合同合规性检查工具。验证合同条款是否符合法律法规、公司政策及特定项目要求。",
    parameters: z.object({
      contract_terms: z.string().describe("合同详细条款"),
      region: z.string().optional().describe("适用法律区域"),
      compliance_type: z.array(z.string()).optional().describe("检查类型：legal, tax, policy")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'compliance_checker', args)
  },
  growth_strategy_analyzer: {
    description: "增长策略分析工具。提供 A/B 测试设计、用户转化漏斗优化及留存率分析建议。",
    parameters: z.object({
      metrics: z.record(z.any()).optional().describe("当前业务指标 (如转化率、留存率)"),
      goal: z.string().describe("增长目标"),
      platform: z.string().optional().describe("目标平台")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'growth_strategy_analyzer', args)
  },
  ux_design_reviewer: {
    description: "UX 设计评审工具。评审交互原型、用户旅程及设计系统一致性。",
    parameters: z.object({
      prototype_link: z.string().describe("原型链接"),
      user_persona: z.string().optional().describe("目标用户画像"),
      focus_areas: z.array(z.string()).optional().describe("重点评审领域")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'ux_design_reviewer', args)
  },
  devops_pipeline_optimizer: {
    description: "DevOps 流水线优化工具。评估 CI/CD 流程、IaC 管理及自动化测试集成。",
    parameters: z.object({
      current_stack: z.array(z.string()).optional().describe("当前技术栈"),
      deployment_frequency: z.string().optional().describe("发布频率"),
      automation_level: z.number().optional().describe("自动化程度 (0-1)")
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'devops_pipeline_optimizer', args)
  }
};

export const orchestrationMCPTools = {
  agent_collaboration_plan: {
    description: "规划多智能体协作流程。需要参数：objective(目标), constraints(约束)",
    parameters: z.object({
      objective: z.string(),
      constraints: z.array(z.string()).optional()
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'agent_collaboration_plan', args)
  },
  agent_collaboration_start: {
    description: "启动已规划的多智能体协作。需要参数：plan_id",
    parameters: z.object({
      plan_id: z.string()
    }),
    execute: async (args: any) => executeMCPTool('uxin-mcp', 'agent_collaboration_start', args)
  }
};
