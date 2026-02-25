---
name: dynamic-dashboard
description: 并行子代理采集指标并按计划发布仪表板。用于需要持续更新指标与告警时。
---

# 子代理动态仪表板

静态仪表板很快过期。本工作流使用子代理并行采集数据、合并结果，并按计划发布动态仪表板。

---

## 一、原子技能库（基础能力）

这些是构建动态仪表板的最小功能单元。

| 原子技能           | 描述                | 输入示例                 | 输出示例        |
| ------------------ | ------------------- | ------------------------ | --------------- |
| `sessions_spawn`   | 为数据源创建子代理  | Label, task description  | Subagent id     |
| `sessions_send`    | 分派任务与追踪更新  | Label, message           | Delivery status |
| `data_fetch`       | 调用 API 或抓取数据 | Source, query            | Raw data        |
| `metrics_store`    | 写入指标数据        | Table, payload           | Stored rows     |
| `metrics_query`    | 查询历史指标        | Time range, filters      | Dataset         |
| `dashboard_render` | 渲染仪表板内容      | Data, format             | Text/HTML       |
| `alert_evaluate`   | 检查阈值与异常      | Rules, data              | Alerts list     |
| `message_send`     | 发布仪表板          | Channel, target, message | Delivery result |
| `cron_schedule`    | 周期调度            | Interval, timezone       | Schedule id     |

---

## 二、组合技能（面向任务的高级工具）

原子技能组合成端到端的仪表板工作流。

### 1. 组合技能：`dynamic_dashboard_bootstrap`

- **技能名称**：`dynamic_dashboard_bootstrap`
- **描述**：初始化子代理并定义指标地图。
- **输入参数**：
  ```json
  {
    "sources": ["github", "social", "markets", "system"],
    "targets": ["#dashboard"],
    "refresh_interval_minutes": 15
  }
  ```
- **内部执行流程**：
  1. 调用 `sessions_spawn` 为每个数据源创建子代理。
  2. 下发采集任务与节奏约束。
  3. 返回子代理列表与采集计划。
- **输出结果**：
  ```json
  {
    "subagents": ["github-agent", "social-agent", "markets-agent", "system-agent"],
    "plan": "collect -> store -> render -> publish"
  }
  ```

### 2. 组合技能：`dynamic_dashboard_collect`

- **技能名称**：`dynamic_dashboard_collect`
- **描述**：并行采集指标并写入存储。
- **输入参数**：
  ```json
  {
    "time_window": "last_15_minutes",
    "sources": ["github", "social", "markets", "system"]
  }
  ```
- **内部执行流程**：
  1. 调用 `sessions_send` 触发子代理采集。
  2. 调用 `data_fetch` 拉取并规范化结果。
  3. 调用 `metrics_store` 写入数据库。
- **输出结果**：
  ```json
  {
    "stored": true,
    "sources": ["github", "social", "markets", "system"]
  }
  ```

### 3. 组合技能：`dynamic_dashboard_publish`

- **技能名称**：`dynamic_dashboard_publish`
- **描述**：渲染并发布仪表板。
- **输入参数**：
  ```json
  {
    "format": "text",
    "channel": "telegram",
    "target": "@dashboard_room"
  }
  ```
- **内部执行流程**：
  1. 调用 `metrics_query` 获取最新时间窗数据。
  2. 调用 `dashboard_render` 生成文本或 HTML。
  3. 调用 `message_send` 发布仪表板。
- **输出结果**：
  ```json
  {
    "delivered": true,
    "dashboard_id": "dash-2026-02-24-0800"
  }
  ```

### 4. 组合技能：`dynamic_dashboard_alerts`

- **技能名称**：`dynamic_dashboard_alerts`
- **描述**：评估告警规则并通知异常。
- **输入参数**：
  ```json
  {
    "rules": [
      { "metric": "github.stars", "change_gt": 50, "window": "1h" },
      { "metric": "system.cpu", "value_gt": 90 }
    ]
  }
  ```
- **内部执行流程**：
  1. 调用 `metrics_query` 获取相关窗口数据。
  2. 调用 `alert_evaluate` 检测阈值越界。
  3. 调用 `message_send` 投递告警。
- **输出结果**：
  ```json
  {
    "alerts_sent": 1,
    "alerts": ["system.cpu > 90%"]
  }
  ```

---

## 三、指标表结构示例

```sql
CREATE TABLE metrics (
  id SERIAL PRIMARY KEY,
  source TEXT,
  metric_name TEXT,
  metric_value NUMERIC,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  source TEXT,
  condition TEXT,
  threshold NUMERIC,
  last_triggered TIMESTAMPTZ
);
```

---

## 四、提示模板

```text
Build a dynamic dashboard powered by subagents.

Sources: GitHub, social mentions, market volume, system health.
Cadence: every 15 minutes.
Store metrics in the database and publish a text dashboard to @dashboard_room.
Alert rules:
- GitHub stars change > 50 in 1 hour
- CPU > 90%
```

---

## 五、关键要点

- 并行子代理减少等待与速率限制影响。
- 统一指标结构便于扩展新数据源。
- 发布方式可替换而不影响采集逻辑。

---

## 相关链接

- [Subagents](/tools/subagents)
- [Cron jobs](/automation/cron-jobs)
- [Multi-agent concepts](/concepts/multi-agent)
