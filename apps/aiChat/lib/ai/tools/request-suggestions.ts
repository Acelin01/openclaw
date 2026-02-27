import { streamObject, tool, type UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { getDocumentById, saveSuggestions } from "@/lib/db/queries";
import type { Suggestion } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";
import { myProvider } from "../providers";
import { createSkillService, SkillFeedbackEngine, TaskStatus } from '@uxin/skill';

// Initialize service
const skillService = createSkillService();
const feedbackEngine = SkillFeedbackEngine.getInstance();

type RequestSuggestionsProps = {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const requestSuggestions = ({
  session,
  dataStream,
}: RequestSuggestionsProps) =>
  tool({
    description: "Request suggestions for a document",
    inputSchema: z.object({
      documentId: z
        .string()
        .describe("The ID of the document to request edits"),
    }),
    execute: async ({ documentId }) => {
      const steps: string[] = [];
      const addStep = (msg: string) => {
        console.log(`[RequestSuggestions] ${msg}`);
        steps.push(msg);
        dataStream.write({
          type: "data-step",
          data: msg,
          transient: true,
        });
      };

      // 如果有关联文档，推送预览信息
      if (documentId) {
        dataStream.write({
          type: "data-document-preview",
          data: {
            id: documentId,
            title: "正在分析的文档",
          },
        });
      }

      // 1. 需求预检查 (PreCheck Phase) - 接入工作台流程
      addStep(`正在获取文档内容 (ID: ${documentId})...`);
      const document = await getDocumentById({ id: documentId });

      if (!document || !document.content) {
        addStep(`⚠️ 未找到文档或文档内容为空`);
        return {
          error: "Document not found",
          steps
        };
      }
      
      addStep(`成功获取文档: "${document.title}"`);

      // 执行预检查引擎，增加工作台一致性
      await skillService.preCheckEngine.executePreCheck([{ text: `为文档 "${document.title}" 生成改进建议`, documentId }], addStep);

      // 1.5 任务清单创建 (Task List Creation)
      addStep(`正在根据需求分析创建任务清单...`);
      const tasks = skillService.taskDecomposer.decompose(`为文档 "${document.title}" 生成改进建议`, { documentId });
      dataStream.write({
        type: "data-task-list",
        data: tasks,
      });

      const updateTask = (taskId: string, status: TaskStatus) => {
        dataStream.write({
          type: "data-task-update",
          data: { id: taskId, status },
        });
      };

      // 模拟更新第一个任务状态
      if (tasks.length > 0) updateTask(tasks[0].id, TaskStatus.IN_PROGRESS);

      const suggestions: Omit<
        Suggestion,
        "userId" | "createdAt" | "documentCreatedAt"
      >[] = [];

      // 2. 反馈分析 (Feedback Phase) - 模拟专家评审建议生成逻辑
      if (tasks.length > 0) updateTask(tasks[0].id, TaskStatus.COMPLETED);
      if (tasks.length > 1) updateTask(tasks[1].id, TaskStatus.IN_PROGRESS);

      addStep(`[Feedback] 正在分析文档上下文，识别改进点...`);
      await new Promise(resolve => setTimeout(resolve, 800)); // 模拟分析耗时

      addStep(`正在调用 AI 模型分析并生成修改建议...`);
      const { elementStream } = streamObject({
        model: myProvider.languageModel("artifact-model"),
        system:
          "You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.",
        prompt: document.content,
        output: "array",
        schema: z.object({
          originalSentence: z.string().describe("The original sentence"),
          suggestedSentence: z.string().describe("The suggested sentence"),
          description: z.string().describe("The description of the suggestion"),
        }),
      });

      for await (const element of elementStream) {
        // @ts-expect-error todo: fix type
        const suggestion: Suggestion = {
          originalText: element.originalSentence,
          suggestedText: element.suggestedSentence,
          description: element.description,
          id: generateUUID(),
          documentId,
          isResolved: false,
        };

        addStep(`生成建议: ${element.description.length > 40 ? element.description.substring(0, 40) + '...' : element.description}`);
        dataStream.write({
          type: "data-suggestion",
          data: suggestion,
          transient: true,
        });

        suggestions.push(suggestion);
      }

      addStep(`总计生成 ${suggestions.length} 条修改建议`);

      // 3. 结果验证 (Validation Phase) - 接入 FeedbackEngine 验证建议质量
      if (suggestions.length > 0) {
        addStep(`[Validation] 正在验证生成建议的相关性与合规性...`);
        const plan = {
          id: generateUUID(),
          requirementId: documentId,
          feedbackIds: [],
          suggestedChanges: suggestions.map(s => s.description).join('; '),
          status: 'pending' as const,
          rationale: 'Generated by AI Suggestion Engine'
        };
        
        const isValid = feedbackEngine.validateAdjustment(plan, addStep);
        if (isValid) {
          addStep(`[Validation] 建议通过质量验证`);
        } else {
          addStep(`[Validation] ⚠️ 部分建议可能存在质量问题，请谨慎参考`);
        }
      }

      if (session.user?.id) {
        addStep(`正在将建议保存到数据库...`);
        const userId = session.user.id;

        await saveSuggestions({
          suggestions: suggestions.map((suggestion) => ({
            ...suggestion,
            userId,
            createdAt: new Date(),
            documentCreatedAt: document.createdAt,
          })),
        });
        addStep(`建议已成功保存`);
      }

      if (tasks.length > 1) updateTask(tasks[1].id, TaskStatus.COMPLETED);
      if (tasks.length > 2) {
        updateTask(tasks[2].id, TaskStatus.IN_PROGRESS);
        await new Promise(resolve => setTimeout(resolve, 500));
        updateTask(tasks[2].id, TaskStatus.COMPLETED);
      }

      addStep(`建议流程执行完成`);
      return {
        id: documentId,
        title: document.title,
        kind: document.kind,
        message: "Suggestions have been added to the document",
        steps
      };
    },
  });
