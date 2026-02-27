import { ProjectApp } from "@uxin/projects/project-app";
import { CollaborationContext } from "@uxin/agent-lib/collaboration/index";

export const getAgentCollaborationTools = (
  projectApp: ProjectApp,
  baseContext?: Partial<CollaborationContext>,
) => {
  const context: CollaborationContext = {
    userId: baseContext?.userId || "mcp-system",
    token: baseContext?.token,
    isService: baseContext?.isService,
    onEvent: baseContext?.onEvent,
  };

  return [
    {
      name: "collaboration_dispatch",
      description: "派发协作任务。参数：project_id(项目ID), requirement_id(需求ID), agents(智能体列表), context(上下文信息)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          requirement_id: { type: "string" },
          agents: { type: "array", items: { type: "string" } },
          context: { type: "object" },
          strategy: { type: "string", enum: ["sequential", "parallel"] },
        },
        required: ["project_id", "agents"],
      },
      handler: async (args: any) => projectApp.agentCollaboration.dispatchCollaboration(args, context),
    },
    {
      name: "collaboration_sync",
      description: "同步协作状态。参数：collaboration_id(协作ID), status(状态), progress(进度), artifacts(产出物)",
      inputSchema: {
        type: "object",
        properties: {
          collaboration_id: { type: "string" },
          status: { type: "string", enum: ["pending", "in_progress", "completed"] },
          progress: { type: "number" },
          artifacts: { type: "array", items: { type: "object" } },
        },
        required: ["collaboration_id", "status"],
      },
      handler: async (args: any) => projectApp.agentCollaboration.syncCollaboration(args, context),
    },
    {
      name: "collaboration_query",
      description: "查询协作状态。参数：project_id(项目ID), collaboration_id(协作ID)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          collaboration_id: { type: "string" },
        },
        required: ["project_id"],
      },
      handler: async (args: any) => projectApp.agentCollaboration.queryCollaboration(args, context),
    },
  ];
};
