import { streamObject } from "ai";
import { z } from "zod";
import { servicePrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const serviceDocumentHandler = createDocumentHandler<"service">({
  kind: "service",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: servicePrompt,
      prompt: title,
      schema: z.object({
        title: z.string(),
        description: z.string(),
        priceAmount: z.number().optional(),
        priceCurrency: z.string().default("CNY"),
        unit: z.string().optional(),
        category: z.string().optional(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-serviceDelta",
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
      system: updateDocumentPrompt(document.content, "service"),
      prompt: description,
      schema: z.object({
        title: z.string(),
        description: z.string(),
        priceAmount: z.number().optional(),
        priceCurrency: z.string().default("CNY"),
        unit: z.string().optional(),
        category: z.string().optional(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-serviceDelta",
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
