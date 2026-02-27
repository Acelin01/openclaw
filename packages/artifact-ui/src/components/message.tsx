"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { Bot } from "lucide-react";
import { memo, useState, useEffect } from "react";
// @ts-ignore
import { useTranslation } from "react-i18next";
import type { Vote, ChatMessage } from "../lib/types";
import { useChatResources } from "../hooks/use-chat-resources";
import { cn, sanitizeText, getRoleInfo } from "../lib/utils";
import { useDataStream } from "./data-stream-provider";
import { MessageContent } from "./elements/message";
import { MessageActions } from "./message-actions";
import { MessageEditor } from "./message-editor";
import { MessageReasoning } from "./message-reasoning";
import { PreviewAttachment } from "./preview-attachment";
import { Response } from "./response";
import { ToolInvocation } from "./tool-invocation";
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

const isEmoji = (str: string | null | undefined) => {
  if (!str) return false;
  return /\p{Emoji}/u.test(str) && str.length <= 8;
};

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  userId,
  token,
  userAvatar,
  userName,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  userId?: string;
  token?: string;
  userAvatar?: string;
  userName?: string;
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const { agents } = useChatResources(token);

  // 查找项目负责人作为默认智能体
  const projectLeadAgent = agents.find(
    (a: any) =>
      a.identifier?.includes("pm") ||
      a.name?.includes("项目负责人") ||
      a.name?.includes("Project Lead"),
  );

  const attachmentsFromMessage = (message.parts ?? []).filter((part) => part.type === "file");

  useDataStream();

  const isAuthor = !message.metadata?.authorId || userId === message.metadata?.authorId;

  // 如果没有关联智能体 ID，默认关联项目负责人 ID
  const effectiveId =
    message.authorAvatar || (message as any).metadata?.authorAvatar || projectLeadAgent?.id;
  const effectiveName =
    message.authorName || (message as any).metadata?.authorName || projectLeadAgent?.name;

  const roleInfo = getRoleInfo(effectiveId, effectiveName, agents);

  return (
    <div
      className="group/message fade-in w-full animate-in duration-500"
      data-role={message.role}
      data-testid={`message-${message.role}`}
      id={`message-${message.id}`}
    >
      <div
        className={cn(
          "flex w-full flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 mb-5",
          {
            "items-end": message.role === "user" && isAuthor && mode !== "edit",
            "items-start": message.role === "assistant" || (message.role === "user" && !isAuthor),
          },
        )}
      >
        {message.role === "system" ? (
          <div className="flex w-full justify-center my-4">
            <div className="max-w-[90%] bg-[#f5f5f5] dark:bg-zinc-800 text-[#666] dark:text-zinc-400 rounded-[10px] text-center text-[14px] px-5 py-2.5 shadow-sm flex items-center gap-2">
              <Bot size={14} className="text-[#3498db]" />
              {(message as any).content ||
                message.parts
                  ?.filter((p) => p.type === "text")
                  .map((p) => (p as any).text)
                  .join("")}
            </div>
          </div>
        ) : (
          <div
            className={cn("flex flex-row items-start gap-3 w-full", {
              "flex-row-reverse": message.role === "user",
            })}
          >
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full text-white font-bold shadow-sm overflow-hidden",
                  message.role === "user"
                    ? "bg-[#edf2f7] !text-[#718096] border border-[#e2e8f0]"
                    : "",
                )}
                style={message.role === "assistant" ? { background: roleInfo?.gradient } : {}}
              >
                {message.role === "user" ? (
                  userAvatar ? (
                    <img src={userAvatar} alt="" className="size-full object-cover" />
                  ) : (
                    "用户"
                  )
                ) : roleInfo?.avatar ? (
                  isEmoji(roleInfo.avatar) ? (
                    <span className="text-xl">{roleInfo.avatar}</span>
                  ) : (
                    <img src={roleInfo.avatar} alt="" className="size-full object-cover" />
                  )
                ) : (
                  (message as any).senderName?.slice(0, 2) || roleInfo?.label?.slice(0, 2) || "智"
                )}
              </div>
            </div>

            <div
              className={cn("flex flex-col max-w-[85%] sm:max-w-[75%]", {
                "items-end": message.role === "user",
                "items-start": message.role === "assistant",
              })}
            >
              {/* 消息头部：发送者名称和类型 */}
              <div
                className={cn("flex items-center gap-2 mb-1.5 px-1", {
                  "flex-row-reverse": message.role === "user",
                })}
              >
                <span className="text-[13px] font-bold text-[#2c3e50] dark:text-zinc-300">
                  {message.role === "user"
                    ? userName || t("common.user", "User")
                    : (message as any).senderName ||
                      roleInfo?.label ||
                      t("common.system_coordinator", "System Coordinator")}
                </span>
                {/* 思考徽章 - 文档 1223 行要求 */}
                {message.role === "assistant" && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-50 text-purple-600 border border-purple-100 animate-in fade-in zoom-in duration-300">
                    <Bot size={10} className="animate-pulse" />
                    {(message as any).status || t("common.thinking", "Thinking")}
                  </span>
                )}
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-medium",
                    message.role === "user"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
                  )}
                >
                  {(message as any).messageType ||
                    (message.role === "user"
                      ? t("common.request", "Request")
                      : t("common.response", "Response"))}
                </span>
              </div>

              {/* 附件显示 */}
              {attachmentsFromMessage.length > 0 && (
                <div
                  className="flex flex-row flex-wrap gap-2 mb-2"
                  data-testid={"message-attachments"}
                >
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
                    return (
                      <MessageReasoning isLoading={isLoading} key={key} reasoning={part.text} />
                    );
                  }

                  if (type === "text") {
                    if (mode === "view") {
                      return (
                        <div key={key} className="mb-2">
                          <MessageContent
                            className={cn(
                              "p-4 shadow-sm transition-all duration-300 text-[14px] leading-relaxed",
                              {
                                "rounded-[18px_18px_4px_18px] text-white border-none shadow-[0_4px_12px_rgba(76,175,131,0.25)]":
                                  message.role === "user",
                                "bg-white dark:bg-zinc-900 border border-[#edf2f7] dark:border-zinc-800 rounded-[18px_18px_18px_4px] text-[#2d3748] dark:text-zinc-200 shadow-sm":
                                  message.role === "assistant",
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
                          <div
                            className={cn("text-[11px] mt-1 px-1 opacity-70", {
                              "text-right text-white/80": message.role === "user",
                              "text-left text-[#888]": message.role === "assistant",
                            })}
                            suppressHydrationWarning
                          >
                            {new Date(
                              message.metadata?.createdAt ||
                                (message as any).createdAt ||
                                Date.now(),
                            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
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
                      />
                    );
                  }

                  if (type === "tool-requestSuggestions") {
                    return (
                      <SuggestionTool isReadonly={isReadonly} key={part.toolCallId} part={part} />
                    );
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
                    type === "tool-skill_analyzer"
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
                                  <div className="text-sm text-muted-foreground italic">
                                    {t("common.noResults", "No results found")}
                                  </div>
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
                                              {t("common.match_score", "Match")}:{" "}
                                              {Math.round(
                                                (f.match_score ?? f.matchingScore ?? 0) *
                                                  ((f.match_score ?? f.matchingScore ?? 0) <= 1
                                                    ? 100
                                                    : 1),
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
                                      {t("common.no_candidates", "No candidates found")}
                                    </div>
                                  );
                                }
                              : type === "tool-skill_analyzer"
                                ? (output: any) =>
                                    output?.analysis || output?.skills ? (
                                      <div className="space-y-2">
                                        <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                          {t("common.analysis", "Analysis")}
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
                                                {t("common.suggested_skills", "Suggested Skills")}:
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
                                        {t("common.analyzing_skills", "Analyzing skills...")}
                                      </div>
                                    )
                                : undefined
                        }
                        title={
                          type === "tool-getProjectRequirements"
                            ? t("tools.getProjectRequirements.label", "Project Requirements")
                            : type === "tool-talent_match"
                              ? t("tools.talent_match.label", "Talent Match")
                              : type === "tool-skill_analyzer"
                                ? t("tools.skill_analyzer.label", "Skill Analysis")
                                : undefined
                        }
                        type={type as any}
                      />
                    );
                  }

                  // Fallback for unknown tools
                  if (type.startsWith("tool-")) {
                    const toolName = type.replace("tool-", "");
                    // Skip known tools that we missed in the big check above but are handled elsewhere?
                    // Actually the loop handles all parts. If we reached here, it's an unhandled tool.
                    // But wait, the `SimpleTool` check above includes `type.startsWith("tool-")`.
                    // So `SimpleTool` acts as the catch-all for `tool-` prefix?
                    // Let's check the logic above.
                    // It says: if ( ... || type.startsWith("tool-") ) { return <SimpleTool ... /> }
                    // So `SimpleTool` IS the fallback.
                    // But `SimpleTool` implementation might not be robust enough for complex objects.
                    // And `ToolInvocation` is better.

                    // I will change the condition above to NOT include `type.startsWith("tool-")` generically,
                    // and instead put the fallback here using `ToolInvocation`.
                    // But I need to be careful not to break existing SimpleTool usages.
                    // The SimpleTool seems to rely on `renderOutput` being passed.
                    // If `renderOutput` is undefined (which it is for unknown tools in the current code), SimpleTool might just render JSON or nothing.

                    // Let's replace the `type.startsWith("tool-")` check in the if condition above with explicit checks,
                    // OR just let it fall through to here by removing that condition.
                  }

                  // New generic fallback
                  if (type.startsWith("tool-")) {
                    const toolName = type.replace("tool-", "");
                    return (
                      <ToolInvocation
                        key={part.toolCallId}
                        toolCallId={part.toolCallId}
                        toolName={toolName}
                        args={part.args}
                        state={part.state === "result" ? "result" : "call"}
                        result={part.result}
                        isReadonly={isReadonly}
                      />
                    );
                  }

                  return null;
                })}
              </div>

              {/* 操作按钮 */}
              {message.role === "assistant" && !isReadonly && (
                <div className="mt-2 opacity-0 group-hover/message:opacity-100 transition-opacity">
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
          </div>
        )}
      </div>
    </div>
  );
};

export const PreviewMessage = memo(PurePreviewMessage, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
  if (prevProps.userId !== nextProps.userId) return false;
  if (prevProps.token !== nextProps.token) return false;
  if (!equal(prevProps.vote, nextProps.vote)) return false;

  return true;
});

export const ThinkingMessage = ({
  token,
  status: initialStatus,
}: {
  token?: string;
  status?: string;
}) => {
  const { t } = useTranslation();
  const { agents } = useChatResources(token);
  const [status, setStatus] = useState(initialStatus || t("common.thinking", "Thinking"));
  const [detailText, setDetailText] = useState(
    t("common.thinking_detail", "Thinking and organizing response..."),
  );

  // 查找项目负责人作为默认智能体
  const projectLeadAgent = agents.find(
    (a: any) =>
      a.identifier?.includes("pm") ||
      a.name?.includes("项目负责人") ||
      a.name?.includes("Project Lead"),
  );

  const roleInfo = getRoleInfo(projectLeadAgent?.id, projectLeadAgent?.name, agents);
  const name = projectLeadAgent?.name || t("common.project_lead", "Project Lead");

  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus);
      return;
    }

    const statuses = [
      {
        badge: t("common.thinking", "Thinking"),
        detail: t("common.thinking_detail", "Thinking and organizing response..."),
      },
      {
        badge: t("common.analyzing", "Analyzing"),
        detail: t("common.analyzing_detail", "Analyzing project requirements..."),
      },
      {
        badge: t("common.searching", "Searching"),
        detail: t("common.searching_detail", "Searching knowledge base..."),
      },
      {
        badge: t("common.generating", "Generating"),
        detail: t("common.generating_detail", "Drafting content for you..."),
      },
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % statuses.length;
      setStatus(statuses[currentIndex].badge);
      setDetailText(statuses[currentIndex].detail);
    }, 3000);

    return () => clearInterval(interval);
  }, [initialStatus, t]);

  return (
    <div
      className="group/message fade-in w-full animate-in duration-500 mb-6"
      data-role="assistant"
      data-testid="message-assistant-loading"
    >
      <div className="flex flex-row items-start gap-4 w-full">
        <div className="flex flex-col items-center">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-white font-bold shadow-md animate-pulse overflow-hidden"
            style={{
              background: roleInfo?.gradient || "linear-gradient(135deg, #607d8b, #455a64)",
            }}
          >
            {roleInfo?.avatar ? (
              isEmoji(roleInfo.avatar) ? (
                <span className="text-xl">{roleInfo.avatar}</span>
              ) : (
                <img src={roleInfo.avatar} alt="" className="size-full object-cover" />
              )
            ) : (
              name.slice(0, 2)
            )}
          </div>
        </div>

        <div className="flex flex-col items-start max-w-[85%] sm:max-w-[75%]">
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-[14px] font-bold text-[#2c3e50] dark:text-zinc-200">{name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#4caf83]/10 text-[#4caf83] border border-[#4caf83]/20 animate-pulse">
              {status}
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-[#edf2f7] dark:border-zinc-800 p-4 rounded-[18px_18px_18px_4px] shadow-sm flex flex-col gap-3 min-w-[200px]">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#4caf83] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-[#4caf83] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-[#4caf83] rounded-full animate-bounce" />
              </div>
              <span className="text-[13px] text-slate-500 dark:text-zinc-400 font-medium">
                {detailText}
              </span>
            </div>

            <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#4caf83] to-[#388e3c] w-1/3 animate-progress-indeterminate rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
