import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Check available models on prisma client
    console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_')));
    
    // Try both names
    const modelName = ('mCPTool' in prisma) ? 'mCPTool' : ('mcpTool' in prisma ? 'mcpTool' : null);
    
    if (!modelName) {
      console.error('mCPTool model not found on prisma client');
      return;
    }
    
    console.log(`Using model: ${modelName}`);
    const tools = await (prisma as any)[modelName].findMany();
    console.log('MCP Tools in Database:');
    console.log(JSON.stringify(tools, null, 2));
    console.log(`Total tools: ${tools.length}`);
  } catch (error) {
    console.error('Error fetching MCP tools:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
