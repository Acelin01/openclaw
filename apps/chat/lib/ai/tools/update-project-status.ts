import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import type { ChatMessage } from "@/lib/types";

type UpdateProjectStatusProps = {
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const updateProjectStatus = ({
  dataStream,
}: UpdateProjectStatusProps) =>
  tool({
    description: "更新项目当前阶段和进度百分比。这将实时反映在用户的界面进度条和阶段指示器中。",
    inputSchema: z.object({
      phase: z.enum(["需求分析", "方案设计", "任务分解", "执行监控", "结果交付"]).describe("当前所处的项目阶段"),
      progress: z.number().min(0).max(100).describe("项目的整体进度百分比 (0-100)"),
      status: z.string().optional().describe("简短的状态描述，例如：'正在分析需求...'"),
    }),
    execute: async ({ phase, progress, status }) => {
      // 通过 dataStream 写入自定义数据，前端可以监听并更新 UI
      dataStream.write({
        type: "data-project-status",
        data: {
          phase,
          progress,
          status,
        },
      } as any);

      return {
        success: true,
        currentPhase: phase,
        currentProgress: progress,
        message: `项目状态已更新为：${phase} (${progress}%)`,
      };
    },
  });
