# 外部 MCP 接入与管理

本文档说明外部 uxin-mcp 的接入方式、权限控制、默认范围与用量统计。

## 目标

- 外部用户无需成为租户即可调用业务能力
- 所有调用进入统一业务服务（apps/api）
- 使用 Token 进行鉴权、限流与审计
- 默认绑定项目/团队，保证数据隔离

## 核心能力

### 1. API Token 与默认范围

- 每个外部 Client 绑定 `defaultProjectId` / `defaultTeamId`
- 外部请求未显式传递 project_id 时自动注入默认项目
- Token 通过 `x-api-key` 或 `Authorization: Bearer` 传递

### 2. 工具白名单与权限矩阵

- `toolAllowlist` 控制外部可调用的 MCP 工具子集
- `permissionAllowlist` 控制权限 key 级别
- 权限映射统一维护在服务端

### 3. 限流与用量统计

- 按 Client 级别进行限流
- 记录调用日志、状态码与耗时

## 接口说明

### 管理端（管理员）

- 创建 Client  
  `POST /api/v1/admin/external/clients`
- 更新 Client  
  `PUT /api/v1/admin/external/clients/:id`
- 生成 Token  
  `POST /api/v1/admin/external/clients/:id/tokens`
- 查询用量  
  `GET /api/v1/admin/external/clients/:id/usage?from=&to=&tool=&limit=`

### 外部调用

- MCP 路由  
  `POST /api/v1/external/mcp/route`
- 获取配置模板  
  `GET /api/v1/external/mcp/config`
- 用量查询（Token 自身）  
  `GET /api/v1/external/usage?from=&to=&tool=&limit=`

## Admin Console

后台入口：`/admin/external`  
支持创建 Client、生成 Token、配置白名单与默认范围、用量查询。

## 配置示例

请求头示例：

```
Authorization: Bearer <token>
```

示例 Payload：

```
{
  "message": {
    "body": {
      "action": "project_create",
      "context": { "project_id": "project_xxx" }
    }
  }
}
```

## 相关代码

- Token 与限流：`apps/api/src/middleware/api-token.ts`
- 外部 MCP 路由：`apps/api/src/routes/external-mcp.ts`
- 外部管理接口：`apps/api/src/routes/external-admin.ts`
- Admin Console 管理页：`apps/admin-console/app/admin/external/page.tsx`
