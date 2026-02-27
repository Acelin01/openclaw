import { sql } from 'drizzle-orm';
import {
  boolean,
  json,
  mysqlEnum,
  mysqlTable,
  index,
  primaryKey,
  text,
  datetime,
  varchar,
  int,
  double,
} from 'drizzle-orm/mysql-core';

export const user = mysqlTable('User', {
  id: varchar('id', { length: 191 }).primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 32 }).default('CUSTOMER').notNull(),
  password: text('password'),
  avatarUrl: text('avatarUrl'),
  phone: varchar('phone', { length: 255 }),
  isVerified: boolean('isVerified').default(false),
  updatedAt: datetime('updatedAt', { mode: 'date', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
  isSuspended: boolean('isSuspended').default(false),
  departmentId: varchar('departmentId', { length: 191 }),
  jobTitle: varchar('jobTitle', { length: 255 }),
  teamId: varchar('teamId', { length: 191 }),
  brief: varchar('brief', { length: 255 }),
  intro: text('intro'),
  skills: text('skills'),
  isFreelancer: boolean('isFreelancer').default(false),
  createdAt: datetime('createdAt', { mode: 'date', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
});

export const chat = mysqlTable('Chat', {
  id: varchar('id', { length: 191 }),
  createdAt: datetime('createdAt', { mode: 'date', fsp: 3 }).notNull(),
  title: text('title').notNull(),
  userId: varchar('userId', { length: 191 }).notNull(),
  visibility: mysqlEnum('visibility', ['public', 'private']).default('private'),
  isPinned: boolean('isPinned').default(false),
  projectId: varchar('projectId', { length: 191 }),
  agentId: varchar('agentId', { length: 191 }),
  lastContext: json('lastContext'),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.id] }),
    userIdIndex: index('userId_idx').on(table.userId),
    createdAtIndex: index('createdAt_idx').on(table.createdAt),
    userCreatedAtCombinedIndex: index('user_createdAt_idx').on(table.userId, table.createdAt),
  };
});

export const message = mysqlTable('Message_v2', {
  id: varchar('id', { length: 191 }),
  chatId: varchar('chatId', { length: 191 }).notNull(),
  role: varchar('role', { length: 32 }).notNull(),
  content: text('content'),
  userId: varchar('userId', { length: 191 }),
  authorName: varchar('authorName', { length: 255 }),
  authorAvatar: text('authorAvatar'),
  agentId: varchar('agentId', { length: 191 }),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: datetime('createdAt', { mode: 'date', fsp: 3 }).notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.id] }),
    chatIdIndex: index('chatId_idx').on(table.chatId),
    createdAtIndex: index('createdAt_idx').on(table.createdAt),
    chatCreatedAtCombinedIndex: index('chat_createdAt_idx').on(table.chatId, table.createdAt),
  };
});

export const document = mysqlTable('Document', {
  id: varchar('id', { length: 191 }).notNull(),
  createdAt: datetime('createdAt', { mode: 'date', fsp: 3 }).notNull(),
  title: text('title').notNull(),
  content: text('content'),
  kind: mysqlEnum('kind', [
    'text',
    'code',
    'image',
    'sheet',
    'quote',
    'project',
    'position',
    'requirement',
    'project-requirement',
    'resume',
    'service',
    'matching',
    'approval',
    'contract',
    'message',
    'report',
    'task',
    'web',
    'agent',
    'agent-dashboard',
    'entity-dashboard',
    'admin',
    'document',
    'iteration',
    'freelancer_registration',
    'transaction',
    'weather',
    'app',
    'milestone',
    'defect',
    'risk',
  ]).default('quote'),
  userId: varchar('userId', { length: 191 }).notNull(),
  projectId: varchar('projectId', { length: 191 }),
  serviceId: varchar('serviceId', { length: 191 }),
  chatId: varchar('chatId', { length: 191 }),
  messageId: varchar('messageId', { length: 191 }),
  agentId: varchar('agentId', { length: 191 }),
  status: mysqlEnum('status', ['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
  visibility: mysqlEnum('visibility', ['public', 'private']).default('private'),
}, (table) => {
  return {
    userIdIndex: index('userId_idx').on(table.userId),
    kindIndex: index('kind_idx').on(table.kind),
    chatIdIndex: index('chatId_idx').on(table.chatId),
    userKindCreatedAtCombinedIndex: index('user_kind_createdAt_idx').on(table.userId, table.kind, table.createdAt),
  };
});

export const suggestion = mysqlTable('Suggestion', {
  id: varchar('id', { length: 191 }),
  documentId: varchar('documentId', { length: 191 }).notNull(),
  documentCreatedAt: datetime('documentCreatedAt', { mode: 'date', fsp: 3 }).notNull(),
  originalText: text('originalText').notNull(),
  suggestedText: text('suggestedText').notNull(),
  description: text('description'),
  isResolved: boolean('isResolved').default(false),
  userId: varchar('userId', { length: 191 }).notNull(),
  createdAt: datetime('createdAt', { mode: 'date', fsp: 3 }).notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.id] }),
  };
});

export const vote = mysqlTable('Vote_v2', {
  chatId: varchar('chatId', { length: 191 }).notNull(),
  messageId: varchar('messageId', { length: 191 }).notNull(),
  isUpvoted: boolean('isUpvoted').notNull(),
});

export const stream = mysqlTable('Stream', {
  id: varchar('id', { length: 191 }).notNull(),
  chatId: varchar('chatId', { length: 191 }).notNull(),
  createdAt: datetime('createdAt', { mode: 'date', fsp: 3 }).notNull(),
});

export const project = mysqlTable('projects', {
  id: varchar('id', { length: 191 }).primaryKey(),
  userId: varchar('userId', { length: 191 }),
  description: text('description'),
  tags: json('tags'),
  status: varchar('status', { length: 191 }),
  location: varchar('location', { length: 191 }),
  budgetMin: double('budgetMin'),
  budgetMax: double('budgetMax'),
  createdAt: datetime('createdAt', { mode: 'date', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
  updatedAt: datetime('updatedAt', { mode: 'date', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
  dueDate: datetime('dueDate', { mode: 'date', fsp: 3 }),
  memberCount: int('memberCount'),
  name: varchar('name', { length: 191 }).notNull(),
  progress: int('progress'),
  documents: json('documents'),
  endDate: datetime('endDate', { mode: 'date', fsp: 3 }),
  milestones: json('milestones'),
  startDate: datetime('startDate', { mode: 'date', fsp: 3 }),
  isAdminEnabled: boolean('isAdminEnabled').default(false),
  avatarUrl: text('avatarUrl'),
  teamId: varchar('teamId', { length: 191 }),
  adminConfigs: json('adminConfigs'),
  adminToken: text('adminToken'),
  aiAppId: varchar('aiAppId', { length: 191 }),
});

export const agent = mysqlTable('agents_v2', {
  id: varchar('id', { length: 191 }).primaryKey(),
  name: varchar('name', { length: 20 }).notNull(),
  prompt: text('prompt').notNull(),
  mermaid: text('mermaid'),
  isCallableByOthers: boolean('isCallableByOthers').default(false),
  identifier: varchar('identifier', { length: 50 }),
  whenToCall: text('whenToCall'),
  selectedTools: json('selectedTools'),
  userId: varchar('userId', { length: 191 }),
  createdAt: datetime('createdAt', { mode: 'date', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
  updatedAt: datetime('updatedAt', { mode: 'date', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
  avatar: text('avatar'),
  departmentId: varchar('departmentId', { length: 191 }),
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Chat = typeof chat.$inferSelect;
export type Message = typeof message.$inferSelect;
export type Document = typeof document.$inferSelect;
export type Suggestion = typeof suggestion.$inferSelect;
export type Vote = typeof vote.$inferSelect;
export type Project = typeof project.$inferSelect;
export type Agent = typeof agent.$inferSelect;

export type DBMessage = Message;
