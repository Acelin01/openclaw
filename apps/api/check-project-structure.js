import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({
    where: { email: 'linyi@renrenvc.com' }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { userId: user.id },
        { members: { some: { userId: user.id } } }
      ]
    },
    take: 1
  });

  console.log('Sample Project Data:', JSON.stringify(projects[0], null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
