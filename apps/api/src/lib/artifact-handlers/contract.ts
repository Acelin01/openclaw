import { streamObject } from "ai";
import { z } from "zod";
import { contractPrompt, updateDocumentPrompt } from "../ai/prompts.js";
import { myProvider } from "../ai/providers.js";
import { createDocumentHandler } from "../artifacts/factory.js";

export const contractDocumentHandler = createDocumentHandler<"contract">({
  kind: "contract",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: contractPrompt,
      prompt: title,
      schema: z.object({
        content: z.string().describe("Contract content in Markdown"),
        partyA: z.string().optional().describe("First party (e.g. Employer)"),
        partyB: z.string().optional().describe("Second party (e.g. Employee)"),
        startDate: z.string().optional().describe("Contract start date"),
        endDate: z.string().optional().describe("Contract end date"),
        status: z.enum(["DRAFT", "ACTIVE", "TERMINATED"]).default("DRAFT").describe("Contract status"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { content } = object;

        if (content) {
          dataStream.write({
            type: "data-contractDelta",
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
      system: updateDocumentPrompt(document.content, "contract"),
      prompt: description,
      schema: z.object({
        content: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { content } = object;

        if (content) {
          dataStream.write({
            type: "data-contractDelta",
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
