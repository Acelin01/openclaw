import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest, optionalAuthenticateToken } from '../middleware/auth.js';
import { DatabaseService } from '../lib/db/service.js';
import { z } from 'zod';
import {
  createUIMessageStream,
  JsonToSseTransformStream,
  stepCountIs,
  streamText,
  tool,
} from 'ai';
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from 'resumable-stream';
import { myProvider } from '../lib/ai/providers.js';
import { systemPrompt } from '../lib/ai/prompts.js';
import { UnifiedMCPServer, UserRole, SecurityContext } from '@uxin/mcp';
import { getRegisteredTools } from '../lib/ai/tools/mcp/registry.js';
import { createDocument } from '../lib/ai/tools/create-document.js';
import { updateDocument } from '../lib/ai/tools/update-document.js';
import { updateTasks } from '../lib/ai/tools/update-tasks.js';
import { createTasks } from '../lib/ai/tools/create-tasks.js';
import { requestSuggestions } from '../lib/ai/tools/request-suggestions.js';
import { provideFeedback } from '../lib/ai/tools/provide-feedback.js';
import { updateProjectStatus } from '../lib/ai/tools/update-project-status.js';
import { getWeather } from '../lib/ai/tools/get-weather.js';
import { startCollaboration } from '../lib/ai/tools/start-collaboration.js';
import { matchAgentsTool } from '../lib/ai/tools/match-agents.js';
import {
  saveChat,
  saveMessages,
  getChatById,
  deleteChatById,
  updateChat,
  getMessagesByChatId,
  getChatsByUserId,
  createStreamId,
  getStreamIdsByChatId,
  getChatByDocumentId,
} from '../lib/db/queries.js';
import { generateUUID } from '../lib/utils.js';

const router: Router = Router();
const mcpServer = new UnifiedMCPServer();
let globalStreamContext: ResumableStreamContext | null = null;
const noopWaitUntil = (promise: Promise<any>) => {
  try { promise.catch(() => {}); } catch {}
};

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({ waitUntil: noopWaitUntil });
    } catch (error: any) {
      if (error?.message?.includes('REDIS_URL')) {
        console.log(' > Resumable streams are disabled due to missing REDIS_URL');
      } else {
        console.error(error);
      }
    }
  }
  return globalStreamContext;
}

const textPartSchema = z.object({
  type: z.enum(["text"]),
  text: z.string().min(1).max(2000),
});

const filePartSchema = z.object({
  type: z.enum(["file"]),
  mediaType: z.string(),
  name: z.string().min(1).max(100),
  url: z.string().url(),
});

const partSchema = z.union([textPartSchema, filePartSchema]);

const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  message: z.object({
    id: z.string().uuid().optional(),
    role: z.enum(["user"]).optional(),
    parts: z.array(partSchema).optional(),
    content: z.string().optional(),
    metadata: z.any().optional(),
  }).optional(),
  messages: z.array(z.object({
    id: z.string().uuid().optional(),
    role: z.enum(["user", "assistant", "system", "tool"]),
    content: z.string().optional(),
    parts: z.array(z.any()).optional(),
    metadata: z.any().optional(),
  })).optional(),
  selectedChatModel: z.string().optional(),
  selectedVisibilityType: z.enum(["public", "private"]).optional(),
  agentId: z.string().optional(),
  isMultiAgent: z.boolean().optional(),
});

// Helper to generate title from user message
function generateTitleFromUserMessage({ message }: { message: any }) {
  if (!message || !message.parts || !Array.isArray(message.parts)) {
    return 'New Chat';
  }
  const textPart = message.parts.find((p: any) => p?.type === 'text');
  if (textPart && textPart.text) {
    return textPart.text.slice(0, 100);
  }
  return 'New Chat';
}

// GET /api/v1/chat/by-document?documentId=...
router.get('/by-document', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(503).json({ success: false, message: '数据库连接不可用' });
    }
    const { documentId } = req.query as { documentId?: string };

    if (!documentId) {
      return res.status(400).json({ success: false, error: 'Missing documentId' });
    }

    const chat = await getChatByDocumentId({ documentId });

    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found for this document' });
    }

    return res.json({ success: true, data: chat });
  } catch (error: any) {
    console.error('Error fetching chat by document id:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
});

// POST /api/v1/chat
router.post('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = DatabaseService.getInstance();
    if (!db.isAvailable()) {
      return res.status(503).json({ success: false, message: '数据库连接不可用' });
    }
    const parsed = postRequestBodySchema.parse(req.body);
    const id = parsed.id;
    let message = parsed.message;
    const messagesInRequest = parsed.messages;
    const selectedChatModel = parsed.selectedChatModel || 'chat-model';
    const selectedVisibilityType = parsed.selectedVisibilityType || 'private';
    const isMultiAgent = parsed.isMultiAgent ?? false;
    let agentId = parsed.agentId || (message?.metadata as any)?.selectedAgent?.id || (message?.metadata as any)?.selectedAgent;

    if (typeof agentId !== 'string') {
        agentId = undefined;
    }

    // Handle single message if provided
    if (message) {
        if (!message.id) message.id = generateUUID();
        if (!message.role) message.role = 'user';
        if (!message.parts) {
            message.parts = message.content ? [{ type: 'text', text: message.content }] : [];
        }
    }
    
    // Check authentication
    let user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Fetch agent if agentId is provided
    let agent: any = null;
    if (agentId) {
        agent = await db.getAgentById(agentId);
    }

    // Mock session for tools
    const session = {
      user: {
        id: user!.id,
        email: user!.email,
        role: user!.role,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const savedChat = await getChatById({ id });

    if (!savedChat) {
      const title = message 
        ? generateTitleFromUserMessage({ message }) 
        : (messagesInRequest && messagesInRequest.length > 0 && messagesInRequest[0] && messagesInRequest[0].content 
            ? messagesInRequest[0].content.slice(0, 100) 
            : 'New Chat');

      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
        agentId: agentId,
      });
    }

    // Save messages to DB
    if (messagesInRequest && messagesInRequest.length > 0) {
        // Filter out messages that might already exist to avoid duplicates
        const existingMessages = await getMessagesByChatId({ id });
        const existingIds = new Set(existingMessages.map((m: any) => m.id));
        
        const newMessages = messagesInRequest
            .filter(m => !m.id || !existingIds.has(m.id))
            .map(m => ({
                id: m.id || generateUUID(),
                role: m.role,
                parts: m.parts || (m.content ? [{ type: 'text', text: m.content }] : []),
                chatId: id,
                createdAt: new Date(),
                agentId: agentId,
            }));

        if (newMessages.length > 0) {
            await saveMessages({ messages: newMessages });
        }
    } else if (message) {
        await saveMessages({
            messages: [
                {
                    ...message,
                    chatId: id,
                    createdAt: new Date(),
                    agentId: agentId,
                },
            ],
        });
    }

    const messages = await getMessagesByChatId({ id });

    // Fix custom tool parts to standard tool-invocation parts for AI SDK
    const fixedMessages = messages.map((m: any) => {
      if (!m.parts || !Array.isArray(m.parts)) return m;
      
      const newParts = m.parts.map((part: any) => {
        if (part && typeof part.type === 'string' && part.type.startsWith('tool-') && 
            part.type !== 'tool-invocation' && part.type !== 'tool-call' && part.type !== 'tool-result') {
          
          // If output is missing, this is a pending/stuck tool call.
          // We drop it from the context sent to the model so the model will regenerate it (retry).
          if (!part.output) {
            return null;
          }

          const toolName = part.type.replace('tool-', '');
          const state = 'result';
          
          return {
            type: 'tool-invocation',
            toolInvocation: {
              toolCallId: part.toolCallId || generateUUID(),
              toolName,
              args: part.args || {},
              state,
              result: part.output
            }
          };
        }
        return part;
      }).filter((p: any) => p !== null); // Filter out dropped parts
      
      return { ...m, parts: newParts };
    }).filter((m: any) => m.parts && m.parts.length > 0); // Filter out empty messages

    // 打印 fixedMessages 以便调试
    console.log(`[Chat Debug] Fixed messages count: ${fixedMessages.length}`);
    if (fixedMessages.length > 0) {
        console.log(`[Chat Debug] Fixed messages last content:`, JSON.stringify(fixedMessages[fixedMessages.length - 1].content));
    }

    const coreMessages = fixedMessages.map((m: any) => {
        const parts = Array.isArray(m.parts) ? m.parts : [];
        const textFromParts = parts.map((part: any) => {
            if (!part) return '';
            if (part.type === 'text' && typeof part.text === 'string') return part.text;
            if (part.type === 'tool-invocation' && part.toolInvocation) {
                const toolName = part.toolInvocation.toolName || 'tool';
                if (part.toolInvocation.result !== undefined) {
                    return `\n[tool:${toolName} result] ${JSON.stringify(part.toolInvocation.result)}`;
                }
                if (part.toolInvocation.args !== undefined) {
                    return `\n[tool:${toolName} call] ${JSON.stringify(part.toolInvocation.args)}`;
                }
            }
            if (part.type === 'tool-result' && part.toolName) {
                return `\n[tool:${part.toolName} result] ${JSON.stringify(part.result)}`;
            }
            if (part.type === 'tool-call' && part.toolName) {
                return `\n[tool:${part.toolName} call] ${JSON.stringify(part.args)}`;
            }
            return '';
        }).join('');

        const content = typeof m.content === 'string' && m.content.length > 0 ? m.content : textFromParts;
        return {
            role: m.role,
            content: content || '',
        };
    });
    
    console.log(`[Chat Debug] Incoming request for chatId: ${id}, model: ${selectedChatModel}`);
    console.log(`[Chat Debug] Core messages count: ${coreMessages.length}`);
    if (coreMessages.length > 0) {
        console.log(`[Chat Debug] Core messages sample:`, JSON.stringify(coreMessages.slice(-2), null, 2));
    }

    const requestHints = {
        longitude: undefined,
        latitude: undefined,
        city: undefined,
        country: undefined,
    };

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for Nginx
    });

    const streamId = generateUUID();
    try { await createStreamId({ streamId, chatId: id }); } catch {}

    const streamContext = getStreamContext();
    const uiStream = createUIMessageStream({
        execute: async (writerCtx) => {
            const dataStream = writerCtx.writer;

            try {
                const userRoleMap: Record<string, UserRole> = {
                    ADMIN: UserRole.ADMIN,
                    MANAGER: UserRole.PROJECT_MANAGER,
                    USER: UserRole.DEVELOPER,
                    GUEST: UserRole.GUEST,
                };

                const securityContext: SecurityContext = {
                    userId: session?.user?.id || 'guest',
                    role: userRoleMap[session?.user?.role || 'GUEST'] || UserRole.GUEST,
                    onEvent: (event: any) => {
                        dataStream.write(event);
                    }
                };

                // Determine which tools to enable
                const mcpTools = getRegisteredTools();
                console.log(`[Chat Debug] Registered tools count: ${Object.keys(mcpTools).length}`);
                
                // 检查 project_create 工具的详情
                if (mcpTools.project_create) {
                    console.log(`[Chat Debug] project_create tool info:`, {
                        description: (mcpTools.project_create as any).description,
                        hasParameters: !!(mcpTools.project_create as any).parameters,
                        parametersType: typeof (mcpTools.project_create as any).parameters,
                        isZod: !!((mcpTools.project_create as any).parameters && ((mcpTools.project_create as any).parameters as any)._def)
                    });
                }

                const createDocumentTool = createDocument({ session, dataStream: dataStream as any, chatId: id, messageId: message?.id, agentId });
                const parseMcpPayload = (result: any) => {
                    if (!result) return null;
                    const content = result?.content;
                    if (Array.isArray(content) && content.length > 0) {
                        const text = content[0]?.text;
                        if (typeof text === 'string') {
                            try {
                                return JSON.parse(text);
                            } catch {
                                return text;
                            }
                        }
                    }
                    if (result?.data) return result.data;
                    return result;
                };
                const mcpArtifactMap: Record<string, { kind: string; title: (args: any, payload: any) => string; initialData?: (args: any, payload: any) => any }> = {
                    project_create: {
                        kind: "project",
                        title: (args, payload) => payload?.name || args?.name || "项目规划",
                        initialData: (args, payload) => ({ project: payload ?? args })
                    },
                    requirement_create: {
                        kind: "project-requirement",
                        title: (args, payload) => payload?.title || args?.title || "需求",
                        initialData: (args, payload) => ({
                            ...payload,
                            projectId: payload?.project_id || args?.project_id,
                            title: payload?.title || args?.title,
                            description: payload?.description || args?.description,
                            priority: payload?.priority || args?.priority,
                            status: payload?.status || args?.status,
                        })
                    },
                    task_create: {
                        kind: "task",
                        title: (args, payload) => payload?.title || args?.title || "任务"
                    },
                    resume_create: {
                        kind: "resume",
                        title: (args, payload) => payload?.title || args?.title || "简历"
                    },
                    service_create: {
                        kind: "service",
                        title: (args, payload) => payload?.title || args?.title || "服务"
                    },
                    contract_create: {
                        kind: "contract",
                        title: (args, payload) => payload?.title || args?.title || "合同"
                    },
                    talent_match: {
                        kind: "matching",
                        title: (args) => `人才匹配：${Array.isArray(args?.skills) ? args.skills.join(", ") : "需求"}`
                    }
                };
                const wrapMcpToolWithArtifact = (toolName: string, toolDef: any) => {
                    const mapping = mcpArtifactMap[toolName];
                    if (!mapping || !toolDef?.execute) return toolDef;
                    return {
                        ...toolDef,
                        execute: async (args: any) => {
                            const result = await toolDef.execute(args);
                            const payload = parseMcpPayload(result);
                            const isSuccess = !(payload && payload.success === false) && !(result && result.success === false);
                            if (isSuccess) {
                                try {
                                    const title = mapping.title(args, payload);
                                    const initialData = mapping.initialData ? mapping.initialData(args, payload) : payload;
                                    await createDocumentTool.execute({
                                        title,
                                        kind: mapping.kind as any,
                                        initialData
                                    });
                                } catch (error) {
                                    console.error(`[MCP Artifact] Failed to create artifact for ${toolName}:`, error);
                                }
                            }
                            return result;
                        }
                    };
                };
                const wrappedMcpTools = Object.fromEntries(
                    Object.entries(mcpTools).map(([name, toolDef]) => [name, wrapMcpToolWithArtifact(name, toolDef)])
                );

                const allTools: any = {
                    getWeather,
                    createDocument: createDocumentTool,
                    updateDocument: updateDocument({ session, dataStream: dataStream as any }),
                    updateTasks: updateTasks,
                    createTasks: createTasks({ userId: session?.user?.id, dataStream: dataStream as any }),
                    requestSuggestions: requestSuggestions({ session, dataStream: dataStream as any }),
                    ...wrappedMcpTools,
                    project: tool({
                        description: '统一的项目协作工具，支持项目创建、需求管理、任务分配、文档协作等。使用此工具进行所有项目相关的操作。',
                        inputSchema: z.object({
                            action: z.enum([
                                'create_project', 
                                'get_project', 
                                'create_requirement', 
                                'get_requirements',
                                'create_task', 
                                'get_tasks',
                                'create_document', 
                                'update_document',
                                'request_suggestions',
                                'assign_task'
                            ]),
                            payload: z.any()
                        }) as any,
                        execute: async (args: any) => {
                            return mcpServer.handleMessage({
                                header: {
                                    message_id: generateUUID(),
                                    timestamp: new Date().toISOString(),
                                    sender: session?.user?.id || 'user',
                                    recipients: ['project'],
                                    priority: 1 as any,
                                    conversation_id: id
                                },
                                body: {
                                    intent: 'request' as any,
                                    content_type: 'json' as any,
                                    action: `project.${args.action}`,
                                    parameters: args,
                                    context: { project_id: id }
                                }
                            }, securityContext);
                        }
                    }),
                    collaboration: tool({
                        description: '统一协作工具，支持文档创建、更新、建议生成和任务指派。使用此工具进行所有项目协作操作。',
                        inputSchema: z.object({
                            action: z.enum(['create_document', 'update_document', 'request_suggestions', 'assign_task']),
                            payload: z.any()
                        }) as any,
                        execute: async (args: any) => {
                            return mcpServer.handleMessage({
                                header: {
                                    message_id: generateUUID(),
                                    timestamp: new Date().toISOString(),
                                    sender: session?.user?.id || 'user',
                                    recipients: ['collaboration'],
                                    priority: 1 as any,
                                    conversation_id: id
                                },
                                body: {
                                    intent: 'request' as any,
                                    content_type: 'json' as any,
                                    action: `collaboration.${args.action}`,
                                    parameters: args,
                                    context: { project_id: id }
                                }
                            }, securityContext);
                        }
                    }),
                    startCollaboration: startCollaboration({ 
                        session, 
                        dataStream: dataStream as any, 
                        chatId: id,
                        token: req.headers.authorization?.split(' ')[1]
                    }),
                    matchAgents: matchAgentsTool({
                        session,
                        dataStream: dataStream as any,
                    }),
                    provideFeedback: provideFeedback,
                    updateProjectStatus: updateProjectStatus({
                        dataStream: dataStream as any,
                    }),
                };

                let activeToolNames = [
                    'getWeather', 
                    'project', 
                    'collaboration', 
                    'startCollaboration', 
                    'matchAgents', 
                    'provideFeedback', 
                    'updateProjectStatus',
                    'createTasks',
                    'updateTasks',
                    'createDocument',
                    'updateDocument',
                    'requestSuggestions',
                    ...Object.keys(mcpTools)
                ];
                
                // If agent has selectedTools, filter them
                if (agent && agent.selectedTools) {
                    const selectedTools = Array.isArray(agent.selectedTools) 
                        ? agent.selectedTools 
                        : (typeof agent.selectedTools === 'string' ? JSON.parse(agent.selectedTools) : []);
                    
                    if (selectedTools.length > 0) {
                        // Map selectedTools (which might be tool names or objects) to activeToolNames
                        activeToolNames = selectedTools.map((t: any) => typeof t === 'string' ? t : t.name);
                    }
                }

                // Check if the selected model is a reasoning model (e.g., DeepSeek Reasoner)
                // Reasoning models typically don't support tools or have specific requirements
                const isReasoningModel = selectedChatModel === 'chat-model-reasoning' || 
                                       selectedChatModel?.includes('reasoner') || 
                                       selectedChatModel?.includes('r1');

                const tools: any = {};
                // Register tools regardless of whether it's a reasoning model
                // Some reasoning models (like Gemini) support tools, while others (like DeepSeek R1) might not.
                // We enable them here and let the provider handle compatibility.
                activeToolNames.forEach(name => {
                    if (allTools[name]) {
                        const toolObj = allTools[name];
                        
                        if (toolObj && typeof toolObj === 'object' && toolObj.execute && (toolObj.parameters || toolObj.inputSchema)) {
                            tools[name] = toolObj;
                        } else {
                            console.log(`[Chat Debug] Skipping tool ${name} due to missing execute or parameters/inputSchema`);
                        }
                    }
                });

                if (isReasoningModel) {
                    console.log(`[Chat Debug] Reasoning model detected (${selectedChatModel}), registered ${Object.keys(tools).length} tools.`);
                }

                const lastUserMessage = [...coreMessages].reverse().find((m: any) => m?.role === 'user');
                const lastUserText = Array.isArray(lastUserMessage?.content)
                    ? lastUserMessage.content.map((p: any) => (typeof p?.text === 'string' ? p.text : '')).join('')
                    : (lastUserMessage?.content || '');
                const hasStartCollaboration = fixedMessages.some((m: any) =>
                    Array.isArray(m?.parts) && m.parts.some((p: any) =>
                        p?.type === 'tool-startCollaboration' ||
                        (p?.type === 'tool-invocation' && p?.toolInvocation?.toolName === 'startCollaboration') ||
                        (p?.type === 'tool-call' && p?.toolName === 'startCollaboration') ||
                        (p?.type === 'tool-result' && p?.toolName === 'startCollaboration')
                    )
                );
                const wantsSkillAnalyzer = /skill_analyzer/i.test(lastUserText || '');
                const wantsMilestoneMonitor = /milestone_monitor/i.test(lastUserText || '');
                let toolChoice: any = undefined;
                if (tools && Object.keys(tools).length > 0) {
                    if (isMultiAgent && tools.startCollaboration && !hasStartCollaboration) {
                        toolChoice = { type: 'tool', toolName: 'startCollaboration' };
                    } else if (wantsSkillAnalyzer && tools.skill_analyzer) {
                        toolChoice = { type: 'tool', toolName: 'skill_analyzer' };
                    } else if (wantsMilestoneMonitor && tools.milestone_monitor) {
                        toolChoice = { type: 'tool', toolName: 'milestone_monitor' };
                    }
                }

                const locale = req.headers['accept-language']?.split(',')[0] || 'zh-CN';

                const result = streamText({
                    model: myProvider.languageModel(selectedChatModel as any),
                    system: systemPrompt({ 
                        selectedChatModel: selectedChatModel as any, 
                        requestHints,
                        agentPrompt: agent?.prompt, // Pass agent prompt if available
                        selectedAgent: agent ? { id: agent.id, name: agent.name } : undefined,
                        locale
                    }),
                    messages: coreMessages,
                    stopWhen: stepCountIs(5),
                    experimental_activeTools: activeToolNames as any,
                    tools,
                    toolChoice,
                    onFinish: async (event) => {
                        console.log(`[Chat Debug] Stream finished for chatId: ${id}`);
                        console.log(`[Chat Debug] Finish reason: ${event.finishReason}`);
                        console.log(`[Chat Debug] Usage:`, event.usage);
                    },
                });

                // result.consumeStream(); 

                dataStream.merge(
                    result.toUIMessageStream({
                        sendReasoning: true,
                    })
                );
            } catch (error) {
                console.error('Stream execution error:', error);
                // Try to notify the client about the error
                try {
                    dataStream.write({
                        type: "text",
                        value: "\n\nAn error occurred during generation.",
                    } as any);
                } catch (e) {
                    // Ignore if stream is already closed
                }
            }
        },
        generateId: generateUUID,
        onFinish: async ({ messages }) => {
            await saveMessages({
                messages: messages.map((currentMessage) => ({
                    id: currentMessage.id,
                    role: currentMessage.role,
                    parts: currentMessage.parts,
                    createdAt: new Date(),
                    attachments: [],
                    chatId: id,
                    agentId: agentId, // Associate assistant messages with the current agent
                })),
            });
        },
        onError: () => {
            return "Oops, an error occurred!";
        },
    });

    const transformedStream = uiStream.pipeThrough(new JsonToSseTransformStream());
    const resumable = streamContext
      ? await streamContext.resumableStream(streamId, () => transformedStream)
      : transformedStream;
    const reader = (resumable ?? transformedStream).getReader();

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
            // @ts-ignore - flush exists when using compression middleware
            if (res.flush) res.flush();
        }
        res.end();
        return;
    } catch (err) {
        console.error('Stream error:', err);
        if (!res.headersSent) {
            res.status(500).end();
        } else {
            res.end();
        }
        return;
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Invalid request body', error: error.errors });
      return;
    } else {
      console.error('Chat request failed:', error);
      // If headers are not sent, send error response
      if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Chat request failed', error: error.message });
      }
      return;
    }
  }
});

// GET /api/v1/chat/:id
router.get('/:id', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Chat ID is required' });
    }

    const chat = await getChatById({ id });
    if (!chat) {
      return res.status(404).json({ success: false, code: 'chat_not_found', message: 'Chat not found' });
    }

    // Check visibility
    const sessionUser = req.user;
    if (chat.visibility !== 'public') {
      if (!sessionUser || chat.userId !== sessionUser.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
    }

    return res.json(chat);
  } catch (error: any) {
    console.error('Failed to get chat:', error);
    return res.status(500).json({ success: false, message: 'Failed to get chat', error: error.message });
  }
});

// GET /api/v1/chat/:id/stream
router.get('/:id/stream', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id: chatId } = req.params;
  const resumeRequestedAt = new Date();

  const streamContext = getStreamContext();
  if (!streamContext) {
    return res.status(204).end();
  }

  if (!chatId) {
    return res.status(400).json({ success: false, error: 'Missing chatId' });
  }

  try {
    const chat = await getChatById({ id: chatId });
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    if (chat.visibility === 'private' && chat.userId !== req.user?.id) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const streamIds = await getStreamIdsByChatId({ chatId });
    if (!streamIds.length) {
      return res.status(404).json({ success: false, error: 'Stream not found' });
    }

    const recentStreamId = streamIds.at(-1);
    if (!recentStreamId) {
      return res.status(404).json({ success: false, error: 'Stream not found' });
    }

    const emptyDataStream = createUIMessageStream({
      execute: () => {},
    });

    const stream = await streamContext.resumableStream(recentStreamId, () =>
      emptyDataStream.pipeThrough(new JsonToSseTransformStream())
    );

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Resume-Requested-At": resumeRequestedAt.toISOString(),
    });

    const reader = stream?.getReader();
    if (reader) {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
            // @ts-ignore
            if (res.flush) res.flush();
        }
    }
    res.end();
    return;
  } catch (error: any) {
    console.error('Failed to stream chat:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to stream chat', error: error.message });
    }
    return res.end();
  }
});

// POST /api/v1/chat/publish-position
router.post('/publish-position', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const db = DatabaseService.getInstance();
        if (!db.isAvailable()) {
            return res.status(503).json({ success: false, message: '数据库连接不可用' });
        }

        const { id, messages, context } = req.body;
        const user = req.user;

        if (user && id) {
            try {
                const savedChat = await getChatById({ id });
                if (!savedChat) {
                    await saveChat({
                        id,
                        userId: user.id,
                        title: "发布岗位助手",
                        visibility: "private"
                    });
                }
            } catch (error) {
                console.warn("Failed to save chat:", error);
            }
        }

        const streamId = generateUUID();
        try { await createStreamId({ streamId, chatId: id || 'temp-chat-id' }); } catch {}
        const streamContext = getStreamContext();

        const uiStream = createUIMessageStream({
            execute: ({ writer: dataStream }) => {
                const result = streamText({
                    model: myProvider.languageModel("chat-model-reasoning"),
                    messages: convertToModelMessages(messages as any),
                    system: `You are an AI recruitment assistant.
Context:
${context ? `Project Info: ${JSON.stringify(context.project || {})}
Existing Positions: ${JSON.stringify(context.positions || {})}` : ''}

Your goal is to help the user publish a position.

Process:
1. First, analyze the context and create a list of tasks using 'createTasks' tool.
   The tasks should typically include:
   - Analyze context and requirements
   - Generate position document (using createDocument with kind: "position")
   - Refine the position details
2. After creating tasks, AUTOMATICALLY start executing them one by one.
3. For each task:
   - Mark it as 'in_progress' using 'updateTasks'.
   - Perform the action (e.g., analyze, createDocument).
   - Mark it as 'completed' using 'updateTasks'.
   - Move to the next task.

IMPORTANT:
- Use 'createDocument' to generate the position content.
- Be proactive. Do not stop after creating tasks. Start working on them immediately.
- If you need more information from the user, ask them, but try to infer as much as possible from the context.
`,
                    tools: {
                        createTasks: createTasks({ userId: user?.id, dataStream }),
                        updateTasks: updateTasks({ dataStream }),
                        createDocument: createDocument({
                            // @ts-ignore
                            session: { user },
                            dataStream,
                            chatId: id || 'temp-chat-id',
                        }),
                        updateDocument: updateDocument({
                            // @ts-ignore
                            session: { user },
                            dataStream,
                        }),
                        requestSuggestions: requestSuggestions({
                            // @ts-ignore
                            session: { user },
                            dataStream,
                        }),
                    },
                    stopWhen: stepCountIs(10),
                });

                dataStream.merge(result.toUIMessageStream());
            }
        });

        const transformedStream = uiStream.pipeThrough(new JsonToSseTransformStream());
        const resumable = streamContext
            ? (await streamContext.resumableStream(streamId, () => transformedStream))
            : transformedStream;
        const reader = (resumable ?? transformedStream).getReader();

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
                // @ts-ignore
                if (res.flush) res.flush();
            }
            res.end();
            return;
        } catch (err) {
            console.error('Publish position stream error:', err);
            if (!res.headersSent) {
                res.status(500).end();
            } else {
                res.end();
            }
            return;
        }
    } catch (error: any) {
        console.error('Publish position request failed:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Publish position request failed', error: error.message });
        }
        return;
    }
});

// PATCH /api/v1/chat/:id
router.patch('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!id) {
            res.status(400).json({ error: 'Chat ID is required' });
            return;
        }

        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id: userId } = req.user;
        const chat = await getChatById({ id });
        
        if (!chat) {
            res.status(404).json({ error: 'Chat not found' });
            return;
        }

        if (chat.userId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        await updateChat({ chatId: id, data: updates });
        res.json({ success: true });
    } catch (error: any) {
        console.error('Failed to update chat:', error);
        res.status(500).json({ error: 'Failed to update chat' });
    }
});

// DELETE /api/v1/chat/:id
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ error: 'Chat ID is required' });
            return;
        }

        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id: userId } = req.user;
        const chat = await getChatById({ id });
        
        if (!chat) {
            res.status(404).json({ error: 'Chat not found' });
            return;
        }

        if (chat.userId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        await deleteChatById({ id });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to delete chat' });
    }
});

// GET /api/v1/chat/:id/stream
router.get('/:id/stream', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: chatId } = req.params as any;
    if (!chatId) {
      res.status(400).json({ success: false, message: 'Chat ID is required' });
      return;
    }

    const sessionUser = req.user;
    const chat = await getChatById({ id: chatId });
    if (!chat) {
      res.status(404).json({ success: false, message: 'Chat not found' });
      return;
    }
    if (chat.visibility !== 'public') {
      if (!sessionUser || chat.userId !== sessionUser.id) {
        res.status(403).json({ success: false, message: 'Unauthorized' });
        return;
      }
    }

    const streamContext = getStreamContext();
    if (!streamContext) {
      res.status(204).end();
      return;
    }

    const streamIds = await getStreamIdsByChatId({ chatId });
    const recentStreamId = streamIds.at(-1);
    if (!recentStreamId) {
      res.status(404).json({ success: false, message: 'Stream not found' });
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const emptyStream = createUIMessageStream({
      // biome-ignore lint/suspicious/noEmptyBlockStatements: stub
      execute: () => {},
    }).pipeThrough(new JsonToSseTransformStream());
    const stream = (await streamContext.resumableStream(recentStreamId, () => emptyStream)) ?? emptyStream;
    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
        // @ts-ignore - flush exists when using compression middleware
        if (res.flush) res.flush();
      }
    } catch (err) {
      console.error('Resume stream error:', err);
    } finally {
      res.end();
    }
  } catch (error: any) {
    console.error('Resume request failed:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Resume request failed', error: error.message });
    }
  }
});

// GET /api/v1/chat/conversations
router.get('/conversations', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const limit = parseInt(String(req.query['limit'])) || 20;
        const startingAfter = req.query['startingAfter'] as string | undefined;

        const chats = await getChatsByUserId({ id: userId, limit, startingAfter });
        res.json({ success: true, data: chats });
    } catch (error) {
        console.error('Failed to fetch conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

export default router;
