"use client";

import { Button } from "@uxin/ui";
import { MonitorIcon } from "lucide-react";
import { useState } from "react";
import { CodeEditor } from "./code-editor";
import { WebPreview, WebPreviewBody } from "./elements/web-preview";
import { CodeIcon } from "./icons";
import { Editor } from "./text-editor";

export function WebEditor(props: React.ComponentProps<typeof Editor>) {
  const { content } = props;
  const [view, setView] = useState<"preview" | "code">("preview");

  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(content)}`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Button
            variant={view === "preview" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("preview")}
            className="h-8 gap-2"
          >
            <MonitorIcon className="h-4 w-4" />
            Preview
          </Button>
          <Button
            variant={view === "code" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("code")}
            className="h-8 gap-2"
          >
            <CodeIcon size={16} />
            Code
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === "preview" ? (
          <WebPreview defaultUrl={dataUrl} className="border-0 rounded-none">
            <WebPreviewBody />
          </WebPreview>
        ) : (
          <CodeEditor {...props} />
        )}
      </div>
    </div>
  );
}
