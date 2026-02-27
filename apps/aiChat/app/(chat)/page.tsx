import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Chat } from "@/components/chat";
import { TooltipProvider } from "@uxin/ui";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { DEFAULT_CHAT_MODEL } from "@/lib/config/models";
import { generateUUID } from "@/lib/utils";
import { auth } from "../(auth)/auth";

export default function Page(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense fallback={<div className="flex h-dvh" />}>
      <NewChatPage searchParams={props.searchParams} />
    </Suspense>
  );
}

async function NewChatPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/")}`);
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");
  const params = await searchParams;
  const initialInput = typeof params.content === "string" ? params.content : undefined;
  const initialProjectId = typeof params.projectId === "string" ? params.projectId : undefined;

  if (!modelIdFromCookie) {
    return (
      <TooltipProvider>
        <Chat
          autoResume={false}
          id={id}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialMessages={[]}
          initialVisibilityType="private"
          initialProjectId={initialProjectId}
          isReadonly={false}
          key={id}
          initialInput={initialInput}
          initialToken={session?.accessToken}
          userId={session?.user?.id}
        />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Chat
        autoResume={false}
        id={id}
        initialChatModel={modelIdFromCookie.value}
        initialMessages={[]}
        initialVisibilityType="private"
        initialProjectId={initialProjectId}
        isReadonly={false}
        key={id}
        initialInput={initialInput}
        initialToken={session?.accessToken}
        userId={session?.user?.id}
      />
    </TooltipProvider>
  );
}
