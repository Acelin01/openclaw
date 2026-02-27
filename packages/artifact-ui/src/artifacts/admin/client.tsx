import { AdminView } from "../../components/admin-view";
import { Artifact } from "../../components/create-artifact";

export const adminArtifact = new Artifact({
  kind: "admin",
  description: "Useful for background management integration",
  content: AdminView,
  template: AdminView,
  templates: [{ id: "default", label: "Default", component: AdminView }],
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-adminDelta") {
      setArtifact((draftArtifact) => {
        return {
          ...draftArtifact,
          content: streamPart.data,
          isVisible: true,
          status: "streaming",
        };
      });
    } else if (streamPart.type === ("data-adminSchema" as any)) {
      const { schema } = (streamPart as any).data;
      setArtifact((draftArtifact) => {
        try {
          const currentContent = JSON.parse(draftArtifact.content);
          return {
            ...draftArtifact,
            content: JSON.stringify(
              { ...currentContent, schema, status: "ready" as const },
              null,
              2,
            ),
            status: "streaming",
          };
        } catch (e) {
          return draftArtifact;
        }
      });
    }
  },
  actions: [],
  toolbar: [],
});
