import { UserRole } from "@uxin/mcp";
/**
 * 智能体匹配引擎
 * 参考文档：基于需求和权限的智能体自动匹配系统
 */
export class AgentMatcher {
  /**
   * 按需求匹配最合适的智能体
   */
  async matchAgents(analysis, availableAgents, userRole, limit = 3) {
    const results = [];
    for (const agent of availableAgents) {
      const reasons = [];
      let score = 0;
      const matchedSkills = [];
      // 1. 权限过滤 (基石)
      if (!this.checkPermission(agent, userRole)) {
        continue;
      }
      // 2. 技能匹配
      const skillScore = this.calculateSkillMatch(analysis.requiredSkills, agent, matchedSkills);
      score += skillScore * 40; // 技能权重 40 (满分 100 逻辑)
      if (skillScore > 0) reasons.push(`技能匹配度: ${Math.round(skillScore * 100)}%`);
      // 3. 领域匹配
      if (agent.identifier?.includes(analysis.domain) || agent.name.includes(analysis.domain)) {
        score += 20;
        reasons.push(`专业领域匹配: ${analysis.domain}`);
      }
      // 4. 角色/意图匹配
      if (this.isRoleMatch(agent, analysis.intent)) {
        score += 20;
        reasons.push(`角色职责对齐: ${analysis.intent}`);
      }
      // 5. 复杂度与优先级适配 (新增)
      const capabilityScore = this.calculateCapabilityMatch(analysis, agent);
      score += capabilityScore;
      if (capabilityScore > 0) reasons.push(`能力模型适配 (复杂度/优先级)`);
      // 6. 负载平衡 (简化模拟)
      score += 5; // 假设所有智能体当前负载正常
      if (score > 10) {
        results.push({
          agent,
          score: Math.min(score, 100), // 封顶 100
          reasons,
          matchedSkills,
        });
      }
    }
    // 按得分排序并取前 N 个
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }
  /**
   * 能力模型适配计算
   */
  calculateCapabilityMatch(analysis, agent) {
    let bonus = 0;
    // 高复杂度需求匹配资深智能体 (假设 identifier 中包含 '资深' 或 '高级')
    const isSenior =
      agent.name.includes("资深") ||
      agent.name.includes("高级") ||
      (agent.identifier || "").includes("senior");
    if (analysis.complexity >= 7) {
      if (isSenior) bonus += 10;
    } else if (analysis.complexity <= 4) {
      if (!isSenior) bonus += 5; // 低复杂度匹配普通智能体，节省成本/资源
    }
    // 高优先级需求匹配响应速度快的智能体 (模拟)
    if (analysis.priority === "high") {
      bonus += 5;
    }
    return bonus;
  }
  /**
   * 权限检查
   */
  checkPermission(agent, userRole) {
    // 简化逻辑：如果是 ADMIN 可以访问所有；如果是 PROJECT_MANAGER 可以访问大部分；其他需要匹配
    if (userRole === UserRole.ADMIN) return true;
    // 某些智能体可能对角色有硬性要求 (这里可以扩展)
    return true;
  }
  /**
   * 技能匹配得分计算
   */
  calculateSkillMatch(required, agent, matched) {
    if (!required.length) return 1.0;
    // 检查 agent.prompt 或 description 中是否包含关键词
    let matchCount = 0;
    const agentContext = `${agent.name} ${agent.prompt} ${agent.identifier}`.toLowerCase();
    for (const skill of required) {
      if (agentContext.includes(skill.toLowerCase())) {
        matchCount++;
        matched.push(skill);
      }
    }
    return matchCount / required.length;
  }
  /**
   * 角色/意图匹配
   */
  isRoleMatch(agent, intent) {
    const intentMap = {
      develop: ["dev", "tech", "coding", "技术"],
      design: ["design", "ui", "ux", "设计"],
      plan: ["pm", "lead", "manager", "项目经理", "负责人"],
      product: ["product", "pm", "产品"],
      market: ["market", "growth", "市场"],
    };
    const keywords = intentMap[intent.toLowerCase()] || [intent.toLowerCase()];
    const agentName = agent.name.toLowerCase();
    const agentId = (agent.identifier || "").toLowerCase();
    return keywords.some((k) => agentName.includes(k) || agentId.includes(k));
  }
}
//# sourceMappingURL=agent-matcher.js.map
