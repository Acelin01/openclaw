import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { ArtifactKind } from "@uxin/artifact-ui";
import type { createDocument } from "./ai/tools/create-document";
import type { createTasks } from "./ai/tools/create-tasks";
import type { createMermaid } from "./ai/tools/create-mermaid";
import type { updateTasks } from "./ai/tools/update-task";
import type { searchResources } from "./ai/tools/search-resources";
import type { createApproval } from "./ai/tools/create-approval";
import type { setReminder } from "./ai/tools/set-reminder";
import type { getProjectRequirements } from "./ai/tools/get-project-requirements";
import type { getProjects } from "./ai/tools/get-projects";
import type { getDocuments } from "./ai/tools/get-documents";
import type { getWeather } from "./ai/tools/get-weather";
import type { requestSuggestions } from "./ai/tools/request-suggestions";
import type { updateDocument } from "./ai/tools/update-document";
import type { queryResources } from "./ai/tools/query-resources";
import type { askQuestions } from "./ai/tools/ask-questions";
import type { confirmProjectModification } from "./ai/tools/confirm-project-modification";
import type { showAgentDashboard } from "./ai/tools/show-agent-dashboard";
import type { showEntityDashboard } from "./ai/tools/show-entity-dashboard";
import type { Suggestion, Vote } from "./db/schema";
import type { AppUsage } from "./usage";

export type { Suggestion, Vote };

export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
  authorName: z.string().optional(),
  authorAvatar: z.string().optional(),
  authorId: z.string().optional(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type weatherTool = InferUITool<typeof getWeather>;
type createTasksTool = InferUITool<typeof createTasks>;
type createMermaidTool = InferUITool<typeof createMermaid>;
type updateTasksTool = InferUITool<typeof updateTasks>;
type searchResourcesTool = InferUITool<ReturnType<typeof searchResources>>;
type createApprovalTool = InferUITool<typeof createApproval>;
type setReminderTool = InferUITool<typeof setReminder>;
type getProjectRequirementsTool = InferUITool<ReturnType<typeof getProjectRequirements>>;
type getProjectsTool = InferUITool<ReturnType<typeof getProjects>>;
type getDocumentsTool = InferUITool<ReturnType<typeof getDocuments>>;
type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type queryResourcesTool = InferUITool<ReturnType<typeof queryResources>>;
type askQuestionsTool = InferUITool<typeof askQuestions>;
type confirmProjectModificationTool = InferUITool<typeof confirmProjectModification>;
type showAgentDashboardTool = InferUITool<ReturnType<typeof showAgentDashboard>>;
type showEntityDashboardTool = InferUITool<ReturnType<typeof showEntityDashboard>>;
type requestSuggestionsTool = InferUITool<
  ReturnType<typeof requestSuggestions>
>;

export type ChatTools = {
  getWeather: weatherTool;
  createTasks: createTasksTool;
  createMermaid: createMermaidTool;
  updateTasks: updateTasksTool;
  searchResources: searchResourcesTool;
  createApproval: createApprovalTool;
  setReminder: setReminderTool;
  getProjectRequirements: getProjectRequirementsTool;
  getProjects: getProjectsTool;
  getDocuments: getDocumentsTool;
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  queryResources: queryResourcesTool;
  requestSuggestions: requestSuggestionsTool;
  askQuestions: askQuestionsTool;
  confirmProjectModification: confirmProjectModificationTool;
  showAgentDashboard: showAgentDashboardTool;
  showEntityDashboard: showEntityDashboardTool;
  talent_match: {
    input: {
      skills: string[];
      budget?: number;
      duration?: string;
    };
    output: any;
  };
  skill_analyzer: {
    input: {
      project_description: string;
      industry?: string;
    };
    output: any;
  };
  project_create: {
    input: {
      name: string;
      description?: string;
      owner_id: string;
      start_date?: string;
      end_date?: string;
      budget?: number;
      team_members?: string[];
    };
    output: any;
  };
  requirement_create: {
    input: {
      project_id: string;
      title: string;
      description?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
      status?: 'DRAFT' | 'REVIEW' | 'APPROVED';
    };
    output: any;
  };
  task_create: {
    input: {
      project_id: string;
      title: string;
      description?: string;
      assigned_to?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
      status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
    };
    output: any;
  };
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  quoteDelta: string;
  projectDelta: string;
  positionDelta: string;
  requirementDelta: string;
  resumeDelta: string;
  serviceDelta: string;
  matchingDelta: string;
  approvalDelta: string;
  contractDelta: string;
  messageDelta: string;
  reportDelta: string;
  taskDelta: string;
  webDelta: string;
  adminDelta: string;
  documentDelta: string;
  adminSchema: { configId?: string; schema: any };
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  kind: ArtifactKind;
  clear: null;
  finish: null;
  usage: AppUsage;
  "document-preview": {
    id: string;
    title: string;
    kind: string;
    content: string | null;
    createdAt: Date;
  };
  "project-preview": {
    id: string;
    name: string;
    status: string;
    description?: string;
    createdAt?: Date;
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
