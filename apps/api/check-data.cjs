
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'linyi@renrenvc.com' }
  });
  console.log('User:', JSON.stringify(user, null, 2));

  if (user) {
    const contacts = await prisma.userContact.findMany({
      where: { userId: user.id },
      include: {
        contact: true,
        agent: true
      }
    });
    console.log('Contacts count:', contacts.length);
    console.log('First 2 contacts:', JSON.stringify(contacts.slice(0, 2), null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
