"use server";

import { generateText, type UIMessage } from "ai";
import { cookies } from "next/headers";
import type { VisibilityType } from "@/components/visibility-selector";
import { titlePrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisibilityById,
  updateChatTitleById,
  deleteChatById,
  toggleChatPinStatusById,
  updateChatProjectIdById,
  updateProject,
} from "@/lib/db/queries";
import { getTextFromMessage } from "@/lib/utils";

export async function updateProjectAction({
  id,
  updates,
}: {
  id: string;
  updates: any;
}) {
  await updateProject({ id, updates });
}

export async function updateChatTitle({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) {
  await updateChatTitleById({ chatId, title });
}

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const { text: title } = await generateText({
    model: myProvider.languageModel("title-model"),
    system: titlePrompt,
    prompt: getTextFromMessage(message) || '新对话',
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const message = await getMessageById({ id });

  if (!message) return;

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function deleteChat({ id }: { id: string }) {
  await deleteChatById({ id });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisibilityById({ chatId, visibility });
}

export async function toggleChatPin({ chatId }: { chatId: string }) {
  return await toggleChatPinStatusById({ chatId });
}

export async function updateChatProject({
  chatId,
  projectId,
}: {
  chatId: string;
  projectId: string | null;
}) {
  await updateChatProjectIdById({ chatId, projectId });
}
