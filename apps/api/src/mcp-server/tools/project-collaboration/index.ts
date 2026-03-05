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
      handler: async (args: any) => projectApp.createProject(
        {
          name: args.name,
          description: args.description,
          start_date: args.start_date,
          end_date: args.end_date,
          budget: args.budget,
          priority: args.priority,
          category: args.category,
          tags: args.tags,
          owner_id: context.userId
        },
        context
      ),
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
      handler: async (args: any) => projectApp.getProject(args.project_id, context),
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
      handler: async (args: any) => projectApp.createTask(
        {
          project_id: args.project_id,
          title: args.title,
          description: args.description,
          assignee_id: args.assignee_id,
          due_date: args.due_date,
          priority: args.priority,
          labels: args.labels,
          estimate_hours: args.estimate_hours,
          requirement_id: args.requirement_id
        },
        context
      ),
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
      handler: async (args: any) => projectApp.updateTaskStatus(args.task_id, args.status, context),
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
      handler: async (args: any) => projectApp.listTasks(
        {
          project_id: args.project_id,
          status: args.status,
          assignee_id: args.assignee_id,
          limit: args.limit,
          offset: args.offset
        },
        context
      ),
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
      handler: async (args: any) => projectApp.createRequirement(
        {
          project_id: args.project_id,
          title: args.title,
          description: args.description,
          priority: args.priority,
          category: args.category,
          acceptance_criteria: args.acceptance_criteria
        },
        context
      ),
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
      handler: async (args: any) => projectApp.createMilestone(
        {
          project_id: args.project_id,
          title: args.title,
          due_date: args.due_date,
          description: args.description
        },
        context
      ),
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
      handler: async (args: any) => projectApp.monitorMilestones(args.project_id, context),
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
      handler: async (args: any) => projectApp.createDefect(
        {
          project_id: args.project_id,
          title: args.title,
          description: args.description,
          severity: args.severity,
          priority: args.priority,
          steps_to_reproduce: args.steps_to_reproduce
        },
        context
      ),
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
      handler: async (args: any) => projectApp.createRisk(
        {
          project_id: args.project_id,
          title: args.title,
          description: args.description,
          probability: args.probability,
          impact: args.impact,
          mitigation_plan: args.mitigation_plan
        },
        context
      ),
    },
    {
      name: "document_query",
      description: "查询文档。参数可选：project_id(项目 ID), kind(文档类型), chat_id(聊天 ID)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          kind: { type: "string" },
          chat_id: { type: "string" },
        },
      },
      handler: async (args: any) => projectApp.getDocuments(
        {
          project_id: args.project_id,
          kind: args.kind,
          chat_id: args.chat_id
        },
        context
      ),
    },
    {
      name: "iteration_create",
      description: "创建迭代。参数：project_id(项目 ID), title(迭代标题), start_date(开始日期), end_date(结束日期), goal(目标)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          start_date: { type: "string", format: "date" },
          end_date: { type: "string", format: "date" },
          goal: { type: "string" },
          owner_id: { type: "string" }
        },
        required: ["project_id", "title"]
      },
      handler: async (args: any) => projectApp.createIteration(
        {
          project_id: args.project_id,
          title: args.title,
          start_date: args.start_date,
          end_date: args.end_date,
          goal: args.goal,
          owner_id: args.owner_id || context.userId
        },
        context
      ),
    },
    {
      name: "task_update",
      description: "更新任务。参数：task_id(任务 ID), title(标题), description(描述), assignee_id(负责人), priority(优先级), due_date(截止日期)",
      inputSchema: {
        type: "object",
        properties: {
          task_id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          assignee_id: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
          due_date: { type: "string", format: "date" },
          labels: { type: "array", items: { type: "string" } }
        },
        required: ["task_id"]
      },
      handler: async (args: any) => projectApp.updateTask(
        args.task_id,
        {
          title: args.title,
          description: args.description,
          assignee_id: args.assignee_id,
          priority: args.priority,
          due_date: args.due_date,
          labels: args.labels
        },
        context
      ),
    },
    {
      name: "bug_create",
      description: "创建 Bug。参数：project_id(项目 ID), title(Bug 标题), description(描述), severity(严重程度), steps_to_reproduce(重现步骤)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          steps_to_reproduce: { type: "array", items: { type: "string" } },
          assignee_id: { type: "string" }
        },
        required: ["project_id", "title"]
      },
      handler: async (args: any) => projectApp.createBug(
        {
          project_id: args.project_id,
          title: args.title,
          description: args.description,
          severity: args.severity,
          steps_to_reproduce: args.steps_to_reproduce,
          assignee_id: args.assignee_id
        },
        context
      ),
    },
    {
      name: "document_create",
      description: "创建文档。参数：project_id(项目 ID), title(文档标题), content(内容), kind(文档类型)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          content: { type: "string" },
          kind: { type: "string" },
          author_id: { type: "string" }
        },
        required: ["project_id", "title", "content"]
      },
      handler: async (args: any) => projectApp.createDocument(
        {
          project_id: args.project_id,
          title: args.title,
          content: args.content,
          kind: args.kind,
          author_id: args.author_id || context.userId
        },
        context
      ),
    },
    {
      name: "document_update",
      description: "更新文档。参数：document_id(文档 ID), title(标题), content(内容), status(状态)",
      inputSchema: {
        type: "object",
        properties: {
          document_id: { type: "string" },
          title: { type: "string" },
          content: { type: "string" },
          status: { type: "string", enum: ["draft", "published", "archived"] }
        },
        required: ["document_id"]
      },
      handler: async (args: any) => projectApp.updateDocument(
        {
          document_id: args.document_id,
          title: args.title,
          content: args.content,
          status: args.status
        },
        context
      ),
    },
    {
      name: "approval_create",
      description: "创建审批。参数：project_id(项目 ID), title(审批标题), type(审批类型), approver_id(审批人)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          type: { type: "string" },
          approver_id: { type: "string" },
          description: { type: "string" }
        },
        required: ["project_id", "title", "approver_id"]
      },
      handler: async (args: any) => projectApp.createApproval(
        {
          project_id: args.project_id,
          title: args.title,
          type: args.type,
          approver_id: args.approver_id,
          description: args.description
        },
        context
      ),
    },
    {
      name: "report_create",
      description: "创建报告。参数：project_id(项目 ID), title(报告标题), type(报告类型), content(内容)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          type: { type: "string" },
          content: { type: "string" },
          author_id: { type: "string" }
        },
        required: ["project_id", "title", "type"]
      },
      handler: async (args: any) => projectApp.createReport(
        {
          project_id: args.project_id,
          title: args.title,
          type: args.type,
          content: args.content,
          author_id: args.author_id || context.userId
        },
        context
      ),
    },
    {
      name: "financial_create",
      description: "创建财务记录。参数：project_id(项目 ID), type(类型), amount(金额), description(描述)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          type: { type: "string", enum: ["income", "expense"] },
          amount: { type: "number" },
          description: { type: "string" },
          category: { type: "string" }
        },
        required: ["project_id", "type", "amount"]
      },
      handler: async (args: any) => projectApp.createFinancialRecord(
        {
          project_id: args.project_id,
          type: args.type,
          amount: args.amount,
          description: args.description,
          category: args.category
        },
        context
      ),
    },
    {
      name: "test_plan_create",
      description: "创建测试计划。参数：project_id(项目 ID), title(测试计划标题), description(描述), start_date(开始日期), end_date(结束日期)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          start_date: { type: "string", format: "date" },
          end_date: { type: "string", format: "date" },
          owner_id: { type: "string" }
        },
        required: ["project_id", "title"]
      },
      handler: async (args: any) => projectApp.createTestPlan(args, context)
    },
    {
      name: "test_plan_list",
      description: "测试计划列表。参数：project_id(项目 ID), status(状态)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          status: { type: "string" },
          limit: { type: "number" },
          offset: { type: "number" }
        },
        required: ["project_id"]
      },
      handler: async (args: any) => projectApp.listTestPlans(args, context)
    },
    {
      name: "test_plan_query",
      description: "查询测试计划。参数：test_plan_id(测试计划 ID)",
      inputSchema: {
        type: "object",
        properties: {
          test_plan_id: { type: "string" }
        },
        required: ["test_plan_id"]
      },
      handler: async (args: any) => projectApp.getTestPlan(args.test_plan_id, context)
    },
    {
      name: "test_case_create",
      description: "创建测试用例。参数：project_id(项目 ID), title(用例标题), steps(步骤), expected_result(期望结果)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          steps: { type: "array", items: { type: "string" } },
          expected_result: { type: "string" },
          priority: { type: "string" }
        },
        required: ["project_id", "title"]
      },
      handler: async (args: any) => projectApp.createTestCase(args, context)
    },
    {
      name: "test_case_list",
      description: "测试用例列表。参数：project_id(项目 ID), test_plan_id(测试计划 ID)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          test_plan_id: { type: "string" },
          status: { type: "string" }
        },
        required: ["project_id"]
      },
      handler: async (args: any) => projectApp.listTestCases(args, context)
    },
    {
      name: "test_case_query",
      description: "查询测试用例。参数：test_case_id(测试用例 ID)",
      inputSchema: {
        type: "object",
        properties: {
          test_case_id: { type: "string" }
        },
        required: ["test_case_id"]
      },
      handler: async (args: any) => projectApp.getTestCase(args.test_case_id, context)
    },
    {
      name: "test_execution_create",
      description: "执行测试。参数：test_case_id(测试用例 ID), result(结果), actual_result(实际结果)",
      inputSchema: {
        type: "object",
        properties: {
          test_case_id: { type: "string" },
          result: { type: "string", enum: ["pass", "fail", "blocked"] },
          actual_result: { type: "string" },
          executed_by: { type: "string" }
        },
        required: ["test_case_id", "result"]
      },
      handler: async (args: any) => projectApp.createTestExecution(args, context)
    },
    {
      name: "iteration_query",
      description: "查询迭代。参数：iteration_id(迭代 ID)",
      inputSchema: {
        type: "object",
        properties: {
          iteration_id: { type: "string" }
        },
        required: ["iteration_id"]
      },
      handler: async (args: any) => projectApp.getIteration(args.iteration_id, context)
    },
    {
      name: "iteration_list",
      description: "迭代列表。参数：project_id(项目 ID), status(状态)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          status: { type: "string" },
          limit: { type: "number" },
          offset: { type: "number" }
        },
        required: ["project_id"]
      },
      handler: async (args: any) => projectApp.listIterations(args, context)
    },
    {
      name: "iteration_planning",
      description: "迭代规划。参数：iteration_id(迭代 ID), work_items(工作项列表)",
      inputSchema: {
        type: "object",
        properties: {
          iteration_id: { type: "string" },
          work_items: { type: "array", items: { type: "string" } }
        },
        required: ["iteration_id"]
      },
      handler: async (args: any) => projectApp.planIteration(args, context)
    },
    {
      name: "sprint_create",
      description: "创建冲刺。参数：project_id(项目 ID), title(冲刺标题), start_date(开始日期), end_date(结束日期)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          start_date: { type: "string", format: "date" },
          end_date: { type: "string", format: "date" }
        },
        required: ["project_id", "title"]
      },
      handler: async (args: any) => projectApp.createSprint(args, context)
    },
    {
      name: "defect_query",
      description: "查询缺陷。参数：defect_id(缺陷 ID)",
      inputSchema: {
        type: "object",
        properties: {
          defect_id: { type: "string" }
        },
        required: ["defect_id"]
      },
      handler: async (args: any) => projectApp.getDefect(args.defect_id, context)
    },
    {
      name: "defect_list",
      description: "缺陷列表。参数：project_id(项目 ID), status(状态), severity(严重程度)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          status: { type: "string" },
          severity: { type: "string" },
          limit: { type: "number" },
          offset: { type: "number" }
        },
        required: ["project_id"]
      },
      handler: async (args: any) => projectApp.listDefects(args, context)
    },
    {
      name: "defect_update",
      description: "更新缺陷。参数：defect_id(缺陷 ID), status(状态), priority(优先级), assignee_id(负责人)",
      inputSchema: {
        type: "object",
        properties: {
          defect_id: { type: "string" },
          status: { type: "string" },
          priority: { type: "string" },
          assignee_id: { type: "string" },
          description: { type: "string" }
        },
        required: ["defect_id"]
      },
      handler: async (args: any) => projectApp.updateDefect(args, context)
    },
    {
      name: "requirement_query",
      description: "查询需求。参数：requirement_id(需求 ID)",
      inputSchema: {
        type: "object",
        properties: {
          requirement_id: { type: "string" }
        },
        required: ["requirement_id"]
      },
      handler: async (args: any) => projectApp.getRequirement(args.requirement_id, context)
    },
    {
      name: "requirement_list",
      description: "需求列表。参数：project_id(项目 ID), status(状态), priority(优先级)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          status: { type: "string" },
          priority: { type: "string" },
          limit: { type: "number" },
          offset: { type: "number" }
        },
        required: ["project_id"]
      },
      handler: async (args: any) => projectApp.listRequirements(args, context)
    },
    {
      name: "requirement_update",
      description: "更新需求。参数：requirement_id(需求 ID), title(标题), description(描述), status(状态), priority(优先级)",
      inputSchema: {
        type: "object",
        properties: {
          requirement_id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          status: { type: "string" },
          priority: { type: "string" },
          assignee_id: { type: "string" }
        },
        required: ["requirement_id"]
      },
      handler: async (args: any) => projectApp.updateRequirement(args, context)
    },
    {
      name: "task_query",
      description: "查询任务。参数：task_id(任务 ID)",
      inputSchema: {
        type: "object",
        properties: {
          task_id: { type: "string" }
        },
        required: ["task_id"]
      },
      handler: async (args: any) => projectApp.getTask(args.task_id, context)
    },
    {
      name: "task_update",
      description: "更新任务。参数：task_id(任务 ID), title(标题), description(描述), assignee_id(负责人), priority(优先级), due_date(截止日期)",
      inputSchema: {
        type: "object",
        properties: {
          task_id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          assignee_id: { type: "string" },
          priority: { type: "string" },
          due_date: { type: "string", format: "date" },
          labels: { type: "array", items: { type: "string" } }
        },
        required: ["task_id"]
      },
      handler: async (args: any) => projectApp.updateTaskDetail(args, context)
    },
    {
      name: "milestone_query",
      description: "查询里程碑。参数：milestone_id(里程碑 ID)",
      inputSchema: {
        type: "object",
        properties: {
          milestone_id: { type: "string" }
        },
        required: ["milestone_id"]
      },
      handler: async (args: any) => projectApp.getMilestone(args.milestone_id, context)
    },
    {
      name: "milestone_list",
      description: "里程碑列表。参数：project_id(项目 ID), status(状态)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          status: { type: "string" },
          limit: { type: "number" },
          offset: { type: "number" }
        },
        required: ["project_id"]
      },
      handler: async (args: any) => projectApp.listMilestones(args, context)
    },
    {
      name: "milestone_update",
      description: "更新里程碑。参数：milestone_id(里程碑 ID), title(标题), description(描述), due_date(截止日期), status(状态)",
      inputSchema: {
        type: "object",
        properties: {
          milestone_id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          due_date: { type: "string", format: "date" },
          status: { type: "string" }
        },
        required: ["milestone_id"]
      },
      handler: async (args: any) => projectApp.updateMilestone(args, context)
    },
    {
      name: "risk_query",
      description: "查询风险。参数：risk_id(风险 ID)",
      inputSchema: {
        type: "object",
        properties: {
          risk_id: { type: "string" }
        },
        required: ["risk_id"]
      },
      handler: async (args: any) => projectApp.getRisk(args.risk_id, context)
    },
    {
      name: "risk_list",
      description: "风险列表。参数：project_id(项目 ID), status(状态), probability(发生概率)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          status: { type: "string" },
          probability: { type: "string" },
          limit: { type: "number" },
          offset: { type: "number" }
        },
        required: ["project_id"]
      },
      handler: async (args: any) => projectApp.listRisks(args, context)
    },
    {
      name: "risk_update",
      description: "更新风险。参数：risk_id(风险 ID), title(标题), description(描述), probability(发生概率), impact(影响程度), mitigation_plan(缓解计划)",
      inputSchema: {
        type: "object",
        properties: {
          risk_id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          probability: { type: "string" },
          impact: { type: "string" },
          mitigation_plan: { type: "string" },
          status: { type: "string" }
        },
        required: ["risk_id"]
      },
      handler: async (args: any) => projectApp.updateRisk(args, context)
    },
    {
      name: "time_tracking_create",
      description: "记录工时。参数：task_id(任务 ID), hours(工时), description(描述)",
      inputSchema: {
        type: "object",
        properties: {
          task_id: { type: "string" },
          hours: { type: "number" },
          description: { type: "string" }
        },
        required: ["task_id", "hours"]
      },
      handler: async (args: any) => projectApp.createTimeTracking(args, context)
    },
    {
      name: "time_tracking_query",
      description: "查询工时。参数：tracking_id(工时记录 ID)",
      inputSchema: {
        type: "object",
        properties: {
          tracking_id: { type: "string" }
        },
        required: ["tracking_id"]
      },
      handler: async (args: any) => projectApp.getTimeTracking(args.tracking_id, context)
    },
    {
      name: "timesheet_create",
      description: "创建时间表。参数：user_id(用户 ID), period(周期), entries(工时条目)",
      inputSchema: {
        type: "object",
        properties: {
          user_id: { type: "string" },
          period: { type: "string" },
          entries: { type: "array", items: { type: "object" } }
        },
        required: ["user_id", "period"]
      },
      handler: async (args: any) => projectApp.createTimesheet(args, context)
    },
    {
      name: "work_statistics",
      description: "工时统计。参数：project_id(项目 ID), user_id(用户 ID), start_date(开始日期), end_date(结束日期)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          user_id: { type: "string" },
          start_date: { type: "string", format: "date" },
          end_date: { type: "string", format: "date" }
        }
      },
      handler: async (args: any) => projectApp.getWorkStatistics(args, context)
    },
    {
      name: "project_list",
      description: "项目列表。参数：status(状态), owner_id(负责人 ID)",
      inputSchema: {
        type: "object",
        properties: {
          status: { type: "string" },
          owner_id: { type: "string" },
          limit: { type: "number" },
          offset: { type: "number" }
        }
      },
      handler: async (args: any) => projectApp.listProjects(args, context)
    },
    {
      name: "project_update",
      description: "更新项目。参数：project_id(项目 ID), name(名称), description(描述), status(状态)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          status: { type: "string" }
        },
        required: ["project_id"]
      },
      handler: async (args: any) => projectApp.updateProject(args, context)
    },
    {
      name: "project_metrics",
      description: "项目度量。参数：project_id(项目 ID)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" }
        },
        required: ["project_id"]
      },
      handler: async (args: any) => projectApp.getProjectMetrics(args, context)
    },
    {
      name: "project_settings",
      description: "项目设置。参数：project_id(项目 ID)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" }
        },
        required: ["project_id"]
      },
      handler: async (args: any) => projectApp.getProjectSettings(args, context)
    },
    {
      name: "release_create",
      description: "创建发布。参数：project_id(项目 ID), title(发布标题), version(版本号), description(描述)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          version: { type: "string" },
          description: { type: "string" }
        },
        required: ["project_id", "title", "version"]
      },
      handler: async (args: any) => projectApp.createRelease(args, context)
    },
    {
      name: "release_plan",
      description: "发布计划。参数：release_id(发布 ID), items(发布项), schedule(计划时间)",
      inputSchema: {
        type: "object",
        properties: {
          release_id: { type: "string" },
          items: { type: "array", items: { type: "string" } },
          schedule: { type: "string", format: "date-time" }
        },
        required: ["release_id"]
      },
      handler: async (args: any) => projectApp.planRelease(args, context)
    },
    {
      name: "deploy_create",
      description: "创建部署。参数：release_id(发布 ID), environment(环境), description(描述)",
      inputSchema: {
        type: "object",
        properties: {
          release_id: { type: "string" },
          environment: { type: "string", enum: ["development", "staging", "production"] },
          description: { type: "string" }
        },
        required: ["release_id", "environment"]
      },
      handler: async (args: any) => projectApp.createDeploy(args, context)
    },
    {
      name: "code_review_create",
      description: "创建代码审查。参数：project_id(项目 ID), title(审查标题), reviewer_id(审查人), description(描述)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          reviewer_id: { type: "string" },
          description: { type: "string" }
        },
        required: ["project_id", "title", "reviewer_id"]
      },
      handler: async (args: any) => projectApp.createCodeReview(args, context)
    },
    {
      name: "code_review_query",
      description: "查询代码审查。参数：review_id(审查 ID)",
      inputSchema: {
        type: "object",
        properties: {
          review_id: { type: "string" }
        },
        required: ["review_id"]
      },
      handler: async (args: any) => projectApp.getCodeReview(args.review_id, context)
    },
    // ========== 高级功能 ==========
    // 自由职业者服务增强
    {
      name: "freelancer_update",
      description: "更新自由职业者。参数：freelancer_id, name, skills, rate",
      inputSchema: {
        type: "object",
        properties: {
          freelancer_id: { type: "string" },
          name: { type: "string" },
          skills: { type: "array", items: { type: "string" } },
          rate: { type: "number" }
        },
        required: ["freelancer_id"]
      },
      handler: async (args: any) => projectApp.updateFreelancer(args, context)
    },
    {
      name: "service_query",
      description: "查询服务。参数：service_id",
      inputSchema: {
        type: "object",
        properties: {
          service_id: { type: "string" }
        },
        required: ["service_id"]
      },
      handler: async (args: any) => projectApp.getService(args.service_id, context)
    },
    {
      name: "transaction_query",
      description: "查询交易。参数：transaction_id",
      inputSchema: {
        type: "object",
        properties: {
          transaction_id: { type: "string" }
        },
        required: ["transaction_id"]
      },
      handler: async (args: any) => projectApp.getTransaction(args.transaction_id, context)
    },
    {
      name: "contract_query",
      description: "查询合同。参数：contract_id",
      inputSchema: {
        type: "object",
        properties: {
          contract_id: { type: "string" }
        },
        required: ["contract_id"]
      },
      handler: async (args: any) => projectApp.getContract(args.contract_id, context)
    },
    {
      name: "talent_match_enhanced",
      description: "增强人才匹配。参数：skills, budget, duration, experience_level",
      inputSchema: {
        type: "object",
        properties: {
          skills: { type: "array", items: { type: "string" } },
          budget: { type: "number" },
          duration: { type: "string" },
          experience_level: { type: "string" }
        },
        required: ["skills"]
      },
      handler: async (args: any) => projectApp.talentMatchEnhanced(args, context)
    },
    // 协作管理增强
    {
      name: "team_update",
      description: "更新团队。参数：team_id, name, members",
      inputSchema: {
        type: "object",
        properties: {
          team_id: { type: "string" },
          name: { type: "string" },
          members: { type: "array", items: { type: "string" } }
        },
        required: ["team_id"]
      },
      handler: async (args: any) => projectApp.updateTeam(args, context)
    },
    {
      name: "collaboration_query",
      description: "协作查询。参数：collaboration_id",
      inputSchema: {
        type: "object",
        properties: {
          collaboration_id: { type: "string" }
        },
        required: ["collaboration_id"]
      },
      handler: async (args: any) => projectApp.getCollaboration(args.collaboration_id, context)
    },
    {
      name: "agent_collaboration_execute",
      description: "执行智能体协作。参数：task_id, agents, workflow",
      inputSchema: {
        type: "object",
        properties: {
          task_id: { type: "string" },
          agents: { type: "array", items: { type: "string" } },
          workflow: { type: "string" }
        },
        required: ["task_id", "agents"]
      },
      handler: async (args: any) => projectApp.executeAgentCollaboration(args, context)
    },
    {
      name: "workflow_create",
      description: "创建工作流。参数：title, description, steps",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          steps: { type: "array", items: { type: "string" } }
        },
        required: ["title"]
      },
      handler: async (args: any) => projectApp.createWorkflow(args, context)
    },
    {
      name: "workflow_execute",
      description: "执行工作流。参数：workflow_id, params",
      inputSchema: {
        type: "object",
        properties: {
          workflow_id: { type: "string" },
          params: { type: "object" }
        },
        required: ["workflow_id"]
      },
      handler: async (args: any) => projectApp.executeWorkflow(args, context)
    },
    // 报告和分析
    {
      name: "report_create",
      description: "创建报告。参数：title, type, content",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string" },
          type: { type: "string" },
          content: { type: "string" }
        },
        required: ["title", "type"]
      },
      handler: async (args: any) => projectApp.createReport(args, context)
    },
    {
      name: "report_query",
      description: "查询报告。参数：report_id",
      inputSchema: {
        type: "object",
        properties: {
          report_id: { type: "string" }
        },
        required: ["report_id"]
      },
      handler: async (args: any) => projectApp.getReport(args.report_id, context)
    },
    {
      name: "analytics_dashboard",
      description: "分析仪表板。参数：project_id, metrics, date_range",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          metrics: { type: "array", items: { type: "string" } },
          date_range: { type: "object" }
        }
      },
      handler: async (args: any) => projectApp.getAnalyticsDashboard(args, context)
    },
    {
      name: "performance_metrics",
      description: "性能指标。参数：project_id, team_id, period",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          team_id: { type: "string" },
          period: { type: "string" }
        }
      },
      handler: async (args: any) => projectApp.getPerformanceMetrics(args, context)
    },
    {
      name: "export_data",
      description: "导出数据。参数：type, format, filters",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string" },
          format: { type: "string", enum: ["csv", "json", "xlsx"] },
          filters: { type: "object" }
        },
        required: ["type", "format"]
      },
      handler: async (args: any) => projectApp.exportData(args, context)
    },
  ];
};
