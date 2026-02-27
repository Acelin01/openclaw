import { constructApiUrl } from "../lib/api";

export async function getSuggestions({ documentId }: { documentId: string }) {
  if (
    documentId === "project-list" ||
    documentId.startsWith("project-") ||
    documentId === "init" ||
    documentId === "new-agent"
  ) {
    return [];
  }
  try {
    const url = constructApiUrl("/api/v1/suggestions", { documentId });
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch suggestions:", error);
    return [];
  }
}
