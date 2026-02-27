import { toast } from "sonner";
import { ContractEditor } from "../../components/contract-editor";
import { ContractTemplate } from "../../components/contract-template";
import { Artifact } from "../../components/create-artifact";
import { ClockRewind, CopyIcon } from "../../components/icons";

export const contractArtifact = new Artifact<"contract", null>({
  kind: "contract",
  description: "Useful for legal contracts.",
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-contractDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data,
        isVisible: true,
        status: "streaming",
      }));
    }
  },
  content: ContractEditor,
  template: ContractTemplate,
  templates: [{ id: "default", label: "Default", component: ContractTemplate }],
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
