---
name: custom-morning-brief
description: 定制晨间简报的收集、生成与投递流程。用于需要每日信息汇总并自动发送时。
---

# 定制晨间简报

把早晨的 30 分钟“信息整理时间”变成一份即开即读的报告。该流程会定时生成个性化简报，并通过 Telegram 送达，让你起床后直接看到重点、更新与草稿内容。

---

## 一、原子技能库（底层能力）

这些原子技能构成晨间简报的基础能力。

| 原子技能           | 描述                           | 输入示例         | 输出示例           |
| ------------------ | ------------------------------ | ---------------- | ------------------ |
| `news_scan`        | 从配置的来源抓取新闻和市场更新 | 主题、区域       | 精选标题与链接     |
| `task_rollup`      | 汇总已接入任务系统的待办       | 项目标签、时间窗 | 带优先级的任务清单 |
| `calendar_digest`  | 汇总日历事件与冲突             | 日期范围         | 当日行程摘要       |
| `trend_watch`      | 追踪社交或市场趋势             | 关键词、来源     | 趋势列表与信号     |
| `draft_writer`     | 生成今日需要的草稿             | 主题列表、格式   | 脚本或提纲草稿     |
| `priority_planner` | 按影响力和紧迫度排序           | 任务清单、目标   | 排序后的行动列表   |
| `brief_formatter`  | 格式化简报用于发送             | 章节列表、语气   | 最终简报文本       |
| `message_send`     | 将简报发送至频道               | 渠道、目标、消息 | 投递结果           |

---

## 二、组合技能（面向任务的工作流）

组合技能将原子技能编排为一次调用即可完成的流程。

### 1. 组合技能：`morning_brief_build`

- **技能名称**：`morning_brief_build`
- **描述**：从来源、任务、日历与内容草稿中构建完整晨间简报。
- **输入参数**：
  ```json
  {
    "timezone": "America/Los_Angeles",
    "topics": ["AI", "startups", "product growth"],
    "include_sections": ["news", "calendar", "tasks", "ideas", "recommendations"],
    "draft_format": "script"
  }
  ```
- **内部执行流程**：
  1. 根据 `topics` 拉取新闻与趋势。
  2. 聚合今日任务与日历事件。
  3. 进行优先级排序并生成草稿内容。
  4. 输出紧凑可读的简报文本。
- **输出结果**：
  ```json
  {
    "title": "Morning Brief",
    "sections": [
      { "name": "Top News", "items": ["..."] },
      { "name": "Today Schedule", "items": ["..."] }
    ],
    "message": "Final formatted brief text"
  }
  ```

### 2. 组合技能：`morning_brief_schedule`

- **技能名称**：`morning_brief_schedule`
- **描述**：创建每日投递计划并绑定 Telegram 目标。
- **输入参数**：
  ```json
  {
    "time": "08:00",
    "timezone": "America/Los_Angeles",
    "channel": "telegram",
    "target": "123456789"
  }
  ```
- **内部执行流程**：
  1. 校验 Telegram 渠道与目标。
  2. 创建带投递的 cron 任务。
  3. 返回 job id 与下次执行时间。
- **输出结果**：
  ```json
  {
    "job_id": "cron_abc123",
    "next_run": "2026-02-24T08:00:00-08:00"
  }
  ```

### 3. 组合技能：`morning_brief_update`

- **技能名称**：`morning_brief_update`
- **描述**：更新简报偏好但不改变日程。
- **输入参数**：
  ```json
  {
    "topics": ["fintech", "AI"],
    "include_sections": ["news", "tasks", "ideas"]
  }
  ```
- **内部执行流程**：
  1. 更新共享记忆中的简报模板。
  2. 保持现有 cron 日程不变。
- **输出结果**：
  ```json
  {
    "updated": true,
    "template_version": "v3"
  }
  ```

---

## 三、OpenClaw 中的实现

使用 Telegram 进行投递，使用 Gateway cron 进行定时。

### 1. Telegram 渠道配置

完成 Telegram 配置并验证机器人能发送消息。

- [Telegram 渠道配置](/channels/telegram)
- [Message CLI](/cli/message)

测试投递：

```bash
openclaw message send --channel telegram \
  --target "123456789" \
  --message "Test: morning brief delivery"
```

### 2. 定时发送晨间简报

创建隔离会话的 cron 任务，每天早上发送到 Telegram。

```bash
openclaw cron add \
  --name "Morning brief" \
  --cron "0 8 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Create and deliver my morning brief with news, tasks, calendar, and ideas." \
  --deliver \
  --channel telegram \
  --to "123456789"
```

验证定时任务：

```bash
openclaw cron list
openclaw cron runs --id <job-id>
```

参考：

- [Cron jobs](/automation/cron-jobs)
- [Cron CLI](/cli/cron)

### 3. 自定义简报内容

给机器人发送更新请求调整模板：

```text
Update my morning brief:
- Focus topics on AI and product growth
- Include calendar, tasks, and content ideas
- Keep it under 12 bullets
```

---

## 四、推荐简报模板

```text
Good morning.

Top news:
1) ...
2) ...

Today schedule:
- ...

Top tasks:
1) ...
2) ...

Drafts to finish:
- ...

Recommendations:
- ...
```

---

## 五、为何有效

- 简报定时触发，保证按时送达。
- Telegram 投递轻量、移动端友好。
- 模板可持续调整，无需改动日程。
