import { streamObject } from "ai";
import { z } from "zod";
import { approvalPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const approvalDocumentHandler = createDocumentHandler<"approval">({
  kind: "approval",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: approvalPrompt,
      prompt: title,
      schema: z.object({
        title: z.string(),
        requester: z.string(),
        type: z.string(),
        details: z.string(),
        status: z.enum(["Pending", "Approved", "Rejected"]),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const content = JSON.stringify(object, null, 2);

        if (content) {
          dataStream.write({
            type: "data-approvalDelta",
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
      system: updateDocumentPrompt(document.content, "approval"),
      prompt: description,
      schema: z.object({
        title: z.string(),
        requester: z.string(),
        type: z.string(),
        details: z.string(),
        status: z.enum(["Pending", "Approved", "Rejected"]),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const content = JSON.stringify(object, null, 2);

        if (content) {
          dataStream.write({
            type: "data-approvalDelta",
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
