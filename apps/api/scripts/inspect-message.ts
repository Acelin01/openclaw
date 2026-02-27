
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const message = await prisma.chatMessage.findFirst({
    where: {
      parts: {
        not: undefined
      }
    }
  });
  console.log(JSON.stringify(message, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
