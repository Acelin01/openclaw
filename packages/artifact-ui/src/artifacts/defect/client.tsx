import { Artifact } from "../../components/create-artifact";
import { DefectTemplate } from "../../templates/defect-template";

export const defectArtifact = new Artifact({
  kind: "defect", // Also matches "bug" if mapped correctly, but let's stick to defect. Note: createBug uses "bug" kind in project-app.ts. I should check that.
  description: "Defect report and tracking",
  content: DefectTemplate,
  template: DefectTemplate,
  templates: [{ id: "default", label: "Default", component: DefectTemplate }],
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-defectDelta" || streamPart.type === "data-bugDelta") {
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
