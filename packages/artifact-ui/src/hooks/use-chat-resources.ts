"use client";

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRequirements,
  getTasks,
  getAgents,
  getAIApps,
  getMCPTools,
  getPublicDocuments,
  getUserAIApps,
  addUserAIApp,
} from "../lib/api";

export function useChatResources(token?: string) {
  const queryClient = useQueryClient();

  const requirementsQuery = useQuery({
    queryKey: ["requirements", token],
    queryFn: async () => {
      const res = await getRequirements(token);
      return res.success ? res.data : [];
    },
    enabled: !!token,
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks", "mine", token],
    queryFn: async () => {
      const res = await getTasks(token, { mine: "true" });
      return res.success ? res.data : [];
    },
    enabled: !!token,
  });

  const agentsQuery = useInfiniteQuery({
    queryKey: ["agents", token],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getAgents(token, { page: String(pageParam), limit: "20" });
      return res.success ? res.data : [];
    },
    getNextPageParam: (lastPage: any[], allPages: any[]) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    // Remove enabled: !!token to allow public agents to be fetched without a token
  });

  const appsQuery = useInfiniteQuery({
    queryKey: ["ai-apps", token],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getAIApps(token, { page: String(pageParam), limit: "20" });
      return res.success ? res.data : [];
    },
    getNextPageParam: (lastPage: any[], allPages: any[]) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    // Remove enabled: !!token to allow public apps to be fetched without a token
  });

  const toolsQuery = useInfiniteQuery({
    queryKey: ["mcp-tools", token],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getMCPTools(token, { page: String(pageParam), limit: "20" });
      return res.success ? res.data : [];
    },
    getNextPageParam: (lastPage: any[], allPages: any[]) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    // Remove enabled: !!token to allow public tools to be fetched without a token
  });

  const publicDocsQuery = useInfiniteQuery({
    queryKey: ["public-documents"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getPublicDocuments({ page: String(pageParam), limit: "20" });
      return res.success ? res.data : [];
    },
    getNextPageParam: (lastPage: any[], allPages: any[]) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const userAppsQuery = useQuery({
    queryKey: ["user-ai-apps", token],
    queryFn: async () => {
      const res = await getUserAIApps(token);
      return res.success ? res.data : [];
    },
    enabled: !!token,
  });

  const addAppMutation = useMutation({
    mutationFn: async ({ appId, isDefault }: { appId: string; isDefault?: boolean }) => {
      if (!token) throw new Error("No token");
      return addUserAIApp(token, { appId, isDefault });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-ai-apps"] });
    },
  });

  return {
    requirements: requirementsQuery.data ?? [],
    tasks: tasksQuery.data ?? [],
    agents: agentsQuery.data?.pages.flat() ?? [],
    apps: appsQuery.data?.pages.flat() ?? [],
    tools: toolsQuery.data?.pages.flat() ?? [],
    publicDocuments: publicDocsQuery.data?.pages.flat() ?? [],
    agentsData: agentsQuery.data,
    appsData: appsQuery.data,
    toolsData: toolsQuery.data,
    publicDocsData: publicDocsQuery.data,
    userApps: userAppsQuery.data ?? [],
    addAppMutation,
    isLoading:
      requirementsQuery.isLoading ||
      tasksQuery.isLoading ||
      agentsQuery.isLoading ||
      appsQuery.isLoading ||
      toolsQuery.isLoading ||
      publicDocsQuery.isLoading,
    fetchNextAgents: agentsQuery.fetchNextPage,
    hasNextAgents: agentsQuery.hasNextPage,
    isFetchingNextAgents: agentsQuery.isFetchingNextPage,
    fetchNextApps: appsQuery.fetchNextPage,
    hasNextApps: appsQuery.hasNextPage,
    isFetchingNextApps: appsQuery.isFetchingNextPage,
    fetchNextTools: toolsQuery.fetchNextPage,
    hasNextTools: toolsQuery.hasNextPage,
    isFetchingNextTools: toolsQuery.isFetchingNextPage,
    fetchNextPublic: publicDocsQuery.fetchNextPage,
    hasNextPublic: publicDocsQuery.hasNextPage,
    isFetchingNextPublic: publicDocsQuery.isFetchingNextPage,
  };
}
