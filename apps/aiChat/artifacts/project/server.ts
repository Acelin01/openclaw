import { streamObject } from "ai";
import { z } from "zod";
import { projectPrompt, updateDocumentPrompt, getRelatedDocumentsPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { getDocumentsByChatId } from "@/lib/db/queries";

export const projectDocumentHandler = createDocumentHandler<"project">({
  kind: "project",
  onCreateDocument: async ({ title, dataStream, chatId }) => {
    let draftContent = "";

    const allDocuments = chatId ? await getDocumentsByChatId({ chatId }) : [];
    const documentsPrompt = getRelatedDocumentsPrompt(allDocuments.map(doc => ({
      id: doc.id,
      title: doc.title,
      kind: doc.kind ?? "text"
    })));

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: projectPrompt + documentsPrompt,
      prompt: title,
      schema: z.object({
        name: z.string(),
        description: z.string(),
        status: z.string(),
        budget: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        team: z.array(z.string()),
        milestones: z.array(z.object({ title: z.string(), date: z.string() })),
        relatedDocuments: z.array(z.object({ 
          id: z.string(),
          title: z.string(),
          kind: z.string(),
          status: z.enum(['creating', 'pending_review', 'ready']).optional(),
          messageId: z.string().optional(),
        })),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const content = JSON.stringify(object, null, 2);

        if (content) {
          dataStream.write({
            type: "data-projectDelta",
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
      system: updateDocumentPrompt(document.content, "project"),
      prompt: description,
      schema: z.object({
        name: z.string(),
        description: z.string(),
        status: z.string(),
        budget: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        team: z.array(z.string()),
        milestones: z.array(z.object({ title: z.string(), date: z.string() })),
        relatedDocuments: z.array(z.object({ 
          id: z.string(),
          title: z.string(),
          kind: z.string(),
          status: z.enum(['creating', 'pending_review', 'ready']).optional(),
          messageId: z.string().optional(),
        })),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const content = JSON.stringify(object, null, 2);

        if (content) {
          dataStream.write({
            type: "data-projectDelta",
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
