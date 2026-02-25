---
name: session-logs
description: 使用 jq 搜索和分析自己的会话日志（更早/父级对话）。
metadata: { "openclaw": { "emoji": "📜", "requires": { "bins": ["jq", "rg"] } } }
---

# session-logs

在会话 JSONL 文件中搜索完整对话历史。用户提到更早/父级对话或询问之前内容时使用。

## 触发条件

当用户询问历史聊天、父级对话或记忆文件中不存在的上下文时使用。

## 位置

会话日志路径：`~/.openclaw/agents/<agentId>/sessions/`（`agent=<id>` 取系统提示的 Runtime 行）。

- **`sessions.json`** - 会话键到会话 ID 的索引
- **`<session-id>.jsonl`** - 每个会话的完整对话记录

## 结构

每个 `.jsonl` 文件包含以下字段：

- `type`："session"（元数据）或 "message"
- `timestamp`：ISO 时间戳
- `message.role`："user"、"assistant" 或 "toolResult"
- `message.content[]`：文本、思考或工具调用（过滤 `type=="text"` 获取可读内容）
- `message.usage.cost.total`：每次响应成本

## 常用查询

### 按日期与大小列出所有会话

```bash
for f in ~/.openclaw/agents/<agentId>/sessions/*.jsonl; do
  date=$(head -1 "$f" | jq -r '.timestamp' | cut -dT -f1)
  size=$(ls -lh "$f" | awk '{print $5}')
  echo "$date $size $(basename $f)"
done | sort -r
```

### 查找指定日期的会话

```bash
for f in ~/.openclaw/agents/<agentId>/sessions/*.jsonl; do
  head -1 "$f" | jq -r '.timestamp' | grep -q "2026-01-06" && echo "$f"
done
```

### 提取会话中的用户消息

```bash
jq -r 'select(.message.role == "user") | .message.content[]? | select(.type == "text") | .text' <session>.jsonl
```

### 在助手回复中搜索关键词

```bash
jq -r 'select(.message.role == "assistant") | .message.content[]? | select(.type == "text") | .text' <session>.jsonl | rg -i "keyword"
```

### 获取会话总成本

```bash
jq -s '[.[] | .message.usage.cost.total // 0] | add' <session>.jsonl
```

### 按天汇总成本

```bash
for f in ~/.openclaw/agents/<agentId>/sessions/*.jsonl; do
  date=$(head -1 "$f" | jq -r '.timestamp' | cut -dT -f1)
  cost=$(jq -s '[.[] | .message.usage.cost.total // 0] | add' "$f")
  echo "$date $cost"
done | awk '{a[$1]+=$2} END {for(d in a) print d, "$"a[d]}' | sort -r
```

### 统计会话消息与 token 数量

```bash
jq -s '{
  messages: length,
  user: [.[] | select(.message.role == "user")] | length,
  assistant: [.[] | select(.message.role == "assistant")] | length,
  first: .[0].timestamp,
  last: .[-1].timestamp
}' <session>.jsonl
```

### 工具使用统计

```bash
jq -r '.message.content[]? | select(.type == "toolCall") | .name' <session>.jsonl | sort | uniq -c | sort -rn
```

### 在所有会话中搜索短语

```bash
rg -l "phrase" ~/.openclaw/agents/<agentId>/sessions/*.jsonl
```

## 提示

- 会话为追加式 JSONL（每行一个 JSON 对象）
- 大会话可能数 MB，建议用 `head`/`tail` 取样
- `sessions.json` 索引会将聊天渠道（discord、whatsapp 等）映射到会话 ID
- 删除的会话带 `.deleted.<timestamp>` 后缀

## 快速文本提取（低噪声）

```bash
jq -r 'select(.type=="message") | .message.content[]? | select(.type=="text") | .text' ~/.openclaw/agents/<agentId>/sessions/<id>.jsonl | rg 'keyword'
```
