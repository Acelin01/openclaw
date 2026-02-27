import { createSkillService } from "../index";
import { Skill } from "../models/Skill";
import { AgentRole } from "../types/collaboration";
import { SkillLevel } from "../types/skill";

class FullArchTestSkill extends Skill {
  protected async runImplementation(
    inputs: Record<string, any>,
    context: Record<string, any>,
  ): Promise<Record<string, any>> {
    console.log(`[FullArchTestSkill] 正在执行 ${this.definition.name}...`);
    // 模拟从上下文获取领域知识
    if (context.domainKnowledge) {
      console.log(`[FullArchTestSkill] 已加载领域知识进行辅助执行`);
    }
    return {
      output: `Completed ${this.definition.name} for ${inputs.goal}`,
      _quality_override: 0.9,
    };
  }

  protected assessQuality(
    output: any,
    metrics: string[],
    results: any = {},
  ): Record<string, number> {
    const scores: Record<string, number> = {};
    const quality = results._quality_override || 0.9;
    metrics.forEach((m) => (scores[m] = quality));
    return scores;
  }
}

async function main() {
  console.log("=== 开始验证全层级协同架构 (Full Architecture) ===");

  const service = createSkillService();

  // 1. 注册多层级技能组件
  const skills = [
    { id: "s1", name: "文档创作技能", cat: "analysis" },
    { id: "s2", name: "架构设计技能", cat: "design" },
    { id: "s3", name: "基础编码技能", cat: "development" },
  ];

  skills.forEach((s) => {
    service.registry.register(
      new FullArchTestSkill({
        id: s.id,
        name: s.name,
        description: `Testing ${s.name}`,
        category: s.cat,
        level: SkillLevel.COMPETENT,
        version: "1.0.0",
        inputs: [{ name: "goal", type: "string", required: true }],
        outputs: [{ name: "output", type: "string", qualityMetrics: ["completeness"] }],
      }),
    );
  });

  // 2. 注册智能体容器中的智能体
  const agents = [
    { id: "a1", name: "产品经理小王", role: AgentRole.PRODUCT_MANAGER, cat: "analysis" },
    { id: "a2", name: "架构师老张", role: AgentRole.ARCHITECT, cat: "design" },
    { id: "a3", name: "开发专家小李", role: AgentRole.DEVELOPER, cat: "development" },
  ];

  agents.forEach((a) => {
    service.agentRegistry.register({
      id: a.id,
      name: a.name,
      role: a.role,
      capabilities: [
        {
          name: a.cat,
          description: a.role,
          metrics: ["completeness"],
          thresholds: { completeness: 0.8 },
        },
      ],
      status: "idle",
      lastSeen: new Date().toISOString(),
    });
  });

  // 3. 执行全流程：分解 -> 调度 -> 解析 -> 匹配 -> 分发 -> 执行 -> 评估 -> 学习
  try {
    const goal = "开发一个高并发分布式系统";
    console.log(`\n目标: ${goal}`);

    const report = await service.flowManager.processProject(goal);

    console.log("\n--- 全层级架构验证报告 ---");
    console.log(report);

    console.log("\n=== 全层级协同架构验证完成 ===");
  } catch (error) {
    console.error("架构验证失败:", error);
    process.exit(1);
  }
}

main();
