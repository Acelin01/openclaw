import { streamObject } from "ai";
import { z } from "zod";
import { requirementPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const projectRequirementDocumentHandler = createDocumentHandler<"project-requirement">({
  kind: "project-requirement",
  onCreateDocument: async ({ title, dataStream, initialData }) => {
    let draftContent = "";

    if (initialData) {
      const content = JSON.stringify(initialData);
      dataStream.write({
        type: "data-projectRequirementDelta",
        data: content,
        transient: true,
      });
      return content;
    }

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: requirementPrompt,
      prompt: title,
      schema: z.object({
        title: z.string().describe("Requirement title"),
        description: z.string().describe("Requirement description"),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM").describe("Priority"),
        status: z.enum(["DRAFT", "APPROVED", "IN_PROGRESS", "COMPLETED", "REJECTED"]).default("DRAFT").describe("Status"),
        assigneeId: z.string().optional().describe("Assignee ID"),
        assigneeName: z.string().optional().describe("Assignee Name"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-projectRequirementDelta",
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
      system: updateDocumentPrompt(document.content, "project-requirement"),
      prompt: description,
      schema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
        status: z.enum(["DRAFT", "APPROVED", "IN_PROGRESS", "COMPLETED", "REJECTED"]).optional(),
        assigneeId: z.string().optional(),
        assigneeName: z.string().optional(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-projectRequirementDelta",
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
