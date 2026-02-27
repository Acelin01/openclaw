/**
 * Internet Specialized Skill Sets
 * Based on design document: 互联网项目负责人智能体系统融合设计方案 (Section 3.2)
 */

export const GrowthHackingSkills = {
  /**
   * Data-Driven Growth Strategy
   */
  growthStrategy: {
    name: "growth_strategy",
    description: "增长黑客与数据驱动决策技能",
    capabilities: [
      "A/B测试设计与分析",
      "用户转化漏斗优化",
      "传播系数 (K-factor) 建模",
      "留存率驱动因素分析",
    ],
    mcp_integration: ["google_analytics", "mixpanel", "amplitude", "segment"],
  },
};

export const UXSkills = {
  /**
   * User Experience & Product Design
   */
  experienceDesign: {
    name: "experience_design",
    description: "用户体验与产品设计技能",
    capabilities: [
      "交互原型快速迭代",
      "用户旅程地图映射",
      "设计系统一致性检查",
      "可用性测试方案设计",
    ],
    mcp_integration: ["figma", "sketch", "invision", "zeplin"],
  },
};

export const DevOpsSkills = {
  /**
   * Development & Operations Integration
   */
  continuousDelivery: {
    name: "continuous_delivery",
    description: "持续集成与持续交付技能",
    capabilities: [
      "CI/CD 流水线编排",
      "基础设施即代码 (IaC) 管理",
      "自动化冒烟测试集成",
      "灰度发布与回滚策略",
    ],
    mcp_integration: ["github", "gitlab", "jenkins", "docker"],
  },
};
