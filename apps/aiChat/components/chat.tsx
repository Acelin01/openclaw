"use client";

import { Chat as ArtifactChat, type ChatProps as ArtifactChatProps } from "@uxin/artifact-ui";
import { 
  updateChatTitle, 
  deleteChat, 
  toggleChatPin, 
  updateChatProject,
  updateProjectAction 
} from "@/app/(chat)/actions";

export interface ChatProps extends Omit<ArtifactChatProps, 
  'onUpdateChatTitle' | 
  'onDeleteChat' | 
  'onToggleChatPin' | 
  'onUpdateChatProject' | 
  'onUpdateProject'
> {}

export function Chat(props: ChatProps) {
  return (
    <ArtifactChat
      {...props}
      onUpdateChatTitle={async ({ chatId, title }) => {
        await updateChatTitle(chatId, title);
      }}
      onDeleteChat={async ({ id }) => {
        await deleteChat(id);
      }}
      onToggleChatPin={async ({ chatId }) => {
        await toggleChatPin(chatId);
      }}
      onUpdateChatProject={async ({ chatId, projectId }) => {
        await updateChatProject(chatId, projectId);
      }}
      onUpdateProject={async ({ id, updates }) => {
        await updateProjectAction(id, updates);
      }}
    />
  );
}
