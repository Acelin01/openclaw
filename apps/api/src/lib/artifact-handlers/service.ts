import { streamObject } from "ai";
import { z } from "zod";
import { servicePrompt, updateDocumentPrompt } from "../ai/prompts.js";
import { myProvider } from "../ai/providers.js";
import { createDocumentHandler, CreateDocumentCallbackProps, UpdateDocumentCallbackProps } from "../artifacts/server.js";

export const serviceDocumentHandler = createDocumentHandler<"service">({
  kind: "service",
  onCreateDocument: async ({ title, dataStream }: CreateDocumentCallbackProps) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: servicePrompt,
      prompt: title,
      schema: z.object({
        title: z.string().describe("Service title"),
        description: z.string().describe("Service description"),
        priceAmount: z.number().optional().describe("Price amount"),
        priceCurrency: z.string().default("USD").describe("Currency code"),
        unit: z.string().optional().describe("Pricing unit (e.g., per hour, fixed)"),
        category: z.string().optional().describe("Service category"),
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
            data: content,
            transient: true,
          });

          draftContent = content;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }: UpdateDocumentCallbackProps) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: updateDocumentPrompt(document.content, "service"),
      prompt: description,
      schema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        priceAmount: z.number().optional(),
        priceCurrency: z.string().optional(),
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
            data: content,
            transient: true,
          });

          draftContent = content;
        }
      }
    }

    return draftContent;
  },
});
