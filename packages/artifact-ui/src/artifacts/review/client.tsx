import { Artifact } from "../../components/create-artifact";
import { ReviewTemplate } from "../../templates/review-template";

export const reviewArtifact = new Artifact({
  kind: "review",
  description: "Useful for project and worker reviews",
  content: ReviewTemplate,
  template: ReviewTemplate,
  templates: [{ id: "default", label: "Default", component: ReviewTemplate }],
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-reviewDelta") {
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
