import 'server-only';
import { desc, eq, and, gt, asc, count, gte } from 'drizzle-orm';
import type { ArtifactKind } from "@uxin/artifact-ui";
import { db } from './index';
import {
  user,
  chat,
  message,
  document,
  suggestion,
  vote,
  type DBMessage,
  stream,
  project,
  agent,
} from './schema';
import { hash } from 'bcrypt-ts';
import { generateUUID } from '../utils';
import type { AppUsage } from '../usage';

export async function getUser(email: string) {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error('Failed to get user:', error);
    return [];
  }
}

export async function updateUser({
  id,
  updates,
}: {
  id: string;
  updates: Partial<typeof user.$inferInsert>;
}) {
  try {
    await db.update(user).set(updates).where(eq(user.id, id));
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
}

export async function getProjectById({ id }: { id: string }) {
  try {
    const [result] = await db
      .select()
      .from(project)
      .where(eq(project.id, id));
    return result;
  } catch (error) {
    console.error('Failed to get project by id:', error);
    return null;
  }
}

export async function updateProject({ id, updates }: { id: string; updates: Partial<typeof project.$inferInsert> }) {
  try {
    await db
      .update(project)
      .set(updates)
      .where(eq(project.id, id));
  } catch (error) {
    console.error('Failed to update project:', error);
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  try {
    const hashedPassword = await hash(password, 10);
    const userId = generateUUID();
    await db.insert(user).values({
      id: userId,
      email,
      name: email.split('@')[0],
      password: hashedPassword,
      role: 'CUSTOMER',
    });
    return { id: userId, email };
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}@example.com`;
  const password = generateUUID();
  try {
    const hashedPassword = await hash(password, 10);
    const userId = generateUUID();
    await db.insert(user).values({
      id: userId,
      email,
      password: hashedPassword,
      role: 'CUSTOMER',
      name: 'Guest User',
    });
    return { id: userId, email };
  } catch (error) {
    console.error('Failed to create guest user:', error);
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error('Failed to get chats by user id:', error);
    return [];
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [result] = await db
      .select()
      .from(chat)
      .where(eq(chat.id, id));
    return result;
  } catch (error) {
    console.error('Failed to get chat by id:', error);
    return null;
  }
}

export async function saveChat({
  id,
  userId,
  title,
  agentId,
}: {
  id: string;
  userId: string;
  title: string;
  agentId?: string;
}) {
  try {
    return await db.insert(chat).values({
      id,
      userId,
      title,
      agentId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save chat:', error);
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error('Failed to delete chat by id:', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id:', error);
    return [];
  }
}

export async function saveMessages({ messages }: { messages: Array<any> }) {
  try {
    // Check if messages is empty
    if (messages.length === 0) return;

    // Filter out messages that might already exist or ensure we handle conflicts?
    // For simplicity, just insert. Drizzle doesn't support createMany for all drivers seamlessly but mysql2 does.
    // However, map to proper shape.
    const values = messages.map((msg) => ({
      id: msg.id,
      chatId: msg.chatId,
      role: msg.role,
      parts: msg.parts, // Assuming parts is already JSON compatible or handled by driver
      attachments: msg.attachments || [],
      authorName: msg.authorName,
      authorAvatar: msg.authorAvatar,
      createdAt: new Date(),
    }));

    await db.insert(message).values(values);
  } catch (error) {
    console.error('Failed to save messages:', error);
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(message)
      .where(
        and(eq(message.chatId, chatId), gt(message.createdAt, timestamp))
      );
  } catch (error) {
    console.error('Failed to delete messages by chat id after timestamp:', error);
    throw error;
  }
}

export async function updateChatTitleById({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) {
  try {
    await db
      .update(chat)
      .set({ title })
      .where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat title:', error);
    throw error;
  }
}

export async function toggleChatPinStatusById({
  chatId,
}: {
  chatId: string;
}) {
  try {
    const currentChat = await getChatById({ id: chatId });
    if (!currentChat) throw new Error('Chat not found');

    await db
      .update(chat)
      .set({ isPinned: !currentChat.isPinned })
      .where(eq(chat.id, chatId));
    
    return !currentChat.isPinned;
  } catch (error) {
    console.error('Failed to toggle chat pin status:', error);
    throw error;
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'public' | 'private';
}) {
  try {
    await db
      .update(chat)
      .set({ visibility })
      .where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat visibility:', error);
    throw error;
  }
}

export async function updateChatProjectIdById({
  chatId,
  projectId,
}: {
  chatId: string;
  projectId: string | null;
}) {
  try {
    await db
      .update(chat)
      .set({ projectId })
      .where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat project id:', error);
    throw error;
  }
}

export async function updateChatLastContextById({
  chatId,
  context,
}: {
  chatId: string;
  context: AppUsage;
}) {
  try {
    await db.update(chat).set({ lastContext: context }).where(eq(chat.id, chatId));
  } catch (error) {
    console.warn('Failed to update lastContext for chat', chatId, error);
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    const [result] = await db
      .select()
      .from(message)
      .where(eq(message.id, id));
    return result;
  } catch (error) {
    console.error('Failed to get message by id:', error);
    return null;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const since = new Date(Date.now() - differenceInHours * 60 * 60 * 1000);
    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(and(eq(chat.userId, id), gte(message.createdAt, since), eq(message.role, 'user')));
    return Number((stats as any)?.count ?? 0);
  } catch (error) {
    console.error('Failed to get message count by user id:', error);
    return 0;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(eq(suggestion.documentId, documentId))
      .orderBy(asc(suggestion.createdAt));
  } catch (error) {
    console.error('Failed to get suggestions by document id:', error);
    return [];
  }
}

export async function saveDocument({
  id,
  title,
  content,
  kind,
  userId,
  chatId,
  messageId,
  agentId,
  status,
  visibility,
}: {
  id: string;
  title: string;
  content?: string;
  kind: ArtifactKind;
  userId: string;
  chatId?: string;
  messageId?: string;
  agentId?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  visibility?: 'public' | 'private';
}) {
  try {
    await db.insert(document).values({
      id,
      title,
      content,
      kind: kind as any,
      userId,
      chatId,
      messageId,
      agentId,
      status: status || 'PENDING',
      visibility: visibility || 'private',
      createdAt: new Date(),
    });
    return { id, title, content, kind, userId, chatId, messageId, agentId, status, visibility };
  } catch (error) {
    console.error('Failed to save document:', error);
    console.error('Document save params:', { 
      id, title, kind, userId, chatId, messageId, agentId, status, visibility, 
      contentLength: content?.length,
      contentPreview: content ? content.substring(0, 100) : null
    });
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [result] = await db
      .select()
      .from(document)
      .where(eq(document.id, id));
    return result;
  } catch (error) {
    console.error('Failed to get document by id:', error);
    return null;
  }
}

export async function getDocumentsByUserId({
  userId,
  kind,
  visibility,
}: {
  userId: string;
  kind?: ArtifactKind;
  visibility?: 'public' | 'private';
}) {
  try {
    const conditions = [eq(document.userId, userId)];
    
    if (kind) {
      conditions.push(eq(document.kind, kind as any));
    }
    
    if (visibility) {
      conditions.push(eq(document.visibility, visibility));
    }

    return await db
      .select()
      .from(document)
      .where(and(...conditions))
      .orderBy(desc(document.createdAt));
  } catch (error) {
    console.error('Failed to get documents by user id:', error);
    return [];
  }
}

export async function getPublicDocumentsByUserId(userId: string) {
  return getDocumentsByUserId({ userId, visibility: 'public' });
}

export async function getPublicAgentsByUserId(userId: string) {
  return getDocumentsByUserId({ userId, kind: 'agent', visibility: 'public' });
}

export async function getPublicServicesByUserId(userId: string) {
  return getDocumentsByUserId({ userId, kind: 'service', visibility: 'public' });
}

export async function getDocumentsByChatId({
  chatId,
}: {
  chatId: string;
}) {
  try {
    return await db
      .select()
      .from(document)
      .where(eq(document.chatId, chatId))
      .orderBy(desc(document.createdAt));
  } catch (error) {
    console.error('Failed to get documents by chat id:', error);
    return [];
  }
}

export async function getChatByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    const [result] = await db
      .select({ 
        chatId: document.chatId,
        messageId: document.messageId,
        agentId: document.agentId
      })
      .from(document)
      .where(eq(document.id, documentId));
    
    if (!result?.chatId) return null;
    
    const chatInfo = await getChatById({ id: result.chatId });
    if (!chatInfo) return null;

    return {
      ...chatInfo,
      messageId: result.messageId,
      agentId: result.agentId
    };
  } catch (error) {
    console.error('Failed to get chat by document id:', error);
    return null;
  }
}

export async function saveSuggestion({
  id,
  documentId,
  documentCreatedAt,
  originalText,
  suggestedText,
  description,
  userId,
  isResolved,
}: {
  id: string;
  documentId: string;
  documentCreatedAt: Date;
  originalText: string;
  suggestedText: string;
  description?: string;
  userId: string;
  isResolved: boolean;
}) {
  try {
    await db.insert(suggestion).values({
      id,
      documentId,
      documentCreatedAt,
      originalText,
      suggestedText,
      description,
      userId,
      isResolved,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save suggestion:', error);
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<{
    id: string;
    documentId: string;
    documentCreatedAt: Date;
    originalText: string;
    suggestedText: string;
    description?: string;
    userId: string;
    isResolved: boolean;
    createdAt: Date;
  }>;
}) {
  try {
    if (!suggestions?.length) return;
    await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions:', error);
    throw error;
  }
}

export async function getAgentById({ id }: { id: string }) {
  try {
    const [result] = await db.select().from(agent).where(eq(agent.id, id));
    return result;
  } catch (error) {
    console.error('Failed to get agent by id:', error);
    return null;
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db.insert(stream).values({
      id: streamId,
      chatId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to create stream id:', error);
  }
}

export async function getStreamIdsByChatId({
  chatId,
}: {
  chatId: string;
}): Promise<string[]> {
  try {
    const rows = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt));
    return rows.map((r) => r.id as string);
  } catch (error) {
    console.error('Failed to get stream ids by chat id:', error);
    return [];
  }
}
