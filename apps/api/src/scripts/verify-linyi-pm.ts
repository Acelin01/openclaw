
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLinyiAgents() {
  const linyiEmail = 'linyi@renrenvc.com';
  const linyi = await prisma.user.findUnique({
    where: { email: linyiEmail }
  });

  if (!linyi) {
    console.log('User linyi@renrenvc.com not found');
    return;
  }

  console.log(`Checking agents for linyi (ID: ${linyi.id})...`);

  // 1. Check UserContact table
  const contacts = await prisma.userContact.findMany({
    where: { userId: linyi.id },
    include: {
      agent: true
    }
  });

  console.log('\n--- UserContact Agents ---');
  contacts.forEach(c => {
    if (c.agent) {
      console.log(`Agent: ${c.agent.name} (ID: ${c.agent.id}, Identifier: ${c.agent.identifier})`);
    }
  });

  // 2. Check Agents created by linyi or public or associated via projects
  const agentsData = await prisma.agent.findMany({
    where: {
      OR: [
        { userId: linyi.id },
        { isCallableByOthers: true },
        { projects: { some: { members: { some: { userId: linyi.id } } } } }
      ]
    }
  });

  console.log('\n--- Agents via userId/Public/Projects ---');
  agentsData.forEach(a => {
    console.log(`Agent: ${a.name} (ID: ${a.id}, Identifier: ${a.identifier})`);
  });

  // 3. Specifically look for "互联网产品经理"
  const pmAgent = await prisma.agent.findFirst({
    where: {
      name: '互联网产品经理'
    }
  });

  if (pmAgent) {
    console.log('\n--- "互联网产品经理" Details ---');
    console.log(`ID: ${pmAgent.id}`);
    console.log(`UserId: ${pmAgent.userId}`);
    
    // Check if linyi is a member of any project this agent is in
    const projectMemberships = await prisma.projectTeamMember.findMany({
      where: {
        userId: linyi.id,
        project: {
          agents: {
            some: {
              id: pmAgent.id
            }
          }
        }
      },
      include: {
        project: true
      }
    });

    console.log(`Project memberships for linyi that include this agent: ${projectMemberships.length}`);
    projectMemberships.forEach(m => {
      console.log(`- Project: ${m.project.name} (ID: ${m.project.id})`);
    });
  } else {
    console.log('\n"互联网产品经理" agent not found in database');
  }
}

checkLinyiAgents()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
