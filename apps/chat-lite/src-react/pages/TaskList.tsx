/**
 * 任务列表页面 - React 版本
 * 包含：任务列表、筛选、批量操作、状态管理等
 */

import React, { useState } from 'react';
import './TaskList.css';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assignee: {
    name: string;
    email: string;
    avatar?: string;
  };
  creator: {
    name: string;
    avatar?: string;
  };
  iteration: string;
  createdAt: string;
  dueDate?: string;
  description?: string;
}

const mockTasks: Task[] = [
  {
    id: 'TASK-001',
    title: '完成用户登录功能开发',
    status: 'processing',
    priority: 'high',
    assignee: {
      name: '张三',
      email: 'zhangsan@example.com',
    },
    creator: {
      name: '李经理',
    },
    iteration: '迭代 1.0',
    createdAt: '2026-03-05',
    dueDate: '2026-03-10',
    description: '实现用户登录、注册、密码找回功能',
  },
  {
    id: 'TASK-002',
    title: '设计首页 UI 界面',
    status: 'completed',
    priority: 'medium',
    assignee: {
      name: '李设计师',
      email: 'designer@example.com',
    },
    creator: {
      name: '王产品',
    },
    iteration: '迭代 1.0',
    createdAt: '2026-03-01',
    dueDate: '2026-03-08',
    description: '完成首页视觉设计和交互设计',
  },
  {
    id: 'TASK-003',
    title: '数据库表结构设计',
    status: 'pending',
    priority: 'high',
    assignee: {
      name: '赵开发',
      email: 'zhao@example.com',
    },
    creator: {
      name: '李经理',
    },
    iteration: '迭代 1.0',
    createdAt: '2026-03-06',
    dueDate: '2026-03-12',
    description: '设计用户、订单、服务等核心表结构',
  },
  {
    id: 'TASK-004',
    title: '编写 API 接口文档',
    status: 'processing',
    priority: 'medium',
    assignee: {
      name: '钱文档',
      email: 'qian@example.com',
    },
    creator: {
      name: '孙技术',
    },
    iteration: '迭代 1.0',
    createdAt: '2026-03-04',
    dueDate: '2026-03-11',
    description: '编写完整的 RESTful API 文档',
  },
  {
    id: 'TASK-005',
    title: '前端性能优化',
    status: 'pending',
    priority: 'low',
    assignee: {
      name: '孙前端',
      email: 'sun@example.com',
    },
    creator: {
      name: '李经理',
    },
    iteration: '迭代 1.1',
    createdAt: '2026-03-07',
    dueDate: '2026-03-15',
    description: '优化首屏加载时间和交互响应速度',
  },
];

export const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'cancelled'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const toggleSelectTask = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(t => t.id)));
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '待处理',
      processing: '进行中',
      completed: '已完成',
      cancelled: '已取消',
    };
    return labels[status] || status;
  };

  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      pending: 'status-pending',
      processing: 'status-processing',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
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

  const bulkAction = (action: string) => {
    if (selectedTasks.size === 0) {
      alert('请先选择任务');
      return;
    }
    alert(`对 ${selectedTasks.size} 个任务执行：${action}`);
  };

  return (
    <div className="task-list-page">
      {/* 顶部导航 */}
      <nav className="task-topnav">
        <div className="market-logo">
          <span className="logo-icon">✅</span>
          <span className="logo-text">任务管理</span>
        </div>
        <ul className="market-nav-links">
          <li><a href="/market">服务市场</a></li>
          <li><a href="/market/manage">服务管理</a></li>
          <li><a href="#" className="active">任务列表</a></li>
        </ul>
        <div className="market-nav-right">
          <button className="btn-primary">+ 新建任务</button>
        </div>
      </nav>

      <div className="task-content">
        {/* 头部操作栏 */}
        <div className="task-header">
          <div className="task-header-left">
            <h2>全部任务</h2>
            {selectedTasks.size > 0 && (
              <div className="bulk-actions">
                <span className="selected-count">已选择 {selectedTasks.size} 项</span>
                <button className="btn-action" onClick={() => bulkAction('开始执行')}>开始执行</button>
                <button className="btn-action" onClick={() => bulkAction('暂停')}>暂停</button>
                <button className="btn-action" onClick={() => bulkAction('完成')}>标记完成</button>
                <button className="btn-action delete" onClick={() => bulkAction('删除')}>删除</button>
              </div>
            )}
          </div>
          <div className="task-header-right">
            <div className="search-box">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
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
            <button
              className={`icon-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="列表视图"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="4" x2="13" y2="4" />
                <line x1="3" y1="8" x2="13" y2="8" />
                <line x1="3" y1="12" x2="13" y2="12" />
              </svg>
            </button>
            <button
              className={`icon-btn ${viewMode === 'board' ? 'active' : ''}`}
              onClick={() => setViewMode('board')}
              title="看板视图"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="4" height="12" />
                <rect x="8" y="2" width="4" height="8" />
                <rect x="14" y="2" width="4" height="10" />
              </svg>
            </button>
            <button className="btn-outline">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="8" cy="8" r="2" />
                <circle cx="8" cy="8" r="6" />
                <path d="M8 2v2M8 12v2M2 8h2M12 8h2" />
              </svg>
              筛选
            </button>
            <button className="btn-primary">+ 新建任务</button>
          </div>
        </div>

        {/* 筛选栏 */}
        <div className="task-filters">
          <div className="filter-group">
            <label>状态：</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">全部</option>
              <option value="pending">待处理</option>
              <option value="processing">进行中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div className="filter-group">
            <label>优先级：</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">全部</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          <div className="filter-group">
            <label>迭代：</label>
            <select className="filter-select">
              <option value="all">全部</option>
              <option value="1.0">迭代 1.0</option>
              <option value="1.1">迭代 1.1</option>
            </select>
          </div>
        </div>

        {/* 任务列表 */}
        {viewMode === 'list' ? (
          <div className="task-table-wrapper">
            <table className="task-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input
                      type="checkbox"
                      className="task-checkbox"
                      checked={selectedTasks.size === filteredTasks.length && filteredTasks.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>任务 ID</th>
                  <th>标题</th>
                  <th>状态</th>
                  <th>优先级</th>
                  <th>负责人</th>
                  <th>创建者</th>
                  <th>迭代</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="task-row">
                    <td className="checkbox-col">
                      <input
                        type="checkbox"
                        className="task-checkbox"
                        checked={selectedTasks.has(task.id)}
                        onChange={() => toggleSelectTask(task.id)}
                      />
                    </td>
                    <td className="task-id">{task.id}</td>
                    <td className="task-title">
                      <div className="title-text">{task.title}</div>
                      {task.description && (
                        <div className="title-desc">{task.description}</div>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </td>
                    <td className="assignee">
                      <div className="user-info">
                        <div className="user-avatar">
                          {task.assignee.avatar || task.assignee.name[0]}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{task.assignee.name}</div>
                          <div className="user-email">{task.assignee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="creator">
                      <div className="user-avatar-small">
                        {task.creator.avatar || task.creator.name[0]}
                      </div>
                      <span>{task.creator.name}</span>
                    </td>
                    <td className="iteration">{task.iteration}</td>
                    <td className="created-at">{task.createdAt}</td>
                    <td className="actions">
                      <button className="action-btn view">查看</button>
                      <button className="action-btn edit">编辑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="task-board">
            {/* 看板视图 */}
            <div className="board-column">
              <div className="column-header status-pending">
                <span>待处理</span>
                <span className="column-count">
                  {filteredTasks.filter(t => t.status === 'pending').length}
                </span>
              </div>
              <div className="column-body">
                {filteredTasks.filter(t => t.status === 'pending').map(task => (
                  <div key={task.id} className="board-card">
                    <div className="card-header">
                      <span className="task-id">{task.id}</span>
                      <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    <div className="card-title">{task.title}</div>
                    <div className="card-footer">
                      <div className="card-assignee">{task.assignee.name}</div>
                      <div className="card-due">{task.dueDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="board-column">
              <div className="column-header status-processing">
                <span>进行中</span>
                <span className="column-count">
                  {filteredTasks.filter(t => t.status === 'processing').length}
                </span>
              </div>
              <div className="column-body">
                {filteredTasks.filter(t => t.status === 'processing').map(task => (
                  <div key={task.id} className="board-card">
                    <div className="card-header">
                      <span className="task-id">{task.id}</span>
                      <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    <div className="card-title">{task.title}</div>
                    <div className="card-footer">
                      <div className="card-assignee">{task.assignee.name}</div>
                      <div className="card-due">{task.dueDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="board-column">
              <div className="column-header status-completed">
                <span>已完成</span>
                <span className="column-count">
                  {filteredTasks.filter(t => t.status === 'completed').length}
                </span>
              </div>
              <div className="column-body">
                {filteredTasks.filter(t => t.status === 'completed').map(task => (
                  <div key={task.id} className="board-card">
                    <div className="card-header">
                      <span className="task-id">{task.id}</span>
                      <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    <div className="card-title">{task.title}</div>
                    <div className="card-footer">
                      <div className="card-assignee">{task.assignee.name}</div>
                      <div className="card-due">{task.dueDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 分页 */}
        <div className="task-pagination">
          <div className="pagination-info">
            共 {filteredTasks.length} 条任务
          </div>
          <div className="pagination-controls">
            <button className="page-btn">上一页</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">下一页</button>
          </div>
        </div>
      </div>
    </div>
  );
};
