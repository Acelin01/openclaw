import { Artifact } from "../../components/create-artifact";
import { ResumeEditor } from "../../components/resume-editor";
import { ResumeTemplate } from "../../templates/resume-template";
import { ResumeTemplateAlt } from "../../templates/resume-template-alt";

export const resumeArtifact = new Artifact({
  kind: "resume",
  description: "Useful for resume creation",
  content: ResumeEditor,
  template: ResumeTemplate,
  templates: [
    { id: "default", label: "Clean", component: ResumeTemplate },
    { id: "sidebar", label: "Sidebar", component: ResumeTemplateAlt },
  ],
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-resumeDelta") {
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
