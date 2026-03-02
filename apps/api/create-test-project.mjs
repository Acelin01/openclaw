import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function create() {
  const project = await prisma.project.create({
    data: {
      userId: '19e0a8e1-cad9-420d-9d10-5cc5be8fb2f0',
      name: 'Q1 产品开发',
      description: '测试项目',
      status: '进行中'
    }
  });
  
  console.log('✅ 测试项目已创建:');
  console.log(`  ID: ${project.id}`);
  console.log(`  Name: ${project.name}`);
  
  await prisma.$disconnect();
}

create();
