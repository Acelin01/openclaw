import { streamObject } from "ai";
import { z } from "zod";
import { imagePrompt, updateDocumentPrompt } from "../ai/prompts.js";
import { myProvider } from "../ai/providers.js";
import { createDocumentHandler, CreateDocumentCallbackProps, UpdateDocumentCallbackProps } from "../artifacts/server.js";

export const imageDocumentHandler = createDocumentHandler<"image">({
  kind: "image",
  onCreateDocument: async ({ title, dataStream }: CreateDocumentCallbackProps) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: imagePrompt,
      prompt: title,
      schema: z.object({
        image: z.string().describe("Base64 encoded PNG image data"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { image } = object;

        if (image) {
          dataStream.write({
            type: "data-imageDelta",
            data: image ?? "",
            transient: true,
          });

          draftContent = image;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }: UpdateDocumentCallbackProps) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: updateDocumentPrompt(document.content, "image"),
      prompt: description,
      schema: z.object({
        image: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { image } = object;

        if (image) {
          dataStream.write({
            type: "data-imageDelta",
            data: image ?? "",
            transient: true,
          });

          draftContent = image;
        }
      }
    }

    return draftContent;
  },
});
