import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/chat";
import type { ChatMessage as ArtifactChatMessage } from "@uxin/artifact-ui";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { DEFAULT_CHAT_MODEL } from "@/lib/config/models";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { convertToUIMessages } from "@/lib/utils";
import type { AppUsage } from "@/lib/usage";

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
    redirect(`/login?callbackUrl=${encodeURIComponent(`/chat/${id}`)}`);
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

  const hasUserMessage = Array.isArray(messagesFromDb) && messagesFromDb.some((m: any) => m?.role === "user");
  const hasAssistantMessage = Array.isArray(messagesFromDb) && messagesFromDb.some((m: any) => m?.role === "assistant");
  const hasToolActivity =
    Array.isArray(messagesFromDb) &&
    messagesFromDb.some(
      (m: any) =>
        Array.isArray(m?.parts) &&
        m.parts.some(
          (p: any) =>
            p?.type === "tool-createDocument" ||
            p?.type === "tool-updateDocument" ||
            p?.type === "tool-requestSuggestions" ||
            p?.type === "tool-startCollaboration"
        )
    );
  
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

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          autoResume={true}
          id={chat.id}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialTitle={chat.title}
          initialIsPinned={chat.isPinned ?? false}
          initialProjectId={chat.projectId ?? undefined}
          initialLastContext={toAppUsage(chat.lastContext)}
          initialMessages={uiMessages as ArtifactChatMessage[]}
          initialVisibilityType={chat.visibility ?? "private"}
          isReadonly={session?.user?.id !== chat.userId}
          initialToken={session?.accessToken}
          userId={session?.user?.id}
        />
      </>
    );
  }

  return (
    <>
      <Chat
        autoResume={true}
        id={chat.id}
        initialChatModel={chatModelFromCookie.value}
        initialTitle={chat.title}
        initialIsPinned={chat.isPinned ?? false}
        initialProjectId={chat.projectId ?? undefined}
        initialLastContext={toAppUsage(chat.lastContext)}
        initialMessages={uiMessages as any}
        initialVisibilityType={chat.visibility ?? "private"}
        isReadonly={session?.user?.id !== chat.userId}
        initialToken={session?.accessToken}
        userId={session?.user?.id}
      />
    </>
  );
}
