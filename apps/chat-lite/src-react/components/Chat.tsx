/**
 * 聊天主组件
 * 包含侧边栏（会话列表）和聊天主区域
 */

import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chat-store';
import { OpenClawConfig } from './OpenClawConfig';
import { Markdown } from './Markdown';
import { SkillPanel } from './SkillPanel';
import { ArtifactViewer } from './ArtifactViewer';
import { type SkillPattern } from '../lib/skill-matcher';
import './Chat.css';

export const Chat: React.FC = () => {
  const {
    currentSessionKey,
    sessions,
    messages,
    isLoading,
    isStreaming,
    error,
    sidebarOpen,
    setCurrentSession,
    loadSessions,
    createNewSession,
    sendMessage,
    clearError,
    toggleSidebar,
  } = useChatStore();

  const [inputValue, setInputValue] = useState('');
  const [showSkillPanel, setShowSkillPanel] = useState(false);
  const [showArtifactPanel, setShowArtifactPanel] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillPattern | undefined>();
  const [currentArtifactData, setCurrentArtifactData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 加载会话列表
  useEffect(() => {
    loadSessions();
  }, []);

  // 监听 artifact 更新事件
  useEffect(() => {
    const handleArtifactUpdate = (event: CustomEvent) => {
      const { skillName, artifactType, data } = event.detail;
      // 确保 data 是对象
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      setCurrentArtifactData(parsedData);
      setSelectedSkill(skillName ? { name: skillName } as SkillPattern : undefined);
      setShowArtifactPanel(true);
    };

    window.addEventListener('artifact-update', handleArtifactUpdate as EventListener);
    return () => {
      window.removeEventListener('artifact-update', handleArtifactUpdate as EventListener);
    };
  }, []);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentSessionKey]);

  // 自动调整文本框高度
  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  // 发送消息
  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || isLoading) return;

    // 构建发送内容（包含技能信息）
    const messageContent = selectedSkill
      ? `[@${selectedSkill.name}] ${content}`
      : content;

    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      await sendMessage(messageContent);
      
      // 如果选择了技能，发送后显示 Artifact
      if (selectedSkill) {
        setTimeout(() => {
          setShowArtifactPanel(true);
          setCurrentArtifactData({
            skill: selectedSkill,
            query: content,
            timestamp: Date.now(),
          });
          setSelectedSkill(undefined);
        }, 500);
      }
    } catch (err) {
      console.error('发送失败:', err);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 技能面板相关方法
  const handleSkillSelect = (skill: SkillPattern) => {
    setSelectedSkill(skill);
    setShowSkillPanel(false);
  };

  const handleSendSkill = (skill: string, command: string, params: Record<string, string>) => {
    sendMessage(command);
    setCurrentArtifactData(params);
    setSelectedSkill(undefined);
  };

  const handleCancelSkill = () => {
    setSelectedSkill(undefined);
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 获取当前会话消息
  const currentMessages = currentSessionKey ? (messages[currentSessionKey] || []) : [];

  // 辅助函数：从消息内容中提取文本
  const getContentText = (content: any): string => {
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null && 'text' in content) return String(content.text);
    return '';
  };

  return (
    <div className="chat-container">
      {/* OpenClaw 配置入口 */}
      <OpenClawConfig />

      {/* 侧边栏 */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-mark">💬</div>
          <div className="logo-text">
            ChatLite
            <span>OpenClaw</span>
          </div>
        </div>

        <div className="sidebar-search">
          <input
            type="text"
            placeholder="搜索会话..."
            className="search-input"
          />
        </div>

        <button className="new-chat-btn" onClick={() => createNewSession()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          新会话
        </button>

        <div className="session-list">
          {sessions.map((session) => (
            <div
              key={session.sessionKey}
              className={`session-item ${currentSessionKey === session.sessionKey ? 'active' : ''}`}
              onClick={() => setCurrentSession(session.sessionKey)}
            >
              <div className="session-avatar">💬</div>
              <div className="session-info">
                <div className="session-title">{session.label || '新会话'}</div>
                <div className="session-preview">
                  {getContentText((messages[session.sessionKey] || [])?.slice(-1)[0]?.content) || '暂无消息'}...
                </div>
              </div>
              <div className="session-time">{session.lastMessageAt ? formatTime(session.lastMessageAt) : ''}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* 主聊天区域 */}
      <main className="chat-main">
        {/* 顶部栏 */}
        <header className="chat-header">
          <button className="menu-btn" onClick={toggleSidebar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          
          <div className="chat-title">
            <h3>{currentSessionKey ? '会话中' : 'ChatLite'}</h3>
            <p>{isStreaming ? 'AI 正在输入...' : '在线'}</p>
          </div>

          <div className="header-actions">
            <button className="icon-btn" title="搜索">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <button 
              className={`icon-btn ${showArtifactPanel ? 'active' : ''}`} 
              onClick={() => setShowArtifactPanel(!showArtifactPanel)}
              title="展开 Artifact 面板"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
                <path d="M3 9h18" />
              </svg>
            </button>
            <button className="icon-btn" title="更多">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
          </div>
            <button 
              className={`icon-btn ${showArtifactPanel ? 'active' : ''}`} 
              onClick={() => setShowArtifactPanel(!showArtifactPanel)}
              title="展开 Artifact"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
        </header>

        {/* 消息列表 */}
        <div className="chat-messages">
          {currentSessionKey ? (
            currentMessages.length > 0 ? (
              <>
                {currentMessages
                  .filter(msg => {
                    // 过滤掉工具调用的原始消息
                    if (msg.content && typeof msg.content === 'string') {
                      try {
                        const parsed = JSON.parse(msg.content);
                        // 如果是 toolCall 类型，过滤掉
                        if (parsed.type === 'toolCall') {
                          return false;
                        }
                      } catch {
                        // 不是 JSON，保留
                      }
                    }
                    return true;
                  })
                  .map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-group ${msg.role === 'user' ? 'self' : ''}`}
                  >
                    <div className={`message-avatar ${msg.role}`}>
                      {msg.role === 'user' ? '👤' : '🤖'}
                    </div>
                    <div className="message-content">
                      {msg.role !== 'user' && (
                        <div className="message-sender">
                          {msg.role === 'assistant' ? 'AI 助手' : '系统'}
                          {msg.metadata?.skillMatched && (
                            <span className="skill-badge">🔌 {msg.metadata.skillMatched}</span>
                          )}
                        </div>
                      )}
                      <div className={`message-bubble ${msg.role}`}>
                        {msg.role === 'assistant' ? (
                          <Markdown content={getContentText(msg.content)} />
                        ) : (
                          <span>{getContentText(msg.content) || JSON.stringify(msg.content)}</span>
                        )}
                      </div>
                      <div className="message-time">{formatTime(msg.timestamp)}</div>
                    </div>
                  </div>
                ))}
                {isStreaming && (
                  <div key="typing-indicator" className="message-group typing">
                    <div className="message-avatar assistant">🤖</div>
                    <div className="message-content">
                      <div className="message-bubble assistant typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="empty-chat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <h3>开始新对话</h3>
                <p>输入消息与 AI 助手交流，自动匹配 OpenClaw 技能</p>
              </div>
            )
          ) : (
            <div className="empty-chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <h3>选择或创建会话</h3>
              <p>从左侧选择一个会话或创建新会话</p>
            </div>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="error-toast">
            <span>⚠️ {error}</span>
            <button onClick={clearError}>✕</button>
          </div>
        )}

        {/* 输入区域 */}
        <div className="chat-input-area">
          <button
            className={`skill-btn ${selectedSkill ? 'active' : ''}`}
            onClick={() => setShowSkillPanel(!showSkillPanel)}
            title="技能菜单"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </button>
          
          {/* 技能预览 */}
          {selectedSkill && (
            <div className="skill-preview">
              <span className="skill-preview-icon">{selectedSkill.icon}</span>
              <div className="skill-preview-info">
                <span className="skill-preview-name">{selectedSkill.name}</span>
                <span className="skill-preview-desc">{selectedSkill.description}</span>
              </div>
              <button
                className="skill-preview-remove"
                onClick={() => setSelectedSkill(undefined)}
                title="取消选择"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          )}
          
          <textarea
            ref={textareaRef}
            className="message-input"
            placeholder={selectedSkill ? `使用 ${selectedSkill.name} 技能...` : "输入消息... (Enter 发送，Shift+Enter 换行)"}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13" />
              <path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>

        {/* 技能面板 */}
        {showSkillPanel && (
          <SkillPanel
            visible={showSkillPanel}
            onSelectSkill={(skill) => {
              setSelectedSkill(skill);
              setShowSkillPanel(false);
            }}
            onClose={() => setShowSkillPanel(false)}
          />
        )}

        {/* Artifact 面板 */}
        {showArtifactPanel && (
          <ArtifactViewer
            visible={showArtifactPanel}
            skillName={selectedSkill?.name}
            data={currentArtifactData}
            onClose={() => setShowArtifactPanel(false)}
            onRefresh={() => {
              // 刷新 artifact 数据
              console.log('刷新 artifact');
            }}
          />
        )}
      </main>
    </div>
  );
};
