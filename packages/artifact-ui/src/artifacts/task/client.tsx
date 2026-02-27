import { toast } from "sonner";
import { Artifact } from "../../components/create-artifact";
import { CopyIcon } from "../../components/icons";
import { TaskEditor } from "../../components/task-editor";
import { TaskTemplate } from "../../components/task-template";

export const taskArtifact = new Artifact<"task", null>({
  kind: "task",
  description: "Useful for tracking tasks and assignments.",
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-taskDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data,
        isVisible: true,
        status: "streaming",
      }));
    }
  },
  content: TaskEditor,
  template: TaskTemplate,
  templates: [{ id: "default", label: "Default", component: TaskTemplate }],
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
