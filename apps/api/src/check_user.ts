
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'linyi@renrenvc.com';
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      chats: {
        include: {
          documents: true,
        }
      }
    }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log(`User ID: ${user.id}`);
  console.log(`Total Chats: ${user.chats.length}`);

  user.chats.forEach((chat, index) => {
    console.log(`\nChat ${index + 1}:`);
    console.log(`- ID: ${chat.id}`);
    console.log(`- Title: ${chat.title}`);
    console.log(`- Visibility: ${chat.visibility}`);
    console.log(`- Documents Count: ${chat.documents?.length || 0}`);
    
    chat.documents?.forEach((doc, docIndex) => {
      console.log(`  Document ${docIndex + 1}:`);
      console.log(`  - ID: ${doc.id}`);
      console.log(`  - Title: ${doc.title}`);
      console.log(`  - Visibility: ${doc.visibility}`);
      console.log(`  - Kind: ${doc.kind}`);
    });
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
