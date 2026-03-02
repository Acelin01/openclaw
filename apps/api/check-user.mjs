import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findFirst({
    select: { id: true, email: true, name: true }
  });
  
  if (user) {
    console.log('✅ 找到用户:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
  } else {
    console.log('⚠️  未找到用户，创建测试用户...');
    const created = await prisma.user.create({
      data: {
        email: 'test@uxin.ai',
        name: 'Test User',
        role: 'ADMIN'
      }
    });
    console.log('✅ 用户已创建:');
    console.log(`  ID: ${created.id}`);
    console.log(`  Email: ${created.email}`);
  }
  
  await prisma.$disconnect();
}

check();
