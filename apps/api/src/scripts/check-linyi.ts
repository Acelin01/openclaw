import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'linyi@renrenvc.com';
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      contacts: {
        include: {
          agent: true,
          contact: true,
        }
      },
      projectMemberships: {
        include: {
          project: {
            include: {
              members: {
                include: {
                  agent: true,
                  user: true,
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('User ID:', user.id);
  console.log('--- Contacts ---');
  user.contacts.forEach((c: any) => {
    if (c.agent) {
        console.log(`Agent Contact: ${c.agent.name} (ID: ${c.agent.id}, Group: ${c.groupName}, Agent UserId: ${c.agent.userId})`);
      } else if (c.contact) {
      console.log(`User Contact: ${c.contact.name} (Email: ${c.contact.email}, Group: ${c.groupName})`);
    }
  });

  console.log('--- Projects ---');
  user.projectMemberships.forEach((pm: any) => {
    console.log(`Project: ${pm.project.name} (ID: ${pm.project.id}, Role: ${pm.role})`);
    console.log('  Members:');
    pm.project.members.forEach((m: any) => {
      if (m.user) {
        console.log(`    - User: ${m.user.name} (Email: ${m.user.email}, ID: ${m.user.id})`);
      } else if (m.agent) {
        console.log(`    - Agent: ${m.agent.name} (ID: ${m.agent.id}, Identifier: ${m.agent.identifier}, Role: ${m.role})`);
      } else {
        console.log(`    - Unknown Member (ID: ${m.id})`);
      }
    });
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
