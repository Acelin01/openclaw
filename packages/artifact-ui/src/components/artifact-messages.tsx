import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";
import { useMemo } from "react";
import type { Vote } from "../lib/types";
import type { ChatMessage, UIArtifact } from "../lib/types";
import { useArtifact } from "../hooks/use-artifact";
import { useMessages } from "../hooks/use-messages";
import { cn } from "../lib/utils";
import { PreviewMessage, ThinkingMessage } from "./message";

type ArtifactMessagesProps = {
  chatId: string;
  status: UseChatHelpers<ChatMessage>["status"];
  votes: Vote[] | undefined;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  artifactStatus: UIArtifact["status"];
  className?: string;
  token?: string;
  userId?: string;
  userAvatar?: string;
  userName?: string;
};

function PureArtifactMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  regenerate,
  isReadonly,
  className,
  token,
  userId,
  userAvatar,
  userName,
}: ArtifactMessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  } = useMessages({
    status,
  });

  const { artifact } = useArtifact();

  const filteredMessages = useMemo(() => {
    if (artifact.isVisible && artifact.messageId) {
      // 过滤逻辑：
      // 1. 包含指定的 messageId
      // 2. 或者是之后的消息（如果是连续对话）
      // 3. 或者是包含该文档预览的消息
      const index = messages.findIndex((m: ChatMessage) => m.id === artifact.messageId);
      if (index !== -1) {
        // 如果找到了 messageId，显示该消息及其后的所有消息
        // 这样可以展示从该文档开始的整个后续对话
        return messages.slice(index);
      }

      // 如果没找到对应的 messageId（可能是异步加载问题），尝试通过文档 ID 过滤
      return messages.filter((m: ChatMessage) => {
        const hasDocPreview = (m as any).annotations?.some(
          (ann: any) => ann.type === "document-preview" && ann.data?.id === artifact.documentId,
        );
        return hasDocPreview || m.id === artifact.messageId;
      });
    }
    return messages;
  }, [messages, artifact.isVisible, artifact.messageId, artifact.documentId]);

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center gap-4 overflow-y-scroll px-4 pt-20",
        className,
      )}
      ref={messagesContainerRef}
    >
      {filteredMessages?.map((message, index) => {
        const previousMessage = filteredMessages[index - 1];

        // 获取当前和上一个消息的作者信息
        // 对于智能体消息，我们需要同时考虑触发者(metadata.authorName)和智能体本身(authorName)
        const currentAgentName = message.authorName || (message as any).metadata?.authorName;
        const currentUserName = (message as any).metadata?.authorName;

        const prevAgentName =
          previousMessage?.authorName || (previousMessage as any)?.metadata?.authorName;
        const prevUserName = (previousMessage as any)?.metadata?.authorName;

        const currentAvatar = message.authorAvatar || (message as any).metadata?.authorAvatar;
        const prevAvatar =
          previousMessage?.authorAvatar || (previousMessage as any)?.metadata?.authorAvatar;

        const hideHeader =
          previousMessage &&
          previousMessage.role === message.role &&
          (message.role === "user" ||
            (prevAgentName === currentAgentName &&
              prevUserName === currentUserName &&
              prevAvatar === currentAvatar));

        return (
          <PreviewMessage
            chatId={chatId}
            isLoading={status === "streaming" && index === (filteredMessages?.length || 0) - 1}
            isReadonly={isReadonly}
            key={message.id}
            message={message}
            regenerate={regenerate}
            requiresScrollPadding={hasSentMessage && index === (filteredMessages?.length || 0) - 1}
            setMessages={setMessages}
            hideHeader={hideHeader}
            vote={votes ? votes.find((vote) => vote.messageId === message.id) : undefined}
            token={token}
            userId={userId}
          />
        );
      })}

      <AnimatePresence mode="wait">
        {status === "submitted" && <ThinkingMessage key="thinking" token={token} />}
      </AnimatePresence>

      <motion.div
        className="min-h-[24px] min-w-[24px] shrink-0"
        onViewportEnter={onViewportEnter}
        onViewportLeave={onViewportLeave}
        ref={messagesEndRef}
      />
    </div>
  );
}

function areEqual(prevProps: ArtifactMessagesProps, nextProps: ArtifactMessagesProps) {
  if (prevProps.artifactStatus === "streaming" && nextProps.artifactStatus === "streaming") {
    return true;
  }

  if (prevProps.status !== nextProps.status) {
    return false;
  }
  if (prevProps.status && nextProps.status) {
    return false;
  }
  if ((prevProps.messages?.length || 0) !== (nextProps.messages?.length || 0)) {
    return false;
  }
  if (!equal(prevProps.votes, nextProps.votes)) {
    return false;
  }

  return true;
}

export const ArtifactMessages = memo(PureArtifactMessages, areEqual);
