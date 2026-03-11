/**
 * 聊天状态管理
 * 使用新的 OpenClaw Connector（WebSocket + HTTP 降级）
 */

import { create } from 'zustand';
import { openclawConnector } from '../lib/openclaw-connector';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  artifact?: {
    kind: string;
    content: any;
  };
  metadata?: {
    skillMatched?: string;
  };
}

export interface Session {
  sessionKey: string;
  label?: string;
  kind?: string;
  active?: boolean;
  lastMessageAt?: number;
  messageCount?: number;
}

interface ChatState {
  currentSessionKey: string | null;
  sessions: Session[];
  messages: Record<string, Message[]>;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sidebarOpen: boolean;

  setCurrentSession: (sessionKey: string | null) => void;
  loadSessions: () => Promise<void>;
  createNewSession: (label?: string) => string;
  sendMessage: (content: string) => Promise<void>;
  addMessage: (sessionKey: string, message: Message) => void;
  updateLastMessage: (sessionKey: string, content: string) => void;
  clearError: () => void;
  toggleSidebar: () => void;
  loadMessages: (sessionKey: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentSessionKey: null,
  sessions: [],
  messages: {},
  isLoading: false,
  isStreaming: false,
  error: null,
  sidebarOpen: true,

  setCurrentSession: (sessionKey) => {
    set({ currentSessionKey: sessionKey });
    if (sessionKey) {
      get().loadMessages(sessionKey);
    }
  },

  loadSessions: async () => {
    set({ isLoading: true });
    try {
      const stored = localStorage.getItem('chatlite_sessions');
      let sessions: Session[] = stored ? JSON.parse(stored) : [];
      
      if (sessions.length === 0) {
        sessions = [{
          sessionKey: `session-${Date.now()}`,
          label: '新会话',
          kind: 'chat',
          active: true,
          lastMessageAt: Date.now(),
          messageCount: 0
        }];
      }

      set({ sessions, isLoading: false });

      if (sessions.length > 0 && !get().currentSessionKey) {
        get().setCurrentSession(sessions[0].sessionKey);
      }
    } catch (error) {
      console.error('加载会话失败:', error);
      set({ error: '加载会话失败', isLoading: false });
    }
  },

  createNewSession: (label) => {
    const sessionKey = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newSession: Session = {
      sessionKey,
      label: label || '新会话',
      kind: 'chat',
      active: true,
      lastMessageAt: Date.now(),
      messageCount: 0
    };

    set(state => ({
      sessions: [newSession, ...state.sessions],
      currentSessionKey: sessionKey,
      messages: {
        ...state.messages,
        [sessionKey]: []
      }
    }));

    const sessions = get().sessions;
    localStorage.setItem('chatlite_sessions', JSON.stringify(sessions));

    return sessionKey;
  },

  sendMessage: async (content: string) => {
    const sessionKey = get().currentSessionKey;
    if (!sessionKey) {
      set({ error: '请先选择或创建会话' });
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now()
    };
    get().addMessage(sessionKey, userMessage);

    set({ isLoading: true, isStreaming: true, error: null });

    try {
      const response = await openclawConnector.sendMessage(sessionKey, content);

      // 确保 content 是字符串
      let contentText = response.content || '';
      if (typeof contentText !== 'string') {
        contentText = JSON.stringify(contentText);
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: contentText,
        timestamp: Date.now(),
        metadata: {
          skillMatched: response.skillMatched,
        },
      };
      get().addMessage(sessionKey, assistantMessage);

      if (response.artifact) {
        window.dispatchEvent(new CustomEvent('artifact-update', {
          detail: {
            skillName: response.skillMatched,
            artifactType: response.artifact.kind,
            data: response.artifact.content,
          }
        }));
      }

      set({ isLoading: false, isStreaming: false });
      get().loadSessions();
    } catch (error) {
      console.error('发送消息失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '发送消息失败',
        isLoading: false,
        isStreaming: false
      });
    }
  },

  loadMessages: async (sessionKey: string) => {
    try {
      const stored = localStorage.getItem(`chatlite_messages_${sessionKey}`);
      const messages: Message[] = stored ? JSON.parse(stored) : [];
      
      set(state => ({
        messages: {
          ...state.messages,
          [sessionKey]: messages
        }
      }));
    } catch (error) {
      console.error('加载消息失败:', error);
    }
  },

  addMessage: (sessionKey, message) => {
    set(state => ({
      messages: {
        ...state.messages,
        [sessionKey]: [
          ...(state.messages[sessionKey] || []),
          message
        ]
      },
      sessions: state.sessions.map(session =>
        session.sessionKey === sessionKey
          ? { ...session, lastMessageAt: Date.now(), messageCount: (session.messageCount || 0) + 1 }
          : session
      )
    }));

    const messages = get().messages[sessionKey] || [];
    localStorage.setItem(`chatlite_messages_${sessionKey}`, JSON.stringify(messages));
  },

  updateLastMessage: (sessionKey, content) => {
    set(state => {
      const messages = state.messages[sessionKey] || [];
      if (messages.length === 0) return state;

      const lastMessage = messages[messages.length - 1];
      return {
        messages: {
          ...state.messages,
          [sessionKey]: [
            ...messages.slice(0, -1),
            { ...lastMessage, content }
          ]
        }
      };
    });
  },

  clearError: () => {
    set({ error: null });
  },

  toggleSidebar: () => {
    set(state => ({ sidebarOpen: !state.sidebarOpen }));
  }
}));
