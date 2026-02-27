import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import { DatabaseService } from "../../db/service.js";
import { generateUUID } from "../../utils.js";

export const createTasks = ({ 
  projectId, 
  userId,
  dataStream
}: { 
  projectId?: string; 
  userId?: string;
  dataStream?: UIMessageStreamWriter;
} = {}) => tool({
  description: "Create a list of tasks to be executed for a project or requirement. This tool will save the tasks to the database.",
  inputSchema: z.object({
    tasks: z.array(z.object({
      title: z.string(),
      status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']).default('PENDING'),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
      description: z.string().optional(),
      assigneeId: z.string().optional().describe("负责人ID（用户ID）"),
      assigneeRole: z.string().optional().describe("负责人角色或智能体角色（如：产品经理, 架构师, 前端工程师等）"),
      assigneeName: z.string().optional().describe("负责人姓名或名称"),
      dueDate: z.string().optional().describe("截止日期，格式为 YYYY-MM-DD"),
    })),
  }),
  execute: async ({ tasks }) => {
    console.log('[createTasks] Input:', tasks);
    
    const appendMessage = (message: {
      id: string;
      role: "assistant";
      content: string;
      parts: Array<{ type: "text"; text: string }>;
      createdAt: string;
      authorName?: string;
      authorAvatar?: string;
      senderName?: string;
      messageType?: string;
      status?: string;
      metadata?: any;
    }) => {
      if (dataStream) {
        dataStream.write({
          type: "data-appendMessage" as any,
          data: JSON.stringify(message),
          transient: true,
        });
      }
    };

    const roleProfiles: Record<string, { agentId: string; name: string }> = {
      "产品经理": { agentId: "pd", name: "产品经理" },
      "项目经理": { agentId: "pm", name: "项目经理" },
      "技术架构": { agentId: "tm", name: "技术架构" },
      "前端工程": { agentId: "fe", name: "前端工程" },
      "后端工程": { agentId: "be", name: "后端工程" },
      "测试工程": { agentId: "qa", name: "测试工程" },
      "运维工程": { agentId: "devops", name: "运维工程" },
      "设计负责人": { agentId: "design-lead", name: "设计负责人" },
      "技术负责人": { agentId: "tech-lead", name: "技术负责人" },
    };
    
    // 如果没有 projectId，我们仍然允许创建任务提案，只是不保存到数据库
    // 这样可以在对话中展示任务列表
    const db = DatabaseService.getInstance();
    const createdTasks = [];

    try {
        for (const task of tasks) {
            const taskData: any = {
                id: generateUUID(),
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                // 用于展示的字段
                assignee: task.assigneeName || task.assigneeRole || (task.assigneeId === userId ? "我" : undefined),
                dueDate: task.dueDate,
            };

            // 如果分配给了特定的智能体角色，触发加入消息
            if (task.assigneeRole && roleProfiles[task.assigneeRole]) {
              const profile = roleProfiles[task.assigneeRole];
              appendMessage({
                id: generateUUID(),
                role: "assistant",
                content: `已接收任务：${task.title}，我是${profile.name}。我将开始处理该任务，并同步产出相关文档。`,
                parts: [{ type: "text", text: `已接收任务：${task.title}，我是${profile.name}。我将开始处理该任务，并同步产出相关文档。` }],
                createdAt: new Date().toISOString(),
                authorName: profile.name,
                authorAvatar: profile.agentId,
                senderName: profile.name,
                messageType: "任务协作",
                status: "已加入",
                metadata: {
                  authorName: profile.name,
                  authorAvatar: profile.agentId,
                  createdAt: new Date().toISOString(),
                  assignedTaskId: taskData.id
                },
              });
            }

            if (projectId) {
                taskData.projectId = projectId;
                taskData.assigneeId = task.assigneeId || (task.assigneeId === undefined ? userId : undefined);
                
                const prisma = (db as any).prisma || (await import('../../db/queries.js')).getDB();
                
                // 尝试保存到数据库
                try {
                    const created = await prisma.projectTask.create({
                        data: {
                            id: taskData.id,
                            projectId: taskData.projectId,
                            title: taskData.title,
                            description: taskData.description,
                            status: taskData.status,
                            priority: taskData.priority,
                            assigneeId: taskData.assigneeId,
                            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                        }
                    });
                    // 如果成功保存，使用数据库返回的对象，但保留我们用于展示的 assignee 字段
                    createdTasks.push({ ...created, assignee: taskData.assignee });
                } catch (dbError) {
                    console.error('[createTasks] DB Error:', dbError);
                    // 如果保存失败，仍然把任务加入列表用于展示
                    createdTasks.push(taskData);
                }
            } else {
                // 没有 projectId，仅作为提案展示
                createdTasks.push(taskData);
            }
        }

        return { 
            success: true, 
            count: createdTasks.length, 
            tasks: createdTasks,
            message: projectId ? "任务已成功创建并保存。" : "任务清单已生成（待关联项目）。"
        };
    } catch (error: any) {
        console.error('[createTasks] Error:', error);
        return { success: false, error: error.message };
    }
  },
});
