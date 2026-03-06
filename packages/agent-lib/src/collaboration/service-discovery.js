/**
 * Service Discovery & Capability Registry
 * Based on design document: 互联网项目负责人智能体系统融合设计方案 (Section 2.2)
 */
export class CapabilityRegistry {
    agents = new Map();
    /**
     * Register an agent and its capabilities
     */
    register(registration) {
        this.agents.set(registration.agentId, registration);
        console.log(`Agent registered: ${registration.name} (${registration.agentId})`);
    }
    /**
     * Find agents by required capabilities
     */
    findAgentsByCapability(capabilityName, minLevel = 1) {
        return Array.from(this.agents.values()).filter((agent) => agent.capabilities.some((cap) => cap.name === capabilityName && cap.level >= minLevel));
    }
    /**
     * Dynamic Matchmaking Algorithm
     * Based on Section 2.2: factors: ["技能匹配度", "响应时间", "历史表现", "成本效率"]
     */
    matchmake(requirement) {
        const candidates = this.findAgentsByCapability(requirement.capability, requirement.minLevel);
        if (candidates.length === 0)
            return null;
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
    getAllAgents() {
        return Array.from(this.agents.values());
    }
}
//# sourceMappingURL=service-discovery.js.map