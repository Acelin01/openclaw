---
name: notion
description: 用于创建与管理页面、数据库和区块的 Notion API。
homepage: https://developers.notion.com
metadata:
  {
    "openclaw":
      { "emoji": "📝", "requires": { "env": ["NOTION_API_KEY"] }, "primaryEnv": "NOTION_API_KEY" },
  }
---

# notion

使用 Notion API 创建/读取/更新页面、数据源（数据库）与区块。

## 配置

1. 在 https://notion.so/my-integrations 创建集成
2. 复制 API Key（以 `ntn_` 或 `secret_` 开头）
3. 保存到本地：

```bash
mkdir -p ~/.config/notion
echo "ntn_your_key_here" > ~/.config/notion/api_key
```

4. 将目标页面/数据库分享给你的集成（点击 “...” → “Connect to” → 你的集成名称）

## API 基础

所有请求都需要：

```bash
NOTION_KEY=$(cat ~/.config/notion/api_key)
curl -X GET "https://api.notion.com/v1/..." \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json"
```

> **注意：** `Notion-Version` 请求头必填。本技能使用 `2025-09-03`（最新版）。在该版本中，数据库在 API 中称为 “data sources”。

## 常见操作

**搜索页面与数据源：**

```bash
curl -X POST "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{"query": "page title"}'
```

**获取页面：**

```bash
curl "https://api.notion.com/v1/pages/{page_id}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03"
```

**获取页面内容（区块）：**

```bash
curl "https://api.notion.com/v1/blocks/{page_id}/children" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03"
```

**在数据源中创建页面：**

```bash
curl -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"database_id": "xxx"},
    "properties": {
      "Name": {"title": [{"text": {"content": "New Item"}}]},
      "Status": {"select": {"name": "Todo"}}
    }
  }'
```

**查询数据源（数据库）：**

```bash
curl -X POST "https://api.notion.com/v1/data_sources/{data_source_id}/query" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {"property": "Status", "select": {"equals": "Active"}},
    "sorts": [{"property": "Date", "direction": "descending"}]
  }'
```

**创建数据源（数据库）：**

```bash
curl -X POST "https://api.notion.com/v1/data_sources" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"page_id": "xxx"},
    "title": [{"text": {"content": "My Database"}}],
    "properties": {
      "Name": {"title": {}},
      "Status": {"select": {"options": [{"name": "Todo"}, {"name": "Done"}]}},
      "Date": {"date": {}}
    }
  }'
```

**更新页面属性：**

```bash
curl -X PATCH "https://api.notion.com/v1/pages/{page_id}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"Status": {"select": {"name": "Done"}}}}'
```

**向页面添加区块：**

```bash
curl -X PATCH "https://api.notion.com/v1/blocks/{page_id}/children" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{
    "children": [
      {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"text": {"content": "Hello"}}]}}
    ]
  }'
```

## 属性类型

数据库条目的常见属性格式：

- **标题：** `{"title": [{"text": {"content": "..."}}]}`
- **富文本：** `{"rich_text": [{"text": {"content": "..."}}]}`
- **单选：** `{"select": {"name": "Option"}}`
- **多选：** `{"multi_select": [{"name": "A"}, {"name": "B"}]}`
- **日期：** `{"date": {"start": "2024-01-15", "end": "2024-01-16"}}`
- **复选框：** `{"checkbox": true}`
- **数字：** `{"number": 42}`
- **URL：** `{"url": "https://..."}`
- **邮箱：** `{"email": "a@b.com"}`
- **关联：** `{"relation": [{"id": "page_id"}]}`

## 2025-09-03 的关键变化

- **Databases → Data Sources：** 查询与获取使用 `/data_sources/` 端点
- **双 ID：** 每个数据库同时有 `database_id` 与 `data_source_id`
  - 创建页面使用 `database_id`（`parent: {"database_id": "..."}`）
  - 查询使用 `data_source_id`（`POST /v1/data_sources/{id}/query`）
- **搜索结果：** 数据库对象返回为 `"object": "data_source"`，包含 `data_source_id`
- **响应中的 parent：** 页面会同时返回 `parent.data_source_id` 与 `parent.database_id`
- **获取 data_source_id：** 搜索数据库或调用 `GET /v1/data_sources/{data_source_id}`

## 说明

- 页面/数据库 ID 为 UUID（可带或不带连字符）
- API 不能设置数据库视图过滤（仅 UI 支持）
- 速率限制：平均约 3 次/秒
- 创建数据源时可用 `is_inline: true` 以内嵌到页面
