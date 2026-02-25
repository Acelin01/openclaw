---
name: todoist-task-manager
description: 通过 Todoist 提升代理任务可见性
---

# Todoist 任务管理器

长时间运行的代理任务很容易变得不透明。该技能把任务计划、进度日志与状态变更同步到 Todoist，帮助用户实时掌握执行情况。

---

## 一、原子技能库（基础能力）

这些是构建任务可见性流程的最小功能单元。

| 原子技能              | 描述              | 输入示例         | 输出示例     |
| --------------------- | ----------------- | ---------------- | ------------ |
| `todoist_task_create` | 创建 Todoist 任务 | Content, project | Task id      |
| `todoist_task_update` | 更新任务元数据    | Task id, section | Updated task |
| `todoist_comment_add` | 添加进度评论      | Task id, text    | Comment id   |
| `plan_capture`        | 记录计划          | Plan text        | Plan block   |
| `status_stream`       | 记录步骤进度      | Step result      | Update       |
| `heartbeat_check`     | 检测停滞          | Task id, SLA     | Alert        |

---

## 二、组合技能（面向任务的高级工具）

原子技能组合成端到端的可见性工作流。

### 1. 组合技能：`todoist_task_visibility`

- **技能名称**：`todoist_task_visibility`
- **描述**：创建任务并持续同步进度。
- **输入参数**：
  ```json
  {
    "task_title": "Build reporting dashboard",
    "plan": "Define schema → build API → ship UI",
    "section": "In Progress"
  }
  ```
- **内部执行流程**：
  1. 调用 `plan_capture` 格式化计划。
  2. 调用 `todoist_task_create` 创建任务。
  3. 调用 `todoist_comment_add` 记录步骤完成情况。
  4. 调用 `todoist_task_update` 更新状态。
- **输出结果**：
  ```json
  {
    "task_id": "task_123",
    "status": "in_progress"
  }
  ```

### 2. 组合技能：`todoist_stall_monitor`

- **技能名称**：`todoist_stall_monitor`
- **描述**：检测任务停滞并提醒。
- **输入参数**：
  ```json
  {
    "task_id": "task_123",
    "sla_minutes": 45
  }
  ```
- **内部执行流程**：
  1. 调用 `heartbeat_check` 检测无更新时长。
  2. 调用 `todoist_comment_add` 发送状态提示。
  3. 如有停滞，通知用户。
- **输出结果**：
  ```json
  {
    "stalled": true,
    "last_update_minutes": 62
  }
  ```

---

## 三、配置步骤

1. 创建 Todoist 项目和区块：In Progress、Waiting、Done。
2. 准备 Todoist API 脚本或安装对应技能。
3. 提示 OpenClaw：

```text
For every complex task:
1. Create a Todoist task in In Progress with my plan.
2. Add a comment for each step you finish.
3. Move the task to Done when complete.

If no updates for 45 minutes, alert me and post a status check comment.
```

---

## 四、关键要点

- 计划外显提高透明度与信任。
- 评论流展示实时进度。
- 心跳检测避免无声停滞。

---

## 相关链接

- [Todoist REST API Documentation](https://developer.todoist.com/rest/v2/)
