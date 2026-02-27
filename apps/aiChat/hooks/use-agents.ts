import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/utils';
import { constructApiUrl } from '@/lib/api';
import { Agent, MCPTool, AIApp } from '@uxin/mcp';

export function useAgents(params: { userId?: string; projectId?: string; identifier?: string } = {}, token?: string) {
  return useInfiniteQuery({
    queryKey: ['agents', params, token],
    queryFn: async ({ pageParam = 1 }) => {
      const url = constructApiUrl('/api/v1/agents', {
        ...(params.userId ? { userId: params.userId } : {}),
        ...(params.projectId ? { projectId: params.projectId } : {}),
        ...(params.identifier ? { identifier: params.identifier } : {}),
        page: String(pageParam),
        limit: '20',
      });
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data as Agent[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!token,
  });
}

export function useAgent(id: string, token?: string) {
  return useQuery({
    queryKey: ['agent', id, token],
    queryFn: async () => {
      if (!id) return null;
      const url = constructApiUrl(`/api/v1/agents/${id}`);
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data as Agent;
    },
    enabled: !!id && !!token,
  });
}

export function useMCPTools(params: { isBuiltIn?: boolean; creatorId?: string; search?: string } = {}, token?: string) {
  return useInfiniteQuery({
    queryKey: ['mcp-tools', params, token],
    queryFn: async ({ pageParam = 1 }) => {
      const url = constructApiUrl('/api/v1/mcp-tools', {
        ...(params.isBuiltIn !== undefined ? { isBuiltIn: String(params.isBuiltIn) } : {}),
        ...(params.creatorId ? { creatorId: params.creatorId } : {}),
        ...(params.search ? { search: params.search } : {}),
        page: String(pageParam),
        limit: '20',
      });
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data as MCPTool[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!token,
  });
}

export function useMCPTool(id: string, token?: string) {
  return useQuery({
    queryKey: ['mcp-tool', id, token],
    queryFn: async () => {
      if (!id) return null;
      const url = constructApiUrl(`/api/v1/mcp-tools/${id}`);
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data as MCPTool;
    },
    enabled: !!id && !!token,
  });
}

export function useAIApps(params: { status?: string; type?: string; search?: string } = {}, token?: string) {
  return useInfiniteQuery({
    queryKey: ['ai-apps', params, token],
    queryFn: async ({ pageParam = 1 }) => {
      const url = constructApiUrl('/api/v1/ai-apps', {
        ...(params.status ? { status: params.status } : {}),
        ...(params.type ? { type: params.type } : {}),
        ...(params.search ? { search: params.search } : {}),
        page: String(pageParam),
        limit: '20',
      });
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data as AIApp[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!token,
  });
}

export function useUserAIApps(token?: string) {
  return useQuery({
    queryKey: ['user-ai-apps', token],
    queryFn: async () => {
      const url = constructApiUrl('/api/v1/ai-apps/user');
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data as any[]; // Array of UserAIApp with app details
    },
    enabled: !!token,
  });
}

export function useAddUserAIApp(token?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ appId, isDefault }: { appId: string; isDefault?: boolean }) => {
      const url = constructApiUrl('/api/v1/ai-apps/user');
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ appId, isDefault }),
      });
      if (!response.ok) throw new Error('Failed to add app');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-ai-apps'] });
    },
  });
}

export function useCreateAgent(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const url = constructApiUrl('/api/v1/agents');
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
        throw new Error(error.message || 'Failed to create agent');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useUpdateAgent(id: string, token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const url = constructApiUrl(`/api/v1/agents/${id}`);
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
        throw new Error(error.message || 'Failed to update agent');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}
