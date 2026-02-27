import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/utils';
import { constructApiUrl } from '@/lib/api';
import { Iteration } from '@uxin/iteration-lib';

export function useIterations(projectId: string, token?: string) {
  return useQuery({
    queryKey: ['iterations', projectId, token],
    queryFn: async () => {
      if (!projectId) return [];
      const url = constructApiUrl(`/api/v1/iterations/project/${projectId}`);
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data as Iteration[];
    },
    enabled: !!projectId && !!token,
  });
}

export function useIteration(id: string, token?: string) {
  return useQuery({
    queryKey: ['iteration', id, token],
    queryFn: async () => {
      if (!id) return null;
      const url = constructApiUrl(`/api/v1/iterations/${id}`);
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data as Iteration;
    },
    enabled: !!id && !!token,
  });
}

export function useIterationWorkItems(id: string, token?: string) {
  return useQuery({
    queryKey: ['iteration-work-items', id, token],
    queryFn: async () => {
      if (!id) return [];
      const url = constructApiUrl(`/api/v1/iterations/${id}/work-items`);
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data;
    },
    enabled: !!id && !!token,
  });
}

export function useIterationComments(id: string, token?: string) {
  return useQuery({
    queryKey: ['iteration-comments', id, token],
    queryFn: async () => {
      if (!id) return [];
      const url = constructApiUrl(`/api/v1/iterations/${id}/comments`);
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data;
    },
    enabled: !!id && !!token,
  });
}

export function useIterationActivities(id: string, token?: string) {
  return useQuery({
    queryKey: ['iteration-activities', id, token],
    queryFn: async () => {
      if (!id) return [];
      const url = constructApiUrl(`/api/v1/iterations/${id}/activities`);
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data;
    },
    enabled: !!id && !!token,
  });
}

export function useCreateIteration(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const url = constructApiUrl('/api/v1/iterations');
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create iteration');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: ['iterations', variables.projectId] });
        queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      }
    },
  });
}

export function useAddIterationComment(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ iterationId, content }: { iterationId: string; content: string }) => {
      const url = constructApiUrl('/api/v1/iterations/comments');
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ iterationId, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['iteration', variables.iterationId] });
      queryClient.invalidateQueries({ queryKey: ['iteration-comments', variables.iterationId] });
    },
  });
}

export function useAssignWorkItemToIteration(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ iterationId, itemId, type }: { iterationId: string; itemId: string; type: string }) => {
      const url = constructApiUrl(`/api/v1/iterations/${iterationId}/work-items`);
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId, type }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign work item');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['iteration', variables.iterationId] });
      queryClient.invalidateQueries({ queryKey: ['iteration-work-items', variables.iterationId] });
      // Invalidate project queries to update backlog
      queryClient.invalidateQueries({ queryKey: ['project'] }); 
    },
  });
}

export function useRemoveWorkItemFromIteration(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ iterationId, itemId, type }: { iterationId: string; itemId: string; type: string }) => {
      const url = constructApiUrl(`/api/v1/iterations/${iterationId}/work-items/${itemId}`, { type });
      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove work item');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['iteration', variables.iterationId] });
      queryClient.invalidateQueries({ queryKey: ['iteration-work-items', variables.iterationId] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

export function useUpdateIteration(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const url = constructApiUrl(`/api/v1/iterations/${id}`);
      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update iteration');
      }

      return response.json();
    },
    onSuccess: (data) => {
      const iteration = data.data;
      if (iteration?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['iterations', iteration.projectId] });
        queryClient.invalidateQueries({ queryKey: ['project', iteration.projectId] });
        queryClient.invalidateQueries({ queryKey: ['iteration', iteration.id] });
      }
    },
  });
}

export function useDeleteIteration(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const url = constructApiUrl(`/api/v1/iterations/${id}`);
      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete iteration');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // We don't have project ID here easily unless returned by delete
      // Just invalidate all iterations for now or assume we are in a project context
      queryClient.invalidateQueries({ queryKey: ['iterations'] });
    },
  });
}

export function useCreateIterationComment(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const url = constructApiUrl('/api/v1/iterations/comments');
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create comment');
      }

      return response.json();
    },
    onSuccess: (data) => {
      const comment = data.data;
      if (comment?.iterationId) {
        queryClient.invalidateQueries({ queryKey: ['iteration-comments', comment.iterationId] });
      }
    },
  });
}

export function useUpdateIterationWorkItemsStatus(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, itemIds, status }: { id: string; itemIds: string[]; status: string }) => {
      const url = constructApiUrl(`/api/v1/iterations/${id}/work-items/status`);
      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ itemIds, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update work items status');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['iteration-work-items', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['iteration', variables.id] });
    },
  });
}
