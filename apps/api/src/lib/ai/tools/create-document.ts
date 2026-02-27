import { tool, type UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import {
  artifactKinds,
  documentHandlersByArtifactKind,
} from "../../artifacts/server.js";
import type { ChatMessage } from "../../types.js";
import { generateUUID } from "../../utils.js";

type CreateDocumentProps = {
  session: Session; // Using any for session to be compatible with Express request user
  dataStream: UIMessageStreamWriter<ChatMessage>;
  chatId: string;
  messageId?: string;
  agentId?: string;
};

export const createDocument = ({ session, dataStream, chatId, messageId, agentId }: CreateDocumentProps) =>
  tool({
    description:
      "Create a document for writing or content creation. Use the specific kind for different types: 'contract' for agreements, 'approval' for requests, 'task' for todos, 'report' for summaries, 'quote' for pricing, 'project' for project plans, etc. DO NOT use 'project' for contracts or other specific types.",
    inputSchema: z.object({
      title: z.string(),
      kind: z.enum(artifactKinds),
      initialData: z.any().optional(),
    }),
    execute: async ({ title, kind, initialData }) => {
      console.log(`[createDocument] Input - Title: "${title}", Kind: "${kind}"`);
      const lowerTitle = (title || "").toLowerCase();
      const isQuotationTitle =
        /报价单|报价文档|报价方案|报价|询价|询价单|价格|quotation|quote|price|pricing|estimate|budget/.test(title || "") ||
        /software.*(development|dev).*quote|price|quotation/.test(lowerTitle);
      
      const isContractTitle = /合同|协议|合伙协议|劳动合同|服务合同|contract|agreement|legal|terms|policy/.test(lowerTitle);
      const isApprovalTitle = /审批|审批单|审批申请|approval/.test(lowerTitle);
      const isTaskTitle = /任务|待办|task|todo|checklist/.test(lowerTitle);
      const isMessageTitle = /消息|通知|私信|message|notification|alert/.test(lowerTitle);
      const isReportTitle = /报告|日报|周报|月报|季报|年报|report|summary/.test(lowerTitle);
      const isAgentTitle = /智能体|agent/.test(lowerTitle);
      const isDocumentTitle = /文档|协作文档|在线文档|文章|document|article/.test(lowerTitle);
      const isIterationTitle = /迭代|迭代计划|迭代规划|iteration|sprint/.test(lowerTitle);
      const isRiskTitle = /风险|风险管理|风险评估|risk/.test(lowerTitle);
      
      let docKind = kind;
      if (isQuotationTitle && kind !== "quote") {
        console.log(`[createDocument] Overriding kind "${kind}" to "quote" based on title match.`);
        docKind = "quote" as typeof artifactKinds[number];
      } else if (isContractTitle && kind !== "contract") {
        console.log(`[createDocument] Overriding kind "${kind}" to "contract" based on title match.`);
        docKind = "contract" as typeof artifactKinds[number];
      } else if (isApprovalTitle && kind !== "approval") {
        console.log(`[createDocument] Overriding kind "${kind}" to "approval" based on title match.`);
        docKind = "approval" as typeof artifactKinds[number];
      } else if (isTaskTitle && kind !== "task") {
        console.log(`[createDocument] Overriding kind "${kind}" to "task" based on title match.`);
        docKind = "task" as typeof artifactKinds[number];
      } else if (isMessageTitle && kind !== "message") {
        console.log(`[createDocument] Overriding kind "${kind}" to "message" based on title match.`);
        docKind = "message" as typeof artifactKinds[number];
      } else if (isReportTitle && kind !== "report") {
        console.log(`[createDocument] Overriding kind "${kind}" to "report" based on title match.`);
        docKind = "report" as typeof artifactKinds[number];
      } else if (isAgentTitle && kind !== "agent") {
        console.log(`[createDocument] Overriding kind "${kind}" to "agent" based on title match.`);
        docKind = "agent" as typeof artifactKinds[number];
      } else if (isDocumentTitle && kind !== "document") {
        console.log(`[createDocument] Overriding kind "${kind}" to "document" based on title match.`);
        docKind = "document" as typeof artifactKinds[number];
      } else if (isIterationTitle && kind !== "iteration") {
        console.log(`[createDocument] Overriding kind "${kind}" to "iteration" based on title match.`);
        docKind = "iteration" as typeof artifactKinds[number];
      } else if (isRiskTitle && kind !== "risk") {
        console.log(`[createDocument] Overriding kind "${kind}" to "risk" based on title match.`);
        docKind = "risk" as typeof artifactKinds[number];
      }
      
      const id = generateUUID();

      dataStream.write({
        type: "text",
        value: `正在为您生成文档：${title}...`,
      } as any);

      dataStream.write({
        type: "data-kind",
        data: docKind,
        transient: true,
      } as any);

      dataStream.write({
        type: "data-id",
        data: id,
        transient: true,
      } as any);

      dataStream.write({
        type: "data-title",
        data: title,
        transient: true,
      } as any);

      dataStream.write({
        type: "data-clear",
        data: null,
        transient: true,
      } as any);

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === docKind
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${kind}`);
      }

      try {
        await documentHandler.onCreateDocument({
          id,
          title,
          dataStream,
          session,
          chatId,
          messageId,
          agentId,
          initialData,
        });

        dataStream.write({ type: "data-finish", data: null, transient: true } as any);

        return {
          id,
          title,
          kind: docKind,
          content: "A document was created and is now visible to the user.",
        };
      } catch (error) {
        console.error("[createDocument] Error creating document:", error);
        return {
          error: error instanceof Error ? error.message : String(error),
          id,
          title,
          kind: docKind,
          status: "failed"
        };
      }
    },
  });
