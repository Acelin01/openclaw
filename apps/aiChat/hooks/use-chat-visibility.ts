'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { updateChatVisibility } from '@/app/(chat)/actions';
import type { VisibilityType } from '@/components/visibility-selector';
import { useMemo } from 'react';
import type { ChatHistory } from './use-history';

export function useChatVisibility({
  chatId,
  initialVisibilityType,
}: {
  chatId: string;
  initialVisibilityType: VisibilityType;
}) {
  const queryClient = useQueryClient();

  // Try to find chat in history cache
  const historyData = queryClient.getQueryData<{ pages: ChatHistory[] }>(['history']);

  const historyChat = useMemo(() => {
    if (!historyData) return null;
    for (const page of historyData.pages) {
      const chat = page.chats.find((c) => c.id === chatId);
      if (chat) return chat;
    }
    return null;
  }, [historyData, chatId]);

  const { data: localVisibility } = useQuery({
    queryKey: ['local-visibility', chatId],
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

  const setVisibilityType = (updatedVisibilityType: VisibilityType) => {
    // Update local state
    queryClient.setQueryData(['local-visibility', chatId], updatedVisibilityType);

    // Update history cache if it exists
    queryClient.setQueryData<{ pages: ChatHistory[] }>(['history'], (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          chats: page.chats.map((chat) =>
            chat.id === chatId
              ? { ...chat, visibility: updatedVisibilityType }
              : chat
          ),
        })),
      };
    });

    // Server action
    updateChatVisibility({
      chatId,
      visibility: updatedVisibilityType,
    });
  };

  return { visibilityType, setVisibilityType };
}
