import { streamObject } from "ai";
import { z } from "zod";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { getProjectById, updateProject } from "@/lib/db/queries";

const adminPrompt = `You are an expert system architect.
Your task is to analyze the provided JSON data sample and generate a schema definition for a management system (Admin Dashboard).
The schema must define the fields, their types, and UI configuration (list/form view).

Output Schema Requirements:
- fields: Array of field definitions.
  - name: Field key in the data.
  - label: Human readable label (Chinese).
  - type: One of 'string', 'number', 'boolean', 'date', 'image', 'status', 'email', 'phone', 'select', 'textarea'.
  - showInList: boolean. Set to false for long text, descriptions, or secondary information. Keep the list concise (max 5-7 fields).
  - showInForm: boolean (default true). Set to false for fields like 'id', 'createdAt' if they shouldn't be edited.
  - required: boolean (default false).
  - options: Array of { label, value } for 'select' type.
  - description: Helper text for the field.

Guidance:
1. Identify IDs, timestamps, and metadata.
2. For status fields, identify possible values and mark as 'status' type.
3. For image URLs (like avatars), mark as 'image' type.
4. For long content, use 'textarea'.
5. Choose 3-6 most important fields to show in the list view (e.g., name, status, email, type).

Return ONLY the JSON schema.`;

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
                            // 这些键通常包含主要数据或另一层包装
                            const envelopeKeys = [
                                'data', 'items', 'list', 'results', 'records', 'rows', 
                                'content', 'payload', 'response', 'body', 'result', 'page',
                                'users', 'projects', 'tasks', 'templates', 'products', 'orders'
                            ];
                            
                            for (const key of envelopeKeys) {
                                if (obj[key]) {
                                    // 如果是数组，直接返回
                                    if (Array.isArray(obj[key])) return obj[key];
                                    
                                    // 如果是对象，递归尝试提取 (例如 { data: { users: [...] } })
                                    if (typeof obj[key] === 'object') {
                                        const nested = extractArray(obj[key]);
                                        if (nested) return nested;
                                    }
                                }
                            }

                            // 2. 如果包装键中没有找到，检查当前对象的所有属性
                            // 寻找任何是数组的属性 (Generic Fallback)
                            const keys = Object.keys(obj);
                            // 优先找非空的数组
                            const arrayKey = keys.find(key => Array.isArray(obj[key]) && obj[key].length > 0) 
                                           || keys.find(key => Array.isArray(obj[key]));
                            
                            if (arrayKey) return obj[arrayKey];
                            
                            return null;
                        };

                        const actualData = extractArray(json);
                        const list = Array.isArray(actualData) ? actualData : [json];
                        const sample = list.slice(0, 5); // 取前5条作为样本即可
                        dataSampleStr = JSON.stringify(sample, null, 2);
                    } else {
                        dataSampleStr = `Error fetching data: ${res.status} ${res.statusText}`;
                    }
                } catch (fetchError: any) {
                    clearTimeout(timeoutId);
                    if (fetchError.name === 'AbortError') {
                        dataSampleStr = "Error fetching data: Timeout (10s exceeded)";
                    } else {
                        throw fetchError;
                    }
                }
             } catch (e) {
                 dataSampleStr = `Error fetching data: ${e}`;
             }
        }
    }

    // Initialize draftContent
    draftContent = JSON.stringify({
        ...initialData,
        schema: null,
        status: 'generating'
    }, null, 2);

    // Send initial content to frontend
    dataStream.write({
        type: "data-adminDelta",
        data: JSON.stringify({
            ...initialData,
            schema: null,
            status: 'generating'
        }),
        transient: true
    });

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: adminPrompt,
      prompt: `Title: ${title}\nData Sample:\n${dataSampleStr}`,
      schema: z.object({
        fields: z.array(z.object({
          name: z.string(),
          label: z.string(),
          type: z.enum(['string', 'text', 'number', 'boolean', 'date', 'image', 'status', 'email', 'phone', 'select', 'textarea']),
          showInList: z.boolean(),
          showInForm: z.boolean(),
          required: z.boolean().optional(),
          options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
          description: z.string().optional(),
        })),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        if (object) {
            finalSchema = object;
            
            draftContent = JSON.stringify({
                ...initialData,
                schema: object,
                status: 'generating'
            }, null, 2);

            dataStream.write({
                type: "data-adminDelta",
                data: draftContent,
                transient: true
            });
        }
      }
    }
    
    if (finalSchema) {
        dataStream.write({
            type: "data-adminSchema",
            data: { 
                configId: initialData?.configId,
                schema: finalSchema 
            },
            transient: true
        });
        
        draftContent = JSON.stringify({
            ...initialData,
            schema: finalSchema,
            status: 'ready'
        }, null, 2);

        dataStream.write({
            type: "data-adminDelta",
            data: draftContent,
            transient: true
        });

        // Update project config with the generated schema
        if (initialData?.projectId && initialData?.configId) {
            try {
                // Fetch the project
                const project = await getProjectById({ id: initialData.projectId });
                if (project) {
                    const configs = (project.adminConfigs as any[]) || [];
                    
                    // Update the specific config
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
                    
                    // Save back to DB
                    console.log(`[AdminGen] Saving schema for project ${initialData.projectId}, config ${initialData.configId}...`);
                    await updateProject({
                        id: project.id,
                        updates: {
                            adminConfigs: updatedConfigs
                        }
                    });
                    
                    console.log(`[AdminGen] Successfully updated project ${initialData.projectId} config ${initialData.configId} with schema`);
                }
            } catch (err) {
                console.error('[AdminGen] Failed to update project config:', err);
                // We don't throw here to avoid breaking the streaming response, 
                // but we should probably inform the user somehow.
            }
        }
    }
    
    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
      // For now, just return existing content
      return document.content || "";
  }
});
