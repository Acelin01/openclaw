---
title: "Dynamic Dashboard with Subagent Spawning"
description: "Parallel subagents collect metrics and publish live dashboards"
---

Static dashboards go stale fast. This workflow uses subagents to fetch data in parallel, merge results, and publish a live dashboard on a schedule.

---

## I. Atomic Skill Library (Underlying Capabilities)

These are the smallest functional units used to build the dashboard pipeline.

| Atomic Skill       | Description                      | Input Example            | Output Example  |
| ------------------ | -------------------------------- | ------------------------ | --------------- |
| `sessions_spawn`   | Create subagents per data source | Label, task description  | Subagent id     |
| `sessions_send`    | Dispatch tasks and follow-ups    | Label, message           | Delivery status |
| `data_fetch`       | Call APIs or scrape endpoints    | Source, query            | Raw data        |
| `metrics_store`    | Persist metrics to a database    | Table, payload           | Stored rows     |
| `metrics_query`    | Read recent/historical metrics   | Time range, filters      | Dataset         |
| `dashboard_render` | Render dashboard content         | Data, format             | Text/HTML       |
| `alert_evaluate`   | Check thresholds and triggers    | Rules, data              | Alerts list     |
| `message_send`     | Publish dashboard to a channel   | Channel, target, message | Delivery result |
| `cron_schedule`    | Run on a recurring cadence       | Interval, timezone       | Schedule id     |

---

## II. Composite Skills (Task-Oriented Advanced Tools)

Atomic skills are combined into end-to-end dashboard workflows.

### 1. Composite Skill: `dynamic_dashboard_bootstrap`

- **Skill Name**: `dynamic_dashboard_bootstrap`
- **Description**: Initialize subagents and define the metric map.
- **Input Parameters**:
  ```json
  {
    "sources": ["github", "social", "markets", "system"],
    "targets": ["#dashboard"],
    "refresh_interval_minutes": 15
  }
  ```
- **Internal Execution Flow**:
  1. Call `sessions_spawn` for each source.
  2. Send scoped tasks that define queries and collection cadence.
  3. Return subagent registry and collection plan.
- **Output Results**:
  ```json
  {
    "subagents": ["github-agent", "social-agent", "markets-agent", "system-agent"],
    "plan": "collect -> store -> render -> publish"
  }
  ```

### 2. Composite Skill: `dynamic_dashboard_collect`

- **Skill Name**: `dynamic_dashboard_collect`
- **Description**: Collect metrics in parallel and persist them.
- **Input Parameters**:
  ```json
  {
    "time_window": "last_15_minutes",
    "sources": ["github", "social", "markets", "system"]
  }
  ```
- **Internal Execution Flow**:
  1. Call `sessions_send` to trigger each subagent.
  2. Call `data_fetch` per source and normalize outputs.
  3. Call `metrics_store` to persist metrics.
- **Output Results**:
  ```json
  {
    "stored": true,
    "sources": ["github", "social", "markets", "system"]
  }
  ```

### 3. Composite Skill: `dynamic_dashboard_publish`

- **Skill Name**: `dynamic_dashboard_publish`
- **Description**: Render and publish the dashboard.
- **Input Parameters**:
  ```json
  {
    "format": "text",
    "channel": "telegram",
    "target": "@dashboard_room"
  }
  ```
- **Internal Execution Flow**:
  1. Call `metrics_query` for the latest window.
  2. Call `dashboard_render` for text or HTML output.
  3. Call `message_send` to publish the dashboard.
- **Output Results**:
  ```json
  {
    "delivered": true,
    "dashboard_id": "dash-2026-02-24-0800"
  }
  ```

### 4. Composite Skill: `dynamic_dashboard_alerts`

- **Skill Name**: `dynamic_dashboard_alerts`
- **Description**: Evaluate alert rules and notify on anomalies.
- **Input Parameters**:
  ```json
  {
    "rules": [
      { "metric": "github.stars", "change_gt": 50, "window": "1h" },
      { "metric": "system.cpu", "value_gt": 90 }
    ]
  }
  ```
- **Internal Execution Flow**:
  1. Call `metrics_query` for relevant windows.
  2. Call `alert_evaluate` to detect threshold breaches.
  3. Call `message_send` for alert notifications.
- **Output Results**:
  ```json
  {
    "alerts_sent": 1,
    "alerts": ["system.cpu > 90%"]
  }
  ```

---

## III. Example Metrics Schema

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

## IV. Prompt Template

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

## V. Key Insights

- Parallel subagents avoid rate limits and shorten refresh time.
- A shared schema keeps metrics consistent across sources.
- Render targets can be swapped without changing collection logic.

---

## Related Links

- [Subagents](/tools/subagents)
- [Cron jobs](/automation/cron-jobs)
- [Multi-agent concepts](/concepts/multi-agent)
