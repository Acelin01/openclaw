---
name: uxin-mcp
description: 综合项目管理工具，支持项目创建、任务管理、团队协作、里程碑追踪、需求管理、缺陷追踪、风险管理、文档管理及自由职业者服务管理。
homepage: http://localhost:8000
metadata:
  {
    "openclaw":
      {
        "emoji": "📋",
        "ui": { "package": "openclaw-uxin-mcp-client", "version": "latest" },
        "requires": { "bins": ["npx"], "env": ["UXIN_API_TOKEN"] },
        "primaryEnv": "UXIN_API_TOKEN",
        "install":
          [
            {
              "id": "npm",
              "kind": "npm",
              "package": "uxin-mcp",
              "bins": ["npx"],
              "label": "Install uxin-mcp (npm)",
            },
          ],
      },
  }
---

# uxin-mcp

综合项目管理 MCP 服务器，提供完整的项目生命周期管理能力。

## 配置

### 方式一：使用 API Token（推荐）

在 MCP 配置文件中添加：

```json
{
  "mcpServers": {
    "uxin-mcp": {
      "command": "npx",
      "args": [
        "tsx",
        "/Users/acelin/Documents/Next/AIGC/openclaw/apps/api/src/mcp-server/index.ts"
      ],
      "env": {
        "UXIN_API_TOKEN": "<your-jwt-token>",
        "API_BASE_URL": "http://localhost:8000"
      }
    }
  }
}
```

### 方式二：使用用户 ID 和服务密钥

```json
{
  "mcpServers": {
    "uxin-mcp": {
      "command": "npx",
      "args": [
        "tsx",
        "/Users/acelin/Documents/Next/AIGC/openclaw/apps/api/src/mcp-server/index.ts"
      ],
      "env": {
        "UXIN_API_TOKEN": "uxin-service-secret-123",
        "UXIN_USER_ID": "admin-user-id",
        "API_BASE_URL": "http://localhost:8000"
      }
    }
  }
}
```

### 配置说明

| 环境变量         | 必填 | 说明                                           |
| ---------------- | ---- | ---------------------------------------------- |
| `UXIN_API_TOKEN` | 是   | JWT Token 或服务密钥                           |
| `UXIN_USER_ID`   | 否   | 用户 ID（如不提供，将从 JWT Token 中自动提取） |
| `API_BASE_URL`   | 否   | API 服务器地址，默认 `http://127.0.0.1:8000`   |

### 获取 API Token

1. 登录系统后，从用户会话中获取 JWT Token
2. Token 格式：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx`
3. Token 包含用户 ID、角色和过期时间信息

## 项目管理

### 项目操作

- 创建项目：`project_create` - 需要参数：name(项目名称), description(描述)
- 查询项目：`project_query` - 参数：project_id(项目 ID) 或 filter(筛选条件)

### 里程碑管理

- 创建里程碑：`milestone_create` - 参数：project_id(项目 ID), title(里程碑标题)
- 监控里程碑：`milestone_monitor` - 获取项目所有里程碑的当前进展、截止日期等信息

### 需求管理

- 创建需求：`requirement_create` - 参数：project_id(项目 ID), title(需求标题)

## 任务管理

### 任务操作

- 创建任务：`task_create` - 参数：project_id(项目 ID), requirement_id(可选)
- 更新任务状态：`task_update_status` - 参数：task_id(任务 ID), status(新状态：pending/in_progress/completed)
- 任务列表：`task_list` - 查看项目下的所有任务列表及当前进度，参数：project_id

## 团队协作

### 团队管理

- 添加成员：`team_add_member` - 参数：project_id(项目 ID), user_id(用户 ID)

### 智能协作

- 智能协作调度：`collaboration_dispatch` - 将任务分配给特定角色的智能体，并建立协作流程
- 同步协作状态：`collaboration_sync` - 在多个智能体间同步任务进展和中间产物

## 质量与风险管理

### 缺陷管理

- 创建缺陷报告：`defect_create` - 参数：project_id(项目 ID), title(缺陷标题)

### 风险管理

- 创建项目风险：`risk_create` - 参数：project_id(项目 ID), title(风险标题)

## 文档管理

### 文档操作

- 创建文档：`document_create` - 参数：project_id(项目 ID), title(文档标题), content(内容), kind(文档类型)
- 文档列表：`document_list` - 参数：project_id(项目 ID), kind(文档类型), status(状态), limit(数量限制)
- 获取文档详情：`document_get` - 参数：document_id(文档 ID)
- 查询文档：`document_query` - 参数：project_id(项目 ID), kind(文档类型), chat_id(聊天 ID)
- 更新文档：`document_update` - 参数：document_id(文档 ID), title(标题), content(内容), status(状态)
- 删除文档：`document_delete` - 参数：document_id(文档 ID)

### 文档类型

| 类型        | 说明     |
| ----------- | -------- |
| testcase    | 测试用例 |
| requirement | 需求文档 |
| project     | 项目文档 |
| milestone   | 里程碑   |
| report      | 报告     |
| text        | 文本     |
| code        | 代码     |
| sheet       | 表格     |

### 文档状态

| 状态      | 说明   |
| --------- | ------ |
| draft     | 草稿   |
| published | 已发布 |
| archived  | 已归档 |

## 自由职业者服务

### 职业者管理

- 注册自由职业者：`freelancer_register` - 参数：name(姓名), email(邮箱), phone(电话)
- 创建/更新简历：`resume_create` - 参数：freelancer_id(自由职业者 ID)

### 服务与交易

- 创建服务：`service_create` - 参数：freelancer_id(自由职业者 ID)
- 创建服务交易：`transaction_create` - 参数：client_id(客户 ID), freelancer_id(自由职业者 ID)
- 创建/更新合同：`contract_create` - 参数：transaction_id(交易 ID), terms(条款)

### 智能匹配

- 人才匹配：`talent_match` - 参数：skills(所需技能), budget(预算), duration(工期)
- 技能需求分析：`skill_analyzer` - 分析项目描述以提取所需的关键技能

## 注意事项

- 首次使用需要配置 API Token 和 User ID
- API_BASE_URL 默认为 http://localhost:8000
- 所有创建操作都需要有效的认证信息
- 任务状态包括：pending(待处理)、in_progress(进行中)、completed(已完成)
- 智能协作功能支持多智能体间的任务分配与同步

## 常用工作流

### 基础项目创建流程

1. 创建项目：`project_create`
2. 添加团队成员：`team_add_member`
3. 创建里程碑：`milestone_create`
4. 创建需求：`requirement_create`
5. 创建任务：`task_create`

### 自由职业者服务流程

1. 注册职业者：`freelancer_register`
2. 创建简历：`resume_create`
3. 创建服务：`service_create`
4. 智能匹配：`talent_match`
5. 创建交易：`transaction_create`
6. 签订合同：`contract_create`

### 文档管理流程

1. 创建文档：`document_create`
2. 查看文档列表：`document_list`
3. 查看文档详情：`document_get`
4. 更新文档：`document_update`
5. 发布/归档文档：`document_update` (修改 status)
