import { streamObject } from "ai";
import { z } from "zod";
import { reportPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const reportDocumentHandler = createDocumentHandler<"report">({
  kind: "report",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: reportPrompt,
      prompt: title,
      schema: z.object({
        title: z.string().describe("Title of the report"),
        type: z.enum(["Daily", "Weekly", "Monthly"]).describe("Type of report"),
        date: z.string().describe("Date of the report (YYYY-MM-DD)"),
        summary: z.string().describe("Work content summary in Markdown"),
        problems: z.string().describe("Problems and solutions in Markdown"),
        plans: z.string().describe("Next steps in Markdown"),
        assistance: z.string().describe("Assistance needed in Markdown"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-reportDelta",
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
      system: updateDocumentPrompt(document.content, "report"),
      prompt: description,
      schema: z.object({
        title: z.string().optional().describe("Title of the report"),
        type: z.enum(["Daily", "Weekly", "Monthly"]).optional().describe("Type of report"),
        date: z.string().optional().describe("Date of the report (YYYY-MM-DD)"),
        summary: z.string().optional().describe("Work content summary in Markdown"),
        problems: z.string().optional().describe("Problems and solutions in Markdown"),
        plans: z.string().optional().describe("Next steps in Markdown"),
        assistance: z.string().optional().describe("Assistance needed in Markdown"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-reportDelta",
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
