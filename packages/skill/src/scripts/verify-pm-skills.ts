import {
  createSkillService,
  MarketAnalysisSkill,
  RequirementManagementSkill,
  ProductPlanningSkill,
  SkillLevel,
} from "../index";
import { AgentRole } from "../types/collaboration";

/**
 * 验证丰富后的产品经理技能包
 */
async function verifyPMSkills() {
  console.log("=== 开始验证产品经理丰富技能包 ===\n");

  const service = createSkillService();

  // 1. 注册新实现的产品经理技能
  const marketSkill = new MarketAnalysisSkill();
  const reqSkill = new RequirementManagementSkill();
  const planningSkill = new ProductPlanningSkill();

  service.registry.register(marketSkill);
  service.registry.register(reqSkill);
  service.registry.register(planningSkill);

  console.log("已注册技能:");
  console.log(`- ${marketSkill.definition.name} (${marketSkill.definition.id})`);
  console.log(`- ${reqSkill.definition.name} (${reqSkill.definition.id})`);
  console.log(`- ${planningSkill.definition.name} (${planningSkill.definition.id})`);

  // 2. 注册产品经理智能体
  service.agentRegistry.register({
    id: "pm-001",
    name: "资深产品经理老王",
    role: AgentRole.PRODUCT_MANAGER,
    capabilities: [
      {
        name: "analysis",
        description: "负责市场分析、需求管理与产品规划",
        metrics: ["completeness", "accuracy", "clarity"],
        thresholds: { completeness: 0.8 },
      },
    ],
    status: "idle",
    lastSeen: new Date().toISOString(),
  });

  // 3. 模拟执行：市场分析 -> 产品规划 -> 需求管理
  try {
    const context = { product_name: "AI 协同办公平台" };

    // A. 执行市场分析
    console.log("\n--- [步骤1] 执行市场分析 ---");
    const { result: res1 } = await service.executor.execute(marketSkill, {
      market_segment: "Enterprise AI",
      industry: "Software",
      timeframe: "2026-2027",
    });
    console.log("分析结果摘要:", JSON.stringify(res1.outputs?.trend_prediction, null, 2));

    // B. 执行产品规划
    console.log("\n--- [步骤2] 执行产品规划 ---");
    const { result: res2 } = await service.executor.execute(planningSkill, {
      product_vision: "打造全球领先的 AI 驱动协作体验",
      feature_backlog: [
        { name: "AI 自动会议纪要", category: "Core" },
        { name: "多语言实时翻译", category: "Growth" },
        { name: "智能任务分配", category: "Efficiency" },
      ],
    });
    console.log("MVP 范围:", JSON.stringify(res2.outputs?.mvp_scope, null, 2));

    // C. 执行需求管理
    console.log("\n--- [步骤3] 执行需求管理 ---");
    const { result: res3 } = await service.executor.execute(reqSkill, {
      raw_requirements: "我们需要一个能够自动提取会议关键点并生成待办事项的功能。",
      product_context: context,
    });
    console.log("生成的 PRD 片段:", res3.outputs?.prd_document.substring(0, 100) + "...");

    console.log("\n=== 产品经理技能包验证完成 ===");
  } catch (error) {
    console.error("验证失败:", error);
    process.exit(1);
  }
}

verifyPMSkills().catch(console.error);
