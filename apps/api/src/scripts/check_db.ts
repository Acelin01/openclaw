
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      take: 5,
      include: {
        chats: {
            include: {
                messages: true
            }
        },
        workerProfile: true
      }
    });

    console.log('--- Users ---');
    for (const u of users) {
        console.log(`User: ${u.email} (${u.id}) - Role: ${u.role}`);
        console.log(`  WorkerProfile: ${u.workerProfile ? 'Yes' : 'No'}`);
        console.log(`  Chats: ${u.chats.length}`);
        u.chats.forEach((c: any) => {
            console.log(`    Chat ${c.id}: ${c.messages.length} messages`);
        });
    }

    const transactions = await prisma.transaction.findMany({ take: 5 });
    console.log('\n--- Transactions ---');
    console.log(`Total: ${transactions.length}`);
    transactions.forEach((t: any) => console.log(`  ${t.id}: ${t.status} (${t.amount} ${t.currency})`));

    const providers = await prisma.user.findMany({
        where: { role: 'PROVIDER' },
        take: 5
    });
    console.log('\n--- Providers ---');
    console.log(`Total: ${providers.length}`);
    providers.forEach((p: any) => console.log(`  ${p.email} (${p.id})`));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
