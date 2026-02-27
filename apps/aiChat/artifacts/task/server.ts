import { streamObject } from "ai";
import { z } from "zod";
import { taskPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

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
        assignee: z.string(),
        dueDate: z.string(),
        description: z.string(),
        status: z.enum(["Todo", "In Progress", "Done"]),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const content = JSON.stringify(object, null, 2);

        if (content) {
          dataStream.write({
            type: "data-taskDelta",
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
      system: updateDocumentPrompt(document.content, "task"),
      prompt: description,
      schema: z.object({
        title: z.string(),
        assignee: z.string(),
        dueDate: z.string(),
        description: z.string(),
        status: z.enum(["Todo", "In Progress", "Done"]),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const content = JSON.stringify(object, null, 2);

        if (content) {
          dataStream.write({
            type: "data-taskDelta",
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
