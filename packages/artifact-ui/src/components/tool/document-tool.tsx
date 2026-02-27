"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatMessage } from "../../lib/types";
import { DocumentPreview } from "../document-preview";

interface DocumentToolProps {
  part: any;
  isReadonly: boolean;
  type: "create" | "update";
  token?: string;
  sendMessage?: UseChatHelpers<ChatMessage>["sendMessage"];
}

export function DocumentTool({ part, isReadonly, type, token, sendMessage }: DocumentToolProps) {
  const { toolCallId } = part;

  if (!part.output) {
    return (
      <div
        className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-600 dark:bg-yellow-950/30 dark:border-yellow-900"
        key={toolCallId}
      >
        <div className="flex items-center gap-2">
          <span className="animate-pulse">⚠️</span>
          <span>
            {type === "create" ? "Document creation" : "Document update"} was interrupted or is
            pending.
          </span>
        </div>
      </div>
    );
  }

  if (part.output && "error" in part.output) {
    return (
      <div
        className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
        key={toolCallId}
      >
        Error {type === "create" ? "creating" : "updating"} document: {String(part.output.error)}
      </div>
    );
  }

  if (type === "create") {
    return (
      <DocumentPreview
        isReadonly={isReadonly}
        key={toolCallId}
        result={part.output}
        type="create"
        token={token}
        sendMessage={sendMessage}
      />
    );
  }

  return (
    <div className="relative" key={toolCallId}>
      <DocumentPreview
        args={{ ...part.output, isUpdate: true }}
        isReadonly={isReadonly}
        result={part.output}
        type="update"
        token={token}
        sendMessage={sendMessage}
      />
    </div>
  );
}
