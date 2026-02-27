import { Activity, LayoutDashboard, RefreshCw } from "lucide-react";
import { AgentDashboard } from "../../components/agent-dashboard";
import { Artifact } from "../../components/create-artifact";

export const agentDashboardArtifact = new Artifact({
  kind: "agent-dashboard",
  description: "Real-time monitoring and control of the agent collaboration system",
  content: AgentDashboard,
  template: AgentDashboard,
  onStreamPart: ({ streamPart, setMetadata }) => {
    if (streamPart.type === "data-agentDashboardDelta") {
      setMetadata((prev: any) => ({
        ...prev,
        content: JSON.stringify((streamPart as any).data),
        status: "streaming",
      }));
    }
  },
  actions: [
    {
      icon: <RefreshCw className="w-4 h-4" />,
      label: "刷新",
      description: "刷新系统状态",
      onClick: async ({ content, setMetadata }) => {
        // Fetch latest data from the API
        try {
          const res = await fetch("/api/v1/mcp/health?type=dashboard");
          const result = await res.json();
          if (result.status === "ok") {
            setMetadata((prev: any) => ({
              ...prev,
              content: JSON.stringify(result),
              status: "finished",
            }));
          }
        } catch (error) {
          console.error("Failed to refresh agent dashboard", error);
        }
      },
    },
  ],
  toolbar: [
    {
      icon: <Activity className="w-4 h-4" />,
      description: "活动流",
      onClick: () => console.log("Showing activity stream"),
    },
    {
      icon: <LayoutDashboard className="w-4 h-4" />,
      description: "全屏视图",
      onClick: () => console.log("Toggling full screen"),
    },
  ],
});
