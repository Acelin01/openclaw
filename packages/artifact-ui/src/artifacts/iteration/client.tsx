"use client";

import {
  IterationDetailView,
  IterationStatus,
  Iteration,
  IterationWorkItem,
  IterationWorkItemsView,
} from "@uxin/iteration-lib";
import { useMemo, useState, useEffect } from "react";
import React from "react";
import { CreateIterationForm } from "../../../../iteration-lib/src/components/CreateIterationModal";
import { Artifact, ArtifactContent } from "../../components/create-artifact";

const IterationPreview: React.FC<ArtifactContent<any>> = ({
  content,
  status,
  metadata,
  setMetadata,
  sendMessage,
}) => {
  const [formData, setFormData] = useState<any>(null);

  const iteration = useMemo(() => {
    try {
      const data = JSON.parse(content);

      const requirements = (data.requirements || []).map((r: any, i: number) => ({
        id: `req-${i}`,
        title: r.title,
        status: r.status,
        type: "requirement",
        priority: r.priority,
      }));

      const tasks = (data.tasks || []).map((t: any, i: number) => ({
        id: `task-${i}`,
        title: t.title,
        status: t.status,
        type: "task",
        priority: t.priority,
        assignee: t.assignee ? { id: "user", name: t.assignee } : undefined,
        estimatedHours: t.estimatedHours,
      }));

      const workItems = [...requirements, ...tasks];

      // Transform data to Iteration interface
      const it = {
        id: "draft-iteration",
        projectId: "current-project",
        name: data.title || "New Iteration",
        description: data.description,
        status: (data.status as IterationStatus) || IterationStatus.PLANNING,
        startDate: data.startDate || new Date().toISOString(),
        endDate: data.endDate || new Date().toISOString(),
        requirements,
        tasks,
        workItems,
        activities: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Iteration & { workItems: IterationWorkItem[] };

      return it;
    } catch (e) {
      return null;
    }
  }, [content]);

  // Sync formData with iteration data during streaming
  useEffect(() => {
    if (status === "streaming" && iteration) {
      const formatDate = (date: string | Date) => {
        if (!date) return "";
        const d = typeof date === "string" ? new Date(date) : date;
        try {
          return d.toISOString().split("T")[0];
        } catch (e) {
          return "";
        }
      };

      setFormData({
        name: iteration.name,
        description: iteration.description,
        goals: iteration.requirements?.map((r) => r.title) || [],
        startDate: formatDate(iteration.startDate),
        endDate: formatDate(iteration.endDate),
        ownerId: "ai-assistant", // Default for streaming
      });
    }
  }, [status, iteration]);

  const handleSubmit = (data: any) => {
    if (sendMessage) {
      sendMessage({
        role: "user",
        parts: [
          {
            type: "text",
            text: `确认并保存迭代计划：\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      });
    }
  };

  if (status === "streaming") {
    return (
      <div className="h-full w-full overflow-hidden bg-white">
        <CreateIterationForm
          formData={formData || {}}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isStreaming={true}
          title="正在规划迭代..."
        />
      </div>
    );
  }

  if (status === "idle" && metadata?.viewMode === "workItems") {
    return (
      <div className="h-full w-full overflow-hidden bg-white">
        <IterationWorkItemsView
          iteration={iteration || ({} as any)}
          onAddWorkItem={() => {
            if (sendMessage) {
              sendMessage({
                role: "user",
                parts: [
                  {
                    type: "text",
                    text: "添加工作项",
                  },
                ],
              });
            }
          }}
        />
      </div>
    );
  }

  if (!iteration) return <div className="p-4 text-gray-500">正在生成迭代计划...</div>;

  return (
    <div className="h-full w-full overflow-hidden bg-white flex flex-col">
      <div className="flex-1 overflow-auto">
        <IterationDetailView iteration={iteration} readOnly={true} />
      </div>
    </div>
  );
};

const IterationTemplate: React.FC<{ content: string; token?: string }> = ({ content }) => {
  return <div className="p-4 text-gray-500">正在生成迭代计划...</div>;
};

export const iterationArtifact = new Artifact({
  kind: "iteration",
  description: "Iteration planning and tracking",
  content: IterationPreview,
  template: IterationTemplate,
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-iterationDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data,
        isVisible: true,
        status: "streaming",
      }));
    }
  },
  onStatusChange: ({ status, setMetadata }) => {
    if (status === "idle") {
      setMetadata({ viewMode: "workItems" });
    }
  },
  actions: [],
  toolbar: [],
});
