
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const docKeywords = ['文档', '方案', '协议', '说明书', '手册', '报告', '计划', '书', 'document', 'proposal', 'agreement', 'manual', 'report', 'plan'];
  
  const textDocs = await prisma.document.findMany({
    where: {
      kind: 'text'
    }
  });

  console.log(`Found ${textDocs.length} text documents.`);

  for (const doc of textDocs) {
    console.log(`Updating document "${doc.title}" (${doc.id}) to kind "document"`);
    await (prisma as any).document.update({
      where: { 
        id_createdAt: {
          id: doc.id,
          createdAt: doc.createdAt
        }
      },
      data: { kind: 'document' }
    });
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
