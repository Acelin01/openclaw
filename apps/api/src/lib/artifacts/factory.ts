import type { UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import { saveDocument } from "../db/queries.js";
import type { ArtifactKind } from "../types.js";
import type { Document } from '@prisma/client';
import type { ChatMessage } from "../types.js";

export type SaveDocumentProps = {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
  chatId?: string;
};

export type CreateDocumentCallbackProps = {
  id: string;
  title: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
  session: Session;
  chatId?: string;
  messageId?: string;
  agentId?: string;
  initialData?: any;
};

export type UpdateDocumentCallbackProps = {
  document: Document;
  description: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
  session: Session;
};

export type DocumentHandler<T = ArtifactKind> = {
  kind: T;
  onCreateDocument: (args: CreateDocumentCallbackProps) => Promise<string>;
  onUpdateDocument: (args: UpdateDocumentCallbackProps) => Promise<string>;
};

export function createDocumentHandler<T extends ArtifactKind>(config: {
  kind: T;
  onCreateDocument: (params: CreateDocumentCallbackProps) => Promise<string>;
  onUpdateDocument: (params: UpdateDocumentCallbackProps) => Promise<string>;
}): DocumentHandler<T> {
  return {
    kind: config.kind,
    onCreateDocument: async (args: CreateDocumentCallbackProps) => {
      const draftContent = await config.onCreateDocument({
        id: args.id,
        title: args.title,
        dataStream: args.dataStream,
        session: args.session,
        chatId: args.chatId,
        messageId: args.messageId,
        agentId: args.agentId,
        initialData: args.initialData,
      });

      if (args.session?.user?.id) {
        await saveDocument({
          id: args.id,
          title: args.title,
          kind: config.kind,
          content: draftContent,
          userId: args.session.user.id,
          chatId: args.chatId,
          messageId: args.messageId,
          agentId: args.agentId,
          status: 'PENDING',
        });
      }

      return draftContent;
    },
    onUpdateDocument: async (args: UpdateDocumentCallbackProps) => {
      const draftContent = await config.onUpdateDocument({
        document: args.document,
        description: args.description,
        dataStream: args.dataStream,
        session: args.session,
      });

      if (args.session?.user?.id) {
        await saveDocument({
          id: args.document.id,
          title: args.document.title,
          kind: config.kind,
          content: draftContent,
          userId: args.session.user.id,
          chatId: (args.document as any).chatId,
          messageId: (args.document as any).messageId,
          agentId: (args.document as any).agentId,
          status: 'PENDING',
        });
      }

      return draftContent;
    },
  };
}
