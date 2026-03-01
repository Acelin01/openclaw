import type { TestCaseContent, TestCaseStep } from "../artifacts/testcase/element";

export interface TestCaseDraft {
  id: string;
  title: string;
  description?: string;
  type: TestCaseContent["type"];
  priority: TestCaseContent["priority"];
  projectId?: string;
  precondition?: string;
  steps?: TestCaseStep[];
  expectedResult?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

class TestCaseManager {
  private drafts: Map<string, TestCaseDraft> = new Map();

  create(draft: Omit<TestCaseDraft, "id" | "createdAt" | "updatedAt">): TestCaseDraft {
    const id = `tc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const testCase: TestCaseDraft = {
      ...draft,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.drafts.set(id, testCase);
    return testCase;
  }

  get(id: string): TestCaseDraft | undefined {
    return this.drafts.get(id);
  }

  getAll(): TestCaseDraft[] {
    return Array.from(this.drafts.values());
  }

  update(id: string, updates: Partial<TestCaseDraft>): TestCaseDraft | undefined {
    const draft = this.drafts.get(id);
    if (!draft) return undefined;

    const updated = { ...draft, ...updates, updatedAt: Date.now() };
    this.drafts.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.drafts.delete(id);
  }

  // 从关键词创建测试用例
  createFromKeywords(keywords: string): TestCaseDraft {
    const lowerKeywords = keywords.toLowerCase();
    
    // 根据关键词自动识别测试类型和优先级
    let type: TestCaseContent["type"] = "FUNCTIONAL";
    let priority: TestCaseContent["priority"] = "MEDIUM";

    if (lowerKeywords.includes("性能") || lowerKeywords.includes("performance")) {
      type = "PERFORMANCE";
      priority = "HIGH";
    } else if (lowerKeywords.includes("安全") || lowerKeywords.includes("security")) {
      type = "SECURITY";
      priority = "CRITICAL";
    } else if (lowerKeywords.includes("集成") || lowerKeywords.includes("integration")) {
      type = "INTEGRATION";
    }

    // 根据关键词生成测试步骤
    const steps = this._generateStepsFromKeywords(keywords, type);

    return this.create({
      title: this._generateTitleFromKeywords(keywords, type),
      description: `测试用例：${keywords}`,
      type,
      priority,
      precondition: "测试环境已准备就绪",
      steps,
      expectedResult: "测试步骤全部通过",
      tags: this._generateTagsFromKeywords(keywords, type),
    });
  }

  private _generateTitleFromKeywords(keywords: string, type: string): string {
    const typeNames: Record<string, string> = {
      FUNCTIONAL: "功能测试",
      PERFORMANCE: "性能测试",
      SECURITY: "安全测试",
      INTEGRATION: "集成测试",
      REGRESSION: "回归测试",
      ACCEPTANCE: "验收测试",
    };
    return `${keywords}${typeNames[type] || "测试"}`;
  }

  private _generateStepsFromKeywords(keywords: string, type: string): TestCaseStep[] {
    const steps: TestCaseStep[] = [];

    if (type === "FUNCTIONAL") {
      steps.push(
        { step: "1", action: "打开相关页面或功能", expected: "页面正常加载，无错误提示" },
        { step: "2", action: "执行主要操作", expected: "操作成功，系统响应正确" },
        { step: "3", action: "验证结果", expected: "结果显示符合预期" },
        { step: "4", action: "检查数据持久化", expected: "数据正确保存" }
      );
    } else if (type === "PERFORMANCE") {
      steps.push(
        { step: "1", action: "配置性能测试工具", expected: "工具配置正确" },
        { step: "2", action: "设置并发用户数", expected: "用户数设置成功" },
        { step: "3", action: "执行压测", expected: "压测正常执行，无异常" },
        { step: "4", action: "收集性能指标", expected: "获取响应时间、吞吐量等数据" }
      );
    } else if (type === "SECURITY") {
      steps.push(
        { step: "1", action: "准备测试场景", expected: "场景配置正确" },
        { step: "2", action: "执行安全测试", expected: "测试正常执行" },
        { step: "3", action: "检查安全漏洞", expected: "无安全漏洞或已正确处理" },
        { step: "4", action: "验证权限控制", expected: "权限控制正常" }
      );
    } else {
      steps.push(
        { step: "1", action: "准备测试环境", expected: "环境配置正确" },
        { step: "2", action: "执行测试步骤", expected: "步骤执行成功" },
        { step: "3", action: "验证测试结果", expected: "结果符合预期" }
      );
    }

    return steps;
  }

  private _generateTagsFromKeywords(keywords: string, type: string): string[] {
    const tags: string[] = [];
    
    // 添加类型标签
    const typeTags: Record<string, string> = {
      FUNCTIONAL: "功能测试",
      PERFORMANCE: "性能测试",
      SECURITY: "安全测试",
      INTEGRATION: "集成测试",
      REGRESSION: "回归测试",
      ACCEPTANCE: "验收测试",
    };
    if (typeTags[type]) tags.push(typeTags[type]);

    // 根据关键词添加标签
    if (keywords.includes("登录") || keywords.includes("注册")) {
      tags.push("用户认证");
    }
    if (keywords.includes("API") || keywords.includes("接口")) {
      tags.push("API 测试");
    }
    if (keywords.includes("页面") || keywords.includes("UI")) {
      tags.push("UI 测试");
    }
    if (keywords.includes("数据") || keywords.includes("数据库")) {
      tags.push("数据测试");
    }

    // 默认添加冒烟测试标签
    if (tags.length === 1) {
      tags.push("冒烟测试");
    }

    return tags;
  }

  // 转换为 artifact 内容
  toArtifactContent(draft: TestCaseDraft): TestCaseContent {
    return {
      id: draft.id,
      title: draft.title,
      description: draft.description,
      type: draft.type,
      priority: draft.priority,
      projectId: draft.projectId,
      precondition: draft.precondition,
      steps: draft.steps,
      expectedResult: draft.expectedResult,
      tags: draft.tags,
      status: "APPROVED",
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    };
  }
}

export const testcaseManager = new TestCaseManager();
