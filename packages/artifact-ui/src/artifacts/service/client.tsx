import { Artifact } from "../../components/create-artifact";
import { ServiceEditor } from "../../components/service-editor";
import { ServiceTemplate } from "../../templates/service-template";
import { ServiceTemplateAlt } from "../../templates/service-template-alt";

export const serviceArtifact = new Artifact({
  kind: "service",
  description: "Useful for service descriptions",
  content: ServiceEditor,
  template: ServiceTemplate,
  templates: [
    { id: "default", label: "Standard", component: ServiceTemplate },
    { id: "card", label: "Pricing Card", component: ServiceTemplateAlt },
  ],
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-serviceDelta") {
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
