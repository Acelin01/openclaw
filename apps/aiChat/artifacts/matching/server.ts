import { streamObject } from "ai";
import { z } from "zod";
import { matchingPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const matchingDocumentHandler = createDocumentHandler<"matching">({
  kind: "matching",
  onCreateDocument: async ({ title, dataStream }) => {
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
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: updateDocumentPrompt(document.content, "matching"),
      prompt: description,
      schema: z.object({
        analysis: z.string().optional().describe("Detailed matching analysis"),
        score: z.number().min(0).max(100).optional().describe("Matching score (0-100)"),
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
});
