import { streamObject } from "ai";
import { z } from "zod";
import { approvalPrompt, updateDocumentPrompt } from "../ai/prompts.js";
import { myProvider } from "../ai/providers.js";
import { createDocumentHandler } from "../artifacts/factory.js";

export const approvalDocumentHandler = createDocumentHandler<"approval">({
  kind: "approval",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: approvalPrompt,
      prompt: title,
      schema: z.object({
        title: z.string().describe("Approval request title"),
        type: z.string().describe("Type of approval (e.g. Leave, Reimbursement)"),
        description: z.string().optional().describe("Detailed justification for approval"),
        status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING").describe("Current status of approval"),
        applicantId: z.string().optional().describe("Identifier of the person applying"),
        approverId: z.string().optional().describe("Identifier of the person approving"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-approvalDelta",
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
      system: updateDocumentPrompt(document.content, "approval"),
      prompt: description,
      schema: z.object({
        title: z.string().optional(),
        type: z.string().optional(),
        applicant: z.string().optional(),
        approver: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["Pending", "Approved", "Rejected"]).optional(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-approvalDelta",
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
