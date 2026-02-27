import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/utils';
import { constructApiUrl } from '@/lib/api';

export interface Schedule {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: 'MEETING' | 'TASK' | 'VIDEO' | 'EVENT';
  location?: string;
  isAllDay: boolean;
  metadata?: any;
  taskId?: string;
  task?: any;
  createdAt: string;
  updatedAt: string;
}

export function useSchedules(token?: string, startTime?: string, endTime?: string) {
  return useQuery({
    queryKey: ['schedules', startTime, endTime],
    queryFn: async () => {
      const url = constructApiUrl('/api/v1/schedules', {
        ...(startTime ? { startTime } : {}),
        ...(endTime ? { endTime } : {}),
      });
      
      const res: any = await fetcher([url.toString(), token ?? '']);
      return res.data as Schedule[];
    },
    enabled: !!token,
  });
}

export function useCreateSchedule(token?: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Schedule>) => {
      const url = constructApiUrl('/api/v1/schedules');
      const res: any = await fetcher([url.toString(), token ?? ''], {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.data as Schedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}

export function useUpdateSchedule(token?: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Schedule> & { id: string }) => {
      const url = constructApiUrl(`/api/v1/schedules/${id}`);
      const res: any = await fetcher([url.toString(), token ?? ''], {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.data as Schedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}

export function useDeleteSchedule(token?: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const url = constructApiUrl(`/api/v1/schedules/${id}`);
      const res: any = await fetcher([url.toString(), token ?? ''], {
        method: 'DELETE',
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}
