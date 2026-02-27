export enum KnowledgeType {
  GRAPH = "graph",
  MODEL = "model",
  RULE = "rule",
  CASE = "case",
}

export interface KnowledgeItem {
  id: string;
  type: KnowledgeType;
  content: any;
  tags: string[];
}

/**
 * 知识管理层 (Knowledge Management Layer)
 */
export class KnowledgeManager {
  private libraries: Map<KnowledgeType, KnowledgeItem[]> = new Map();

  constructor() {
    Object.values(KnowledgeType).forEach((type) => {
      this.libraries.set(type, []);
    });
  }

  public addKnowledge(item: KnowledgeItem): void {
    const lib = this.libraries.get(item.type);
    if (lib) {
      lib.push(item);
      console.log(`[KnowledgeManager] Added ${item.type} knowledge: ${item.id}`);
    }
  }

  public query(type: KnowledgeType, query: string): KnowledgeItem[] {
    const lib = this.libraries.get(type) || [];
    // 模拟简单查询
    return lib.filter(
      (item) =>
        JSON.stringify(item.content).includes(query) ||
        item.tags.some((tag) => tag.includes(query)),
    );
  }
}
