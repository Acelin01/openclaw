/**
 * Agile Project Management Skill Set
 * Based on design document: 互联网项目负责人智能体系统融合设计方案
 */
export const AgilePMSkills = {
  /**
   * Hybrid Planning Skill
   * Mixes Agile and Waterfall methodologies
   */
  hybridPlanning: {
    name: "hybrid_planning",
    description: "混合项目管理规划技能，整合迭代与里程碑",
    capabilities: [
      "敏捷-瀑布混合方法设计",
      "迭代与里程碑整合规划",
      "跨方法论依赖管理",
      "混合团队协作设计",
    ],
    tools: ["hybrid_planning_tool", "dependency_visualizer", "capacity_planner"],
    mcp_integration: ["jira", "microsoft_project", "miro"],
    /**
     * Generate a hybrid project plan
     */
    generateHybridPlan: (projectType, teamSize) => {
      const iterations = projectType === "web" ? 4 : 6;
      return {
        methodology: teamSize > 10 ? "Scrumban" : "Scrum-Waterfall",
        timeline: Array.from({ length: iterations }, (_, i) => ({
          iteration: i + 1,
          duration: "2 weeks",
          milestone: i % 2 === 0 ? `Phase ${Math.floor(i / 2) + 1} Gateway` : null,
          focus: i === 0 ? "MVP Core" : "Feature Expansion",
        })),
        riskAssessment:
          "Medium - Resource contention between agile dev and waterfall documentation phases",
      };
    },
  },
  /**
   * Sprint Retrospective Facilitation
   */
  sprintRetrospective: {
    name: "sprint_retrospective_facilitation",
    description: "迭代回顾会引导与优化技能",
    capabilities: [
      "迭代数据分析与洞察提取",
      "团队心理安全维护",
      "改进项优先级排序",
      "行动方案可行性评估",
    ],
    tools: ["retrospective_analyzer", "sentiment_analyzer", "action_planner"],
    mcp_integration: ["slack", "confluence", "google_sheets"],
    /**
     * Analyze sprint data to extract insights
     */
    analyzeSprintData: (data) => {
      const velocity = data.completedPoints / data.plannedPoints;
      return {
        efficiency: velocity > 0.9 ? "High" : velocity > 0.7 ? "Stable" : "Needs Improvement",
        insights: [
          velocity < 0.8 ? "Scope creep detected in mid-sprint" : "Team pace is consistent",
          data.qualityMetrics.bugs > 5
            ? "High technical debt impacting delivery"
            : "Quality standards met",
        ],
        actionItems: [
          "Review definition of done (DoD)",
          "Schedule deep-dive for technical debt reduction",
        ],
      };
    },
  },
};
/**
 * Helper to generate a coordination message for a skill
 */
export function createSkillMessage(
  senderId,
  recipientIds,
  skillName,
  action,
  parameters,
  projectId,
) {
  return {
    header: {
      message_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      sender: senderId,
      recipients: recipientIds,
      priority: "normal",
      conversation_id: crypto.randomUUID(),
    },
    body: {
      intent: "request",
      content_type: "json",
      action: `${skillName}.${action}`,
      parameters,
      context: {
        project_id: projectId,
      },
    },
  };
}
//# sourceMappingURL=agile-pm.js.map
