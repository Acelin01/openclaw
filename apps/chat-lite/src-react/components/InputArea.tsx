import React, { KeyboardEvent } from 'react';
import './InputArea.css';

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ 
  value, 
  onChange, 
  onSend,
  disabled = false 
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
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
          placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
          disabled={disabled}
          rows={1}
        />
      </div>
      <button
        className="btn btn-primary"
        onClick={onSend}
        disabled={disabled || !value.trim()}
      >
        发送
      </button>
    </div>
  );
};

export default InputArea;
