"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { Bot } from "lucide-react";
import { memo } from "react";
import type { Vote, ChatMessage } from "../lib/types";
import { useChatResources } from "../hooks/use-chat-resources";
import { cn, getRoleInfo } from "../lib/utils";
import { MessageBubble } from "./message-bubble";

const isEmoji = (str: string | null | undefined) => {
  if (!str) return false;
  return /\p{Emoji}/u.test(str) && str.length <= 8;
};

interface MessageGroupProps {
  chatId: string;
  messages: ChatMessage[];
  votes: Vote[] | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  sendMessage?: UseChatHelpers<ChatMessage>["append"];
  isReadonly: boolean;
  token?: string;
  userId?: string;
  userAvatar?: string;
  userName?: string;
}

const PureMessageGroup = ({
  chatId,
  messages,
  votes,
  isLoading,
  setMessages,
  regenerate,
  sendMessage,
  isReadonly,
  token,
  userId,
  userAvatar,
  userName,
}: MessageGroupProps) => {
  const { agents } = useChatResources(token);

  if (!messages.length) return null;

  const firstMessage = messages[0];
  const role = firstMessage.role;
  const isUser = role === "user";

  // 查找项目负责人作为默认智能体
  const projectLeadAgent = agents.find(
    (a: any) => a.identifier?.includes("pm") || a.name?.includes("项目负责人"),
  );

  // 如果没有关联智能体 ID，默认关联项目负责人 ID
  const effectiveId =
    firstMessage.authorAvatar ||
    (firstMessage as any).metadata?.authorAvatar ||
    projectLeadAgent?.id;
  const effectiveName =
    firstMessage.authorName || (firstMessage as any).metadata?.authorName || projectLeadAgent?.name;

  const roleInfo = getRoleInfo(effectiveId, effectiveName, agents);

  const senderName = isUser
    ? userName || "产品经理 (用户)"
    : (firstMessage as any).senderName || roleInfo?.label || "系统协调器";
  const messageType = (firstMessage as any).messageType || (isUser ? "需求提出" : "智能回复");
  const status = (firstMessage as any).status || "思考中";

  return (
    <div
      className={cn(
        "group/message-group flex w-full gap-4 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-full text-white font-bold shadow-sm overflow-hidden",
            isUser ? "bg-[#edf2f7] !text-[#718096] border border-[#e2e8f0]" : "",
          )}
          style={!isUser ? { background: roleInfo?.gradient } : {}}
        >
          {isUser ? (
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
            senderName?.slice(0, 2) || "智"
          )}
        </div>
      </div>

      {/* Content Column */}
      <div
        className={cn("flex flex-col min-w-0 max-w-[85%] sm:max-w-[75%]", {
          "items-end": isUser,
          "items-start": !isUser,
        })}
      >
        {/* Header */}
        <div
          className={cn("flex items-center gap-2 mb-1.5 px-1", {
            "flex-row-reverse": isUser,
          })}
        >
          <span className="text-[13px] font-bold text-[#2c3e50] dark:text-zinc-300">
            {senderName}
          </span>
          {/* 思考徽章 */}
          {!isUser && (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-50 text-purple-600 border border-purple-100 animate-in fade-in zoom-in duration-300">
              <Bot size={10} className="animate-pulse" />
              {status}
            </span>
          )}
          <span
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-medium",
              isUser
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
            )}
          >
            {messageType}
          </span>
          <span className="text-[11px] text-zinc-400 ml-1">
            {new Date(
              firstMessage.metadata?.createdAt || (firstMessage as any).createdAt || Date.now(),
            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Bubbles */}
        <div
          className={cn("flex flex-col w-full gap-2", {
            "items-end": isUser,
            "items-start": !isUser,
          })}
        >
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id || index}
              chatId={chatId}
              message={message}
              vote={votes?.find((vote) => vote.messageId === message.id)}
              isLoading={isLoading && index === messages.length - 1}
              setMessages={setMessages}
              regenerate={regenerate}
              sendMessage={sendMessage}
              isReadonly={isReadonly}
              token={token}
              showActions={index === messages.length - 1}
              isLast={index === messages.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const MessageGroup = memo(PureMessageGroup);
