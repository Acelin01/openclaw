import { AgentRole, AgentCapability } from "../types/collaboration";

export interface AgentInfo {
  id: string;
  name: string;
  role: AgentRole;
  capabilities: AgentCapability[];
  status: "idle" | "busy" | "offline";
  lastSeen: string;
}

export class AgentRegistry {
  private agents: Map<string, AgentInfo> = new Map();

  public register(agent: AgentInfo): void {
    this.agents.set(agent.id, agent);
  }

  public getAgent(id: string): AgentInfo | undefined {
    return this.agents.get(id);
  }

  public findAgentsByRole(role: AgentRole): AgentInfo[] {
    return Array.from(this.agents.values()).filter((a) => a.role === role);
  }

  public updateStatus(id: string, status: "idle" | "busy" | "offline"): void {
    const agent = this.agents.get(id);
    if (agent) {
      agent.status = status;
      agent.lastSeen = new Date().toISOString();
    }
  }

  public listAllAgents(): AgentInfo[] {
    return Array.from(this.agents.values());
  }

  /**
   * 计算智能体匹配度 (A2)
   */
  public calculateMatchScore(agentId: string, requiredSkills: string[]): number {
    const agent = this.agents.get(agentId);
    if (!agent || agent.status === "offline") return 0;

    let score = 0;
    const agentSkills = agent.capabilities.map((c) => c.name);

    for (const skill of requiredSkills) {
      if (agentSkills.includes(skill)) {
        score += 1;
      }
    }

    // 繁忙状态匹配度减半
    if (agent.status === "busy") score *= 0.5;

    return score / Math.max(requiredSkills.length, 1);
  }

  /**
   * 选择最佳智能体 (A3)
   */
  public selectBestAgent(requiredSkills: string[]): AgentInfo | undefined {
    console.log(`[AgentRegistry] Selecting best agent for skills: ${requiredSkills.join(", ")}`);
    const agents = this.listAllAgents();
    let bestAgent: AgentInfo | undefined;
    let highestScore = -1;

    for (const agent of agents) {
      const score = this.calculateMatchScore(agent.id, requiredSkills);
      if (score > highestScore) {
        highestScore = score;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }
}
