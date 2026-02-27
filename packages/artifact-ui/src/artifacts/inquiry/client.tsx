import { Artifact } from "../../components/create-artifact";
import { InquiryTemplate } from "../../templates/inquiry-template";

export const inquiryArtifact = new Artifact({
  kind: "inquiry",
  description: "Useful for project inquiries and job postings",
  content: InquiryTemplate,
  template: InquiryTemplate,
  templates: [{ id: "default", label: "Default", component: InquiryTemplate }],
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-inquiryDelta") {
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
