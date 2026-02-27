import { tool } from 'ai';
import { z } from 'zod';

const t = tool({
  description: 'test',
  parameters: z.object({ name: z.string() }),
  execute: async () => 'ok'
});

console.log('Tool with parameters:');
console.log(JSON.stringify(t, null, 2));

const t2 = tool({
  description: 'test2',
  inputSchema: z.object({ name: z.string() }) as any,
  execute: async () => 'ok'
});

console.log('\nTool with inputSchema:');
console.log(JSON.stringify(t2, null, 2));
