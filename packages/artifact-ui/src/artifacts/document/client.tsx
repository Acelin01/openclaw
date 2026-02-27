import { Artifact } from "../../components/create-artifact";
import { DocumentEditor } from "../../components/document-editor";
import { DocumentTemplate } from "../../templates/document-template";

export const documentArtifact = new Artifact({
  kind: "document",
  description: "Useful for online documents and collaborative writing",
  content: DocumentEditor,
  template: DocumentTemplate,
  templates: [{ id: "default", label: "Default", component: DocumentTemplate }],
  onStreamPart: ({ streamPart, setArtifact, setMetadata }) => {
    if (streamPart.type === "data-documentDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data,
        isVisible: true,
        status: "streaming",
      }));
    }

    if (streamPart.type === "data-suggestion") {
      setMetadata((metadata: any) => ({
        ...metadata,
        suggestions: [...(metadata?.suggestions || []), streamPart.data],
      }));
    }
  },
  actions: [],
  toolbar: [],
});
