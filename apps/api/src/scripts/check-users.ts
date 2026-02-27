
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany({
    where: { email: 'linyi@renrenvc.com' }
  });

  if (users.length > 0) {
    const linyi = users[0];
    console.log(`Found user: ${linyi.name} (ID: ${linyi.id})`);
    
    const contacts = await (prisma as any).userContact.findMany({
      where: { userId: linyi.id },
      include: { agent: true, contact: true }
    });

    console.log(`Contacts count: ${contacts.length}`);
    contacts.forEach((c: any) => {
      if (c.agent) {
        console.log(`- Agent Contact: ${c.agent.name} (ID: ${c.agent.id}, Identifier: ${c.agent.identifier})`);
      } else if (c.contact) {
        console.log(`- User Contact: ${c.contact.name} (Email: ${c.contact.email})`);
      }
    });

    const memberships = await (prisma as any).projectTeamMember.findMany({
      where: { 
        OR: [
          { userId: linyi.id },
          { agent: { userId: linyi.id } }
        ]
      },
      include: { project: true, agent: true, user: true }
    });

    console.log(`\nProject Memberships for linyi or linyi's agents: ${memberships.length}`);
    memberships.forEach((m: any) => {
      const target = m.agent ? `Agent: ${m.agent.name}` : `User: ${m.user?.name}`;
      console.log(`- Project: ${m.project.name} | Role: ${m.role} | Target: ${target}`);
    });
  } else {
    console.log('User linyi@renrenvc.com not found');
  }
}

checkUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
