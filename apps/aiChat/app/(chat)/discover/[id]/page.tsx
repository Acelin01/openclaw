import { db } from "@/lib/db";
import { document, chat, message } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Chat } from "@/components/chat";
import { TooltipProvider } from "@uxin/ui";
import { auth } from "@/app/(auth)/auth";
import { convertToUIMessages } from "@/lib/utils";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const docs = await db
    .select({
      document: document,
      chat: chat,
    })
    .from(document)
    .leftJoin(chat, eq(document.chatId, chat.id))
    .where(eq(document.id, id))
    .limit(1);

  const docData = docs[0];

  if (!docData || !docData.document || !docData.chat) {
    notFound();
  }

  const messagesData = await db
    .select()
    .from(message)
    .where(eq(message.chatId, docData.chat.id))
    .orderBy(asc(message.createdAt));

  const isReadonly = !session?.user;

  // Convert DB messages to UI messages
  const initialMessages = convertToUIMessages(messagesData);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] overflow-hidden">
        <TooltipProvider>
          <Chat
            id={docData.chat.id}
            initialMessages={initialMessages}
            isReadonly={isReadonly}
            userId={session?.user?.id}
            initialToken={session?.accessToken}
            initialChatModel={docData.chat.agentId || 'gpt-4o'} 
            initialVisibilityType={docData.chat.visibility}
            initialTitle={docData.chat.title}
            autoResume={false}
          />
        </TooltipProvider>
    </div>
  );
}
