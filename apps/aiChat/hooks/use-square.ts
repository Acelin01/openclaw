
import { useQuery } from '@tanstack/react-query';
import { constructApiUrl } from '@/lib/api';
import { fetcher } from '@/lib/utils';
import { SquareService, SquareWorker } from '@uxin/square';
import { transformFeaturedWorkerServer, transformSearchServiceServer, transformServiceDetail, transformWorkerDetail } from '@/lib/transformers';

export function useFeaturedWorkers() {
  return useQuery<SquareWorker[]>({
    queryKey: ['square', 'workers', 'featured'],
    queryFn: async () => {
      const url = constructApiUrl('/api/v1/marketplace/workers/featured');
      const data = await fetcher(url.toString());
      const payload = data?.data ?? data?.workers ?? data?.items ?? data;
      return Array.isArray(payload) ? payload.map(transformFeaturedWorkerServer) : [];
    },
  });
}

export function useSearchServices(limit: number = 12) {
  return useQuery<SquareService[]>({
    queryKey: ['square', 'services', 'search', limit],
    queryFn: async () => {
      const url = constructApiUrl('/api/v1/search/services', { limit: String(limit) });
      const data = await fetcher(url.toString());
      const payload = data?.data?.services ?? data?.services ?? data?.items ?? data;
      return Array.isArray(payload) ? payload.map(transformSearchServiceServer) : [];
    },
  });
}

export function useServiceDetail(id: string) {
  return useQuery<SquareService>({
    queryKey: ['square', 'service', id],
    queryFn: async () => {
      const url = constructApiUrl(`/api/v1/marketplace/services/${id}`);
      const data = await fetcher(url.toString());
      const s = data?.data ?? data;
      return transformServiceDetail(s);
    },
    enabled: !!id,
  });
}

export function useWorkerDetail(id: string) {
  return useQuery<SquareWorker>({
    queryKey: ['square', 'worker', id],
    queryFn: async () => {
      const url = constructApiUrl(`/api/v1/public/users/${id}`);
      const data = await fetcher(url.toString());
      const u = data?.data ?? data;
      return transformWorkerDetail(u);
    },
    enabled: !!id,
  });
}
