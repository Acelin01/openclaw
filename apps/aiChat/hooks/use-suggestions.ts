import { useQuery } from '@tanstack/react-query';
import { getSuggestionsByDocumentId } from '@/lib/api';

export function useSuggestions(documentId: string | undefined, token?: string) {
  return useQuery({
    queryKey: ['suggestions', documentId],
    queryFn: async () => {
      if (!documentId) return [];
      return getSuggestionsByDocumentId({ documentId, token });
    },
    enabled: !!documentId && !!token && documentId !== "project-list" && !documentId.startsWith("project-") && documentId !== "init" && documentId !== "new-agent",
  });
}
