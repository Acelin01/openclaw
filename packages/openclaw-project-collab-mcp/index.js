#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

const VERSION = "0.1.0";
const STORE_ENV = "OPENCLAW_PROJECT_COLLAB_STORE";
const DEFAULT_STORE_PATH = path.join(os.homedir(), ".openclaw", "project-collab.json");

const storePath = process.env[STORE_ENV] || DEFAULT_STORE_PATH;

function createId() {
  try {
    return randomUUID();
  } catch {
    return `pc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

async function loadStore() {
  try {
    const raw = await fs.readFile(storePath, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return {
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        milestones: Array.isArray(parsed.milestones) ? parsed.milestones : [],
        requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      };
    }
  } catch {
    return { projects: [], milestones: [], requirements: [], tasks: [], risks: [] };
  }
  return { projects: [], milestones: [], requirements: [], tasks: [], risks: [] };
}

async function saveStore(store) {
  const dir = path.dirname(storePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(store, null, 2));
}

function jsonResult(payload) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

function buildProjectArtifact(params) {
  const { project, milestones, tasks, risks } = params;
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((task) => task.status === "completed").length;
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length;
  const pendingTasks = tasks.filter((task) => task.status === "pending").length;
  const overdueMilestones = milestones.filter((milestone) => milestone.status === "overdue").length;
  const riskCount = risks.length;

  const metrics = [
    {
      label: "任务完成",
      value: `${doneTasks}/${totalTasks}`,
      status: totalTasks > 0 && doneTasks === totalTasks ? "ok" : "warning",
    },
    {
      label: "进行中",
      value: String(inProgressTasks),
      status: inProgressTasks > 0 ? "warning" : "ok",
    },
    {
      label: "待处理",
      value: String(pendingTasks),
      status: pendingTasks > 0 ? "warning" : "ok",
    },
    {
      label: "里程碑风险",
      value: String(overdueMilestones),
      status: overdueMilestones > 0 ? "risk" : "ok",
    },
    {
      label: "风险项",
      value: String(riskCount),
      status: riskCount > 0 ? "risk" : "ok",
    },
  ];

  const sections = [
    {
      title: "里程碑",
      items: milestones.map((milestone) => `${milestone.title} · ${milestone.status}`),
    },
    {
      title: "关键任务",
      items: tasks.slice(0, 5).map((task) => `${task.title} · ${task.status}`),
    },
  ].filter((section) => section.items.length > 0);

  return {
    kind: "project-collab",
    title: project.name || "项目协同",
    subtitle: project.owner_id ? `负责人：${project.owner_id}` : undefined,
    summary: project.description || "",
    metrics,
    sections,
  };
}

function toMilestoneStatus(milestone) {
  const now = Date.now();
  if (milestone.status) {
    return milestone.status;
  }
  if (!milestone.due_date) {
    return "unknown";
  }
  const due = Date.parse(milestone.due_date);
  if (Number.isNaN(due)) {
    return "unknown";
  }
  return due < now ? "overdue" : "on_track";
}

function normalizeTaskStatus(status) {
  if (
    status === "pending" ||
    status === "in_progress" ||
    status === "completed" ||
    status === "failed"
  ) {
    return status;
  }
  return "pending";
}

function ensureString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

const toolDefinitions = [
  {
    name: "project_create",
    description: "创建项目",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        owner_id: { type: "string" },
        start_date: { type: "string" },
        end_date: { type: "string" },
        budget: { type: "number" },
        team_members: { type: "array", items: { type: "string" } },
      },
      required: ["name", "owner_id"],
    },
  },
  {
    name: "project_query",
    description: "查询项目",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
      },
    },
  },
  {
    name: "milestone_create",
    description: "创建项目里程碑",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        title: { type: "string" },
        due_date: { type: "string" },
        description: { type: "string" },
        dependencies: { type: "array", items: { type: "string" } },
      },
      required: ["project_id", "title", "due_date"],
    },
  },
  {
    name: "milestone_monitor",
    description: "监控里程碑状态",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
      },
      required: ["project_id"],
    },
  },
  {
    name: "requirement_create",
    description: "创建项目需求",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
        status: {
          type: "string",
          enum: ["draft", "approved", "in_progress", "completed", "rejected"],
        },
        assignee_id: { type: "string" },
        estimated_hours: { type: "number" },
        acceptance_criteria: { type: "array", items: { type: "string" } },
      },
      required: ["project_id", "title"],
    },
  },
  {
    name: "task_create",
    description: "创建任务",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        requirement_id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        assignee_id: { type: "string" },
        estimated_hours: { type: "number" },
        priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
        due_date: { type: "string" },
        dependencies: { type: "array", items: { type: "string" } },
      },
      required: ["project_id", "title", "assignee_id"],
    },
  },
  {
    name: "task_update_status",
    description: "更新任务状态",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "string" },
        status: { type: "string", enum: ["pending", "in_progress", "completed", "failed"] },
      },
      required: ["task_id", "status"],
    },
  },
  {
    name: "task_list",
    description: "查看项目任务列表",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
      },
      required: ["project_id"],
    },
  },
  {
    name: "risk_create",
    description: "创建项目风险",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        probability: { type: "string", enum: ["low", "medium", "high"] },
        impact: { type: "string", enum: ["low", "medium", "high", "critical"] },
        mitigation_plan: { type: "string" },
        owner_id: { type: "string" },
        due_date: { type: "string" },
      },
      required: ["project_id", "title", "probability", "impact"],
    },
  },
  {
    name: "project_dashboard",
    description: "生成项目协同仪表盘（artifact 输出）",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
      },
      required: ["project_id"],
    },
  },
];

const server = new Server(
  { name: "openclaw-project-collab", version: VERSION },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: toolDefinitions };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;
  const args = request.params.arguments ?? {};
  const store = await loadStore();

  if (name === "project_create") {
    const project = {
      project_id: createId(),
      name: ensureString(args.name),
      description: ensureString(args.description),
      owner_id: ensureString(args.owner_id),
      start_date: ensureString(args.start_date),
      end_date: ensureString(args.end_date),
      budget: typeof args.budget === "number" ? args.budget : undefined,
      team_members: ensureArray(args.team_members),
      created_at: new Date().toISOString(),
    };
    store.projects.push(project);
    await saveStore(store);
    return jsonResult(project);
  }

  if (name === "project_query") {
    if (typeof args.project_id === "string" && args.project_id) {
      const project = store.projects.find((item) => item.project_id === args.project_id);
      return jsonResult({ project: project ?? null });
    }
    return jsonResult({ projects: store.projects });
  }

  if (name === "milestone_create") {
    const milestone = {
      milestone_id: createId(),
      project_id: ensureString(args.project_id),
      title: ensureString(args.title),
      due_date: ensureString(args.due_date),
      description: ensureString(args.description),
      dependencies: ensureArray(args.dependencies),
      status: "on_track",
      created_at: new Date().toISOString(),
    };
    store.milestones.push(milestone);
    await saveStore(store);
    return jsonResult(milestone);
  }

  if (name === "milestone_monitor") {
    const projectId = ensureString(args.project_id);
    const milestones = store.milestones
      .filter((item) => item.project_id === projectId)
      .map((item) => ({ ...item, status: toMilestoneStatus(item) }));
    return jsonResult({ project_id: projectId, milestones });
  }

  if (name === "requirement_create") {
    const requirement = {
      requirement_id: createId(),
      project_id: ensureString(args.project_id),
      title: ensureString(args.title),
      description: ensureString(args.description),
      priority: ensureString(args.priority || "medium"),
      status: ensureString(args.status || "draft"),
      assignee_id: ensureString(args.assignee_id),
      estimated_hours: typeof args.estimated_hours === "number" ? args.estimated_hours : undefined,
      acceptance_criteria: ensureArray(args.acceptance_criteria),
      created_at: new Date().toISOString(),
    };
    store.requirements.push(requirement);
    await saveStore(store);
    return jsonResult(requirement);
  }

  if (name === "task_create") {
    const task = {
      task_id: createId(),
      project_id: ensureString(args.project_id),
      requirement_id: ensureString(args.requirement_id),
      title: ensureString(args.title),
      description: ensureString(args.description),
      assignee_id: ensureString(args.assignee_id),
      estimated_hours: typeof args.estimated_hours === "number" ? args.estimated_hours : undefined,
      priority: ensureString(args.priority || "medium"),
      due_date: ensureString(args.due_date),
      dependencies: ensureArray(args.dependencies),
      status: "pending",
      created_at: new Date().toISOString(),
    };
    store.tasks.push(task);
    await saveStore(store);
    return jsonResult(task);
  }

  if (name === "task_update_status") {
    const taskId = ensureString(args.task_id);
    const status = normalizeTaskStatus(args.status);
    const task = store.tasks.find((item) => item.task_id === taskId);
    if (!task) {
      return jsonResult({ error: "task_not_found", task_id: taskId });
    }
    task.status = status;
    await saveStore(store);
    return jsonResult(task);
  }

  if (name === "task_list") {
    const projectId = ensureString(args.project_id);
    const tasks = store.tasks.filter((item) => item.project_id === projectId);
    return jsonResult({ project_id: projectId, tasks });
  }

  if (name === "risk_create") {
    const risk = {
      risk_id: createId(),
      project_id: ensureString(args.project_id),
      title: ensureString(args.title),
      description: ensureString(args.description),
      probability: ensureString(args.probability),
      impact: ensureString(args.impact),
      mitigation_plan: ensureString(args.mitigation_plan),
      owner_id: ensureString(args.owner_id),
      due_date: ensureString(args.due_date),
      created_at: new Date().toISOString(),
    };
    store.risks.push(risk);
    await saveStore(store);
    return jsonResult(risk);
  }

  if (name === "project_dashboard") {
    const projectId = ensureString(args.project_id);
    const project = store.projects.find((item) => item.project_id === projectId);
    if (!project) {
      return jsonResult({ error: "project_not_found", project_id: projectId });
    }
    const milestones = store.milestones
      .filter((item) => item.project_id === projectId)
      .map((item) => ({ ...item, status: toMilestoneStatus(item) }));
    const tasks = store.tasks.filter((item) => item.project_id === projectId);
    const risks = store.risks.filter((item) => item.project_id === projectId);
    const artifact = buildProjectArtifact({ project, milestones, tasks, risks });
    return jsonResult({
      artifact,
      data: { project, milestones, tasks, risks },
    });
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("openclaw-project-collab-mcp running on stdio");
}

void main();
