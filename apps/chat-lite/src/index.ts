// Chat Client
export {
  chatClient,
  ChatClient,
  type ChatMessage,
  type SkillInfo,
  type ProjectRequirement,
} from "./client/chat-client";

// Services
export {
  skillMatcher,
  SkillMatcher,
  type MatchedSkill,
  type ParsedSkillCall,
} from "./services/skill-matcher";

export {
  requirementManager,
  ProjectRequirementManager,
  type RequirementDraft,
  type RequirementTemplate,
} from "./services/requirement-manager";

// Utils
export {
  generateUUID,
  formatTime,
  truncateText,
  deepClone,
} from "./lib/utils";

// Artifacts
export {
  ArtifactViewer,
  type ArtifactContent,
  type ArtifactKind,
} from "./artifacts/viewer";

export {
  ProjectRequirementArtifact,
  type ProjectRequirementArtifactContent,
} from "./artifacts/project-requirement/element";

// Components
export { ChatLiteApp } from "./components/app";
