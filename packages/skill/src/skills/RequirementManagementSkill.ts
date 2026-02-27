import { Skill } from "../models/Skill";
import { SkillLevel, SkillDefinition } from "../types/skill";

/**
 * 需求管理技能 (RequirementManagementSkill)
 * 对应产品技能文档中的“需求管理技能”
 */
export class RequirementManagementSkill extends Skill {
  constructor(definition?: Partial<SkillDefinition>) {
    super({
      id: "skill-requirement-management",
      name: "需求管理技能",
      description: "进行用户故事解析、PRD文档生成及验收标准定义",
      category: "analysis", // 与 TaskAnalyzer 匹配
      level: SkillLevel.PROFICIENT,
      version: "1.0.0",
      inputs: [
        { name: "raw_requirements", type: "string", required: true, description: "原始需求描述" },
        { name: "product_context", type: "object", required: false, description: "产品上下文信息" },
      ],
      outputs: [
        { name: "user_stories", type: "list", qualityMetrics: ["clarity", "completeness"] },
        { name: "prd_document", type: "string", qualityMetrics: ["structure", "detail"] },
        { name: "acceptance_criteria", type: "list" },
      ],
      ...definition,
    });
  }

  protected async runImplementation(
    inputs: Record<string, any>,
    context: Record<string, any>,
  ): Promise<Record<string, any>> {
    const { raw_requirements, product_context = {} } = inputs;

    console.log(
      `[RequirementManagementSkill] 正在处理原始需求: ${raw_requirements.substring(0, 50)}...`,
    );

    // 模拟需求精炼与文档生成逻辑
    const user_stories = [
      {
        id: "US-1",
        story: "作为用户，我希望能够快速登录，以便开始使用功能。",
        priority: "High",
        complexity: "M",
      },
      {
        id: "US-2",
        story: "作为管理员，我希望能够查看所有用户状态，以便进行管理。",
        priority: "Medium",
        complexity: "S",
      },
    ];

    const prd_document = `
# 产品需求文档 (PRD) - ${product_context.product_name || "新功能"}

## 1. 产品概述
${raw_requirements}

## 2. 核心功能
- 快速登录与权限管理
- 用户状态监控仪表盘

## 3. 非功能需求
- 响应时间 < 200ms
- 并发支持 > 1000 QPS
    `;

    const acceptance_criteria = [
      "登录页面应在 1s 内加载完成",
      "管理员应能看到“封禁”和“解封”按钮",
      "系统应记录所有管理操作日志",
    ];

    return {
      user_stories,
      prd_document,
      acceptance_criteria,
    };
  }

  protected assessQuality(
    value: any,
    metrics: string[],
    results: Record<string, any> = {},
  ): Record<string, number> {
    const scores: Record<string, number> = {};
    for (const metric of metrics) {
      if (metric === "clarity") scores[metric] = 0.95;
      else if (metric === "completeness") scores[metric] = 0.9;
      else if (metric === "structure") scores[metric] = 0.88;
      else scores[metric] = 0.85;
    }
    return scores;
  }
}
