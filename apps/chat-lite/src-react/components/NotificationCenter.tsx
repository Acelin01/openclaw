/**
 * 通知中心组件
 * 包含：新订单提醒、新评价提醒、系统通知等
 */

import React, { useState, useEffect } from 'react';
import './NotificationCenter.css';

interface Notification {
  id: string;
  type: 'order' | 'review' | 'system' | 'message';
  title: string;
  content: string;
  time: string;
  read: boolean;
  icon: string;
}

const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'order',
    title: '新订单通知',
    content: '张先生订购了「智能数据分析师」服务，请及时处理',
    time: '5 分钟前',
    read: false,
    icon: '🛒',
  },
  {
    id: 'notif-002',
    type: 'review',
    title: '新评价通知',
    content: '李女士对「UI 设计评审助手」进行了评价',
    time: '15 分钟前',
    read: false,
    icon: '⭐',
  },
  {
    id: 'notif-003',
    type: 'system',
    title: '服务审核通过',
    content: '您的服务「全栈开发智能助手」已通过 AI 审核，现已上线',
    time: '1 小时前',
    read: true,
    icon: '✅',
  },
  {
    id: 'notif-004',
    type: 'message',
    title: '客户消息',
    content: '王经理在订单中给您发送了一条消息',
    time: '2 小时前',
    read: true,
    icon: '💬',
  },
  {
    id: 'notif-005',
    type: 'order',
    title: '订单完成',
    content: '订单 ORD-20260308-001 已完成，收益已入账',
    time: '3 小时前',
    read: true,
    icon: '💰',
  },
];

export const NotificationCenter: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="notification-center">
      {/* 通知铃铛按钮 */}
      <button
        className="notification-bell"
        onClick={() => setShowPanel(!showPanel)}
      >
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 2a5.5 5.5 0 0 0-5.5 5.5v2L1 11.5h14l-1.5-2v-2A5.5 5.5 0 0 0 8 2Z" />
          <path d="M6.5 13.5a1.5 1.5 0 0 0 3 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </button>

      {/* 通知面板 */}
      {showPanel && (
        <div className="notification-panel">
          <div className="panel-header">
            <h3>通知中心</h3>
            <div className="panel-actions">
              <button className="mark-read" onClick={markAllAsRead}>
                全部已读
              </button>
              <button className="clear-all" onClick={clearAll}>
                清空
              </button>
            </div>
          </div>

          <div className="filter-tabs">
            <button
              className={`tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              全部
            </button>
            <button
              className={`tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              未读
            </button>
          </div>

          <div className="notification-list">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="notif-icon">{notif.icon}</div>
                  <div className="notif-content">
                    <div className="notif-title">{notif.title}</div>
                    <div className="notif-text">{notif.content}</div>
                    <div className="notif-time">{notif.time}</div>
                  </div>
                  {!notif.read && <div className="unread-dot" />}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🔔</div>
                <div className="empty-text">暂无通知</div>
              </div>
            )}
          </div>

          <div className="panel-footer">
            <button className="view-all">查看全部通知</button>
          </div>
        </div>
      )}
    </div>
  );
};
