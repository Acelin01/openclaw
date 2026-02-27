import { streamObject } from "ai";
import { z } from "zod";
import { requirementPrompt, updateDocumentPrompt } from "../ai/prompts.js";
import { myProvider } from "../ai/providers.js";
import { createDocumentHandler, CreateDocumentCallbackProps, UpdateDocumentCallbackProps } from "../artifacts/server.js";

export const projectRequirementDocumentHandler = createDocumentHandler<"project-requirement">({
  kind: "project-requirement",
  onCreateDocument: async ({ title, dataStream, initialData }: CreateDocumentCallbackProps) => {
    let draftContent = "";

    try {
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
    } catch (error) {
      console.error("[projectRequirementDocumentHandler] Error generating content:", error);
      // Fallback to empty JSON if generation fails
      const fallbackContent = JSON.stringify({
        title: title,
        description: "Draft requirement (generation failed)",
        priority: "MEDIUM",
        status: "DRAFT"
      });
      dataStream.write({
        type: "data-projectRequirementDelta",
        data: fallbackContent,
        transient: true,
      });
      return fallbackContent;
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }: UpdateDocumentCallbackProps) => {
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
