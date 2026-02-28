import type { ProjectRequirement } from "../client/chat-client";
import { generateUUID } from "../lib/utils";

export interface RequirementDraft {
  id: string;
  title: string;
  description: string;
  skills?: string[];
  parameters?: Record<string, unknown>;
  createdAt: number;
  status: "draft" | "pending_review" | "approved" | "rejected";
  reviewNotes?: string;
}

export interface RequirementTemplate {
  id: string;
  name: string;
  content: string;
}

/**
 * 项目需求管理器 - 处理需求文档的创建、解析和管理
 */
export class ProjectRequirementManager {
  private drafts: Map<string, RequirementDraft> = new Map();
  private requirements: Map<string, ProjectRequirement> = new Map();

  /**
   * 创建需求草稿
   */
  createDraft(
    title: string,
    description: string,
    skills?: string[],
    parameters?: Record<string, unknown>
  ): RequirementDraft {
    const draft: RequirementDraft = {
      id: generateUUID(),
      title,
      description,
      skills: skills || [],
      parameters: parameters || {},
      createdAt: Date.now(),
      status: "draft",
    };

    this.drafts.set(draft.id, draft);
    return draft;
  }

  /**
   * 更新需求草稿
   */
  updateDraft(
    id: string,
    updates: Partial<RequirementDraft>
  ): RequirementDraft | null {
    const draft = this.drafts.get(id);
    if (!draft) {
      return null;
    }

    const updated = { ...draft, ...updates, updatedAt: Date.now() };
    this.drafts.set(id, updated);
    return updated;
  }

  /**
   * 提交草稿进行审核
   */
  submitForReview(id: string): RequirementDraft | null {
    return this.updateDraft(id, { status: "pending_review" });
  }

  /**
   * 审核需求
   */
  reviewRequirement(
    id: string,
    approved: boolean,
    notes?: string
  ): RequirementDraft | null {
    return this.updateDraft(id, {
      status: approved ? "approved" : "rejected",
      reviewNotes: notes,
    });
  }

  /**
   * 将审核通过的需求转换为正式需求
   */
  approveToRequirement(draft: RequirementDraft): ProjectRequirement {
    const requirement: ProjectRequirement = {
      id: draft.id,
      title: draft.title,
      description: draft.description,
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: Date.now(),
    };

    this.requirements.set(requirement.id, requirement);
    return requirement;
  }

  /**
   * 获取需求草稿
   */
  getDraft(id: string): RequirementDraft | undefined {
    return this.drafts.get(id);
  }

  /**
   * 获取所有草稿
   */
  getAllDrafts(): RequirementDraft[] {
    return Array.from(this.drafts.values());
  }

  /**
   * 获取待审核的草稿
   */
  getPendingReviewDrafts(): RequirementDraft[] {
    return Array.from(this.drafts.values()).filter(
      (d) => d.status === "pending_review"
    );
  }

  /**
   * 获取正式需求
   */
  getRequirement(id: string): ProjectRequirement | undefined {
    return this.requirements.get(id);
  }

  /**
   * 获取所有正式需求
   */
  getAllRequirements(): ProjectRequirement[] {
    return Array.from(this.requirements.values());
  }

  /**
   * 删除草稿
   */
  deleteDraft(id: string): boolean {
    return this.drafts.delete(id);
  }

  /**
   * 解析输入内容生成需求草稿
   */
  parseInputToDraft(input: string): RequirementDraft {
    const parsed = this.parseInput(input);
    return this.createDraft(
      parsed.title,
      parsed.description,
      parsed.skills,
      parsed.parameters
    );
  }

  /**
   * 生成需求文档 Markdown
   */
  generateMarkdown(requirement: ProjectRequirement): string {
    return `# ${requirement.title}

## 状态
${this.getStatusText(requirement.status)}

## 描述
${requirement.description}

## 元数据
- 创建时间：${new Date(requirement.createdAt).toLocaleString("zh-CN")}
- 更新时间：${new Date(requirement.updatedAt).toLocaleString("zh-CN")}
- ID: ${requirement.id}

---
*此文档由 ChatLite 自动生成*
`;
  }

  /**
   * 生成需求文档 JSON（用于 artifact 客户端）
   */
  generateJSON(requirement: ProjectRequirement): string {
    return JSON.stringify(requirement, null, 2);
  }

  private parseInput(input: string): {
    title: string;
    description: string;
    skills?: string[];
    parameters?: Record<string, unknown>;
  } {
    // 尝试解析结构化的输入
    const titleMatch = input.match(/标题 [：:]\s*(.+?)(?:\n|$)/);
    const descMatch = input.match(/描述 [：:]\s*(.+?)(?:\n|$)/);

    let title = titleMatch ? titleMatch[1].trim() : "未命名需求";
    let description = descMatch ? descMatch[1].trim() : input;

    // 如果没有明确的标题，尝试从第一行提取
    if (!titleMatch) {
      const firstLine = input.split("\n")[0].trim();
      if (firstLine && firstLine.length < 50) {
        title = firstLine.replace(/^[#*]+/, "").trim();
        description = input.slice(firstLine.length).trim();
      }
    }

    // 提取技能提示
    const skillPatterns = [
      { pattern: /项目 (管理 | 经理)/i, skill: "project-manager" },
      { pattern: /需求分析/i, skill: "requirement-analyzer" },
      { pattern: /任务 (拆解 | 规划)/i, skill: "task-planner" },
      { pattern: /设计 (架构 | 模式)/i, skill: "architecture-design" },
    ];

    const skills: string[] = [];
    for (const { pattern, skill } of skillPatterns) {
      if (pattern.test(input)) {
        skills.push(skill);
      }
    }

    return {
      title,
      description,
      skills: skills.length > 0 ? skills : undefined,
      parameters: { rawInput: input },
    };
  }

  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      draft: "草稿",
      pending_review: "待审核",
      approved: "已批准",
      rejected: "已拒绝",
    };
    return statusMap[status] || status;
  }
}

// 导出单例
export const requirementManager = new ProjectRequirementManager();
