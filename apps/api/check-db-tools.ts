
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tools = await prisma.mCPTool.findMany({
    where: {
      id: {
        in: [
          'seed-tool-agent-collaboration',
          'seed-tool-freelancer',
          'seed-tool-project-collaboration',
          'mcp-agent-collaboration-plan',
          'mcp-agent-collaboration-start',
          'mcp-freelancer-register'
        ]
      }
    }
  });
  console.log(JSON.stringify(tools, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
