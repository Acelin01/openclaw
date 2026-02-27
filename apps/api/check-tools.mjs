import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Checking MCP Tools ---');
  const tools = await prisma.mCPTool.findMany({
    include: {
      mcp_tools_A: true,
      mcp_tools_B: true,
    }
  });

  console.log(`Total tools found: ${tools.length}`);
  
  for (const tool of tools) {
    console.log(`ID: ${tool.id}, Name: ${tool.name}`);
    if (tool.mcp_tools_A && tool.mcp_tools_A.length > 0) {
      console.log(`  Sub-tools (A): ${tool.mcp_tools_A.map(t => t.id).join(', ')}`);
    }
    if (tool.mcp_tools_B && tool.mcp_tools_B.length > 0) {
      console.log(`  Linked from (B): ${tool.mcp_tools_B.map(t => t.id).join(', ')}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
