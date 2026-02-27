import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/utils';
import { constructApiUrl } from '@/lib/api';

export interface WorkbenchApp {
  id: string;
  name: string;
  icon: string;
  url: string;
  category: string;
  description?: string;
  sortOrder: number;
}

export interface UserTask {
  id: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  userId: string;
}

export function useWorkbenchApps(token?: string) {
  return useQuery({
    queryKey: ['workbench-apps', token],
    queryFn: async () => {
      const url = constructApiUrl('/api/v1/workbench/apps');
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data as WorkbenchApp[];
    },
    enabled: !!token,
  });
}

export function useUserTasks(token?: string) {
  return useQuery({
    queryKey: ['user-tasks', token],
    queryFn: async () => {
      const url = constructApiUrl('/api/v1/workbench/tasks');
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data as UserTask[];
    },
    enabled: !!token,
  });
}
