import { v4 as uuidv4 } from "uuid";
import { Skill } from "../models/Skill";
import {
  LearningMethod,
  LearningStatus,
  LearningPlan,
  SkillLevel,
  SkillCertification,
} from "../types/skill";
import { SkillRegistry } from "./SkillRegistry";

/**
 * 技能学习系统 (Skill Learning System)
 * 实现从需求识别到技能认证的完整闭环
 */
export class SkillLearningSystem {
  private registry: SkillRegistry;
  private learningPlans: Map<string, LearningPlan> = new Map();
  private certifications: Map<string, SkillCertification[]> = new Map();

  constructor(registry: SkillRegistry) {
    this.registry = registry;
  }

  /**
   * 1. 评估技能差距 (AssessGap)
   */
  public assessGap(skillId: string, requiredLevel: SkillLevel): boolean {
    const skill = this.registry.getSkill(skillId);
    if (!skill) return true; // 技能不存在，差距 100%
    return skill.definition.level < requiredLevel;
  }

  /**
   * 2. 制定学习计划 (PlanLearning)
   */
  public planLearning(skillId: string, method: LearningMethod): LearningPlan {
    const plan: LearningPlan = {
      id: uuidv4(),
      skillId,
      method,
      status: LearningStatus.PLANNING,
      resources: this.prepareResources(method),
      progress: 0,
      startDate: new Date().toISOString(),
    };
    this.learningPlans.set(plan.id, plan);
    console.log(`[SkillLearningSystem] Plan created for ${skillId} using ${method}`);
    return plan;
  }

  /**
   * 3. 实施学习 (ImplementLearning)
   */
  public async implementLearning(planId: string): Promise<void> {
    const plan = this.learningPlans.get(planId);
    if (!plan) return;

    plan.status = LearningStatus.IN_PROGRESS;
    console.log(`[SkillLearningSystem] Learning started for plan ${planId}`);

    // 模拟学习过程
    for (let i = 0; i <= 100; i += 25) {
      plan.progress = i;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    plan.status = LearningStatus.EVALUATING;
  }

  /**
   * 4. 评估进展与掌握程度 (EvaluateProgress & CheckMastery)
   */
  public checkMastery(planId: string, testScore: number): boolean {
    const plan = this.learningPlans.get(planId);
    if (!plan) return false;

    const isMastered = testScore >= 0.85;
    if (isMastered) {
      plan.status = LearningStatus.COMPLETED;
      plan.endDate = new Date().toISOString();
      this.certifySkill(plan.skillId);
    } else {
      console.log(
        `[SkillLearningSystem] Mastery not achieved for plan ${planId}, adjusting plan...`,
      );
      this.adjustPlan(plan);
    }
    return isMastered;
  }

  /**
   * 5. 技能认证 (CertifySkill)
   */
  private certifySkill(skillId: string): void {
    const skill = this.registry.getSkill(skillId);
    if (!skill) return;

    const certification: SkillCertification = {
      skillId,
      level: skill.definition.level + 1, // 晋升一级
      issueDate: new Date().toISOString(),
      authority: "Uxin AI Academy",
    };

    const certs = this.certifications.get(skillId) || [];
    certs.push(certification);
    this.certifications.set(skillId, certs);

    // 更新技能档案 (UpdateProfile)
    skill.definition.level = certification.level;
    console.log(`[SkillLearningSystem] Skill ${skillId} certified at level ${certification.level}`);
  }

  private prepareResources(method: LearningMethod): string[] {
    switch (method) {
      case LearningMethod.SELF_STUDY:
        return ["Documentation", "Open Source Code"];
      case LearningMethod.MENTOR_GUIDE:
        return ["Mentor Session", "Code Review"];
      case LearningMethod.PRACTICE:
        return ["Training Sandbox", "Demo Project"];
      case LearningMethod.COURSE:
        return ["Video Lectures", "Quiz"];
      default:
        return [];
    }
  }

  private adjustPlan(plan: LearningPlan): void {
    plan.status = LearningStatus.PLANNING;
    plan.progress = Math.max(0, plan.progress - 20); // 退回部分进度
    plan.resources.push("Supplementary Material");
  }

  public getPlan(planId: string): LearningPlan | undefined {
    return this.learningPlans.get(planId);
  }
}
