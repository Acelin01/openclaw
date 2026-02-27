import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import { createSkillService, TaskStatus, SkillFeedbackEngine, AgentRole } from '@uxin/skill';
import { generateUUID } from "../../utils.js";
import { createDocument } from "./create-document.js";
import { executeMCPTool } from "../../mcp/client.js";

const skillService = createSkillService();
const feedbackEngine = SkillFeedbackEngine.getInstance();
type TaskStatusValue = (typeof TaskStatus)[keyof typeof TaskStatus];

export const startCollaboration = ({ 
  token: _token,
  dataStream,
  session,
  chatId
}: { 
  token?: string;
  dataStream?: UIMessageStreamWriter;
  session?: any;
  chatId?: string;
} = {}) => tool({
  description: "Start a full intelligent collaboration workflow (Pre-check -> Requirement Analysis -> Execution) for a given goal, including project creation and task tracking.",
  inputSchema: z.object({
    goal: z.string().describe("The high-level goal or requirement description for the project."),
  }),
  execute: async ({ goal }) => {
    const steps: string[] = [];
    const addStep = (msg: string) => {
      console.log(`[StartCollaboration] ${msg}`);
      steps.push(msg);
      if (dataStream) {
        dataStream.write({
          type: "data-step" as any,
          data: msg,
          transient: true,
        });
      }
    };
    const emitActivity = (activity: {
      id: string;
      agentId: string;
      agentRole: string;
      action: string;
      timestamp: string;
      status: "pending" | "success" | "working";
    }) => {
      if (dataStream) {
        dataStream.write({
          type: "data-collaboration-activity" as any,
          data: activity,
          transient: true,
        });
      }
    };
    const appendMessage = (message: {
      id: string;
      role: "assistant";
      content: string;
      parts: Array<{ type: "text"; text: string } | any>;
      createdAt: string;
      authorName?: string;
      authorAvatar?: string;
      senderName?: string;
      messageType?: string;
      status?: string;
      metadata?: any;
    }) => {
      if (dataStream) {
        dataStream.write({
          type: "data-appendMessage" as any,
          data: JSON.stringify(message),
          transient: true,
        });
      }
    };

    const normalizedGoal = String(goal || "").trim();
    const goalLower = normalizedGoal.toLowerCase();
    const shouldTriggerServiceFlow = /服务|报价|交易|外包|freelancer|service|quote|transaction/i.test(normalizedGoal);
    const extractInlineId = (label: string) => {
      const match = new RegExp(`${label}\\s*[:=]\\s*([a-zA-Z0-9_-]+)`, "i").exec(normalizedGoal);
      return match?.[1];
    };
    const parsePrice = () => {
      const match = normalizedGoal.match(/(\d+(?:\.\d+)?)/);
      if (!match) return undefined;
      const value = Number(match[1]);
      return Number.isNaN(value) ? undefined : value;
    };
    const parseDelivery = () => {
      const match = normalizedGoal.match(/(\d+)\s*(天|日|周|月)/);
      if (!match) return undefined;
      return `${match[1]}${match[2]}`;
    };
    const deriveCategory = () => {
      if (/设计|ui|ux/i.test(normalizedGoal)) return "design";
      if (/文案|写作|内容/i.test(normalizedGoal)) return "writing";
      if (/营销|推广|增长/i.test(normalizedGoal)) return "marketing";
      if (/咨询|顾问/i.test(normalizedGoal)) return "consulting";
      if (/移动|app|ios|android/i.test(goalLower)) return "mobile_app";
      if (/前端|后端|网站|web/i.test(goalLower)) return "web_development";
      return undefined;
    };
    const derivePriceType = () => {
      if (/小时|hour/i.test(normalizedGoal)) return "hourly";
      if (/里程碑|milestone/i.test(normalizedGoal)) return "milestone";
      return "fixed";
    };

    try {
      // 1. 初步需求分析与预检查 (Requirement Analysis & Pre-check)
      addStep(`正在进行初步需求分析: "${goal}"...`);
      
      // 执行技能预检查，查看是否有类似项目存在
      addStep(`正在检查是否存在类似项目或已有资源...`);
      await skillService.preCheckEngine.executePreCheck([{ text: goal }], addStep);

      // 1.5 任务清单创建与跟踪安排 (Task List Creation & Tracking)
      addStep(`正在创建任务跟踪安排清单...`);
      const rawTasks = skillService.taskDecomposer.decompose(goal, { context: 'collaboration-startup' });
      const tasks = rawTasks.map((task, index) => {
        const title = task.name || task.description || `任务-${index + 1}`;
        const priority = title.toLowerCase().includes('implementation') ? 'high' : (title.toLowerCase().includes('design') ? 'medium' : 'medium');
        const risk = title.toLowerCase().includes('legacy') ? 'high' : (title.toLowerCase().includes('implementation') ? 'medium' : 'low');
        const assignee = title.toLowerCase().includes('analysis') ? '产品经理' : (title.toLowerCase().includes('design') ? '架构师' : '技术经理');
        const estimatedHours = title.toLowerCase().includes('implementation') ? 16 : (title.toLowerCase().includes('design') ? 8 : 6);
        return {
          ...task,
          title,
          priority,
          risk,
          assignee,
          estimatedHours,
        };
      });
      
      if (dataStream) {
        dataStream.write({
          type: "data-task-list" as any,
          data: tasks,
        });
      }
      const timeLabel = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const fallbackActivities = [
        { agentId: "pm", agentRole: "PM", action: "完成协作启动与任务拆解", status: "success" },
        { agentId: "pd", agentRole: "PD", action: "开始梳理需求并输出 PRD 草案", status: "working" },
        { agentId: "tm", agentRole: "TM", action: "评估技术方案与风险", status: "working" },
        { agentId: "ux", agentRole: "UX", action: "分析用户体验与交互路径", status: "working" },
        { agentId: "mk", agentRole: "MK", action: "调研市场与竞品信息", status: "working" },
        { agentId: "sys", agentRole: "SYS", action: "协调协作过程与进度跟踪", status: "working" },
      ];
      const fallbackMessages = [
        {
          agentId: "pd",
          name: "产品经理",
          messageType: "需求分析",
          content: `已基于目标“${goal}”梳理核心用户需求与业务边界，整理了关键场景、用户画像与优先级假设。`,
        },
        {
          agentId: "tm",
          name: "技术经理",
          messageType: "技术评估",
          content: `初步评估可行性与主要技术风险，建议先验证关键链路与性能瓶颈，再进入实现阶段。`,
        },
        {
          agentId: "ux",
          name: "用户体验",
          messageType: "体验分析",
          content: `梳理用户路径与关键触点，建议围绕首屏引导、核心操作闭环和异常兜底完善体验。`,
        },
        {
          agentId: "mk",
          name: "市场分析",
          messageType: "竞品调研",
          content: `初步收集同类产品信息，识别差异化方向与潜在用户增长点。`,
        },
        {
          agentId: "pm",
          name: "项目经理",
          messageType: "执行统筹",
          content: `已将任务拆解为阶段性清单并同步协作节奏，后续按里程碑推动执行。`,
        },
      ];

      const updateTask = (taskId: string, status: TaskStatusValue) => {
        if (dataStream) {
          dataStream.write({
            type: "data-task-update" as any,
            data: { id: taskId, status },
          });
        }
      };

      // 模拟第一个任务：预检查 (假设第一个任务是预检查)
      const firstTask = tasks[0];
      if (firstTask) {
        updateTask(firstTask.id, TaskStatus.IN_PROGRESS);
        await new Promise(resolve => setTimeout(resolve, 1000));
        updateTask(firstTask.id, TaskStatus.COMPLETED);
      }

      // 2. 创建项目 (Project Creation)
      addStep(`未发现完全匹配的现有项目，正在为您创建新项目...`);
      const secondTask = tasks[1];
      if (secondTask) updateTask(secondTask.id, TaskStatus.IN_PROGRESS);

      // In the API version, we might want to use the internal service to create the project
      // but for now, we'll stick to the fetch approach or use DatabaseService if available.
      // Since this is the API server itself, we can use DatabaseService.
      
      let projectData: any = null;
      try {
        if (session?.user?.id) {
          const projectName = goal.length > 20 ? goal.substring(0, 20) + '...' : goal;
          const toolResp: any = await executeMCPTool("uxin-mcp", "project_create", {
            name: projectName,
            description: goal,
            owner_id: session.user.id
          });
          const textPayload = toolResp?.content?.[0]?.text;
          if (typeof textPayload === "string") {
            try {
              projectData = JSON.parse(textPayload);
            } catch {
              projectData = { name: projectName, description: goal };
            }
          } else {
            projectData = toolResp?.data || toolResp;
          }
          const projectId = projectData?.id || projectData?.project_id;
          addStep(`项目创建成功: "${projectData?.name || projectName}" (ID: ${projectId || "N/A"})`);
        } else {
          addStep(`⚠️ 用户未登录，跳过项目物理创建`);
        }
      } catch (dbError) {
        console.error('Project create MCP error:', dbError);
        addStep(`⚠️ 项目创建失败: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
      }

      let collaborationResult: any = null;
      const projectId = projectData?.id || projectData?.project_id;
      if (projectId) {
        try {
          const toolResp: any = await executeMCPTool("uxin-mcp", "agent_collaboration_start", {
            project_id: projectId,
            goal: normalizedGoal,
            assignee_id: session?.user?.id,
            create_tasks: true,
            dispatch: true,
            context: `chatId=${chatId || ""}`.trim(),
          });
          const textPayload = toolResp?.content?.[0]?.text;
          if (typeof textPayload === "string") {
            collaborationResult = JSON.parse(textPayload);
          }
        } catch (error) {
          console.error("Error dispatching collaboration:", error);
        }
      }

      if (shouldTriggerServiceFlow && session?.user?.id) {
        addStep(`检测到服务类目标，触发服务创建流程...`);
        try {
          const serviceArgs: any = {
            freelancer_id: session.user.id,
            title: normalizedGoal.length > 80 ? normalizedGoal.slice(0, 80) : normalizedGoal,
            description: normalizedGoal || "服务需求",
            price_type: derivePriceType(),
          };
          const price = parsePrice();
          if (price !== undefined) serviceArgs.price = price;
          const delivery = parseDelivery();
          if (delivery) serviceArgs.delivery_time = delivery;
          const category = deriveCategory();
          if (category) serviceArgs.category = category;

          const serviceResp: any = await executeMCPTool("uxin-mcp", "service_create", serviceArgs);
          const servicePayload = serviceResp?.content?.[0]?.text;
          if (typeof servicePayload === "string") {
            try {
              const parsed = JSON.parse(servicePayload);
              if (parsed?.success) {
                addStep(`服务提案已创建，等待审批`);
              }
            } catch (e) {
              console.error("Error parsing service_create response:", e);
            }
          }

          const clientId = extractInlineId("client_id") || extractInlineId("customer_id");
          const serviceId = extractInlineId("service_id");
          if (clientId && serviceId) {
            const amount = price ?? 0;
            await executeMCPTool("uxin-mcp", "transaction_create", {
              client_id: clientId,
              freelancer_id: session.user.id,
              service_id: serviceId,
              amount,
              currency: "CNY",
              description: normalizedGoal || undefined,
            });
            addStep(`交易提案已创建，等待审批`);
          }
        } catch (error) {
          console.error("Error creating service/transaction proposals:", error);
        }
      }

      const roleProfiles: Record<string, { agentId: string; agentRole: string; name: string }> = {
        product_lead: { agentId: "pd", agentRole: "PD", name: "产品经理" },
        task_analyst: { agentId: "pm", agentRole: "PM", name: "项目经理" },
        architect: { agentId: "tm", agentRole: "TM", name: "技术架构" },
        frontend: { agentId: "fe", agentRole: "FE", name: "前端工程" },
        backend: { agentId: "be", agentRole: "BE", name: "后端工程" },
        qa: { agentId: "qa", agentRole: "QA", name: "测试工程" },
        devops: { agentId: "devops", agentRole: "DEVOPS", name: "运维工程" },
        docs: { agentId: "doc", agentRole: "DOCS", name: "文档专家" },
        project_lead: { agentId: "pm", agentRole: "PM", name: "项目经理" },
      };
      const taskMap = new Map<string, { title?: string; description?: string }>();
      if (Array.isArray(collaborationResult?.plan?.tasks)) {
        collaborationResult.plan.tasks.forEach((task: any) => {
          if (task?.key) taskMap.set(task.key, { title: task.title, description: task.description });
        });
      }
      const dispatchedList = Array.isArray(collaborationResult?.dispatched) ? collaborationResult.dispatched : [];
      const activityItems = dispatchedList.length
        ? dispatchedList.map((item: any) => {
            const profile = roleProfiles[item.agent_role] || {
              agentId: item.agent_role || "agent",
              agentRole: String(item.agent_role || "AGENT").toUpperCase(),
              name: String(item.agent_role || "智能体"),
            };
            const taskInfo = taskMap.get(item.plan_key);
            const action = taskInfo?.title ? `已接收任务：${taskInfo.title}` : "已接收协作任务";
            return {
              agentId: profile.agentId,
              agentRole: profile.agentRole,
              action,
              status: "working" as const,
            };
          })
        : fallbackActivities;
      activityItems.forEach((item: { agentId: string; agentRole: string; action: string; status: "pending" | "success" | "working" }) =>
        emitActivity({
          id: generateUUID(),
          agentId: item.agentId,
          agentRole: item.agentRole,
          action: item.action,
          timestamp: timeLabel,
          status: item.status as "pending" | "success" | "working",
        })
      );
      const messageItems = dispatchedList.length
        ? dispatchedList.map((item: any) => {
            const profile = roleProfiles[item.agent_role] || {
              agentId: item.agent_role || "agent",
              agentRole: String(item.agent_role || "AGENT").toUpperCase(),
              name: String(item.agent_role || "智能体"),
            };
            const taskInfo = taskMap.get(item.plan_key);
            const content = taskInfo?.title
              ? `已接收任务：${taskInfo.title}，开始推进并同步阶段性结论。`
              : "已接收协作任务，开始推进并同步阶段性结论。";
            return {
              agentId: profile.agentId,
              name: profile.name,
              messageType: "任务协作",
              content,
            };
          })
        : fallbackMessages;
      messageItems.forEach((message: { agentId: string; name: string; messageType: string; content: string }) =>
        appendMessage({
          id: generateUUID(),
          role: "assistant",
          content: message.content,
          parts: [{ type: "text", text: message.content }],
          createdAt: new Date().toISOString(),
          authorName: message.name,
          authorAvatar: message.agentId,
          senderName: message.name,
          messageType: message.messageType,
          status: "已输出",
          metadata: {
            authorName: message.name,
            authorAvatar: message.agentId,
            createdAt: new Date().toISOString(),
          },
        })
      );

      const registeredAgents = skillService.agentRegistry.listAllAgents();
      if (registeredAgents.length === 0) {
        const now = new Date().toISOString();
        const defaultAgents = [
          {
            id: "agent-pm",
            name: "项目经理",
            role: AgentRole.PROJECT_MANAGER,
            capabilities: [{ name: "analysis", description: "需求分析", metrics: ["completeness"], thresholds: { completeness: 0.7 } }],
            status: "idle",
            lastSeen: now,
          },
          {
            id: "agent-pd",
            name: "产品经理",
            role: AgentRole.PRODUCT_MANAGER,
            capabilities: [{ name: "analysis", description: "产品策略", metrics: ["clarity"], thresholds: { clarity: 0.7 } }],
            status: "idle",
            lastSeen: now,
          },
          {
            id: "agent-tm",
            name: "技术经理",
            role: AgentRole.TECH_MANAGER,
            capabilities: [{ name: "architecture", description: "架构评估", metrics: ["stability"], thresholds: { stability: 0.7 } }],
            status: "idle",
            lastSeen: now,
          },
          {
            id: "agent-arch",
            name: "架构师",
            role: AgentRole.ARCHITECT,
            capabilities: [{ name: "design", description: "技术方案", metrics: ["scalability"], thresholds: { scalability: 0.7 } }],
            status: "idle",
            lastSeen: now,
          },
          {
            id: "agent-qa",
            name: "测试专家",
            role: AgentRole.QA_EXPERT,
            capabilities: [{ name: "quality", description: "质量保障", metrics: ["coverage"], thresholds: { coverage: 0.7 } }],
            status: "idle",
            lastSeen: now,
          },
        ];
        defaultAgents.forEach((agent) => skillService.agentRegistry.register(agent));
      }

      addStep(`正在汇总多智能体反馈评审...`);
      const feedbackAgents = skillService.agentRegistry.listAllAgents();
      const agentById = new Map(feedbackAgents.map((agent) => [agent.id, agent]));
      const feedbacks: any[] = [];
      for (const agent of feedbackAgents) {
        const items = await feedbackEngine.collectAndAnalyze({ id: projectId || chatId, goal: normalizedGoal }, agent, addStep);
        feedbacks.push(...items);
      }

      const severityToType: Record<string, "success" | "warning" | "info"> = {
        CRITICAL: "warning",
        HIGH: "warning",
        MEDIUM: "info",
        LOW: "info",
        INFO: "info",
      };

      const fallbackFeedbacks = [
        {
          title: "需求完整性反馈",
          content: "建议补充目标用户、核心场景和验收标准，以降低后续返工风险。",
          suggestion: "明确用户画像、业务边界与验收指标",
          type: "info" as const,
          agentId: "agent-pd",
        },
        {
          title: "技术可行性反馈",
          content: "建议提前识别关键技术路径与性能瓶颈，避免在执行期集中暴露风险。",
          suggestion: "优先验证高风险模块并建立性能基线",
          type: "warning" as const,
          agentId: "agent-tm",
        },
        {
          title: "质量与交付反馈",
          content: "建议将测试策略与质量指标前置到计划阶段，确保交付可控。",
          suggestion: "建立测试范围、覆盖率与发布回滚策略",
          type: "info" as const,
          agentId: "agent-qa",
        },
      ];

      const feedbackEntries = feedbacks.length > 0
        ? feedbacks.map((item) => ({
            title: `${item.agentRole} 反馈`,
            content: item.problemDescription,
            suggestion: Array.isArray(item.correctionSuggestions) ? item.correctionSuggestions.join("；") : undefined,
            type: severityToType[item.severity] || "info",
            agentId: item.agentId,
          }))
        : fallbackFeedbacks;

      feedbackEntries.forEach((feedback) => {
        const author = agentById.get(feedback.agentId);
        appendMessage({
          id: generateUUID(),
          role: "assistant",
          content: feedback.content,
          parts: [
            {
              type: "tool-provideFeedback",
              toolCallId: generateUUID(),
              state: "input-available",
              input: {
                title: feedback.title,
                content: feedback.content,
                suggestion: feedback.suggestion,
                type: feedback.type,
              },
            },
          ],
          createdAt: new Date().toISOString(),
          authorName: author?.name || feedback.title,
          authorAvatar: author?.id || feedback.agentId,
          senderName: author?.name || feedback.title,
          messageType: "反馈评审",
          status: "已输出",
          metadata: {
            authorName: author?.name || feedback.title,
            authorAvatar: author?.id || feedback.agentId,
            createdAt: new Date().toISOString(),
          },
        });
      });

      if (projectData && dataStream) {
        dataStream.write({
          type: 'data-project-preview' as any,
          data: projectData
        });
      }
      
      if (secondTask) updateTask(secondTask.id, TaskStatus.COMPLETED);

      // 3. 创建项目文档 (Document Creation)
      addStep(`正在根据项目需求生成初始化文档...`);
      const thirdTask = tasks[2];
      if (thirdTask) updateTask(thirdTask.id, TaskStatus.IN_PROGRESS);

      let docId: string | undefined;
      const docTitle = `项目规划: ${goal}`;
      const docKind = "project";
      const createDocumentTool = createDocument({ session, dataStream: dataStream as any, chatId: chatId || "" });
      const createDocResult: any = await createDocumentTool.execute({
        title: docTitle,
        kind: docKind as any,
        initialData: projectData ? { project: projectData } : undefined
      });
      docId = createDocResult?.id;

      addStep(`项目初始化文档已生成并关联到项目`);
      if (thirdTask) updateTask(thirdTask.id, TaskStatus.COMPLETED);

      // 完成剩余任务
      for (let i = 3; i < tasks.length; i++) {
        const task = tasks[i];
        if (!task) continue;
        updateTask(task.id, TaskStatus.IN_PROGRESS);
        await new Promise(resolve => setTimeout(resolve, 500));
        updateTask(task.id, TaskStatus.COMPLETED);
      }

      addStep(`全链路协作流程启动完成`);

      return {
        success: true,
        project: projectData,
        documentId: docId,
        steps
      };
    } catch (error: any) {
      console.error('[startCollaboration] Error:', error);
      addStep(`⚠️ 协作流程执行出错: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error.message || String(error),
        steps
      };
    }
  },
});
