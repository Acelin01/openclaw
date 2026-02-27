import { streamObject } from "ai";
import { z } from "zod";
import { resumePrompt, updateDocumentPrompt } from "../ai/prompts.js";
import { myProvider } from "../ai/providers.js";
import { createDocumentHandler, CreateDocumentCallbackProps, UpdateDocumentCallbackProps } from "../artifacts/server.js";

export const resumeDocumentHandler = createDocumentHandler<"resume">({
  kind: "resume",
  onCreateDocument: async ({ title, dataStream }: CreateDocumentCallbackProps) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: resumePrompt,
      prompt: title,
      schema: z.object({
        name: z.string().describe("Candidate name"),
        title: z.string().optional().describe("Professional title"),
        summary: z.string().optional().describe("Professional summary"),
        skills: z.array(z.string()).optional().describe("List of skills"),
        experiences: z.array(z.object({
          company: z.string().describe("Company name"),
          role: z.string().describe("Role/Title"),
          duration: z.string().describe("Duration of employment"),
          description: z.string().describe("Job description"),
        })).optional().describe("Work experiences"),
        education: z.array(z.object({
          school: z.string().describe("School name"),
          degree: z.string().describe("Degree obtained"),
          year: z.string().describe("Year of graduation"),
        })).optional().describe("Education history"),
        location: z.string().optional().describe("Candidate location"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-resumeDelta",
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
      system: updateDocumentPrompt(document.content, "resume"),
      prompt: description,
      schema: z.object({
        name: z.string().optional(),
        title: z.string().optional(),
        summary: z.string().optional(),
        skills: z.array(z.string()).optional(),
        experiences: z.array(z.object({
          company: z.string(),
          role: z.string(),
          duration: z.string(),
          description: z.string(),
        })).optional(),
        education: z.array(z.object({
          school: z.string(),
          degree: z.string(),
          year: z.string(),
        })).optional(),
        location: z.string().optional(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-resumeDelta",
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
