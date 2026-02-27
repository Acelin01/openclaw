import { Artifact } from "../../components/create-artifact";
import { QnATemplate } from "../../templates/qna-template";

export const qnaArtifact = new Artifact({
  kind: "qna",
  description: "Useful for project questions and answers",
  content: QnATemplate,
  template: QnATemplate,
  templates: [{ id: "default", label: "Default", component: QnATemplate }],
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-qnaDelta") {
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
