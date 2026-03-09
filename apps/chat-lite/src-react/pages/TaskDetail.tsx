/**
 * 任务详情页面 - React 版本
 * 参考文档：/docs/项目协作/任务_详情.md
 */

import React, { useState } from 'react';
import './TaskDetail.css';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: {
    name: string;
    avatar?: string;
  };
  creator: {
    name: string;
    createdAt: string;
  };
  startDate?: string;
  dueDate?: string;
  tags: string[];
  iteration?: string;
  storyPoints?: number;
  comments: Comment[];
  attachments: Attachment[];
  subtasks: Subtask[];
}

interface Comment {
  id: string;
  user: string;
  avatar?: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'image';
  url: string;
  size?: string;
}

interface Subtask {
  id: string;
  title: string;
  status: 'todo' | 'done';
  assignee?: string;
}

const mockTask: Task = {
  id: 'TASK-001',
  title: '完成用户登录功能开发',
  description: '实现用户登录、注册、密码找回功能，支持第三方登录（微信、GitHub）。\n\n技术要求：\n- 使用 JWT 进行身份验证\n- 支持手机号 + 验证码登录\n- 密码强度校验\n- 登录失败次数限制',
  status: 'inprogress',
  priority: 'high',
  assignee: {
    name: '张三',
  },
  creator: {
    name: '李经理',
    createdAt: '2026-03-05',
  },
  startDate: '2026-03-05',
  dueDate: '2026-03-10',
  tags: ['开发', '前端', '紧急'],
  iteration: '迭代 1.0',
  storyPoints: 8,
  comments: [
    {
      id: 'c1',
      user: '李经理',
      content: '这个任务比较紧急，请优先处理。',
      createdAt: '2026-03-05 10:30',
    },
    {
      id: 'c2',
      user: '张三',
      content: '收到，预计明天完成登录页面，后天完成后端接口。',
      createdAt: '2026-03-05 14:20',
      replies: [
        {
          id: 'c2-1',
          user: '李经理',
          content: '好的，有问题随时沟通。',
          createdAt: '2026-03-05 15:00',
        },
      ],
    },
  ],
  attachments: [
    { id: 'a1', name: '登录页面设计稿.png', type: 'image', url: '#', size: '2.4MB' },
    { id: 'a2', name: 'API 接口文档.pdf', type: 'file', url: '#', size: '1.2MB' },
  ],
  subtasks: [
    { id: 's1', title: '登录页面 UI 开发', status: 'done', assignee: '张三' },
    { id: 's2', title: '登录接口开发', status: 'inprogress', assignee: '张三' },
    { id: 's3', title: '第三方登录集成', status: 'todo', assignee: '张三' },
    { id: 's4', title: '单元测试编写', status: 'todo', assignee: '张三' },
  ],
};

export const TaskDetail: React.FC = () => {
  const [task] = useState<Task>(mockTask);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [editDescriptionValue, setEditDescriptionValue] = useState(task.description);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      todo: '待处理',
      inprogress: '进行中',
      done: '已完成',
    };
    return labels[status] || status;
  };

  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      todo: 'status-todo',
      inprogress: 'status-inprogress',
      done: 'status-completed',
    };
    return classes[status] || '';
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
    };
    return labels[priority] || priority;
  };

  const getPriorityClass = (priority: string) => {
    const classes: Record<string, string> = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
    };
    return classes[priority] || '';
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      console.log('添加评论:', newComment);
      setNewComment('');
    }
  };

  const handleSaveDescription = () => {
    console.log('保存描述:', editDescriptionValue);
    setEditingDescription(false);
  };

  const getSubtaskProgress = () => {
    const done = task.subtasks.filter(s => s.status === 'done').length;
    return Math.round((done / task.subtasks.length) * 100);
  };

  return (
    <div className="task-detail-page">
      {/* 顶部导航 */}
      <nav className="task-topnav">
        <div className="market-logo">
          <span className="logo-icon">✅</span>
          <span className="logo-text">任务管理</span>
        </div>
        <ul className="market-nav-links">
          <li><a href="/market">服务市场</a></li>
          <li><a href="/task-manage">任务管理</a></li>
          <li><a href="#" className="active">{task.id}</a></li>
        </ul>
        <div className="market-nav-right">
          <button className="btn btn-ghost">分享</button>
          <button className="btn btn-primary">编辑</button>
        </div>
      </nav>

      {/* 主内容区 */}
      <div className="task-detail-content">
        {/* 左侧详情区 */}
        <div className="detail-main">
          {/* 任务头部 */}
          <div className="task-detail-header">
            <div className="task-id-badge">{task.id}</div>
            <h1 className="task-title">{task.title}</h1>
            <div className="task-meta">
              <div className="user-info">
                <div className="user-avatar creator">{task.creator.name[0]}</div>
                <span>{task.creator.name} 创建于 {task.creator.createdAt}</span>
              </div>
            </div>
          </div>

          {/* Tab 切换 */}
          <div className="tab-group">
            <button
              className={`tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              详情
            </button>
            <button
              className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              评论
              <span className="tab-count">{task.comments.length}</span>
            </button>
            <button
              className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              动态
            </button>
          </div>

          {/* 详情内容 */}
          {activeTab === 'details' && (
            <div className="detail-content">
              {/* 描述区域 */}
              <div className="description-container">
                <div className="description-header">
                  <span className="description-title">描述</span>
                  {!editingDescription && (
                    <button
                      className="edit-btn"
                      onClick={() => setEditingDescription(true)}
                    >
                      编辑
                    </button>
                  )}
                </div>
                
                {editingDescription ? (
                  <div className="description-edit-mode">
                    <div className="description-edit-toolbar">
                      <button className="toolbar-btn"><b>B</b></button>
                      <button className="toolbar-btn"><i>I</i></button>
                      <button className="toolbar-btn"><u>U</u></button>
                      <span className="toolbar-divider">|</span>
                      <button className="toolbar-btn">列表</button>
                      <button className="toolbar-btn">引用</button>
                      <button className="toolbar-btn">代码</button>
                    </div>
                    <textarea
                      className="description-edit-area"
                      value={editDescriptionValue}
                      onChange={(e) => setEditDescriptionValue(e.target.value)}
                      rows={10}
                    />
                    <div className="description-edit-buttons">
                      <button className="btn btn-ghost" onClick={() => setEditingDescription(false)}>取消</button>
                      <button className="btn btn-primary" onClick={handleSaveDescription}>保存</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`description-content ${descriptionExpanded ? 'expanded' : 'collapsed'}`}>
                      {task.description.split('\n').map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                    {!descriptionExpanded && (
                      <div
                        className="description-show-more"
                        onClick={() => setDescriptionExpanded(true)}
                      >
                        显示更多 ▼
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* 子任务区域 */}
              <div className="subtasks-container">
                <div className="section-header">
                  <span className="section-title">子任务</span>
                  <span className="section-progress">{getSubtaskProgress()}% 完成</span>
                </div>
                <div className="subtasks-list">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="subtask-item">
                      <input
                        type="checkbox"
                        checked={subtask.status === 'done'}
                        readOnly
                        className="subtask-checkbox"
                      />
                      <span className={`subtask-title ${subtask.status === 'done' ? 'completed' : ''}`}>
                        {subtask.title}
                      </span>
                      {subtask.assignee && (
                        <div className="subtask-assignee">{subtask.assignee}</div>
                      )}
                    </div>
                  ))}
                </div>
                <button className="btn-add-subtask">+ 添加子任务</button>
              </div>

              {/* 附件区域 */}
              <div className="attachments-container">
                <div className="section-header">
                  <span className="section-title">附件</span>
                  <button className="btn-upload">上传附件</button>
                </div>
                <div className="attachments-list">
                  {task.attachments.map((attachment) => (
                    <div key={attachment.id} className="attachment-item">
                      <div className="attachment-icon">
                        {attachment.type === 'image' ? '🖼️' : '📄'}
                      </div>
                      <div className="attachment-info">
                        <div className="attachment-name">{attachment.name}</div>
                        {attachment.size && (
                          <div className="attachment-size">{attachment.size}</div>
                        )}
                      </div>
                      <button className="btn-download">下载</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 评论 Tab */}
          {activeTab === 'comments' && (
            <div className="comments-content">
              <div className="comment-input-area">
                <div className="comment-avatar">我</div>
                <div className="comment-input-wrapper">
                  <textarea
                    className="comment-input"
                    placeholder="写下你的评论..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="comment-actions">
                    <button className="btn-format">📎</button>
                    <button className="btn-format">@</button>
                    <button className="btn-format">😊</button>
                    <button
                      className="btn btn-primary"
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                    >
                      评论
                    </button>
                  </div>
                </div>
              </div>

              <div className="comments-list">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-avatar">{comment.user[0]}</div>
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="comment-user">{comment.user}</span>
                        <span className="comment-date">{comment.createdAt}</span>
                      </div>
                      <div className="comment-content">{comment.content}</div>
                      <div className="comment-actions-row">
                        <button className="comment-action">回复</button>
                        <button className="comment-action">点赞</button>
                      </div>
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="comment-replies">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="comment-reply">
                              <div className="reply-avatar">{reply.user[0]}</div>
                              <div className="reply-body">
                                <div className="reply-header">
                                  <span className="reply-user">{reply.user}</span>
                                  <span className="reply-date">{reply.createdAt}</span>
                                </div>
                                <div className="reply-content">{reply.content}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 动态 Tab */}
          {activeTab === 'activity' && (
            <div className="activity-content">
              <div className="activity-item">
                <div className="activity-avatar">张</div>
                <div className="activity-body">
                  <div className="activity-text">
                    <span className="activity-user">张三</span>
                    <span>将状态改为</span>
                    <span className="activity-status status-inprogress">进行中</span>
                  </div>
                  <div className="activity-date">2026-03-06 09:30</div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-avatar">李</div>
                <div className="activity-body">
                  <div className="activity-text">
                    <span className="activity-user">李经理</span>
                    <span>创建了此任务</span>
                  </div>
                  <div className="activity-date">2026-03-05 10:00</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧属性栏 */}
        <div className="detail-sidebar">
          {/* 状态 */}
          <div className="sidebar-section">
            <label className="sidebar-label">状态</label>
            <div className={`status-badge ${getStatusClass(task.status)}`}>
              {getStatusLabel(task.status)}
            </div>
          </div>

          {/* 优先级 */}
          <div className="sidebar-section">
            <label className="sidebar-label">优先级</label>
            <div className={`priority-badge ${getPriorityClass(task.priority)}`}>
              {getPriorityLabel(task.priority)}
            </div>
          </div>

          {/* 负责人 */}
          <div className="sidebar-section">
            <label className="sidebar-label">负责人</label>
            <div className="assignee-display">
              <div className="assignee-avatar">{task.assignee?.name[0] || '?'}</div>
              <span>{task.assignee?.name || '未分配'}</span>
            </div>
          </div>

          {/* 创建者 */}
          <div className="sidebar-section">
            <label className="sidebar-label">创建者</label>
            <div className="creator-display">{task.creator.name}</div>
          </div>

          {/* 日期 */}
          <div className="sidebar-section">
            <label className="sidebar-label">开始日期</label>
            <div className="date-display">{task.startDate || '-'}</div>
          </div>

          <div className="sidebar-section">
            <label className="sidebar-label">截止日期</label>
            <div className={`date-display ${task.dueDate && new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}>
              {task.dueDate || '-'}
            </div>
          </div>

          {/* 迭代 */}
          <div className="sidebar-section">
            <label className="sidebar-label">迭代</label>
            <div className="iteration-display">{task.iteration || '-'}</div>
          </div>

          {/* 故事点 */}
          <div className="sidebar-section">
            <label className="sidebar-label">故事点</label>
            <div className="story-points">{task.storyPoints || 0}</div>
          </div>

          {/* 标签 */}
          <div className="sidebar-section">
            <label className="sidebar-label">标签</label>
            <div className="tags-display">
              {task.tags.map((tag, index) => (
                <span key={index} className="tag-badge">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
