import { tool, type UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { artifactKinds } from "@/lib/artifacts/kinds";
import { getDocumentsByUserId } from "@/lib/db/queries";
import type { ChatMessage } from "@/lib/types";

type GetDocumentsProps = {
  session: Session;
  dataStream?: UIMessageStreamWriter<ChatMessage>;
};

export const getDocuments = ({ session, dataStream }: GetDocumentsProps) =>
  tool({
    description:
      "Query existing documents by kind (e.g., 'contract', 'approval', 'task', 'project', 'requirement', etc.) to retrieve data for analysis and planning.",
    inputSchema: z.object({
      kind: z.enum(artifactKinds).optional().describe("The type of documents to query"),
    }),
    execute: async ({ kind }) => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      const documents = await getDocumentsByUserId({
        userId: session.user.id,
        kind: kind as any,
      });

      if (dataStream && documents.length > 0) {
        for (const doc of documents) {
          dataStream.write({
            type: "data-document-preview" as any,
            data: {
              id: doc.id,
              title: doc.title,
              kind: doc.kind,
              content: doc.content,
              createdAt: doc.createdAt,
            } as any,
          });
          // 模拟流式延迟，逐个推送预览
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return {
        documents: documents.map((doc) => ({
          id: doc.id,
          title: doc.title,
          kind: doc.kind,
          createdAt: doc.createdAt,
          // We return truncated content to avoid token limits, AI can request full content if needed
          contentSnippet: doc.content?.substring(0, 1000),
        })),
        count: documents.length,
      };
    },
  });
