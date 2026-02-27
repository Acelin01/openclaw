'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@uxin/ui";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useState, useMemo } from "react";
import { TaskCard } from "@/view/workbench/TaskCard";
import { generateUUID, getAuthToken } from "@/lib/utils";
import { Artifact } from "@/components/artifact";
import { initialArtifactData, useArtifact } from "@/hooks/use-artifact";
import { useDataStream, artifactDefinitions } from "@uxin/artifact-ui";
import { Bot, User } from "lucide-react";
import { MultimodalInput } from "@/components/multimodal-input";
import type { Attachment } from "@/lib/types";

interface ContextItem {
  id: string;
  title: string;
  content: any;
}

interface PublishPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectInfo: ContextItem[];
  positionInfo: ContextItem[];
}

interface Task {
  id: string;
  title: string;
  priority: string;
  status: 'pending' | 'in_progress' | 'completed';
  description?: string;
}

export function PublishPositionDialog({ open, onOpenChange, projectInfo, positionInfo }: PublishPositionDialogProps) {
  const [chatId] = useState(() => generateUUID());
  const { dataStream, setDataStream } = useDataStream();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("chat-model-reasoning");
  
  const [input, setInput] = useState<string>("");
  const { messages, setMessages, status, stop, sendMessage } = useChat({
    id: chatId,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: '/api/v1/chat/publish-position',
      prepareSendMessagesRequest(request) {
        return {
          body: {
            ...request.body,
            context: {
              project: projectInfo,
              positions: positionInfo
            }
          }
        };
      }
    }),
    onData: (dataPart: any) => {
      setDataStream((ds: any) => (ds ? [...ds, dataPart] : []));
    }
  } as any);

  const isLoading = status === 'streaming' || status === 'submitted';

  const { artifact, setArtifact, setMetadata } = useArtifact();
  const token = getAuthToken() || undefined;

  const [hasStarted, setHasStarted] = useState(false);
  useEffect(() => {
    if (open && !hasStarted) {
      setHasStarted(true);
      (sendMessage as any)({ role: 'user', content: '帮我发布一个岗位' });
    }
  }, [open, hasStarted, sendMessage]);

  // Data Stream Logic
  useEffect(() => {
    if (!dataStream?.length) {
      return;
    }

    const newDeltas = dataStream.slice();
    setDataStream([]);

    for (const delta of newDeltas) {
      const artifactDefinition = artifactDefinitions.find(
        (currentArtifactDefinition) =>
          currentArtifactDefinition.kind === artifact.kind
      );

      if (artifactDefinition?.onStreamPart) {
        artifactDefinition.onStreamPart({
          streamPart: delta,
          setArtifact,
          setMetadata,
        });
      }

      setArtifact((draftArtifact) => {
        if (!draftArtifact) {
          return { ...initialArtifactData, status: "streaming" };
        }

        switch (delta.type) {
          case "data-id":
            return {
              ...draftArtifact,
              documentId: delta.data as string,
              status: "streaming",
              isVisible: true,
            };
          case "data-kind":
            return {
              ...draftArtifact,
              kind: delta.data as any,
              status: "streaming",
              isVisible: true,
            };
          case "data-title":
            return {
              ...draftArtifact,
              title: delta.data as string,
              status: "streaming",
              isVisible: true,
            };
          case "data-finish":
            return {
              ...draftArtifact,
              status: "idle",
            };
          case "data-clear":
            return {
              ...initialArtifactData,
              status: "streaming",
              isVisible: true,
            };
        }

        return draftArtifact;
      });
    }
  }, [dataStream, artifact.kind, setArtifact, setMetadata, setDataStream]);

  // Compute Tasks State
  const tasks = useMemo(() => {
    let currentTasks: Task[] = [];
    let lastCreateTasksIndex = -1;

    // Find the last createTasks call to initialize
    messages.forEach((m: any, idx: number) => {
        m.toolInvocations?.forEach((tool: any) => {
            if (tool.toolName === 'createTasks' && tool.state === 'result') {
                currentTasks = tool.result.tasks;
                lastCreateTasksIndex = idx;
            }
        });
    });

    if (lastCreateTasksIndex === -1) return [];

    // Apply updates
    messages.forEach((m: any, idx: number) => {
        if (idx < lastCreateTasksIndex) return; // Skip updates before the task list was created (unlikely but safe)
        m.toolInvocations?.forEach((tool: any) => {
            if (tool.toolName === 'updateTaskStatus' && tool.state === 'result') {
                const { id, status } = tool.result;
                currentTasks = currentTasks.map((t: any) => t.id === id ? { ...t, status } : t);
            }
        });
    });
    
    return currentTasks;
  }, [messages]);

  // Helper to check if a message contains the *latest* task list
  const isLatestTaskList = (messageIndex: number) => {
      let lastIndex = -1;
      messages.forEach((m: any, idx: number) => {
          if (m.toolInvocations?.some((t: any) => t.toolName === 'createTasks')) {
              lastIndex = idx;
          }
      });
      return messageIndex === lastIndex;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] h-[90vh] flex p-0 overflow-hidden gap-0 border-none sm:rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>AI 发布岗位</DialogTitle>
          <DialogDescription>使用 AI 助手帮助您发布岗位</DialogDescription>
        </DialogHeader>
        {/* Left: Chat */}
        <div className="w-[400px] flex flex-col border-r bg-zinc-50/50">
           <div className="p-4 border-b bg-white flex items-center justify-between">
               <h2 className="font-bold text-lg">AI 发布岗位</h2>
               {selectedModelId === 'chat-model-reasoning' && (
                   <div className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full font-medium">思考模式</div>
               )}
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.map((m: any, idx: number) => (
                  <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                          {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                      </div>
                      
                      <div className={`max-w-[85%] space-y-2`}>
                          {m.content && (
                            <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                                m.role === 'user' 
                                ? 'bg-blue-500 text-white rounded-tr-none' 
                                : 'bg-white border border-zinc-200 rounded-tl-none shadow-sm text-zinc-800'
                            }`}>
                                {m.content}
                            </div>
                          )}
                          
                          {/* Tool Invocations */}
                          {m.toolInvocations?.map((toolInvocation: any) => {
                              const { toolName, toolCallId, state } = toolInvocation;
                              
                              if (toolName === 'createTasks' && state === 'result') {
                                  // Use the computed tasks if this is the latest task list, otherwise use the snapshot
                                  const displayTasks = isLatestTaskList(idx) ? tasks : toolInvocation.result.tasks;
                                  return (
                                      <div key={toolCallId} className="w-full">
                                          <TaskCard tasks={displayTasks} />
                                      </div>
                                  );
                              }
                              return null;
                          })}
                      </div>
                  </div>
              ))}
              {isLoading && messages[messages.length-1]?.role !== 'assistant' && (
                   <div className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0 text-white animate-pulse">
                           <Bot size={14} />
                       </div>
                       <div className="bg-white border border-zinc-200 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-zinc-400">
                           正在思考任务流程...
                       </div>
                   </div>
              )}
           </div>
           
           <div className="p-4 border-t bg-white">
             <MultimodalInput
               chatId={chatId}
               input={input}
               setInput={setInput}
               stop={stop}
               attachments={attachments}
               setAttachments={setAttachments}
               messages={messages as any}
               setMessages={setMessages as any}
               status={status}
               selectedModelId={selectedModelId}
               onModelChange={setSelectedModelId}
               selectedVisibilityType="private"
               placeholder="输入您的要求..."
               token={token}
               sendMessage={async (message) => {
                 await (sendMessage as any)(message);
               }}
             />
           </div>
        </div>

        {/* Right: Artifact */}
        <div className="flex-1 bg-zinc-100/50 relative flex flex-col">
            {artifact.isVisible ? (
                <Artifact
                    chatId={chatId}
                    input={input}
                    setInput={() => {}}
                    status={isLoading ? 'streaming' : 'ready'}
                    stop={async () => {}}
                    attachments={[]}
                    setAttachments={() => {}}
                    messages={messages as any}
                    setMessages={setMessages as any}
                    votes={[]}
                    sendMessage={async () => {}}
                    regenerate={async () => {}}
                    isReadonly={false}
                    selectedVisibilityType="private"
                    selectedModelId={selectedModelId}
                    token={token}
                 />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-zinc-200 flex items-center justify-center">
                        <Bot className="w-8 h-8 text-zinc-300" />
                    </div>
                    <p>岗位文档将在这里生成</p>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
