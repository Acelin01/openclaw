import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";

export const showAgentDashboard = ({
  dataStream,
}: {
  dataStream?: UIMessageStreamWriter;
}) =>
  tool({
    description: "Show the real-time agent collaboration dashboard. Use this to monitor project status, team activities, risks, and system health.",
    inputSchema: z.object({
      projectId: z.string().optional().describe("The ID of the project to show the dashboard for"),
      title: z.string().optional().describe("A title for the dashboard"),
    }),
    execute: async ({ projectId, title }) => {
      // Fetch initial data for the dashboard
      let initialData = {
        metrics: {
          completionRate: 68,
          activeTasks: 12,
          teamVelocity: 85,
          riskLevel: "medium",
        },
        activities: [
          { id: '1', user: 'System', action: 'Dashboard initialized', time: '刚刚' }
        ]
      };

      try {
        // Use the absolute URL of the Express API in dev/prod
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiBaseUrl}/api/v1/mcp/health?type=dashboard${projectId ? `&projectId=${projectId}` : ''}`);
        const result = await res.json();
        if (result.success) {
          initialData = result.data;
        }
      } catch (e) {
        console.warn("Failed to fetch real MCP dashboard data from API, using initial data", e);
      }

      if (dataStream) {
        dataStream.write({
          type: "data-kind",
          data: "agent-dashboard",
        });
        dataStream.write({
          type: "data-title",
          data: title || "项目负责人看板",
        });
        dataStream.write({
          type: "data-id",
          data: projectId || "new-dashboard",
        });
        dataStream.write({
          type: "data-agentDashboardDelta",
          data: initialData,
        });
      }

      return { 
        projectId: projectId || "new-dashboard", 
        title: title || "项目负责人看板",
        metrics: initialData.metrics,
        recentActivity: initialData.activities?.[0] || null,
        status: "ready",
        initialData // Include full data for the artifact
      };
    },
  });
