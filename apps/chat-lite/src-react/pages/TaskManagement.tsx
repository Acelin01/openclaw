/**
 * 任务管理页面 - React 版本
 * 参考文档：/docs/chat/任务管理.md
 * 设计风格：Warm Chalk Studio（米白色 + 深棕色 + 陶土色）
 */

import React, { useState } from 'react';
import './TaskManagement.css';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inprogress' | 'done' | 'blocked';
  priority: 'p0' | 'p1' | 'p2';
  assignee?: string;
  tags?: string[];
  progress?: number;
  dueDate?: string;
  comments?: number;
  attachments?: number;
}

const mockTasks: Task[] = [
  {
    id: 'TSK-001',
    title: '完成用户登录功能开发',
    description: '实现用户登录、注册、密码找回功能，支持第三方登录',
    status: 'inprogress',
    priority: 'p0',
    assignee: '张三',
    tags: ['开发', '前端'],
    progress: 65,
    dueDate: '2026-03-10',
    comments: 5,
    attachments: 2,
  },
  {
    id: 'TSK-002',
    title: '设计首页 UI 界面',
    description: '完成首页视觉设计和交互设计，输出 Figma 源文件',
    status: 'done',
    priority: 'p1',
    assignee: '李设计师',
    tags: ['设计', 'UI'],
    progress: 100,
    dueDate: '2026-03-08',
    comments: 12,
    attachments: 8,
  },
  {
    id: 'TSK-003',
    title: '数据库表结构设计',
    description: '设计用户、订单、服务等核心表结构，输出 ER 图',
    status: 'todo',
    priority: 'p0',
    assignee: '赵开发',
    tags: ['开发', '后端'],
    progress: 0,
    dueDate: '2026-03-12',
    comments: 3,
    attachments: 1,
  },
  {
    id: 'TSK-004',
    title: '编写 API 接口文档',
    description: '编写完整的 RESTful API 文档，包含示例代码',
    status: 'inprogress',
    priority: 'p1',
    assignee: '钱文档',
    tags: ['文档', 'API'],
    progress: 40,
    dueDate: '2026-03-11',
    comments: 7,
    attachments: 3,
  },
  {
    id: 'TSK-005',
    title: '前端性能优化',
    description: '优化首屏加载时间和交互响应速度',
    status: 'blocked',
    priority: 'p2',
    assignee: '孙前端',
    tags: ['开发', '优化'],
    progress: 20,
    dueDate: '2026-03-15',
    comments: 2,
    attachments: 0,
  },
  {
    id: 'TSK-006',
    title: '测试用例编写',
    description: '编写核心功能的单元测试和 E2E 测试用例',
    status: 'todo',
    priority: 'p1',
    assignee: '周测试',
    tags: ['测试', 'QA'],
    progress: 0,
    dueDate: '2026-03-14',
    comments: 1,
    attachments: 0,
  },
];

export const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'p0' | 'p1' | 'p2'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      p0: 'P0',
      p1: 'P1',
      p2: 'P2',
    };
    return labels[priority] || priority;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      todo: '待处理',
      inprogress: '进行中',
      done: '已完成',
      blocked: '已阻塞',
    };
    return labels[status] || status;
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setShowDetail(true);
  };

  return (
    <div className="task-management">
      {/* 顶部导航栏 */}
      <nav className="task-topbar">
        <div className="task-logo">
          <div className="logo-mark">📋</div>
          <div>
            <div className="logo-text">TaskHub</div>
            <div className="logo-sub">任务管理</div>
          </div>
        </div>
        <div className="task-top-nav">
          <span className="tn-link">工作台</span>
          <span className="tn-link active">任务管理</span>
          <span className="tn-link">迭代</span>
          <span className="tn-link">报表</span>
        </div>
        <div className="task-topbar-right">
          <div className="project-chip">
            <span>💻</span>
            <span>机器人后台开发</span>
          </div>
          <button className="icon-btn">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="6" cy="6" r="4.5" />
              <path d="m11 11 2.5 2.5" strokeLinecap="round" />
            </svg>
          </button>
          <button className="icon-btn">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M8 2a5.5 5.5 0 0 0-5.5 5.5v2L1 11.5h14l-1.5-2v-2A5.5 5.5 0 0 0 8 2Z" />
              <path d="M6.5 13.5a1.5 1.5 0 0 0 3 0" />
            </svg>
          </button>
          <div className="top-avatar">李</div>
        </div>
      </nav>

      {/* 主布局 */}
      <div className="task-layout">
        {/* 左侧边栏 */}
        <aside className="task-sidebar">
          <div className="sb-section">
            <div className="sb-label">视图</div>
            <div className="sb-item active">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="2" width="12" height="12" rx="2" />
                <path d="M2 6h12M6 2v12" />
              </svg>
              全部任务
              <span className="sb-count">{tasks.length}</span>
            </div>
            <div className="sb-item">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 4v4l3 2" />
              </svg>
              我的任务
              <span className="sb-count">3</span>
            </div>
            <div className="sb-item">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M8 2l1.5 3h3.5l-2.8 2 1 3.5-3.2-2.3-3.2 2.3 1-3.5-2.8-2h3.5z" />
              </svg>
              收藏
              <span className="sb-count">5</span>
            </div>
          </div>

          <div className="sb-section">
            <div className="sb-label">优先级</div>
            <div className="sb-priority">
              <div
                className={`sb-p-row ${selectedPriority === 'p0' ? 'active' : ''}`}
                onClick={() => setSelectedPriority('p0')}
              >
                <div className="sb-p-dot" style={{ background: '#b83535' }} />
                <span>P0 紧急</span>
                <span className="sb-p-count">{tasks.filter(t => t.priority === 'p0').length}</span>
              </div>
              <div
                className={`sb-p-row ${selectedPriority === 'p1' ? 'active' : ''}`}
                onClick={() => setSelectedPriority('p1')}
              >
                <div className="sb-p-dot" style={{ background: '#c07a10' }} />
                <span>P1 重要</span>
                <span className="sb-p-count">{tasks.filter(t => t.priority === 'p1').length}</span>
              </div>
              <div
                className={`sb-p-row ${selectedPriority === 'p2' ? 'active' : ''}`}
                onClick={() => setSelectedPriority('p2')}
              >
                <div className="sb-p-dot" style={{ background: '#0f7b7b' }} />
                <span>P2 普通</span>
                <span className="sb-p-count">{tasks.filter(t => t.priority === 'p2').length}</span>
              </div>
            </div>
          </div>

          <div className="sb-footer">
            <div className="sidebar-user">
              <div className="su-avatar">李</div>
              <div className="su-info">
                <div className="su-name">李晓梅</div>
                <div className="su-role">项目经理</div>
              </div>
            </div>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="task-main">
          {/* 工具栏 */}
          <div className="task-toolbar">
            <div className="page-heading">
              <span>任务管理</span>
              <span className="breadcrumb">/ 全部任务</span>
            </div>
            <div className="toolbar-actions">
              <div className="search-bar">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="6" cy="6" r="4.5" />
                  <path d="m11 11 2.5 2.5" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  placeholder="搜索任务..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'board' ? 'active' : ''}`}
                  onClick={() => setViewMode('board')}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="2" width="4" height="12" />
                    <rect x="8" y="2" width="4" height="8" />
                    <rect x="14" y="2" width="4" height="10" />
                  </svg>
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <line x1="3" y1="4" x2="13" y2="4" />
                    <line x1="3" y1="8" x2="13" y2="8" />
                    <line x1="3" y1="12" x2="13" y2="12" />
                  </svg>
                </button>
              </div>
              <button className="btn btn-clay">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 2v12M2 7h12" strokeLinecap="round" />
                </svg>
                新建任务
              </button>
            </div>
          </div>

          {/* 看板视图 */}
          {viewMode === 'board' && (
            <div className="task-board">
              {/* 待处理列 */}
              <div className="board-column">
                <div className="col-header">
                  <div className="col-dot" style={{ background: '#ddd5c8' }} />
                  <span className="col-name">待处理</span>
                  <span className="col-count">{getTasksByStatus('todo').length}</span>
                  <button className="col-add">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 2v12M2 7h12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="col-body">
                  {getTasksByStatus('todo').map(task => (
                    <TaskCard key={task.id} task={task} onClick={() => openTaskDetail(task)} />
                  ))}
                </div>
              </div>

              {/* 进行中列 */}
              <div className="board-column">
                <div className="col-header">
                  <div className="col-dot" style={{ background: '#1a5fa8' }} />
                  <span className="col-name">进行中</span>
                  <span className="col-count">{getTasksByStatus('inprogress').length}</span>
                  <button className="col-add">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 2v12M2 7h12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="col-body">
                  {getTasksByStatus('inprogress').map(task => (
                    <TaskCard key={task.id} task={task} onClick={() => openTaskDetail(task)} />
                  ))}
                </div>
              </div>

              {/* 已完成列 */}
              <div className="board-column">
                <div className="col-header">
                  <div className="col-dot" style={{ background: '#2d7a4a' }} />
                  <span className="col-name">已完成</span>
                  <span className="col-count">{getTasksByStatus('done').length}</span>
                  <button className="col-add">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 2v12M2 7h12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="col-body">
                  {getTasksByStatus('done').map(task => (
                    <TaskCard key={task.id} task={task} onClick={() => openTaskDetail(task)} />
                  ))}
                </div>
              </div>

              {/* 已阻塞列 */}
              <div className="board-column">
                <div className="col-header">
                  <div className="col-dot" style={{ background: '#b83535' }} />
                  <span className="col-name">已阻塞</span>
                  <span className="col-count">{getTasksByStatus('blocked').length}</span>
                  <button className="col-add">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 2v12M2 7h12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="col-body">
                  {getTasksByStatus('blocked').map(task => (
                    <TaskCard key={task.id} task={task} onClick={() => openTaskDetail(task)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 列表视图 */}
          {viewMode === 'list' && (
            <div className="task-list-view">
              {/* TODO: 实现列表视图 */}
            </div>
          )}
        </main>
      </div>

      {/* 任务详情弹窗 */}
      {showDetail && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
};

// 任务卡片组件
const TaskCard: React.FC<{ task: Task; onClick: () => void }> = ({ task, onClick }) => {
  return (
    <div className="task-card" onClick={onClick}>
      <div className="tc-top">
        <div className="tc-id">{task.id}</div>
        <div className="tc-title">{task.title}</div>
        <div className={`tc-pri pri-${task.priority}`}>{getPriorityLabel(task.priority)}</div>
      </div>
      
      {task.description && (
        <div className="tc-desc">{task.description}</div>
      )}
      
      {task.tags && task.tags.length > 0 && (
        <div className="tc-meta">
          {task.tags.map((tag, index) => (
            <span key={index} className="tc-tag tag-human">{tag}</span>
          ))}
        </div>
      )}
      
      {task.progress !== undefined && (
        <div className="progress-wrap">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${task.progress}%`, background: getProgressColor(task.progress) }}
            />
          </div>
          <div className="progress-text">{task.progress}%</div>
        </div>
      )}
      
      <div className="tc-footer">
        {task.assignee && (
          <div className="tc-assignee">
            <div className="assignee-avatar">{task.assignee[0]}</div>
            <span>{task.assignee}</span>
          </div>
        )}
        <div className="tc-meta-right">
          {task.comments !== undefined && task.comments > 0 && (
            <span className="tc-comment">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M3 3h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5l-3 2V4a1 1 0 0 1 1-1Z" />
              </svg>
              {task.comments}
            </span>
          )}
          {task.attachments !== undefined && task.attachments > 0 && (
            <span className="tc-attachment">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M12 7.5 8 3.5 4 7.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 10.5 8 6.5 4 10.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {task.attachments}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// 任务详情弹窗组件
const TaskDetailModal: React.FC<{ task: Task; onClose: () => void }> = ({ task, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-id">{task.id}</div>
            <h2 className="modal-title">{task.title}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="detail-section">
            <h3>描述</h3>
            <p className="detail-text">{task.description}</p>
          </div>
          
          <div className="detail-grid">
            <div className="detail-item">
              <label>状态</label>
              <div className="detail-value">
                <span className={`status-badge status-${task.status}`}>{getStatusLabel(task.status)}</span>
              </div>
            </div>
            <div className="detail-item">
              <label>优先级</label>
              <div className="detail-value">
                <span className={`priority-badge pri-${task.priority}`}>{getPriorityLabel(task.priority)}</span>
              </div>
            </div>
            <div className="detail-item">
              <label>负责人</label>
              <div className="detail-value">{task.assignee || '未分配'}</div>
            </div>
            <div className="detail-item">
              <label>截止日期</label>
              <div className="detail-value">{task.dueDate || '无'}</div>
            </div>
          </div>
          
          {task.progress !== undefined && (
            <div className="detail-section">
              <h3>进度</h3>
              <div className="progress-bar-large">
                <div
                  className="progress-fill-large"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <div className="progress-text-large">{task.progress}%</div>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>关闭</button>
          <button className="btn btn-primary">编辑</button>
        </div>
      </div>
    </div>
  );
};

// 辅助函数
const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = { p0: 'P0', p1: 'P1', p2: 'P2' };
  return labels[priority] || priority;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    todo: '待处理',
    inprogress: '进行中',
    done: '已完成',
    blocked: '已阻塞',
  };
  return labels[status] || status;
};

const getProgressColor = (progress: number) => {
  if (progress < 30) return '#b83535';
  if (progress < 70) return '#c07a10';
  return '#2d7a4a';
};
