import { tool } from "ai";
import { z } from "zod";

export const createTasks = () =>
  tool({
    description: "创建项目任务列表。适用于需求分析后，将目标分解为具体可执行的任务项。",
    inputSchema: z.object({
      tasks: z.array(
        z.object({
          title: z.string().describe("任务名称"),
          description: z.string().optional().describe("任务详细描述"),
          priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM").describe("优先级"),
          status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]).default("PENDING").describe("初始状态"),
        })
      ).describe("任务列表"),
    }),
    execute: async ({ tasks }) => {
      // 这里的逻辑主要是返回给模型，前端会根据 output.tasks 渲染 UI
      return {
        success: true,
        tasks: tasks.map(t => ({
          ...t,
          id: Math.random().toString(36).substring(7), // 生成临时 ID
        })),
        message: `成功创建了 ${tasks.length} 个任务`,
      };
    },
  });
