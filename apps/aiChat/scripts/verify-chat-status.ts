
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { chat, message } from '../lib/db/schema';
import { eq, desc } from 'drizzle-orm';

async function verify() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'XLY123',
    database: 'uxin',
  });

  const db = drizzle(connection);

  try {
    const id = 'b4603ea7-dff5-4a7a-82f2-49a86e41b6aa';
    console.log(`Checking chat ${id}...`);
    const [chatResult] = await db.select().from(chat).where(eq(chat.id, id));
    
    if (chatResult) {
      console.log('Chat found:', chatResult.id, chatResult.title);
      
      const messages = await db
        .select()
        .from(message)
        .where(eq(message.chatId, id))
        .orderBy(desc(message.createdAt))
        .limit(5);
        
      console.log('Recent messages:', messages.length);
      messages.forEach(m => {
        console.log(`- [${m.role}] Content: ${m.content?.substring(0, 50)}`);
        console.log(`  Parts: ${JSON.stringify(m.parts).substring(0, 200)}`);
      });
    } else {
      console.log('Chat NOT found');
    }
  } catch (error) {
    console.error('Error checking chat:', error);
  } finally {
    await connection.end();
  }
}

verify();
