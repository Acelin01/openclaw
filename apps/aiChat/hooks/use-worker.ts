import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { constructApiUrl } from '@/lib/api';
import { getAuthToken } from '@/lib/utils';

export function useWorker(userId: string | undefined) {
  return useQuery({
    queryKey: ['worker', userId],
    queryFn: async () => {
      if (!userId) return null;
      const url = constructApiUrl(`/api/v1/workers/profile/${userId}`);
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch worker profile');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!userId,
  });
}

export function useWorkerServices(workerId: string | undefined) {
  return useQuery({
    queryKey: ['worker-services', workerId],
    queryFn: async () => {
      if (!workerId) return [];
      const url = constructApiUrl(`/api/v1/workers/${workerId}/services`);
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch worker services');
      }
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!workerId,
  });
}

export function useWorkerPortfolios(workerId: string | undefined) {
  return useQuery({
    queryKey: ['worker-portfolios', workerId],
    queryFn: async () => {
      if (!workerId) return [];
      const url = constructApiUrl(`/api/v1/workers/${workerId}/portfolios`);
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch worker portfolios');
      }
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!workerId,
  });
}

export function useWorkerQuotations() {
  return useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      const url = constructApiUrl('/api/v1/workers/quotations');
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch quotations');
      }
      const data = await response.json();
      return data.data || [];
    },
  });
}

export function useResumes() {
  return useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const url = constructApiUrl('/api/v1/workers/resumes');
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }
      const data = await response.json();
      return data.data || [];
    },
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const url = constructApiUrl('/api/v1/workers/transactions');
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      return data.data || [];
    },
  });
}

export function useFreelancers(filters?: any) {
  return useQuery({
    queryKey: ['freelancers', filters],
    queryFn: async () => {
      const url = constructApiUrl('/api/v1/workers/profiles', filters);
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch freelancers');
      }
      const data = await response.json();
      return data.data || [];
    },
  });
}

export function useWorkerMutations() {
  const queryClient = useQueryClient();

  const handleAction = async (entity: string, action: 'add' | 'edit' | 'delete', data: any) => {
    let path = `/api/v1/workers/${entity}`;
    let method = 'POST';

    if (action === 'edit') {
      path = `/api/v1/workers/${entity}/${data.id}`;
      method = 'PATCH';
    } else if (action === 'delete') {
      path = `/api/v1/workers/${entity}/${data.id}`;
      method = 'DELETE';
    }

    const url = constructApiUrl(path);

    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: action !== 'delete' ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to ${action} ${entity}`);
    }

    return response.json();
  };

  const serviceMutation = useMutation({
    mutationFn: (variables: { action: 'add' | 'edit' | 'delete', data: any }) => 
      handleAction('services', variables.action, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-services'] });
    }
  });

  const portfolioMutation = useMutation({
    mutationFn: (variables: { action: 'add' | 'edit' | 'delete', data: any }) => 
      handleAction('portfolios', variables.action, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-portfolios'] });
    }
  });

  const quotationMutation = useMutation({
    mutationFn: (variables: { action: 'add' | 'edit' | 'delete', data: any }) => 
      handleAction('quotations', variables.action, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    }
  });

  const resumeMutation = useMutation({
    mutationFn: (variables: { action: 'add' | 'edit' | 'delete', data: any }) => 
      handleAction('resumes', variables.action, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    }
  });

  const transactionMutation = useMutation({
    mutationFn: (variables: { action: 'add' | 'edit' | 'delete', data: any }) => 
      handleAction('transactions', variables.action, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });

  return {
    serviceMutation,
    portfolioMutation,
    quotationMutation,
    resumeMutation,
    transactionMutation
  };
}
