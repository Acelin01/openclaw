
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { getChatsByUserId, getChatById, saveDocument, saveChat, createUser } from './src/lib/db/queries';
import { generateUUID } from './src/lib/utils';
import { getPrisma, connectDatabase } from './src/lib/db/index';

async function main() {
  console.log('Starting verification...');
  await connectDatabase();

  try {
    // 1. Create a user
    const email = `test-user-${Date.now()}@example.com`;
    const password = 'password123';
    const user = await createUser(email, password);
    console.log('User created:', user.id);

    // 2. Create a chat
    const chatId = generateUUID();
    await saveChat({
      id: chatId,
      userId: user.id,
      title: 'Test Chat',
      visibility: 'private', // Added visibility
    });
    console.log('Chat created:', chatId);

    // 3. Create a document associated with the chat
    const docId = generateUUID();
    await saveDocument({
      id: docId,
      title: 'Test Quote',
      kind: 'quote',
      content: '<html>Quote Content</html>',
      userId: user.id,
      chatId: chatId,
    });
    console.log('Document created:', docId);

    // 4. Fetch chat using getChatsByUserId
    const result = await getChatsByUserId({ id: user.id });
    const chatFromList = result.chats.find(c => c.id === chatId);
    
    if (chatFromList && chatFromList.documents && chatFromList.documents.length > 0) {
      console.log('SUCCESS: getChatsByUserId returned documents:', chatFromList.documents.map((d: any) => d.id));
    } else {
      console.error('FAILURE: getChatsByUserId did NOT return documents.');
      console.log('Chat from list:', chatFromList);
    }

    // 5. Fetch chat using getChatById
    const chatById = await getChatById({ id: chatId });
    if (chatById && chatById.documents && chatById.documents.length > 0) {
        console.log('SUCCESS: getChatById returned documents:', chatById.documents.map((d: any) => d.id));
    } else {
        console.error('FAILURE: getChatById did NOT return documents.');
        console.log('Chat by ID:', chatById);
    }

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await getPrisma().$disconnect();
  }
}

main();
