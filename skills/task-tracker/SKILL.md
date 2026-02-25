---
name: task-tracker
description: 通过简单的基于文件的系统或 CLI 管理任务和问题。
metadata: { "openclaw": { "emoji": "📋", "requires": { "bins": ["echo", "grep", "sed"] } } }
---

# Task Management

Track issues and development tasks.

## Add Task

Create a new task with a priority.

```bash
# Usage: add-task <priority> <description>
echo "[ ] [PRIORITY] DESCRIPTION" >> tasks.md
```

## List Pending Tasks

Show what needs to be done.

```bash
grep "\[ \]" tasks.md
```

## Complete Task

Mark a task as done by its description or line number.

```bash
# Mark specific task as done (replace [ ] with [x])
sed -i '' 's/\[ \] \[HIGH\] Fix login bug/[x] [HIGH] Fix login bug/' tasks.md
```

## Prioritize

Move high priority tasks to the top.

```bash
sort -r tasks.md -o tasks.md
```
