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

export const isEmoji = (str: string | null | undefined) => {
  if (!str) return false;
  return /\p{Emoji}/u.test(str) && str.length <= 8;
};

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

export const fetcher = async (args: string | [string, string]) => {
  let url: string;
  let token: string | undefined;

  if (Array.isArray(args)) {
    [url, token] = args;
  } else {
    url = args;
  }

  // 增加对 localStorage token 的回退支持
  if (!token) {
    token = getAuthToken() || undefined;
  }

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { headers, credentials: 'include' });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      let code: string | undefined;
      let cause: string | undefined;
      
      try {
        const errorData = await response.json();
        code = errorData.code;
        cause = errorData.cause || errorData.message || response.statusText;
        if (errorData.error) {
          cause += ` (${errorData.error})`;
        }
      } catch (e) {
        cause = response.statusText;
      }
      
      const errorCode = (code || 'bad_request:api') as ErrorCode;
      const error = new ChatSDKError(errorCode, cause);
      // Use the cause as the message if it's a generic API error
      if (errorCode === 'bad_request:api' && cause) {
        error.message = cause;
      }
      throw error;
    }

    return response.json();
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      console.error('[CORS/Network Error] Potential CORS issue or server unreachable:', {
        url,
        origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
        error
      });
    } else {
      console.error('[API Error] Fetch failed:', error);
    }
    throw error;
  }
};

export async function fetchWithErrorHandlers(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  try {
    const response = await fetch(input, { ...init, credentials: 'include' });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      let code: string | undefined;
      let cause: string | undefined;
      
      try {
        const errorData = await response.json();
        code = errorData.code;
        cause = errorData.cause || errorData.message || response.statusText;
        if (errorData.error) {
          cause += ` (${errorData.error})`;
        }
      } catch (e) {
        cause = response.statusText;
      }
      
      const errorCode = (code || 'bad_request:api') as ErrorCode;
      const error = new ChatSDKError(errorCode, cause);
      // Use the cause as the message if it's a generic API error
      if (errorCode === 'bad_request:api' && cause) {
        error.message = cause;
      }
      throw error;
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

export function formatDate(date: Date | string | number) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
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
  return text.replace('<has_function_call>', '');
}

export function convertToUIMessages(messages: DBMessage[]): ChatMessage[] {
  return messages.map((message) => {
    let parts = (Array.isArray(message.parts) ? message.parts : []) as any[];

    // 如果 parts 为空但 content 存在，将 content 转换为文本 part
    if (parts.length === 0 && message.content) {
      parts = [{ type: 'text', text: message.content }];
    }

    // 防御性编程：确保工具 parts 有 output 或有效状态
    // 参照 OpenClaw 的 message-normalizer.ts，增加对不完整工具调用的容错
    parts = parts.map(part => {
      // 1. 处理工具调用
      if (part && typeof part.type === 'string' && part.type.startsWith('tool-')) {
         // 如果 output 缺失，注入错误状态以防止 UI 崩溃
         // 对所有工具调用都做此检查，不仅仅是关键工具
         if (!part.output && part.state !== 'call') {
             return {
                 ...part,
                 state: 'result', // 强制标记为 result 以显示错误
                 output: { error: "Operation interrupted or output missing" }
             };
         }
      }
      
      // 2. 规范化文本 part
      if (part && part.type === 'text' && typeof part.text !== 'string') {
          return { ...part, text: String(part.text || '') };
      }

      return part;
    }).filter(part => part !== null && part !== undefined);

    return {
      id: message.id,
      role: message.role as 'user' | 'assistant' | 'system' | 'tool' | 'data',
      content: getTextFromMessage({ role: message.role as any, parts } as any),
      parts: parts as UIMessagePart<CustomUIDataTypes, ChatTools>[],
      metadata: {
        createdAt: (() => {
          try {
            const date = message.createdAt ? new Date(message.createdAt) : new Date();
            return isNaN(date.getTime()) ? formatISO(new Date()) : formatISO(date);
          } catch (e) {
            return formatISO(new Date());
          }
        })(),
        authorId: message.userId || undefined,
        authorName: message.authorName || undefined,
        authorAvatar: message.authorAvatar || undefined,
      },
    };
  });
}

export function getTextFromMessage(message: ChatMessage | UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) {
    return '';
  }

  return message.parts
    .filter((part) => part && part.type === 'text')
    .map((part) => (part as { type: 'text'; text: string }).text || '')
    .join('');
}
