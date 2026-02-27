import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import { constructApiUrl } from "@/lib/api";

export const getProjects = ({ 
  token,
  dataStream
}: { 
  token?: string;
  dataStream?: UIMessageStreamWriter;
}) => tool({
  description: "List all available projects to get their IDs and basic information.",
  inputSchema: z.object({
    status: z.enum(['active', 'completed', 'archived']).optional().describe("Filter projects by status"),
  }),
  execute: async ({ status }) => {
    try {
      const url = constructApiUrl('/api/v1/projects', {
        ...(status ? { status } : {}),
      });

      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url.toString(), { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch projects: ${response.status} ${errorText}`);
        return { 
          success: false, 
          error: `Failed to fetch projects: ${response.status}`, 
          projects: [] 
        };
      }

      const result = await response.json();
      const projects = result.data?.projects || result.data || [];

      // 如果有 dataStream，逐个推送项目信息以实现流式效果
      if (dataStream && Array.isArray(projects) && projects.length > 0) {
        for (const project of projects) {
          dataStream.write({
            type: 'data-project-preview' as any,
            data: project
          });
          // 模拟流式延迟，让用户能看到逐个显示的过程
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return {
        success: true,
        projects: projects,
        count: Array.isArray(projects) ? projects.length : 0
      };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return { success: false, error: "Failed to fetch projects due to network or server error", projects: [] };
    }
  },
});
