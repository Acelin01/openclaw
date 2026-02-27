import { Artifact } from "../../components/create-artifact";
import { MatchingEditor } from "../../components/matching-editor";
import { MatchingTemplate } from "../../templates/matching-template";
import { MatchingTemplateAlt } from "../../templates/matching-template-alt";

export const matchingArtifact = new Artifact({
  kind: "matching",
  description: "Useful for matching analysis",
  content: MatchingEditor,
  template: MatchingTemplate,
  templates: [
    { id: "default", label: "Light", component: MatchingTemplate },
    { id: "dark", label: "Dark Dashboard", component: MatchingTemplateAlt },
  ],
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-matchingDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data,
        isVisible: true,
        status: "streaming",
      }));
    }

    if (streamPart.type === "data-agent-matches") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: {
          type: "agent-matches",
          matches: streamPart.data,
        },
        isVisible: true,
        status: "idle",
      }));
    }
  },
  actions: [],
  toolbar: [],
});
