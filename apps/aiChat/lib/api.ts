
import { constructApiUrl, getApiBaseUrl } from "@uxin/artifact-ui";

export { constructApiUrl, getApiBaseUrl };

export async function getSuggestionsByDocumentId({ documentId, token }: { documentId: string, token?: string }) {
  if (documentId === "project-list" || documentId.startsWith("project-") || documentId === "init" || documentId === "new-agent") {
    return [];
  }
  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = constructApiUrl('/api/v1/suggestions', { documentId });
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('API getSuggestionsByDocumentId failed:', error);
    return [];
  }
}
