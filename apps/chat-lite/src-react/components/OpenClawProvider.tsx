/**
 * OpenClaw Provider
 * 为应用提供 OpenClaw 连接上下文
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useOpenClaw, type UseOpenClawReturn, type OpenClawConfig } from '../hooks/useOpenClaw';

const OpenClawContext = createContext<UseOpenClawReturn | null>(null);

interface OpenClawProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<OpenClawConfig>;
}

export function OpenClawProvider({ children, initialConfig }: OpenClawProviderProps) {
  const openclaw = useOpenClaw(initialConfig);

  const contextValue = useMemo(() => openclaw, [
    openclaw.connected,
    openclaw.connectionStatus,
    openclaw.agents,
    openclaw.sessions,
    openclaw.currentAgent,
    openclaw.currentSession,
    openclaw.messages,
    openclaw.loading,
    openclaw.error,
  ]);

  return (
    <OpenClawContext.Provider value={contextValue}>
      {children}
    </OpenClawContext.Provider>
  );
}

export function useOpenClawContext(): UseOpenClawReturn {
  const context = useContext(OpenClawContext);
  if (!context) {
    throw new Error('useOpenClawContext 必须在 OpenClawProvider 内使用');
  }
  return context;
}
