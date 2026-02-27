"use client";
import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { memo, useState } from "react";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { cn, sanitizeText } from "@/lib/utils";
import { useDataStream } from "./data-stream-provider";
import { DocumentToolResult } from "./document";
import { DocumentPreview } from "./document-preview";
import { Response } from "./elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "./elements/tool";
import { SparklesIcon } from "./icons";
import { Bot, Lightbulb, ClipboardList, ChevronDown, ChevronUp } from "lucide-react";
import { MessageActions } from "./message-actions";
import { MessageReasoning } from "./message-reasoning";
import { Weather } from "./weather";
import { FeedbackTool, TaskList } from "../../../packages/artifact-ui/src";
import { getRoleInfo } from "@/lib/role-info";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@uxin/ui";

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
}) => {
  const [_, setMode] = useState<"view" | "edit">("view");
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);
  const [isTaskListExpanded, setIsTaskListExpanded] = useState(true);

  useDataStream();

  // Extract agent info if available in text
  const getAgentFromText = (text: string) => {
    if (!text || typeof text !== 'string') return null;
    const match = text.match(/^(\w+)\s*[:：]/);
    if (match) {
      const name = match[1].toUpperCase();
      const content = text.slice(match[0].length).trim();
      return { name, content };
    }
    return null;
  };

  const roleInfo = message.role === "user" 
    ? { label: "产品经理 (用户)", gradient: "bg-[#19be6b]", shortName: "用户", name: "产品经理 (用户)" }
    : { ...getRoleInfo("SYS"), shortName: "SYS" };

  if (message.role === "system") {
    return (
      <div className="message system w-full flex justify-center my-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="message-content max-w-[90%] bg-[#f5f5f5] text-[#666] rounded-[10px] text-center text-[13px] px-6 py-2.5 shadow-sm flex items-center gap-2 border border-black/5">
          <Bot size={14} className="text-[#3498db]" />
          <span>
            {(message as any).content || (message.parts?.filter(p => p.type === 'text').map(p => (p as any).text).join(''))}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "message mb-8 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300",
        message.role === "user" ? "user-message items-end" : "ai-message items-start",
        "w-full"
      )}
      data-role={message.role}
    >
      <div className={cn(
        "flex gap-3 max-w-[85%] md:max-w-[75%]",
        message.role === "user" ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div 
          className={cn(
            "message-avatar size-9 rounded-full flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0 mt-1",
            message.role === "user" ? "bg-[#edf2f7] !text-[#718096]" : ""
          )}
          style={{ background: message.role === "user" ? undefined : roleInfo.gradient }}
        >
          {message.role === "user" ? "用户" : roleInfo.shortName}
        </div>

        {/* Message Content Area */}
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          {message.parts?.map((part, index) => {
            if (!part) return null;
            const { type } = part;
            const key = `message-${message.id}-part-${index}`;

            // Internal helper for agent info
            const agentData = message.role === "assistant" && type === "text" ? getAgentFromText(part.text) : null;
            const currentAgentInfo = agentData ? getRoleInfo(agentData.name) : roleInfo;
            const displayContent = agentData ? agentData.content : (type === "text" ? part.text : "");

            if (type === "reasoning" && part.text?.trim().length > 0) {
              return (
                <div key={key} className="thinking-message w-full mb-3">
                  <Collapsible open={isThinkingExpanded} onOpenChange={setIsThinkingExpanded}>
                    <CollapsibleTrigger asChild>
                      <div className="thinking-header flex items-center justify-between p-3 bg-[#f8fafc] border border-[#edf2f7] rounded-t-xl cursor-pointer hover:bg-[#f1f5f9] transition-colors">
                        <div className="thinking-header-left flex items-center gap-2.5">
                          <div className="thinking-icon size-8 rounded-lg bg-[#f0fff4] text-[#19be6b] flex items-center justify-center">
                            <Lightbulb size={16} />
                          </div>
                          <span className="thinking-title text-sm font-bold text-[#2d3748]">思考过程</span>
                          <span className="thinking-progress text-[11px] text-[#718096] bg-[#edf2f7] px-2 py-0.5 rounded-full">分析中...</span>
                        </div>
                        <div className="thinking-toggle text-[#a0aec0]">
                          {isThinkingExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="thinking-content p-4 bg-white border-x border-b border-[#edf2f7] rounded-b-xl">
                        <MessageReasoning
                          isLoading={isLoading}
                          reasoning={part.text}
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            }

            if (type === "text") {
              return (
                <div key={key} className={cn(
                  "message-content p-4 rounded-2xl shadow-sm relative flex flex-col min-w-0 w-full",
                  message.role === "user" 
                    ? "bg-gradient-to-br from-[#2196f3] to-[#0d8bf2] text-white rounded-tr-[5px]" 
                    : "bg-white text-[#2d3748] border border-[#edf2f7] rounded-tl-[5px]"
                )}>
                  <div className="message-header flex items-center justify-between mb-2 pb-2 border-b border-black/5">
                    <span className={cn(
                      "sender-name font-bold text-sm",
                      message.role === "user" ? "text-white" : "text-[#2c3e50]"
                    )}>
                      {message.role === "user" ? "产品经理 (用户)" : currentAgentInfo.label}
                    </span>
                    <span className={cn(
                      "message-type text-[10px] px-2 py-0.5 rounded bg-black/10 font-bold uppercase tracking-tight",
                      message.role === "user" ? "text-white/80" : "text-slate-500"
                    )}>
                      {message.role === "user" ? "需求提出" : (agentData ? "分析结果" : "系统消息")}
                    </span>
                  </div>
                  
                  <div className={cn(
                    "message-text text-sm leading-relaxed",
                    message.role === "user" ? "text-white/95" : "text-slate-800"
                  )}>
                    <Response>{sanitizeText(displayContent)}</Response>
                  </div>

                  <div 
                    className={cn(
                      "message-timestamp mt-2 text-[10px] font-medium opacity-70",
                      message.role === "user" ? "text-right" : "text-left"
                    )}
                    suppressHydrationWarning
                  >
                    {new Date(message.metadata?.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            }

            if (type === "tool-provideFeedback") {
              const { toolCallId } = part;
              return (
                <div key={toolCallId} className="feedback-message w-full mb-3">
                  <FeedbackTool
                    part={part}
                    messageId={message.id}
                    setMessages={setMessages as any}
                    regenerate={regenerate}
                  />
                </div>
              );
            }

            if (type === "tool-createTasks" || type === "tool-updateTasks") {
              const { toolCallId, state, output } = part;
              if (state === "output-available" && output && !("error" in output)) {
                const tasks = type === "tool-createTasks" 
                  ? (output as any).tasks || [] 
                  : [...((output as any).updates || []), ...((output as any).newTasks || [])];
                
                return (
                  <div key={toolCallId} className="tasklist-message w-full mb-3">
                    <Collapsible open={isTaskListExpanded} onOpenChange={setIsTaskListExpanded}>
                      <CollapsibleTrigger asChild>
                        <div className="tasklist-header flex items-center justify-between p-3 bg-[#f8fafc] border border-[#edf2f7] rounded-t-xl cursor-pointer hover:bg-[#f1f5f9] transition-colors">
                          <div className="tasklist-header-left flex items-center gap-2.5">
                            <div className="tasklist-icon size-8 rounded-lg bg-[#f0f9ff] text-[#2d8cf0] flex items-center justify-center">
                              <ClipboardList size={16} />
                            </div>
                            <span className="tasklist-title text-sm font-bold text-[#2d3748]">任务清单</span>
                            <span className="tasklist-progress text-[11px] text-[#718096]">{tasks.length} 个任务</span>
                          </div>
                          <div className="tasklist-toggle text-[#a0aec0]">
                            {isTaskListExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="tasklist-content p-4 bg-white border-x border-b border-[#edf2f7] rounded-b-xl">
                          <TaskList tasks={tasks} />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                );
              }
              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type={type} />
                  <ToolContent>
                    {state === "input-available" && (
                      <ToolInput input={part.input} />
                    )}
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={undefined}
                        output={JSON.stringify(part.output, null, 2)}
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-getWeather") {
              const { toolCallId, state } = part;
              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-getWeather" />
                  <ToolContent>
                    {state === "input-available" && (
                      <ToolInput input={part.input} />
                    )}
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={undefined}
                        output={<Weather weatherAtLocation={part.output} />}
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-createDocument" || type === "tool-updateDocument") {
              const { toolCallId } = part;
              if (part.output && "error" in part.output) {
                return (
                  <div className="rounded-xl border-l-4 border-rose-500 bg-white p-4 shadow-sm mb-4 w-full" key={toolCallId}>
                    <div className="flex items-center gap-2 font-bold text-sm text-rose-600 mb-1">
                      <SparklesIcon size={14} />
                      {type === "tool-createDocument" ? "创建文档失败" : "更新文档失败"}
                    </div>
                    <div className="text-sm text-slate-600">{String(part.output.error)}</div>
                  </div>
                );
              }
              return (
                <div className="w-full mb-4" key={toolCallId}>
                  <DocumentPreview
                    isReadonly={isReadonly}
                    result={part.output}
                    args={type === "tool-updateDocument" ? { ...part.output, isUpdate: true } : undefined}
                  />
                </div>
              );
            }

            if (type === "tool-requestSuggestions") {
              const { toolCallId, state } = part;
              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-requestSuggestions" />
                  <ToolContent>
                    {state === "input-available" && (
                      <ToolInput input={part.input} />
                    )}
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={undefined}
                        output={
                          "error" in part.output ? (
                            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-500 shadow-sm">
                              Error: {String(part.output.error)}
                            </div>
                          ) : (
                            <DocumentToolResult
                              isReadonly={isReadonly}
                              result={part.output}
                              type="request-suggestions"
                            />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            return null;
          })}

          {!isReadonly && (
            <MessageActions
              chatId={chatId}
              isLoading={isLoading}
              key={`action-${message.id}`}
              message={message}
              setMode={setMode}
              vote={vote}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) {
      return false;
    }
    if (prevProps.message.id !== nextProps.message.id) {
      return false;
    }
    if (!equal(prevProps.message.parts, nextProps.message.parts)) {
      return false;
    }
    if (!equal(prevProps.vote, nextProps.vote)) {
      return false;
    }

    return true;
  }
);

export const ThinkingMessage = () => {
  return (
    <div
      className="group/message fade-in w-full animate-in duration-300 mb-8 flex flex-row items-start gap-4 px-4"
      data-role="assistant"
      data-testid="message-assistant-loading"
    >
      <div className="flex-shrink-0 mt-1">
        <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold shadow-sm">
          <div className="animate-spin h-5 w-5 border-2 border-slate-400 border-t-transparent rounded-full" />
        </div>
      </div>

      <div className="flex flex-col items-start max-w-[80%]">
        <div className="flex items-center gap-2 py-2.5 px-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-sm font-medium shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          正在思考中...
        </div>
      </div>
    </div>
  );
};
