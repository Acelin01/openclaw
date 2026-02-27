
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const agentCount = await prisma.agent.count();
  console.log(`Agent count: ${agentCount}`);
  
  if (agentCount > 0) {
    const agents = await prisma.agent.findMany({
      take: 5,
      select: { id: true, name: true, isCallableByOthers: true }
    });
    console.log('Sample agents:', JSON.stringify(agents, null, 2));
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
