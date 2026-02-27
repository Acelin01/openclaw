import { adminArtifact } from "./admin/client";
import { agentDashboardArtifact } from "./agent-dashboard/client";
import { agentArtifact } from "./agent/client";
import { approvalArtifact } from "./approval/client";
import { codeArtifact } from "./code/client";
import { contractArtifact } from "./contract/client";
import { defectArtifact } from "./defect/client";
import { documentArtifact } from "./document/client";
import { entityDashboardArtifact } from "./entity-dashboard/client";
import { financialArtifact } from "./financial/client";
import { imageArtifact } from "./image/client";
import { inquiryArtifact } from "./inquiry/client";
import { iterationArtifact } from "./iteration/client";
import { matchingArtifact } from "./matching/client";
import { messageArtifact } from "./message/client";
import { milestoneArtifact } from "./milestone/client";
import { portfolioArtifact } from "./portfolio/client";
import { positionArtifact } from "./position/client";
import {
  projectRequirementArtifact,
  projectRequirementArtifactAlias,
} from "./project-requirement/client";
import { projectArtifact } from "./project/client";
import { qnaArtifact } from "./qna/client";
import { quoteArtifact } from "./quote/client";
import { reportArtifact } from "./report/client";
import { requirementArtifact } from "./requirement/client";
import { resumeArtifact } from "./resume/client";
import { reviewArtifact } from "./review/client";
import { riskArtifact } from "./risk/client";
import { serviceArtifact } from "./service/client";
import { sheetArtifact } from "./sheet/client";
import { taskArtifact } from "./task/client";
import { textArtifact } from "./text/client";
import { webArtifact } from "./web/client";

export const artifactDefinitions = [
  textArtifact,
  codeArtifact,
  imageArtifact,
  sheetArtifact,
  quoteArtifact,
  projectArtifact,
  positionArtifact,
  requirementArtifact,
  resumeArtifact,
  serviceArtifact,
  matchingArtifact,
  reportArtifact,
  taskArtifact,
  approvalArtifact,
  contractArtifact,
  messageArtifact,
  agentArtifact,
  agentDashboardArtifact,
  entityDashboardArtifact,
  webArtifact,
  adminArtifact,
  documentArtifact,
  iterationArtifact,
  riskArtifact,
  projectRequirementArtifact,
  projectRequirementArtifactAlias,
  defectArtifact,
  milestoneArtifact,
  financialArtifact,
  qnaArtifact,
  portfolioArtifact,
  inquiryArtifact,
  reviewArtifact,
];
