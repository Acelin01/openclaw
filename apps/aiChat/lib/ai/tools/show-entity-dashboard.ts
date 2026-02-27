import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";

export const showEntityDashboard = ({
  dataStream,
}: {
  dataStream?: UIMessageStreamWriter;
}) =>
  tool({
    description: "Show a focused dashboard for a specific agent, freelancer, or project member. Use this to track their individual progress, tasks, workload, and collaboration status.",
    inputSchema: z.object({
      entityId: z.string().describe("The ID of the person or agent"),
      name: z.string().describe("The name of the person or agent"),
      role: z.string().optional().describe("The role of the person or agent"),
      type: z.enum(['agent', 'freelancer', 'member']).optional().describe("The type of the entity"),
      projectId: z.string().optional().describe("The ID of the project they are working on"),
    }),
    execute: async ({ entityId, name, role, type, projectId }) => {
      // Default initial data for the entity dashboard
      const initialData = {
        entity: {
          id: entityId,
          name: name,
          role: role || "项目成员",
          type: type || "member",
          status: "online",
        },
        metrics: {
          completionRate: 0,
          avgHandleTime: "0h",
          activeTasks: 0,
          workload: 0,
          reliabilityScore: 100,
        },
        tasks: [],
        alerts: [],
        collaborations: [],
      };

      if (dataStream) {
        dataStream.write({
          type: "data-kind",
          data: "entity-dashboard",
        });
        dataStream.write({
          type: "data-title",
          data: `${name} 的工作看板`,
        });
        dataStream.write({
          type: "data-id",
          data: entityId,
        });
        dataStream.write({
          type: "data-entityDashboardDelta",
          data: initialData,
        });
      }

      return { 
        entityId, 
        name, 
        role: role || "项目成员",
        status: "dashboard_opened",
        initialData 
      };
    },
  });
