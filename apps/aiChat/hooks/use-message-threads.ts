'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthToken } from '@/hooks/use-auth-token';
import { constructApiUrl } from '@/lib/api';
import { fetcher } from '@/lib/utils';

export type MessageThread = {
  id: string;
  title: string;
  preview: string;
  lastTime: string | Date;
  online: boolean;
  context: any;
  unreadCount: number;
};

export function useMessageThreads() {
  const { token } = useAuthToken();
  const key = ['message-threads', token];
  const url = constructApiUrl('/api/v1/messages');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const json = await fetcher([url.toString(), token || '']);
      return json?.data as { threads: MessageThread[]; unreadTotal: number };
    },
    staleTime: 60_000,
    enabled: !!token,
  });
  return {
    threads: data?.threads || [],
    unreadTotal: data?.unreadTotal || 0,
    isLoading,
    isError,
    refetch,
  };
}

export function useConversationMessages(conversationId?: string) {
  const { token } = useAuthToken();
  const key = ['conversation-messages', conversationId, token];
  const url = conversationId
    ? constructApiUrl(`/api/v1/messages/${conversationId}`)
    : undefined;
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: key,
    queryFn: async () => {
      if (!url) return [];
      const json = await fetcher([url.toString(), token || '']);
      return Array.isArray(json?.data) ? json.data : [];
    },
    enabled: !!conversationId,
    staleTime: 30_000,
  });
  return {
    messages: data || [],
    isLoading,
    isError,
    refetch,
  };
}

export async function markConversationAsRead(chatId: string, token?: string) {
  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const url = constructApiUrl(`/api/v1/messages/${chatId}/read`);
    const res = await fetch(url.toString(), {
      method: 'PUT',
      headers,
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}
