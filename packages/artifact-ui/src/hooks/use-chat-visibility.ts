"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import type { VisibilityType } from "../components/visibility-selector";

export type ChatHistoryItem = {
  id: string;
  visibility: VisibilityType;
  [key: string]: any;
};

export type ChatHistoryPage = {
  chats: ChatHistoryItem[];
  [key: string]: any;
};

export type ChatHistoryData = {
  pages: ChatHistoryPage[];
  pageParams: any[];
};

export function useChatVisibility({
  chatId,
  initialVisibilityType,
  onUpdateVisibility,
}: {
  chatId: string;
  initialVisibilityType: VisibilityType;
  onUpdateVisibility?: (visibility: VisibilityType) => Promise<void>;
}) {
  const queryClient = useQueryClient();

  // Try to find chat in history cache
  const historyData = queryClient.getQueryData<ChatHistoryData>(["history"]);

  const historyChat = useMemo(() => {
    if (!historyData) return null;
    for (const page of historyData.pages) {
      const chat = page.chats.find((c) => c.id === chatId);
      if (chat) return chat;
    }
    return null;
  }, [historyData, chatId]);

  const { data: localVisibility } = useQuery({
    queryKey: ["local-visibility", chatId],
    queryFn: () => initialVisibilityType,
    initialData: initialVisibilityType,
    staleTime: Infinity,
  });

  const visibilityType = useMemo(() => {
    if (historyChat) {
      return historyChat.visibility;
    }
    return localVisibility;
  }, [historyChat, localVisibility]);

  const setVisibilityType = async (updatedVisibilityType: VisibilityType) => {
    // Update local state
    queryClient.setQueryData(["local-visibility", chatId], updatedVisibilityType);

    // Update history cache if it exists
    queryClient.setQueryData<ChatHistoryData>(["history"], (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          chats: page.chats.map((chat) =>
            chat.id === chatId ? { ...chat, visibility: updatedVisibilityType } : chat,
          ),
        })),
      };
    });

    // Server action callback
    if (onUpdateVisibility) {
      await onUpdateVisibility(updatedVisibilityType);
    }
  };

  return { visibilityType, setVisibilityType };
}
