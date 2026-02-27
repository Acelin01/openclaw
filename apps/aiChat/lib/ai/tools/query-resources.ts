import { tool } from "ai";
import { z } from "zod";
import { constructApiUrl } from "@/lib/api";

export const queryResources = ({ token }: { token?: string }) => tool({
  description: "Query project-related resources including projects, requirements, and tasks for analysis and status reporting.",
  inputSchema: z.object({
    type: z.enum(['projects', 'requirements', 'tasks']).describe("The type of resources to query"),
    projectId: z.string().optional().describe("Project ID to filter requirements or tasks"),
    status: z.string().optional().describe("Filter by status (e.g., 'active', 'completed', 'pending', 'in_progress')"),
    limit: z.number().optional().default(10).describe("Maximum number of items to return"),
  }),
  execute: async ({ type, projectId, status, limit }) => {
    try {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let url: URL;
      if (type === 'projects') {
        url = constructApiUrl('/api/v1/projects', {
          ...(status ? { status } : {}),
        });
      } else if (type === 'requirements') {
        url = constructApiUrl('/api/v1/project-requirements', {
          ...(projectId ? { projectId } : {}),
        });
      } else if (type === 'tasks') {
        url = constructApiUrl('/api/v1/project-tasks', {
          ...(projectId ? { projectId } : {}),
          ...(status ? { status } : {}),
        });
      } else {
        throw new Error(`Unsupported query type: ${type}`);
      }

      const response = await fetch(url.toString(), { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type}`);
      }

      const result = await response.json();
      const data = result.data || [];

      return {
        success: true,
        type,
        data: data.slice(0, limit),
        total: data.length,
      };
    } catch (error) {
      console.error(`Error querying ${type}:`, error);
      return { 
        success: false, 
        error: `Failed to fetch ${type}`, 
        type, 
        data: [] 
      };
    }
  },
});
