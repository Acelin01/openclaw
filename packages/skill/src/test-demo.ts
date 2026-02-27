import { createSkillService, Skill, SkillLevel, SkillExecutionMode } from "./index";

async function testSkillSystem() {
  console.log("--- Starting Skill System Test ---");

  const skillService = createSkillService();

  // 1. 定义并注册一个模拟技能
  class AnalysisSkill extends Skill {
    protected async runImplementation(inputs: Record<string, any>): Promise<Record<string, any>> {
      console.log(`Executing AnalysisSkill with inputs: ${JSON.stringify(inputs)}`);
      return {
        doc: `Requirement document for ${inputs.topic}`,
        stories: ["Story 1", "Story 2"],
      };
    }
  }

  const analysisSkill = new AnalysisSkill({
    id: "skill-analysis-001",
    name: "Requirement Analysis",
    description: "Analyzes business requirements",
    category: "analysis",
    level: SkillLevel.NOVICE,
    version: "1.0",
    inputs: [{ name: "topic", type: "string", required: true }],
    outputs: [
      { name: "doc", type: "string", qualityMetrics: ["clarity"] },
      { name: "stories", type: "list" },
    ],
  });

  skillService.registry.register(analysisSkill);
  console.log("Skill registered:", analysisSkill.definition.name);

  // 2. 执行技能
  console.log("\nExecuting individual skill...");
  const result = await analysisSkill.execute({ topic: "AI Chat System" });
  console.log("Execution result success:", result.success);
  console.log("Outputs:", result.outputs);

  // 3. 评估与学习
  console.log("\nEvaluating execution...");
  const evaluation = skillService.evaluator.evaluate(result);
  console.log("Evaluation score:", evaluation.overallScore.toFixed(2));
  console.log("Feedback:", evaluation.feedback);

  skillService.learner.learn(analysisSkill, evaluation);
  console.log("Learning completed.");

  // 4. 编排执行
  console.log("\nTesting Skill Orchestrator (Parallel)...");
  const composition = {
    id: "comp-001",
    name: "Simple Analysis Flow",
    description: "Run analysis",
    skillIds: ["skill-analysis-001"],
    mode: SkillExecutionMode.PARALLEL,
    inputMapping: {
      "skill-analysis-001": { topic: "global.projectTopic" },
    },
  };

  const compResults = await skillService.orchestrator.executeComposition(composition, {
    projectTopic: "New Project",
  });
  console.log("Orchestration results keys:", Object.keys(compResults));

  // 5. 任务协同工作流
  console.log("\nTesting Orchestration Engine (Workflow)...");
  skillService.engine.registerWorkflow({
    type: "SW_DEV",
    name: "Software Development",
    version: "1.0",
    stages: [
      { id: "STG_ANALYSIS", name: "Analysis", executorRole: "PD", nextStages: ["STG_DESIGN"] },
      { id: "STG_DESIGN", name: "Design", executorRole: "ARCH" },
    ],
  });

  const workflow = await skillService.engine.startWorkflow("SW_DEV", {
    projectName: "Test Workflow",
  });
  console.log("Workflow started:", workflow.id, "Status:", workflow.status);

  console.log("\n--- Skill System Test Completed ---");
}

testSkillSystem().catch(console.error);
