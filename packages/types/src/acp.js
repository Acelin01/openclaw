/**
 * ACP 2.0 (Agent Collaboration Protocol) Types
 * Based on design document: 互联网项目负责人智能体系统融合设计方案
 */
export var ACPCommunicationPattern;
(function (ACPCommunicationPattern) {
  ACPCommunicationPattern["SYNCHRONOUS_REQUEST_RESPONSE"] = "synchronous_request_response";
  ACPCommunicationPattern["ASYNCHRONOUS_EVENT_DRIVEN"] = "asynchronous_event_driven";
  ACPCommunicationPattern["BROADCAST_NOTIFICATION"] = "broadcast_notification";
  ACPCommunicationPattern["CONSENSUS_DECISION"] = "consensus_decision";
  ACPCommunicationPattern["MARKET_BASED_NEGOTIATION"] = "market_based_negotiation";
})(ACPCommunicationPattern || (ACPCommunicationPattern = {}));
export var ACPMessagePriority;
(function (ACPMessagePriority) {
  ACPMessagePriority["EMERGENCY"] = "emergency";
  ACPMessagePriority["HIGH"] = "high";
  ACPMessagePriority["NORMAL"] = "normal";
  ACPMessagePriority["LOW"] = "low";
})(ACPMessagePriority || (ACPMessagePriority = {}));
export var ACPMessageIntent;
(function (ACPMessageIntent) {
  ACPMessageIntent["REQUEST"] = "request";
  ACPMessageIntent["RESPONSE"] = "response";
  ACPMessageIntent["NOTIFICATION"] = "notification";
  ACPMessageIntent["PROPOSAL"] = "proposal";
})(ACPMessageIntent || (ACPMessageIntent = {}));
export var ACPContentType;
(function (ACPContentType) {
  ACPContentType["TEXT"] = "text";
  ACPContentType["JSON"] = "json";
  ACPContentType["BINARY"] = "binary";
})(ACPContentType || (ACPContentType = {}));
//# sourceMappingURL=acp.js.map
