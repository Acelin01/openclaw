import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { createDocument } from "./ai/tools/create-document.js";
import type { getWeather } from "./ai/tools/get-weather.js";
import type { requestSuggestions } from "./ai/tools/request-suggestions.js";
import type { updateDocument } from "./ai/tools/update-document.js";
import type { Suggestion } from "@prisma/client";
import type { AppUsage } from "./usage.js";

// Type definition aligned with Prisma enum
export type ArtifactKind =
  | "text"
  | "code"
  | "image"
  | "sheet"
  | "quote"
  | "project"
  | "position"
  | "requirement"
  | "project-requirement"
  | "resume"
  | "service"
  | "matching"
  | "report"
  | "task"
  | "approval"
  | "contract"
  | "message"
  | "web"
  | "agent"
  | "agent-dashboard"
  | "entity-dashboard"
  | "admin"
  | "weather"
  | "document"
  | "iteration"
  | "risk"
  | "defect"
  | "milestone"
  | "financial"
  | "qna"
  | "portfolio"
  | "inquiry"
  | "review";

export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type weatherTool = InferUITool<typeof getWeather>;
type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<
  ReturnType<typeof requestSuggestions>
>;

export type ChatTools = {
  getWeather: weatherTool;
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  webDelta: string;
  quoteDelta: string;
  projectDelta: string;
  positionDelta: string;
  requirementDelta: string;
  projectRequirementDelta: string;
  resumeDelta: string;
  serviceDelta: string;
  matchingDelta: string;
  reportDelta: string;
  taskDelta: string;
  approvalDelta: string;
  contractDelta: string;
  messageDelta: string;
  agentDelta: string;
  agentDashboardDelta: string;
  entityDashboardDelta: string;
  adminDelta: string;
  documentDelta: string;
  iterationDelta: string;
  riskDelta: string;
  defectDelta: string;
  milestoneDelta: string;
  financialDelta: string;
  qnaDelta: string;
  portfolioDelta: string;
  inquiryDelta: string;
  reviewDelta: string;
  adminSchema: { configId: string; schema: any };
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  kind: ArtifactKind;
  clear: null;
  finish: null;
  usage: AppUsage;
};

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
  type: string;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;
