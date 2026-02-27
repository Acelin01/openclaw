export enum SkillLevel {
  NOVICE = 1, // 新手
  COMPETENT = 2, // 胜任
  PROFICIENT = 3, // 熟练
  EXPERT = 4, // 专家
  MASTER = 5, // 大师
}

export enum SkillExecutionMode {
  SEQUENTIAL = "sequential", // 顺序执行
  PARALLEL = "parallel", // 并行执行
  PIPELINE = "pipeline", // 流水线执行
  COMPOSITE = "composite", // 组合执行
}

export interface SkillInput {
  name: string;
  type: "string" | "number" | "boolean" | "list" | "object";
  required: boolean;
  description?: string;
  constraints?: Record<string, any>;
}

export interface SkillOutput {
  name: string;
  type: "string" | "number" | "boolean" | "list" | "object";
  qualityMetrics?: string[];
  description?: string;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  level: SkillLevel;
  version: string;
  inputs: SkillInput[];
  outputs: SkillOutput[];
  prerequisites?: string[];
  constraints?: Record<string, any>;
}

export interface SkillExecutionResult {
  success: boolean;
  skillId: string;
  skillName: string;
  executionTime: number;
  outputs?: Record<string, any>;
  qualityScores?: Record<string, Record<string, number>>;
  error?: string;
  metadata?: {
    skillLevel: SkillLevel;
    version: string;
  };
}

export interface ExecutionRecord {
  timestamp: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  executionTime: number;
  success: boolean;
  context?: Record<string, any>;
  error?: string;
}

export enum LearningMethod {
  SELF_STUDY = "self_study",
  MENTOR_GUIDE = "mentor_guide",
  PRACTICE = "practice",
  COURSE = "course",
}

export enum LearningStatus {
  PLANNING = "planning",
  IN_PROGRESS = "in_progress",
  EVALUATING = "evaluating",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface LearningPlan {
  id: string;
  skillId: string;
  method: LearningMethod;
  status: LearningStatus;
  resources: string[];
  mentorId?: string;
  progress: number;
  startDate: string;
  endDate?: string;
}

export interface SkillCertification {
  skillId: string;
  level: SkillLevel;
  issueDate: string;
  expiryDate?: string;
  authority: string;
}
