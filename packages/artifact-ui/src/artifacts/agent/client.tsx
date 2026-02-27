import { Send } from "lucide-react";
import { toast } from "sonner";
import { AgentEditor } from "../../components/agent-editor";
import { AgentPreview } from "../../components/agent-preview";
import { Artifact } from "../../components/create-artifact";
import { constructApiUrl } from "../../lib/api";

export const agentArtifact = new Artifact({
  kind: "agent",
  description: "Configure and manage smart agents for your project",
  content: AgentEditor,
  template: AgentPreview,
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-agentDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: (streamPart as any).data,
        isVisible: true,
        status: "streaming",
      }));
    }
  },
  initialize: ({ documentId, setMetadata }) => {
    if (documentId && documentId.startsWith("agent-")) {
      const agentId = documentId.replace("agent-", "");
      setMetadata((prev: any) => ({ ...prev, agentId }));
    }
  },
  actions: [
    {
      icon: <Send className="w-4 h-4" />,
      label: "发布",
      description: "发布并应用智能体配置",
      onClick: async ({ content, metadata, setMetadata }) => {
        const agentData = (metadata as any)?.agentData;
        const isValid = (metadata as any)?.isValid;

        if (!isValid) {
          if (!agentData?.name) toast.error("请输入智能体名称");
          else if (!agentData?.prompt) toast.error("请输入智能体提示词");
          else if (agentData?.isCallableByOthers && !agentData?.identifier)
            toast.error("请输入英文标识名");
          return;
        }

        try {
          setMetadata((prev: any) => ({ ...prev, isPublishing: true }));

          // Determine if it's an update or create
          // metadata might store the existing agent ID if we have it
          const agentId = (metadata as any)?.agentId;
          const path = agentId ? `/api/v1/agents/${agentId}` : `/api/v1/agents`;
          const url = constructApiUrl(path);

          const method = agentId ? "PATCH" : "POST";

          // Get token from somewhere - usually passed via context or stored in localStorage
          const token = localStorage.getItem("auth_token"); // Fallback check

          const response = await fetch(url.toString(), {
            method,
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(agentData),
          });

          const result = await response.json();

          if (result.success) {
            toast.success(agentId ? "智能体更新成功" : "智能体创建成功");
            if (result.data?.id) {
              setMetadata((prev: any) => ({ ...prev, agentId: result.data.id }));
            }
          } else {
            toast.error(result.message || "操作失败");
          }
        } catch (error) {
          console.error("Failed to publish agent:", error);
          toast.error("网络错误，请稍后重试");
        } finally {
          setMetadata((prev: any) => ({ ...prev, isPublishing: false }));
        }
      },
      isDisabled: (context) => (context.metadata as any)?.isPublishing,
    },
  ],
  toolbar: [],
});
