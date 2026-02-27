import { ACPCoordinationMessage } from "@uxin/types";

/**
 * Conflict Types defined in design document
 */
export enum ConflictType {
  DEADLINE_MISSED = "deadline_missed",
  RESOURCE_CONFLICT = "resource_conflict",
  QUALITY_VIOLATION = "quality_violation",
  COMMUNICATION_BREAKDOWN = "communication_breakdown",
}

/**
 * Resolution Strategy
 */
export enum ResolutionStrategy {
  PRIORITY_BASED = "priority_based_allocation",
  NEGOTIATION = "negotiation_mediated",
  HUMAN_INTERVENTION = "human_intervention",
  MARKET_AUCTION = "market_auction",
}

export interface Conflict {
  id: string;
  type: ConflictType;
  severity: "low" | "medium" | "high" | "critical";
  involvedAgents: string[];
  description: string;
  detectedAt: string;
  context: any;
}

/**
 * Conflict Detection Engine
 */
export class ConflictDetector {
  /**
   * Detect conflicts in a set of messages or project state
   */
  detect(messages: ACPCoordinationMessage[], projectState: any): Conflict[] {
    const conflicts: Conflict[] = [];

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

  private checkDeadlines(state: any): Conflict[] {
    const conflicts: Conflict[] = [];
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

  private checkResources(state: any): Conflict[] {
    const conflicts: Conflict[] = [];
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
  proposeResolution(conflict: Conflict): ResolutionStrategy {
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
