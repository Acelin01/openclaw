import { streamObject } from "ai";
import { z } from "zod";
import { iterationPrompt, updateDocumentPrompt } from "../ai/prompts.js";
import { myProvider } from "../ai/providers.js";
import { createDocumentHandler, CreateDocumentCallbackProps, UpdateDocumentCallbackProps } from "../artifacts/factory.js";
import { getPrisma } from "../db/index.js";

export const iterationDocumentHandler = createDocumentHandler<"iteration">({
  kind: "iteration",
  onCreateDocument: async ({ id, title, dataStream, session }: CreateDocumentCallbackProps) => {
    let draftContent = "";

    let projectContext = "";
    try {
      const prisma = getPrisma();
      const userEmail = (session?.user as any)?.email;
      
      if (userEmail) {
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            include: {
                projects: {
                    take: 5,
                    orderBy: { updatedAt: 'desc' }
                }
            }
        });
        
        if (user && user.projects.length > 0) {
            const projects = user.projects
                .map((p: any) => `- ${p.name} [ID: ${p.id}]`)
                .join('\n');
            projectContext = `\n\n当前可用项目 (请将迭代关联到其中一个项目):\n${projects}`;
        }
      }
    } catch (e) {
      console.error("Failed to fetch projects for iteration generation", e);
    }

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: iterationPrompt + projectContext,
      prompt: title,
      schema: z.object({
        title: z.string().describe("Iteration name"),
        projectId: z.string().describe("The ID of the project this iteration belongs to"),
        description: z.string().describe("Iteration goal and description"),
        status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]).describe("Iteration status"),
        startDate: z.string().describe("Start date (YYYY-MM-DD)"),
        endDate: z.string().describe("End date (YYYY-MM-DD)"),
        goals: z.array(z.string()).describe("List of iteration goals"),
        requirements: z.array(z.object({
            title: z.string(),
            priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
            status: z.enum(["DRAFT", "REVIEW", "APPROVED"])
        })).optional().describe("Associated requirements"),
        tasks: z.array(z.object({
            title: z.string(),
            assignee: z.string().optional(),
            estimatedHours: z.number().optional(),
            status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
            priority: z.enum(["LOW", "MEDIUM", "HIGH"])
        })).optional().describe("Tasks in this iteration")
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-iterationDelta",
            data: content,
            transient: true,
          } as any);

          draftContent = content;
        }
      }
    }

    // 持久化到 Iteration 表
    if (draftContent && session?.user?.id) {
      try {
        const data = JSON.parse(draftContent);
        const prisma = getPrisma();
        
        // 确保项目 ID 有效
        let projectId = data.projectId;
        if (!projectId) {
            // 如果没有提供项目 ID，尝试找一个用户的项目
            const userProject = await prisma.project.findFirst({
                where: { userId: session.user.id },
                orderBy: { updatedAt: 'desc' }
            });
            projectId = userProject?.id;
        }

        if (projectId) {
             const iteration = await (prisma.iteration as any).upsert({
                 where: { id },
                 create: {
                     id,
                     name: data.title || "未命名迭代",
                     description: data.description,
                     status: data.status || "PLANNING",
                     startDate: new Date(data.startDate || new Date()),
                     endDate: new Date(data.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
                     goals: data.goals,
                     projectId: projectId,
                     ownerId: session.user.id
                 },
                 update: {
                     name: data.title,
                     description: data.description,
                     status: data.status,
                     startDate: data.startDate ? new Date(data.startDate) : undefined,
                     endDate: data.endDate ? new Date(data.endDate) : undefined,
                     goals: data.goals,
                     projectId: projectId
                 }
             });

             console.log(`Iteration ${iteration.id} upserted`);

             // 处理关联的需求
              if (data.requirements && data.requirements.length > 0) {
                  // 先清理旧的（如果是更新）或者增量更新？
                  // 这里简单起见，如果是有新的需求，就创建
                  for (const req of data.requirements) {
                      await prisma.projectRequirement.create({
                          data: {
                              title: req.title,
                              priority: req.priority,
                              status: req.status,
                              projectId: projectId,
                              iterationId: id
                          }
                      });
                  }
              }
 
              // 处理关联的任务
              if (data.tasks && data.tasks.length > 0) {
                  for (const task of data.tasks) {
                      await prisma.projectTask.create({
                          data: {
                              title: task.title,
                              priority: task.priority,
                              status: task.status,
                              projectId: projectId,
                              iterationId: id,
                              estimatedHours: task.estimatedHours
                          }
                      });
                  }
              }

              // 记录活动
              await prisma.iterationActivity.create({
                data: {
                  iterationId: id,
                  userId: session.user.id,
                  action: "创建了迭代",
                  content: `通过 AI 生成了迭代: ${data.title}`
                }
              });
         }
      } catch (e) {
        console.error("Failed to persist iteration from artifact", e);
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream, session }: UpdateDocumentCallbackProps) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: updateDocumentPrompt(document.content, "iteration"),
      prompt: description,
      schema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        goals: z.array(z.string()).optional(),
        projectId: z.string().optional(),
        requirements: z.array(z.object({
            title: z.string(),
            priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
            status: z.enum(["DRAFT", "REVIEW", "APPROVED"])
        })).optional(),
        tasks: z.array(z.object({
            title: z.string(),
            assignee: z.string().optional(),
            estimatedHours: z.number().optional(),
            status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
            priority: z.enum(["LOW", "MEDIUM", "HIGH"])
        })).optional()
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-iterationDelta",
            data: content,
            transient: true,
          } as any);

          draftContent = content;
        }
      }
    }

    // 持久化到 Iteration 表
    if (draftContent && session?.user?.id) {
      try {
        const data = JSON.parse(draftContent);
        const prisma = getPrisma();
        
        const iteration = await (prisma.iteration as any).update({
            where: { id: document.id },
            data: {
                name: data.title,
                description: data.description,
                status: data.status,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                goals: data.goals,
                projectId: data.projectId
            }
        });

        // 如果更新中包含需求或任务，这里也需要处理
        // 注意：更新逻辑可能比较复杂，这里采用追加方式
        if (data.requirements && data.requirements.length > 0) {
            for (const req of data.requirements) {
                await prisma.projectRequirement.create({
                    data: {
                        title: req.title,
                        priority: req.priority,
                        status: req.status,
                        projectId: iteration.projectId,
                        iterationId: iteration.id
                    }
                });
            }
        }

        if (data.tasks && data.tasks.length > 0) {
            for (const task of data.tasks) {
                await prisma.projectTask.create({
                    data: {
                        title: task.title,
                        priority: task.priority,
                        status: task.status,
                        projectId: iteration.projectId,
                        iterationId: iteration.id,
                        estimatedHours: task.estimatedHours
                    }
                });
            }
        }

        // 记录活动
        await prisma.iterationActivity.create({
          data: {
            iterationId: iteration.id,
            userId: session.user.id,
            action: "更新了迭代",
            content: `通过 AI 更新了迭代内容`
          }
        });
      } catch (e) {
        console.error("Failed to update iteration from artifact", e);
      }
    }
  
    return draftContent;
  }
});
