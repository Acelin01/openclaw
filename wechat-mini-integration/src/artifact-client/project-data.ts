import { promises as fs } from "node:fs";
import path from "node:path";
import { ProjectData, ProjectRequirement, ProjectTask, TaskStatus } from "./types.js";

const DEFAULT_STATUS = new Set<TaskStatus>(["PENDING", "IN_PROGRESS", "COMPLETED"]);

const resolveProjectDir = async (): Promise<string | null> => {
  const candidates = [
    path.resolve(process.cwd(), ".project"),
    path.resolve(process.cwd(), "..", ".project"),
  ];

  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) {
        return candidate;
      }
    } catch {
      continue;
    }
  }

  return null;
};

const readRequirements = async (projectDir: string): Promise<ProjectRequirement[]> => {
  const requirementsDir = path.join(projectDir, "requirements");
  try {
    const files = await fs.readdir(requirementsDir);
    const mdFiles = files
      .filter((file): file is string => typeof file === "string" && file.endsWith(".md"))
      .toSorted();
    const requirements = await Promise.all(
      mdFiles.map(async (file) => {
        const content = await fs.readFile(path.join(requirementsDir, file), "utf8");
        return {
          id: file.replace(/\.md$/, ""),
          content,
        };
      }),
    );
    return requirements;
  } catch {
    return [];
  }
};

const parseStatus = (value: string): TaskStatus => {
  const upper = value.toUpperCase();
  if (DEFAULT_STATUS.has(upper as TaskStatus)) {
    return upper as TaskStatus;
  }
  return "PENDING";
};

const readTasks = async (projectDir: string): Promise<ProjectTask[]> => {
  const tasksPath = path.join(projectDir, "backlog", "tasks.csv");
  try {
    const content = await fs.readFile(tasksPath, "utf8");
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const [id = "", description = "", status = "PENDING"] = line.split("|");
        return {
          id: id.trim(),
          description: description.trim(),
          status: parseStatus(status.trim()),
        };
      })
      .filter((task) => task.id.length > 0);
  } catch {
    return [];
  }
};

const buildRuntimePrompt = (requirements: ProjectRequirement[], tasks: ProjectTask[]): string => {
  const reqText =
    requirements.length === 0
      ? "无"
      : requirements.map((req) => `- ${req.id}\n${req.content}`).join("\n\n");
  const taskText =
    tasks.length === 0
      ? "无"
      : tasks.map((task) => `- ${task.id} | ${task.description} | ${task.status}`).join("\n");
  return `需求文档:\n${reqText}\n\n任务列表:\n${taskText}`;
};

const normalizeRuntimeData = (value: unknown): ProjectData | null => {
  if (!value || typeof value !== "object") {
    return null;
  }
  const data = value as {
    requirements?: Array<{ id?: string; content?: string }>;
    tasks?: Array<{ id?: string; description?: string; status?: string }>;
  };
  if (!Array.isArray(data.requirements) || !Array.isArray(data.tasks)) {
    return null;
  }
  const requirements = data.requirements.map((req) => ({
    id: req.id ?? "unknown",
    content: req.content ?? "",
  }));
  const tasks = data.tasks.map((task) => {
    const statusValue =
      task.status === "IN_PROGRESS" || task.status === "COMPLETED" || task.status === "PENDING"
        ? task.status
        : "PENDING";
    return {
      id: task.id ?? "unknown",
      description: task.description ?? "",
      status: statusValue as TaskStatus,
    };
  });
  return { requirements, tasks };
};

const extractJsonContent = (content: string): string | null => {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return null;
  }
  return content.slice(start, end + 1);
};

const resolveGatewayTokenFromConfig = async (): Promise<string> => {
  const candidates = [
    process.env.OPENCLAW_CONFIG_PATH,
    path.resolve(process.cwd(), "..", "openclaw-local", "openclaw.json"),
    path.resolve(process.cwd(), "..", "..", "openclaw-local", "openclaw.json"),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    try {
      const raw = await fs.readFile(candidate, "utf8");
      const parsed = JSON.parse(raw) as {
        gateway?: { auth?: { token?: string; password?: string } };
      };
      const token = parsed.gateway?.auth?.token?.trim() ?? "";
      if (token) {
        return token;
      }
      const password = parsed.gateway?.auth?.password?.trim() ?? "";
      if (password) {
        return password;
      }
    } catch {
      continue;
    }
  }

  return "";
};

const fetchRuntimeProjectData = async (
  requirements: ProjectRequirement[],
  tasks: ProjectTask[],
): Promise<ProjectData | null> => {
  const baseUrl = process.env.OPENCLAW_GATEWAY_HTTP_URL || "http://127.0.0.1:18789";
  const tokenFromEnv =
    process.env.OPENCLAW_GATEWAY_TOKEN ||
    process.env.CLAWDBOT_GATEWAY_TOKEN ||
    process.env.OPENCLAW_GATEWAY_PASSWORD ||
    process.env.CLAWDBOT_GATEWAY_PASSWORD ||
    "";
  const token = tokenFromEnv || (await resolveGatewayTokenFromConfig());
  const model = process.env.OPENCLAW_RUNTIME_MODEL || "openclaw";
  const systemPrompt =
    '你是项目管理助手。请基于提供的需求文档与任务列表，输出严格 JSON。格式为 {"requirements":[{"id":"...","content":"..."}],"tasks":[{"id":"...","description":"...","status":"PENDING|IN_PROGRESS|COMPLETED"}]}。只输出 JSON，不要解释。';
  const userPrompt = buildRuntimePrompt(requirements, tasks);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!response.ok) {
    return null;
  }
  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    return null;
  }
  const rawJson = extractJsonContent(content);
  if (!rawJson) {
    return null;
  }
  try {
    const parsed = JSON.parse(rawJson) as unknown;
    return normalizeRuntimeData(parsed);
  } catch {
    return null;
  }
};

export const getProjectData = async (): Promise<ProjectData> => {
  const projectDir = await resolveProjectDir();
  if (!projectDir) {
    return { requirements: [], tasks: [] };
  }

  const [requirements, tasks] = await Promise.all([
    readRequirements(projectDir),
    readTasks(projectDir),
  ]);

  try {
    const runtimeData = await fetchRuntimeProjectData(requirements, tasks);
    if (runtimeData) {
      return runtimeData;
    }
  } catch {
    return { requirements, tasks };
  }

  return { requirements, tasks };
};
