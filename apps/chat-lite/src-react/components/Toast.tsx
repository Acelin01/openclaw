/**
 * Toast 提示组件
 */

import React, { useEffect } from 'react';
import './Toast.css';

interface ToastProps {
  type: 'success' | 'info' | 'error';
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  title,
  message,
  onClose,
  duration = 2600,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: '✓',
    info: 'ℹ',
    error: '✕',
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className={`toast-icon ${type}`}>{icons[type]}</div>
      <div className="toast-body">
        <strong>{title}</strong>
        {message && <span>{message}</span>}
      </div>
    </div>
  );
};
