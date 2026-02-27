import { ProjectApp } from "@uxin/projects/project-app";
import { CollaborationContext } from "@uxin/agent-lib/collaboration/index";

export const getProjectCollaborationTools = (
  projectApp: ProjectApp,
  baseContext?: Partial<CollaborationContext>,
) => {
  const context: CollaborationContext = {
    userId: baseContext?.userId || "mcp-system",
    token: baseContext?.token,
    isService: baseContext?.isService,
    onEvent: baseContext?.onEvent,
  };

  return [
    {
      name: "project_create",
      description: "创建项目。参数：name(项目名称), description(描述), start_date(开始日期), end_date(结束日期)",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          start_date: { type: "string", format: "date" },
          end_date: { type: "string", format: "date" },
          budget: { type: "number" },
          priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
          category: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
        },
        required: ["name"],
      },
      handler: async (args: any) => projectApp.projectManagement.createProject(args, context),
    },
    {
      name: "project_query",
      description: "查询项目。参数：project_id(项目ID), filter(筛选条件)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          filter: { type: "object" },
        },
      },
      handler: async (args: any) => projectApp.projectManagement.getProject(args, context),
    },
    {
      name: "task_create",
      description: "创建任务。参数：project_id(项目ID), title(任务标题), description(任务描述), assignee_id(负责人ID), due_date(截止日期), priority(优先级)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          assignee_id: { type: "string" },
          due_date: { type: "string", format: "date" },
          priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
          labels: { type: "array", items: { type: "string" } },
          estimate_hours: { type: "number" },
          requirement_id: { type: "string" },
        },
        required: ["project_id", "title"],
      },
      handler: async (args: any) => projectApp.taskManagement.createTask(args, context),
    },
    {
      name: "task_update_status",
      description: "更新任务状态。参数：task_id(任务ID), status(新状态：pending/in_progress/completed/blocked)",
      inputSchema: {
        type: "object",
        properties: {
          task_id: { type: "string" },
          status: {
            type: "string",
            enum: ["pending", "in_progress", "completed", "blocked"],
          },
        },
        required: ["task_id", "status"],
      },
      handler: async (args: any) => projectApp.taskManagement.updateTaskStatus(args, context),
    },
    {
      name: "task_list",
      description: "获取任务列表。参数：project_id(项目ID), status(状态筛选), assignee_id(负责人筛选)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          status: { type: "string" },
          assignee_id: { type: "string" },
          limit: { type: "number" },
          offset: { type: "number" },
        },
      },
      handler: async (args: any) => projectApp.taskManagement.listTasks(args, context),
    },
    {
      name: "requirement_create",
      description: "创建需求。参数：project_id(项目ID), title(需求标题), description(需求描述), priority(优先级), category(分类)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
          category: { type: "string" },
          acceptance_criteria: { type: "array", items: { type: "string" } },
        },
        required: ["project_id", "title"],
      },
      handler: async (args: any) => projectApp.requirementManagement.createRequirement(args, context),
    },
    {
      name: "milestone_create",
      description: "创建里程碑。参数：project_id(项目ID), title(里程碑标题), due_date(截止日期), description(描述)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          due_date: { type: "string", format: "date" },
          description: { type: "string" },
        },
        required: ["project_id", "title"],
      },
      handler: async (args: any) => projectApp.milestoneManagement.createMilestone(args, context),
    },
    {
      name: "milestone_monitor",
      description: "监控里程碑。参数：project_id(项目ID)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
        },
        required: ["project_id"],
      },
      handler: async (args: any) => projectApp.milestoneManagement.monitorMilestones(args, context),
    },
    {
      name: "defect_create",
      description: "创建缺陷报告。参数：project_id(项目ID), title(缺陷标题), description(缺陷描述), severity(严重程度), priority(优先级)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
          steps_to_reproduce: { type: "string" },
        },
        required: ["project_id", "title"],
      },
      handler: async (args: any) => projectApp.defectManagement.createDefect(args, context),
    },
    {
      name: "risk_create",
      description: "创建项目风险。参数：project_id(项目ID), title(风险标题), description(风险描述), probability(发生概率), impact(影响程度)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          probability: { type: "string", enum: ["low", "medium", "high"] },
          impact: { type: "string", enum: ["low", "medium", "high"] },
          mitigation_plan: { type: "string" },
        },
        required: ["project_id", "title"],
      },
      handler: async (args: any) => projectApp.riskManagement.createRisk(args, context),
    },
  ];
};
