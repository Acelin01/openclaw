import { streamObject } from "ai";
import { z } from "zod";
import { documentPrompt, updateDocumentPrompt } from "../ai/prompts.js";
import { myProvider } from "../ai/providers.js";
import { createDocumentHandler, CreateDocumentCallbackProps, UpdateDocumentCallbackProps } from "../artifacts/server.js";

export const documentHandler = createDocumentHandler<"document">({
  kind: "document",
  onCreateDocument: async ({ title, dataStream }: CreateDocumentCallbackProps) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: documentPrompt,
      prompt: title,
      schema: z.object({
        title: z.string().describe("Document title"),
        content: z.string().describe("Document content in Markdown"),
        lastUpdated: z.string().optional().describe("Last updated time"),
        collaborators: z.array(z.string()).optional().describe("Collaborators list"),
        status: z.enum(["Draft", "Pending Review", "Approved", "Rejected"]).default("Draft").describe("Current status of the document"),
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
            type: "data-documentDelta",
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
      system: updateDocumentPrompt(document.content, "document"),
      prompt: description,
      schema: z.object({
        title: z.string().optional(),
        content: z.string().optional(),
        lastUpdated: z.string().optional(),
        collaborators: z.array(z.string()).optional(),
        status: z.enum(["Draft", "Pending Review", "Approved", "Rejected"]).optional(),
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
            type: "data-documentDelta",
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
