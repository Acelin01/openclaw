/**
 * Conflict Types defined in design document
 */
export var ConflictType;
(function (ConflictType) {
    ConflictType["DEADLINE_MISSED"] = "deadline_missed";
    ConflictType["RESOURCE_CONFLICT"] = "resource_conflict";
    ConflictType["QUALITY_VIOLATION"] = "quality_violation";
    ConflictType["COMMUNICATION_BREAKDOWN"] = "communication_breakdown";
})(ConflictType || (ConflictType = {}));
/**
 * Resolution Strategy
 */
export var ResolutionStrategy;
(function (ResolutionStrategy) {
    ResolutionStrategy["PRIORITY_BASED"] = "priority_based_allocation";
    ResolutionStrategy["NEGOTIATION"] = "negotiation_mediated";
    ResolutionStrategy["HUMAN_INTERVENTION"] = "human_intervention";
    ResolutionStrategy["MARKET_AUCTION"] = "market_auction";
})(ResolutionStrategy || (ResolutionStrategy = {}));
/**
 * Conflict Detection Engine
 */
export class ConflictDetector {
    /**
     * Detect conflicts in a set of messages or project state
     */
    detect(messages, projectState) {
        const conflicts = [];
        // 1. Deadline Missed Detection
        const deadlineConflicts = this.checkDeadlines(projectState);
        conflicts.push(...deadlineConflicts);
        // 2. Resource Conflict Detection
        const resourceConflicts = this.checkResources(projectState);
        conflicts.push(...resourceConflicts);
        // 3. Quality Violation Detection (Mock)
        if (projectState.qualityMetrics && projectState.qualityMetrics.errorRate > 0.05) {
            conflicts.push({
                id: crypto.randomUUID(),
                type: ConflictType.QUALITY_VIOLATION,
                severity: "high",
                involvedAgents: ["tech_lead", "qa_agent"],
                description: "Error rate exceeded threshold (5%)",
                detectedAt: new Date().toISOString(),
                context: projectState.qualityMetrics,
            });
        }
        return conflicts;
    }
    checkDeadlines(state) {
        const conflicts = [];
        const now = new Date();
        if (state.milestones) {
            for (const m of state.milestones) {
                const deadline = new Date(m.deadline);
                if (deadline < now && m.status !== "completed") {
                    conflicts.push({
                        id: crypto.randomUUID(),
                        type: ConflictType.DEADLINE_MISSED,
                        severity: "critical",
                        involvedAgents: m.assignedAgents || ["project_lead"],
                        description: `Milestone "${m.name}" missed deadline: ${m.deadline}`,
                        detectedAt: now.toISOString(),
                        context: m,
                    });
                }
            }
        }
        return conflicts;
    }
    checkResources(state) {
        const conflicts = [];
        // Mock resource check logic
        if (state.resources && state.resources.overloadedAgents) {
            for (const agent of state.resources.overloadedAgents) {
                conflicts.push({
                    id: crypto.randomUUID(),
                    type: ConflictType.RESOURCE_CONFLICT,
                    severity: "medium",
                    involvedAgents: [agent.id],
                    description: `Agent ${agent.name} is overloaded (Capacity > 100%)`,
                    detectedAt: new Date().toISOString(),
                    context: agent,
                });
            }
        }
        return conflicts;
    }
    /**
     * Propose a resolution strategy
     */
    proposeResolution(conflict) {
        switch (conflict.type) {
            case ConflictType.DEADLINE_MISSED:
                return ResolutionStrategy.PRIORITY_BASED;
            case ConflictType.RESOURCE_CONFLICT:
                return ResolutionStrategy.NEGOTIATION;
            case ConflictType.QUALITY_VIOLATION:
                return ResolutionStrategy.HUMAN_INTERVENTION;
            default:
                return ResolutionStrategy.NEGOTIATION;
        }
    }
}
//# sourceMappingURL=conflict-detector.js.map