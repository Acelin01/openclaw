/**
 * Capability definition
 */
export interface Capability {
  name: string;
  level: number; // 1-5
  description: string;
}

/**
 * Agent Registration entry
 */
export interface AgentRegistration {
  agentId: string;
  name: string;
  capabilities: Capability[];
  availability: "available" | "busy" | "offline";
  performanceMetrics: {
    successRate: number;
    avgResponseTimeMs: number;
  };
}

/**
 * Service Discovery & Capability Registry
 * Based on design document: 互联网项目负责人智能体系统融合设计方案 (Section 2.2)
 */
export class CapabilityRegistry {
  private agents: Map<string, AgentRegistration> = new Map();

  /**
   * Register an agent and its capabilities
   */
  register(registration: AgentRegistration) {
    this.agents.set(registration.agentId, registration);
    console.log(`Agent registered: ${registration.name} (${registration.agentId})`);
  }

  /**
   * Find agents by required capabilities
   */
  findAgentsByCapability(capabilityName: string, minLevel: number = 1): AgentRegistration[] {
    return Array.from(this.agents.values()).filter((agent) =>
      agent.capabilities.some((cap) => cap.name === capabilityName && cap.level >= minLevel),
    );
  }

  /**
   * Dynamic Matchmaking Algorithm
   * Based on Section 2.2: factors: ["技能匹配度", "响应时间", "历史表现", "成本效率"]
   */
  matchmake(requirement: { capability: string; minLevel?: number }): AgentRegistration | null {
    const candidates = this.findAgentsByCapability(requirement.capability, requirement.minLevel);

    if (candidates.length === 0) return null;

    // Sort by performance metrics (success rate / response time)
    return candidates.sort((a, b) => {
      const scoreA = a.performanceMetrics.successRate / a.performanceMetrics.avgResponseTimeMs;
      const scoreB = b.performanceMetrics.successRate / b.performanceMetrics.avgResponseTimeMs;
      return scoreB - scoreA;
    })[0];
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): AgentRegistration[] {
    return Array.from(this.agents.values());
  }
}
