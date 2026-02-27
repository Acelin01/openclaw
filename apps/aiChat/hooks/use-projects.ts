import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/utils';
import { constructApiUrl } from '@/lib/api';
import { Project } from '@uxin/projects';

export function useProjects(token?: string) {
  return useQuery({
    queryKey: ['projects', token],
    queryFn: async () => {
      const url = constructApiUrl('/api/v1/projects');
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data.projects as Project[];
    },
    enabled: !!token,
  });
}

export function useProject(id: string, token?: string) {
  return useQuery({
    queryKey: ['project', id, token],
    queryFn: async () => {
      if (!id) return null;
      const url = constructApiUrl(`/api/v1/projects/${id}`);
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data as Project;
    },
    enabled: !!id && !!token,
  });
}

export function useUpdateProject(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const url = constructApiUrl(`/api/v1/projects/${id}`);
      const response = await fetch(url.toString(), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useAddProjectMember(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, userId, agentId, role = 'MEMBER' }: { 
      projectId: string; 
      userId?: string; 
      agentId?: string; 
      role?: string 
    }) => {
      const url = constructApiUrl(`/api/v1/projects/${projectId}/members`);
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, agentId, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add project member');
      }

      return response.json();
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
