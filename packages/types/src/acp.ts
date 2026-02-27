/**
 * ACP 2.0 (Agent Collaboration Protocol) Types
 * Based on design document: 互联网项目负责人智能体系统融合设计方案
 */

export enum ACPCommunicationPattern {
  SYNCHRONOUS_REQUEST_RESPONSE = "synchronous_request_response",
  ASYNCHRONOUS_EVENT_DRIVEN = "asynchronous_event_driven",
  BROADCAST_NOTIFICATION = "broadcast_notification",
  CONSENSUS_DECISION = "consensus_decision",
  MARKET_BASED_NEGOTIATION = "market_based_negotiation",
}

export enum ACPMessagePriority {
  EMERGENCY = "emergency",
  HIGH = "high",
  NORMAL = "normal",
  LOW = "low",
}

export enum ACPMessageIntent {
  REQUEST = "request",
  RESPONSE = "response",
  NOTIFICATION = "notification",
  PROPOSAL = "proposal",
}

export enum ACPContentType {
  TEXT = "text",
  JSON = "json",
  BINARY = "binary",
}

export interface ACPMessageHeader {
  message_id: string;
  timestamp: string; // ISO8601
  sender: string; // agent_id
  recipients: string[]; // agent_ids
  priority: ACPMessagePriority;
  ttl_seconds?: number;
  conversation_id: string;
}

export interface ACPMessageBody {
  intent: ACPMessageIntent;
  content_type: ACPContentType;
  action: string;
  parameters: Record<string, any>;
  context: {
    project_id: string;
    phase?: string;
    dependencies?: string[]; // message_ids
    constraints?: Record<string, any>;
  };
  expectation?: {
    response_deadline?: string; // ISO8601
    required_capabilities?: string[];
    fallback_agents?: string[];
  };
}

export interface ACPCoordinationMessage {
  header: ACPMessageHeader;
  body: ACPMessageBody;
}

export interface ACPMessage extends ACPCoordinationMessage {}

export interface ACPConversation {
  id: string;
  project_id: string;
  participants: string[];
  messages: ACPMessage[];
  status: "active" | "archived" | "completed";
}

export interface ACPCollaborationContract {
  agreement_id: string;
  parties: Record<string, string>; // {agent_id: role}
  scope: string;
  deliverables: string[];
  timeline: Record<string, string>; // {milestone: date}
  quality_standards: string[];
  communication_protocol: string;
  conflict_resolution: string;
  termination_conditions: string[];
}

export interface ACPCapabilityRegistry {
  agent_id: string;
  capabilities: Array<{
    name: string;
    level: number;
    description: string;
  }>;
  availability: string;
  performance_metrics: {
    success_rate: number;
    avg_response_time: number;
  };
}
