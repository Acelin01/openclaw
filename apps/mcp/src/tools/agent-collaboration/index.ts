import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CollaborationContext, ProjectApp } from "@uxin/projects/project-app";

function getRepoRoot() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.resolve(__dirname, "../../../../../");
}

function resolveFlowchartDocPath() {
  return path.join(getRepoRoot(), ".trae/documents/智能体协作/流程图.md");
}

async function tryLoadFlowchartsMarkdown() {
  const filePath = resolveFlowchartDocPath();
  try {
    const markdown = await fs.readFile(filePath, "utf8");
    return { filePath, markdown };
  } catch {
    return { filePath, markdown: "" };
  }
}

type PlanComplexity = "simple" | "medium" | "complex";

type AgentRole =
  | "product_lead"
  | "task_analyst"
  | "architect"
  | "frontend"
  | "backend"
  | "qa"
  | "devops"
  | "docs"
  | "project_lead";

type CollaborationPlanTask = {
  key: string;
  title: string;
  description: string;
  agent_role: AgentRole;
  depends_on: string[];
};

function estimateComplexity(goal: string): PlanComplexity {
  const text = String(goal || "").trim();
  const len = text.length;
  const signals = [
    /多租户|分布式|微服务|高并发|高可用|容灾|多语言|多端|K8s|kubernetes/i,
    /支付|结算|风控|权限|审计|合规/i,
    /重构|迁移|遗留|兼容|集成|对接/i,
    /实时|websocket|流式|队列|消息/i,
    /模型|agent|多智能体|工作流|编排/i,
  ];
  const hit = signals.reduce((acc, re) => acc + (re.test(text) ? 1 : 0), 0);

  if (hit >= 3 || len >= 90) return "complex";
  if (hit >= 1 || len >= 45) return "medium";
  return "simple";
}

function buildPlan(goal: string) {
  const complexity = estimateComplexity(goal);
  const needsUI = /前端|页面|UI|界面|交互|设计|组件|移动端|H5|小程序/i.test(goal);
  const needsBackend = /后端|接口|API|数据库|鉴权|权限|服务|微服务|网关/i.test(goal);
  const needsDevOps = /部署|docker|k8s|kubernetes|ci\/cd|监控|日志|告警|prometheus|grafana/i.test(goal);

  const tasks: CollaborationPlanTask[] = [
    {
      key: "req_analysis",
      title: "需求解析与边界确认",
      description: `目标：${goal}\n产出：需求拆解、范围边界、约束与验收口径（对齐流程图中的需求解析/分类）`,
      agent_role: "product_lead",
      depends_on: [],
    },
    {
      key: "task_breakdown",
      title: "任务分解与依赖梳理",
      description: "产出：可执行任务列表、依赖关系、里程碑/并行策略（对齐流程图中的任务拆解/依赖管理）",
      agent_role: "task_analyst",
      depends_on: ["req_analysis"],
    },
    {
      key: "architecture",
      title: "技术方案与协作编排",
      description: "产出：技术路线、模块边界、接口契约、协作编排方案（对齐流程图中的架构/组件设计与编排）",
      agent_role: "architect",
      depends_on: ["task_breakdown"],
    },
  ];

  if (needsUI) {
    tasks.push({
      key: "ui_design",
      title: "前端方案与交互设计",
      description: "产出：页面信息架构、组件拆分、交互流、状态管理方案",
      agent_role: "frontend",
      depends_on: ["task_breakdown"],
    });
  }

  if (needsBackend) {
    tasks.push({
      key: "backend_design",
      title: "后端方案与数据建模",
      description: "产出：数据模型、API 设计、鉴权/权限、错误码与可观测性方案",
      agent_role: "backend",
      depends_on: ["task_breakdown"],
    });
  }

  tasks.push({
    key: "implementation",
    title: "开发实现与联调",
    description: "产出：代码实现、联调通过、关键链路可运行（对齐流程图中的执行/协同与结果整合）",
    agent_role: needsBackend ? "backend" : needsUI ? "frontend" : "architect",
    depends_on: [
      "architecture",
      ...(needsUI ? ["ui_design"] : []),
      ...(needsBackend ? ["backend_design"] : []),
    ],
  });

  if (needsDevOps) {
    tasks.push({
      key: "deployment",
      title: "部署与运行保障",
      description: "产出：部署方案、环境配置、监控/日志/告警与回滚策略（对齐流程图中的部署架构/运维）",
      agent_role: "devops",
      depends_on: ["architecture"],
    });
  }

  tasks.push({
    key: "qa",
    title: "测试验证与质量门禁",
    description: "产出：测试用例、关键路径验证、回归通过（对齐流程图中的质量检查/迭代）",
    agent_role: "qa",
    depends_on: ["implementation"],
  });

  tasks.push({
    key: "handoff",
    title: "交付物整理与协作总结",
    description: "产出：交付清单、使用说明/变更点、风险与后续迭代建议",
    agent_role: "project_lead",
    depends_on: ["qa"],
  });

  if (complexity !== "simple") {
    tasks.push({
      key: "docs",
      title: "文档与知识沉淀",
      description: "产出：关键决策记录、接口/模块说明、操作手册",
      agent_role: "docs",
      depends_on: ["handoff"],
    });
  }

  const nodes = tasks.map((t) => `  ${t.key}[${t.title}]`).join("\n");
  const edges = tasks
    .flatMap((t) => t.depends_on.map((d) => `  ${d} --> ${t.key}`))
    .join("\n");
  const dependency_mermaid = `graph TD\n${nodes}${edges ? "\n" + edges : ""}`;

  return {
    complexity,
    tasks,
    dependency_mermaid,
  };
}

function toPlanOutput(goal: string, includeFlowchartMarkdown?: boolean) {
  const plan = buildPlan(goal);
  return {
    goal,
    ...plan,
    include_flowcharts: Boolean(includeFlowchartMarkdown),
  };
}

async function createAndDispatchPlan(params: {
  projectApp: ProjectApp;
  projectId: string;
  goal: string;
  assigneeId: string;
  createTasks: boolean;
  dispatch: boolean;
  dispatchContext?: string;
  context: CollaborationContext;
}) {
  const plan = buildPlan(params.goal);
  const created: Array<{ plan_key: string; task: any }> = [];
  const dispatched: Array<{ plan_key: string; task_id: string; agent_role: AgentRole }> = [];
  const warnings: string[] = [];

  if (!params.context.token) {
    warnings.push("缺少 token，无法创建/调度项目任务，仅返回协作计划");
    return { success: true, plan, created, dispatched, warnings };
  }

  const planKeyToTaskId: Record<string, string> = {};

  if (params.createTasks) {
    for (const t of plan.tasks) {
      const resp = await params.projectApp.createTask(
        {
          project_id: params.projectId,
          title: t.title,
          description: t.description,
          assignee_id: params.assigneeId,
        },
        { ...params.context, projectId: params.projectId }
      );

      if (!resp?.success) {
        return {
          success: false,
          message: "创建协作任务失败",
          plan,
          created,
          dispatched,
          error: resp,
        };
      }

      const task = resp.data;
      planKeyToTaskId[t.key] = task.id;
      created.push({ plan_key: t.key, task });
    }
  } else {
    warnings.push("create_tasks=false：未创建项目任务，仅返回协作计划");
  }

  if (params.dispatch && params.createTasks) {
    for (const t of plan.tasks) {
      const taskId = planKeyToTaskId[t.key];
      const deps = t.depends_on.map((d) => planKeyToTaskId[d]).filter(Boolean);
      const resp = await params.projectApp.dispatchCollaboration(
        {
          taskId,
          agentRole: t.agent_role,
          context: [params.dispatchContext, `目标：${params.goal}`, t.description].filter(Boolean).join("\n\n"),
          dependencies: deps,
        },
        { ...params.context, projectId: params.projectId }
      );

      if (!resp?.success) {
        return {
          success: false,
          message: "协作调度失败",
          plan,
          created,
          dispatched,
          error: resp,
        };
      }
      dispatched.push({ plan_key: t.key, task_id: taskId, agent_role: t.agent_role });
    }
  } else if (!params.dispatch) {
    warnings.push("dispatch=false：未执行智能体协作调度，仅创建/返回计划");
  }

  return { success: true, plan, created, dispatched, warnings };
}

export const getAgentCollaborationTools = (projectApp: ProjectApp, baseContext?: Partial<CollaborationContext>) => {
  const context: CollaborationContext = {
    userId: baseContext?.userId || "mcp-system",
    token: baseContext?.token,
    isService: baseContext?.isService,
  };

  return [
    {
      name: "agent_collaboration_plan",
      description: "基于流程图的智能体协作编排：生成任务分解与依赖关系。参数：goal(协作目标), include_flowcharts(可选)返回流程图原文",
      inputSchema: {
        type: "object",
        properties: {
          goal: { type: "string" },
          include_flowcharts: { type: "boolean" },
        },
        required: ["goal"],
      },
      handler: async (args: any) => {
        const goal = String(args?.goal || "").trim();
        if (!goal) {
          return { success: false, message: "goal 不能为空" };
        }

        const plan = toPlanOutput(goal, args?.include_flowcharts);
        if (args?.include_flowcharts) {
          const flow = await tryLoadFlowchartsMarkdown();
          return {
            success: true,
            ...plan,
            flowcharts: flow,
          };
        }
        return { success: true, ...plan };
      },
    },
    {
      name: "agent_collaboration_start",
      description:
        "启动智能体协作编排：生成计划，并可选创建项目任务与执行协作调度。参数：project_id, goal, assignee_id(可选), create_tasks(默认true), dispatch(默认true), context(可选补充上下文)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          goal: { type: "string" },
          assignee_id: { type: "string" },
          create_tasks: { type: "boolean" },
          dispatch: { type: "boolean" },
          context: { type: "string" },
        },
        required: ["project_id", "goal"],
      },
      handler: async (args: any) => {
        const projectId = String(args?.project_id || "").trim();
        const goal = String(args?.goal || "").trim();
        if (!projectId) return { success: false, message: "project_id 不能为空" };
        if (!goal) return { success: false, message: "goal 不能为空" };

        const assigneeId = String(args?.assignee_id || context.userId || "mcp-system");
        const createTasks = args?.create_tasks !== false;
        const dispatch = args?.dispatch !== false;
        const dispatchContext = typeof args?.context === "string" ? args.context : undefined;

        const runId = crypto.randomUUID();
        const result = await createAndDispatchPlan({
          projectApp,
          projectId,
          goal,
          assigneeId,
          createTasks,
          dispatch,
          dispatchContext,
          context: { ...context, projectId },
        });

        return {
          ...result,
          run_id: runId,
          project_id: projectId,
        };
      },
    },
  ];
};
