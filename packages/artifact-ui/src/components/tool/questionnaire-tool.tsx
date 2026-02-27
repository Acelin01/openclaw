"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatMessage } from "../../lib/types";
import { Questionnaire } from "../questionnaire";

interface QuestionnaireToolProps {
  part: any;
  messageId: string;
  state: string;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
}

export function QuestionnaireTool({
  part,
  messageId,
  state,
  setMessages,
  regenerate,
}: QuestionnaireToolProps) {
  const { toolCallId } = part;

  if (!part.input) return null;

  return (
    <div className="not-prose mb-4 w-full" key={toolCallId}>
      <Questionnaire
        isSubmitted={state === "output-available"}
        onSubmit={async (answers) => {
          setMessages((messages) =>
            messages.map((m) => {
              if (m.id === messageId) {
                return {
                  ...m,
                  parts: m.parts.map((p) => {
                    if (p.type === "tool-askQuestions" && p.toolCallId === toolCallId) {
                      return {
                        ...p,
                        state: "output-available",
                        output: answers,
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
        questions={part.input.questions}
      />
    </div>
  );
}
