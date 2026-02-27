"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import {
  ArtifactComponent,
  artifactDefinitions,
} from "@uxin/artifact-ui";
import type {
  ArtifactKind as UIArtifactKind,
  UIArtifact as UIArtifactType,
} from "@uxin/artifact-ui";
import type {
  ChatMessage as AiChatMessage,
  Attachment,
} from "@/lib/types";
import type { Vote } from "@/lib/db/schema";
import type { VisibilityType } from "./visibility-selector";
import type { ComponentProps, Dispatch, SetStateAction } from "react";
import { getTextFromMessage } from "@/lib/utils";
import { useSession } from "next-auth/react";
import type {
  ChatMessage as UIChatMessage,
  Attachment as UIAttachment,
  Vote as UIVote,
} from "@uxin/artifact-ui";

type Props = {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<any>["status"];
  stop: UseChatHelpers<any>["stop"];
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  messages: AiChatMessage[];
  setMessages: UseChatHelpers<any>["setMessages"];
  votes: Vote[] | undefined;
  sendMessage: UseChatHelpers<any>["sendMessage"];
  regenerate: UseChatHelpers<any>["regenerate"];
  isReadonly: boolean;
  selectedVisibilityType: VisibilityType;
  selectedModelId: string;
  isSidebarOpen?: boolean;
  token?: string;
  title?: string;
  isPinned?: boolean;
  initialProjectId?: string;
  projects?: Array<{ id: string; name: string }>;
  isProjectsLoading?: boolean;
  onTitleUpdate?: (title: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onTogglePin?: () => Promise<void>;
  onAddToProject?: (projectId: string) => Promise<void>;
  onUpdateProject?: (projectId: string, updates: any) => Promise<void>;
};

export function Artifact(props: Props) {
  const {
    attachments,
    messages,
    votes,
    ...rest
  } = props;

  const { data: session } = useSession();
  const currentUser = session?.user;
  const userAvatar = currentUser?.image || undefined;
  const userName = currentUser?.name || undefined;

  const uiMessages: UIChatMessage[] = (messages || []).map((m) => ({
    id: m.id,
    role: m.role,
    content: getTextFromMessage(m),
    parts: m.parts as any,
    createdAt:
      (m as any)?.metadata?.createdAt
        ? new Date((m as any).metadata.createdAt)
        : undefined,
  }));

  const uiVotes: UIVote[] | undefined = votes?.map((v) => ({
    chatId: v.chatId,
    messageId: v.messageId,
    isUpvoted: v.isUpvoted,
  }));

  return (
    <ArtifactComponent
      {...rest}
      attachments={attachments as unknown as UIAttachment[]}
      messages={uiMessages}
      votes={uiVotes}
      userAvatar={userAvatar}
      userName={userName}
    />
  );
}

export type ArtifactKind = UIArtifactKind;
export type UIArtifact = UIArtifactType;
export { artifactDefinitions };
