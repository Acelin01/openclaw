import { tool, type UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import {
  documentHandlersByArtifactKind,
} from "@/lib/artifacts/server";
import { artifactKinds } from "@/lib/artifacts/kinds";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";

type CreateDocumentProps = {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
  chatId: string;
  messageId?: string;
  agentId?: string;
};

export const createDocument = ({ session, dataStream, chatId, messageId, agentId }: CreateDocumentProps) =>
  tool({
    description:
      "Create a document for writing or content creation. Use the specific kind for different types: 'contract' for agreements, 'approval' for requests, 'report' for summaries, 'quote' for pricing, 'project' for project plans, etc. DO NOT use this for structured task lists or todos; use the 'createTasks' tool instead. DO NOT use 'project' for contracts or other specific types.",
    inputSchema: z.object({
      title: z.string(),
      kind: z.enum(artifactKinds),
      initialData: z.any().optional(),
    }),
    execute: async ({ title, kind, initialData }) => {
      const lowerTitle = (title || "").toLowerCase();
      const isQuotationTitle =
        /报价单|报价文档|报价方案|报价|询价单|quotation|quote/.test(lowerTitle) ||
        /software.*(development|dev).*quote|price|quotation/.test(lowerTitle);
      
      const isContractTitle = /合同|协议|合伙协议|劳动合同|服务合同|合作协议|contract|agreement|legal|terms|policy/.test(lowerTitle);
      const isApprovalTitle = /审批|审批单|审批申请|申请单|报销|请假|加班|申请|approval/.test(lowerTitle);
      const isMessageTitle = /消息|通知|私信|message|notification|alert/.test(lowerTitle);
      const isReportTitle = /报告|日报|周报|月报|季报|年报|report|summary/.test(lowerTitle);
      const isProjectTitle = /项目|项目文档|项目计划|项目方案|project/.test(lowerTitle);
      const isPositionTitle = /岗位|职位|招聘|JD|position|job description/.test(lowerTitle);
      const isRequirementTitle = /需求|需求文档|PRD|requirement/.test(lowerTitle);
      const isResumeTitle = /简历|CV|resume/.test(lowerTitle);
      const isServiceTitle = /服务|服务描述|service/.test(lowerTitle);
      const isMatchingTitle = /配对|匹配|matching/.test(lowerTitle);
      const isAgentTitle = /智能体|agent/.test(lowerTitle);
      const isDocumentTitle = /文档|协作文档|在线文档|文章|document|article/.test(lowerTitle);
      const isIterationTitle = /迭代|迭代计划|Sprint|iteration/.test(lowerTitle);
      const isRiskTitle = /风险|风险管理|风险评估|risk/.test(lowerTitle);
      const isDefectTitle = /缺陷|缺陷报告|bug|defect/.test(lowerTitle);
      const isMilestoneTitle = /里程碑|阶段性目标|milestone/.test(lowerTitle);

      let docKind = kind;
      if (isQuotationTitle && kind !== "quote") {
        docKind = "quote" as typeof artifactKinds[number];
      } else if (isApprovalTitle && kind !== "approval") {
        docKind = "approval" as typeof artifactKinds[number];
      } else if (isContractTitle && kind !== "contract") {
        docKind = "contract" as typeof artifactKinds[number];
      } else if (isMessageTitle && kind !== "message") {
        docKind = "message" as typeof artifactKinds[number];
      } else if (isReportTitle && kind !== "report") {
        docKind = "report" as typeof artifactKinds[number];
      } else if (isProjectTitle && kind !== "project") {
        docKind = "project" as typeof artifactKinds[number];
      } else if (isPositionTitle && kind !== "position") {
        docKind = "position" as typeof artifactKinds[number];
      } else if (isRequirementTitle && kind !== "requirement") {
        docKind = "project-requirement" as typeof artifactKinds[number];
      } else if (isResumeTitle && kind !== "resume") {
        docKind = "resume" as typeof artifactKinds[number];
      } else if (isServiceTitle && kind !== "service") {
        docKind = "service" as typeof artifactKinds[number];
      } else if (isMatchingTitle && kind !== "matching") {
        docKind = "matching" as typeof artifactKinds[number];
      } else if (isAgentTitle && kind !== "agent") {
        docKind = "agent" as typeof artifactKinds[number];
      } else if (isDocumentTitle && kind !== "document") {
        docKind = "document" as typeof artifactKinds[number];
      } else if (isIterationTitle && kind !== "iteration") {
        docKind = "iteration" as typeof artifactKinds[number];
      } else if (isRiskTitle && kind !== "risk") {
        docKind = "risk" as typeof artifactKinds[number];
      } else if (isDefectTitle && kind !== "defect") {
        docKind = "defect" as typeof artifactKinds[number];
      } else if (isMilestoneTitle && kind !== "milestone") {
        docKind = "milestone" as typeof artifactKinds[number];
      }
      const id = generateUUID();

      dataStream.write({
        type: "data-kind",
        data: docKind,
        transient: true,
      });

      dataStream.write({
        type: "data-id",
        data: id,
        transient: true,
      });

      dataStream.write({
        type: "data-title",
        data: title,
        transient: true,
      });

      dataStream.write({
        type: "data-clear",
        data: null,
        transient: true,
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === docKind
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${kind}`);
      }

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

      dataStream.write({ type: "data-finish", data: null, transient: true });

      return {
        id,
        title,
        kind: docKind,
        content: "A document was created and is now visible to the user.",
      };
    },
  });
