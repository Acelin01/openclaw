import { tool } from "ai";
import { z } from "zod";

export const createTasks = tool({
  description: "Create a list of tasks to be executed for a project or requirement.",
  inputSchema: z.object({
    tasks: z.array(z.object({
      id: z.string(),
      title: z.string(),
      status: z.enum(['pending', 'in_progress', 'completed']),
      priority: z.enum(['low', 'medium', 'high']),
      description: z.string().optional(),
      assignee: z.string().optional().describe("Name or ID of the person assigned to this task"),
      dueDate: z.string().optional().describe("Due date in YYYY-MM-DD format"),
    })),
  }),
  execute: async ({ tasks }) => {
    return { tasks };
  },
});
