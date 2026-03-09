/**
 * 聊天状态管理 (Zustand)
 * 管理会话、消息、加载状态等
 */

import { create } from 'zustand';
import { openclawClient, type Message, type Session } from '../lib/openclaw-client';

interface ChatState {
  // 当前会话 (OpenClaw sessionKey)
  currentSessionKey: string | null;
  sessions: Session[];
  
  // 消息列表（按会话分组）
  messages: Record<string, Message[]>;
  
  // UI 状态
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sidebarOpen: boolean;
  
  // 操作
  setCurrentSession: (sessionKey: string | null) => void;
  loadSessions: () => Promise<void>;
  createNewSession: (label?: string) => Promise<string>;
  deleteSession: (sessionKey: string) => Promise<void>;
  loadMessages: (sessionKey: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  addMessage: (sessionKey: string, message: Message) => void;
  updateLastMessage: (sessionKey: string, content: string) => void;
  clearError: () => void;
  toggleSidebar: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // 初始状态
  currentSessionKey: null,
  sessions: [],
  messages: {},
  isLoading: false,
  isStreaming: false,
  error: null,
  sidebarOpen: true,

  // 设置当前会话
  setCurrentSession: (sessionKey) => {
    set({ currentSessionKey: sessionKey });
    if (sessionKey) {
      get().loadMessages(sessionKey);
    }
  },

  // 加载会话列表
  loadSessions: async () => {
    set({ isLoading: true });
    try {
      const sessions = await openclawClient.getSessions();
      set({ sessions, isLoading: false });
      
      // 如果有会话但没有选中，选中最新的
      if (sessions.length > 0 && !get().currentSessionKey) {
        set({ currentSessionKey: sessions[0].sessionKey });
        get().loadMessages(sessions[0].sessionKey);
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加载会话失败',
        isLoading: false 
      });
    }
  },

  // 创建新会话
  createNewSession: async (label) => {
    set({ isLoading: true });
    try {
      const session = await openclawClient.createSession(label);
      set((state) => ({
        sessions: [session, ...state.sessions],
        currentSessionKey: session.sessionKey,
        messages: { ...state.messages, [session.sessionKey]: [] },
        isLoading: false,
      }));
      return session.sessionKey;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '创建会话失败',
        isLoading: false 
      });
      throw error;
    }
  },

  // 删除会话
  deleteSession: async (sessionKey) => {
    try {
      await openclawClient.deleteSession(sessionKey);
      set((state) => ({
        sessions: state.sessions.filter(s => s.sessionKey !== sessionKey),
        messages: Object.fromEntries(
          Object.entries(state.messages).filter(([key]) => key !== sessionKey)
        ),
        currentSessionKey: state.currentSessionKey === sessionKey 
          ? (state.sessions.find(s => s.sessionKey !== sessionKey)?.sessionKey || null)
          : state.currentSessionKey,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '删除会话失败' });
    }
  },

  // 加载消息历史
  loadMessages: async (sessionKey) => {
    set({ isLoading: true });
    try {
      const messages = await openclawClient.getSessionMessages(sessionKey);
      set((state) => ({
        messages: { ...state.messages, [sessionKey]: messages },
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加载消息失败',
        isLoading: false 
      });
    }
  },

  // 发送消息
  sendMessage: async (content) => {
    const sessionKey = get().currentSessionKey;
    if (!sessionKey) {
      // 如果没有会话，先创建一个
      const newSessionKey = await get().createNewSession('新会话');
      await get().sendMessageToSession(newSessionKey, content);
    } else {
      await get().sendMessageToSession(sessionKey, content);
    }
  },

  // 内部方法：发送消息到指定会话
  sendMessageToSession: async (sessionKey: string, content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      sessionId: sessionKey,
    };

    // 立即添加用户消息到 UI
    get().addMessage(sessionKey, userMessage);
    set({ isStreaming: true, error: null });

    try {
      // 调用 OpenClaw Gateway
      const response = await openclawClient.sendMessage({
        message: content,
        sessionId: sessionKey,
      });

      // 处理响应
      if (response.done) {
        // 完整响应
        const assistantMessage: Message = {
          id: response.messageId,
          role: 'assistant',
          content: response.content,
          timestamp: Date.now(),
          sessionId: sessionKey,
          metadata: {
            skillMatched: response.skillMatched,
            modelUsed: response.modelUsed,
          },
        };
        get().addMessage(sessionKey, assistantMessage);
      } else {
        // 流式响应 - 通过 WebSocket 接收
        openclawClient.connectWebSocket(sessionKey, (data) => {
          if (data.type === 'chunk') {
            get().updateLastMessage(sessionKey, data.content);
          }
          if (data.done) {
            set({ isStreaming: false });
            openclawClient.disconnectWebSocket();
          }
        });
      }

      set({ isStreaming: false });
      
      // 刷新会话列表（更新最后消息时间）
      get().loadSessions();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '发送消息失败',
        isStreaming: false 
      });
      openclawClient.disconnectWebSocket();
    }
  },

  // 添加消息
  addMessage: (sessionKey, message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [sessionKey]: [...(state.messages[sessionKey] || []), message],
      },
    }));
  },

  // 更新最后一条消息（用于流式响应）
  updateLastMessage: (sessionKey, content) => {
    set((state) => {
      const sessionMessages = state.messages[sessionKey] || [];
      const lastMessage = sessionMessages[sessionMessages.length - 1];
      
      if (lastMessage && lastMessage.role === 'assistant') {
        const updatedMessages = [...sessionMessages];
        updatedMessages[sessionMessages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + content,
        };
        return {
          messages: {
            ...state.messages,
            [sessionKey]: updatedMessages,
          },
        };
      }
      
      // 如果没有 assistant 消息，创建一个新的
      const newMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: Date.now(),
        sessionId,
      };
      return {
        messages: {
          ...state.messages,
          [sessionId]: [...sessionMessages, newMessage],
        },
      };
    });
  },

  // 清除错误
  clearError: () => set({ error: null }),

  // 切换侧边栏
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
