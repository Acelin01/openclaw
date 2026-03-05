import React from 'react';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignee?: string;
  due_date?: string;
  created_at?: string;
}

interface TaskListProps {
  data: {
    tasks?: Task[];
    [key: string]: any;
  };
}

export function TaskList({ data }: TaskListProps) {
  const tasks = data.tasks || [];

  return (
    <div className="task-list">
      <div className="task-header">
        <h2>任务列表</h2>
        <span className="task-count">共 {tasks.length} 个</span>
      </div>
      
      {tasks.length === 0 ? (
        <div className="task-empty">
          <p>暂无任务</p>
        </div>
      ) : (
        <div className="task-table">
          <table>
            <thead>
              <tr>
                <th>标题</th>
                <th>优先级</th>
                <th>状态</th>
                <th>负责人</th>
                <th>截止日期</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="task-row">
                  <td className="task-title">{task.title}</td>
                  <td>
                    <span className={`priority-${task.priority}`}>
                      {task.priority === 'low' && '低'}
                      {task.priority === 'medium' && '中'}
                      {task.priority === 'high' && '高'}
                      {task.priority === 'critical' && '紧急'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-${task.status}`}>
                      {task.status === 'pending' && '待处理'}
                      {task.status === 'in_progress' && '进行中'}
                      {task.status === 'completed' && '已完成'}
                      {task.status === 'blocked' && '阻塞'}
                    </span>
                  </td>
                  <td>{task.assignee || '未分配'}</td>
                  <td>{task.due_date || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
