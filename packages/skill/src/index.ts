export * from "./types/skill";
export * from "./types/collaboration";
export * from "./models/Skill";
export * from "./services/SkillRegistry";
export * from "./services/SkillEvaluator";
export * from "./services/SkillLearner";
export * from "./services/AgentRegistry";
export * from "./services/ConversationManager";
export * from "./orchestration/SkillOrchestrator";
export * from "./collaboration/OrchestrationEngine";
export * from "./evolution/FeedbackEngine";
export * from "./evolution/PreCheckEngine";
export * from "./evolution/EvolutionEngine";

export * from "./orchestration/TaskOrchestrator";
export * from "./services/KnowledgeManager";
export * from "./collaboration/ExecutionEnvironment";
export * from "./models/ExecutionContext";
export * from "./execution/SkillExecutor";
export * from "./services/SkillLearningSystem";
export * from "./services/SkillMatcher";
export * from "./orchestration/TaskFlowManager";
export * from "./skills/MarketAnalysisSkill";
export * from "./skills/RequirementManagementSkill";
export * from "./skills/ProductPlanningSkill";

import { ExecutionSandbox } from "./collaboration/ExecutionEnvironment";
import { OrchestrationEngine } from "./collaboration/OrchestrationEngine";
import { PreCheckEngine } from "./evolution/PreCheckEngine";
import { SkillExecutor } from "./execution/SkillExecutor";
import { SkillOrchestrator } from "./orchestration/SkillOrchestrator";
import { TaskFlowManager } from "./orchestration/TaskFlowManager";
import {
  TaskDecomposer,
  TaskScheduler,
  TaskMonitor,
  TaskAnalyzer,
} from "./orchestration/TaskOrchestrator";
import { AgentRegistry } from "./services/AgentRegistry";
import { ConversationManager } from "./services/ConversationManager";
import { KnowledgeManager } from "./services/KnowledgeManager";
import { SkillEvaluator } from "./services/SkillEvaluator";
import { SkillLearner } from "./services/SkillLearner";
import { SkillLearningSystem } from "./services/SkillLearningSystem";
import { SkillMatcher } from "./services/SkillMatcher";
// Export a default initialization helper or factory if needed
import { SkillRegistry } from "./services/SkillRegistry";

export const createSkillService = () => {
  const registry = SkillRegistry.getInstance();
  const agentRegistry = new AgentRegistry();
  return {
    registry,
    evaluator: new SkillEvaluator(),
    learner: new SkillLearner(),
    agentRegistry,
    conversationManager: new ConversationManager(),
    orchestrator: new SkillOrchestrator(),
    engine: new OrchestrationEngine(),
    preCheckEngine: PreCheckEngine.getInstance(),
    // 补充的架构组件
    taskDecomposer: new TaskDecomposer(),
    taskScheduler: new TaskScheduler(),
    taskMonitor: new TaskMonitor(),
    taskAnalyzer: new TaskAnalyzer(),
    knowledgeManager: new KnowledgeManager(),
    sandbox: new ExecutionSandbox(),
    executor: new SkillExecutor(),
    learningSystem: new SkillLearningSystem(registry),
    matcher: new SkillMatcher(),
    flowManager: new TaskFlowManager(agentRegistry),
  };
};

export type SkillService = ReturnType<typeof createSkillService>;
