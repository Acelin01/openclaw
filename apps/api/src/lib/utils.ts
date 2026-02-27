import type {
  CoreAssistantMessage,
  CoreToolMessage,
  UIMessage,
  UIMessagePart,
} from 'ai';
import { type ClassValue, clsx } from 'clsx';
import { formatISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import type { ChatMessage as DBMessage, Document } from '@prisma/client';
import { ChatSDKError, type ErrorCode } from './errors.js';
import type { ChatMessage, ChatTools, CustomUIDataTypes } from './types.js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    let code: string | undefined;
    let cause: string | undefined;
    
    try {
      const errorData = await response.json();
      code = errorData.code;
      cause = errorData.cause || errorData.message || response.statusText;
    } catch (e) {
      cause = response.statusText;
    }
    
    throw new ChatSDKError((code || 'bad_request:api') as ErrorCode, cause);
  }

  return response.json();
};

export async function fetchWithErrorHandlers(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      let code: string | undefined;
      let cause: string | undefined;
      
      try {
        const errorData = await response.json();
        code = errorData.code;
        cause = errorData.cause || errorData.message || response.statusText;
      } catch (e) {
        cause = response.statusText;
      }
      
      throw new ChatSDKError((code || 'bad_request:api') as ErrorCode, cause);
    }

    return response;
  } catch (error: unknown) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new ChatSDKError('offline:chat');
    }

    throw error;
  }
}

export function getLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  return [];
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function getMostRecentUserMessage(messages: UIMessage[]) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(
  documents: Document[],
  index: number,
) {
  if (!documents) { return new Date(); }
  if (index >= documents.length) { return new Date(); } // Fix index check
  const doc = documents[index];
  if (!doc) { return new Date(); }

  return doc.createdAt;
}

export function getTrailingMessageId({
  messages,
}: {
  messages: ResponseMessage[];
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) { return null; }

  return trailingMessage.id;
}

export function sanitizeText(text: string) {
  return text.replace('<has_function_call>', '');
}

export function convertToUIMessages(messages: DBMessage[]): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role as 'user' | 'assistant' | 'system',
    parts: (Array.isArray(message.parts) ? message.parts : []) as UIMessagePart<CustomUIDataTypes, ChatTools>[],
    metadata: {
      createdAt: formatISO(message.createdAt),
    },
  }));
}

export function getTextFromMessage(message: ChatMessage | UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) {
    return '';
  }

  return message.parts
    .filter((part: any) => part && part.type === 'text')
    .map((part: any) => (part as { type: 'text'; text: string }).text || '')
    .join('');
}
