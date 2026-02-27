import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import { constructApiUrl } from "@/lib/api";

export const getProjectRequirements = ({ 
  token,
  dataStream
}: { 
  token?: string;
  dataStream?: UIMessageStreamWriter;
}) => tool({
  description: "Fetch existing requirements for a specific project by its ID.",
  inputSchema: z.object({
    projectId: z.string().describe("The ID of the project to fetch requirements for"),
  }),
  execute: async ({ projectId }) => {
    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const url = constructApiUrl('/api/v1/project-requirements', { projectId });
      const response = await fetch(url.toString(), {
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch project requirements: ${response.status} ${errorText}`);
        return { 
          success: false, 
          error: `Failed to fetch requirements: ${response.status}`, 
          requirements: [] 
        };
      }

      const result = await response.json();
      const requirements = result.data || [];

      // 如果有 dataStream，逐个推送需求信息以实现流式效果
      if (dataStream && Array.isArray(requirements) && requirements.length > 0) {
        for (const req of requirements) {
          dataStream.write({
            type: 'requirementDelta' as any,
            data: req.description || req.title || JSON.stringify(req)
          });
          // 模拟流式延迟
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      return {
        success: true,
        requirements: requirements,
        count: Array.isArray(requirements) ? requirements.length : 0
      };
    } catch (error) {
      console.error('Error fetching project requirements:', error);
      return { success: false, error: "Failed to fetch requirements due to network or server error", requirements: [] };
    }
  },
});
