import { tool } from "ai";
import { z } from "zod";
import { generateUUID } from "@/lib/utils";

export const createApproval = tool({
  description: "Create an approval request for a project resource or task.",
  inputSchema: z.object({
    title: z.string().describe("Title of the approval request"),
    approver: z.string().describe("Name or ID of the person who needs to approve"),
    description: z.string().optional().describe("Detailed description of what needs approval"),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    deadline: z.string().optional().describe("Deadline for the approval in YYYY-MM-DD format"),
  }),
  execute: async ({ title, approver, description, priority, deadline }) => {
    // In a real implementation, this would save to a database
    const id = generateUUID();
    
    return {
      success: true,
      approvalId: id,
      message: `Approval request '${title}' has been sent to ${approver}.`,
      status: 'pending',
      details: {
        id,
        title,
        approver,
        description,
        priority,
        deadline,
        createdAt: new Date().toISOString(),
      }
    };
  },
});
