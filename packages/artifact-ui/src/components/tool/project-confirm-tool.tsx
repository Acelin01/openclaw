"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatMessage } from "../../lib/types";
import { ProjectModificationConfirmation } from "../project-modification-confirmation";

interface ProjectConfirmToolProps {
  part: any;
  messageId: string;
  state: string;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
}

export function ProjectConfirmTool({
  part,
  messageId,
  state,
  setMessages,
  regenerate,
}: ProjectConfirmToolProps) {
  const { toolCallId } = part;

  if (!part.input) return null;

  return (
    <div className="not-prose mb-4 w-full" key={toolCallId}>
      <ProjectModificationConfirmation
        isActioned={state === "output-available"}
        onConfirm={async (confirmed) => {
          const result = {
            status: confirmed ? "approved" : "rejected",
          };

          setMessages((messages) =>
            messages.map((m) => {
              if (m.id === messageId) {
                return {
                  ...m,
                  parts: m.parts.map((p) => {
                    if (
                      p.type === "tool-confirmProjectModification" &&
                      p.toolCallId === toolCallId
                    ) {
                      return {
                        ...p,
                        state: "output-available",
                        output: result,
                      };
                    }
                    return p;
                  }),
                } as ChatMessage;
              }
              return m;
            }),
          );

          // After updating messages with the tool result, trigger regenerate to continue AI thinking
          await new Promise((resolve) => setTimeout(resolve, 50));
          regenerate();
        }}
        projectData={part.input as any}
        status={state === "output-available" ? (part.output as any).status : undefined}
      />
    </div>
  );
}
