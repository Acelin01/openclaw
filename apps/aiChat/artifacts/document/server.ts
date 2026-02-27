import { streamObject } from "ai";
import { z } from "zod";
import { documentPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const documentHandler = createDocumentHandler<"document">({
  kind: "document",
  onCreateDocument: async ({ title, dataStream }) => {
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
  onUpdateDocument: async ({ document, description, dataStream }) => {
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
