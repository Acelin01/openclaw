import { streamObject } from "ai";
import { z } from "zod";
import { agentPrompt, updateDocumentPrompt } from "../ai/prompts.js";
import { myProvider } from "../ai/providers.js";
import { createDocumentHandler } from "../artifacts/server.js";

export const agentDocumentHandler = createDocumentHandler<"agent">({
  kind: "agent",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: agentPrompt,
      prompt: title,
      schema: z.object({
        name: z.string(),
        prompt: z.string(),
        mermaid: z.string().optional(),
        isCallableByOthers: z.boolean(),
        identifier: z.string().optional(),
        whenToCall: z.string().optional(),
        selectedTools: z.array(z.string()),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const content = JSON.stringify(object, null, 2);

        if (content) {
          dataStream.write({
            type: "data-agentDelta",
            data: content ?? "",
            transient: true,
          } as any);

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
      system: updateDocumentPrompt(document.content, "agent"),
      prompt: description,
      schema: z.object({
        name: z.string(),
        prompt: z.string(),
        mermaid: z.string().optional(),
        isCallableByOthers: z.boolean(),
        identifier: z.string().optional(),
        whenToCall: z.string().optional(),
        selectedTools: z.array(z.string()),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const content = JSON.stringify(object, null, 2);

        if (content) {
          dataStream.write({
            type: "data-agentDelta",
            data: content ?? "",
            transient: true,
          } as any);

          draftContent = content;
        }
      }
    }

    return draftContent;
  },
});
