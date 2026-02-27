"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ArtifactDocument } from "../lib/types";
import {
  getProject,
  updateProject,
  createProject,
  getDocuments,
  updateDocument,
  getChatDocuments,
  updateDocumentStatus,
  batchUpdateDocumentStatus,
  getChatByDocumentId,
} from "../lib/api";

export function useChatDocuments(token: string | undefined, chatId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery<ArtifactDocument[]>({
    queryKey: ["chat-documents", chatId, token],
    queryFn: async () => {
      if (!chatId) return [];
      const res = await getChatDocuments(token, chatId);
      return res.success ? res.data : [];
    },
    enabled: !!chatId && !!token,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "PENDING" | "APPROVED" | "REJECTED" }) => {
      return updateDocumentStatus(token, id, status);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["chat-documents", chatId, token] });
      }
    },
  });

  const batchUpdateStatusMutation = useMutation({
    mutationFn: ({ status }: { status: "PENDING" | "APPROVED" | "REJECTED" }) => {
      if (!chatId) throw new Error("Chat ID is required");
      return batchUpdateDocumentStatus(token, chatId, status);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["chat-documents", chatId, token] });
      }
    },
  });

  return {
    documents: query.data ?? [],
    isLoading: query.isLoading,
    updateDocumentStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    batchUpdateDocumentStatus: batchUpdateStatusMutation.mutateAsync,
    isBatchUpdating: batchUpdateStatusMutation.isPending,
  };
}

export function useProjectDetail(token: string | undefined, projectId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["project", projectId, token],
    queryFn: async () => {
      if (!projectId) return null;
      const res = await getProject(token, projectId);
      return res.success ? res.data : null;
    },
    enabled: !!projectId && !!token,
  });

  const mutation = useMutation({
    mutationFn: (updates: Record<string, any>) => {
      if (!projectId) throw new Error("Project ID is required");
      return updateProject(token, projectId, updates);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(["project", projectId, token], (old: any) => {
          if (!old) return data.data;
          return { ...old, ...data.data };
        });
        // Also invalidate to be sure
        queryClient.invalidateQueries({ queryKey: ["project", projectId, token] });
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      return createProject(token, data);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["project", null, token] });
        queryClient.invalidateQueries({ queryKey: ["projects", token] });
      }
    },
  });

  return {
    project: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    updateProject: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    createProject: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}

export function useChatByDocumentId(token: string | undefined, documentId: string | null) {
  const query = useQuery({
    queryKey: ["chat-by-document", documentId, token],
    queryFn: async () => {
      if (!documentId) return null;
      const res = await getChatByDocumentId(token, documentId);
      return res.success ? res.data : null;
    },
    enabled:
      !!documentId &&
      !documentId.startsWith("agent-") &&
      !documentId.startsWith("app-") &&
      documentId !== "project-list",
  });

  return {
    chat: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

export function useArtifactDocuments(token: string | undefined, documentId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery<ArtifactDocument[]>({
    queryKey: ["documents", documentId, token],
    queryFn: async () => {
      if (!documentId) return [];
      const res = await getDocuments(token, documentId);
      // Ensure we return an array, based on current artifact.tsx expectation
      return Array.isArray(res) ? res : res.success && Array.isArray(res.data) ? res.data : [];
    },
    enabled:
      !!documentId &&
      !!token &&
      documentId !== "init" &&
      !documentId.startsWith("agent-") &&
      !documentId.startsWith("project-") &&
      !documentId.startsWith("app-"),
  });

  const mutation = useMutation({
    mutationFn: (payload: { title?: string; content: string; kind: string }) => {
      if (!documentId) throw new Error("Document ID is required");
      return updateDocument(token, documentId, payload);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["documents", documentId, token] });
      }
    },
  });

  return {
    documents: query.data ?? [],
    isLoading: query.isLoading,
    updateDocument: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
