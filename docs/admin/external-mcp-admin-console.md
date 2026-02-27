# Admin Console 外部 MCP 管理页

该页面用于管理外部 Client、Token、默认范围、白名单与用量。

## 入口

`/admin/external`

## 功能

- 创建 Client
- 更新默认项目与团队范围
- 维护工具白名单与权限白名单
- 生成 Token
- 查询用量统计

## 后端代理接口

Admin Console 通过代理接口调用 apps/api：

- `GET /api/admin/external/clients`
- `POST /api/admin/external/clients`
- `PUT /api/admin/external/clients/:id`
- `GET /api/admin/external/clients/:id/tokens`
- `POST /api/admin/external/clients/:id/tokens`
- `GET /api/admin/external/clients/:id/usage`

## 环境变量

- `ADMIN_API_BASE_URL` 指向 apps/api 服务地址
- `ADMIN_API_SERVICE_SECRET` 与 apps/api 的 `SERVICE_SECRET` 一致

## 数据字段说明

- `defaultProjectId`：默认写入项目
- `defaultTeamId`：默认写入团队
- `toolAllowlist`：允许调用的工具列表
- `permissionAllowlist`：权限 key 白名单
