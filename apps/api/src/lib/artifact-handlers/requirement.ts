import { streamObject } from "ai";
import { z } from "zod";
import { requirementPrompt, updateDocumentPrompt } from "../ai/prompts.js";
import { myProvider } from "../ai/providers.js";
import { createDocumentHandler, CreateDocumentCallbackProps, UpdateDocumentCallbackProps } from "../artifacts/server.js";

export const requirementDocumentHandler = createDocumentHandler<"requirement">({
  kind: "requirement",
  onCreateDocument: async ({ title, dataStream }: CreateDocumentCallbackProps) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: requirementPrompt,
      prompt: title,
      schema: z.object({
        title: z.string().describe("Requirement title"),
        description: z.string().describe("Requirement description"),
        requirements: z.array(z.string()).optional().describe("List of detailed requirements"),
        budgetMin: z.number().optional().describe("Minimum budget"),
        budgetMax: z.number().optional().describe("Maximum budget"),
        deadline: z.string().optional().describe("Deadline (ISO date string)"),
        status: z.enum(["Draft", "Pending Review", "Approved", "Rejected"]).optional().describe("Internal status of the requirement"),
        approvalStatus: z.enum(["Draft", "Pending Review", "Approved", "Rejected"]).default("Draft").describe("Current approval status of the document"),
        reviewer: z.string().optional().describe("Role or Name of the person responsible for reviewing this document"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-requirementDelta",
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
      system: updateDocumentPrompt(document.content, "requirement"),
      prompt: description,
      schema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        requirements: z.array(z.string()).optional(),
        budgetMin: z.number().optional(),
        budgetMax: z.number().optional(),
        deadline: z.string().optional(),
        status: z.enum(["Draft", "Pending Review", "Approved", "Rejected"]).optional(),
        approvalStatus: z.enum(["Draft", "Pending Review", "Approved", "Rejected"]).optional(),
        reviewer: z.string().optional(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-requirementDelta",
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
