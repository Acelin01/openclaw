import { createSkillService } from "../index";
import { Skill } from "../models/Skill";
import { AgentRole } from "../types/collaboration";
import { SkillLevel, SkillExecutionResult } from "../types/skill";

// 增强型测试技能，支持模拟失败和优化
class LifecycleTestSkill extends Skill {
  private failCount = 0;
  private requiredFailures: number;

  constructor(definition: any, requiredFailures: number = 0) {
    super(definition);
    this.requiredFailures = requiredFailures;
  }

  protected async runImplementation(
    inputs: Record<string, any>,
    context: Record<string, any>,
  ): Promise<Record<string, any>> {
    console.log(
      `[LifecycleTestSkill] 执行 ${this.definition.name}, 当前失败计数: ${this.failCount}`,
    );

    if (this.failCount < this.requiredFailures) {
      this.failCount++;
      throw new Error(`模拟执行失败 (第 ${this.failCount} 次)`);
    }

    // 如果是低等级技能且目标较复杂，模拟质量不达标
    if (this.definition.level < SkillLevel.PROFICIENT && inputs.goal.includes("复杂")) {
      console.log(`[LifecycleTestSkill] 低等级技能无法处理复杂任务，产出质量将较低`);
      return {
        document: "Partial requirements...",
        code: "Partial code...", // 增加 code 输出
        _quality_override: 0.5, // 模拟质量不达标
      };
    }

    return {
      document: `Full requirements for ${inputs.goal}`,
      architecture: `Robust architecture for ${inputs.goal}`,
      _quality_override: 0.95, // 模拟高质量产出
    } as any;
  }

  // 覆盖 assessQuality 以支持模拟质量
  protected assessQuality(
    output: any,
    metrics: string[],
    results: any = {},
  ): Record<string, number> {
    const scores: Record<string, number> = {};
    const quality =
      (results && typeof results === "object" && results._quality_override) !== undefined
        ? results._quality_override
        : 0.9;
    metrics.forEach((m) => (scores[m] = quality));
    return scores;
  }
}

async function main() {
  console.log("=== 开始验证项目全生命周期 (Start-End) ===");

  const service = createSkillService();

  // 1. 注册不同等级的技能以测试优化路径
  const juniorAnalysis = new LifecycleTestSkill(
    {
      id: "skill-analysis-jr",
      name: "初级需求分析",
      category: "analysis",
      level: SkillLevel.NOVICE,
      version: "1.0.0",
      inputs: [{ name: "goal", type: "string", required: true }],
      outputs: [{ name: "document", type: "string", qualityMetrics: ["accuracy"] }],
    },
    1,
  ); // 模拟第1次执行失败（测试调整参数重试）

  const seniorAnalysis = new LifecycleTestSkill(
    {
      id: "skill-analysis-sr",
      name: "高级需求分析",
      category: "analysis",
      level: SkillLevel.PROFICIENT,
      version: "1.0.0",
      inputs: [{ name: "goal", type: "string", required: true }],
      outputs: [{ name: "document", type: "string", qualityMetrics: ["accuracy"] }],
    },
    0,
  );

  service.registry.register(juniorAnalysis);
  service.registry.register(seniorAnalysis);

  const codingSkill = new LifecycleTestSkill(
    {
      id: "skill-coding-001",
      name: "基础编码技能",
      category: "development",
      level: SkillLevel.NOVICE, // 降低等级以触发质量不达标逻辑
      version: "1.0.0",
      inputs: [{ name: "goal", type: "string", required: true }],
      outputs: [{ name: "code", type: "string", qualityMetrics: ["readability"] }],
    },
    0,
  );
  service.registry.register(codingSkill);

  const seniorCodingSkill = new LifecycleTestSkill(
    {
      id: "skill-coding-002",
      name: "高级编码技能",
      category: "development",
      level: SkillLevel.PROFICIENT,
      version: "1.0.0",
      inputs: [{ name: "goal", type: "string", required: true }],
      outputs: [{ name: "code", type: "string", qualityMetrics: ["readability"] }],
    },
    0,
  );
  service.registry.register(seniorCodingSkill);

  // 2. 注册不同角色的智能体
  service.agentRegistry.register({
    id: "agent-pm-001",
    name: "产品经理小王",
    role: AgentRole.PRODUCT_MANAGER,
    capabilities: [
      {
        name: "analysis",
        description: "需求分析",
        metrics: ["accuracy"],
        thresholds: { accuracy: 0.8 },
      },
    ],
    status: "idle",
    lastSeen: new Date().toISOString(),
  });

  service.agentRegistry.register({
    id: "agent-dev-001",
    name: "技术大拿老张",
    role: AgentRole.DEVELOPER,
    capabilities: [
      {
        name: "development",
        description: "软件开发",
        metrics: ["readability"],
        thresholds: { readability: 0.7 },
      },
    ],
    status: "idle",
    lastSeen: new Date().toISOString(),
  });

  // 3. 执行项目流
  try {
    // 任务包含“复杂”和“分析”，将触发：
    // 1. 小王执行分析 -> 质量不达标 -> 更换高级分析技能
    // 2. 老张执行开发任务
    const goal = "请分析并开发一个复杂的AI协同系统";
    const report = await service.flowManager.processProject(goal);

    console.log("\n--- 项目执行报告摘要 ---");
    console.log(report);

    // 验证技能等级是否提升（学习循环）
    const updatedSkill = service.registry.getSkill("skill-analysis-sr");
    console.log(
      `\n验证学习效果: ${updatedSkill?.definition.name} 当前等级: ${updatedSkill?.definition.level}`,
    );

    console.log("\n=== 项目全生命周期验证完成 ===");
  } catch (error) {
    console.error("项目执行失败:", error);
    process.exit(1);
  }
}

main();
