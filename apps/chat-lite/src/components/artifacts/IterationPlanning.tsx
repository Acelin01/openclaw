import React, { useState } from 'react';

interface WorkItem {
  id: string;
  title: string;
  type: 'requirement' | 'task' | 'defect' | 'feature';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planned' | 'committed' | 'done';
  assignee?: string;
  estimate?: number;
}

interface IterationPlanningProps {
  data?: {
    iteration_id?: string;
    iteration_name?: string;
    start_date?: string;
    end_date?: string;
    work_items?: WorkItem[];
    capacity?: number;
    committed?: number;
  };
  onSubmit?: (data: any) => void;
}

export function IterationPlanning({ data, onSubmit }: IterationPlanningProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  // 示例工作项数据
  const availableWorkItems: WorkItem[] = data?.work_items || [
    { id: 'REQ-001', title: '用户登录功能', type: 'requirement', priority: 'high', status: 'planned', estimate: 8 },
    { id: 'REQ-002', title: '数据导出功能', type: 'requirement', priority: 'medium', status: 'planned', estimate: 5 },
    { id: 'TASK-001', title: '数据库设计', type: 'task', priority: 'high', status: 'committed', estimate: 3 },
    { id: 'TASK-002', title: 'API 接口开发', type: 'task', priority: 'high', status: 'committed', estimate: 13 },
    { id: 'DEF-001', title: '登录页面样式问题', type: 'defect', priority: 'low', status: 'planned', estimate: 2 },
  ];

  const handleToggleItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleCommit = () => {
    onSubmit?.({
      iteration_id: data?.iteration_id,
      committed_items: selectedItems,
      commit_date: new Date().toISOString()
    });
  };

  const totalEstimate = availableWorkItems
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + (item.estimate || 0), 0);

  const capacity = data?.capacity || 40;
  const committed = data?.committed || 0;

  return (
    <div className="iteration-planning">
      {/* 头部 */}
      <div className="planning-header">
        <div className="header-left">
          <h2 className="planning-title">
            {data?.iteration_name || '迭代规划'}
          </h2>
          {data?.start_date && data?.end_date && (
            <div className="iteration-dates">
              <span className="date-label">周期:</span>
              <span className="date-value">
                {data.start_date} ~ {data.end_date}
              </span>
            </div>
          )}
        </div>
        <div className="header-actions">
          <button
            className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <i className="icon-list"></i>
            列表
          </button>
          <button
            className={`view-toggle ${viewMode === 'board' ? 'active' : ''}`}
            onClick={() => setViewMode('board')}
          >
            <i className="icon-board"></i>
            看板
          </button>
          <button className="btn btn-primary" onClick={handleCommit}>
            <i className="icon-commit"></i>
            提交规划
          </button>
        </div>
      </div>

      {/* 容量信息 */}
      <div className="capacity-info">
        <div className="capacity-item">
          <span className="capacity-label">团队容量</span>
          <span className="capacity-value">{capacity} 小时</span>
        </div>
        <div className="capacity-item">
          <span className="capacity-label">已承诺</span>
          <span className="capacity-value committed">{committed} 小时</span>
        </div>
        <div className="capacity-item">
          <span className="capacity-label">本次选择</span>
          <span className="capacity-value selected">{totalEstimate} 小时</span>
        </div>
        <div className="capacity-item">
          <span className="capacity-label">剩余容量</span>
          <span className={`capacity-value ${capacity - committed - totalEstimate < 0 ? 'over' : ''}`}>
            {capacity - committed - totalEstimate} 小时
          </span>
        </div>
      </div>

      {/* 工作项列表 */}
      <div className="planning-content">
        <div className="content-header">
          <h3 className="content-title">可选工作项</h3>
          <div className="content-actions">
            <input
              type="text"
              placeholder="搜索工作项..."
              className="search-input"
            />
            <select className="filter-select">
              <option value="">全部类型</option>
              <option value="requirement">需求</option>
              <option value="task">任务</option>
              <option value="defect">缺陷</option>
              <option value="feature">功能</option>
            </select>
            <select className="filter-select">
              <option value="">全部优先级</option>
              <option value="critical">紧急</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="work-item-list">
            <table className="work-item-table">
              <thead>
                <tr>
                  <th className="col-select">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(availableWorkItems.map(item => item.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </th>
                  <th className="col-id">ID</th>
                  <th className="col-title">标题</th>
                  <th className="col-type">类型</th>
                  <th className="col-priority">优先级</th>
                  <th className="col-status">状态</th>
                  <th className="col-assignee">负责人</th>
                  <th className="col-estimate">预估工时</th>
                </tr>
              </thead>
              <tbody>
                {availableWorkItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`work-item-row ${selectedItems.includes(item.id) ? 'selected' : ''}`}
                  >
                    <td className="col-select">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleToggleItem(item.id)}
                      />
                    </td>
                    <td className="col-id">
                      <span className="item-id">{item.id}</span>
                    </td>
                    <td className="col-title">
                      <span className="item-title">{item.title}</span>
                    </td>
                    <td className="col-type">
                      <span className={`type-badge type-${item.type}`}>
                        {item.type === 'requirement' && '需求'}
                        {item.type === 'task' && '任务'}
                        {item.type === 'defect' && '缺陷'}
                        {item.type === 'feature' && '功能'}
                      </span>
                    </td>
                    <td className="col-priority">
                      <span className={`priority-badge priority-${item.priority}`}>
                        {item.priority === 'critical' && '紧急'}
                        {item.priority === 'high' && '高'}
                        {item.priority === 'medium' && '中'}
                        {item.priority === 'low' && '低'}
                      </span>
                    </td>
                    <td className="col-status">
                      <span className={`status-badge status-${item.status}`}>
                        {item.status === 'planned' && '计划中'}
                        {item.status === 'committed' && '已承诺'}
                        {item.status === 'done' && '已完成'}
                      </span>
                    </td>
                    <td className="col-assignee">
                      <span className="assignee-name">{item.assignee || '未分配'}</span>
                    </td>
                    <td className="col-estimate">
                      <span className="estimate-value">{item.estimate || 0}h</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="work-item-board">
            {/* 看板视图 */}
            <div className="board-columns">
              <div className="board-column">
                <div className="column-header status-planned">
                  <span className="column-title">计划中</span>
                  <span className="column-count">
                    {availableWorkItems.filter(i => i.status === 'planned').length}
                  </span>
                </div>
                <div className="column-body">
                  {availableWorkItems
                    .filter(item => item.status === 'planned')
                    .map(item => (
                      <div
                        key={item.id}
                        className={`work-item-card ${selectedItems.includes(item.id) ? 'selected' : ''}`}
                        onClick={() => handleToggleItem(item.id)}
                      >
                        <div className="card-header">
                          <span className={`type-badge type-${item.type}`}>
                            {item.type === 'requirement' && '需求'}
                            {item.type === 'task' && '任务'}
                            {item.type === 'defect' && '缺陷'}
                          </span>
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="card-body">
                          <div className="card-id">{item.id}</div>
                          <div className="card-title">{item.title}</div>
                        </div>
                        <div className="card-footer">
                          <span className={`priority-badge priority-${item.priority}`}>
                            {item.priority === 'critical' && '紧急'}
                            {item.priority === 'high' && '高'}
                            {item.priority === 'medium' && '中'}
                            {item.priority === 'low' && '低'}
                          </span>
                          <span className="estimate-badge">{item.estimate || 0}h</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="board-column">
                <div className="column-header status-committed">
                  <span className="column-title">已承诺</span>
                  <span className="column-count">
                    {availableWorkItems.filter(i => i.status === 'committed').length}
                  </span>
                </div>
                <div className="column-body">
                  {availableWorkItems
                    .filter(item => item.status === 'committed')
                    .map(item => (
                      <div
                        key={item.id}
                        className={`work-item-card ${selectedItems.includes(item.id) ? 'selected' : ''}`}
                        onClick={() => handleToggleItem(item.id)}
                      >
                        <div className="card-header">
                          <span className={`type-badge type-${item.type}`}>
                            {item.type === 'requirement' && '需求'}
                            {item.type === 'task' && '任务'}
                            {item.type === 'defect' && '缺陷'}
                          </span>
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="card-body">
                          <div className="card-id">{item.id}</div>
                          <div className="card-title">{item.title}</div>
                        </div>
                        <div className="card-footer">
                          <span className={`priority-badge priority-${item.priority}`}>
                            {item.priority === 'critical' && '紧急'}
                            {item.priority === 'high' && '高'}
                            {item.priority === 'medium' && '中'}
                            {item.priority === 'low' && '低'}
                          </span>
                          <span className="estimate-badge">{item.estimate || 0}h</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="planning-footer">
        <div className="footer-info">
          <span className="selected-count">已选择 {selectedItems.length} 个工作项</span>
          <span className="total-estimate">总计 {totalEstimate} 小时</span>
        </div>
        <div className="footer-actions">
          <button className="btn btn-secondary" onClick={() => setSelectedItems([])}>
            取消选择
          </button>
          <button className="btn btn-primary" onClick={handleCommit}>
            确认提交
          </button>
        </div>
      </div>

      {/* 样式 */}
      <style>{`
        .iteration-planning {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .planning-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e8e8e8;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #00b42a 0%, #23c343 100%);
          color: white;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .planning-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .iteration-dates {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          opacity: 0.9;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .view-toggle {
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .view-toggle:hover,
        .view-toggle.active {
          background: rgba(255, 255, 255, 0.3);
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .btn-primary {
          background: #00b42a;
          color: white;
        }

        .btn-primary:hover {
          background: #23c343;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 180, 42, 0.3);
        }

        .btn-secondary {
          background: #f0f2f5;
          color: #1f2329;
        }

        .btn-secondary:hover {
          background: #e3e5e8;
        }

        .capacity-info {
          padding: 16px 24px;
          background: #f5f7fa;
          display: flex;
          gap: 24px;
          border-bottom: 1px solid #e8e8e8;
        }

        .capacity-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .capacity-label {
          font-size: 12px;
          color: #646a73;
        }

        .capacity-value {
          font-size: 18px;
          font-weight: 600;
          color: #1f2329;
        }

        .capacity-value.committed {
          color: #00b42a;
        }

        .capacity-value.selected {
          color: #23c343;
        }

        .capacity-value.over {
          color: #f5222d;
        }

        .planning-content {
          padding: 20px 24px;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .content-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2329;
          margin: 0;
        }

        .content-actions {
          display: flex;
          gap: 12px;
        }

        .search-input {
          padding: 6px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          font-size: 14px;
          width: 200px;
        }

        .filter-select {
          padding: 6px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .work-item-list {
          overflow-x: auto;
        }

        .work-item-table {
          width: 100%;
          border-collapse: collapse;
        }

        .work-item-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
          color: #646a73;
          background: #f5f7fa;
          border-bottom: 2px solid #e8e8e8;
        }

        .work-item-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
        }

        .work-item-row:hover {
          background: #f5f7fa;
          cursor: pointer;
        }

        .work-item-row.selected {
          background: #f6ffed;
          border-left: 3px solid #00b42a;
        }

        .item-id {
          font-weight: 600;
          color: #00b42a;
        }

        .item-title {
          color: #1f2329;
        }

        .type-badge,
        .priority-badge,
        .status-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .type-requirement {
          background: #e6f7ff;
          color: #0077b6;
        }

        .type-task {
          background: #f6ffed;
          color: #00b42a;
        }

        .type-defect {
          background: #fff1f0;
          color: #f5222d;
        }

        .type-feature {
          background: #fff7e6;
          color: #fa8c16;
        }

        .priority-critical {
          background: #fff1f0;
          color: #f5222d;
        }

        .priority-high {
          background: #fff7e6;
          color: #fa8c16;
        }

        .priority-medium {
          background: #f6ffed;
          color: #00b42a;
        }

        .priority-low {
          background: #f0f2f5;
          color: #646a73;
        }

        .status-planned {
          background: #f0f2f5;
          color: #646a73;
        }

        .status-committed {
          background: #e6f7ff;
          color: #0077b6;
        }

        .status-done {
          background: #f6ffed;
          color: #00b42a;
        }

        .assignee-name {
          color: #1f2329;
        }

        .estimate-value {
          font-weight: 600;
          color: #00b42a;
        }

        .planning-footer {
          padding: 16px 24px;
          border-top: 1px solid #e8e8e8;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fafafa;
        }

        .footer-info {
          display: flex;
          gap: 24px;
        }

        .selected-count,
        .total-estimate {
          font-size: 14px;
          color: #1f2329;
        }

        .total-estimate {
          font-weight: 600;
          color: #00b42a;
        }

        .footer-actions {
          display: flex;
          gap: 12px;
        }

        .work-item-board {
          display: flex;
          gap: 16px;
        }

        .board-columns {
          display: flex;
          gap: 16px;
          width: 100%;
        }

        .board-column {
          flex: 1;
          background: #f5f7fa;
          border-radius: 8px;
          overflow: hidden;
        }

        .column-header {
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          color: white;
        }

        .status-planned {
          background: #8c8c8c;
        }

        .status-committed {
          background: #00b42a;
        }

        .column-count {
          background: rgba(255, 255, 255, 0.3);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
        }

        .column-body {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 400px;
        }

        .work-item-card {
          background: white;
          border-radius: 6px;
          padding: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.3s;
        }

        .work-item-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .work-item-card.selected {
          border-left: 3px solid #00b42a;
          background: #f6ffed;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .card-body {
          margin-bottom: 12px;
        }

        .card-id {
          font-size: 12px;
          color: #00b42a;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .card-title {
          font-size: 14px;
          color: #1f2329;
          line-height: 1.5;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .estimate-badge {
          font-size: 12px;
          font-weight: 600;
          color: #00b42a;
          background: #f6ffed;
          padding: 2px 8px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
