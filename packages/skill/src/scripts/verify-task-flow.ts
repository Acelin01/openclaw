import { createSkillService } from "../index";
import { Skill } from "../models/Skill";
import { AgentRole } from "../types/collaboration";
import { SkillLevel, SkillExecutionMode } from "../types/skill";

// 定义一个具体的技能类用于测试
class TestSkill extends Skill {
  protected async runImplementation(inputs: Record<string, any>): Promise<Record<string, any>> {
    console.log(`[TestSkill] Running implementation for ${this.definition.name}`);
    return {
      document: `Analyzed requirements for ${inputs.request}`,
      architecture: `Designed architecture for ${inputs.document || inputs.request}`,
    };
  }
}

async function main() {
  console.log("=== 开始验证完整任务流 (T1-R4) ===");

  const service = createSkillService();

  // 1. 注册一些技能
  const analysisSkill = new TestSkill({
    id: "skill-analysis-001",
    name: "需求分析技能",
    description: "分析用户需求并生成文档",
    category: "analysis",
    level: SkillLevel.PROFICIENT,
    version: "1.0.0",
    inputs: [{ name: "request", type: "string", required: true }],
    outputs: [{ name: "document", type: "string" }],
  });

  const designSkill = new TestSkill({
    id: "skill-design-001",
    name: "系统设计技能",
    description: "设计系统架构",
    category: "design",
    level: SkillLevel.EXPERT,
    version: "1.0.0",
    inputs: [{ name: "document", type: "string", required: true }],
    outputs: [{ name: "architecture", type: "string" }],
  });

  service.registry.register(analysisSkill);
  service.registry.register(designSkill);

  // 2. 注册一些智能体
  service.agentRegistry.register({
    id: "agent-pm-001",
    name: "项目经理智能体",
    role: AgentRole.PROJECT_MANAGER,
    capabilities: [
      {
        name: "analysis",
        description: "需求分析",
        metrics: ["accuracy"],
        thresholds: { accuracy: 0.8 },
      },
      {
        name: "design",
        description: "基础设计",
        metrics: ["quality"],
        thresholds: { quality: 0.6 },
      },
    ],
    status: "idle",
    lastSeen: new Date().toISOString(),
  });

  service.agentRegistry.register({
    id: "agent-arch-001",
    name: "架构师智能体",
    role: AgentRole.ARCHITECT,
    capabilities: [
      {
        name: "design",
        description: "专家级设计",
        metrics: ["quality"],
        thresholds: { quality: 0.9 },
      },
    ],
    status: "idle",
    lastSeen: new Date().toISOString(),
  });

  // 3. 执行任务流
  try {
    const request = "请帮我分析一个电商系统的需求并设计其架构";
    const report = await service.flowManager.processTask(request);

    console.log("\n最终生成的技能报告:");
    console.log(report);

    console.log("=== 任务流验证完成 ===");
  } catch (error) {
    console.error("任务流执行失败:", error);
    process.exit(1);
  }
}

main();
