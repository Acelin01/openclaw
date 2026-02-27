import { Artifact } from "../../components/create-artifact";
import { PositionEditor } from "../../components/position-editor";
import { PositionTemplate } from "../../templates/position-template";
import { PositionTemplateAlt } from "../../templates/position-template-alt";

export const positionArtifact = new Artifact({
  kind: "position",
  description: "Useful for position/job descriptions",
  content: PositionEditor,
  template: PositionTemplate,
  templates: [
    { id: "default", label: "Simple", component: PositionTemplate },
    { id: "branded", label: "Branded", component: PositionTemplateAlt },
  ],
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-positionDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data,
        isVisible: true,
        status: "streaming",
      }));
    }
  },
  actions: [],
  toolbar: [],
});
