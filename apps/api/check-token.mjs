import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const clients = await prisma.apiClient.findMany({
    select: {
      id: true,
      name: true,
      tokens: true,
      toolAllowlist: true,
      permissionAllowlist: true
    }
  });
  
  console.log('📋 API Clients:\n');
  clients.forEach((c, i) => {
    console.log(`${i + 1}. ${c.name} (${c.id})`);
    console.log(`   toolAllowlist: ${JSON.stringify(c.toolAllowlist)}`);
    console.log(`   permissionAllowlist: ${JSON.stringify(c.permissionAllowlist)}`);
    if (c.tokens && c.tokens.length > 0) {
      console.log(`   tokens: ${c.tokens.map(t => t.token).join(', ')}`);
    }
    console.log('');
  });
  
  await prisma.$disconnect();
}

check();
