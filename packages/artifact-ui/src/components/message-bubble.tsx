"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { memo, useState } from "react";
import type { Vote, ChatMessage } from "../lib/types";
import { cn, sanitizeText } from "../lib/utils";
import { useDataStream } from "./data-stream-provider";
import { MessageContent } from "./elements/message";
import { MessageActions } from "./message-actions";
import { MessageEditor } from "./message-editor";
import { MessageReasoning } from "./message-reasoning";
import { PreviewAttachment } from "./preview-attachment";
import { Response } from "./response";
import { AgentDashboardTool } from "./tool/agent-dashboard-tool";
import { CollaborationTool } from "./tool/collaboration-tool";
import { DocumentTool } from "./tool/document-tool";
import { FeedbackTool } from "./tool/feedback-tool";
import { MatchAgentsTool } from "./tool/match-agents-tool";
import { MermaidTool } from "./tool/mermaid-tool";
import { ProjectConfirmTool } from "./tool/project-confirm-tool";
import { QuestionnaireTool } from "./tool/questionnaire-tool";
import { ResourceListTool } from "./tool/resource-list-tool";
import { ResourceQueryTool } from "./tool/resource-query-tool";
import { ResourceSearchTool } from "./tool/resource-search-tool";
import { SimpleTool } from "./tool/simple-tool";
import { SuggestionTool } from "./tool/suggestion-tool";
import { TaskTool } from "./tool/task-tool";
import { WeatherTool } from "./tool/weather-tool";

const PureMessageBubble = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  token,
  sendMessage,
  showActions = true,
  isLast = true,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  token?: string;
  sendMessage?: UseChatHelpers<ChatMessage>["append"];
  showActions?: boolean;
  isLast?: boolean;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const attachmentsFromMessage = (message.parts ?? []).filter((part) => part.type === "file");

  useDataStream();

  return (
    <div className="w-full group/bubble">
      {/* 附件显示 */}
      {attachmentsFromMessage.length > 0 && (
        <div className="flex flex-row flex-wrap gap-2 mb-2" data-testid={"message-attachments"}>
          {attachmentsFromMessage.map((attachment) => (
            <PreviewAttachment
              attachment={{
                name: attachment.filename ?? "file",
                contentType: attachment.mediaType,
                url: attachment.url,
              }}
              key={attachment.url}
            />
          ))}
        </div>
      )}

      {/* 消息内容主体 */}
      <div className="w-full">
        {message.parts?.map((part, index) => {
          if (!part) return null;

          const { type } = part;
          const key = `message-${message.id}-part-${index}`;

          if (type === "reasoning" && part.text?.trim().length > 0) {
            return <MessageReasoning isLoading={isLoading} key={key} reasoning={part.text} />;
          }

          if (type === "text") {
            if (mode === "view") {
              return (
                <div key={key} className="mb-2 last:mb-0">
                  <MessageContent
                    className={cn(
                      "p-4 shadow-sm transition-all duration-300 text-[14px] leading-relaxed",
                      {
                        // User message styles
                        "bg-primary text-primary-foreground border-none shadow-[0_4px_12px_rgba(76,175,131,0.25)]":
                          message.role === "user",
                        // Assistant message styles
                        "bg-white dark:bg-zinc-900 border border-[#edf2f7] dark:border-zinc-800 text-[#2d3748] dark:text-zinc-200 shadow-sm":
                          message.role === "assistant",

                        // Radius logic
                        "rounded-[18px_18px_4px_18px]": message.role === "user" && isLast,

                        "rounded-[18px_18px_18px_4px]": message.role === "assistant" && isLast,
                        "rounded-[18px_18px_18px_18px]": !isLast,
                      },
                    )}
                    data-testid="message-content"
                    style={
                      message.role === "user"
                        ? {
                            background: "linear-gradient(135deg, #4caf83, #388e3c)",
                          }
                        : {}
                    }
                  >
                    <Response>{sanitizeText(part.text)}</Response>
                  </MessageContent>
                </div>
              );
            }

            if (mode === "edit") {
              return (
                <div className="flex w-full flex-row items-start gap-3" key={key}>
                  <div className="min-w-0 flex-1">
                    <MessageEditor
                      key={message.id}
                      message={message}
                      regenerate={regenerate}
                      setMessages={setMessages}
                      setMode={setMode}
                      deleteTrailingMessages={async () => {}}
                    />
                  </div>
                </div>
              );
            }
          }

          // 工具调用渲染
          if (type === "tool-getWeather") {
            return <WeatherTool key={part.toolCallId} part={part} />;
          }

          if (type === "tool-createDocument" || type === "tool-updateDocument") {
            return (
              <DocumentTool
                isReadonly={isReadonly}
                key={part.toolCallId}
                part={part}
                type={type === "tool-createDocument" ? "create" : "update"}
                token={token}
                sendMessage={sendMessage}
              />
            );
          }

          if (type === "tool-requestSuggestions") {
            return <SuggestionTool isReadonly={isReadonly} key={part.toolCallId} part={part} />;
          }

          if (type === "tool-createTasks" || type === "tool-updateTasks") {
            return (
              <TaskTool
                key={part.toolCallId}
                part={part}
                type={type === "tool-createTasks" ? "create" : "update"}
              />
            );
          }

          if (type === "tool-provideFeedback") {
            return (
              <FeedbackTool
                key={part.toolCallId}
                messageId={message.id}
                part={part}
                regenerate={regenerate}
                setMessages={setMessages}
              />
            );
          }

          if (type === "tool-searchResources") {
            return <ResourceSearchTool key={part.toolCallId} part={part} />;
          }

          if (type === "tool-createMermaid") {
            return <MermaidTool key={part.toolCallId} part={part} />;
          }

          if (type === "tool-queryResources") {
            return <ResourceQueryTool key={part.toolCallId} part={part} />;
          }

          if (type === "tool-getProjects" || type === "tool-getDocuments") {
            return (
              <ResourceListTool
                key={part.toolCallId}
                part={part}
                type={type === "tool-getProjects" ? "projects" : "documents"}
              />
            );
          }

          if (type === "tool-askQuestions") {
            return (
              <QuestionnaireTool
                key={part.toolCallId}
                messageId={message.id}
                part={part}
                regenerate={regenerate}
                setMessages={setMessages}
                state={part.state}
              />
            );
          }

          if (type === "tool-confirmProjectModification") {
            return (
              <ProjectConfirmTool
                key={part.toolCallId}
                messageId={message.id}
                part={part}
                regenerate={regenerate}
                setMessages={setMessages}
                state={part.state}
              />
            );
          }

          if (type === "tool-showAgentDashboard") {
            return <AgentDashboardTool key={part.toolCallId} part={part} />;
          }

          if (type === "tool-startCollaboration") {
            return <CollaborationTool key={part.toolCallId} part={part} />;
          }

          if (type === "tool-matchAgents") {
            return <MatchAgentsTool key={part.toolCallId} part={part} />;
          }

          if (type === "tool-updateProjectStatus") {
            if (part.state !== "output-available") return null;
            const text =
              (typeof part.output?.message === "string" && part.output?.message) ||
              (typeof part.output?.status === "string" && part.output?.status) ||
              "项目状态已更新";
            return (
              <div className="not-prose mb-4 w-full" key={part.toolCallId}>
                <Response>{String(text)}</Response>
              </div>
            );
          }

          if (
            type === "tool-getProjectRequirements" ||
            type === "tool-getProjectMembers" ||
            type === "tool-getProjectTasks" ||
            type === "tool-talent_match" ||
            type === "tool-skill_analyzer" ||
            (type && type.startsWith && type.startsWith("tool-"))
          ) {
            return (
              <SimpleTool
                key={(part as any).toolCallId}
                part={part as any}
                renderOutput={
                  type === "tool-getProjectRequirements"
                    ? (output: any) =>
                        output?.requirements && output.requirements.length > 0 ? (
                          <div className="space-y-2">
                            {output.requirements.map((req: any, index: number) => (
                              <div
                                className="rounded-lg border bg-white dark:bg-zinc-900 p-3 shadow-sm"
                                key={`${(part as any).toolCallId}-${req.id}-${index}`}
                              >
                                <div className="text-sm font-bold text-[#2c3e50] dark:text-zinc-200">
                                  {req.title || req.name}
                                </div>
                                <div className="mt-1 text-xs text-zinc-500 leading-relaxed">
                                  {req.description}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground italic">未找到相关需求</div>
                        )
                    : type === "tool-talent_match"
                      ? (output: any) => {
                          const freelancers =
                            output?.freelancers || (Array.isArray(output) ? output : []);
                          return freelancers.length > 0 ? (
                            <div className="space-y-3">
                              {freelancers.map((f: any, index: number) => (
                                <div
                                  className="rounded-lg border bg-white dark:bg-zinc-900 p-3 shadow-sm"
                                  key={`${(part as any).toolCallId}-${f.id || f.name || index}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-bold text-[#2c3e50] dark:text-zinc-200">
                                      {f.name}
                                    </div>
                                    <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                      匹配度:{" "}
                                      {Math.round(
                                        (f.match_score ?? f.matchingScore ?? 0) *
                                          ((f.match_score ?? f.matchingScore ?? 0) <= 1 ? 100 : 1),
                                      )}
                                      %
                                    </div>
                                  </div>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {Array.isArray(f.skills) &&
                                      f.skills.slice(0, 5).map((skill: string) => (
                                        <span
                                          key={skill}
                                          className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                  </div>
                                  {f.summary && (
                                    <div className="mt-2 text-xs text-zinc-500 leading-relaxed line-clamp-2">
                                      {f.summary}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground italic">
                              未找到匹配的候选人
                            </div>
                          );
                        }
                      : type === "tool-skill_analyzer"
                        ? (output: any) =>
                            output?.analysis || output?.skills ? (
                              <div className="space-y-2">
                                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                  分析建议
                                </div>
                                {output.analysis && (
                                  <div className="text-sm text-[#2c3e50] dark:text-zinc-200 leading-relaxed">
                                    {output.analysis}
                                  </div>
                                )}
                                {Array.isArray(output.suggested_skills || output.skills) &&
                                  (output.suggested_skills || output.skills).length > 0 && (
                                    <div className="mt-2">
                                      <div className="text-[10px] text-zinc-400 mb-1">
                                        建议技能:
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {(output.suggested_skills || output.skills).map(
                                          (skill: string) => (
                                            <span
                                              key={skill}
                                              className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded"
                                            >
                                              {skill}
                                            </span>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground italic">
                                正在分析技能需求...
                              </div>
                            )
                        : undefined
                }
                title={
                  type === "tool-getProjectRequirements"
                    ? "项目需求列表"
                    : type === "tool-talent_match"
                      ? "人才匹配结果"
                      : type === "tool-skill_analyzer"
                        ? "技能需求分析"
                        : undefined
                }
                type={type as any}
              />
            );
          }

          return null;
        })}
      </div>

      {/* 操作按钮 */}
      {message.role === "assistant" && !isReadonly && showActions && (
        <div className="mt-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
          <MessageActions
            chatId={chatId}
            isLoading={isLoading}
            key={`action-${message.id}`}
            message={message}
            setMode={setMode}
            vote={vote}
            regenerate={regenerate}
          />
        </div>
      )}
    </div>
  );
};

export const MessageBubble = memo(PureMessageBubble, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
  if (prevProps.token !== nextProps.token) return false;
  if (!equal(prevProps.vote, nextProps.vote)) return false;
  if (prevProps.showActions !== nextProps.showActions) return false;
  if (prevProps.isLast !== nextProps.isLast) return false;

  return true;
});
