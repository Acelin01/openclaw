import { EvolutionEngine } from "../evolution/EvolutionEngine";
import { PlanningSystem } from "../evolution/PlanningSystem";
import { Skill } from "../models/Skill";
import { TaskFlowManager } from "../orchestration/TaskFlowManager";
import { AgentRegistry } from "../services/AgentRegistry";
import { SkillRegistry } from "../services/SkillRegistry";
import { ArchitectureDesignSkill } from "../skills/ArchitectureDesignSkill";
import { RequirementManagementSkill } from "../skills/RequirementManagementSkill";
import { AgentRole } from "../types/collaboration";
import { SkillLevel } from "../types/skill";

/**
 * 模拟一个极其复杂的任务，触发演进
 */
class LegacySystemEvolutionSkill extends Skill {
  constructor() {
    super({
      id: "legacy-evolution-skill",
      name: "遗留系统演进分析技能",
      description: "分析老旧系统的演进路径与风险",
      level: SkillLevel.PROFICIENT,
      category: "legacy_analysis",
      version: "1.0.0",
      inputs: [{ name: "goal", type: "string", required: true, description: "目标" }],
      outputs: [{ name: "evolution_path", type: "object", qualityMetrics: ["feasibility"] }],
    });
  }

  protected async runImplementation(inputs: Record<string, any>): Promise<Record<string, any>> {
    console.log(`[Node: 执行] 正在分析遗留系统演进路径...`);
    // 模拟执行过程中发现严重的技术债务和风险，无法继续
    return {
      success: false,
      error: "Legacy System contains unresolvable technical debt: 1980s COBOL logic detected.",
      evolution_path: null,
    };
  }

  protected assessQuality(value: any, metrics: string[]): Record<string, number> {
    const scores: Record<string, number> = {};
    for (const metric of metrics) {
      scores[metric] = 0.1; // 极低质量
    }
    return scores;
  }
}

async function runSelfEvolutionScenario() {
  console.log("================================================================");
  console.log("🌟 欢迎进入 自演化智能协作系统 (Self-Evolution System) 验证");
  console.log("================================================================\n");

  // 1. 系统初始化
  console.log("[Step 1: 初始化] 加载演进引擎与规划系统...");
  const evolutionEngine = EvolutionEngine.getInstance();
  const planningSystem = new PlanningSystem();
  const agentRegistry = new AgentRegistry();
  const taskFlowManager = new TaskFlowManager(agentRegistry);
  const skillRegistry = SkillRegistry.getInstance();

  // 注入技能
  skillRegistry.register(new RequirementManagementSkill());
  skillRegistry.register(new ArchitectureDesignSkill());
  skillRegistry.register(new LegacySystemEvolutionSkill());

  // 注册智能体
  const now = new Date().toISOString();
  agentRegistry.register({
    id: "ai-pd",
    name: "AI产品经理",
    role: AgentRole.PRODUCT_MANAGER,
    status: "idle",
    lastSeen: now,
    capabilities: [
      {
        name: "analysis",
        description: "需求分析与演进",
        metrics: ["accuracy"],
        thresholds: { accuracy: 0.8 },
      },
    ],
  });
  agentRegistry.register({
    id: "ai-arch",
    name: "AI架构师",
    role: AgentRole.ARCHITECT,
    status: "idle",
    lastSeen: now,
    capabilities: [
      {
        name: "design",
        description: "架构设计与评估",
        metrics: ["scalability"],
        thresholds: { scalability: 0.8 },
      },
      {
        name: "legacy_analysis",
        description: "遗留系统分析",
        metrics: ["feasibility"],
        thresholds: { feasibility: 0.8 },
      },
    ],
  });

  // 2. 启动演进周期
  console.log("\n[Step 2: 启动周期] 识别需求差距并设定演进目标...");
  const projectGoal = "将 20 年前的老旧银行核心系统迁移至自演化微服务架构";
  const cycleId = evolutionEngine.startCycle([{ text: projectGoal }]);

  // 3. 生成三层规划
  console.log("\n[Step 3: 三层规划] 根据元认知分析结果生成规划蓝图...");
  const activeGoals = evolutionEngine.getActiveGoals();
  const plans = planningSystem.generatePlans(activeGoals);
  planningSystem.printPlans(plans);

  // 4. 迭代执行与优化循环
  console.log("\n[Step 4: 迭代执行] 启动任务流，收集执行反馈...");
  try {
    await taskFlowManager.processProject(projectGoal);
  } catch (error) {
    console.log(`[Warning] 任务流中出现预期内的执行波动`);
  }

  // 5. 洞察生成与系统演化
  console.log("\n[Step 5: 演化结果] 汇总执行洞察并展示系统演化成果...");
  const insights = evolutionEngine.getInsights();
  console.log("\n--- 系统演化洞察库 (Insight Base) ---");
  insights.forEach((insight) => {
    const icon = insight.type === "optimization" ? "🛠️" : "💡";
    console.log(
      `${icon} [${insight.type.toUpperCase()}] ${insight.content} (可信度: ${insight.confidence})`,
    );
  });

  // 7. 收敛检查与元学习
  console.log("\n[Step 7: 收敛与元学习] 执行闭环检查...");
  const isConverged = evolutionEngine.checkConvergence();
  if (!isConverged) {
    console.log(
      `[Convergence] ⚠️ 系统未收敛（由于关键任务失败），准备进入下一轮演化循环或派发人工任务...`,
    );
    evolutionEngine.updateMetaLearning(cycleId);
  }

  // 6. 验证知识沉淀
  console.log("\n[Step 6: 知识验证] 检查知识库中的演化资产...");
  const knowledgeBase = (evolutionEngine as any).knowledgeBase;
  const bestPractices = knowledgeBase.getKnowledgeByCategory("best_practice");
  const evolutionRules = knowledgeBase.getKnowledgeByCategory("evolution_gap");
  const metaKnowledge = knowledgeBase.getKnowledgeByCategory("meta_learning");

  console.log(`- 沉淀的最佳实践数量: ${bestPractices.length}`);
  bestPractices.forEach((kp: any) =>
    console.log(`  ✅ [BestPractice] ${kp.content.substring(0, 80)}...`),
  );

  console.log(`- 识别出的演化规则数量: ${evolutionRules.length}`);
  evolutionRules.forEach((kr: any) => console.log(`  📌 [Rule] ${kr.content}`));

  console.log(`- 元学习增量: ${metaKnowledge.length}`);
  metaKnowledge.forEach((km: any) => console.log(`  🧬 [MetaLearning] ${km.content}`));

  console.log("\n--- 目标达成状态跟踪 ---");
  const goals = evolutionEngine.getActiveGoals();
  goals.forEach((goal) => {
    const statusIcon = goal.status === "completed" ? "✅" : goal.status === "failed" ? "❌" : "⏳";
    console.log(
      `${statusIcon} [${goal.timeHorizon}] ${goal.description}: ${goal.status} (进度: ${goal.progress * 100}%)`,
    );
  });

  console.log("\n================================================================");
  console.log("🏁 自演化闭环演示结束 - 系统已完成一轮自我优化与知识沉淀迭代");
  console.log("================================================================");
}

runSelfEvolutionScenario();
