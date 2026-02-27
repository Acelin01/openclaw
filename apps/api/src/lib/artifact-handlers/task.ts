import { streamObject } from "ai";
import { z } from "zod";
import { taskPrompt, updateDocumentPrompt } from "../ai/prompts.js";
import { myProvider } from "../ai/providers.js";
import { createDocumentHandler } from "../artifacts/factory.js";

export const taskDocumentHandler = createDocumentHandler<"task">({
  kind: "task",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: taskPrompt,
      prompt: title,
      schema: z.object({
        title: z.string(),
        description: z.string(),
        assignee: z.string(),
        dueDate: z.string(),
        priority: z.enum(["Low", "Medium", "High"]),
        status: z.enum(["To Do", "In Progress", "Done"]),
        approvalStatus: z.enum(["Draft", "Pending Review", "Approved", "Rejected"]).default("Draft").describe("Current approval status of the task document"),
        reviewer: z.string().optional().describe("Role or Name of the person responsible for reviewing this task"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-taskDelta",
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
      system: updateDocumentPrompt(document.content, "task"),
      prompt: description,
      schema: z.object({
        title: z.string().optional().describe("Task title"),
        description: z.string().optional().describe("Detailed description of the task"),
        dueDate: z.string().optional().describe("Due date in YYYY-MM-DD format"),
        status: z.enum(["To Do", "In Progress", "Done"]).optional().describe("Current status of the task"),
        priority: z.enum(["Low", "Medium", "High"]).optional().describe("Priority level of the task"),
        approvalStatus: z.enum(["Draft", "Pending Review", "Approved", "Rejected"]).optional().describe("Current approval status of the task document"),
        reviewer: z.string().optional().describe("Role or Name of the person responsible for reviewing this task"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-taskDelta",
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
