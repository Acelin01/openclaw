"use client";

import { Input, Textarea, Label } from "@uxin/ui";
import { Plus, Trash2, ListChecks, Flag, Activity, FileText, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { parseStructuredContent } from "../lib/utils";
import { Editor } from "./text-editor";

interface RequirementData {
  title: string;
  description: string;
  requirements?: string[];
  budgetMin?: number;
  budgetMax?: number;
  deadline?: string;
}

export function RequirementEditor(props: React.ComponentProps<typeof Editor>) {
  const { content, onSaveContent, status } = props;
  const [data, setData] = useState<RequirementData>({
    title: "",
    description: "",
  });
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    if (!content) return;
    try {
      const parsed = parseStructuredContent<RequirementData>(content);
      setData(parsed);
      setParseError(false);
    } catch (e) {
      if (status !== "streaming") {
        setParseError(true);
      }
    }
  }, [content, status]);

  const updateData = (updates: Partial<RequirementData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onSaveContent(JSON.stringify(newData, null, 2), false);
  };

  if (parseError) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-2">
          Error parsing requirement data. Switching to raw text editor.
        </div>
        <Editor {...props} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="grid gap-2">
        <Label className="text-sm font-medium">Requirement Title</Label>
        <Input
          value={data.title || ""}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="Title"
          disabled={status === "streaming"}
        />
      </div>

      <div className="grid gap-2">
        <Label className="text-sm font-medium">Description</Label>
        <Textarea
          value={data.description || ""}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Description"
          rows={4}
          disabled={status === "streaming"}
        />
      </div>

      <div className="grid gap-2">
        <Label className="text-sm font-medium">Detailed Requirements (one per line)</Label>
        <Textarea
          value={data.requirements?.join("\n") || ""}
          onChange={(e) => updateData({ requirements: e.target.value.split("\n").filter(Boolean) })}
          placeholder="List requirements here..."
          rows={6}
          disabled={status === "streaming"}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label className="text-sm font-medium">Min Budget</Label>
          <Input
            type="number"
            value={data.budgetMin || ""}
            onChange={(e) => updateData({ budgetMin: parseFloat(e.target.value) || undefined })}
            placeholder="Min Budget"
            disabled={status === "streaming"}
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-sm font-medium">Max Budget</Label>
          <Input
            type="number"
            value={data.budgetMax || ""}
            onChange={(e) => updateData({ budgetMax: parseFloat(e.target.value) || undefined })}
            placeholder="Max Budget"
            disabled={status === "streaming"}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label className="text-sm font-medium">Deadline</Label>
        <Input
          type="date"
          value={data.deadline ? data.deadline.split("T")[0] : ""}
          onChange={(e) => updateData({ deadline: e.target.value })}
          disabled={status === "streaming"}
        />
      </div>
    </div>
  );
}
