import { smoothStream, streamObject } from "ai";
import { z } from "zod";
import { contractPrompt, updateDocumentPrompt, getRelatedDocumentsPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { getDocumentsByChatId } from "@/lib/db/queries";

export const contractDocumentHandler = createDocumentHandler<"contract">({
  kind: "contract",
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
      system: contractPrompt + documentsPrompt,
      prompt: title,
      schema: z.object({
        title: z.string(),
        content: z.string(),
        relatedDocuments: z.array(z.object({ title: z.string(), id: z.string() })),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const content = JSON.stringify(object, null, 2);

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
        title: z.string(),
        content: z.string(),
        relatedDocuments: z.array(z.object({ title: z.string(), id: z.string() })),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const content = JSON.stringify(object, null, 2);

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
