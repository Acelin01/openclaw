"use client";

import { useMemo } from "react";
import { Chat } from "@/components/chat";
import { ChatLayoutClient } from "@/components/chat-layout-client";
import { useCollaborationState } from "@/hooks/use-collaboration-state";
import type { ChatMessage as ArtifactChatMessage } from "@uxin/artifact-ui";

interface ChatCollaborationClientProps {
  chat: any;
  session: any;
  uiMessages: any[];
  initialModel: string;
}

export function ChatCollaborationClient({ chat, session, uiMessages, initialModel }: ChatCollaborationClientProps) {
  const collab = useCollaborationState();
  const initialMessages = useMemo(
    () => uiMessages as ArtifactChatMessage[],
    [uiMessages]
  );

  return (
    <ChatLayoutClient 
      user={session.user} 
      session={session}
      extraHeaderContent={
        <div className="flex items-center gap-3 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
          <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Progress</div>
          <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[#4caf83] to-[#388e3c] transition-all duration-700 ease-out" 
              style={{ width: `${collab.overallProgress}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-white tabular-nums">{collab.overallProgress}%</span>
        </div>
      }
    >
      <Chat
        autoResume={true}
        id={chat.id}
        initialChatModel={initialModel}
        initialTitle={chat.title}
        initialIsPinned={chat.isPinned ?? false}
        initialMessages={initialMessages}
        isReadonly={session?.user?.id !== chat.userId}
        isMultiAgent={true}
        initialToken={session?.accessToken}
        userId={session?.user?.id}
        onAction={(actionType: string) => {
          if (actionType === 'approve') {
            collab.approveRequirement();
          }
          if (actionType === 'start') {
            collab.startExecution();
          }
        }}
      />
    </ChatLayoutClient>
  );
}
