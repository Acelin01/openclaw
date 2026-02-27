import { tool } from "ai";
import { z } from "zod";

export const updateProjectStatus = tool({
  description: "Update the status of a project. Use this tool when the user explicitly requests to update the project status.",
  parameters: z.object({
    projectId: z.string().describe("The ID of the project to update"),
    status: z.enum(["active", "completed", "on_hold", "cancelled", "archived"]).describe("The new status of the project"),
    reason: z.string().optional().describe("The reason for the status change"),
  }),
  execute: async ({ projectId, status, reason }) => {
    // In a real app, this would call an API or DB
    // For now, we mock the success response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      projectId,
      status,
      reason,
      message: `Project ${projectId} status updated to ${status}`
    };
  },
});
