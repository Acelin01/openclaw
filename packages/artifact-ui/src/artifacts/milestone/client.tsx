import { Artifact } from "../../components/create-artifact";
import { MilestoneTemplate } from "../../templates/milestone-template";

export const milestoneArtifact = new Artifact({
  kind: "milestone",
  description: "Project milestone tracking",
  content: MilestoneTemplate,
  template: MilestoneTemplate,
  templates: [{ id: "default", label: "Default", component: MilestoneTemplate }],
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-milestoneDelta") {
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
