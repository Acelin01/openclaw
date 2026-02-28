import type { SkillInfo } from "../client/chat-client";

export interface MatchedSkill {
  skill: SkillInfo;
  confidence: number;
  extractedParams: Record<string, unknown>;
}

export interface ParsedSkillCall {
  skillName: string;
  action?: string;
  params: Record<string, unknown>;
  rawInput: string;
}

/**
 * 技能匹配器 - 根据用户输入匹配最合适的技能
 */
export class SkillMatcher {
  private skills: SkillInfo[] = [];

  setSkills(skills: SkillInfo[]): void {
    this.skills = skills;
  }

  /**
   * 匹配技能
   * @param userInput 用户输入
   * @returns 匹配的技能列表（按置信度排序）
   */
  match(userInput: string): MatchedSkill[] {
    const results: MatchedSkill[] = [];

    for (const skill of this.skills) {
      const { confidence, extractedParams } = this.calculateConfidence(
        userInput,
        skill
      );

      if (confidence > 0.3) {
        results.push({
          skill,
          confidence,
          extractedParams,
        });
      }
    }

    // 按置信度排序
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 解析技能调用
   * @param userInput 用户输入
   * @returns 解析后的技能调用
   */
  parseSkillCall(userInput: string): ParsedSkillCall | null {
    // 检测技能调用格式：@skill-name action params
    const mentionMatch = userInput.match(/@(\S+)\s*(.*)/);
    if (mentionMatch) {
      const [, skillName, rest] = mentionMatch;
      return this.parseMentionedSkill(skillName, rest || "", userInput);
    }

    // 检测命令格式：/skill-name action params
    const commandMatch = userInput.match(/^\/(\S+)\s*(.*)/);
    if (commandMatch) {
      const [, skillName, rest] = commandMatch;
      return this.parseMentionedSkill(skillName, rest || "", userInput);
    }

    // 自然语言匹配
    const matches = this.match(userInput);
    if (matches.length > 0 && matches[0].confidence > 0.5) {
      return {
        skillName: matches[0].skill.name,
        params: matches[0].extractedParams,
        rawInput: userInput,
      };
    }

    return null;
  }

  /**
   * 解析被提及的技能调用
   */
  private parseMentionedSkill(
    skillName: string,
    rest: string,
    rawInput: string
  ): ParsedSkillCall {
    // 解析 action 和参数
    const parts = rest.trim().split(/\s+/);
    const action = parts[0] || undefined;
    const paramStrings = parts.slice(1);

    const params: Record<string, unknown> = {};

    // 解析 key=value 格式的参数
    for (const param of paramStrings) {
      const [key, ...valueParts] = param.split("=");
      if (key && valueParts.length > 0) {
        params[key] = valueParts.join("=");
      }
    }

    // 如果没有明确的 key=value，将整个 rest 作为 content/description
    if (Object.keys(params).length === 0 && rest.trim()) {
      // 尝试从上下文推断参数名
      const skill = this.skills.find((s) => s.name === skillName);
      if (skill) {
        const paramNames = Object.keys(skill.parameters || {});
        if (paramNames.length > 0) {
          params[paramNames[0]] = rest.trim();
        }
      } else {
        params.content = rest.trim();
      }
    }

    return {
      skillName,
      action,
      params,
      rawInput,
    };
  }

  /**
   * 计算输入与技能的置信度
   */
  private calculateConfidence(
    userInput: string,
    skill: SkillInfo
  ): { confidence: number; extractedParams: Record<string, unknown> } {
    const normalizedInput = userInput.toLowerCase();
    const skillName = skill.name.toLowerCase();
    const skillDesc = skill.description.toLowerCase();

    let confidence = 0;
    const extractedParams: Record<string, unknown> = {};

    // 名称匹配（最高权重）
    if (normalizedInput.includes(skillName)) {
      confidence += 0.5;
    }

    // 描述关键词匹配
    const keywords = this.extractKeywords(skillDesc);
    const matchedKeywords = keywords.filter((kw) =>
      normalizedInput.includes(kw)
    );
    confidence += matchedKeywords.length * 0.1;

    // 参数提取
    extractedParams.content = userInput;

    // 尝试提取特定模式的参数
    // 例如：标题、描述、项目名称等
    const titleMatch = userInput.match(/标题 [：:]\s*(.+?)(?:[，,。.]|$)/);
    if (titleMatch) {
      extractedParams.title = titleMatch[1].trim();
      confidence += 0.1;
    }

    const descMatch = userInput.match(/描述 [：:]\s*(.+?)(?:[。.]|$)/);
    if (descMatch) {
      extractedParams.description = descMatch[1].trim();
      confidence += 0.1;
    }

    // 项目名称匹配
    const projectMatch = userInput.match(/项目 [：:]\s*(.+?)(?:[，,。.]|$)/);
    if (projectMatch) {
      extractedParams.projectName = projectMatch[1].trim();
      confidence += 0.1;
    }

    return {
      confidence: Math.min(confidence, 1),
      extractedParams,
    };
  }

  /**
   * 从描述中提取关键词
   */
  private extractKeywords(description: string): string[] {
    // 简单的中文分词（基于常见词汇）
    const commonWords = [
      "需求",
      "项目",
      "任务",
      "管理",
      "分析",
      "设计",
      "测试",
      "开发",
      "文档",
      "报告",
      "计划",
      "进度",
      "跟踪",
    ];

    const keywords: string[] = [];
    for (const word of commonWords) {
      if (description.includes(word)) {
        keywords.push(word);
      }
    }

    return keywords;
  }
}

// 导出单例
export const skillMatcher = new SkillMatcher();
