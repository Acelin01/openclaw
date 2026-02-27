import type { UIMessage } from "ai";
import type { AppUsage } from "./usage";

export type Suggestion = {
  id: string;
  documentId: string;
  documentCreatedAt: Date;
  originalText: string;
  suggestedText: string;
  description: string | null;
  isResolved: boolean | null;
  userId: string;
  createdAt: Date;
};

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
  | "agent"
  | "agent-dashboard"
  | "entity-dashboard"
  | "web"
  | "admin"
  | "document"
  | "app"
  | "weather"
  | "iteration"
  | "risk"
  | "defect"
  | "milestone"
  | "financial"
  | "qna"
  | "portfolio"
  | "inquiry"
  | "review";

export type UIArtifact = {
  title: string;
  documentId: string;
  kind: ArtifactKind;
  content: string;
  isVisible: boolean;
  status: "streaming" | "idle";
  steps?: string[];
  messageId?: string;
  agentId?: string;
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  initialViewMode?: "edit" | "preview";
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
};

export type Vote = {
  chatId: string;
  messageId: string;
  isUpvoted: boolean;
  isDownvoted?: boolean;
};

export type ArtifactDocument = {
  id: string;
  createdAt: Date;
  title: string;
  content: string | null;
  kind: ArtifactKind;
  userId: string;
  chatId?: string | null;
  suggestions?: Suggestion[];
  status?: "PENDING" | "APPROVED" | "REJECTED";
  metadata?: any;
};

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
};

export type VisibilityType = "private" | "public";

export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  visibility: VisibilityType;
  adminConfigs?: any[];
};

export type ToolState = "input-streaming" | "input-available" | "output-available" | "output-error";

type BaseToolPart<Name extends string> = { type: `tool-${Name}`; toolCallId: string };

type ToolPartState<Name extends string> =
  | (BaseToolPart<Name> & {
      state: "input-streaming";
      input: any;
      output?: undefined;
      errorText?: undefined;
    })
  | (BaseToolPart<Name> & {
      state: "input-available";
      input: any;
      output?: undefined;
      errorText?: undefined;
    })
  | (BaseToolPart<Name> & {
      state: "output-available";
      input: any;
      output: any;
      errorText?: undefined;
    })
  | (BaseToolPart<Name> & {
      state: "output-error";
      input: any;
      output?: undefined;
      errorText: string;
    });

export type MessagePart =
  | { type: "text"; text: string }
  | { type: "file"; filename?: string; mediaType: string; url: string }
  | { type: "reasoning"; text: string }
  | ToolPartState<"getWeather">
  | ToolPartState<"createDocument">
  | ToolPartState<"updateDocument">
  | ToolPartState<"requestSuggestions">
  | ToolPartState<"createMermaid">
  | ToolPartState<"queryResources">
  | ToolPartState<"getProjects">
  | ToolPartState<"getDocuments">
  | ToolPartState<"createTasks">
  | ToolPartState<"updateTasks">
  | ToolPartState<"showAgentDashboard">
  | ToolPartState<"askQuestions">
  | ToolPartState<"confirmProjectModification">
  | ToolPartState<"getProjectRequirements">
  | ToolPartState<"provideFeedback">
  | ToolPartState<"updateProjectStatus">;

export type MessageMetadata = {
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  createdAt?: string;
  selectedAgent?: any;
};

export type ChatMessage = UIMessage<MessageMetadata, CustomUIDataTypes, any> & {
  authorName?: string;
  authorAvatar?: string;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  adminDelta: string;
  adminSchema: { configId: string; schema: any };
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
  suggestion: Suggestion;
  step: string;
  "task-list": any[];
  "task-update": { id: string; status: string };
  appendMessage: string;
  id: string;
  title: string;
  kind: ArtifactKind;
  clear: null;
  finish: null;
  "approval-required": {
    kind: string;
    title: string;
    action: string;
    params: any;
    description?: string;
  };
  usage: AppUsage;
  "document-preview": {
    id: string;
    title: string;
    kind?: string;
    content?: string | null;
    createdAt?: Date;
  };
  "project-preview": {
    id: string;
    name: string;
    status: string;
    description?: string;
    createdAt?: Date;
  };
};
