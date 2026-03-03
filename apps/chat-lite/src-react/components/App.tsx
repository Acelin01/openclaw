import React, { useState, useEffect, useCallback } from 'react';
import { MultiAgentClient, AgentConfig, AgentStatus } from '../lib/multi-agent-client';
import AgentManager from './AgentManager';
import MessageList from './MessageList';
import InputArea from './InputArea';
import AddAgentDialog, { NewAgentData } from './AddAgentDialog';
import './App.css';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface AgentConfigWithStatus extends AgentConfig {
  connected?: boolean;
  agentStatus?: AgentStatus;
}

const App: React.FC = () => {
  const [multiAgentClient, setMultiAgentClient] = useState<MultiAgentClient | null>(null);
  const [agentList, setAgentList] = useState<AgentConfigWithStatus[]>([]);
  const [agentStatusList, setAgentStatusList] = useState<AgentStatus[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);

  // 初始化多智能体客户端
  useEffect(() => {
    const initMultiAgent = async () => {
      try {
        const client = new MultiAgentClient();
        const response = await fetch('/config/agents.config.json');
        const config = await response.json();

        // 异步加载智能体，单个失败不影响整体
        await client.loadAgents(config.agents);

        setMultiAgentClient(client);
        // 映射类型，将 status 改为 agentStatus
        const agentList = client.getAgentList().map(agent => ({
          ...agent,
          agentStatus: agent.status,
          status: agent.status // 保留原始 status 属性，避免类型冲突
        }));
        setAgentList(agentList as any);
        setAgentStatusList(client.getAgentStatusList());

        // 只有至少有一个智能体真正连接成功才算成功
        const connectedCount = client.getAgentStatusList().filter(s => s.connected).length;
        setIsConnected(connectedCount > 0);

        console.log('✅ 多智能体平台初始化完成', {
          total: config.agents.length,
          connected: connectedCount
        });
      } catch (error) {
        console.error('❌ 多智能体平台初始化失败:', error);
        setIsConnected(false);
      }
    };
    initMultiAgent();
    return () => { multiAgentClient?.disconnect(); };
  }, []);

  // 定时更新状态（包括连接状态）
  useEffect(() => {
    if (!multiAgentClient) return;
    
    // 立即更新一次
    const statusList = multiAgentClient.getAgentStatusList();
    const connectedCount = statusList.filter(s => s.connected).length;
    setIsConnected(connectedCount > 0);
    setAgentStatusList(statusList);
    
    // 然后定时更新
    const interval = setInterval(() => {
      const newStatusList = multiAgentClient.getAgentStatusList();
      const newConnectedCount = newStatusList.filter(s => s.connected).length;
      setIsConnected(newConnectedCount > 0);
      setAgentStatusList(newStatusList);
    }, 5000); // 缩短为 5 秒，更快响应离线状态
    
    return () => clearInterval(interval);
  }, [multiAgentClient]);

  // 发送消息
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !multiAgentClient) return;

    const message = inputValue;
    setInputValue('');

    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now()
    }]);

    try {
      if (selectedAgentId) {
        const response = await multiAgentClient.sendMessage(selectedAgentId, message);
        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: (response as any).reply || '收到消息',
          timestamp: Date.now()
        }]);
      } else {
        const results = await multiAgentClient.broadcastMessage(message);
        results.forEach(result => {
          if (result.success) {
            setMessages(prev => [...prev, {
              id: `msg-${Date.now()}-${result.agentId}`,
              role: 'assistant',
              content: `[${result.agentName}] ${(result.data as any).reply || '收到消息'}`,
              timestamp: Date.now()
            }]);
          } else {
            // 显示失败信息
            setMessages(prev => [...prev, {
              id: `msg-${Date.now()}-${result.agentId}-error`,
              role: 'system',
              content: `❌ [${result.agentName}] 发送失败：${result.error?.message || '未知错误'}`,
              timestamp: Date.now()
            }]);
          }
        });
      }
      setAgentStatusList(multiAgentClient.getAgentStatusList());
    } catch (error) {
      console.error('发送消息失败:', error);
      // 显示错误消息给用户
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-error`,
        role: 'system',
        content: `❌ 发送失败：${(error as Error).message || '未知错误'}`,
        timestamp: Date.now()
      }]);
    }
  }, [inputValue, selectedAgentId, multiAgentClient]);

  // 添加智能体
  const handleAddAgent = async (data: NewAgentData): Promise<boolean> => {
    if (!multiAgentClient) {
      console.error('❌ 客户端未初始化');
      return false;
    }

    try {
      const newAgent: AgentConfig = {
        id: `agent-${Date.now()}`,
        name: data.name,
        description: data.description,
        gateway: {
          url: data.gatewayUrl,
          token: data.gatewayToken,
          type: data.gatewayUrl.includes('127.0.0.1') ? 'local' : 'public'
        },
        model: data.model,
        skills: data.skills,
        status: 'active',
        priority: 99
      };

      console.log('🔌 正在添加智能体:', newAgent.name);
      await multiAgentClient.addAgent(newAgent);

      // 更新状态（映射类型）
      const agentList = multiAgentClient.getAgentList().map(agent => ({
        ...agent,
        agentStatus: agent.status
      }));
      setAgentList(agentList as any);
      setAgentStatusList(multiAgentClient.getAgentStatusList());

      console.log('✅ 智能体添加成功:', newAgent.name);
      return true;
    } catch (error) {
      console.error('❌ 智能体添加失败:', error);
      return false;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>ChatLite 多智能体平台</h1>
        <select 
          className="agent-selector"
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
        >
          <option value="">📢 所有智能体（广播）</option>
          {agentList.map(agent => {
            const status = agentStatusList.find(s => s.id === agent.id);
            return (
              <option key={agent.id} value={agent.id}>
                {agent.name} ({status?.connected ? '🟢' : '🔴'})
              </option>
            );
          })}
        </select>
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : ''}`}></span>
          <span>{isConnected ? '已连接' : '未连接'}</span>
        </div>
      </header>

      <div className="main">
        <div className="chat-panel">
          <MessageList messages={messages} />
          <InputArea
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            disabled={!isConnected}
            connected={isConnected}
          />
        </div>
      </div>

      <div className="agent-manager-panel">
        <AgentManager
          agents={agentList}
          statusList={agentStatusList}
          onAddAgent={() => setShowAddDialog(true)}
          onAgentChange={() => {
            if (multiAgentClient) {
              const agentList = multiAgentClient.getAgentList().map(agent => ({
                ...agent,
                agentStatus: agent.status
              }));
              setAgentList(agentList as any);
              setAgentStatusList(multiAgentClient.getAgentStatusList());
            }
          }}
        />
      </div>

      <AddAgentDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddAgent}
      />
    </div>
  );
};

export default App;
