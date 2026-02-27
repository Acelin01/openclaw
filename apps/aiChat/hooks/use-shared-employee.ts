import { useQuery } from '@tanstack/react-query';
import { constructApiUrl } from '@/lib/api';
import { getAuthToken } from '@/lib/utils';
import { SharedEmployee, SharedEmployeeStats } from '@uxin/shared-employee';

export function useSharedEmployees() {
  return useQuery({
    queryKey: ['shared-employees'],
    queryFn: async () => {
      const url = constructApiUrl('/api/v1/shared-employees');
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch shared employees');
      }
      const data = await response.json();
      return data.data as SharedEmployee[];
    },
  });
}

export function useSharedEmployee(id: string | undefined) {
  return useQuery({
    queryKey: ['shared-employee', id],
    queryFn: async () => {
      if (!id) return null;
      const url = constructApiUrl(`/api/v1/shared-employees/${id}`);
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch shared employee');
      }
      const data = await response.json();
      return data.data as SharedEmployee;
    },
    enabled: !!id,
  });
}

export function useSharedEmployeeStats() {
  return useQuery({
    queryKey: ['shared-employee-stats'],
    queryFn: async () => {
      const url = constructApiUrl('/api/v1/shared-employees/stats');
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch shared employee stats');
      }
      const data = await response.json();
      return data.data as SharedEmployeeStats;
    },
  });
}
