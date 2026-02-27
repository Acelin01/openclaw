import { toast } from "sonner";
import { Artifact } from "../../components/create-artifact";
import { CopyIcon, MessageIcon, RedoIcon, UndoIcon } from "../../components/icons";
import { WebEditor } from "../../components/web-editor";
import { WebTemplate } from "../../templates/web-template";

export const webArtifact = new Artifact({
  kind: "web",
  description: "Useful for generating and previewing HTML/CSS/JS code.",
  content: WebEditor,
  template: WebTemplate,
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-webDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data,
        isVisible: draftArtifact.content.length > 0 ? true : draftArtifact.isVisible,
        status: "streaming",
      }));
    }
  },
  actions: [
    {
      icon: <UndoIcon size={18} />,
      label: "Undo",
      description: "Undo last change",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("prev");
      },
      isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
    },
    {
      icon: <RedoIcon size={18} />,
      label: "Redo",
      description: "Redo last change",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("next");
      },
      isDisabled: ({ currentVersionIndex, versions }: any) =>
        currentVersionIndex === versions.length - 1,
    },
    {
      icon: <CopyIcon size={18} />,
      label: "Copy",
      description: "Copy code to clipboard",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard");
      },
    },
  ],
  toolbar: [
    {
      icon: <MessageIcon />,
      description: "Add a comment",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "I have a question about this web page.",
            },
          ],
        });
      },
    },
  ],
});
