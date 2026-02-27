import { Skill } from "../models/Skill";
import { SkillLevel } from "../types/skill";
import { EvaluationResult } from "./SkillEvaluator";

export class SkillLearner {
  /**
   * 基于评估结果更新技能模型
   */
  public learn(skill: Skill, evaluation: EvaluationResult): void {
    // 更新技能学习曲线
    skill.learningCurve.push(evaluation.overallScore);

    // 自动晋升逻辑
    this.checkPromotion(skill);

    // 记录学习日志
    console.log(
      `Skill ${skill.definition.name} learned from evaluation. New success rate: ${skill.successRate.toFixed(2)}`,
    );
  }

  private checkPromotion(skill: Skill): void {
    const recentScores = skill.learningCurve.slice(-5);
    if (recentScores.length < 5) return;

    const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

    // 如果最近 5 次平均分超过 0.9 且当前不是大师，则晋升
    if (avgScore > 0.9 && skill.definition.level < SkillLevel.MASTER) {
      const oldLevel = skill.definition.level;
      skill.definition.level += 1;
      console.log(
        `Skill ${skill.definition.name} promoted from level ${oldLevel} to ${skill.definition.level}`,
      );
    }
  }
}
