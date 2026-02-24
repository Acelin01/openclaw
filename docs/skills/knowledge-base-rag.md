---
title: "Knowledge Base (RAG)"
description: "Build a searchable knowledge base from your saved content"
---

You read articles, watch videos, and save links every day. This skill turns those inputs into a searchable knowledge base that other workflows can query on demand.

---

## I. Atomic Skill Library (Underlying Capabilities)

These are the smallest functional units used to build the knowledge base workflow.

| Atomic Skill    | Description               | Input Example            | Output Example         |
| --------------- | ------------------------- | ------------------------ | ---------------------- |
| `content_fetch` | Fetch content from a URL  | URL                      | Raw content            |
| `content_parse` | Extract text and metadata | Raw content              | Parsed text + metadata |
| `kb_ingest`     | Write chunks to the KB    | Text, metadata           | Chunk ids              |
| `kb_query`      | Semantic search over KB   | Query, filters           | Ranked results         |
| `kb_summarize`  | Summarize query results   | Results                  | Summary                |
| `message_send`  | Respond to the user       | Channel, target, message | Delivery result        |

---

## II. Composite Skills (Task-Oriented Advanced Tools)

Atomic skills are combined into end-to-end knowledge workflows.

### 1. Composite Skill: `knowledge_base_ingestion`

- **Skill Name**: `knowledge_base_ingestion`
- **Description**: Ingest a URL into the knowledge base with metadata.
- **Input Parameters**:
  ```json
  {
    "url": "https://example.com/article",
    "source": "telegram",
    "tags": ["agents", "memory"]
  }
  ```
- **Internal Execution Flow**:
  1. Call `content_fetch` to retrieve the content.
  2. Call `content_parse` to extract text and metadata.
  3. Call `kb_ingest` to store chunks with metadata.
  4. Call `message_send` with confirmation.
- **Output Results**:
  ```json
  {
    "ingested": true,
    "chunks": 18,
    "title": "Agent Memory Overview"
  }
  ```

### 2. Composite Skill: `knowledge_base_search`

- **Skill Name**: `knowledge_base_search`
- **Description**: Search the knowledge base and summarize findings.
- **Input Parameters**:
  ```json
  {
    "query": "agent memory patterns",
    "filters": { "tags": ["agents"] },
    "top_k": 5
  }
  ```
- **Internal Execution Flow**:
  1. Call `kb_query` with the query and filters.
  2. Call `kb_summarize` to synthesize key points.
  3. Call `message_send` with sources and excerpts.
- **Output Results**:
  ```json
  {
    "summary": "Top patterns include retention windows and retrieval anchors.",
    "sources": ["https://example.com/article"]
  }
  ```

### 3. Composite Skill: `knowledge_base_research_handoff`

- **Skill Name**: `knowledge_base_research_handoff`
- **Description**: Provide KB context to downstream workflows.
- **Input Parameters**:
  ```json
  {
    "workflow": "video-ideas",
    "topic": "agent memory"
  }
  ```
- **Internal Execution Flow**:
  1. Call `kb_query` for relevant context.
  2. Call `kb_summarize` into research notes.
  3. Return notes to the downstream workflow.
- **Output Results**:
  ```json
  {
    "notes": "Three sources highlight memory compaction tradeoffs."
  }
  ```

---

## III. Setup

1. Install the knowledge-base skill from ClawHub.
2. Create a Telegram topic called "knowledge-base".
3. Prompt OpenClaw:

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

## IV. Key Insights

- Consistent metadata improves retrieval accuracy.
- Short confirmation replies build trust and visibility.
- KB context reduces repeated research work.

---

## Related Links

- [Skills](/tools/skills)
- [Telegram](/channels/telegram)
