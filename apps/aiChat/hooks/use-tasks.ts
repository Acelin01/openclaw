import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/utils';
import { constructApiUrl } from '@/lib/api';

export interface ProjectTask {
  id: string;
  projectId: string;
  requirementId?: string;
  assigneeId?: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  progress: number;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  project?: {
    name: string;
  };
  requirement?: {
    title: string;
  };
}

export interface BackgroundTask {
  id: string;
  type: 'PROJECT_RESUME_MATCHING' | 'RESUME_JOB_APPLICATION' | 'SERVICE_QUOTE_REQUIREMENT';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  priority: number;
  payload?: any;
  result?: any;
  createdAt: string;
  updatedAt: string;
}

export function useProjectTasks(token?: string, status?: string) {
  return useQuery({
    queryKey: ['project-tasks', status],
    queryFn: async () => {
      const url = constructApiUrl('/api/v1/project-tasks', status ? { status } : {});
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data as ProjectTask[];
    },
    enabled: !!token,
  });
}

export function useTaskAnalysis(token?: string) {
  return useQuery({
    queryKey: ['task-analysis'],
    queryFn: async () => {
      const url = constructApiUrl('/api/v1/project-tasks/analysis');
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data;
    },
    enabled: !!token,
  });
}

// Background tasks (Task model in schema)
export function useTasks(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: Partial<BackgroundTask>) => {
      const url = constructApiUrl('/api/v1/tasks');
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Project management tasks (ProjectTask model in schema)
export function useCreateProjectTask(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: Partial<ProjectTask>) => {
      const url = constructApiUrl('/api/v1/project-tasks');
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to create project task');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-analysis'] });
    },
  });
}
