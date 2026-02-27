import { tool } from "ai";
import { z } from "zod";

export const createMermaid = tool({
  description: "Create a Mermaid diagram to visualize workflows, processes, or structures. Use this for project planning and requirement analysis.",
  inputSchema: z.object({
    code: z.string().describe("The Mermaid diagram code (e.g., graph TD, sequenceDiagram, etc.)"),
    caption: z.string().optional().describe("A brief description or title for the diagram"),
  }),
  execute: async ({ code, caption }) => {
    return { code, caption };
  },
});
