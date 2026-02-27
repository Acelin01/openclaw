import { streamObject } from "ai";
import { z } from "zod";
import { iterationPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const iterationDocumentHandler = createDocumentHandler<"iteration">({
  kind: "iteration",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: iterationPrompt,
      prompt: title,
      schema: z.object({
        title: z.string().describe("Iteration name"),
        description: z.string().describe("Iteration goal and description"),
        status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]).describe("Iteration status"),
        startDate: z.string().describe("Start date (YYYY-MM-DD)"),
        endDate: z.string().describe("End date (YYYY-MM-DD)"),
        goals: z.array(z.string()).describe("List of iteration goals"),
        requirements: z.array(z.object({
            title: z.string(),
            priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
            status: z.enum(["DRAFT", "REVIEW", "APPROVED"])
        })).optional().describe("Associated requirements"),
        tasks: z.array(z.object({
            title: z.string(),
            assignee: z.string().optional(),
            estimatedHours: z.number().optional(),
            status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
            priority: z.enum(["LOW", "MEDIUM", "HIGH"])
        })).optional().describe("Tasks in this iteration")
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const content = JSON.stringify(object, null, 2);

        if (content) {
          dataStream.write({
            type: "data-iterationDelta",
            data: content ?? "",
            transient: true,
          } as any);

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
      system: updateDocumentPrompt(document.content, "iteration"),
      prompt: description,
      schema: z.object({
        title: z.string().describe("Iteration name"),
        description: z.string().describe("Iteration goal and description"),
        status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]).describe("Iteration status"),
        startDate: z.string().describe("Start date (YYYY-MM-DD)"),
        endDate: z.string().describe("End date (YYYY-MM-DD)"),
        goals: z.array(z.string()).describe("List of iteration goals"),
        requirements: z.array(z.object({
            title: z.string(),
            priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
            status: z.enum(["DRAFT", "REVIEW", "APPROVED"])
        })).optional().describe("Associated requirements"),
        tasks: z.array(z.object({
            title: z.string(),
            assignee: z.string().optional(),
            estimatedHours: z.number().optional(),
            status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
            priority: z.enum(["LOW", "MEDIUM", "HIGH"])
        })).optional().describe("Tasks in this iteration")
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const content = JSON.stringify(object, null, 2);

        if (content) {
          dataStream.write({
            type: "data-iterationDelta",
            data: content ?? "",
            transient: true,
          } as any);

          draftContent = content;
        }
      }
    }

    return draftContent;
  },
});
