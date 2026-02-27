import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { ArtifactKind } from "@/components/artifact";
import type { createDocument } from "./ai/tools/create-document";
import type { createTasks } from "./ai/tools/create-tasks";
import type { getWeather } from "./ai/tools/get-weather";
import type { provideFeedback } from "./ai/tools/provide-feedback";
import type { requestSuggestions } from "./ai/tools/request-suggestions";
import type { updateDocument } from "./ai/tools/update-document";
import type { updateProjectStatus } from "./ai/tools/update-project-status";
import type { updateTasks } from "./ai/tools/update-tasks";
import type { Suggestion } from "./db/schema";
import type { AppUsage } from "./usage";

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
type provideFeedbackTool = InferUITool<typeof provideFeedback>;
type updateProjectStatusTool = InferUITool<
  ReturnType<typeof updateProjectStatus>
>;
type createTasksTool = InferUITool<ReturnType<typeof createTasks>>;
type updateTasksTool = InferUITool<ReturnType<typeof updateTasks>>;

export type ChatTools = {
  getWeather: weatherTool;
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
  provideFeedback: provideFeedbackTool;
  updateProjectStatus: updateProjectStatusTool;
  createTasks: createTasksTool;
  updateTasks: updateTasksTool;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  kind: ArtifactKind;
  clear: null;
  finish: null;
  usage: AppUsage;
  "project-status": {
    phase: string;
    progress: number;
    status?: string;
  };
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
};
