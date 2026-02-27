"use client";

import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { artifactDefinitions } from "../artifacts/index";
import { initialArtifactData, useArtifact } from "../hooks/use-artifact";
import { useDataStream } from "./data-stream-provider";

export function DataStreamHandler({ chatId }: { chatId: string }) {
  const { dataStream, setDataStream } = useDataStream();
  const { setMessages } = useChat({ id: chatId });
  const queryClient = useQueryClient();

  const { artifact, setArtifact, setMetadata } = useArtifact();

  useEffect(() => {
    if (!dataStream?.length) {
      return;
    }

    const newDeltas = dataStream.slice();
    setDataStream([]);

    // Keep track of the kind locally within the loop to find correct definitions
    // even before the state update reflects the change
    let currentKind = artifact.kind;

    for (const part of newDeltas) {
      const delta = part as any;

      if (delta.type === "data-appendMessage") {
        try {
          const message = JSON.parse(delta.data);
          setMessages((prevMessages) =>
            prevMessages.some((m) => m.id === message.id)
              ? prevMessages
              : [...prevMessages, message],
          );
        } catch {}
        continue;
      }

      if (delta.type === "data-kind") {
        currentKind = delta.data;
      }

      if (delta.type === "data-chat-title") {
        queryClient.invalidateQueries({ queryKey: ["history"] });
        continue;
      }

      const artifactDefinition = artifactDefinitions.find((def) => def.kind === currentKind);

      if (artifactDefinition?.onStreamPart) {
        artifactDefinition.onStreamPart({
          streamPart: delta,
          setArtifact,
          setMetadata,
        });
      }

      setArtifact((draftArtifact) => {
        if (!draftArtifact) {
          return { ...initialArtifactData, status: "streaming" };
        }

        switch (delta.type) {
          case "data-collaboration-activity":
            window.dispatchEvent(
              new CustomEvent("collaboration-activity-update", {
                detail: { activity: delta.data },
              }),
            );
            return draftArtifact;
          case "data-id":
            // When artifact metadata changes, ensure the message state is updated to reflect the new tool call output
            setTimeout(() => {
              setMessages((prevMessages) => {
                return prevMessages.map((msg) => {
                  if (msg.role === "assistant") {
                    return { ...msg };
                  }
                  return msg;
                });
              });
            }, 0);

            return {
              ...draftArtifact,
              documentId: delta.data,
              status: "streaming",
              isVisible: true,
            };

          case "data-title":
            return {
              ...draftArtifact,
              title: delta.data,
              status: "streaming",
              isVisible: true,
            };

          case "data-kind":
            return {
              ...draftArtifact,
              kind: delta.data,
              status: "streaming",
              isVisible: true,
            };

          case "data-clear":
            return {
              ...draftArtifact,
              content: "",
              status: "streaming",
            };

          case "data-finish":
            return {
              ...draftArtifact,
              status: "idle",
            };

          case "data-approval-required":
            // Handle approval requirement
            return {
              ...draftArtifact,
              kind: delta.data.kind,
              title: delta.data.title,
              status: "idle",
              isVisible: true,
              approvalStatus: "PENDING",
            };

          case "data-step":
            window.dispatchEvent(
              new CustomEvent("collaboration-step", {
                detail: { step: delta.data },
              }),
            );
            return {
              ...draftArtifact,
              steps: [...(draftArtifact.steps || []), delta.data],
            };
          case "data-task-list":
            window.dispatchEvent(
              new CustomEvent("collaboration-task-list", {
                detail: { tasks: delta.data },
              }),
            );
            return draftArtifact;
          case "data-task-update":
            window.dispatchEvent(
              new CustomEvent("collaboration-task-update", {
                detail: { update: delta.data },
              }),
            );
            return draftArtifact;

          case "data-document-preview":
            // Handle real-time document preview synchronization
            return {
              ...draftArtifact,
              documentId: delta.data.id,
              title: delta.data.title,
              kind: delta.data.kind,
              content: delta.data.content || "",
              isVisible: true,
              status: "idle", // It's a preview of an existing doc, not necessarily streaming a new one
            };

          case "data-project-preview":
            // Handle real-time project preview synchronization
            // Note: We might want to show this in a special UI or just update the current artifact if it's a project kind
            return {
              ...draftArtifact,
              documentId: delta.data.id,
              title: delta.data.name,
              kind: "project",
              content:
                typeof delta.data.description === "string"
                  ? delta.data.description
                  : JSON.stringify(delta.data),
              isVisible: true,
              status: "idle",
            };

          case "data-project-status":
            // Dispatch custom event for project status updates
            window.dispatchEvent(
              new CustomEvent("project-status-update", {
                detail: delta.data,
              }),
            );
            return draftArtifact;

          default:
            return draftArtifact;
        }
      });
    }
  }, [dataStream, setArtifact, setMetadata, artifact, setDataStream, setMessages, queryClient]);

  return null;
}
