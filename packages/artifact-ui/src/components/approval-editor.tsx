"use client";

import { Input, Textarea, Badge, Label } from "@uxin/ui";
import { ClipboardCheck, User, Type, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { parseStructuredContent } from "../lib/utils";
import { ArtifactContent } from "./create-artifact";
import { DocumentSkeleton } from "./document-skeleton";
import { Editor } from "./text-editor";

export interface ApprovalData {
  title: string;
  requester: string;
  type: string;
  details: string;
  status: "Pending" | "Approved" | "Rejected";
}

export function ApprovalEditor(props: ArtifactContent) {
  const { content, onSaveContent, status, isLoading } = props;
  const [data, setData] = useState<ApprovalData>({
    title: "",
    requester: "",
    type: "",
    details: "",
    status: "Pending",
  });
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    if (!content) return;
    try {
      const parsed = parseStructuredContent<ApprovalData>(content);
      setData(parsed);
      setParseError(false);
    } catch (e) {
      if (status !== "streaming") {
        setParseError(true);
      }
    }
  }, [content, status]);

  const updateData = (updates: Partial<ApprovalData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onSaveContent(JSON.stringify(newData, null, 2), false);
  };

  if (isLoading) return <DocumentSkeleton artifactKind="approval" />;

  if (parseError) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-2">
          Error parsing approval data. Switching to raw text editor.
        </div>
        <Editor {...props} suggestions={props.suggestions || []} />
      </div>
    );
  }

  return (
    <div className="flex flex-row px-4 py-8 md:p-20">
      <div className="p-4 space-y-6 w-full">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Approval Request</h3>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Title</Label>
              <Input
                value={data.title || ""}
                onChange={(e) => updateData({ title: e.target.value })}
                placeholder="Approval Title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Requester</Label>
                <Input
                  value={data.requester || ""}
                  onChange={(e) => updateData({ requester: e.target.value })}
                  placeholder="Requester Name"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Type</Label>
                <Input
                  value={data.type || ""}
                  onChange={(e) => updateData({ type: e.target.value })}
                  placeholder="e.g. Leave, Expense, Purchase"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Details</Label>
              <Textarea
                value={data.details || ""}
                onChange={(e) => updateData({ details: e.target.value })}
                placeholder="Approval Details"
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Status</Label>
              <Input
                value={data.status || "Pending"}
                onChange={(e) => updateData({ status: e.target.value as any })}
                placeholder="Pending, Approved, Rejected"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
