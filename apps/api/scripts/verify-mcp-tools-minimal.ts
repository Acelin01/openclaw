import {
  projectCollaborationMCPTools,
  businessSupportMCPTools,
  technicalAnalysisMCPTools,
  orchestrationMCPTools,
} from "../src/lib/ai/tools/mcp/mcp-tools.js";
import { resolveDefaultAllowlist } from "../src/lib/mcp/permissions.js";

const groups = {
  project: projectCollaborationMCPTools,
  business: businessSupportMCPTools,
  technical: technicalAnalysisMCPTools,
  orchestration: orchestrationMCPTools,
};

const allTools = new Map<string, string>();
const duplicates: string[] = [];

Object.entries(groups).forEach(([groupName, tools]) => {
  Object.keys(tools).forEach((toolName) => {
    if (allTools.has(toolName)) {
      duplicates.push(toolName);
    }
    allTools.set(toolName, groupName);
  });
});

const allowlist = resolveDefaultAllowlist();
const missingAllowlist = allowlist.filter((tool) => !allTools.has(tool));

console.log("mcp_tool_groups", Object.keys(groups).length);
Object.entries(groups).forEach(([groupName, tools]) => {
  console.log(`mcp_tools_${groupName}`, Object.keys(tools).length);
});
console.log("mcp_tools_total", allTools.size);
console.log("allowlist_total", allowlist.length);
console.log("allowlist_missing", missingAllowlist);
console.log("duplicate_tools", duplicates);
