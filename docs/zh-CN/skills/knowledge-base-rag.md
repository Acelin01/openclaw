---
title: "知识库（RAG）"
description: "从保存内容构建可检索的知识库"
---

你每天会阅读文章、视频和链接。该技能把这些内容统一收集并构建可搜索的知识库，为后续研究与写作提供支持。

---

## 一、原子技能库（基础能力）

这些是构建知识库流程的最小功能单元。

| 原子技能        | 描述             | 输入示例                 | 输出示例               |
| --------------- | ---------------- | ------------------------ | ---------------------- |
| `content_fetch` | 抓取链接内容     | URL                      | Raw content            |
| `content_parse` | 解析文本与元数据 | Raw content              | Parsed text + metadata |
| `kb_ingest`     | 写入知识库       | Text, metadata           | Chunk ids              |
| `kb_query`      | 语义检索         | Query, filters           | Ranked results         |
| `kb_summarize`  | 汇总检索结果     | Results                  | Summary                |
| `message_send`  | 回复用户         | Channel, target, message | Delivery result        |

---

## 二、组合技能（面向任务的高级工具）

原子技能组合成端到端的知识库工作流。

### 1. 组合技能：`knowledge_base_ingestion`

- **技能名称**：`knowledge_base_ingestion`
- **描述**：将链接内容带元数据写入知识库。
- **输入参数**：
  ```json
  {
    "url": "https://example.com/article",
    "source": "telegram",
    "tags": ["agents", "memory"]
  }
  ```
- **内部执行流程**：
  1. 调用 `content_fetch` 获取内容。
  2. 调用 `content_parse` 提取文本与元数据。
  3. 调用 `kb_ingest` 写入分块。
  4. 调用 `message_send` 返回确认。
- **输出结果**：
  ```json
  {
    "ingested": true,
    "chunks": 18,
    "title": "Agent Memory Overview"
  }
  ```

### 2. 组合技能：`knowledge_base_search`

- **技能名称**：`knowledge_base_search`
- **描述**：检索知识库并输出摘要与来源。
- **输入参数**：
  ```json
  {
    "query": "agent memory patterns",
    "filters": { "tags": ["agents"] },
    "top_k": 5
  }
  ```
- **内部执行流程**：
  1. 调用 `kb_query` 检索相关内容。
  2. 调用 `kb_summarize` 生成关键摘要。
  3. 调用 `message_send` 输出摘要与来源。
- **输出结果**：
  ```json
  {
    "summary": "Top patterns include retention windows and retrieval anchors.",
    "sources": ["https://example.com/article"]
  }
  ```

### 3. 组合技能：`knowledge_base_research_handoff`

- **技能名称**：`knowledge_base_research_handoff`
- **描述**：为下游工作流提供知识库上下文。
- **输入参数**：
  ```json
  {
    "workflow": "video-ideas",
    "topic": "agent memory"
  }
  ```
- **内部执行流程**：
  1. 调用 `kb_query` 获取相关内容。
  2. 调用 `kb_summarize` 生成研究笔记。
  3. 返回给下游流程。
- **输出结果**：
  ```json
  {
    "notes": "Three sources highlight memory compaction tradeoffs."
  }
  ```

---

## 三、配置步骤

1. 从 ClawHub 安装 knowledge-base 技能。
2. 创建 Telegram 话题 “knowledge-base”。
3. 提示 OpenClaw：

```text
When I drop a URL in the "knowledge-base" topic:
1. Fetch the content (article, tweet, YouTube transcript, PDF)
2. Ingest it into the knowledge base with metadata (title, URL, date, type)
3. Reply with confirmation: what was ingested and chunk count

When I ask a question in this topic:
1. Search the knowledge base semantically
2. Return top results with sources and relevant excerpts
3. If no good matches, tell me

Also: when other workflows need research, query the knowledge base for relevant saved content.
```

---

## 四、关键要点

- 统一元数据可显著提升检索准确性。
- 简洁确认回复能建立可见性与信任。
- 共享知识库能减少重复研究成本。

---

## 相关链接

- [Skills](/tools/skills)
- [Telegram](/channels/telegram)
