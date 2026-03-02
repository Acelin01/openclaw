import React from 'react';
import './MessageList.css';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="empty-messages">
          <p>开始对话吧！发送第一条消息~</p>
        </div>
      ) : (
        messages.map(message => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-avatar">
              {message.role === 'user' ? 'U' : message.role === 'system' ? '⚠️' : 'A'}
            </div>
            <div className="message-content">
              <div className="message-bubble">
                {message.content}
              </div>
              <div className="message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MessageList;
