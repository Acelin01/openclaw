import { toast } from "sonner";
import { Artifact } from "../../components/create-artifact";
import { ClockRewind, CopyIcon } from "../../components/icons";
import { ReportEditor } from "../../components/report-editor";
import { ReportTemplate } from "../../components/report-template";

export const reportArtifact = new Artifact<"report", null>({
  kind: "report",
  description: "Useful for reports.",
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-reportDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: draftArtifact.content + streamPart.data,
        isVisible: true,
        status: "streaming",
      }));
    }
  },
  content: ReportEditor,
  template: ReportTemplate,
  templates: [{ id: "default", label: "Default", component: ReportTemplate }],
  actions: [
    {
      icon: <ClockRewind size={18} />,
      description: "View changes",
      onClick: ({ handleVersionChange }) => handleVersionChange("toggle"),
    },
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
