"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { AgentCard } from "@uxin/agent-lib";
import { Button } from "@uxin/ui";
import equal from "fast-deep-equal";
import { ArrowDownIcon, Bot, SparklesIcon } from "lucide-react";
import React, { memo } from "react";
import type { Vote, ChatMessage } from "../lib/types";
import { useArtifact } from "../hooks/use-artifact";
import { useChatResources } from "../hooks/use-chat-resources";
import { useMessages } from "../hooks/use-messages";
import { AgentSelection } from "./agent-selection";
import { ThinkingMessage } from "./message";
import { MessageGroup } from "./message-group";

type MessagesProps = {
  chatId: string;
  status: UseChatHelpers<ChatMessage>["status"];
  votes: Vote[] | undefined;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  sendMessage?: UseChatHelpers<ChatMessage>["append"];
  isReadonly: boolean;
  isArtifactVisible: boolean;
  selectedModelId: string;
  onModelChange?: (modelId: string) => void;
  token?: string;
  userId?: string;
  userAvatar?: string;
  userName?: string;
};

function groupMessages(messages: ChatMessage[]) {
  const groups: ChatMessage[][] = [];
  let currentGroup: ChatMessage[] = [];

  messages.forEach((msg, index) => {
    if (index === 0) {
      currentGroup.push(msg);
      return;
    }

    const prevMsg = messages[index - 1];
    const roleMatch = prevMsg.role === msg.role;

    let shouldGroup = roleMatch;

    // 如果是 assistant，检查发送者名称是否一致，不一致则分租
    if (roleMatch && msg.role === "assistant") {
      const prevName = prevMsg.authorName || (prevMsg as any).senderName;
      const currName = msg.authorName || (msg as any).senderName;
      if (prevName !== currName) shouldGroup = false;
    }

    if (shouldGroup) {
      currentGroup.push(msg);
    } else {
      groups.push(currentGroup);
      currentGroup = [msg];
    }
  });

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

function PureMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  regenerate,
  sendMessage,
  isReadonly,
  selectedModelId: _selectedModelId,
  onModelChange,
  token,
  userId,
  userAvatar,
  userName,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    isAtBottom,
    scrollToBottom,
  } = useMessages({
    status,
  });

  const { artifact, chatMetadata } = useArtifact();
  const { agents: allAgents } = useChatResources(token);

  const filteredMessages = React.useMemo(() => {
    if (artifact.isVisible && artifact.messageId) {
      const targetId = artifact.messageId;
      const index = messages.findIndex((m: ChatMessage) => m.id === targetId);
      if (index !== -1) {
        return messages.slice(index);
      }

      return messages.filter((m: ChatMessage) => {
        const msg = m as any;
        const hasDocPreview = msg.annotations?.some(
          (ann: any) => ann.type === "document-preview" && ann.data?.id === artifact.documentId,
        );
        return hasDocPreview || m.id === targetId;
      });
    }
    return messages;
  }, [messages, artifact.isVisible, artifact.messageId, artifact.documentId]);

  const messageGroups = React.useMemo(() => groupMessages(filteredMessages), [filteredMessages]);

  const isEmoji = (str: string | null | undefined) => {
    if (!str) return false;
    return /\p{Emoji}/u.test(str) && str.length <= 8;
  };

  return (
    <div className="relative flex-1">
      <div className="absolute inset-0 touch-pan-y overflow-y-auto" ref={messagesContainerRef}>
        <div className="mx-auto flex min-w-0 max-w-4xl flex-col gap-6 px-4 py-6 md:px-6">
          {filteredMessages.length === 0 && !chatMetadata?.discoverySource && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-6">
                <Bot className="w-12 h-12 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                欢迎使用智能协作系统
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
                系统已启动，全链路工作流就绪。请输入您的需求开始。
              </p>
            </div>
          )}

          {filteredMessages.length === 0 && !chatMetadata?.discoverySource && (
            <AgentSelection onSelect={onModelChange} token={token} />
          )}

          {filteredMessages.length === 0 &&
            chatMetadata?.discoverySource === "agent" &&
            chatMetadata?.selectedAgentId && (
              <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {(() => {
                  const agent = allAgents?.find((a: any) => a.id === chatMetadata.selectedAgentId);
                  if (!agent) return null;
                  return (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                        <Bot className="w-4 h-4 text-primary" />
                        已选智能体
                      </div>
                      <div className="max-w-md">
                        <AgentCard
                          agent={agent}
                          onClick={() => {}}
                          className="border-primary/50 shadow-md cursor-default"
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

          {filteredMessages.length === 0 &&
            chatMetadata?.discoverySource === "app" &&
            chatMetadata?.selectedApp && (
              <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {chatMetadata.selectedApp.agents && chatMetadata.selectedApp.agents.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary" />
                      推荐智能体
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {chatMetadata.selectedApp.agents.map((agent: any) => (
                        <AgentCard
                          key={agent.id}
                          agent={agent}
                          onClick={() => onModelChange?.(agent.id)}
                          className="hover:border-primary/50 transition-all duration-300 hover:shadow-md"
                        />
                      ))}
                    </div>
                  </div>
                )}
                {chatMetadata.selectedApp.mcpTools &&
                  chatMetadata.selectedApp.mcpTools.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4 text-primary" />
                        关联技能
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {chatMetadata.selectedApp.mcpTools.map((tool: any) => (
                          <div
                            key={tool.id || tool.name}
                            className="flex items-center gap-3 px-5 py-3 bg-background border rounded-2xl text-sm shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-default group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              {tool.avatar ? (
                                isEmoji(tool.avatar) ? (
                                  <span className="text-xl">{tool.avatar}</span>
                                ) : (
                                  <img
                                    src={tool.avatar}
                                    alt={tool.name}
                                    className="w-5 h-5 object-contain"
                                  />
                                )
                              ) : (
                                <Bot className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-zinc-800">{tool.name}</span>
                              {tool.description && (
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                  {tool.description}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

          {messageGroups.map((group, index) => (
            <MessageGroup
              key={group[0].id || index}
              chatId={chatId}
              messages={group}
              votes={votes}
              isLoading={status === "streaming" && index === messageGroups.length - 1}
              setMessages={setMessages}
              regenerate={regenerate}
              sendMessage={sendMessage}
              isReadonly={isReadonly}
              token={token}
              userId={userId}
              userAvatar={userAvatar}
              userName={userName}
            />
          ))}

          {(status === "submitted" ||
            (status === "streaming" &&
              filteredMessages.filter((m: ChatMessage) => m.role === "assistant").length ===
                0)) && <ThinkingMessage token={token} />}

          <div className="min-h-[24px] min-w-[24px] shrink-0" ref={messagesEndRef} />
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Scroll to bottom"
        className={`-translate-x-1/2 absolute bottom-4 left-1/2 z-10 rounded-full border bg-background shadow-lg transition-all hover:bg-muted h-9 w-9 ${
          isAtBottom
            ? "pointer-events-none scale-0 opacity-0"
            : "pointer-events-auto scale-100 opacity-100"
        }`}
        onClick={() => scrollToBottom("smooth")}
        type="button"
      >
        <ArrowDownIcon className="size-4" />
      </Button>
    </div>
  );
}

export const Messages = React.memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) {
    return false;
  }
  if (prevProps.selectedModelId !== nextProps.selectedModelId) {
    return false;
  }
  if (prevProps.messages.length !== nextProps.messages.length) {
    return false;
  }
  if (!equal(prevProps.messages, nextProps.messages)) {
    return false;
  }
  if (!equal(prevProps.votes, nextProps.votes)) {
    return false;
  }

  return true;
});
