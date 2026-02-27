"use client";

import { Input, Textarea, Label } from "@uxin/ui";
import { useEffect, useState } from "react";
import { parseStructuredContent } from "../lib/utils";
import { Editor } from "./text-editor";

interface ServiceData {
  title: string;
  description: string;
  priceAmount?: number;
  priceCurrency?: string;
  unit?: string;
  category?: string;
}

export function ServiceEditor(props: React.ComponentProps<typeof Editor>) {
  const { content, onSaveContent, status } = props;
  const [data, setData] = useState<ServiceData>({
    title: "",
    description: "",
    priceCurrency: "USD",
  });
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    if (!content) return;
    try {
      const parsed = parseStructuredContent<ServiceData>(content);
      setData(parsed);
      setParseError(false);
    } catch (e) {
      if (status !== "streaming") {
        setParseError(true);
      }
    }
  }, [content, status]);

  const updateData = (updates: Partial<ServiceData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onSaveContent(JSON.stringify(newData, null, 2), false);
  };

  if (parseError) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-2">
          Error parsing service data. Switching to raw text editor.
        </div>
        <Editor {...props} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="grid gap-2">
        <Label className="text-sm font-medium">Service Title</Label>
        <Input
          value={data.title || ""}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="Service Title"
          disabled={status === "streaming"}
        />
      </div>

      <div className="grid gap-2">
        <Label className="text-sm font-medium">Category</Label>
        <Input
          value={data.category || ""}
          onChange={(e) => updateData({ category: e.target.value })}
          placeholder="Category"
          disabled={status === "streaming"}
        />
      </div>

      <div className="grid gap-2">
        <Label className="text-sm font-medium">Description</Label>
        <Textarea
          value={data.description || ""}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Service Description"
          rows={4}
          disabled={status === "streaming"}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label className="text-sm font-medium">Price Amount</Label>
          <Input
            type="number"
            value={data.priceAmount || ""}
            onChange={(e) => updateData({ priceAmount: parseFloat(e.target.value) || undefined })}
            placeholder="Amount"
            disabled={status === "streaming"}
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-sm font-medium">Currency</Label>
          <Input
            value={data.priceCurrency || "USD"}
            onChange={(e) => updateData({ priceCurrency: e.target.value })}
            placeholder="Currency"
            disabled={status === "streaming"}
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-sm font-medium">Unit</Label>
          <Input
            value={data.unit || ""}
            onChange={(e) => updateData({ unit: e.target.value })}
            placeholder="Unit (e.g. hour)"
            disabled={status === "streaming"}
          />
        </div>
      </div>
    </div>
  );
}
