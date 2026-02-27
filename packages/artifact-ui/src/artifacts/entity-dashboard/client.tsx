import { Activity, LayoutDashboard, RefreshCw } from "lucide-react";
import { Artifact } from "../../components/create-artifact";
import { EntityDashboard } from "../../components/entity-dashboard";

export const entityDashboardArtifact = new Artifact({
  kind: "entity-dashboard",
  description:
    "Focused dashboard for tracking a single agent, freelancer, or project member's work and collaboration",
  content: EntityDashboard,
  template: EntityDashboard,
  onStreamPart: ({ streamPart, setMetadata }) => {
    if (streamPart.type === "data-entityDashboardDelta") {
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
      description: "刷新工作状态",
      onClick: async ({ content, setMetadata }) => {
        // Implementation for manual refresh if needed
        console.log("Refreshing entity dashboard...");
      },
    },
  ],
  toolbar: [
    {
      icon: <Activity className="w-4 h-4" />,
      description: "活动流",
      onClick: () => console.log("Showing entity activity stream"),
    },
    {
      icon: <LayoutDashboard className="w-4 h-4" />,
      description: "全屏视图",
      onClick: () => console.log("Toggling full screen"),
    },
  ],
});
