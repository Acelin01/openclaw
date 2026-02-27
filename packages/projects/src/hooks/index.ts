import { useQuery } from "@tanstack/react-query";
import { ProjectTask, ProjectTeamMember } from "../types";

// 获取项目任务列表的 Hook
export function useProjectTasks(projectId: string, token?: string, apiBaseUrl?: string) {
  return useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: async () => {
      if (!projectId || !token || !apiBaseUrl) return [];

      const response = await fetch(`${apiBaseUrl}/api/v1/projects/${projectId}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const result = await response.json();
      return (result.data?.tasks || result.data || []) as ProjectTask[];
    },
    enabled: !!projectId && !!token && !!apiBaseUrl,
  });
}

// 获取项目团队成员列表的 Hook
export function useProjectMembers(projectId: string, token?: string, apiBaseUrl?: string) {
  return useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
      if (!projectId || !token || !apiBaseUrl) return [];

      const response = await fetch(`${apiBaseUrl}/api/v1/projects/${projectId}/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }

      const result = await response.json();
      return (result.data?.members || result.data || []) as ProjectTeamMember[];
    },
    enabled: !!projectId && !!token && !!apiBaseUrl,
  });
}

// 获取项目缺陷列表的 Hook
export function useProjectDefects(projectId: string, token?: string, apiBaseUrl?: string) {
  return useQuery({
    queryKey: ["project-defects", projectId],
    queryFn: async () => {
      if (!projectId || !token || !apiBaseUrl) return [];

      const response = await fetch(`${apiBaseUrl}/api/v1/projects/${projectId}/defects`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        // 如果 API 不存在或出错，返回空数组而不是抛出错误，以免阻塞 UI
        console.warn("Failed to fetch defects:", response.statusText);
        return [];
      }

      const result = await response.json();
      return (result.data?.defects || result.data || []) as any[];
    },
    enabled: !!projectId && !!token && !!apiBaseUrl,
  });
}

// 获取项目风险列表的 Hook
export function useProjectRisks(projectId: string, token?: string, apiBaseUrl?: string) {
  return useQuery({
    queryKey: ["project-risks", projectId],
    queryFn: async () => {
      if (!projectId || !token || !apiBaseUrl) return [];

      const response = await fetch(`${apiBaseUrl}/api/v1/projects/${projectId}/risks`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        // 如果 API 不存在或出错，返回空数组而不是抛出错误，以免阻塞 UI
        console.warn("Failed to fetch risks:", response.statusText);
        return [];
      }

      const result = await response.json();
      return (result.data?.risks || result.data || []) as any[];
    },
    enabled: !!projectId && !!token && !!apiBaseUrl,
  });
}
