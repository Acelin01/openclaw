import { streamObject } from "ai";
import { z } from "zod";
import { projectPrompt, updateDocumentPrompt } from "../ai/prompts.js";
import { myProvider } from "../ai/providers.js";
import { createDocumentHandler, CreateDocumentCallbackProps, UpdateDocumentCallbackProps } from "../artifacts/server.js";
import { getPrisma } from "../db/index.js";

export const projectDocumentHandler = createDocumentHandler<"project">({
  kind: "project",
  onCreateDocument: async ({ title, dataStream, session, initialData }: CreateDocumentCallbackProps) => {
    let draftContent = "";
    
    let teamContext = "";
    try {
      const prisma = getPrisma();
      const userEmail = (session?.user as any)?.email;
      
      if (userEmail) {
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            include: {
                contacts: {
                    include: {
                        contact: true
                    }
                }
            }
        });
        
        if (user) {
            const members = user.contacts
                .filter((c: any) => c.contact)
                .map((c: any) => `- ${c.contact!.name} (${c.contact!.email}) [ID: ${c.contact!.id}]`)
                .join('\n');
            teamContext = `\n\n当前可用团队成员 (请从以下列表中分配任务):\n${members}\n- ${user.name} (${user.email}) [ID: ${user.id}] (项目负责人)`;
        }
      }
    } catch (e) {
      console.error("Failed to fetch team members for project generation", e);
    }

    const initialDataPrompt = initialData && initialData.project 
        ? `\n\n基于以下预先分析的项目数据进行生成，确保内容一致性并补充更多细节:\n${JSON.stringify(initialData.project, null, 2)}` 
        : "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: projectPrompt + teamContext,
      prompt: title + initialDataPrompt,
      schema: z.object({
        title: z.string().describe("Project title"),
        description: z.string().describe("Project description"),
        status: z.string().describe("Project status (e.g., ACTIVE, COMPLETED)"),
        approvalStatus: z.enum(["Draft", "Pending Review", "Approved", "Rejected"]).default("Draft").describe("Current approval status of the project document"),
        reviewer: z.string().optional().describe("Role or Name of the person responsible for reviewing this project"),
        startDate: z.string().optional().describe("Project start date (ISO format or description)"),
        endDate: z.string().optional().describe("Project end date (ISO format or description)"),
        budgetMin: z.number().optional().describe("Minimum budget"),
        budgetMax: z.number().optional().describe("Maximum budget"),
        location: z.string().optional().describe("Project location"),
        tags: z.array(z.string()).optional().describe("Project tags"),
        requirements: z.array(z.object({
            title: z.string().describe("Requirement title"),
            description: z.string().describe("Requirement description"),
            priority: z.string().describe("Priority (High, Medium, Low)"),
            tasks: z.array(z.object({
                title: z.string().describe("Task title"),
                description: z.string().describe("Task description"),
                estimatedHours: z.number().describe("Estimated hours"),
                complexity: z.string().describe("Complexity (High, Medium, Low)"),
                assigneeId: z.string().optional().describe("ID of the assigned team member"),
                assigneeName: z.string().optional().describe("Name of the assigned team member"),
                status: z.string().optional().describe("Status (Not Started, In Progress, Completed)"),
            })).optional().describe("List of tasks for this requirement")
        })).optional().describe("List of requirements broken down from the project"),
        relatedDocuments: z.array(z.object({
          id: z.string().describe("Document ID if already exists"),
          title: z.string().describe("Document title"),
          kind: z.string().describe("Document kind (text, code, image, sheet, etc.)"),
          status: z.enum(['creating', 'pending_review', 'ready']).optional().describe("Current status of the document"),
          messageId: z.string().optional().describe("ID of the message that created this document"),
        })).optional().describe("List of associated documents for this project"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-projectDelta",
            data: content,
            transient: true,
          });

          draftContent = content;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }: UpdateDocumentCallbackProps) => {
    let draftContent = "";

    // Check if this is a schema generation request
    const isSchemaGeneration = description.includes("JSON Schema");
    
    if (isSchemaGeneration) {
        const { fullStream } = streamObject({
            model: myProvider.languageModel("artifact-model"),
            system: "你是一个 JSON Schema 专家。请根据提供的数据示例生成一个管理后台所需的 Schema 结构。生成的 Schema 必须严格遵守以下格式，特别是 fields 数组中的字段必须包含 name, label, type, showInList。",
            prompt: description,
            schema: z.object({
                fields: z.array(z.object({
                    name: z.string().describe("字段名，用于数据键名"),
                    label: z.string().describe("显示名称"),
                    type: z.enum(["text", "number", "select", "textarea", "email", "status"]).describe("字段类型"),
                    showInList: z.boolean().describe("是否在列表页显示"),
                    options: z.array(z.object({
                        label: z.string(),
                        value: z.any()
                    })).optional().describe("下拉选项（仅当 type 为 select 时需要）")
                }))
            }),
        });

        for await (const delta of fullStream) {
            if (delta.type === "object" && delta.object) {
                const content = JSON.stringify(delta.object);
                // We don't update the project content with the schema directly
                // Instead we send it as a data part
                draftContent = content;
            }
        }
        
        try {
            const parsed = JSON.parse(draftContent);
            const configIdMatch = description.match(/configId:\s*"([^"]+)"/);
            const configId = configIdMatch ? configIdMatch[1] : "";
            
            if (configId) {
                dataStream.write({
                    type: "data-adminSchema",
                    data: {
                        configId,
                        schema: parsed
                    }
                });
            }
        } catch (e) {
            console.error("Failed to parse generated schema", e);
        }
        
        // Return the original content because we don't want to overwrite the project JSON with the schema
        return document.content || "";
    }

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: updateDocumentPrompt(document.content, "project"),
      prompt: description,
      schema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        budgetMin: z.number().optional(),
        budgetMax: z.number().optional(),
        location: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-projectDelta",
            data: content,
            transient: true,
          });

          draftContent = content;
        }
      }
    }

    return draftContent;
  },
});
