import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/chat";
import type { ChatMessage as ArtifactChatMessage } from "@uxin/artifact-ui";
import { DEFAULT_CHAT_MODEL } from "@/lib/config/models";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { convertToUIMessages } from "@/lib/utils";
import type { AppUsage } from "@/lib/usage";
import { ChatCollaborationClient } from "../chat-collaboration-client";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const resolvedParams = await props.params;
  const { id } = resolvedParams;

  if (!id) {
    redirect('/');
  }

  const chat = await getChatById({ id });
  if (!chat) notFound();

  const session = await auth();
  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/chat1/${id}`)}`);
  }

  const messagesFromDb = await getMessagesByChatId({ id }) || [];
  const uiMessages = convertToUIMessages(messagesFromDb) as any;
  
  const cookieStore = await cookies();
  const initialModel = cookieStore.get("chat-model")?.value || DEFAULT_CHAT_MODEL;

  return (
    <Suspense fallback={<div className="flex h-dvh bg-[#f9fbfd] dark:bg-zinc-950" />}>
      <ChatCollaborationClient 
        chat={chat} 
        session={session} 
        uiMessages={uiMessages} 
        initialModel={initialModel} 
      />
    </Suspense>
  );
}
