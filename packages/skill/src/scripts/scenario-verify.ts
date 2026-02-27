import {
  createSkillService,
  Skill,
  SkillLevel,
  SkillExecutionMode,
  AgentRole,
  WorkflowStatus,
} from "../index";

/**
 * 验证场景：端到端软件开发协同
 * 包含：需求分析 -> 系统设计 -> 代码实现
 */
async function runScenario() {
  console.log("=== 开始端到端技能协同场景验证 ===\n");

  const skillService = createSkillService();

  // 1. 定义并注册技能

  // 需求分析技能
  class RequirementSkill extends Skill {
    protected async runImplementation(inputs: Record<string, any>) {
      console.log("[执行] 需求分析技能...");
      return {
        spec: `Requirement Spec for ${inputs.projectName}`,
        features: ["Auth", "Storage", "API"],
      };
    }
  }

  // 系统设计技能 (依赖需求分析)
  class DesignSkill extends Skill {
    protected async runImplementation(inputs: Record<string, any>) {
      console.log("[执行] 系统设计技能...");
      // 模拟耗时以触发 SLA 建议
      await new Promise((resolve) => setTimeout(resolve, 2500));
      return {
        architecture: `Microservices architecture for ${inputs.spec.substring(0, 10)}...`,
        diagram: " Mermaid Diagram Content",
      };
    }
  }

  // 代码实现技能 (依赖系统设计)
  class CodingSkill extends Skill {
    protected async runImplementation(inputs: Record<string, any>) {
      console.log("[执行] 代码实现技能...");
      return {
        code: `// Implementation based on ${inputs.architecture.substring(0, 20)}...\nconsole.log("Hello World");`,
        files: ["index.ts", "utils.ts"],
      };
    }
  }

  // 注册技能
  const reqSkill = new RequirementSkill({
    id: "skill-req",
    name: "Requirement Analysis",
    category: "analysis",
    level: SkillLevel.PROFICIENT,
    version: "1.0",
    description: "Analyzes project requirements",
    inputs: [{ name: "projectName", type: "string", required: true }],
    outputs: [
      { name: "spec", type: "string" },
      { name: "features", type: "list" },
    ],
  });

  const designSkill = new DesignSkill({
    id: "skill-design",
    name: "System Design",
    category: "design",
    level: SkillLevel.EXPERT,
    version: "1.0",
    description: "Designs system architecture",
    prerequisites: ["skill-req"], // 前置依赖
    inputs: [{ name: "spec", type: "string", required: true }],
    outputs: [{ name: "architecture", type: "string" }],
  });

  const codingSkill = new CodingSkill({
    id: "skill-coding",
    name: "Coding",
    category: "dev",
    level: SkillLevel.PROFICIENT,
    version: "1.0",
    description: "Writes source code",
    prerequisites: ["skill-design"], // 前置依赖
    inputs: [{ name: "architecture", type: "string", required: true }],
    outputs: [{ name: "code", type: "string" }],
  });

  skillService.registry.register(reqSkill);
  skillService.registry.register(designSkill);
  skillService.registry.register(codingSkill);

  // 2. 测试 Pipeline 编排模式
  console.log("--- 测试 Pipeline 编排执行 ---");
  const pipelineComp = {
    id: "pipeline-dev",
    name: "Dev Pipeline",
    description: "Req -> Design -> Code",
    skillIds: ["skill-req", "skill-design", "skill-coding"],
    mode: SkillExecutionMode.PIPELINE,
    inputMapping: {
      "skill-req": { projectName: "global.projectName" },
      "skill-design": { spec: "skill-req.spec" },
      "skill-coding": { architecture: "skill-design.architecture" },
    },
  };

  const pipelineResults = await skillService.orchestrator.executeComposition(pipelineComp, {
    projectName: "Uxin AI Platform",
  });

  Object.entries(pipelineResults).forEach(([id, res]) => {
    console.log(
      `- 技能 ${id}: ${res.success ? "成功" : "失败" + (res.error ? " (" + res.error + ")" : "")}`,
    );
  });

  // 3. 测试工作流 SLA 监控
  console.log("\n--- 测试工作流协同与 SLA 监控 ---");
  skillService.engine.registerWorkflow({
    type: "APP_DEV_FLOW",
    name: "App Development Flow",
    version: "1.0",
    stages: [
      {
        id: "STG_REQ",
        name: "Requirement Analysis",
        executorRole: AgentRole.PRODUCT_MANAGER,
        nextStages: ["STG_DESIGN"],
      },
      {
        id: "STG_DESIGN",
        name: "Architecture Design",
        executorRole: AgentRole.ARCHITECT,
        nextStages: ["STG_DEV"],
      },
      { id: "STG_DEV", name: "Code Implementation", executorRole: AgentRole.DEVELOPER },
    ],
  });

  const workflowInstance = await skillService.engine.startWorkflow("APP_DEV_FLOW", {
    projectName: "Scenario Test",
  });
  console.log(`工作流已启动: ${workflowInstance.id}`);

  // 等待模拟异步执行完成
  await new Promise((resolve) => setTimeout(resolve, 4000));

  const finalStatus = skillService.engine.getWorkflowStatus(workflowInstance.id);
  if (finalStatus) {
    console.log(`工作流最终状态: ${finalStatus.status}`);
    console.log("耗时指标:", JSON.stringify(finalStatus.metrics, null, 2));
    if (finalStatus.metrics?.suggestions) {
      console.log("优化建议:", finalStatus.metrics.suggestions);
    }
  }

  console.log("\n=== 场景验证完成 ===");
}

runScenario().catch(console.error);
