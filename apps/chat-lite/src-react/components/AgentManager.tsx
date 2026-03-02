import React from 'react';
import { AgentConfig, AgentStatus } from '../lib/multi-agent-client';
import './AgentManager.css';

interface AgentManagerProps {
  agents: AgentConfig[];
  statusList: AgentStatus[];
  onAgentChange: () => void;
}

const AgentManager: React.FC<AgentManagerProps> = ({ 
  agents, 
  statusList, 
  onAgentChange 
}) => {
  const getStatus = (agentId: string) => {
    return statusList.find(s => s.id === agentId);
  };

  const handleToggle = (agentId: string) => {
    // TODO: 实现启用/禁用逻辑
    console.log('切换智能体状态:', agentId);
    onAgentChange();
  };

  const handleDelete = (agentId: string) => {
    if (confirm('确定要删除这个智能体吗？')) {
      // TODO: 实现删除逻辑
      console.log('删除智能体:', agentId);
      onAgentChange();
    }
  };

  return (
    <div className="agent-manager">
      <div className="agent-manager-header">
        <h2>🤖 智能体管理</h2>
        <button className="btn btn-primary btn-sm">+ 添加智能体</button>
      </div>

      <div className="agent-list">
        {agents.length > 0 ? (
          agents.map(agent => {
            const status = getStatus(agent.id);
            return (
              <div key={agent.id} className="agent-card">
                <div className="agent-info">
                  <div className="agent-name">{agent.name}</div>
                  <div className="agent-description">
                    {agent.description || '暂无描述'}
                  </div>
                  <div className="agent-meta">
                    <span>🌐 {agent.gateway.url}</span>
                    <span>🧠 {agent.model}</span>
                    <span>🛠️ {agent.skills.length} 个技能</span>
                    {status && (
                      <span>💬 {status.messageCount} 条消息</span>
                    )}
                  </div>
                </div>

                <div className="agent-status">
                  <div className="status-indicator">
                    <span className={`status-dot ${status?.connected ? 'online' : 'offline'}`}></span>
                    {status?.connected ? '在线' : '离线'}
                  </div>

                  <div className="agent-actions">
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleToggle(agent.id)}
                    >
                      {status?.connected ? '禁用' : '启用'}
                    </button>
                    <button className="btn btn-secondary btn-sm">
                      编辑
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(agent.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <h3>暂无智能体</h3>
            <p>点击右上角添加第一个智能体</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentManager;
