import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { ProjectData, TaskStatus } from "../../lib/types";

type ChatRequest = {
  message?: unknown;
  sessionId?: unknown;
};

type GatewayResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

const normalizeProjectData = (value: unknown): ProjectData | null => {
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
    path.resolve(process.cwd(), "..", "..", "..", "openclaw-local", "openclaw.json"),
    path.resolve(process.cwd(), "..", "..", "..", "..", "openclaw-local", "openclaw.json"),
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

const resolveGatewayConfig = async () => {
  const baseUrl = process.env.OPENCLAW_GATEWAY_HTTP_URL || "http://127.0.0.1:18789";
  const tokenFromEnv =
    process.env.OPENCLAW_GATEWAY_TOKEN ||
    process.env.CLAWDBOT_GATEWAY_TOKEN ||
    process.env.OPENCLAW_GATEWAY_PASSWORD ||
    process.env.CLAWDBOT_GATEWAY_PASSWORD ||
    "";
  const token = tokenFromEnv || (await resolveGatewayTokenFromConfig());
  const model = process.env.OPENCLAW_RUNTIME_MODEL || "openclaw";
  return { baseUrl, token, model };
};

const sendChat = async (params: {
  baseUrl: string;
  token: string;
  model: string;
  systemPrompt: string;
  message: string;
  sessionId?: string;
}): Promise<string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (params.token) {
    headers.Authorization = `Bearer ${params.token}`;
  }
  const response = await fetch(`${params.baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: params.model,
      stream: false,
      user: params.sessionId,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.message },
      ],
    }),
  });
  if (!response.ok) {
    throw new Error(`Gateway error: ${response.status}`);
  }
  const json = (await response.json()) as GatewayResponse;
  return json.choices?.[0]?.message?.content ?? "";
};

const AGENTS = {
  pm: {
    name: "项目经理",
    role: "pm",
    prompt:
      "你是资深项目经理。请分析用户需求，决定是直接回复还是分派给团队。如果需要分派，请说明原因。",
  },
  product: {
    name: "产品经理",
    role: "product",
    prompt:
      "你是资深产品经理。负责进行市场分析、用户调研、竞品分析，并撰写详细的产品需求文档(PRD)和用户故事。",
  },
  dev: {
    name: "全栈开发",
    role: "dev",
    prompt: "你是全栈开发专家。负责技术选型、架构设计和代码实现。请给出具体的代码示例。",
  },
  qa: {
    name: "测试工程师",
    role: "qa",
    prompt: "你是测试专家。负责编写测试用例、验收标准和自动化测试脚本。",
  },
};

// 提取 JSON 的辅助函数
const parseJsonSafe = (text: string) => {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
  } catch {}
  return null;
};

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequest;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ ok: false, error: "消息不能为空。" }, { status: 400 });
  }
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : undefined;

  try {
    const { baseUrl, token, model } = await resolveGatewayConfig();
    const steps: Array<{ role: string; content: string }> = [];
    let projectData: ProjectData | null = null;
    let skillOutput = "";

    // 1. 初始化循环
    let context = `用户输入: "${message}"\n`;
    let finalReply = "";
    let loopCount = 0;
    const MAX_LOOPS = 3;

    while (loopCount < MAX_LOOPS) {
      // 1.1 PM 分析与分派
      const analysisPrompt = `
你是一个智能体团队的项目经理。
${context}

请分析当前状态，并以 JSON 格式输出下一步行动：
{
  "thought": "分析思考过程，包括对已有结果的评估，是否存在风险或需要调整",
  "status": "CONTINUE" | "FINISH",
  "tasks": [
    {
      "assignee": "product" | "dev" | "qa" | "skill_pm",
      "instruction": "给被分派者的具体指令"
    }
  ],
  "final_reply": "如果 status 为 FINISH，请在此处生成最终回复给用户"
}
注意：
- 优先按照以下流程分派任务（可根据需求灵活调整，支持并行）：
  1. 需求分析与设计 -> 分派给 "product" (市场分析、产品设计、PRD)。
  2. 开发实现 -> 分派给 "dev" (前端开发、后端开发、架构设计)。
  3. 测试验证 -> 分派给 "qa" (编写测试用例、验收测试)。
- 每次只分派当前最需要的一组任务。
- 仔细评估已完成的任务结果。如果发现需求变更或执行风险，请在 thought 中说明，并生成新的修正任务重新分派。
- 如果任务已全部完成且满意，或无法进一步处理，status 设为 "FINISH"，并在 final_reply 中总结。
仅输出 JSON。
`;

      const analysisRes = await sendChat({
        baseUrl,
        token,
        model,
        systemPrompt: "你是项目经理。请只输出 JSON。",
        message: analysisPrompt,
        sessionId,
      });

      const analysis = parseJsonSafe(analysisRes) || {
        status: "FINISH",
        thought: "无法解析指令，结束处理。",
        final_reply: "处理过程中遇到问题，请稍后重试。",
        tasks: [],
      };

      steps.push({ role: "项目经理 (思考)", content: analysis.thought || "正在分析..." });

      if (analysis.status === "FINISH") {
        finalReply = analysis.final_reply || "任务完成。";
        break;
      }

      // 1.2 执行分派任务
      if (analysis.tasks && Array.isArray(analysis.tasks) && analysis.tasks.length > 0) {
        for (const task of analysis.tasks) {
          let agentOutput = "";
          let agentRoleName = "";
          const assignee = task.assignee;
          const instruction = task.instruction || "执行任务";

          if (assignee === "product") {
            agentRoleName = AGENTS.product.name;
            steps.push({
              role: "项目经理 (派发)",
              content: `任务派发给 ${agentRoleName}。\n指令: ${instruction}`,
            });
            agentOutput = await sendChat({
              baseUrl,
              token,
              model,
              systemPrompt: AGENTS.product.prompt,
              message: instruction,
              sessionId,
            });
          } else if (assignee === "dev") {
            agentRoleName = AGENTS.dev.name;
            steps.push({
              role: "项目经理 (派发)",
              content: `任务派发给 ${agentRoleName}。\n指令: ${instruction}`,
            });
            agentOutput = await sendChat({
              baseUrl,
              token,
              model,
              systemPrompt: AGENTS.dev.prompt,
              message: instruction,
              sessionId,
            });
          } else if (assignee === "qa") {
            agentRoleName = AGENTS.qa.name;
            steps.push({
              role: "项目经理 (派发)",
              content: `任务派发给 ${agentRoleName}。\n指令: ${instruction}`,
            });
            agentOutput = await sendChat({
              baseUrl,
              token,
              model,
              systemPrompt: AGENTS.qa.prompt,
              message: instruction,
              sessionId,
            });
          } else if (assignee === "skill_pm") {
            agentRoleName = "技能执行代理";
            steps.push({
              role: "项目经理 (派发)",
              content: `任务派发给 ${agentRoleName}。\n指令: 执行项目管理技能`,
            });
            try {
              skillOutput = await sendChat({
                baseUrl,
                token,
                model,
                systemPrompt: "你是技能执行代理。收到指令后立即执行。",
                message: `/skill project-manager ${message}`,
                sessionId,
              });
              const rawJson = skillOutput ? extractJsonContent(skillOutput) : null;
              if (rawJson) {
                projectData = normalizeProjectData(JSON.parse(rawJson));
              }
              agentOutput = "已执行项目管理技能，更新了看板数据。";
            } catch (err) {
              agentOutput = `技能执行失败: ${String(err)}`;
            }
          }

          if (agentRoleName) {
            steps.push({ role: `${agentRoleName} (回复)`, content: agentOutput });
            context += `\n[${agentRoleName} 执行结果]:\n${agentOutput}\n`;
          }
        }
        context += `\n请评估上述结果。如有问题请继续分派任务，否则结束。\n`;
      } else {
        // 没有任务但状态是 CONTINUE，强制结束防止死循环
        finalReply = analysis.final_reply || "未收到进一步指令，任务结束。";
        break;
      }

      loopCount++;
    }

    if (!finalReply && loopCount >= MAX_LOOPS) {
      finalReply = "任务执行轮次过多，已强制结束。请检查之前的步骤输出。";
    }

    return NextResponse.json({
      ok: true,
      reply: finalReply,
      steps,
      skill: skillOutput || undefined,
      projectData,
      agentName: AGENTS.pm.name,
    });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ ok: false, error: `调用失败: ${String(err)}` }, { status: 500 });
  }
}
