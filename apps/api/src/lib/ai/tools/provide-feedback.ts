import { tool } from "ai";
import { z } from "zod";

export const provideFeedback = tool({
  description: "向用户提供反馈建议，以反馈框的形式展示。适用于阶段总结、改进建议、风险提示等场景。",
  inputSchema: z.object({
    title: z.string().describe("反馈标题，例如：'需求分析反馈'、'方案改进建议'"),
    content: z.string().describe("具体的反馈内容"),
    suggestion: z.string().optional().describe("改进建议"),
    type: z.enum(["success", "warning", "info"]).default("info").describe("反馈类型：success(成功/通过), warning(警告/待改进), info(信息/提示)"),
  }),
  execute: async (args) => {
    // 这个工具主要用于在流中渲染 UI，execute 返回的数据会被模型看到
    return {
      status: "success",
      message: "反馈已成功发送并展示给用户",
      data: args
    };
  },
});
