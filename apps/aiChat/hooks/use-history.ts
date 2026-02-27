import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/utils';
import { constructApiUrl } from '@/lib/api';
import type { Chat, Document } from '@/lib/db/schema';

export type ChatWithDocuments = Chat & { documents: Document[] };

export type ChatHistory = {
  chats: ChatWithDocuments[];
  hasMore: boolean;
};

const PAGE_SIZE = 20;

export function useHistory(token?: string, projectId?: string) {
  const queryClient = useQueryClient();

  const historyQuery = useInfiniteQuery({
    queryKey: projectId ? ['history', projectId, token] : ['history', token],
    queryFn: async ({ pageParam }) => {
      const url = constructApiUrl('/api/v1/history', {
        limit: String(PAGE_SIZE),
        ...(pageParam ? { starting_after: pageParam } : {}),
        ...(projectId ? { project_id: projectId } : {}),
      });
      
      return fetcher([url.toString(), token ?? '']) as Promise<ChatHistory>;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.hasMore === false) return null;
      const lastChat = lastPage.chats.at(-1);
      if (!lastChat) return null;
      return lastChat.id;
    },
    enabled: !!token,
  });

  const pinMutation = useMutation({
    mutationFn: async ({ chatId, isPinned }: { chatId: string; isPinned: boolean }) => {
      const headers = new Headers();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      
      const url = constructApiUrl(`/api/v1/chat/${chatId}`);
      const res = await fetch(url.toString(), {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isPinned }),
      });
      if (!res.ok) throw new Error('Failed to pin chat');
      return { chatId, isPinned };
    },
    onSuccess: ({ chatId, isPinned }) => {
      queryClient.setQueryData(['history'], (data: any) => {
        if (!data) return data;
        return {
          ...data,
          pages: data.pages.map((page: ChatHistory) => ({
            ...page,
            chats: page.chats.map((chat) =>
              chat.id === chatId ? { ...chat, isPinned } : chat
            ),
          })),
        };
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const headers = new Headers();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      const url = constructApiUrl(`/api/v1/chat/${chatId}`);
      const res = await fetch(url.toString(), {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error('Failed to delete chat');
      return chatId;
    },
    onSuccess: (chatId) => {
      queryClient.setQueryData(['history'], (data: any) => {
        if (!data) return data;
        return {
          ...data,
          pages: data.pages.map((page: ChatHistory) => ({
            ...page,
            chats: page.chats.filter((chat) => chat.id !== chatId),
          })),
        };
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ chatId, updates }: { chatId: string; updates: Partial<Chat> }) => {
      const headers = new Headers();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      
      const url = constructApiUrl(`/api/v1/chat/${chatId}`);
      const res = await fetch(url.toString(), {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update chat');
      return { chatId, updates };
    },
    onSuccess: ({ chatId, updates }) => {
      queryClient.setQueryData(['history'], (data: any) => {
        if (!data) return data;
        return {
          ...data,
          pages: data.pages.map((page: ChatHistory) => ({
            ...page,
            chats: page.chats.map((chat) =>
              chat.id === chatId ? { ...chat, ...updates } : chat
            ),
          })),
        };
      });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const headers = new Headers();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      const url = constructApiUrl('/api/v1/history');
      const res = await fetch(url.toString(), {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error('Failed to delete all chats');
    },
    onSuccess: () => {
      queryClient.setQueryData(['history'], (data: any) => {
        if (!data) return data;
        return {
          pages: [{ chats: [], hasMore: false }],
          pageParams: [null],
        };
      });
      // Also invalidate to be sure
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  return {
    ...historyQuery,
    pinChat: pinMutation.mutateAsync,
    deleteChat: deleteMutation.mutateAsync,
    updateChat: updateMutation.mutateAsync,
    deleteAllChats: deleteAllMutation.mutateAsync,
  };
}
