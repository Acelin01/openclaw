import { Artifact } from "../../components/create-artifact";
import { FinancialTemplate } from "../../templates/financial-template";

export const financialArtifact = new Artifact({
  kind: "financial",
  description: "Useful for tracking project income and expenses",
  content: FinancialTemplate,
  template: FinancialTemplate,
  templates: [{ id: "default", label: "Default", component: FinancialTemplate }],
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-financialDelta") {
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
