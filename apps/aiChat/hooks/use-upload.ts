
import { useMutation } from '@tanstack/react-query';
import { constructApiUrl } from '@/lib/api';

export function useUpload(token?: string) {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const url = constructApiUrl('/api/v1/files/upload');
      const response = await fetch(url.toString(), {
        method: "POST",
        body: formData,
        headers,
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to upload file');
      }

      return response.json();
    },
  });
}
