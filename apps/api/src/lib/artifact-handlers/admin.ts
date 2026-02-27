import { streamObject } from "ai";
import { z } from "zod";
import { adminPrompt, updateDocumentPrompt } from "../ai/prompts.js";
import { myProvider } from "../ai/providers.js";
import { createDocumentHandler, UpdateDocumentCallbackProps } from "../artifacts/server.js";

export const adminDocumentHandler = createDocumentHandler<"admin">({
  kind: "admin",
  onCreateDocument: async ({ title, dataStream, initialData }) => {
    let draftContent = "";
    let dataSampleStr = "";
    let finalSchema: any = null;

    if (initialData) {
        if (initialData.dataSample) {
            dataSampleStr = JSON.stringify(initialData.dataSample);
        } else if (initialData.url) {
             try {
                // Fetch logic
                const headers: any = {};
                if (initialData.token) {
                    headers.Authorization = `Bearer ${initialData.token}`;
                }
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
                
                try {
                    const res = await fetch(initialData.url, { headers, signal: controller.signal });
                    clearTimeout(timeoutId);
                    
                    if (res.ok) {
                        const json = await res.json();
                        
                        // 智能提取数组数据的辅助函数 - 增强版 (Generic Extraction)
                        const extractArray = (obj: any): any[] | null => {
                            if (!obj) return null;
                            if (Array.isArray(obj)) return obj;
                            if (typeof obj !== 'object') return null;

                            // 1. 优先检查常见的包装键 (Standard Envelopes)
                            const envelopeKeys = [
                                'data', 'items', 'list', 'results', 'records', 'rows', 
                                'content', 'payload', 'response', 'body', 'result', 'page',
                                'users', 'projects', 'tasks', 'templates', 'products', 'orders'
                            ];
                            
                            for (const key of envelopeKeys) {
                                if (obj[key]) {
                                    if (Array.isArray(obj[key])) return obj[key];
                                    if (typeof obj[key] === 'object') {
                                        const nested = extractArray(obj[key]);
                                        if (nested) return nested;
                                    }
                                }
                            }

                            // 2. 检查当前对象的所有属性
                            const keys = Object.keys(obj);
                            const arrayKey = keys.find(key => Array.isArray(obj[key]) && obj[key].length > 0) 
                                           || keys.find(key => Array.isArray(obj[key]));
                            
                            if (arrayKey) return obj[arrayKey];
                            return null;
                        };

                        const actualData = extractArray(json);
                        const list = Array.isArray(actualData) ? actualData : [json];
                        const sample = list.slice(0, 5); // 取前5条作为样本即可
                        dataSampleStr = JSON.stringify(sample);
                        console.log(`[AdminGen] Fetched sample data from ${initialData.url}, count: ${list.length}`);
                    }
                } catch (fetchErr) {
                    console.error('[AdminGen] Fetch sample data failed:', fetchErr);
                }
             } catch (err) {
                 console.error('[AdminGen] Fetch setup failed:', err);
             }
        }
    }

    const { fullStream } = streamObject({
        model: myProvider.languageModel("artifact-model"),
        system: adminPrompt,
        prompt: `请为以下数据样本生成管理后台 Schema:
${dataSampleStr || "未提供具体数据样本，请根据标题生成通用管理架构"}

标题: ${title}
${initialData?.configId ? `配置ID: ${initialData.configId}` : ""}
`,
        schema: z.object({
            fields: z.array(z.object({
                name: z.string().describe("字段名，用于数据键名"),
                label: z.string().describe("显示名称"),
                type: z.enum(["string", "text", "number", "select", "textarea", "email", "status", "date", "boolean", "image", "phone"]).describe("字段类型"),
                showInList: z.boolean().describe("是否在列表页显示"),
                showInForm: z.boolean().optional().describe("是否在表单页显示"),
                required: z.boolean().optional().describe("是否必填"),
                options: z.array(z.object({
                    label: z.string(),
                    value: z.any()
                })).optional().describe("下拉选项（仅当 type 为 select 时需要）"),
                description: z.string().optional().describe("描述信息")
            })).describe("数据表字段定义")
        }),
    });

    for await (const delta of fullStream) {
        if (delta.type === "object" && delta.object) {
            const content = JSON.stringify(delta.object);
            dataStream.write({
                type: "data-adminDelta",
                data: content,
                transient: true,
            });
            draftContent = content;
            finalSchema = delta.object;
        }
    }

    // After generation, if we have projectId and configId, update the project in DB
    if (initialData?.projectId && initialData?.configId && finalSchema) {
        try {
            const { getProjectById, updateProject } = await import("../db/queries.js");
            const project = await getProjectById(initialData.projectId);
            if (project) {
                const configs = (project.adminConfigs as any[]) || [];
                const updatedConfigs = configs.length > 0 
                    ? configs.map((c: any) => {
                        if (c.id === initialData.configId) {
                            return {
                                ...c,
                                schema: finalSchema,
                                status: 'ready'
                            };
                        }
                        return c;
                    })
                    : [{
                        id: initialData.configId,
                        name: title,
                        url: initialData.url,
                        schema: finalSchema,
                        status: 'ready'
                    }];
                
                await updateProject({
                    id: project.id,
                    updates: {
                        adminConfigs: updatedConfigs
                    }
                });
                console.log(`[AdminGen] Successfully updated project ${project.id} config ${initialData.configId} with new schema`);
                
                // Also send a special event to inform the client to update its state
                dataStream.write({
                    type: "data-adminSchema",
                    data: {
                        configId: initialData.configId,
                        schema: finalSchema
                    }
                });
            }
        } catch (err) {
            console.error('[AdminGen] Failed to update project config in DB:', err);
        }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }: UpdateDocumentCallbackProps) => {
    let draftContent = "";

    // For admin/schema generation, we use a specific prompt
    const isSchemaGeneration = description.includes("JSON Schema") || description.includes("架构") || description.includes("Schema");
    
    if (isSchemaGeneration) {
        const { fullStream } = streamObject({
            model: myProvider.languageModel("artifact-model"),
            system: adminPrompt,
            prompt: description,
            schema: z.object({
                fields: z.array(z.object({
                    name: z.string().describe("字段名，用于数据键名"),
                    label: z.string().describe("显示名称"),
                    type: z.enum(["string", "text", "number", "select", "textarea", "email", "status", "date", "boolean", "image", "phone"]).describe("字段类型"),
                    showInList: z.boolean().describe("是否在列表页显示"),
                    showInForm: z.boolean().optional().describe("是否在表单页显示"),
                    required: z.boolean().optional().describe("是否必填"),
                    options: z.array(z.object({
                        label: z.string(),
                        value: z.any()
                    })).optional().describe("下拉选项（仅当 type 为 select 时需要）"),
                    description: z.string().optional().describe("描述信息")
                })).describe("数据表字段定义")
            }),
        });

        for await (const delta of fullStream) {
            if (delta.type === "object" && delta.object) {
                const content = JSON.stringify(delta.object);
                dataStream.write({
                    type: "data-adminDelta",
                    data: content,
                    transient: true,
                });
                draftContent = content;
            }
        }
        
        // After streaming is finished, merge with original content for persistence
        try {
            const original = JSON.parse(document.content || "{}");
            const newSchema = JSON.parse(draftContent);
            
            // Special case: send a specific data part for project artifact to update its local adminConfigs
            const configIdMatch = description.match(/configId:\s*"([^"]+)"/);
            const configId = configIdMatch ? configIdMatch[1] : (original.configId || "");
            
            if (configId) {
                dataStream.write({
                    type: "data-adminSchema",
                    data: {
                        configId,
                        schema: newSchema
                    }
                });
            }

            draftContent = JSON.stringify({
                ...original,
                configId, // Update configId if found in description
                schema: newSchema
            });
        } catch (e) {
            console.error("Failed to merge admin schema with original content", e);
        }
    } else {
        // Fallback to regular document update
        const { fullStream } = streamObject({
            model: myProvider.languageModel("artifact-model"),
            system: updateDocumentPrompt(document.content, "admin"),
            prompt: description,
            schema: z.object({
              name: z.string().optional(),
              url: z.string().optional(),
              schema: z.any().optional(),
            }),
        });

        for await (const delta of fullStream) {
            if (delta.type === "object" && delta.object) {
                const content = JSON.stringify(delta.object);
                dataStream.write({
                    type: "data-adminDelta",
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
