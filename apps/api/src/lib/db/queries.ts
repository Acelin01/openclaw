import { prisma } from './index.js';
import bcrypt from 'bcryptjs';
import { ChatSDKError } from "../errors.js";
import { generateUUID } from "../utils.js";
import type { ArtifactKind } from "../types.js";

// Types from the original file, adapted for Prisma
export type VisibilityType = 'public' | 'private';

// Helper for password hashing
async function generateHashedPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

// Helper to ensure database connection
export function getDB() {
  if (!prisma) {
    throw new ChatSDKError("bad_request:database", "Database not available");
  }
  return prisma;
}

export async function getUser(email: string) {
  try {
    const user = await getDB().user.findUnique({
      where: { email },
    });
    return user ? [user] : [];
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get user by email"
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = await generateHashedPassword(password);

  try {
    return await getDB().user.create({
      data: {
        email,
        password: hashedPassword,
        name: email.split('@')[0] || 'User', // Default name
      },
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to create user");
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}@example.com`; // Ensure valid email format
  const password = generateUUID();
  const hashedPassword = await generateHashedPassword(password);
  const id = generateUUID();

  try {
    const user = await getDB().user.create({
      data: {
        id,
        email,
        password: hashedPassword,
        name: 'Guest',
        role: 'CUSTOMER',
      },
    });
    return {
      id: user.id,
      email: user.email,
    };
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create guest user"
    );
  }
}

export async function ensureGuestUser(id: string, email: string) {
  try {
    const db = getDB();
    const existingUser = await db.user.findUnique({ where: { id } });
    if (existingUser) return existingUser;

    // Check if email is taken by another user
    const userByEmail = await db.user.findUnique({ where: { email } });
    if (userByEmail) {
        // If email exists but ID is different, we can't create the user with this email and ID.
        // We will return the existing user.
        return userByEmail;
    }

    return await db.user.create({
      data: {
        id,
        email,
        name: 'Guest User',
        role: 'CUSTOMER',
      }
    });
  } catch (error) {
    console.error('ensureGuestUser error:', error);
    // If concurrent creation happened, try to fetch again
    try {
        const db = getDB();
        const existingUser = await db.user.findUnique({ where: { id } });
        if (existingUser) return existingUser;
    } catch (e) {
        // ignore
    }
    
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to ensure guest user"
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
  projectId,
  agentId,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
  projectId?: string;
  agentId?: string;
}) {
  try {
    const db = getDB();
    if (!db) throw new Error('Database not available');
    return await db.chat.create({
      data: {
        id,
        userId,
        title,
        visibility,
        projectId,
        agentId,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    const db = getDB();
    if (!db) throw new Error('Database not available');
    await db.chat.delete({
      where: { id },
    });
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    const db = getDB();
    if (!db) throw new Error('Database not available');
    const result = await db.chat.deleteMany({
      where: { userId },
    });
    return { deletedCount: result.count };
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }
}

export async function getChatsByUserId({
  id,
  limit = 10,
  startingAfter,
  endingBefore,
  projectId,
}: {
  id: string;
  limit?: number;
  startingAfter?: string | null;
  endingBefore?: string | null;
  projectId?: string | null;
}) {
  try {
    const extendedLimit = limit + 1;
    let chats: any[] = [];
    let hasMore = false;

    const where: any = { userId: id };
    if (projectId) {
      where.projectId = projectId;
    }

    if (endingBefore) {
        chats = await getDB().chat.findMany({
            where,
            take: -extendedLimit,
            skip: 1,
            cursor: { id: endingBefore },
            orderBy: [
              { isPinned: 'desc' },
              { createdAt: 'desc' }
            ],
            include: { documents: true },
        });
        hasMore = chats.length >= extendedLimit;
        if (hasMore) {
            chats.shift();
        }
        chats.reverse(); // Back to DESC
    } else {
        chats = await getDB().chat.findMany({
            where,
            take: extendedLimit,
            skip: startingAfter ? 1 : 0,
            cursor: startingAfter ? { id: startingAfter } : undefined,
            orderBy: [
              { isPinned: 'desc' },
              { createdAt: 'desc' }
            ],
            include: { documents: true },
        });
        hasMore = chats.length >= extendedLimit;
        if (hasMore) {
            chats.pop();
        }
    }

    return { chats, hasMore };

  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get chats by user id"
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    return await getDB().chat.findUnique({
      where: { id },
      include: { documents: true },
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get chat by id");
  }
}

export async function getChatByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    const document = await getDB().document.findFirst({
      where: { id: documentId },
      orderBy: { createdAt: 'desc' },
      select: {
        chatId: true,
        messageId: true,
        agentId: true,
      },
    });

    if (!document?.chatId) return null;

    const chatInfo = await getChatById({ id: document.chatId });
    if (!chatInfo) return null;

    return {
      ...chatInfo,
      messageId: document.messageId,
      agentId: document.agentId,
    };
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get chat by document id"
    );
  }
}

export async function saveMessages({ messages }: { messages: any[] }) {
  try {
    // Prisma createMany is supported for MySQL
    return await getDB().chatMessage.createMany({
      data: messages.map(m => ({
        id: m.id,
        chatId: m.chatId,
        role: m.role,
        parts: m.parts,
        attachments: m.attachments || [],
        createdAt: m.createdAt,
        agentId: m.agentId,
      })),
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to save messages");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    const messages = await getDB().chatMessage.findMany({
      where: { chatId: id },
      orderBy: { createdAt: 'asc' },
    });
    
    return messages;
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
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
    await getDB().chatMessage.deleteMany({
      where: {
        chatId,
        createdAt: { gt: timestamp },
      },
    });
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }
}

export async function updateChat({
  chatId,
  data,
}: {
  chatId: string;
  data: any;
}) {
  try {
    return await getDB().chat.update({
      where: { id: chatId },
      data,
    });
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update chat"
    );
  }
}

export async function updateChatTitle({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) {
  try {
    return await getDB().chat.update({
      where: { id: chatId },
      data: { title },
    });
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update chat title"
    );
  }
}

export async function updateChatPinned({
  chatId,
  isPinned,
}: {
  chatId: string;
  isPinned: boolean;
}) {
  try {
    return await getDB().chat.update({
      where: { id: chatId },
      data: { isPinned },
    });
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update chat pinned status"
    );
  }
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  try {
    return await getDB().chat.update({
      where: { id: chatId },
      data: { visibility },
    });
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update chat visibility"
    );
  }
}

export async function updateChatLastContext({
  chatId,
  context,
}: {
  chatId: string;
  context: any; // AppUsage
}) {
  try {
    return await getDB().chat.update({
      where: { id: chatId },
      data: { lastContext: context }, // context should be Json compatible
    });
  } catch (error) {
    console.warn("Failed to update lastContext for chat", chatId, error);
    return;
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
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000
    );

    const count = await getDB().chatMessage.count({
      where: {
        chat: { userId: id },
        createdAt: { gte: twentyFourHoursAgo },
        role: 'user',
      },
    });

    return count;
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message count by user id"
    );
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
    await getDB().stream.create({
      data: {
        id: streamId,
        chatId,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create stream id"
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const rows = await getDB().stream.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get stream ids by chat id"
    );
  }
}

// Document related queries

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
  chatId,
  messageId,
  agentId,
  status,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
  chatId?: string;
  messageId?: string;
  agentId?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}) {
  try {
    return await getDB().document.create({
      data: {
        id,
        title,
        kind: kind as any,
        content,
        userId,
        chatId,
        messageId,
        agentId,
        status,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('saveDocument Error:', error);
    throw new ChatSDKError("bad_request:database", "Failed to save document");
  }
}

export async function updateDocumentStatus({
  id,
  status,
}: {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}) {
  try {
    // We update the latest version of the document with this ID
    const docs = await getDB().document.findMany({
      where: { id },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const latestDoc = docs[0];
    if (!latestDoc) return null;

    return await getDB().document.update({
      where: {
        id_createdAt: {
          id: latestDoc.id,
          createdAt: latestDoc.createdAt,
        },
      },
      data: { status },
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to update document status");
  }
}

export async function batchUpdateDocumentStatusByChatId({
  chatId,
  status,
}: {
  chatId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}) {
  try {
    return await getDB().document.updateMany({
      where: { chatId },
      data: { status },
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to batch update document status");
  }
}

export async function getDocumentsByChatId({ chatId }: { chatId: string }) {
  try {
    return await getDB().document.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get documents by chat id");
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const docs = await getDB().document.findMany({
      where: { id },
      include: {
        agentDocuments: {
          include: {
            agent: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return docs;
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get documents by id"
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const docs = await getDB().document.findMany({
      where: { id },
      include: {
        agentDocuments: {
          include: {
            agent: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    return docs[0] || null;
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get document by id"
    );
  }
}

export async function deleteDocumentsById({ id }: { id: string }) {
  try {
    await getDB().document.deleteMany({
      where: { id },
    });
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete documents by id"
    );
  }
}

// Vote related

export async function saveVote({
  chatId,
  messageId,
  isUpvoted,
}: {
  chatId: string;
  messageId: string;
  isUpvoted: boolean;
}) {
  try {
    return await getDB().vote.upsert({
      where: {
        chatId_messageId: {
          chatId,
          messageId,
        },
      },
      create: {
        chatId,
        messageId,
        isUpvoted,
      },
      update: {
        isUpvoted,
      },
    });
  } catch (error) {
    console.error('Failed to save vote:', error);
    throw new Error('Failed to save vote');
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await getDB().vote.findMany({
      where: { chatId: id },
    });
  } catch (error) {
    console.error('Failed to get votes by chat id:', error);
    throw new Error('Failed to get votes by chat id');
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    return await saveVote({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to vote message:', error);
    throw new Error('Failed to vote message');
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    return await getDB().document.deleteMany({
      where: {
        id,
        createdAt: {
          gt: timestamp,
        },
      },
    });
  } catch (error) {
    console.error('Failed to delete documents by id after timestamp:', error);
    throw new Error('Failed to delete documents by id after timestamp');
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await getDB().suggestion.findMany({
      where: { documentId },
    });
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get suggestions by document id"
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: any[]; 
}) {
  try {
    await getDB().suggestion.createMany({
      data: suggestions,
    });
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save suggestions"
    );
  }
}

export async function getProjectById(id: string) {
  try {
    return await getDB().project.findUnique({
      where: { id },
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get project by id");
  }
}

export async function updateProject({ id, updates }: { id: string, updates: any }) {
  try {
    return await getDB().project.update({
      where: { id },
      data: updates,
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to update project");
  }
}

export async function getProjects(where: any = {}, options: any = {}) {
  try {
    return await getDB().project.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: options.sortBy ? { [options.sortBy]: options.sortOrder || 'desc' } : { createdAt: 'desc' },
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get projects");
  }
}

export async function getProjectsCount(where: any = {}) {
  try {
    return await getDB().project.count({
      where,
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get projects count");
  }
}

export async function getPublicDocuments({
  kind,
  page = 1,
  limit = 20,
}: {
  kind?: ArtifactKind;
  page?: number;
  limit?: number;
}) {
  try {
    const skip = (page - 1) * limit;
    const where: any = { visibility: 'public' };
    if (kind) {
      where['kind'] = kind;
    }
    return await getDB().document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          }
        },
        agentDocuments: {
          include: {
            agent: true,
          }
        }
      }
    });
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get public documents"
    );
  }
}

export async function getDocumentsByUser({
  userId,
  kind,
}: {
  userId: string;
  kind?: ArtifactKind;
}) {
  try {
    const where: any = { userId };
    if (kind) {
      where['kind'] = kind;
    }
    return await getDB().document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get documents by user"
    );
  }
}

