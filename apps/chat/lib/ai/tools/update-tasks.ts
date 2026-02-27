import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import type { ChatMessage } from "@/lib/types";

type UpdateTasksProps = {
  dataStream?: UIMessageStreamWriter<ChatMessage>;
};

export const updateTasks = ({ dataStream }: UpdateTasksProps = {}) =>
  tool({
    description: "更新或新增项目任务。适用于任务进度变更、阶段性汇报或发现新任务时。",
    inputSchema: z.object({
      updates: z.array(
        z.object({
          id: z.string().describe("要更新的任务 ID"),
          status: z.enum(["pending", "in_progress", "completed", "failed", "cancelled"]).optional().describe("更新后的状态"),
          priority: z.enum(["low", "medium", "high"]).optional().describe("更新后的优先级"),
          title: z.string().optional().describe("更新后的标题"),
        })
      ).optional().describe("要更新的任务列表"),
      newTasks: z.array(
        z.object({
          title: z.string().describe("新任务名称"),
          description: z.string().optional().describe("新任务详细描述"),
          priority: z.enum(["low", "medium", "high"]).default("medium").describe("优先级"),
          status: z.enum(["pending", "in_progress", "completed", "failed", "cancelled"]).default("pending").describe("状态"),
        })
      ).optional().describe("要新增的任务列表"),
    }),
    execute: async ({ updates, newTasks }) => {
      // Notify frontend via dataStream
      if (dataStream) {
        if (updates) {
          updates.forEach(update => {
            dataStream.write({
              type: "data-task-update",
              data: update
            } as any);
          });
        }
        if (newTasks) {
          dataStream.write({
            type: "data-task-list",
            data: newTasks.map(t => ({
              ...t,
              id: Math.random().toString(36).substring(7),
            }))
          } as any);
        }
      }

      return {
        success: true,
        updates: updates || [],
        newTasks: (newTasks || []).map(t => ({
          ...t,
          id: Math.random().toString(36).substring(7),
        })),
        message: "任务状态已更新",
      };
    },
  });
