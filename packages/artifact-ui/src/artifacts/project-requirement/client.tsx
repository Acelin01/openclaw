"use client";

import type { ProjectRequirement } from "@uxin/projects";
import {
  RequirementDetailView,
  useProjectTasks,
  useProjectMembers,
  useProjectDefects,
  useProjectRisks,
  RequirementPriority,
  RequirementStatus,
} from "@uxin/projects";
import React, { useMemo } from "react";
import { Artifact, type ArtifactContent } from "../../components/create-artifact";
import { constructApiUrl } from "../../lib/api";
import { generateUUID } from "../../lib/utils";
import { ProjectRequirementTemplate } from "../../templates/project-requirement-template";

interface ProjectRequirementEditorProps extends ArtifactContent {
  token?: string;
  userId?: string;
}

const parseRequirement = (content: string): ProjectRequirement => {
  try {
    const parsed = JSON.parse(content);
    const createdAt = parsed.createdAt ? new Date(parsed.createdAt) : new Date();
    const updatedAt = parsed.updatedAt ? new Date(parsed.updatedAt) : createdAt;
    return {
      id: parsed.id || generateUUID(),
      projectId: parsed.projectId,
      iterationId: parsed.iterationId,
      title: parsed.title || "未命名需求",
      description: parsed.description || "",
      priority: (parsed.priority as RequirementPriority) || RequirementPriority.MEDIUM,
      status: (parsed.status as RequirementStatus) || RequirementStatus.PENDING,
      type: parsed.type || "project",
      assigneeId: parsed.assigneeId,
      assigneeName: parsed.assigneeName,
      assigneeAvatar: parsed.assigneeAvatar,
      createdAt,
      updatedAt,
    };
  } catch {
    const now = new Date();
    return {
      id: generateUUID(),
      title: "未命名需求",
      description: "",
      priority: RequirementPriority.MEDIUM,
      status: RequirementStatus.PENDING,
      type: "project",
      createdAt: now,
      updatedAt: now,
    };
  }
};

export const ProjectRequirementEditor: React.FC<ProjectRequirementEditorProps> = ({
  content,
  onSaveContent,
  token,
  userId,
}) => {
  const requirement = useMemo(() => parseRequirement(content), [content]);
  const apiBaseUrl = constructApiUrl("").toString().replace(/\/$/, "");

  const { data: tasks } = useProjectTasks(requirement.projectId || "", token, apiBaseUrl);
  const { data: members } = useProjectMembers(requirement.projectId || "", token, apiBaseUrl);
  const { data: defects } = useProjectDefects(requirement.projectId || "", token, apiBaseUrl);
  const { data: risks } = useProjectRisks(requirement.projectId || "", token, apiBaseUrl);

  const handleUpdate = async (id: string, updates: Partial<ProjectRequirement>) => {
    const next = { ...requirement, ...updates, id: requirement.id || id, updatedAt: new Date() };
    onSaveContent(JSON.stringify(next, null, 2), false);
  };

  return (
    <RequirementDetailView
      key={`${requirement.id}-${requirement.updatedAt}`}
      requirement={requirement}
      onUpdate={handleUpdate}
      members={members || []}
      tasks={tasks || []}
      defects={defects || []}
      risks={risks || []}
      className="h-full border-none shadow-none"
    />
  );
};

export const projectRequirementArtifact = new Artifact({
  kind: "project-requirement",
  description: "Useful for project requirement documentation",
  content: ProjectRequirementEditor,
  template: ProjectRequirementTemplate,
  templates: [{ id: "default", label: "Default", component: ProjectRequirementTemplate }],
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-projectRequirementDelta") {
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

export const projectRequirementArtifactAlias = new Artifact({
  kind: "project_requirement",
  description: "Useful for project requirement documentation",
  content: ProjectRequirementEditor,
  template: ProjectRequirementTemplate,
  templates: [{ id: "default", label: "Default", component: ProjectRequirementTemplate }],
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-projectRequirementDelta") {
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
