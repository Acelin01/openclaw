import { ProjectApp, CollaborationContext } from "@uxin/projects/project-app";

export const getProjectCollaborationTools = (projectApp: ProjectApp, baseContext?: Partial<CollaborationContext>) => {
  const context = {
    userId: baseContext?.userId || "mcp-system",
    token: "uxin-service-secret-123",
    isService: true,
  };

  return [
    {
      name: "project_create",
      description: "创建新项目。需要参数：name(项目名称), description(描述), owner_id(负责人ID), start_date(开始日期), end_date(结束日期), budget_min(最小预算), budget_max(最大预算)",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          owner_id: { type: "string" },
          start_date: { type: "string", format: "date" },
          end_date: { type: "string", format: "date" },
          budget_min: { type: "number" },
          budget_max: { type: "number" },
          team_members: { type: "array", items: { type: "string" } }
        },
        required: ["name", "owner_id"]
      },
      handler: async (args: any) => projectApp.createProject(args, context)
    },
    {
      name: "iteration_create",
      description: "创建项目迭代。参数：project_id(项目ID), title(迭代标题), description(描述), start_date(开始日期), end_date(结束日期), owner_id(负责人ID)",
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
        required: ["project_id", "title", "start_date", "end_date"]
      },
      handler: async (args: any) => projectApp.createIteration(args, { ...context, projectId: args.project_id })
    },
    {
      name: "milestone_create",
      description: "创建项目里程碑。参数：project_id(项目ID), title(里程碑标题), due_date(截止日期), description(描述)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          due_date: { type: "string", format: "date" },
          description: { type: "string" },
          dependencies: { type: "array", items: { type: "string" } }
        },
        required: ["project_id", "title", "due_date"]
      },
      handler: async (args: any) => projectApp.createMilestone(args, { ...context, projectId: args.project_id })
    },
    {
      name: "requirement_create",
      description: "创建项目需求。参数：project_id(项目ID), title(需求标题), description(详细描述), reviewer_id(审核人ID), priority(优先级), status(状态), assignee_id(负责人)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          reviewer_id: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
          status: { type: "string", enum: ["draft", "approved", "in_progress", "completed", "rejected"] },
          assignee_id: { type: "string" },
          estimated_hours: { type: "number" },
          acceptance_criteria: { type: "array", items: { type: "string" } }
        },
        required: ["project_id", "title"]
      },
      handler: async (args: any) => projectApp.createRequirement(args, { ...context, projectId: args.project_id })
    },
    {
      name: "task_create",
      description: "创建任务。参数：project_id(项目ID), requirement_id(可选:需求ID), title(任务标题), description(描述), assignee_id(负责人), estimated_hours(预计工时), priority(优先级)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          requirement_id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          assignee_id: { type: "string" },
          due_date: { type: "string", format: "date" },
          estimated_hours: { type: "number" },
          priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
          dependencies: { type: "array", items: { type: "string" } }
        },
        required: ["project_id", "title", "assignee_id"]
      },
      handler: async (args: any) => projectApp.createTask(args, { ...context, projectId: args.project_id })
    },
    {
      name: "task_update_status",
      description: "更新任务状态。参数：task_id(任务ID), status(新状态: pending, in_progress, completed, failed)",
      inputSchema: {
        type: "object",
        properties: {
          task_id: { type: "string" },
          status: { type: "string", enum: ["pending", "in_progress", "completed", "failed"] }
        },
        required: ["task_id", "status"]
      },
      handler: async (args: any) => projectApp.updateTaskStatus(args.task_id, args.status, context)
    },
    {
      name: "collaboration_dispatch",
      description: "智能体协作调度。将任务分配给特定角色的智能体，并建立依赖关系。参数：task_id(任务ID), agent_role(目标智能体角色), context(协作上下文)",
      inputSchema: {
        type: "object",
        properties: {
          task_id: { type: "string" },
          agent_role: { type: "string" },
          context: { type: "string" },
          dependencies: { type: "array", items: { type: "string" } }
        },
        required: ["task_id", "agent_role", "context"]
      },
      handler: async (args: any) => projectApp.dispatchCollaboration(args, context)
    },
    {
      name: "collaboration_sync",
      description: "同步协作状态。在多个智能体间同步任务进展和中间产物。参数：project_id(项目ID), updates(更新内容列表)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          updates: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task_id: { type: "string" },
                status: { type: "string" },
                output: { type: "object" }
              },
              required: ["task_id", "status"]
            }
          }
        },
        required: ["project_id", "updates"]
      },
      handler: async (args: any) => projectApp.syncCollaboration(args, context)
    },
    {
      name: "defect_create",
      description: "创建缺陷报告。参数：project_id(项目ID), title(缺陷标题), description(详细描述), severity(严重程度), steps_to_reproduce(重现步骤), expected_result(期望结果), actual_result(实际结果)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          severity: { type: "string", enum: ["trivial", "minor", "major", "critical", "blocker"] },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          reporter_id: { type: "string" },
          assignee_id: { type: "string" },
          steps_to_reproduce: { type: "array", items: { type: "string" } },
          expected_result: { type: "string" },
          actual_result: { type: "string" }
        },
        required: ["project_id", "title", "description", "severity"]
      },
      handler: async (args: any) => projectApp.createBug(args, { ...context, projectId: args.project_id })
    },
    {
      name: "risk_create",
      description: "创建项目风险。参数：project_id(项目ID), title(风险标题), description(描述), probability(发生概率), impact(影响程度), mitigation_plan(缓解计划), owner_id(负责人)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          probability: { type: "string", enum: ["low", "medium", "high"] },
          impact: { type: "string", enum: ["low", "medium", "high", "critical"] },
          risk_level: { type: "string", enum: ["green", "yellow", "red"] },
          mitigation_plan: { type: "string" },
          owner_id: { type: "string" },
          due_date: { type: "string", format: "date" }
        },
        required: ["project_id", "title", "probability", "impact"]
      },
      handler: async (args: any) => projectApp.createRisk(args, { ...context, projectId: args.project_id })
    },
    {
      name: "team_add_member",
      description: "添加团队成员到项目。参数：project_id(项目ID), user_id(用户ID), role(角色), permissions(权限列表)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          user_id: { type: "string" },
          role: { type: "string", enum: ["member", "developer", "tester", "manager", "stakeholder"] },
          permissions: { type: "array", items: { type: "string" } },
          weekly_hours: { type: "number" },
          hourly_rate: { type: "number" }
        },
        required: ["project_id", "user_id", "role"]
      },
      handler: async (args: any) => projectApp.addTeamMember(args, { ...context, projectId: args.project_id })
    },
    {
      name: "project_query",
      description: "查询项目信息。参数：project_id(项目ID) 或 filter(筛选条件)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          filter: { type: "object" },
          include: { type: "array", items: { type: "string" } }
        }
      },
      handler: async (args: any) => {
        if (args.project_id) {
          return projectApp.getProject(args.project_id, context);
        }
        return projectApp.queryProjects(args.filter || {}, context);
      }
    },
    {
      name: "task_list",
      description: "查看项目下的所有任务列表及当前进度。参数：project_id(项目ID)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" }
        },
        required: ["project_id"]
      },
      handler: async (args: any) => projectApp.getTasks(args.project_id, { ...context, projectId: args.project_id })
    },
    {
      name: "milestone_monitor",
      description: "监控项目里程碑状态。获取项目所有里程碑的当前进展、截止日期及风险状态。",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string", description: "项目ID" }
        },
        required: ["project_id"]
      },
      handler: async (args: any) => {
        const projectRes: any = await projectApp.getProject(args.project_id, context);
        const project = projectRes?.data ?? projectRes;
        const milestones = (project && typeof project === 'object' ? (project as any).milestones : []) || [];
        return {
          success: true,
          project_id: args.project_id,
          milestones: milestones.map((m: any) => ({
            id: m.id,
            title: m.title || m.name,
            status: m.status || "pending",
            due_date: m.due_date || m.dueDate,
            progress: m.progress || 0,
            is_delayed: m.due_date ? new Date(m.due_date) < new Date() && m.status !== "completed" : false
          })),
          summary: `${milestones.length} milestones found for project.`
        };
      }
    },
    {
      name: "financial_record_create",
      description: "创建项目财务记录。参数：project_id(项目ID), type(类型: INCOME/EXPENSE), amount(金额), category(分类), description(描述), date(日期)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          type: { type: "string", enum: ["INCOME", "EXPENSE"] },
          amount: { type: "number" },
          category: { type: "string" },
          description: { type: "string" },
          date: { type: "string", format: "date-time" }
        },
        required: ["project_id", "type", "amount"]
      },
      handler: async (args: any) => projectApp.createFinancialRecord(args, { ...context, projectId: args.project_id })
    },
    {
      name: "approval_create",
      description: "发起审批申请。参数：project_id(项目ID), title(审批标题), description(描述), requester_id(申请人ID)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          requester_id: { type: "string" }
        },
        required: ["project_id", "title"]
      },
      handler: async (args: any) => projectApp.createApproval(args, { ...context, projectId: args.project_id })
    },
    {
      name: "qna_create",
      description: "提出项目问题。参数：project_id(项目ID), question(问题内容), asked_by_id(提问者ID)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          question: { type: "string" },
          asked_by_id: { type: "string" }
        },
        required: ["project_id", "question"]
      },
      handler: async (args: any) => projectApp.createQnA(args, { ...context, projectId: args.project_id })
    },
    {
      name: "report_create",
      description: "创建项目报告。参数：project_id(项目ID), title(报告标题), content(报告内容), period(报告周期)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          title: { type: "string" },
          content: { type: "object" },
          period: { type: "string" }
        },
        required: ["project_id", "title"]
      },
      handler: async (args: any) => projectApp.createReport(args, { ...context, projectId: args.project_id })
    },
    {
      name: "document_query",
      description: "查询文档。参数可选项目ID，默认情况下，查询当前访问用户的所有文档",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          kind: { type: "string" },
          chat_id: { type: "string" }
        }
      },
      handler: async (args: any) => projectApp.getDocuments(args, context)
    }
  ];
};
