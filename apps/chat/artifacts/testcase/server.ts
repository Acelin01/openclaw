import type { UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { saveDocument } from "@/lib/db/queries";
import type { ChatMessage } from "@/lib/types";

export const testcaseDocumentHandler = createDocumentHandler<"testcase">({
  kind: "testcase",
  onCreateDocument: async ({ id, title, dataStream, session }) => {
    let draftContent = "";

    const data = await new Promise<any>((resolve) => {
      dataStream.write({
        type: "data-testcase",
        data: {
          title,
          id,
        },
      });

      dataStream.on("close", () => {
        resolve({
          title,
        });
      });
    });

    draftContent = JSON.stringify({
      title: data.title,
      description: data.description,
      type: data.type || "FUNCTIONAL",
      priority: data.priority || "MEDIUM",
      status: "DRAFT",
    });

    if (session?.user?.id) {
      await saveDocument({
        id,
        title,
        content: draftContent,
        kind: "testcase",
        userId: session.user.id,
      });
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream, session }) => {
    dataStream.write({
      type: "data-testcase",
      data: {
        title: document.title,
        description,
      },
    });

    return JSON.stringify({
      ...JSON.parse(document.content || "{}"),
      description,
      updatedAt: new Date().toISOString(),
    });
  },
});
