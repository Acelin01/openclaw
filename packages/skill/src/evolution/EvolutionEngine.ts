import { KnowledgeBase } from "../services/KnowledgeBase";
import { SkillRegistry } from "../services/SkillRegistry";
import {
  EvolutionPhase,
  TimeHorizon,
  EvolutionGoal,
  EvolutionCycle,
  EvolutionInsight,
} from "../types/evolution";

export class EvolutionEngine {
  private static instance: EvolutionEngine;
  private cycles: Map<string, EvolutionCycle> = new Map();
  private insights: EvolutionInsight[] = [];
  private activeGoals: EvolutionGoal[] = [];
  private knowledgeBase: KnowledgeBase;

  private constructor() {
    this.knowledgeBase = KnowledgeBase.getInstance();
  }

  public static getInstance(): EvolutionEngine {
    if (!EvolutionEngine.instance) {
      EvolutionEngine.instance = new EvolutionEngine();
    }
    return EvolutionEngine.instance;
  }

  /**
   * 启动演进周期 (2.1 自演化智能协作业务流程)
   */
  public startCycle(requirements: any[]): string {
    const cycleId = `cycle-${Date.now()}`;
    console.log(`[EvolutionEngine] 启动演进周期: ${cycleId}`);

    const goals = this.generateGoals(requirements);
    const cycle: EvolutionCycle = {
      id: cycleId,
      startTime: new Date(),
      requirements,
      goals,
      phases: [EvolutionPhase.ASSESSMENT],
      status: "active",
    };

    this.cycles.set(cycleId, cycle);
    this.activeGoals.push(...goals);

    return cycleId;
  }

  /**
   * 元认知分析：识别差距 (2.1 MetaAnalysis)
   */
  private generateGoals(requirements: any[]): EvolutionGoal[] {
    console.log(`[EvolutionEngine] 进行元认知分析，识别需求差距...`);

    // 需求演进：生成变体并评估 (2.1 需求演进)
    const evolvedRequirements = this.evolveRequirements(requirements);

    // 模拟从演进后的需求中提取目标
    return [
      {
        id: "goal-lt-1",
        description: "构建完全自动化的遗留系统集成框架",
        timeHorizon: TimeHorizon.LONG_TERM,
        priority: 0.9,
        metrics: { automation_rate: { target: 0.95, weight: 1.0 } },
        dependencies: [],
        status: "pending",
        progress: 0,
      },
      {
        id: "goal-mt-1",
        description: "实现非标准串行协议的自适应解析",
        timeHorizon: TimeHorizon.MID_TERM,
        priority: 0.8,
        metrics: { protocol_support: { target: 1.0, weight: 1.0 } },
        dependencies: ["goal-lt-1"],
        status: "pending",
        progress: 0,
      },
      {
        id: "goal-st-1",
        description: "优化当前集成任务的重试策略",
        timeHorizon: TimeHorizon.SHORT_TERM,
        priority: 0.7,
        metrics: { retry_success_rate: { target: 0.8, weight: 1.0 } },
        dependencies: ["goal-mt-1"],
        status: "pending",
        progress: 0,
      },
    ];
  }

  /**
   * 需求演进引擎 (2.1 EvolveRequirements)
   * 生成需求变体、评估并选择最优
   */
  private evolveRequirements(requirements: any[]): any[] {
    console.log(`[EvolutionEngine] 启动需求演进引擎...`);

    return requirements.map((req) => {
      console.log(`[EvolutionEngine] 正在为需求 "${req.text || "未定义"}" 生成变体...`);
      const variants = [
        { ...req, type: "conservative", risk: 0.2 },
        { ...req, type: "innovative", risk: 0.5 },
        { ...req, type: "aggressive", risk: 0.8 },
      ];

      const optimal = variants.sort((a, b) => b.risk - a.risk)[0]; // 模拟选择最优变体
      console.log(`[EvolutionEngine] 已选择最优演进变体: ${optimal.type}`);
      return optimal;
    });
  }

  /**
   * 演化反馈闭环 (2.1 Evaluate -> UpdateKB -> GenerateInsight)
   */
  public processFeedback(taskId: string, result: any, quality: number): EvolutionInsight[] {
    console.log(`[EvolutionEngine] 接收任务反馈: ${taskId}, 质量得分: ${quality}`);

    const newInsights: EvolutionInsight[] = [];

    if (quality < 0.5) {
      // 识别到差距
      const insight: EvolutionInsight = {
        id: `insight-${Date.now()}`,
        type: "optimization",
        content: `检测到任务 ${taskId} 执行质量极低 (${quality})，可能需要物理接入或更高级别的技能。`,
        confidence: 0.9,
        sourceTaskId: taskId,
        timestamp: new Date(),
      };
      this.insights.push(insight);
      newInsights.push(insight);

      // 沉淀至知识库：规则库 (KR)
      this.knowledgeBase.addKnowledge("evolution_gap", {
        category: "evolution_gap",
        content: `[Rule] 任务 ${taskId} 存在执行鸿沟，当 quality < 0.5 时，建议触发人工干预 (Team LY)。`,
        tags: ["gap", "intervention", taskId],
      });

      this.updateGoalsBasedOnFailure(taskId);
    } else if (quality > 0.8) {
      // 知识沉淀
      const insight: EvolutionInsight = {
        id: `insight-${Date.now()}`,
        type: "discovery",
        content: `任务 ${taskId} 执行质量优秀 (${quality})，自动沉淀最佳实践至知识库。`,
        confidence: 0.85,
        sourceTaskId: taskId,
        timestamp: new Date(),
      };
      this.insights.push(insight);
      newInsights.push(insight);

      // 沉淀至知识库：案例库 (KC)
      this.knowledgeBase.addKnowledge("best_practice", {
        category: "best_practice",
        content: `[BestPractice] 任务 ${taskId} 成功模式沉淀。执行上下文：${JSON.stringify(result.outputs || {}).substring(0, 100)}`,
        tags: ["success", "pattern", taskId],
      });

      this.updateGoalsBasedOnSuccess(taskId);
    }

    return newInsights;
  }

  private updateGoalsBasedOnFailure(taskId: string) {
    // 模拟目标调整
    const stGoal = this.activeGoals.find((g) => g.timeHorizon === TimeHorizon.SHORT_TERM);
    if (stGoal) {
      stGoal.status = "failed";
      console.log(`[EvolutionEngine] 目标 ${stGoal.id} 状态更新为: FAILED (由于任务失败)`);
    }
  }

  private updateGoalsBasedOnSuccess(taskId: string) {
    const stGoal = this.activeGoals.find((g) => g.timeHorizon === TimeHorizon.SHORT_TERM);
    if (stGoal) {
      stGoal.progress += 0.2;
      if (stGoal.progress >= 1) {
        stGoal.status = "completed";
        console.log(`[EvolutionEngine] 目标 ${stGoal.id} 已完成!`);
      }
    }
  }

  public getInsights(): EvolutionInsight[] {
    return this.insights;
  }

  public getActiveGoals(): EvolutionGoal[] {
    return this.activeGoals;
  }

  /**
   * 收敛检查 (2.1 ConvergenceCheck)
   * 检查是否所有短期目标都已处理，且系统性能达到稳态
   */
  public checkConvergence(): boolean {
    const stGoals = this.activeGoals.filter((g) => g.timeHorizon === TimeHorizon.SHORT_TERM);
    if (stGoals.length === 0) return true;

    const allProcessed = stGoals.every((g) => g.status === "completed" || g.status === "failed");
    const successRate = stGoals.filter((g) => g.status === "completed").length / stGoals.length;

    console.log(
      `[EvolutionEngine] 收敛检查: 进度 ${allProcessed ? "100%" : "进行中"}, 成功率 ${(successRate * 100).toFixed(1)}%`,
    );
    return allProcessed && successRate > 0.8;
  }

  /**
   * 元学习更新 (2.1 MetaLearning)
   * 根据演化周期结果更新系统元知识
   */
  public updateMetaLearning(cycleId: string) {
    const cycle = this.cycles.get(cycleId);
    if (!cycle) return;

    console.log(`[EvolutionEngine] 启动元学习更新: ${cycleId}`);
    const insights = this.getInsights().filter((i) => i.timestamp >= cycle.startTime);

    if (insights.length > 0) {
      this.knowledgeBase.addKnowledge("meta_learning", {
        category: "meta_learning",
        content: `[Meta] 周期 ${cycleId} 产生的演化增量：${insights.length} 条新洞察。系统认知边界已扩展。`,
        tags: ["meta-learning", "evolution", cycleId],
      });
    }
  }
}
