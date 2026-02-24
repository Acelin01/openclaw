---
name: project-manager
description: 项目管理全流程：需求分析、任务拆解与进度跟踪。
metadata:
  {
    "openclaw":
      {
        "emoji": "🏗️",
        "requires": { "bins": ["mkdir", "touch", "cat", "grep", "sed", "awk", "jq"] },
        "ui": { "component": "project-manager-card", "source": "./ui/project-manager-card.tsx" },
      },
  }
---

# 项目经理 (Project Manager)

从需求到交付的全流程软件项目管理工具箱。

## 1. 初始化项目 (Initialize Project)

创建用于跟踪的项目目录结构。

```bash
mkdir -p .project/{requirements,tasks,backlog}
touch .project/status.md
echo "# 项目状态\n\n- [ ] 项目已初始化" > .project/status.md
```

## 2. 需求分析 (Analyze Requirement)

创建新的需求文档。

```bash
# 用法: analyze-req <功能名称> <描述>
# 示例: analyze-req "登录" "用户需要通过邮箱登录"
FILE=".project/requirements/$1.md"
echo "# 需求: $1" > "$FILE"
echo "\n描述: $2" >> "$FILE"
echo "\n## 验收标准" >> "$FILE"
echo "- [ ] " >> "$FILE"
```

## 3. 任务拆解与规划 (Plan Tasks)

将需求拆解为待办事项中的可执行任务。

```bash
# 用法: add-task <需求名称> <优先级> <任务描述>
# 示例: add-task "登录" "HIGH" "实现JWT逻辑"
REQ=$1
PRIO=$2
DESC=$3
ID=$(date +%s)
echo "$ID | [$PRIO] $DESC (关联需求: $REQ) | PENDING" >> .project/backlog/tasks.csv
```

## 4. 查看任务看板 (View Task Board)

按状态分组显示任务。

```bash
echo "--- 待处理 (PENDING) ---"
grep "PENDING" .project/backlog/tasks.csv | awk -F "|" '{print $2}'
echo "\n--- 进行中 (IN PROGRESS) ---"
grep "IN_PROGRESS" .project/backlog/tasks.csv | awk -F "|" '{print $2}'
echo "\n--- 已完成 (COMPLETED) ---"
grep "COMPLETED" .project/backlog/tasks.csv | awk -F "|" '{print $2}'
```

## 5. 获取项目数据 (Get Project JSON)

**[UI 专用]** 获取项目的完整 JSON 数据，用于前端组件渲染。

```bash
# 生成包含需求和任务的 JSON
echo "{"
echo "  \"requirements\": ["
for f in .project/requirements/*.md; do
  NAME=$(basename "$f" .md)
  CONTENT=$(cat "$f" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')
  echo "    { \"id\": \"$NAME\", \"content\": \"$CONTENT\" },"
done | sed '$ s/,$//'
echo "  ],"
echo "  \"tasks\": ["
while IFS="|" read -r id desc status; do
  # 清理空格
  id=$(echo "$id" | xargs)
  desc=$(echo "$desc" | xargs)
  status=$(echo "$status" | xargs)
  echo "    { \"id\": \"$id\", \"description\": \"$desc\", \"status\": \"$status\" },"
done < .project/backlog/tasks.csv | sed '$ s/,$//'
echo "  ]"
echo "}"
```

## 6. 开始任务 (Start Task)

将任务从"待处理"移动到"进行中"。

```bash
# 用法: start-task <关键词>
# 将第一个匹配的 PENDING 任务状态改为 IN_PROGRESS
sed -i '' "0,/PENDING/s//IN_PROGRESS/" .project/backlog/tasks.csv
```

## 7. 完成任务 (Complete Task)

将任务标记为"已完成"。

```bash
# 用法: complete-task <关键词>
sed -i '' "/$1/s/IN_PROGRESS/COMPLETED/" .project/backlog/tasks.csv
```

## 8. 生成报告 (Generate Report)

汇总项目进度。

```bash
TOTAL=$(wc -l < .project/backlog/tasks.csv)
DONE=$(grep -c "COMPLETED" .project/backlog/tasks.csv)
echo "进度: 完成了 $DONE / $TOTAL 个任务。"
```
