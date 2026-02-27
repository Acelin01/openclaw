import { Artifact } from "../../components/create-artifact";
import { RiskTemplate } from "../../templates/risk-template";

export const riskArtifact = new Artifact({
  kind: "risk",
  description: "Useful for project risk management and assessment",
  content: RiskTemplate,
  template: RiskTemplate,
  templates: [{ id: "default", label: "Default", component: RiskTemplate }],
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-riskDelta") {
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
