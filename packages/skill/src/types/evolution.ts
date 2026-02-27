export enum EvolutionPhase {
  ASSESSMENT = "assessment",
  PLANNING = "planning",
  EXECUTION = "execution",
  REFLECTION = "reflection",
  ADAPTATION = "adaptation",
}

export enum TimeHorizon {
  LONG_TERM = "long_term", // 1-5 years
  MID_TERM = "mid_term", // 3-12 months
  SHORT_TERM = "short_term", // 1-4 weeks
  IMMEDIATE = "immediate", // <1 week
}

export interface EvolutionGoal {
  id: string;
  description: string;
  timeHorizon: TimeHorizon;
  priority: number; // 0-1
  metrics: Record<string, { target: number; weight: number }>;
  dependencies: string[];
  status: "pending" | "in_progress" | "completed" | "failed";
  progress: number;
}

export interface EvolutionCycle {
  id: string;
  startTime: Date;
  endTime?: Date;
  requirements: any[];
  goals: EvolutionGoal[];
  phases: EvolutionPhase[];
  status: "active" | "completed" | "suspended";
}

export interface EvolutionInsight {
  id: string;
  type: "optimization" | "discovery" | "risk";
  content: string;
  confidence: number;
  sourceTaskId?: string;
  timestamp: Date;
}
