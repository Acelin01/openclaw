---
name: calendar-assistant
description: 面向交付团队的项目日历聚合与任务跟踪。用于需要汇总日历、同步任务并输出简报与预警时。
---

# 项目日历与待办助手

项目交付涉及会议、里程碑、发布窗口与跨团队依赖。该技能把 OpenClaw 变成项目助手，聚合项目日历、跟踪待办与状态，并在团队频道输出简报与预警。

---

## 一、原子技能库（基础能力）

这些是构建项目助手流程的最小功能单元。

| 原子技能          | 描述         | 输入示例                 | 输出示例        |
| ----------------- | ------------ | ------------------------ | --------------- |
| `calendar_fetch`  | 拉取项目日历 | Calendar ids, time range | Event list      |
| `task_sync`       | 同步任务     | Project id, filters      | Task list       |
| `task_update`     | 更新任务状态 | Task id, status          | Updated task    |
| `risk_scan`       | 识别进度风险 | Events, tasks            | Risk list       |
| `briefing_render` | 渲染简报     | Events, tasks            | Summary text    |
| `alert_send`      | 发送提醒     | Channel, message         | Delivery result |
| `cron_schedule`   | 周期调度     | Interval, timezone       | Schedule id     |

---

## 二、组合技能（面向任务的高级工具）

原子技能组合成端到端的项目工作流。

### 1. 组合技能：`project_calendar_briefing`

- **技能名称**：`project_calendar_briefing`
- **描述**：生成每日项目日历与任务简报。
- **输入参数**：
  ```json
  {
    "project_name": "Gateway Revamp",
    "calendar_ids": ["eng-release", "product-sync"],
    "task_filters": { "status": ["todo", "in_progress"] },
    "timezone": "Asia/Shanghai"
  }
  ```
- **内部执行流程**：
  1. 调用 `calendar_fetch` 拉取项目事件。
  2. 调用 `task_sync` 获取进行中任务。
  3. 调用 `risk_scan` 识别冲突或延期风险。
  4. 调用 `briefing_render` 输出简报。
- **输出结果**：
  ```json
  {
    "briefing": "Today: Release sync 10:00; 6 tasks active; 2 at risk.",
    "risks": ["API freeze overdue by 2 days"]
  }
  ```

### 2. 组合技能：`project_task_tracking`

- **技能名称**：`project_task_tracking`
- **描述**：跟踪任务进度并映射到日历节奏。
- **输入参数**：
  ```json
  {
    "project_id": "gateway-revamp",
    "update_rules": [
      { "status": "in_progress", "calendar_tag": "active" },
      { "status": "blocked", "calendar_tag": "risk" }
    ]
  }
  ```
- **内部执行流程**：
  1. 调用 `task_sync` 拉取任务状态。
  2. 调用 `task_update` 应用状态规则。
  3. 调用 `calendar_fetch` 标注关键节点。
  4. 调用 `briefing_render` 汇总变化。
- **输出结果**：
  ```json
  {
    "updated_tasks": 12,
    "summary": "2 tasks blocked, 4 moved to in_progress"
  }
  ```

### 3. 组合技能：`project_alerts`

- **技能名称**：`project_alerts`
- **描述**：在任务或里程碑触发风险时通知负责人。
- **输入参数**：
  ```json
  {
    "thresholds": [
      { "metric": "overdue_tasks", "value_gt": 3 },
      { "metric": "milestone_slip_days", "value_gt": 2 }
    ],
    "channel": "@project-updates"
  }
  ```
- **内部执行流程**：
  1. 调用 `task_sync` 获取逾期任务。
  2. 调用 `risk_scan` 计算里程碑风险。
  3. 调用 `alert_send` 发布提醒。
- **输出结果**：
  ```json
  {
    "alerts_sent": 1,
    "alerts": ["Milestone M2 slipped by 3 days"]
  }
  ```

---

## 三、配置模板

```text
Run a daily project briefing at 09:00.
Aggregate calendars: eng-release, product-sync.
Track tasks from the gateway-revamp project.
Post the briefing to @project-updates.
Alert if overdue tasks > 3 or milestone slip > 2 days.
```

---

## 四、关键要点

- 日历与任务统一视图减少上下文切换。
- 风险预警在节点滑坡前可及时干预。
- 固定节奏的简报让团队保持同步。

---

## 相关链接

- [Cron jobs](/automation/cron-jobs)
- [Sessions](/cli/sessions)
- [Message CLI](/cli/message)
