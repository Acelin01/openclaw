"use server";

import { getSuggestionsByDocumentId } from "@/lib/api";
import { auth } from "@/app/(auth)/auth";

export async function getSuggestions({ documentId }: { documentId: string }) {
  if (documentId === "project-list" || documentId.startsWith("project-") || documentId === "init" || documentId === "new-agent") {
    return [];
  }
  const session = await auth();
  const token = session?.accessToken;
  const suggestions = await getSuggestionsByDocumentId({ documentId, token });
  return suggestions ?? [];
}
