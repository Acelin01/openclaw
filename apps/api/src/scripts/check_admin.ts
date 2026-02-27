
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });
    console.log('--- Admins ---');
    admins.forEach((u: any) => console.log(`${u.email} (${u.id}) - Role: ${u.role}`));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
