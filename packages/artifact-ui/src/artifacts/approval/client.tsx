import { toast } from "sonner";
import { ApprovalEditor } from "../../components/approval-editor";
import { ApprovalTemplate } from "../../components/approval-template";
import { Artifact } from "../../components/create-artifact";
import { CopyIcon } from "../../components/icons";

export const approvalArtifact = new Artifact<"approval", null>({
  kind: "approval",
  description: "Useful for approval requests.",
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-approvalDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data,
        isVisible: true,
        status: "streaming",
      }));
    }
  },
  content: ApprovalEditor,
  template: ApprovalTemplate,
  templates: [{ id: "default", label: "Default", component: ApprovalTemplate }],
  actions: [
    {
      icon: <CopyIcon size={18} />,
      description: "Copy",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
      },
    },
  ],
  toolbar: [],
});
