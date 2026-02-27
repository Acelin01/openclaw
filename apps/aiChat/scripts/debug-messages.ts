import { db } from '../lib/db';
import { message, chat } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const chatId = '932f2959-e0fc-48e1-9a1f-39d1a6c13ee9'; // Target chat ID // '03124bc2-a770-4bc1-abd1-3badb2ab4b69'
  try {
    console.log(`\n--- 深度查询对话详情: ${chatId} ---`);
    const chatData = await db.select().from(chat).where(eq(chat.id, chatId));
    console.log('Chat Info:', JSON.stringify(chatData, null, 2));

    console.log('Fetching messages for chat:', chatId);
    const messages = await db.select().from(message).where(eq(message.chatId, chatId)).orderBy(message.createdAt);
    
    console.log('Total messages:', messages.length);
    messages.forEach((msg, i) => {
      console.log(`\n--- Message ${i + 1} ---`);
      console.log('ID:', msg.id);
      console.log('Role:', msg.role);
      console.log('Content:', msg.content ? msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '') : 'null');
      console.log('Parts:', JSON.stringify(msg.parts, null, 2));
      console.log('CreatedAt:', msg.createdAt);
    });

  } catch (error) {
    console.error('查询出错:', error);
  } finally {
    process.exit(0);
  }
}

main().catch(console.error);
