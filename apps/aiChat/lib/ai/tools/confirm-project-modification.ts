import { tool } from 'ai';
import { z } from 'zod';

export const confirmProjectModification = tool({
  description: 'Request user confirmation for project information modification.',
  parameters: z.object({
    id: z.string().describe('The ID of the project being modified.'),
    name: z.string().describe('The name of the project.'),
    description: z.string().optional().describe('A description of why the modification is needed.'),
    changes: z.array(z.object({
      field: z.string().describe('The field being modified.'),
      oldValue: z.string().describe('The original value.'),
      newValue: z.string().describe('The new value.'),
    })).describe('A list of changes being proposed.'),
  }),
  execute: async () => {
    // This tool is interactive and will be handled by the UI.
    // The result will be provided by the user clicking "Agree" or "Reject".
    return { status: 'pending' };
  },
});
