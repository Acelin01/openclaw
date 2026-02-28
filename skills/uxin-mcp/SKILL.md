---
name: uxin-mcp
description: 综合项目管理工具，支持项目创建、任务管理、团队协作、里程碑追踪、需求管理、缺陷追踪、风险管理及自由职业者服务管理。
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

在 Claude Desktop 配置文件中添加（`UXIN_API_TOKEN` 为必填）：

```json
{
  "mcpServers": {
    "uxin-mcp": {
      "command": "npx",
      "args": ["tsx", "src/mcp-server/index.ts"],
      "env": {
        "UXIN_API_TOKEN": "your-api-token",
        "UXIN_USER_ID": "admin-user-id",
        "API_BASE_URL": "http://localhost:8000"
      }
    }
  }
}
```

## 项目管理

### 项目操作

- 创建项目：`project_create` - 需要参数：name(项目名称), description(描述)
- 查询项目：`project_query` - 参数：project_id(项目ID) 或 filter(筛选条件)

### 里程碑管理

- 创建里程碑：`milestone_create` - 参数：project_id(项目ID), title(里程碑标题)
- 监控里程碑：`milestone_monitor` - 获取项目所有里程碑的当前进展、截止日期等信息

### 需求管理

- 创建需求：`requirement_create` - 参数：project_id(项目ID), title(需求标题)

## 任务管理

### 任务操作

- 创建任务：`task_create` - 参数：project_id(项目ID), requirement_id(可选)
- 更新任务状态：`task_update_status` - 参数：task_id(任务ID), status(新状态：pending/in_progress/completed)
- 任务列表：`task_list` - 查看项目下的所有任务列表及当前进度，参数：project_id

## 团队协作

### 团队管理

- 添加成员：`team_add_member` - 参数：project_id(项目ID), user_id(用户ID)

### 智能协作

- 智能协作调度：`collaboration_dispatch` - 将任务分配给特定角色的智能体，并建立协作流程
- 同步协作状态：`collaboration_sync` - 在多个智能体间同步任务进展和中间产物

## 质量与风险管理

### 缺陷管理

- 创建缺陷报告：`defect_create` - 参数：project_id(项目ID), title(缺陷标题)

### 风险管理

- 创建项目风险：`risk_create` - 参数：project_id(项目ID), title(风险标题)

## 自由职业者服务

### 职业者管理

- 注册自由职业者：`freelancer_register` - 参数：name(姓名), email(邮箱), phone(电话)
- 创建/更新简历：`resume_create` - 参数：freelancer_id(自由职业者ID)

### 服务与交易

- 创建服务：`service_create` - 参数：freelancer_id(自由职业者ID)
- 创建服务交易：`transaction_create` - 参数：client_id(客户ID), freelancer_id(自由职业者ID)
- 创建/更新合同：`contract_create` - 参数：transaction_id(交易ID), terms(条款)

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
