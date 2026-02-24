# Custom Morning Brief

Turn the first 30 minutes of your morning into a ready-to-read report. This workflow schedules a personalized brief and delivers it to Telegram, so you wake up to priorities, updates, and draft content already prepared.

---

## I. Atomic Skill Library (Underlying Capabilities)

These atomic skills are the building blocks for a morning brief workflow.

| Atomic Skill       | Description                                           | Input Example            | Output Example               |
| ------------------ | ----------------------------------------------------- | ------------------------ | ---------------------------- |
| `news_scan`        | Pulls news and market updates from configured sources | Topics, regions          | Curated headlines with links |
| `task_rollup`      | Aggregates tasks from connected task tools            | Project tags, due window | Task list with priorities    |
| `calendar_digest`  | Summarizes calendar events and conflicts              | Date range               | Daily schedule summary       |
| `trend_watch`      | Tracks social or market trends                        | Keywords, sources        | Trend list with signals      |
| `draft_writer`     | Writes drafts for the day                             | Topic list, format       | Draft scripts or outlines    |
| `priority_planner` | Ranks items by impact and urgency                     | Task list, objectives    | Ordered action list          |
| `brief_formatter`  | Formats the brief for delivery                        | Section list, tone       | Final brief text             |
| `message_send`     | Sends the brief to a channel                          | Channel, target, message | Delivery result              |

---

## II. Composite Skills (Task Oriented Workflows)

Composite skills orchestrate the atomic skills so the agent can produce and deliver a full brief with one call.

### 1. Composite Skill: `morning_brief_build`

- **Skill Name**: `morning_brief_build`
- **Description**: Build a complete morning brief from sources, tasks, calendar, and content drafts.
- **Input Parameters**:
  ```json
  {
    "timezone": "America/Los_Angeles",
    "topics": ["AI", "startups", "product growth"],
    "include_sections": ["news", "calendar", "tasks", "ideas", "recommendations"],
    "draft_format": "script"
  }
  ```
- **Internal Execution Flow**:
  1. Pull news and trends based on `topics`.
  2. Aggregate tasks and calendar for the day.
  3. Rank priorities and generate draft content.
  4. Format the brief into a compact message.
- **Output Results**:
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

### 2. Composite Skill: `morning_brief_schedule`

- **Skill Name**: `morning_brief_schedule`
- **Description**: Schedule daily delivery and bind a Telegram target.
- **Input Parameters**:
  ```json
  {
    "time": "08:00",
    "timezone": "America/Los_Angeles",
    "channel": "telegram",
    "target": "123456789"
  }
  ```
- **Internal Execution Flow**:
  1. Validate the Telegram channel and target.
  2. Create a cron job with delivery enabled.
  3. Confirm the job id and next run.
- **Output Results**:
  ```json
  {
    "job_id": "cron_abc123",
    "next_run": "2026-02-24T08:00:00-08:00"
  }
  ```

### 3. Composite Skill: `morning_brief_update`

- **Skill Name**: `morning_brief_update`
- **Description**: Update brief preferences without changing the schedule.
- **Input Parameters**:
  ```json
  {
    "topics": ["fintech", "AI"],
    "include_sections": ["news", "tasks", "ideas"]
  }
  ```
- **Internal Execution Flow**:
  1. Update the brief template stored in shared memory.
  2. Keep the existing cron schedule intact.
- **Output Results**:
  ```json
  {
    "updated": true,
    "template_version": "v3"
  }
  ```

---

## III. Implementation in OpenClaw

Use Telegram for delivery and Gateway cron for scheduling.

### 1. Telegram channel setup

Follow the Telegram channel configuration and verify the bot can send messages.

- [Telegram channel setup](/channels/telegram)
- [Message CLI](/cli/message)

Test delivery:

```bash
openclaw message send --channel telegram \
  --target "123456789" \
  --message "Test: morning brief delivery"
```

### 2. Schedule the daily brief

Create an isolated cron job that runs every morning and delivers to Telegram.

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

Verify the schedule:

```bash
openclaw cron list
openclaw cron runs --id <job-id>
```

References:

- [Cron jobs](/automation/cron-jobs)
- [Cron CLI](/cli/cron)

### 3. Customize the brief

Send an update request to your bot to adjust the template:

```text
Update my morning brief:
- Focus topics on AI and product growth
- Include calendar, tasks, and content ideas
- Keep it under 12 bullets
```

---

## IV. Suggested Brief Template

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

## V. Why It Works

- The brief is scheduled, so it arrives on time every day.
- Telegram delivery keeps it lightweight and mobile friendly.
- The template can evolve without touching the schedule.
