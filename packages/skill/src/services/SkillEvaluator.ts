import { SkillExecutionResult } from "../types/skill";

export interface EvaluationMetric {
  name: string;
  score: number;
  weight: number;
}

export interface EvaluationResult {
  overallScore: number;
  metrics: EvaluationMetric[];
  feedback: string;
  timestamp: string;
}

export class SkillEvaluator {
  /**
   * 评估技能执行结果
   */
  public evaluate(result: SkillExecutionResult): EvaluationResult {
    const metrics: EvaluationMetric[] = [];

    // 基础质量评估
    if (result.qualityScores) {
      Object.entries(result.qualityScores).forEach(([outputName, scores]) => {
        Object.entries(scores).forEach(([metricName, score]) => {
          metrics.push({
            name: `${outputName}:${metricName}`,
            score,
            weight: 1.0,
          });
        });
      });
    }

    // 执行效率评估 (假设 1s 内为满分 1.0，超过 10s 为 0)
    const timeScore = Math.max(0, 1 - result.executionTime / 10);
    metrics.push({
      name: "execution_efficiency",
      score: timeScore,
      weight: 0.5,
    });

    // 成功率评估
    metrics.push({
      name: "success_status",
      score: result.success ? 1.0 : 0.0,
      weight: 2.0,
    });

    const totalWeight = metrics.reduce((sum, m) => sum + m.weight, 0);
    const weightedSum = metrics.reduce((sum, m) => {
      if (isNaN(m.score)) {
        console.log(`[SkillEvaluator] Warning: Metric ${m.name} has NaN score`);
      }
      return sum + m.score * m.weight;
    }, 0);
    const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

    return {
      overallScore,
      metrics,
      feedback: this.generateFeedback(overallScore, result.success, result.error),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 生成技能报告 (R4)
   */
  public generateReport(result: SkillExecutionResult, evaluation: EvaluationResult): string {
    return `
=== 技能执行报告 (Skill Report) ===
技能名称: ${result.skillName} (ID: ${result.skillId})
执行状态: ${result.success ? "成功" : "失败"}
执行用时: ${result.executionTime.toFixed(2)}s
综合评分: ${(evaluation.overallScore * 100).toFixed(1)}/100

评估反馈:
${evaluation.feedback}

详细指标:
${evaluation.metrics.map((m) => `- ${m.name}: ${(m.score * 100).toFixed(1)} (权重: ${m.weight})`).join("\n")}
==================================
`;
  }

  private generateFeedback(score: number, success: boolean, error?: string): string {
    if (!success) {
      return `执行失败: ${error || "未知错误"}`;
    }
    if (score > 0.9) return "执行完美，超出预期。";
    if (score > 0.7) return "执行良好，建议继续保持。";
    if (score > 0.5) return "执行合格，但仍有优化空间。";
    return "执行质量较低，需要重点改进。";
  }
}
