import { tool } from "ai";
import { z } from "zod";

export const askQuestions = tool({
  description: "Ask the user one or more questions to gather necessary information. You SHOULD provide suggestions or expert analysis for each question to help the user decide (e.g., recommended budget range, team size, or technology choice).",
  inputSchema: z.object({
    questions: z.array(
      z.object({
        id: z.string().describe("Unique identifier for the question"),
        label: z.string().describe("The question text to display to the user"),
        placeholder: z.string().optional().describe("Optional placeholder text for the input field"),
        suggestion: z.string().optional().describe("AI's recommendation or analysis based on current context (e.g., 'Based on the complexity, we suggest a budget of 50k-80k')"),
      })
    ),
  }),
});
