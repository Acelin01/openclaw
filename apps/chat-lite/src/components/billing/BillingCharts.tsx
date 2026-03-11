/**
 * 计费结算图表组件
 * 支持：收入趋势、支出分析、收益分布
 */

import React from 'react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface LineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
    fill?: boolean;
  }[];
}

// ════════════════════════════════════════
// 收入趋势图
// ════════════════════════════════════════

export const IncomeTrendChart: React.FC<{
  data: LineChartData;
  height?: number;
}> = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.datasets.flatMap(d => d.data));
  const padding = 40;
  const chartWidth = 100;
  const chartHeight = height - padding * 2;

  const getY = (value: number) => {
    return chartHeight - (value / maxValue) * chartHeight;
  };

  const getX = (index: number) => {
    return (index / (data.labels.length - 1)) * chartWidth;
  };

  return (
    <div className="chart-container" style={{ height }}>
      <svg viewBox={`0 0 ${chartWidth + padding * 2} ${height}`} className="line-chart">
        {/* Y 轴 */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e0dbd0" strokeWidth="1" />
        
        {/* X 轴 */}
        <line x1={padding} y1={height - padding} x2={chartWidth + padding} y2={height - padding} stroke="#e0dbd0" strokeWidth="1" />

        {/* 数据线 */}
        {data.datasets.map((dataset, idx) => {
          const points = dataset.data.map((value, i) => `${getX(i)},${getY(value)}`).join(' ');
          const fillPath = `${padding},${height - padding} L ${points} L ${chartWidth + padding},${height - padding} Z`;
          
          return (
            <g key={idx}>
              {dataset.fill && (
                <path d={fillPath} fill={dataset.color} fillOpacity="0.1" />
              )}
              <polyline
                points={points}
                fill="none"
                stroke={dataset.color}
                strokeWidth="2"
                transform={`translate(${padding}, ${padding})`}
              />
              {dataset.data.map((value, i) => (
                <circle
                  key={i}
                  cx={getX(i) + padding}
                  cy={getY(value) + padding}
                  r="3"
                  fill={dataset.color}
                />
              ))}
            </g>
          );
        })}

        {/* X 轴标签 */}
        {data.labels.map((label, i) => (
          <text
            key={i}
            x={getX(i) + padding}
            y={height - padding + 15}
            textAnchor="middle"
            fontSize="8"
            fill="#8a857a"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
};

// ════════════════════════════════════════
// 收益分布环形图
// ════════════════════════════════════════

export const EarningsDonutChart: React.FC<{
  data: ChartData[];
  size?: number;
}> = ({ data, size = 200 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const radius = (size - 40) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let cumulativePercent = 0;

  return (
    <div className="chart-container" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="donut-chart">
        {data.map((item, idx) => {
          const percent = item.value / total;
          const strokeDasharray = `${percent * circumference} ${circumference}`;
          const strokeDashoffset = -cumulativePercent * circumference;
          cumulativePercent += percent;

          return (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={item.color || '#0d7c4b'}
              strokeWidth="12"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${center} ${center})`}
            />
          );
        })}
        
        {/* 中心文字 */}
        <text x={center} y={center - 10} textAnchor="middle" fontSize="18" fontWeight="700" fill="#1a1814">
          {total.toLocaleString()}
        </text>
        <text x={center} y={center + 10} textAnchor="middle" fontSize="10" fill="#8a857a">
          总收益
        </text>
      </svg>
    </div>
  );
};

// ════════════════════════════════════════
// 支出分类柱状图
// ════════════════════════════════════════

export const ExpenseBarChart: React.FC<{
  data: ChartData[];
  height?: number;
}> = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const barHeight = 24;
  const gap = 12;
  const chartHeight = data.length * (barHeight + gap);
  const chartWidth = 100;

  return (
    <div className="chart-container" style={{ height: chartHeight + 40 }}>
      <svg viewBox={`0 0 ${chartWidth + 80} ${chartHeight + 40}`} className="bar-chart">
        {data.map((item, idx) => {
          const barWidth = (item.value / maxValue) * chartWidth;
          const y = idx * (barHeight + gap);

          return (
            <g key={idx}>
              {/* 标签 */}
              <text
                x={0}
                y={y + barHeight / 2}
                dominantBaseline="middle"
                fontSize="10"
                fill="#3d3a35"
              >
                {item.label}
              </text>

              {/* 柱状条 */}
              <rect
                x={60}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={item.color || '#0d7c4b'}
                rx="3"
              />

              {/* 数值 */}
              <text
                x={60 + barWidth + 5}
                y={y + barHeight / 2}
                dominantBaseline="middle"
                fontSize="10"
                fill="#8a857a"
              >
                ¥{item.value.toLocaleString()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ════════════════════════════════════════
// 月度对比图
// ════════════════════════════════════════

export const MonthlyComparisonChart: React.FC<{
  months: string[];
  income: number[];
  expense: number[];
  height?: number;
}> = ({ months, income, expense, height = 200 }) => {
  const maxValue = Math.max(...income, ...expense);
  const padding = 40;
  const chartWidth = 100;
  const chartHeight = height - padding * 2;
  const barWidth = (chartWidth / months.length) * 0.35;

  const getY = (value: number) => {
    return chartHeight - (value / maxValue) * chartHeight;
  };

  const getX = (index: number) => {
    return (index / months.length) * chartWidth;
  };

  return (
    <div className="chart-container" style={{ height }}>
      <svg viewBox={`0 0 ${chartWidth + padding * 2} ${height}`} className="bar-chart">
        {/* Y 轴 */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e0dbd0" strokeWidth="1" />
        
        {/* X 轴 */}
        <line x1={padding} y1={height - padding} x2={chartWidth + padding} y2={height - padding} stroke="#e0dbd0" strokeWidth="1" />

        {months.map((month, i) => {
          const x = getX(i) + padding + barWidth / 2;
          const incomeHeight = getY(income[i]);
          const expenseHeight = getY(expense[i]);

          return (
            <g key={i}>
              {/* 收入柱 */}
              <rect
                x={x - barWidth - 2}
                y={incomeHeight + padding}
                width={barWidth}
                height={chartHeight - incomeHeight}
                fill="#0d7c4b"
                rx="2"
              />
              
              {/* 支出柱 */}
              <rect
                x={x + 2}
                y={expenseHeight + padding}
                width={barWidth}
                height={chartHeight - expenseHeight}
                fill="#c0392b"
                rx="2"
              />

              {/* 月份标签 */}
              <text
                x={x}
                y={height - padding + 15}
                textAnchor="middle"
                fontSize="8"
                fill="#8a857a"
              >
                {month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default {
  IncomeTrendChart,
  EarningsDonutChart,
  ExpenseBarChart,
  MonthlyComparisonChart,
};
