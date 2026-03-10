/**
 * OpenClaw 配置组件
 * 提供连接配置入口和状态显示
 */

import React, { useState, useEffect } from 'react';
import { useOpenClawContext } from './OpenClawProvider';
import { useChatStore } from '../store/chat-store';
import './OpenClawConfig.css';

export function OpenClawConfig() {
  const openclaw = useOpenClawContext();
  const { createNewSession } = useChatStore();
  
  const {
    connected,
    connectionStatus,
    config,
    updateConfig,
    testConnection,
    connect,
    disconnect,
    agents,
    loadAgents,
    currentAgent,
    selectAgent,
    loading,
    error,
  } = openclaw;

  const [showConfig, setShowConfig] = useState(false);
  const [formData, setFormData] = useState({
    gatewayUrl: config.gatewayUrl,
    httpUrl: config.httpUrl,
    token: config.token,
  });

  // 连接成功后自动加载 Agent
  useEffect(() => {
    if (connected && agents.length === 0) {
      loadAgents();
    }
  }, [connected]);

  // 选择 Agent 并创建会话
  const handleSelectAgent = async (agent: typeof agents[0]) => {
    selectAgent(agent);
    // 创建新会话
    const sessionKey = await createNewSession(`${agent.identity?.emoji || '🤖'} ${agent.identity?.name || agent.name}`);
    if (sessionKey) {
      setShowConfig(false);
    }
  };

  const handleSave = async () => {
    updateConfig(formData);
    const success = await testConnection();
    if (success) {
      await loadAgents();
    }
    setShowConfig(false);
  };

  const handleTest = async () => {
    updateConfig(formData);
    const success = await testConnection();
    alert(success ? '✅ 连接成功！' : '❌ 连接失败');
  };

  const handleRefreshAgents = async () => {
    await loadAgents();
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return '🟢';
      case 'connecting':
        return '🟡';
      case 'error':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return '已连接';
      case 'connecting':
        return '连接中...';
      case 'error':
        return '连接错误';
      default:
        return '未连接';
    }
  };

  return (
    <>
      {/* 配置入口按钮 */}
      <div className="openclaw-config-trigger">
        <button
          className={`config-btn ${connected ? 'connected' : ''}`}
          onClick={() => setShowConfig(!showConfig)}
          title="OpenClaw 配置"
        >
          <span className="status-icon">{getStatusIcon()}</span>
          <span className="btn-text">{getStatusText()}</span>
        </button>
      </div>

      {/* 配置面板 */}
      {showConfig && (
        <div className="openclaw-config-panel">
          <div className="config-header">
            <h3>⚙️ OpenClaw 连接配置</h3>
            <button className="close-btn" onClick={() => setShowConfig(false)}>✕</button>
          </div>

          <div className="config-content">
            {/* 连接状态 */}
            <div className="config-section">
              <h4>连接状态</h4>
              <div className={`status-badge ${connectionStatus}`}>
                {getStatusIcon()} {getStatusText()}
              </div>
              {error && <div className="error-message">⚠️ {error}</div>}
            </div>

            {/* 连接配置 */}
            <div className="config-section">
              <h4>Gateway 配置</h4>
              <div className="form-group">
                <label>WebSocket 地址</label>
                <input
                  type="text"
                  value={formData.gatewayUrl}
                  onChange={(e) => setFormData({ ...formData, gatewayUrl: e.target.value })}
                  placeholder="ws://localhost:18789"
                />
              </div>
              <div className="form-group">
                <label>HTTP 地址</label>
                <input
                  type="text"
                  value={formData.httpUrl}
                  onChange={(e) => setFormData({ ...formData, httpUrl: e.target.value })}
                  placeholder="http://localhost:18789"
                />
              </div>
              <div className="form-group">
                <label>Token</label>
                <input
                  type="text"
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  placeholder="test-token"
                />
              </div>
              <div className="form-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  💾 保存配置
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleTest}
                  disabled={loading}
                >
                  🧪 测试连接
                </button>
                {connected ? (
                  <button
                    className="btn btn-danger"
                    onClick={disconnect}
                    disabled={loading}
                  >
                    🔌 断开连接
                  </button>
                ) : (
                  <button
                    className="btn btn-success"
                    onClick={connect}
                    disabled={loading}
                  >
                    🔌 连接
                  </button>
                )}
              </div>
            </div>

            {/* Agent 选择 */}
            <div className="config-section">
              <div className="section-header">
                <h4>🤖 Agent 选择</h4>
                <button
                  className="btn btn-sm"
                  onClick={handleRefreshAgents}
                  disabled={loading || !connected}
                >
                  🔄 刷新
                </button>
              </div>
              {agents.length === 0 ? (
                <div className="empty-state">
                  {connected ? (
                    <p>暂无 Agent，点击刷新按钮加载</p>
                  ) : (
                    <p>请先连接 Gateway</p>
                  )}
                </div>
              ) : (
                <div className="agent-list">
                  {agents.map((agent) => {
                    const isSelected = currentAgent?.some(a => a.id === agent.id);
                    return (
                      <button
                        key={agent.id}
                        className={`agent-item ${isSelected ? 'active' : ''}`}
                        onClick={() => handleSelectAgent(agent)}
                      >
                        <span className="agent-emoji">{agent.identity?.emoji || '🤖'}</span>
                        <span className="agent-name">
                          {agent.identity?.name || agent.name}
                        </span>
                        {isSelected && (
                          <span className="active-indicator">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 使用说明 */}
            <div className="config-section">
              <h4>📖 使用说明</h4>
              <ol className="help-list">
                <li>确保 OpenClaw Gateway 正在运行</li>
                <li>输入正确的 WebSocket 和 HTTP 地址</li>
                <li>输入正确的 Token（默认：test-token）</li>
                <li>点击"测试连接"验证配置</li>
                <li>连接成功后选择一个 Agent</li>
                <li>开始聊天！</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
