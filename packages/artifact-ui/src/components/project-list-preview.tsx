"use client";

import { ProjectListView, Project } from "@uxin/projects";

export function ProjectListPreview({
  projects = [],
  isLoading = false,
  onSelectProject,
  onCreateProject,
  token,
  userId,
  apiBaseUrl,
}: {
  projects?: any[];
  isLoading?: boolean;
  onSelectProject?: (projectId: string) => void;
  onCreateProject?: () => void;
  token?: string;
  userId?: string;
  apiBaseUrl?: string;
}) {
  const handleProjectClick = (project: Project) => {
    if (onSelectProject) {
      onSelectProject(project.id);
    }
  };

  return (
    <ProjectListView
      projects={projects as Project[]}
      isLoading={isLoading}
      onProjectClick={handleProjectClick}
      onCreateProject={onCreateProject}
      token={token}
      userId={userId}
      apiBaseUrl={apiBaseUrl}
    />
  );
}
