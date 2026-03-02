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

const App: React.FC = () => {
  const [multiAgentClient, setMultiAgentClient] = useState<MultiAgentClient | null>(null);
  const [agentList, setAgentList] = useState<AgentConfig[]>([]);
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
        await client.loadAgents(config.agents);
        
        setMultiAgentClient(client);
        setAgentList(client.getAgentList());
        setAgentStatusList(client.getAgentStatusList());
        setIsConnected(true);
        console.log('✅ 多智能体平台初始化完成');
      } catch (error) {
        console.error('❌ 多智能体平台初始化失败:', error);
        setIsConnected(false);
      }
    };
    initMultiAgent();
    return () => { multiAgentClient?.disconnect(); };
  }, []);

  // 定时更新状态
  useEffect(() => {
    if (!multiAgentClient) return;
    const interval = setInterval(() => {
      setAgentStatusList(multiAgentClient.getAgentStatusList());
    }, 30000);
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
          }
        });
      }
      setAgentStatusList(multiAgentClient.getAgentStatusList());
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  }, [inputValue, selectedAgentId, multiAgentClient]);

  // 添加智能体
  const handleAddAgent = (data: NewAgentData) => {
    if (!multiAgentClient) return;

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

    multiAgentClient.addAgent(newAgent);
    setAgentList(multiAgentClient.getAgentList());
    setAgentStatusList(multiAgentClient.getAgentStatusList());
    console.log('✅ 智能体添加成功:', newAgent.name);
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
              setAgentList(multiAgentClient.getAgentList());
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
