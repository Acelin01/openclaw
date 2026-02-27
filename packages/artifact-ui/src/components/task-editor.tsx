"use client";

import { Input, Textarea, Badge, Label } from "@uxin/ui";
import { CheckCircle2, User, Calendar, Clock, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { parseStructuredContent } from "../lib/utils";
import { ArtifactContent } from "./create-artifact";
import { DocumentSkeleton } from "./document-skeleton";
import { Editor } from "./text-editor";

export interface TaskData {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  status: "To Do" | "In Progress" | "Done";
}

export function TaskEditor(props: ArtifactContent) {
  const { content, onSaveContent, status, isLoading } = props;
  const [data, setData] = useState<TaskData>({
    title: "",
    description: "",
    assignee: "",
    dueDate: "",
    priority: "Medium",
    status: "To Do",
  });
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    if (!content) return;
    try {
      const parsed = parseStructuredContent<TaskData>(content);
      setData(parsed);
      setParseError(false);
    } catch (e) {
      if (status !== "streaming") {
        setParseError(true);
      }
    }
  }, [content, status]);

  const updateData = (updates: Partial<TaskData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onSaveContent(JSON.stringify(newData, null, 2), false);
  };

  if (isLoading) return <DocumentSkeleton artifactKind="task" />;

  if (parseError) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-2">
          Error parsing task data. Switching to raw text editor.
        </div>
        <Editor {...props} suggestions={props.suggestions || []} />
      </div>
    );
  }

  return (
    <div className="flex flex-row px-4 py-8 md:p-20">
      <div className="p-4 space-y-6 w-full">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Task Details</h3>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Title</Label>
              <Input
                value={data.title || ""}
                onChange={(e) => updateData({ title: e.target.value })}
                placeholder="Task Title"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={data.description || ""}
                onChange={(e) => updateData({ description: e.target.value })}
                placeholder="Task Description"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Assignee</Label>
                <Input
                  value={data.assignee || ""}
                  onChange={(e) => updateData({ assignee: e.target.value })}
                  placeholder="Assignee Name"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Due Date</Label>
                <Input
                  value={data.dueDate || ""}
                  onChange={(e) => updateData({ dueDate: e.target.value })}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Priority</Label>
                <Input
                  value={data.priority || ""}
                  onChange={(e) => updateData({ priority: e.target.value as any })}
                  placeholder="Low, Medium, High"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Status</Label>
                <Input
                  value={data.status || ""}
                  onChange={(e) => updateData({ status: e.target.value as any })}
                  placeholder="To Do, In Progress, Done"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
