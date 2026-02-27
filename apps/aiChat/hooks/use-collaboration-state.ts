"use client";

import { useState, useCallback, useEffect } from 'react';

export type CollaborationStatus = 'idle' | 'thinking' | 'analyzing' | 'executing' | 'evolving';

export interface AgentActivity {
  id: string;
  agentId: string;
  agentRole: string;
  action: string;
  timestamp: string;
  status: 'pending' | 'success' | 'working';
}

export function useCollaborationState() {
  const [overallProgress, setOverallProgress] = useState(45);
  const [currentStatus, setCurrentStatus] = useState<CollaborationStatus>('thinking');
  const [activities, setActivities] = useState<AgentActivity[]>([]);

  // 模拟文档中的“批准”操作
  const approveRequirement = useCallback(() => {
    setOverallProgress(60);
    setCurrentStatus('analyzing');
    
    const newActivity: AgentActivity = {
      id: Date.now().toString(),
      agentId: 'pm',
      agentRole: 'PM',
      action: '需求已批准！正在启动任务分解流程...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'success'
    };
    
    setActivities(prev => [newActivity, ...prev]);
    
    // 触发全局事件，让 MultiAgentSidebar 等组件感知
    window.dispatchEvent(new CustomEvent('collaboration-activity-update', {
      detail: { activity: newActivity }
    }));
  }, []);

  // 模拟文档中的“开始执行”操作
  const startExecution = useCallback(() => {
    setOverallProgress(75);
    setCurrentStatus('executing');
    
    const newActivity: AgentActivity = {
      id: Date.now().toString(),
      agentId: 'sys',
      agentRole: 'SYS',
      action: '项目执行已启动！进入执行监控与自演化阶段。',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'working'
    };
    
    setActivities(prev => [newActivity, ...prev]);
    
    window.dispatchEvent(new CustomEvent('collaboration-activity-update', {
      detail: { activity: newActivity }
    }));
  }, []);

  return {
    overallProgress,
    currentStatus,
    activities,
    approveRequirement,
    startExecution,
    setOverallProgress,
    setCurrentStatus
  };
}
