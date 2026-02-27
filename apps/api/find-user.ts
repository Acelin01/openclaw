import { DatabaseService } from './src/lib/db/service.js';
import { connectDatabase } from './src/lib/db/index.js';

async function findUser() {
  await connectDatabase();
  const db = DatabaseService.getInstance();
  
  try {
    const users = await db.getUsers({ role: 'ADMIN' }, { take: 1 });
    if (users.length > 0) {
      console.log('FOUND_ADMIN:', JSON.stringify(users[0]));
    } else {
      const allUsers = await db.getUsers({}, { take: 5 });
      console.log('ALL_USERS:', JSON.stringify(allUsers));
    }
  } catch (error) {
    console.error('Error finding user:', error);
  } finally {
    process.exit(0);
  }
}

findUser();
