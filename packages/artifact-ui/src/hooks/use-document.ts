import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { isAfter } from "date-fns";
import type { ArtifactDocument } from "../lib/types";
import { constructApiUrl } from "../lib/api";
import { fetcher } from "../lib/utils";

export function useDocument(id: string | undefined, token?: string) {
  const queryClient = useQueryClient();

  const documentQuery = useQuery<ArtifactDocument[]>({
    queryKey: ["document", id],
    queryFn: async () => {
      const url = constructApiUrl("/api/v1/document", { id: id! });
      const result = await fetcher([url.toString(), token ?? ""]);
      if (Array.isArray(result)) {
        return result as ArtifactDocument[];
      }
      if (result && typeof result === "object" && "id" in result) {
        return [result as ArtifactDocument];
      }
      if (
        result &&
        typeof result === "object" &&
        "success" in result &&
        Array.isArray((result as any).data)
      ) {
        return (result as any).data as ArtifactDocument[];
      }
      return [];
    },
    enabled:
      !!id &&
      !!token &&
      !id.startsWith("agent-") &&
      !id.startsWith("app-") &&
      id !== "project-list",
  });

  const restoreMutation = useMutation({
    mutationFn: async ({ documentId, timestamp }: { documentId: string; timestamp: string }) => {
      const headers = new Headers();
      if (token) headers.set("Authorization", `Bearer ${token}`);

      const url = constructApiUrl("/api/v1/document", { id: documentId, timestamp });
      const res = await fetch(url.toString(), {
        method: "DELETE",
        headers,
      });

      if (!res.ok) throw new Error("Failed to restore version");
      return res.json();
    },
    onMutate: async ({ documentId, timestamp }) => {
      await queryClient.cancelQueries({ queryKey: ["document", documentId] });
      const previousDocuments = queryClient.getQueryData<ArtifactDocument[]>([
        "document",
        documentId,
      ]);

      queryClient.setQueryData<ArtifactDocument[]>(["document", documentId], (old) => {
        if (!old) return [];
        return old.filter(
          (document) => !isAfter(new Date(document.createdAt), new Date(timestamp)),
        );
      });

      return { previousDocuments };
    },
    onError: (err, variables, context) => {
      if (context?.previousDocuments) {
        queryClient.setQueryData(["document", variables.documentId], context.previousDocuments);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["document", variables.documentId] });
    },
  });

  return {
    ...documentQuery,
    restoreVersion: restoreMutation.mutateAsync,
  };
}

export function usePublicDocuments(kind?: string) {
  return useInfiniteQuery({
    queryKey: ["public-documents", kind],
    queryFn: async ({ pageParam = 1 }) => {
      const url = constructApiUrl("/api/v1/document/public", {
        ...(kind ? { kind } : {}),
        page: String(pageParam),
        limit: "20",
      });

      const res: any = await fetcher(url.toString());
      // fetcher 已经处理了 success 检查并返回了 result.data (如果是数组)
      // 如果 res 是数组，直接返回；否则如果 res 是对象且有 data 属性，返回 res.data
      return Array.isArray(res) ? res : res?.data || [];
    },
    getNextPageParam: (lastPage, allPages) => {
      return (lastPage as any[]).length === 20 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
