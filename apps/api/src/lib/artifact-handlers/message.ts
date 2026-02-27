import { streamObject } from "ai";
import { z } from "zod";
import { messagePrompt, updateDocumentPrompt } from "../ai/prompts.js";
import { myProvider } from "../ai/providers.js";
import { createDocumentHandler } from "../artifacts/factory.js";

export const messageDocumentHandler = createDocumentHandler<"message">({
  kind: "message",
  onCreateDocument: async ({ title, dataStream, initialData }) => {
    let draftContent = "";

    if (initialData?.content) {
      draftContent = initialData.content;
      dataStream.write({
        type: "data-messageDelta",
        data: draftContent,
        transient: true,
      });
      return draftContent;
    }

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: messagePrompt,
      prompt: title,
      schema: z.object({
        content: z.string().describe("Message content in Markdown"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { content } = object;

        if (content) {
          dataStream.write({
            type: "data-messageDelta",
            data: content ?? "",
            transient: true,
          });

          draftContent = content;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: updateDocumentPrompt(document.content, "message"),
      prompt: description,
      schema: z.object({
        content: z.string().optional().describe("Message content in Markdown"),
        senderId: z.string().optional().describe("Sender identifier"),
        receiverId: z.string().optional().describe("Receiver identifier"),
        senderType: z.enum(["USER", "AI", "SYSTEM"]).optional().describe("Type of sender"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { content } = object;

        if (content) {
          dataStream.write({
            type: "data-messageDelta",
            data: content ?? "",
            transient: true,
          });

          draftContent = content;
        }
      }
    }

    return draftContent;
  },
});
