import { Skill } from "../models/Skill";
import { SkillLevel, SkillDefinition } from "../types/skill";

/**
 * 架构设计技能 (ArchitectureDesignSkill)
 * 对应多智能体协作方案中的“架构专家”核心技能
 */
export class ArchitectureDesignSkill extends Skill {
  constructor(definition?: Partial<SkillDefinition>) {
    super({
      id: "skill-architecture-design",
      name: "架构设计技能",
      description: "进行系统架构规划、技术栈选型及高可用方案设计",
      category: "design",
      level: SkillLevel.PROFICIENT,
      version: "1.0.0",
      inputs: [
        { name: "requirements", type: "string", required: true, description: "需求规格说明" },
        { name: "constraints", type: "object", required: false, description: "技术约束与限制" },
      ],
      outputs: [
        {
          name: "system_architecture",
          type: "object",
          qualityMetrics: ["scalability", "reliability"],
        },
        { name: "tech_stack", type: "list", qualityMetrics: ["feasibility"] },
        { name: "deployment_plan", type: "object" },
      ],
      ...definition,
    });
  }

  protected async runImplementation(
    inputs: Record<string, any>,
    context: Record<string, any>,
  ): Promise<Record<string, any>> {
    const { requirements, constraints = {} } = inputs;

    console.log(`[ArchitectureDesignSkill] 正在设计系统架构，需求长度: ${requirements.length}`);

    // 模拟架构设计逻辑
    const system_architecture = {
      pattern: "Microservices with Event-driven Architecture",
      components: [
        { name: "API Gateway", role: "Traffic routing and security" },
        { name: "Auth Service", role: "Identity and access management" },
        { name: "Core Engine", role: "Business logic processing" },
        { name: "Notification Service", role: "Asynchronous messaging" },
      ],
      data_flow: "Request -> Gateway -> Service -> Database -> Message Bus -> Subscribers",
    };

    const tech_stack = [
      { layer: "Frontend", tech: "React + Tailwind CSS" },
      { layer: "Backend", tech: "Node.js + TypeScript" },
      { layer: "Database", tech: "PostgreSQL + Redis" },
      { layer: "Infrastructure", tech: "Docker + K8s" },
    ];

    const deployment_plan = {
      strategy: "Blue-Green Deployment",
      cloud_provider: "AWS/Azure",
      monitoring: "Prometheus + Grafana",
    };

    return {
      system_architecture,
      tech_stack,
      deployment_plan,
    };
  }

  protected assessQuality(
    value: any,
    metrics: string[],
    results: Record<string, any> = {},
  ): Record<string, number> {
    const scores: Record<string, number> = {};
    for (const metric of metrics) {
      if (metric === "scalability") scores[metric] = 0.9;
      else if (metric === "reliability") scores[metric] = 0.92;
      else if (metric === "feasibility") scores[metric] = 0.88;
      else scores[metric] = 0.85;
    }
    return scores;
  }
}
