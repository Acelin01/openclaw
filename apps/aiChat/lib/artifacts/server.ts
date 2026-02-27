import type { UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import { codeDocumentHandler } from "@/artifacts/code/server";
import { sheetDocumentHandler } from "@/artifacts/sheet/server";
import { textDocumentHandler } from "@/artifacts/text/server";
import { quoteDocumentHandler } from "@/artifacts/quote/server";
import { imageDocumentHandler } from "@/artifacts/image/server";
import { projectDocumentHandler } from "@/artifacts/project/server";
import { positionDocumentHandler } from "@/artifacts/position/server";
import { requirementDocumentHandler } from "@/artifacts/requirement/server";
import { projectRequirementDocumentHandler } from "@/artifacts/project-requirement/server";
import { resumeDocumentHandler } from "@/artifacts/resume/server";
import { serviceDocumentHandler } from "@/artifacts/service/server";
import { matchingDocumentHandler } from "@/artifacts/matching/server";
import { approvalDocumentHandler } from "@/artifacts/approval/server";
import { contractDocumentHandler } from "@/artifacts/contract/server";
import { messageDocumentHandler } from "@/artifacts/message/server";
import { reportDocumentHandler } from "@/artifacts/report/server";
import { taskDocumentHandler } from "@/artifacts/task/server";
import { webDocumentHandler } from "@/artifacts/web/server";
import { agentDocumentHandler } from "@/artifacts/agent/server";
import { adminDocumentHandler } from "@/artifacts/admin/server";
import { documentHandler } from "@/artifacts/document/server";
import { iterationDocumentHandler } from "@/artifacts/iteration/server";
import { riskDocumentHandler } from "@/artifacts/risk/server";
import { defectDocumentHandler } from "@/artifacts/defect/server";
import { milestoneDocumentHandler } from "@/artifacts/milestone/server";
import type { ArtifactKind } from "@uxin/artifact-ui";
import { artifactKinds as artifactKindsFromKinds } from "./kinds";
import { saveDocument } from "../db/queries";
import type { Document } from "../db/schema";
import type { ChatMessage } from "../types";

export type SaveDocumentProps = {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
  chatId?: string;
  agentId?: string;
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
  onCreateDocument: (args: CreateDocumentCallbackProps) => Promise<void>;
  onUpdateDocument: (args: UpdateDocumentCallbackProps) => Promise<void>;
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

      console.log(`[createDocumentHandler] Saving ${config.kind} document ${args.id} with content length: ${draftContent?.length}`);

      if (args.session?.user?.id) {
        await saveDocument({
          id: args.id,
          title: args.title,
          content: draftContent,
          kind: config.kind,
          userId: args.session.user.id,
          chatId: args.chatId,
          messageId: args.messageId,
          agentId: args.agentId,
          status: 'PENDING',
        });
      }

      return;
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
          content: draftContent,
          kind: config.kind as any,
          userId: args.session.user.id,
          chatId: (args.document as any).chatId,
          messageId: (args.document as any).messageId,
          agentId: (args.document as any).agentId,
          status: 'PENDING',
        });
      }

      return;
    },
  };
}

/*
 * Use this array to define the document handlers for each artifact kind.
 */
export const documentHandlersByArtifactKind: DocumentHandler[] = [
  textDocumentHandler,
  codeDocumentHandler,
  sheetDocumentHandler,
  quoteDocumentHandler,
  imageDocumentHandler,
  projectDocumentHandler,
  positionDocumentHandler,
  requirementDocumentHandler,
  projectRequirementDocumentHandler,
  resumeDocumentHandler,
  serviceDocumentHandler,
  matchingDocumentHandler,
  approvalDocumentHandler,
  contractDocumentHandler,
  messageDocumentHandler,
  reportDocumentHandler,
  taskDocumentHandler,
  webDocumentHandler,
  agentDocumentHandler,
  adminDocumentHandler,
  documentHandler,
  iterationDocumentHandler,
  riskDocumentHandler,
  defectDocumentHandler,
  milestoneDocumentHandler,
];

export const artifactKinds = artifactKindsFromKinds;
