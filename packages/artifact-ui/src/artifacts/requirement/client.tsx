import { Artifact } from "../../components/create-artifact";
import { RequirementEditor } from "../../components/requirement-editor";
import { RequirementTemplate } from "../../templates/requirement-template";
import { RequirementTemplateAlt } from "../../templates/requirement-template-alt";

export const requirementArtifact = new Artifact({
  kind: "requirement",
  description: "Useful for requirements documentation",
  content: RequirementEditor,
  template: RequirementTemplate,
  templates: [
    { id: "default", label: "Document", component: RequirementTemplate },
    { id: "cards", label: "Cards", component: RequirementTemplateAlt },
  ],
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-requirementDelta") {
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
