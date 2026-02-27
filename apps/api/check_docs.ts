
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const publicDocsCount = await prisma.document.count({
    where: { visibility: 'public' }
  });
  console.log(`Public documents count: ${publicDocsCount}`);

  if (publicDocsCount > 0) {
    const publicDocs = await prisma.document.findMany({
      where: { visibility: 'public' },
      take: 10,
      select: { id: true, title: true, visibility: true, kind: true }
    });
    console.log('Sample public documents:', JSON.stringify(publicDocs, null, 2));
  } else {
    const anyDocs = await prisma.document.findMany({
      take: 5,
      select: { id: true, title: true, visibility: true, kind: true }
    });
    console.log('Sample documents (any visibility):', JSON.stringify(anyDocs, null, 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
