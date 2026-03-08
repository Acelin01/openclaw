import React from 'react';

interface WorkStatisticsProps {
  data?: {
    project_id?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string;
    total_hours?: number;
    completed_tasks?: number;
    total_tasks?: number;
    daily_hours?: Array<{ date: string; hours: number }>;
    task_distribution?: Array<{ type: string; count: number }>;
  };
}

export function WorkStatistics({ data }: WorkStatisticsProps) {
  const totalHours = data?.total_hours || 120;
  const completedTasks = data?.completed_tasks || 45;
  const totalTasks = data?.total_tasks || 60;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="work-statistics">
      {/* 头部 */}
      <div className="stats-header">
        <h2 className="stats-title">工时统计</h2>
        {data?.start_date && data?.end_date && (
          <div className="date-range">
            <span>{data.start_date} ~ {data.end_date}</span>
          </div>
        )}
      </div>

      {/* 概览卡片 */}
      <div className="overview-cards">
        <div className="stat-card">
          <div className="card-icon hours">📊</div>
          <div className="card-content">
            <div className="card-label">总工时</div>
            <div className="card-value">{totalHours}h</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-icon tasks">✅</div>
          <div className="card-content">
            <div className="card-label">完成任务</div>
            <div className="card-value">{completedTasks}/{totalTasks}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-icon rate">📈</div>
          <div className="card-content">
            <div className="card-label">完成率</div>
            <div className="card-value">{completionRate}%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-icon avg">⏱️</div>
          <div className="card-content">
            <div className="card-label">日均工时</div>
            <div className="card-value">{Math.round(totalHours / 30)}h</div>
          </div>
        </div>
      </div>

      {/* 工时趋势 */}
      <div className="chart-section">
        <h3 className="chart-title">工时趋势</h3>
        <div className="chart-container">
          <div className="bar-chart">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="bar-item">
                <div
                  className="bar"
                  style={{ height: `${Math.random() * 60 + 40}%` }}
                ></div>
                <div className="bar-label">周{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 任务分布 */}
      <div className="distribution-section">
        <h3 className="section-title">任务分布</h3>
        <div className="distribution-list">
          <div className="distribution-item">
            <span className="dist-label">需求</span>
            <div className="dist-bar">
              <div className="dist-fill" style={{ width: '40%' }}></div>
            </div>
            <span className="dist-value">40%</span>
          </div>
          <div className="distribution-item">
            <span className="dist-label">任务</span>
            <div className="dist-bar">
              <div className="dist-fill" style={{ width: '35%' }}></div>
            </div>
            <span className="dist-value">35%</span>
          </div>
          <div className="distribution-item">
            <span className="dist-label">缺陷</span>
            <div className="dist-bar">
              <div className="dist-fill" style={{ width: '15%' }}></div>
            </div>
            <span className="dist-value">15%</span>
          </div>
          <div className="distribution-item">
            <span className="dist-label">其他</span>
            <div className="dist-bar">
              <div className="dist-fill" style={{ width: '10%' }}></div>
            </div>
            <span className="dist-value">10%</span>
          </div>
        </div>
      </div>

      {/* 样式 */}
      <style>{`
        .work-statistics {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 24px;
        }

        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #00b42a;
        }

        .stats-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2329;
          margin: 0;
        }

        .date-range {
          font-size: 14px;
          color: #646a73;
        }

        .overview-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%);
          border-radius: 8px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 180, 42, 0.15);
        }

        .card-icon {
          font-size: 32px;
        }

        .card-content {
          flex: 1;
        }

        .card-label {
          font-size: 13px;
          color: #646a73;
          margin-bottom: 4px;
        }

        .card-value {
          font-size: 24px;
          font-weight: 600;
          color: #00b42a;
        }

        .chart-section,
        .distribution-section {
          margin-bottom: 32px;
        }

        .chart-title,
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2329;
          margin-bottom: 16px;
        }

        .chart-container {
          background: #f5f7fa;
          border-radius: 8px;
          padding: 24px;
        }

        .bar-chart {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          height: 200px;
          gap: 16px;
        }

        .bar-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .bar {
          width: 100%;
          background: linear-gradient(180deg, #00b42a 0%, #23c343 100%);
          border-radius: 4px 4px 0 0;
          transition: all 0.3s;
        }

        .bar:hover {
          opacity: 0.8;
        }

        .bar-label {
          font-size: 12px;
          color: #646a73;
        }

        .distribution-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .distribution-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .dist-label {
          width: 60px;
          font-size: 14px;
          color: #1f2329;
        }

        .dist-bar {
          flex: 1;
          height: 20px;
          background: #f0f2f5;
          border-radius: 10px;
          overflow: hidden;
        }

        .dist-fill {
          height: 100%;
          background: linear-gradient(90deg, #00b42a 0%, #23c343 100%);
          border-radius: 10px;
          transition: width 0.3s;
        }

        .dist-value {
          width: 50px;
          text-align: right;
          font-size: 14px;
          font-weight: 600;
          color: #00b42a;
        }

        @media (max-width: 768px) {
          .overview-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
