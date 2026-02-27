export interface DomainKnowledge {
  category: string;
  content: string;
  tags: string[];
}

/**
 * 知识技能库 (KnowledgeBase) - 对应序列图中的 KS
 */
export class KnowledgeBase {
  private static instance: KnowledgeBase;
  private knowledge: Map<string, DomainKnowledge[]> = new Map();

  private constructor() {
    this.initDefaultKnowledge();
  }

  public static getInstance(): KnowledgeBase {
    if (!KnowledgeBase.instance) {
      KnowledgeBase.instance = new KnowledgeBase();
    }
    return KnowledgeBase.instance;
  }

  private initDefaultKnowledge() {
    // 知识图谱技能库 (KS)
    this.addKnowledge("graph", {
      category: "graph",
      content: "技能关系图谱：分析技能 -> 设计技能 -> 编码技能 -> 测试技能。",
      tags: ["knowledge-graph", "ontology"],
    });

    // 模型技能库 (KM)
    this.addKnowledge("model", {
      category: "model",
      content: "GPT-4o 技能模型：擅长逻辑推理、代码生成与文档撰写。",
      tags: ["llm", "capabilities"],
    });

    // 规则技能库 (KR)
    this.addKnowledge("rule", {
      category: "rule",
      content: "执行准则：所有输出必须经过质量评估环境 (EVAL) 验证，得分低于 0.7 必须重试。",
      tags: ["compliance", "validation"],
    });

    // 案例技能库 (KC)
    this.addKnowledge("case", {
      category: "case",
      content: "成功案例：某电商系统架构设计，采用微服务 + K8s，吞吐量提升 300%。",
      tags: ["experience", "best-practice"],
    });

    this.addKnowledge("requirements", {
      category: "requirements",
      content: "需求分析核心方法：用户故事、用例分析、功能分解。",
      tags: ["analysis", "methodology"],
    });
    this.addKnowledge("coding", {
      category: "coding",
      content: "编码规范：Clean Code 原则、模块化设计、单元测试覆盖。",
      tags: ["development", "best-practices"],
    });
    this.addKnowledge("architecture", {
      category: "architecture",
      content: "架构设计原则：高内聚低耦合、微服务架构、DDD 领域驱动设计。",
      tags: ["design", "architecture"],
    });
    this.addKnowledge("product_management", {
      category: "analysis",
      content:
        "产品管理建议：从小范围开始试点，选择一个高频、规则相对明确的任务（如用户故事梳理）作为第一个技能包。",
      tags: ["product", "strategy"],
    });
    this.addKnowledge("testing", {
      category: "quality_assurance",
      content: "测试驱动开发 (TDD)：先写测试，再写实现，最后重构。确保 100% 覆盖核心逻辑。",
      tags: ["qa", "tdd", "testing"],
    });
  }

  public addKnowledge(category: string, knowledge: DomainKnowledge) {
    const list = this.knowledge.get(category) || [];
    list.push(knowledge);
    this.knowledge.set(category, list);
  }

  public getKnowledgeByCategory(category: string): DomainKnowledge[] {
    return this.knowledge.get(category) || [];
  }

  public searchKnowledge(query: string): DomainKnowledge[] {
    const results: DomainKnowledge[] = [];
    for (const list of this.knowledge.values()) {
      for (const k of list) {
        if (k.content.includes(query) || k.tags.some((t) => t.includes(query))) {
          results.push(k);
        }
      }
    }
    return results;
  }
}
