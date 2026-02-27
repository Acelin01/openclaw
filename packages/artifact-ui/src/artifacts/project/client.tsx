import { Artifact } from "../../components/create-artifact";
import { ProjectEditor } from "../../components/project-editor";
import { ProjectPreview } from "../../components/project-preview";
import { ProjectTemplate } from "../../templates/project-template";
import { ProjectTemplateAlt } from "../../templates/project-template-alt";

export const projectArtifact = new Artifact({
  kind: "project",
  description: "Useful for project planning",
  content: ProjectEditor,
  template: ProjectPreview,
  templates: [
    { id: "visual", label: "Visual", component: ProjectPreview },
    { id: "default", label: "Classic", component: ProjectTemplate },
    { id: "modern", label: "Dark Modern", component: ProjectTemplateAlt },
  ],
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-projectDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data,
        isVisible: true,
        status: "streaming",
      }));
    } else if (streamPart.type === "data-requirement-created") {
      setArtifact((draftArtifact) => {
        try {
          const currentContent = JSON.parse(draftArtifact.content);
          const requirements = currentContent.requirements || [];
          return {
            ...draftArtifact,
            content: JSON.stringify(
              {
                ...currentContent,
                requirements: [...requirements, streamPart.data],
              },
              null,
              2,
            ),
            status: "idle",
          };
        } catch (e) {
          return draftArtifact;
        }
      });
    } else if (streamPart.type === "data-task-created") {
      setArtifact((draftArtifact) => {
        try {
          const currentContent = JSON.parse(draftArtifact.content);
          const tasks = currentContent.tasks || [];
          return {
            ...draftArtifact,
            content: JSON.stringify(
              {
                ...currentContent,
                tasks: [...tasks, streamPart.data],
              },
              null,
              2,
            ),
            status: "idle",
          };
        } catch (e) {
          return draftArtifact;
        }
      });
    } else if (streamPart.type === ("data-adminDelta" as any)) {
      try {
        const adminContent = JSON.parse((streamPart as any).data);
        const { configId, schema, status } = adminContent;
        if (configId) {
          setArtifact((draftArtifact) => {
            try {
              const currentContent = JSON.parse(draftArtifact.content);
              const newAdminConfigs = (
                currentContent.adminConfigs || currentContent.adminConfig
              )?.map((c: any) =>
                c.id === configId
                  ? { ...c, schema: schema || c.schema, status: status || c.status }
                  : c,
              );
              return {
                ...draftArtifact,
                content: JSON.stringify(
                  { ...currentContent, adminConfigs: newAdminConfigs },
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
      } catch (e) {
        // ignore
      }
    } else if (streamPart.type === ("data-adminSchema" as any)) {
      const { configId, schema } = (streamPart as any).data;
      setArtifact((draftArtifact) => {
        try {
          const currentContent = JSON.parse(draftArtifact.content);
          const newAdminConfigs = (currentContent.adminConfigs || currentContent.adminConfig)?.map(
            (c: any) => (c.id === configId ? { ...c, schema, status: "ready" as const } : c),
          );
          return {
            ...draftArtifact,
            content: JSON.stringify({ ...currentContent, adminConfigs: newAdminConfigs }, null, 2),
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
