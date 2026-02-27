import { streamObject } from "ai";
import { z } from "zod";
import { matchingPrompt, updateDocumentPrompt } from "../ai/prompts.js";
import { myProvider } from "../ai/providers.js";
import { createDocumentHandler, CreateDocumentCallbackProps, UpdateDocumentCallbackProps } from "../artifacts/server.js";

export const matchingDocumentHandler = createDocumentHandler<"matching">({
  kind: "matching",
  onCreateDocument: async ({ title, dataStream }: CreateDocumentCallbackProps) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: matchingPrompt,
      prompt: title,
      schema: z.object({
        title: z.string().describe("Title of the analysis"),
        analysis: z.string().describe("Detailed matching analysis"),
        score: z.number().min(0).max(100).describe("Matching score (0-100)"),
        recommendation: z.string().optional().describe("Recommendation or next steps"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-matchingDelta",
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
      system: updateDocumentPrompt(document.content, "matching"),
      prompt: description,
      schema: z.object({
        analysis: z.string().optional(),
        score: z.number().optional(),
        recommendation: z.string().optional(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-matchingDelta",
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
