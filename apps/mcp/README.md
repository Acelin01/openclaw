# Uxin MCP Server

优薪 (Uxin) 独立 MCP 服务，提供项目协作与自由职业者服务交易的标准化能力。

## 核心功能

### 1. 项目协作 (Project Collaboration)
提供标准化的项目协作工具，支持项目全生命周期管理：
- **项目管理**: `project_create`, `project_query`
- **里程碑**: `milestone_create`
- **需求管理**: `requirement_create`
- **任务管理**: `task_create`
- **缺陷管理**: `defect_create`
- **风险管理**: `risk_create`
- **团队管理**: `team_add_member`

### 2. 自由职业者服务 (Freelancer Service)
提供自由职业者全生命周期管理与交易工具：
- **简历管理**: `resume_create`
- **注册管理**: `freelancer_register`
- **服务管理**: `service_create`
- **交易管理**: `transaction_create`
- **合同管理**: `contract_create`
- **人才匹配**: `talent_match`

## 技术实现

- **基础框架**: 基于 `@modelcontextprotocol/sdk` 实现
- **通信协议**: 支持 `Stdio` 传输
- **模块化设计**: 
  - `src/index.ts`: 服务入口与工具注册
  - `src/tools/project-collaboration/`: 项目协作工具实现
  - `src/tools/freelancer/`: 自由职业者服务工具实现
- **共享库**: 复用 `@uxin/projects` 和 `@uxin/agent-lib` 中的核心业务逻辑

## 快速开始

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
npm run dev
```

### 编译与运行
```bash
npm run build
npm start
```

## MCP 工具列表

### 项目协作工具
- `project_create`: 创建新项目
- `project_query`: 查询项目信息
- `milestone_create`: 创建项目里程碑
- `requirement_create`: 创建项目需求
- `task_create`: 创建任务
- `defect_create`: 创建缺陷报告
- `risk_create`: 创建项目风险
- `team_add_member`: 添加团队成员

### 自由职业者服务工具
- `resume_create`: 创建或更新简历
- `freelancer_register`: 注册自由职业者
- `service_create`: 创建自由职业者服务
- `transaction_create`: 创建服务交易
- `contract_create`: 创建或更新合同
- `talent_match`: 智能人才匹配
