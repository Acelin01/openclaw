import React, { KeyboardEvent } from 'react';
import './InputArea.css';

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  connected?: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
  connected = true
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && connected && value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="input-area">
      <div className="input-wrapper">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={connected ? "输入消息... (Enter 发送，Shift+Enter 换行)" : "智能体未连接，无法发送消息"}
          disabled={disabled || !connected}
          rows={1}
        />
      </div>
      <button
        className="btn btn-primary"
        onClick={onSend}
        disabled={disabled || !connected || !value.trim()}
        title={connected ? '' : '智能体未连接'}
      >
        发送
      </button>
    </div>
  );
};

export default InputArea;
