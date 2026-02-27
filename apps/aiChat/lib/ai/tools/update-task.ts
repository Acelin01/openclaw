import { tool } from "ai";
import { z } from "zod";

export const updateTasks = tool({
  description: "Update existing tasks (status, priority, etc.) or add new tasks to the project tracking list.",
  inputSchema: z.object({
    updates: z.array(z.object({
      id: z.string().describe("The ID of the task to update"),
      status: z.enum(['pending', 'in_progress', 'completed']).optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
      title: z.string().optional(),
      assignee: z.string().optional(),
      dueDate: z.string().optional(),
    })).optional().describe("List of existing tasks to update"),
    newTasks: z.array(z.object({
      id: z.string(),
      title: z.string(),
      status: z.enum(['pending', 'in_progress', 'completed']),
      priority: z.enum(['low', 'medium', 'high']),
      description: z.string().optional(),
      assignee: z.string().optional(),
      dueDate: z.string().optional(),
    })).optional().describe("List of new tasks to add"),
  }),
  execute: async ({ updates, newTasks }) => {
    return { updates, newTasks };
  },
});
