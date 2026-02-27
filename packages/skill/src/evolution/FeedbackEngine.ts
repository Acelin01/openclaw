import { v4 as uuidv4 } from "uuid";
import { KnowledgeBase } from "../services/KnowledgeBase";
import { SkillRegistry } from "../services/SkillRegistry";
import {
  FeedbackType,
  FeedbackSeverity,
  SkillBasedFeedback,
  AdjustmentPlan,
} from "../types/feedback";

/**
 * 冲突检测器 (ConflictDetector)
 * 专门处理反馈之间的逻辑冲突
 */
class ConflictDetector {
  public findConflicts(feedbacks: SkillBasedFeedback[]): any[] {
    const conflicts: any[] = [];
    // 简单模拟：如果两个智能体对同一个需求提出了截然不同的建议
    for (let i = 0; i < feedbacks.length; i++) {
      for (let j = i + 1; j < feedbacks.length; j++) {
        const f1 = feedbacks[i];
        const f2 = feedbacks[j];

        // 逻辑冲突模拟：一个建议增加功能，一个建议删除功能（简化）
        if (
          f1.requirementId === f2.requirementId &&
          f1.type === f2.type &&
          f1.agentRole !== f2.agentRole
        ) {
          conflicts.push({
            id: uuidv4(),
            feedbacks: [f1, f2],
            description: `[${f1.agentRole}] 与 [${f2.agentRole}] 在 ${f1.type} 上存在潜在冲突`,
            severity: "medium",
          });
        }
      }
    }
    return conflicts;
  }
}

/**
 * 优先级计算器 (PriorityCalculator)
 * 基于严重程度、置信度和角色计算优先级
 */
class PriorityCalculator {
  public calculatePriority(feedbacks: SkillBasedFeedback[]): SkillBasedFeedback[] {
    return feedbacks.map((f) => {
      let score = 0;

      // 1. 基于严重程度
      const severityWeights = {
        [FeedbackSeverity.CRITICAL]: 1.0,
        [FeedbackSeverity.HIGH]: 0.8,
        [FeedbackSeverity.MEDIUM]: 0.5,
        [FeedbackSeverity.LOW]: 0.2,
        [FeedbackSeverity.INFO]: 0.1,
      };
      score += (severityWeights[f.severity] || 0) * 0.5;

      // 2. 基于置信度
      score += f.confidence * 0.3;

      // 3. 基于角色权重 (TM/ARCH 权重更高)
      const roleWeights: Record<string, number> = {
        ARCH: 0.2,
        TM: 0.2,
        PM: 0.15,
        QA: 0.1,
        UX: 0.1,
      };
      score += roleWeights[f.agentRole] || 0.1;

      return { ...f, priorityScore: Math.min(score, 1.0) };
    });
  }
}

/**
 * 技能反馈引擎 (SkillFeedbackEngine)
 * 对应 e:\资料\AIGC\uxin\.trae\documents\技能\回馈机制.md 中的 FBS, CRT, VAL, ADJ
 */
export class SkillFeedbackEngine {
  private static instance: SkillFeedbackEngine;
  private feedbackHistory: SkillBasedFeedback[] = [];
  private knowledgeBase: KnowledgeBase;
  private skillRegistry: SkillRegistry;
  private conflictDetector: ConflictDetector;
  private priorityCalculator: PriorityCalculator;

  private constructor() {
    this.knowledgeBase = KnowledgeBase.getInstance();
    this.skillRegistry = SkillRegistry.getInstance();
    this.conflictDetector = new ConflictDetector();
    this.priorityCalculator = new PriorityCalculator();
  }

  public static getInstance(): SkillFeedbackEngine {
    if (!SkillFeedbackEngine.instance) {
      SkillFeedbackEngine.instance = new SkillFeedbackEngine();
    }
    return SkillFeedbackEngine.instance;
  }

  /**
   * 收集并分析反馈 (FBS)
   */
  public async collectAndAnalyze(
    requirement: any,
    agent: any,
    addStep?: (msg: string) => void,
  ): Promise<SkillBasedFeedback[]> {
    const log = (msg: string) => {
      if (addStep) addStep(`[Feedback] ${msg}`);
    };

    log(`正在为智能体 ${agent.name} (${agent.role}) 分析需求反馈...`);

    const feedbackList: SkillBasedFeedback[] = [];
    const role = agent.role;

    // 模拟各专业智能体的分析逻辑 (2.2 流程图实现)
    if (role === "TM" || role === "ARCH") {
      const techFeedback = this.generateTechnicalFeedback(requirement, agent);
      if (techFeedback) feedbackList.push(techFeedback);
    }

    if (role === "PM" || role === "PD") {
      const productFeedback = this.generateProductFeedback(requirement, agent);
      if (productFeedback) feedbackList.push(productFeedback);
    }

    if (role === "QA" || role === "UX") {
      const uxFeedback = this.generateUXFeedback(requirement, agent);
      if (uxFeedback) feedbackList.push(uxFeedback);
    }

    this.feedbackHistory.push(...feedbackList);
    return feedbackList;
  }

  /**
   * 生成调整方案 (CRT)
   */
  public generateAdjustmentPlan(
    requirementId: string,
    feedbacks: SkillBasedFeedback[],
    addStep?: (msg: string) => void,
  ): AdjustmentPlan {
    const log = (msg: string) => {
      if (addStep) addStep(`[Adjustment] ${msg}`);
    };

    log(`正在针对 ${feedbacks.length} 条反馈生成矫正方案...`);

    // 1. 优先级计算
    const prioritizedFeedbacks = this.priorityCalculator.calculatePriority(feedbacks);

    // 2. 冲突检测与解决 (2.1 冲突解决逻辑)
    const conflicts = this.conflictDetector.findConflicts(prioritizedFeedbacks);
    let finalFeedbacks = [...prioritizedFeedbacks];

    if (conflicts.length > 0) {
      log(`⚠️ 检测到 ${conflicts.length} 处反馈冲突，正在启动冲突仲裁...`);

      // 仲裁逻辑：针对每组冲突，只保留得分最高的反馈
      conflicts.forEach((conflict) => {
        const sorted = conflict.feedbacks.sort(
          (a: any, b: any) => b.priorityScore - a.priorityScore,
        );
        const winner = sorted[0];
        const losers = sorted.slice(1);

        losers.forEach((loser: any) => {
          finalFeedbacks = finalFeedbacks.filter((f) => f.id !== loser.id);
          log(
            `仲裁结果: 采纳 [${winner.agentRole}] 建议，驳回 [${loser.agentRole}] (得分: ${loser.priorityScore.toFixed(2)})`,
          );
        });
      });
    }

    // 3. 影响评估 (ADJ)
    const impact = this.analyzeImpact(finalFeedbacks);
    log(`方案影响评估: 风险指数 ${impact.risk.toFixed(2)}, 收益指数 ${impact.gain.toFixed(2)}`);

    const sortedFeedbacks = finalFeedbacks.sort((a, b) => b.priorityScore - a.priorityScore);

    const suggestions = sortedFeedbacks
      .map(
        (f) =>
          `[${f.agentRole}] (优先级: ${f.priorityScore.toFixed(2)}) ${f.problemDescription} -> 建议: ${f.correctionSuggestions.join("; ")}`,
      )
      .join("\n");

    const plan: AdjustmentPlan = {
      id: uuidv4(),
      requirementId,
      feedbackIds: finalFeedbacks.map((f) => f.id),
      suggestedChanges: suggestions,
      status: "pending",
      rationale: `基于 ${finalFeedbacks.length} 条专业反馈生成的优化方案。风险指数: ${impact.risk.toFixed(2)}, 收益指数: ${impact.gain.toFixed(2)}`,
    };

    // 自动决策支持 (DSS)
    if (impact.gain > 0.8 && impact.risk < 0.3) {
      plan.status = "accepted";
      log(`DSS 建议: 自动采纳 (高收益/低风险)`);
    } else if (impact.risk > 0.7) {
      plan.status = "discussed";
      log(`DSS 建议: 组织冲突会议 (高风险)`);
    }

    return plan;
  }

  /**
   * 影响评估 (ADJ)
   */
  private analyzeImpact(feedbacks: SkillBasedFeedback[]): { risk: number; gain: number } {
    let totalRisk = 0;
    let totalGain = 0;

    feedbacks.forEach((f) => {
      // 模拟影响评估逻辑
      if (f.severity === FeedbackSeverity.CRITICAL) totalRisk += 0.4;
      if (f.severity === FeedbackSeverity.HIGH) totalRisk += 0.2;

      totalGain += f.expectedImprovement * f.priorityScore;
    });

    return {
      risk: Math.min(totalRisk, 1.0),
      gain: Math.min(totalGain, 1.0),
    };
  }

  /**
   * 有效性验证 (VAL)
   */
  public validateAdjustment(plan: AdjustmentPlan, addStep?: (msg: string) => void): boolean {
    const log = (msg: string) => {
      if (addStep) addStep(`[Validation] ${msg}`);
    };

    log(`正在验证调整方案 ${plan.id} 的有效性...`);
    // 模拟验证逻辑：如果有 Rationale 且非 Reject，则认为有效
    return plan.status !== "rejected";
  }

  // --- 内部私有生成方法 ---

  private generateTechnicalFeedback(req: any, agent: any): SkillBasedFeedback | null {
    // 模拟识别技术问题：如果需求包含 "高并发" 但没有提到 "缓存"
    const content = JSON.stringify(req).toLowerCase();
    if (content.includes("高并发") && !content.includes("缓存")) {
      return {
        id: uuidv4(),
        agentId: agent.id,
        agentRole: agent.role,
        requirementId: req.id || "unknown",
        type: FeedbackType.PERFORMANCE_ISSUE,
        severity: FeedbackSeverity.HIGH,
        skillUsed: "Architecture Analysis",
        confidence: 0.9,
        problemDescription: "需求提到高并发但缺少缓存策略，可能导致数据库崩溃。",
        impactAnalysis: { risk: "High", performance: "Poor" },
        correctionSuggestions: ["增加 Redis 缓存层", "实施数据库读写分离"],
        expectedImprovement: 0.8,
        timestamp: new Date().toISOString(),
        priorityScore: 0.85,
      };
    }
    return null;
  }

  private generateProductFeedback(req: any, agent: any): SkillBasedFeedback | null {
    const content = JSON.stringify(req).toLowerCase();
    if (content.includes("分布式") && !content.includes("监控")) {
      return {
        id: uuidv4(),
        agentId: agent.id,
        agentRole: agent.role,
        requirementId: req.id || "unknown",
        type: FeedbackType.MAINTAINABILITY,
        severity: FeedbackSeverity.MEDIUM,
        skillUsed: "Product Strategy",
        confidence: 0.8,
        problemDescription: "分布式系统缺乏链路追踪和监控，运维成本极高。",
        impactAnalysis: { maintenance_cost: "High" },
        correctionSuggestions: ["集成 SkyWalking 或 ELK 监控", "定义健康检查接口"],
        expectedImprovement: 0.6,
        timestamp: new Date().toISOString(),
        priorityScore: 0.65,
      };
    }
    return null;
  }

  private generateUXFeedback(req: any, agent: any): SkillBasedFeedback | null {
    // 模拟 UX 反馈
    return null;
  }
}
