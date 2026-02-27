import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const mainEmail = 'linyi@renrenvc.com';
  const teamEmails = ['team1@163.com', 'team2@163.com', 'team3@163.com'];
  const allEmails = [mainEmail, ...teamEmails];

  // 1. Create or find Department
  let dept = await prisma.department.findFirst({ where: { name: 'RenrenVC' } });
  if (!dept) {
    dept = await prisma.department.create({ data: { name: 'RenrenVC' } });
    console.log('Created department: RenrenVC');
  }

  // 2. Assign users to department
  for (const email of allEmails) {
    await prisma.user.update({
      where: { email },
      data: { departmentId: dept.id }
    });
    console.log(`Assigned ${email} to RenrenVC department`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
