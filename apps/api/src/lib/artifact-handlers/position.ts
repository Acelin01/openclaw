import { streamObject } from "ai";
import { z } from "zod";
import { positionPrompt, updateDocumentPrompt } from "../ai/prompts.js";
import { myProvider } from "../ai/providers.js";
import { createDocumentHandler, CreateDocumentCallbackProps, UpdateDocumentCallbackProps } from "../artifacts/server.js";

export const positionDocumentHandler = createDocumentHandler<"position">({
  kind: "position",
  onCreateDocument: async ({ title, dataStream }: CreateDocumentCallbackProps) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: positionPrompt,
      prompt: title,
      schema: z.object({
        title: z.string().describe("Position title"),
        description: z.string().describe("Job description"),
        companyName: z.string().optional().describe("Company name"),
        location: z.string().optional().describe("Job location"),
        employmentType: z.string().optional().describe("Employment type (e.g., full-time, part-time)"),
        salaryMin: z.number().optional().describe("Minimum salary"),
        salaryMax: z.number().optional().describe("Maximum salary"),
        requirements: z.array(z.string()).optional().describe("Job requirements"),
        tags: z.array(z.string()).optional().describe("Job tags"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-positionDelta",
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
      system: updateDocumentPrompt(document.content, "position"),
      prompt: description,
      schema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        companyName: z.string().optional(),
        location: z.string().optional(),
        employmentType: z.string().optional(),
        salaryMin: z.number().optional(),
        salaryMax: z.number().optional(),
        requirements: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-positionDelta",
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
