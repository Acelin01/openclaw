import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import { getPrisma } from "../../db/index.js";
import type { ChatMessage } from "../../types.js";

type UpdateTasksProps = {
  dataStream?: UIMessageStreamWriter<ChatMessage>;
};

export const updateTasks = ({ dataStream }: UpdateTasksProps = {}) => tool({
  description: "Update existing tasks (status, priority, etc.) or add new tasks to the project tracking list based on new requirements or feedback.",
  inputSchema: z.object({
    projectId: z.string().optional().describe("The ID of the project these tasks belong to"),
    updates: z.array(z.object({
      id: z.string().describe("The ID of the task to update"),
      status: z.enum(['pending', 'in_progress', 'completed']).optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      assignee: z.string().optional(),
      dueDate: z.string().optional(),
    })).optional().describe("List of existing tasks to update"),
    newTasks: z.array(z.object({
      title: z.string(),
      status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
      priority: z.enum(['low', 'medium', 'high']).default('medium'),
      description: z.string().optional(),
      assigneeRole: z.string().optional().describe("Role to assign (e.g., '产品经理', '技术负责人')"),
      dueDate: z.string().optional(),
    })).optional().describe("List of new tasks to add"),
  }),
  execute: async ({ projectId, updates, newTasks }) => {
    const prisma = getPrisma();
    const results = {
      updated: [] as any[],
      created: [] as any[]
    };

    if (updates && updates.length > 0) {
      for (const update of updates) {
        try {
          const updated = await prisma.projectTask.update({
            where: { id: update.id },
            data: {
              status: update.status ? update.status.toUpperCase() : undefined,
              priority: update.priority ? update.priority.toUpperCase() : undefined,
              title: update.title,
              description: update.description,
              dueDate: update.dueDate ? new Date(update.dueDate) : undefined,
            }
          });
          results.updated.push(updated);

          // Notify frontend via dataStream
          if (dataStream) {
            dataStream.write({
              type: "data-task-update",
              data: {
                id: updated.id,
                status: updated.status ? updated.status.toLowerCase() : update.status, // Return lowercase for frontend consistency
                title: updated.title,
              }
            } as any);
          }
        } catch (e) {
          console.error(`Failed to update task ${update.id}`, e);
        }
      }
    }

    if (newTasks && newTasks.length > 0 && projectId) {
      const createdTasks = [];
      for (const task of newTasks) {
        try {
          const created = await prisma.projectTask.create({
            data: {
              projectId,
              title: task.title,
              status: task.status ? task.status.toUpperCase() : "PENDING",
              priority: task.priority ? task.priority.toUpperCase() : "MEDIUM",
              description: task.description,
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            }
          });
          results.created.push(created);
          createdTasks.push({
            ...created,
            status: created.status ? created.status.toLowerCase() : "pending",
            priority: created.priority ? created.priority.toLowerCase() : "medium",
          });
        } catch (e) {
          console.error(`Failed to create task`, e);
        }
      }

      // Notify frontend about all new tasks
      if (dataStream && createdTasks.length > 0) {
        dataStream.write({
          type: "data-task-list",
          data: createdTasks
        } as any);
      }
    }

    return { 
      success: true, 
      message: `Updated ${results.updated.length} tasks, Created ${results.created.length} tasks.`,
      results 
    };
  },
});
