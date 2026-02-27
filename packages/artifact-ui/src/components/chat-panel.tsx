"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { memo, type Dispatch, type SetStateAction } from "react";
import type { Attachment, ChatMessage, Vote } from "../lib/types";
import type { VisibilityType } from "./visibility-selector";
import { ArtifactMessages } from "./artifact-messages";
import { ChatHeader } from "./chat-header";
import { MultimodalInput } from "./multimodal-input";

interface ChatPanelProps {
  chatId: string;
  isReadonly: boolean;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  status: UseChatHelpers<ChatMessage>["status"];
  stop: UseChatHelpers<ChatMessage>["stop"];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  votes: Vote[] | undefined;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  title?: string;
  isPinned?: boolean;
  initialProjectId?: string;
  projects?: Array<{ id: string; name: string }>;
  isProjectsLoading?: boolean;
  onTitleUpdate?: (title: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onTogglePin?: () => Promise<void>;
  onAddToProject?: (projectId: string) => Promise<void>;
  onProjectClick: (projectId: string) => void;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  token?: string;
  userId?: string;
  userAvatar?: string;
  userName?: string;
  artifactStatus: UseChatHelpers<ChatMessage>["status"];
}

export const ChatPanel = memo(
  ({
    chatId,
    isReadonly,
    messages,
    setMessages,
    status,
    stop,
    sendMessage,
    regenerate,
    votes,
    input,
    setInput,
    attachments,
    setAttachments,
    title,
    isPinned,
    initialProjectId,
    projects,
    isProjectsLoading,
    onTitleUpdate,
    onDelete,
    onTogglePin,
    onAddToProject,
    onProjectClick,
    selectedModelId,
    selectedVisibilityType,
    token,
    userId,
    userAvatar,
    userName,
    artifactStatus,
  }: ChatPanelProps) => {
    return (
      <div className="flex h-full w-full flex-col items-center justify-between">
        <ChatHeader
          chatId={chatId}
          isReadonly={isReadonly}
          title={title}
          isPinned={isPinned}
          initialProjectId={initialProjectId}
          projects={projects}
          isProjectsLoading={isProjectsLoading}
          onTitleUpdate={onTitleUpdate}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
          onAddToProject={onAddToProject}
          onProjectClick={onProjectClick}
        />

        <ArtifactMessages
          artifactStatus={artifactStatus as any}
          chatId={chatId}
          className="w-full"
          isReadonly={isReadonly}
          messages={messages}
          regenerate={regenerate}
          setMessages={setMessages}
          status={status}
          votes={votes}
          token={token}
          userId={userId}
          userAvatar={userAvatar}
          userName={userName}
        />

        <div className="relative flex w-full flex-row items-end gap-2 px-4 pb-4">
          <MultimodalInput
            attachments={attachments}
            chatId={chatId}
            className="w-full"
            input={input}
            messages={messages}
            selectedModelId={selectedModelId}
            selectedVisibilityType={selectedVisibilityType}
            sendMessage={sendMessage}
            setAttachments={setAttachments}
            setInput={setInput}
            setMessages={setMessages}
            status={status}
            stop={stop}
            projects={projects}
            token={token}
            userId={userId}
          />
        </div>
      </div>
    );
  },
);

ChatPanel.displayName = "ChatPanel";
