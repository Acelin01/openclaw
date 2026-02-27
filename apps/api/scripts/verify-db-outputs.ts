
import { connectDatabase, disconnectDatabase, getPrisma } from '../src/lib/db/index.js';
import { 
  getChatsByUserId, 
  getVotesByChatId, 
  getDocumentsById, 
  getSuggestionsByDocumentId,
  createGuestUser
} from '../src/lib/db/queries.js';

async function main() {
  console.log('Connecting to database...');
  await connectDatabase();

  try {
    const prisma = getPrisma();
    if (!prisma) {
        throw new Error('Database connection failed');
    }

    console.log('Creating/Getting test user...');
    // Create a guest user to test with
    const user = await createGuestUser();
    console.log('Test User:', user.id);

    // Test getChatsByUserId
    console.log('\nTesting getChatsByUserId...');
    const chats = await getChatsByUserId({ id: user.id });
    console.log(`Chats found: ${chats.length}`);
    console.log('Chat output sample:', chats[0] || 'No chats');

    // Test getVotesByChatId (mock chat id)
    console.log('\nTesting getVotesByChatId...');
    const votes = await getVotesByChatId({ id: 'mock-chat-id' });
    console.log(`Votes found: ${votes.length}`);

    // Test getDocumentsById (mock doc id)
    console.log('\nTesting getDocumentsById...');
    const docs = await getDocumentsById({ id: 'mock-doc-id' });
    console.log(`Documents found: ${docs.length}`);
    
    // Test getSuggestionsByDocumentId (mock doc id)
    console.log('\nTesting getSuggestionsByDocumentId...');
    const suggestions = await getSuggestionsByDocumentId({ documentId: 'mock-doc-id' });
    console.log(`Suggestions found: ${suggestions.length}`);

  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await disconnectDatabase();
  }
}

main();
