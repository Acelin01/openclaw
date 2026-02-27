import { codeDocumentHandler } from "../artifact-handlers/code.js";
import { sheetDocumentHandler } from "../artifact-handlers/sheet.js";
import { quoteDocumentHandler } from "../artifact-handlers/quote.js";
import { textDocumentHandler } from "../artifact-handlers/text.js";
import { imageDocumentHandler } from "../artifact-handlers/image.js";
import { projectDocumentHandler } from "../artifact-handlers/project.js";
import { positionDocumentHandler } from "../artifact-handlers/position.js";
import { requirementDocumentHandler } from "../artifact-handlers/requirement.js";
import { projectRequirementDocumentHandler } from "../artifact-handlers/project-requirement.js";
import { resumeDocumentHandler } from "../artifact-handlers/resume.js";
import { serviceDocumentHandler } from "../artifact-handlers/service.js";
import { matchingDocumentHandler } from "../artifact-handlers/matching.js";
import { reportDocumentHandler } from "../artifact-handlers/report.js";
import { taskDocumentHandler } from "../artifact-handlers/task.js";
import { approvalDocumentHandler } from "../artifact-handlers/approval.js";
import { contractDocumentHandler } from "../artifact-handlers/contract.js";
import { messageDocumentHandler } from "../artifact-handlers/message.js";
import { webDocumentHandler } from "../artifact-handlers/web.js";
import { agentDocumentHandler } from "../artifact-handlers/agent.js";
import { adminDocumentHandler } from "../artifact-handlers/admin.js";
import { documentHandler } from "../artifact-handlers/document.js";
import { iterationDocumentHandler } from "../artifact-handlers/iteration.js";
import { riskDocumentHandler } from "../artifact-handlers/risk.js";
import type { DocumentHandler } from "./factory.js";

export * from "./factory.js";

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
  reportDocumentHandler,
  taskDocumentHandler,
  approvalDocumentHandler,
  contractDocumentHandler,
  messageDocumentHandler,
  webDocumentHandler,
  agentDocumentHandler,
  adminDocumentHandler,
  documentHandler,
  iterationDocumentHandler,
  riskDocumentHandler,
];

export const artifactKinds = [
  "text",
  "code",
  "sheet",
  "quote",
  "image",
  "project",
  "position",
  "requirement",
  "project-requirement",
  "resume",
  "service",
  "matching",
  "report",
  "task",
  "approval",
  "contract",
  "message",
  "web",
  "agent",
  "admin",
  "document",
  "iteration",
  "risk",
] as const;
