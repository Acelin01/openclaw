import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { constructApiUrl } from '@/lib/api';
import { fetcher } from '@/lib/utils';
import { Vote } from '@/lib/db/schema';

export function useVotes(chatId: string, token?: string, enabled: boolean = true) {
  const queryClient = useQueryClient();

  const votesQuery = useQuery<Vote[]>({
    queryKey: ['votes', chatId],
    queryFn: () => {
      const url = constructApiUrl('/api/v1/vote', { chatId });
      return fetcher([url.toString(), token ?? '']);
    },
    enabled: !!chatId && !!token && enabled,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ messageId, type }: { messageId: string; type: 'up' | 'down' }) => {
      const headers = new Headers({ "Content-Type": "application/json" });
      if (token) headers.set("Authorization", `Bearer ${token}`);
      
      const url = constructApiUrl('/api/v1/vote');
      const res = await fetch(url.toString(), {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ chatId, messageId, type }),
      });
      
      if (!res.ok) throw new Error('Failed to vote');
      // The API might not return the updated vote object, or it might. 
      // Based on original code, it just waits for fetch to complete.
    },
    onMutate: async ({ messageId, type }) => {
      await queryClient.cancelQueries({ queryKey: ['votes', chatId] });
      const previousVotes = queryClient.getQueryData<Vote[]>(['votes', chatId]);

      queryClient.setQueryData<Vote[]>(['votes', chatId], (old) => {
        if (!old) return [];
        const filtered = old.filter(v => v.messageId !== messageId);
        return [...filtered, { chatId, messageId, isUpvoted: type === 'up' }];
      });

      return { previousVotes };
    },
    onError: (err, newVote, context) => {
      queryClient.setQueryData(['votes', chatId], context?.previousVotes);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['votes', chatId] });
    },
  });

  return {
    ...votesQuery,
    vote: voteMutation.mutateAsync,
  };
}
