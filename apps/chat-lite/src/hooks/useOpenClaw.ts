/**
 * OpenClaw React Hook
 * 提供与 OpenClaw Gateway 交互的 React 接口
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  openclawConnector,
  type OpenClawConfig,
  type AgentInfo,
  type SessionInfo,
  type MessageInfo,
  type ConnectionStatus,
} from '../lib/openclaw-connector';

export interface UseOpenClawReturn {
  // 连接状态
  connected: boolean;
  connectionStatus: ConnectionStatus;
  config: OpenClawConfig;

  // 数据
  agents: AgentInfo[];
  sessions: SessionInfo[];
  currentAgent: AgentInfo | null;
  currentSession: SessionInfo | null;
  messages: MessageInfo[];

  // 加载状态
  loading: boolean;
  error: string | null;

  // 配置操作
  updateConfig: (config: Partial<OpenClawConfig>) => void;
  testConnection: () => Promise<boolean>;

  // Agent 操作
  loadAgents: () => Promise<void>;
  selectAgent: (agent: AgentInfo) => void;

  // Session 操作
  loadSessions: () => Promise<void>;
  createSession: (label?: string) => Promise<SessionInfo | null>;
  selectSession: (session: SessionInfo) => void;

  // Message 操作
  sendMessage: (content: string) => Promise<void>;
  loadMessages: () => Promise<void>;

  // 连接操作
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useOpenClaw(initialConfig?: Partial<OpenClawConfig>): UseOpenClawReturn {
  // 状态
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [messages, setMessages] = useState<MessageInfo[]>([]);
  const [currentAgent, setCurrentAgent] = useState<AgentInfo | null>(null);
  const [currentSession, setCurrentSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化配置
  useEffect(() => {
    if (initialConfig) {
      openclawConnector.updateConfig(initialConfig);
    }
  }, [initialConfig]);

  // 监听连接状态
  useEffect(() => {
    const unsubscribe = openclawConnector.onStatusChange((status) => {
      setConnectionStatus(status);
    });
    return unsubscribe;
  }, []);

  // 监听消息
  useEffect(() => {
    const unsubscribe = openclawConnector.onMessage((data) => {
      console.log('[useOpenClaw] 收到消息:', data);
      // 可以在这里处理实时消息
    });
    return unsubscribe;
  }, []);

  // 更新配置
  const updateConfig = useCallback((config: Partial<OpenClawConfig>) => {
    openclawConnector.updateConfig(config);
  }, []);

  // 测试连接
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      await openclawConnector.connect();
      return true;
    } catch {
      return false;
    }
  }, []);

  // 连接
  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await openclawConnector.connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 断开连接
  const disconnect = useCallback(() => {
    openclawConnector.disconnect();
  }, []);

  // 获取 Agent 列表
  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const agentList = await openclawConnector.getAgents();
      setAgents(agentList);
      if (agentList.length > 0 && !currentAgent) {
        setCurrentAgent(agentList[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取 Agent 失败');
    } finally {
      setLoading(false);
    }
  }, [currentAgent]);

  // 选择 Agent
  const selectAgent = useCallback((agent: AgentInfo) => {
    setCurrentAgent(agent);
    setSessions([]);
    setMessages([]);
    setCurrentSession(null);
  }, []);

  // 获取会话列表
  const loadSessions = useCallback(async () => {
    if (!currentAgent) {
      setError('请先选择 Agent');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const sessionList = await openclawConnector.getSessions(currentAgent.id);
      setSessions(sessionList);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取会话失败');
    } finally {
      setLoading(false);
    }
  }, [currentAgent]);

  // 创建会话
  const createSession = useCallback(async (label?: string): Promise<SessionInfo | null> => {
    if (!currentAgent) {
      setError('请先选择 Agent');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const session = await openclawConnector.createSession(currentAgent.id, label);
      setSessions(prev => [session, ...prev]);
      setCurrentSession(session);
      setMessages([]);
      return session;
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建会话失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentAgent]);

  // 选择会话
  const selectSession = useCallback(async (session: SessionInfo) => {
    setCurrentSession(session);
    setLoading(true);
    setError(null);
    try {
      const msgList = await openclawConnector.getMessages(session.sessionKey);
      setMessages(msgList);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取消息失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载消息
  const loadMessages = useCallback(async () => {
    if (!currentSession) {
      setError('请先选择会话');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const msgList = await openclawConnector.getMessages(currentSession.sessionKey);
      setMessages(msgList);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取消息失败');
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  // 发送消息
  const sendMessage = useCallback(async (content: string) => {
    if (!currentSession) {
      setError('请先选择会话');
      return;
    }

    setError(null);
    try {
      // 添加用户消息到本地
      const userMessage: MessageInfo = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, userMessage]);

      // 通过工具调用发送
      const result = await openclawConnector.sendMessageViaTool(
        currentSession.sessionKey,
        content
      );

      console.log('[useOpenClaw] 发送响应:', result);

      // 如果有 artifact，触发事件
      if (result?.result?.details?.artifact) {
        window.dispatchEvent(new CustomEvent('artifact-update', {
          detail: {
            skillName: result.result.details.skillName,
            artifactType: result.result.details.artifact.kind,
            data: result.result.details.artifact.content,
          }
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送消息失败');
      throw err;
    }
  }, [currentSession]);

  return {
    // 连接状态
    connected: connectionStatus === 'connected',
    connectionStatus,
    config: openclawConnector.getConfig(),

    // 数据
    agents,
    sessions,
    currentAgent,
    currentSession,
    messages,

    // 加载状态
    loading,
    error,

    // 配置操作
    updateConfig,
    testConnection,

    // Agent 操作
    loadAgents,
    selectAgent,

    // Session 操作
    loadSessions,
    createSession,
    selectSession,

    // Message 操作
    sendMessage,
    loadMessages,

    // 连接操作
    connect,
    disconnect,
  };
}
