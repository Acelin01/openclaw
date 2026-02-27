import { Skill } from "../models/Skill";
import { SkillLevel } from "../types/skill";
import { AgentInfo } from "./AgentRegistry";
import { SkillRegistry } from "./SkillRegistry";

export interface SkillMatchResult {
  skill: Skill;
  score: number;
  isAvailable: boolean;
}

/**
 * 技能匹配器 (SkillMatcher)
 */
export class SkillMatcher {
  private registry: SkillRegistry;

  constructor() {
    this.registry = SkillRegistry.getInstance();
  }

  /**
   * 匹配技能需求 (M1, M2)
   */
  public match(requirements: string[]): SkillMatchResult[] {
    console.log(`[SkillMatcher] Matching skills for requirements: ${requirements.join(", ")}`);
    const results: SkillMatchResult[] = [];

    for (const req of requirements) {
      const candidates = this.registry.findSkillsByCategory(req);
      for (const skill of candidates) {
        results.push({
          skill,
          score: this.calculateMatchScore(skill, req),
          isAvailable: this.evaluateAvailability(skill),
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * 评估技能可用性 (M3)
   */
  public evaluateAvailability(skill: Skill): boolean {
    // 检查前置技能是否满足 (此处简化处理)
    const prerequisites = skill.definition.prerequisites || [];
    for (const pre of prerequisites) {
      if (!this.registry.getSkill(pre)) {
        return false;
      }
    }
    return true;
  }

  /**
   * 选择最佳技能组合 (M4)
   * 按需求顺序选择最佳匹配项
   */
  public selectBestCombination(requirements: string[]): Skill[] {
    const selected: Skill[] = [];
    const coveredReqs = new Set<string>();

    for (const req of requirements) {
      const matches = this.match([req]);
      const bestMatch = matches.find((m) => m.isAvailable);
      if (bestMatch && !coveredReqs.has(bestMatch.skill.definition.id)) {
        selected.push(bestMatch.skill);
        coveredReqs.add(bestMatch.skill.definition.id);
      }
    }

    return selected;
  }

  /**
   * 优化技能组合 (SM -> SM: 技能组合优化)
   * 考虑智能体的匹配度，不仅是技能本身的强度
   */
  public optimizeComposition(requirements: string[], agents: AgentInfo[]): Skill[] {
    console.log(`[SkillMatcher] 正在针对 ${agents.length} 个智能体优化技能组合...`);
    const selected: Skill[] = [];
    const usedSkills = new Set<string>();

    for (const req of requirements) {
      const candidates = this.match([req]);
      let bestSkill: Skill | undefined;
      let highestOverallScore = -1;

      for (const match of candidates) {
        if (!match.isAvailable || usedSkills.has(match.skill.definition.id)) continue;

        // 计算此技能与所有可用智能体的最高匹配得分
        let bestAgentScore = 0;
        for (const agent of agents) {
          const agentSkills = agent.capabilities.map((c) => c.name);
          if (agentSkills.includes(match.skill.definition.category)) {
            bestAgentScore = Math.max(bestAgentScore, 1.0);
          }
        }

        const overallScore = match.score * 0.6 + bestAgentScore * 0.4;
        if (overallScore > highestOverallScore) {
          highestOverallScore = overallScore;
          bestSkill = match.skill;
        }
      }

      if (bestSkill) {
        selected.push(bestSkill);
        usedSkills.add(bestSkill.definition.id);
      }
    }

    return selected;
  }

  private calculateMatchScore(skill: Skill, requirement: string): number {
    let score = 0;
    if (skill.definition.category === requirement) score += 0.5;

    // 根据等级加分
    score += skill.definition.level / 10;

    return Math.min(score, 1.0);
  }
}
