import useSWR from 'swr';
import { constructApiUrl } from '../lib/api';
import { useAuthToken } from './use-auth-token';

const fetcher = async ([url, token]: [string, string | null]) => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Failed to fetch data');
  const json = await res.json();
  return json.data;
};

export function useRecruitmentApplications(role: 'candidate' | 'interviewer') {
  const { token } = useAuthToken();
  const url = constructApiUrl('/api/v1/recruitment/applications', { role });
  const { data, error, mutate, isLoading } = useSWR(
    token ? [url.toString(), token] : null,
    fetcher
  );

  return {
    applications: data,
    isLoading,
    isError: error,
    mutate
  };
}

export function useInterviews(role: 'candidate' | 'interviewer') {
  const { token } = useAuthToken();
  const url = constructApiUrl('/api/v1/recruitment/interviews', { role });
  const { data, error, mutate, isLoading } = useSWR(
    token ? [url.toString(), token] : null,
    fetcher
  );

  return {
    interviews: data,
    isLoading,
    isError: error,
    mutate
  };
}

export function useRecruitmentSettings() {
  const { token } = useAuthToken();
  const url = constructApiUrl('/api/v1/recruitment/settings');
  const { data, error, mutate, isLoading } = useSWR(
    token ? [url.toString(), token] : null,
    fetcher
  );

  return {
    settings: data,
    isLoading,
    isError: error,
    mutate
  };
}

export function useAddresses() {
  const { token } = useAuthToken();
  const url = constructApiUrl('/api/v1/recruitment/addresses');
  const { data, error, mutate, isLoading } = useSWR(
    token ? [url.toString(), token] : null,
    fetcher
  );

  return {
    addresses: data,
    isLoading,
    isError: error,
    mutate
  };
}

export function useTalentMatches(positionId: string) {
  const { token } = useAuthToken();
  const url = constructApiUrl(`/api/v1/recruitment/matches/${positionId}`);
  const { data, error, mutate, isLoading } = useSWR(
    token && positionId ? [url.toString(), token] : null,
    fetcher
  );

  return {
    matches: data,
    isLoading,
    isError: error,
    mutate
  };
}
