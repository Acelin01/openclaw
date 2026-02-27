import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Bot, Zap, Users } from "lucide-react";

import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/chat";
import type { ChatMessage as ArtifactChatMessage } from "@uxin/artifact-ui";
import { DEFAULT_CHAT_MODEL } from "@/lib/config/models";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { convertToUIMessages } from "@/lib/utils";
import type { AppUsage } from "@/lib/usage";
import { ChatLayoutClient } from "@/components/chat-layout-client";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <Suspense fallback={<div className="flex h-dvh" />}>
      <ChatPage params={params} />
    </Suspense>
  );
}

async function ChatPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get("chat-model");
  const session = await auth();

  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/newChat/${id}`)}`);
  }

  if (chat.visibility === "private") {
    if (!session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb =
    (await getMessagesByChatId({
      id,
    })) || [];

  const uiMessages = convertToUIMessages(messagesFromDb) as any;
  
  const toAppUsage = (data: any): AppUsage | undefined => {
    if (
      data &&
      typeof data === "object" &&
      typeof data.inputTokens === "number" &&
      typeof data.outputTokens === "number" &&
      typeof data.totalTokens === "number"
    ) {
      return data as AppUsage;
    }
    return undefined;
  };

  const initialModel = chatModelFromCookie?.value || DEFAULT_CHAT_MODEL;

  return (
    <ChatLayoutClient user={session.user} session={session}>
      <Chat
        autoResume={true}
        id={chat.id}
        initialChatModel={initialModel}
        initialTitle={chat.title}
        initialIsPinned={chat.isPinned ?? false}
        initialProjectId={chat.projectId ?? undefined}
        initialLastContext={toAppUsage(chat.lastContext)}
        initialMessages={uiMessages as ArtifactChatMessage[]}
        initialVisibilityType={chat.visibility ?? "private"}
        isReadonly={session?.user?.id !== chat.userId}
        isMultiAgent={true}
        initialToken={session?.accessToken}
        userId={session?.user?.id}
      />
    </ChatLayoutClient>
  );
}
