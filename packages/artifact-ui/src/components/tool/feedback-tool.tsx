"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatMessage } from "../../lib/types";
import { FeedbackBox } from "../feedback-box";

interface FeedbackToolProps {
  part: any;
  messageId: string;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
}

export function FeedbackTool({ part, messageId, setMessages, regenerate }: FeedbackToolProps) {
  const { toolCallId, state, output, input } = part;

  const handleSubmit = async (decision: "accepted" | "rejected") => {
    setMessages((messages) =>
      messages.map((m) => {
        if (m.id === messageId) {
          return {
            ...m,
            parts: m.parts.map((p) => {
              if (p.type === "tool-provideFeedback" && p.toolCallId === toolCallId) {
                return {
                  ...p,
                  state: "output-available",
                  output: { ...output, decision, userConfirmed: true },
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
  };

  const handleAccept = () => handleSubmit("accepted");
  const handleReject = () => handleSubmit("rejected");

  // During streaming or if output is already available
  const displayData = state === "output-available" ? output : input;

  if (displayData) {
    return (
      <div className="not-prose mb-4 w-full" key={toolCallId}>
        <FeedbackBox
          title={displayData.title}
          content={displayData.content}
          suggestion={displayData.suggestion}
          type={displayData.type || "info"}
          showActions={!!displayData.suggestion && state !== "output-available"}
          onAccept={handleAccept}
          onReject={handleReject}
          statusText={
            state === "output-available"
              ? output.decision === "accepted"
                ? "已确认"
                : "已拒绝"
              : undefined
          }
        />
      </div>
    );
  }

  return null;
}
