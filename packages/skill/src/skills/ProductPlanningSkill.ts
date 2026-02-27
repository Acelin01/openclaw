import { Skill } from "../models/Skill";
import { SkillLevel, SkillDefinition } from "../types/skill";

/**
 * 产品规划技能 (ProductPlanningSkill)
 * 对应产品技能文档中的“产品规划技能”
 */
export class ProductPlanningSkill extends Skill {
  constructor(definition?: Partial<SkillDefinition>) {
    super({
      id: "skill-product-planning",
      name: "产品规划技能",
      description: "制定产品路线图、功能优先级排序及MVP定义",
      category: "analysis",
      level: SkillLevel.PROFICIENT,
      version: "1.0.0",
      inputs: [
        { name: "product_vision", type: "string", required: true, description: "产品愿景与目标" },
        { name: "feature_backlog", type: "list", required: true, description: "功能候选列表" },
      ],
      outputs: [
        { name: "product_roadmap", type: "object", qualityMetrics: ["alignment", "feasibility"] },
        { name: "prioritized_features", type: "list", qualityMetrics: ["roi"] },
        { name: "mvp_scope", type: "object" },
      ],
      ...definition,
    });
  }

  protected async runImplementation(
    inputs: Record<string, any>,
    context: Record<string, any>,
  ): Promise<Record<string, any>> {
    const { product_vision, feature_backlog } = inputs;

    console.log(`[ProductPlanningSkill] 正在规划产品路线图，愿景: ${product_vision}`);

    // 模拟优先级排序 (RICE 模型)
    const prioritized_features = feature_backlog
      .map((f: any) => ({
        ...f,
        rice_score: (Math.random() * 100).toFixed(1),
        priority: Math.random() > 0.5 ? "High" : "Medium",
      }))
      .sort((a: any, b: any) => b.rice_score - a.rice_score);

    const mvp_scope = {
      features: prioritized_features
        .filter((f: any) => f.priority === "High")
        .map((f: any) => f.name),
      target_release: "Q3 2026",
      success_metrics: ["DAU > 1000", "Retention > 30%"],
    };

    const product_roadmap = {
      phases: [
        {
          name: "Phase 1: Foundation (MVP)",
          timeline: "3 months",
          focus: "Core value proposition",
        },
        { name: "Phase 2: Growth", timeline: "6 months", focus: "User acquisition and sharing" },
        {
          name: "Phase 3: Monetization",
          timeline: "12 months",
          focus: "Premium features and API access",
        },
      ],
    };

    return {
      product_roadmap,
      prioritized_features,
      mvp_scope,
    };
  }

  protected assessQuality(
    value: any,
    metrics: string[],
    results: Record<string, any> = {},
  ): Record<string, number> {
    const scores: Record<string, number> = {};
    for (const metric of metrics) {
      if (metric === "alignment") scores[metric] = 0.92;
      else if (metric === "feasibility") scores[metric] = 0.85;
      else if (metric === "roi") scores[metric] = 0.88;
      else scores[metric] = 0.8;
    }
    return scores;
  }
}
