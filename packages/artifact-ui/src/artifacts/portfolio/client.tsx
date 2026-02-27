import { Artifact } from "../../components/create-artifact";
import { PortfolioTemplate } from "../../templates/portfolio-template";

export const portfolioArtifact = new Artifact({
  kind: "portfolio",
  description: "Useful for showcasing worker portfolio items",
  content: PortfolioTemplate,
  template: PortfolioTemplate,
  templates: [{ id: "default", label: "Default", component: PortfolioTemplate }],
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-portfolioDelta") {
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
