import type {
  CoreAssistantMessage,
  CoreToolMessage,
  UIMessage,
  UIMessagePart,
} from 'ai';
import { type ClassValue, clsx } from 'clsx';
import { formatISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import type { DBMessage, Document } from '@/lib/db/schema';
import { ChatSDKError, type ErrorCode } from './errors';
import type { ChatMessage, ChatTools, CustomUIDataTypes } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // 1. Check direct token
    const t = localStorage.getItem('token');
    if (t) return t;
    
    // 2. Check auth-storage (common in Zustand/Persist)
    const persisted = localStorage.getItem('auth-storage');
    if (persisted) {
      const parsed = JSON.parse(persisted);
      const token = parsed?.state?.token || parsed?.token;
      if (token) return token;
    }
  } catch (e) {
    console.error('Error getting auth token from localStorage:', e);
  }
  
  return null;
}

export const fetcher = async (url: string) => {
  try {
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
  } catch (error) {
     if (error instanceof ChatSDKError) {
         throw error;
     }
     // Handle network errors or other fetch failures
     console.error('Fetcher error:', error);
     throw new ChatSDKError('bad_request:api', String(error));
  }
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
  if (index > documents.length) { return new Date(); }

  return documents[index].createdAt;
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
  if (typeof text !== 'string') return '';
  return text.replace('<has_function_call>', '');
}

export function convertToUIMessages(messages: DBMessage[]): ChatMessage[] {
  return messages.map((message) => {
    let parts = message.parts as UIMessagePart<CustomUIDataTypes, ChatTools>[];

    // Safety check for parts
    if (!parts || !Array.isArray(parts)) {
      console.warn(`Message ${message.id} has invalid parts:`, message.parts);
      // Fallback for legacy or corrupted data
      if (typeof message.parts === 'string') {
        parts = [{ type: 'text', text: message.parts }];
      } else if (typeof message.parts === 'object' && message.parts !== null) {
         // Try to recover if it's a single part object instead of array
         if ('type' in message.parts) {
            parts = [message.parts as any];
         } else {
            parts = [{ type: 'text', text: JSON.stringify(message.parts) }];
         }
      } else {
        parts = [{ type: 'text', text: '' }];
      }
    }

    // Sanitize parts to ensure they have required fields
    parts = parts
      .map(part => {
        if (part.type === 'text' && typeof part.text !== 'string') {
          return { ...part, text: String(part.text || '') };
        }
        return part;
      })
      .filter((part: any) => {
        if (!part || typeof part.type !== 'string') return false;
        if (part.type.startsWith('tool-') && !part.output) {
          return false;
        }
        return true;
      });

    return {
      id: message.id,
      role: message.role as 'user' | 'assistant' | 'system',
      parts,
      metadata: {
        createdAt: formatISO(message.createdAt),
      },
    };
  });
}

export function getTextFromMessage(message: ChatMessage | UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => (part as { type: 'text'; text: string}).text)
    .join('');
}
