import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/utils';
import { constructApiUrl } from '@/lib/api';

export interface Skill {
  id: string;
  mcpToolId: string;
  name: string;
  description: string | null;
  parameters: any;
  createdAt: string;
  updatedAt: string;
  mcpTool?: {
    id: string;
    name: string;
  };
}

export function useSkills(params: { mcpToolId?: string; search?: string } = {}, token?: string) {
  return useInfiniteQuery({
    queryKey: ['skills', params, token],
    queryFn: async ({ pageParam = 1 }) => {
      const url = constructApiUrl('/api/v1/skills', {
        ...(params.mcpToolId ? { mcpToolId: params.mcpToolId } : {}),
        ...(params.search ? { search: params.search } : {}),
        page: String(pageParam),
        limit: '20',
      });
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data as Skill[];
    },
    getNextPageParam: (lastPage: any[], allPages: any[]) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!token,
  });
}

export function useSkill(id: string, token?: string) {
  return useQuery({
    queryKey: ['skill', id, token],
    queryFn: async () => {
      if (!id) return null;
      const url = constructApiUrl(`/api/v1/skills/${id}`);
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data as Skill;
    },
    enabled: !!id && !!token,
  });
}

export function useCreateSkill(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const url = constructApiUrl('/api/v1/skills');
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
        throw new Error(error.message || 'Failed to create skill');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}

export function useUpdateSkill(id: string, token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const url = constructApiUrl(`/api/v1/skills/${id}`);
      const response = await fetch(url.toString(), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update skill');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill', id] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}

export function useDeleteSkill(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const url = constructApiUrl(`/api/v1/skills/${id}`);
      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete skill');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}
