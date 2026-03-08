# 需求管理 Artifact 差距分析与改进计划

## 📊 当前状态 vs 文档要求

### 1. 新建需求页面

#### 文档参考：`docs/需求_新建.md`

| 功能模块 | 文档要求 | 当前实现 | 状态 | 优先级 |
|----------|----------|----------|------|--------|
| **布局结构** | | | | |
| 模态框布局 | 编辑器 + 侧边栏 (360px) | ✅ 已实现 | ✅ | - |
| 移动端适配 | 抽屉式弹窗 | ❌ 仅模态框 | ❌ | 中 |
| **标题输入** | | | | |
| 标题输入框 | 无边界设计，字符计数 | ⚠️ 基础输入框 | ⚠️ | 高 |
| 字符计数 | 右下角显示 x/200 | ❌ 未实现 | ❌ | 中 |
| 占位符文本 | "输入标题..." | ✅ 已实现 | ✅ | - |
| **描述编辑器** | | | | |
| 富文本工具栏 | 完整工具栏（加粗/斜体/下划线/列表/编号/缩进/引用/代码/链接） | ⚠️ 仅 5 个按钮 | ⚠️ | 高 |
| 工具栏置顶 | sticky 定位，滚动时固定 | ❌ 未实现 | ❌ | 中 |
| 工具栏滚动 | 横向滚动，隐藏滚动条 | ❌ 未实现 | ❌ | 低 |
| 描述输入区 | 无边框，最小高度 120px | ✅ 已实现 | ✅ | - |
| 字数统计 | 右下角显示 | ❌ 未实现 | ❌ | 低 |
| **关联项模块** | | | | |
| 关联 tabs | 横向滚动，需求/任务/缺陷等 | ❌ 未实现 | ❌ | 中 |
| 关联表格 | 可滚动，固定右侧操作栏 | ❌ 未实现 | ❌ | 中 |
| 添加关联 | 搜索弹框 | ❌ 未实现 | ❌ | 中 |
| **基础字段** | | | | |
| 父项选择 | 芯片式输入，支持搜索 | ❌ 未实现 | ❌ | 高 |
| 预计工时 | 输入框 + 单位选择 | ❌ 未实现 | ❌ | 中 |
| 优先级选择 | 横向滚动选项，带颜色标识 | ⚠️ 下拉框 | ⚠️ | 高 |
| 状态选择 | 横向滚动选项 | ⚠️ 固定显示 | ⚠️ | 中 |
| 负责人选择 | 用户选择器，带搜索 | ⚠️ 下拉框 | ⚠️ | 高 |
| 创建者 | 自动填充当前用户 | ❌ 未实现 | ❌ | 中 |
| 开始/结束日期 | 日期选择器 | ❌ 未实现 | ❌ | 中 |
| **侧边栏** | | | | |
| 项目信息 | 显示项目名称 | ✅ 已实现 | ✅ | - |
| 迭代信息 | 迭代选择器 | ❌ 未实现 | ❌ | 中 |
| 标签 | 标签输入 | ❌ 未实现 | ❌ | 低 |
| 提示信息 | 绿色提示框 | ✅ 已实现 | ✅ | - |
| **交互细节** | | | | |
| 字段行 hover | 背景色变化，边框高亮 | ❌ 未实现 | ❌ | 低 |
| 必填项标记 | 红色星号或圆点 | ⚠️ 仅星号 | ⚠️ | 中 |
| 表单验证 | 实时验证 | ⚠️ 提交时验证 | ⚠️ | 中 |
| 创建成功 | 动画 + 提示 + 跳转 | ✅ 已实现 | ✅ | - |

---

### 2. 需求列表页面

#### 文档参考：`docs/需求列表.md`

| 功能模块 | 文档要求 | 当前实现 | 状态 | 优先级 |
|----------|----------|----------|------|--------|
| **表格列** | | | | |
| 标题列 | 可点击，悬停下划线 | ⚠️ 仅悬停变色 | ⚠️ | 中 |
| 状态列 | 徽章样式（5 种状态） | ✅ 已实现 | ✅ | - |
| 优先级列 | 徽章 + 颜色点 | ⚠️ 仅徽章 | ⚠️ | 中 |
| 负责人列 | 头像 + 邮箱，截断显示 | ✅ 已实现 | ✅ | - |
| 创建者列 | 头像 + 邮箱 | ✅ 已实现 | ✅ | - |
| 创建时间列 | MM-DD 格式 | ✅ 已实现 | ✅ | - |
| 操作列 | 编辑/删除图标按钮 | ✅ 已实现 | ✅ | - |
| **表格样式** | | | | |
| 卡片容器 | 圆角 12px，阴影 | ✅ 已实现 | ✅ | - |
| 表头背景 | #fafafa | ✅ 已实现 | ✅ | - |
| 行悬停效果 | 背景#fafafa | ✅ 已实现 | ✅ | - |
| 边框颜色 | #f0f0f0 | ✅ 已实现 | ✅ | - |
| **筛选排序** | | | | |
| 状态筛选 | 下拉筛选 | ❌ 未实现 | ❌ | 高 |
| 优先级筛选 | 下拉筛选 | ❌ 未实现 | ❌ | 中 |
| 负责人筛选 | 用户选择器 | ❌ 未实现 | ❌ | 中 |
| 搜索框 | 标题搜索 | ❌ 未实现 | ❌ | 高 |
| 排序 | 按时间/优先级/状态 | ❌ 未实现 | ❌ | 中 |
| **批量操作** | | | | |
| 全选复选框 | 表头全选 | ❌ 未实现 | ❌ | 低 |
| 批量删除 | 选中后批量操作 | ❌ 未实现 | ❌ | 低 |
| 批量修改状态 | 状态批量修改 | ❌ 未实现 | ❌ | 低 |
| **分页** | | | | |
| 分页器 | 页码 + 上一页/下一页 | ❌ 未实现 | ❌ | 高 |
| 每页条数 | 10/20/50/100 可选 | ❌ 未实现 | ❌ | 中 |
| 总条数显示 | "共 X 条记录" | ✅ 已实现 | ✅ | - |

---

### 3. 需求详情页面

#### 文档参考：`docs/需求_详情.md`

| 功能模块 | 文档要求 | 当前实现 | 状态 | 优先级 |
|----------|----------|----------|------|--------|
| **头部区域** | | | | |
| 标题显示 | 大标题 + 图标 | ✅ 已实现 | ✅ | - |
| 需求 ID | 单字体显示 | ✅ 已实现 | ✅ | - |
| 状态徽章 | 可点击修改 | ⚠️ 仅显示 | ⚠️ | 中 |
| 操作按钮 | 编辑/删除/更多 | ✅ 已实现 | ✅ | - |
| **标签页** | | | | |
| 标签组 | 详情/任务/评论/附件 | ❌ 未实现 | ❌ | 高 |
| 计数徽章 | 每个标签显示数量 | ❌ 未实现 | ❌ | 中 |
| **描述区域** | | | | |
| 富文本显示 | 格式化显示 | ⚠️ 纯文本 | ⚠️ | 高 |
| 代码块 | 代码高亮显示 | ❌ 未实现 | ❌ | 低 |
| 图片预览 | 点击图片放大 | ❌ 未实现 | ❌ | 低 |
| **关联项** | | | | |
| 子需求 | 列表显示 | ❌ 未实现 | ❌ | 中 |
| 关联任务 | 任务列表 | ❌ 未实现 | ❌ | 高 |
| 关联缺陷 | 缺陷列表 | ❌ 未实现 | ❌ | 中 |
| 关联文档 | 文档列表 | ❌ 未实现 | ❌ | 低 |
| **活动日志** | | | | |
| 变更历史 | 时间线显示 | ❌ 未实现 | ❌ | 中 |
| 评论列表 | 评论 + 回复 | ❌ 未实现 | ❌ | 高 |
| **基本信息** | | | | |
| 项目 | 项目名称 + 链接 | ⚠️ 仅文本 | ⚠️ | 中 |
| 迭代 | 迭代名称 | ❌ 未实现 | ❌ | 中 |
| 优先级 | 徽章 + 颜色点 | ⚠️ 仅徽章 | ⚠️ | 中 |
| 负责人 | 头像 + 邮箱 + 下拉修改 | ⚠️ 仅显示 | ⚠️ | 高 |
| 创建者 | 头像 + 邮箱 | ✅ 已实现 | ✅ | - |
| 工时 | 预计/实际工时 | ❌ 未实现 | ❌ | 中 |
| 日期 | 开始/结束/截止日期 | ❌ 未实现 | ❌ | 中 |

---

## 🔧 API/Database 检查

### Prisma Schema 检查

**model ProjectRequirement:**
```prisma
model ProjectRequirement {
  id              String                @id @default(uuid())
  projectId       String?
  title           String
  description     String?               @db.Text
  priority        String?               @default("MEDIUM")
  status          String?               @default("PENDING")
  createdAt       DateTime              @default(now())
  updatedAt       DateTime              @updatedAt
  assigneeId      String?
  collaborationId String?
  iterationId     String?
  reporterId      String?
  type            String?               @default("FUNCTIONAL")
  
  // 缺失字段（文档中提到但未在 schema 中）
  // - parentId (父项需求)
  // - estimatedHours (预计工时)
  // - startDate (开始日期)
  // - endDate (结束日期)
  // - dueDate (截止日期)
  // - tags (标签)
  
  assignee        User?                 @relation("RequirementAssignee", fields: [assigneeId], references: [id])
  collaboration   ProjectCollaboration? @relation(fields: [collaborationId], references: [id])
  iteration       Iteration?            @relation(fields: [iterationId], references: [id])
  project         Project?              @relation(fields: [projectId], references: [id])
  reporter        User?                 @relation("RequirementReporter", fields: [reporterId], references: [id])
  tasks           ProjectTask[]
  agents          Agent[]               @relation("AgentToProjectRequirement")

  @@index([projectId])
  @@index([iterationId])
  @@index([collaborationId])
  @@index([assigneeId])
  @@index([reporterId])
  @@map("project_requirements")
}
```

### 数据库方法检查

**已实现方法 (src/lib/db/service.ts):**
- ✅ `getProjectRequirements(where, options)` - 查询列表
- ✅ `createProjectRequirement(data)` - 创建需求
- ✅ `updateProjectRequirement(id, data)` - 更新需求
- ❌ `getProjectRequirementById(id)` - 查询详情（缺失）
- ❌ `deleteProjectRequirement(id)` - 删除需求（缺失）
- ❌ `getRequirementsByProject(projectId, options)` - 按项目查询（带分页）
- ❌ `getRequirementsByStatus(status, options)` - 按状态查询
- ❌ `getRequirementsByAssignee(assigneeId, options)` - 按负责人查询
- ❌ `searchRequirements(query, options)` - 搜索需求

**需要添加的方法:**
```typescript
// 1. 查询详情
async getProjectRequirementById(id: string) {
  if (!prisma) return null;
  return prisma.projectRequirement.findUnique({
    where: { id },
    include: { 
      tasks: true, 
      assignee: true, 
      reporter: true,
      project: true,
      iteration: true
    }
  });
}

// 2. 删除需求
async deleteProjectRequirement(id: string) {
  if (!prisma) throw new Error('Database not available');
  return prisma.projectRequirement.delete({ where: { id } });
}

// 3. 按项目查询（带分页和排序）
async getRequirementsByProject(projectId: string, options: any = {}) {
  if (!prisma) return [];
  const { skip = 0, take = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  return prisma.projectRequirement.findMany({
    where: { projectId },
    skip,
    take,
    include: { tasks: true, assignee: true, reporter: true },
    orderBy: { [sortBy]: sortOrder }
  });
}

// 4. 搜索需求
async searchRequirements(query: string, options: any = {}) {
  if (!prisma) return [];
  return prisma.projectRequirement.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    },
    ...options
  });
}
```

---

## 📋 改进计划

### 阶段 1：高优先级（核心功能）

| 任务 | 预计工时 | 说明 |
|------|----------|------|
| **1.1 API 补充** | 2h | 添加详情/删除/搜索方法 |
| **1.2 新建页面优化** | 4h | 完整富文本工具栏、字符计数、字段验证 |
| **1.3 列表页面筛选** | 3h | 状态/优先级筛选、搜索框、分页器 |
| **1.4 详情页面标签** | 3h | 详情/任务/评论标签页、关联任务列表 |

### 阶段 2：中优先级（体验优化）

| 任务 | 预计工时 | 说明 |
|------|----------|------|
| **2.1 新建页面关联** | 4h | 父项选择、关联项表格、搜索弹框 |
| **2.2 详情页面活动** | 4h | 变更历史、评论列表、活动日志 |
| **2.3 列表批量操作** | 3h | 全选、批量删除、批量修改状态 |
| **2.4 字段完善** | 2h | 负责人/迭代/工时/日期选择器 |

### 阶段 3：低优先级（细节打磨）

| 任务 | 预计工时 | 说明 |
|------|----------|------|
| **3.1 移动端适配** | 4h | 抽屉式弹窗、响应式布局 |
| **3.2 交互细节** | 3h | hover 效果、动画、提示优化 |
| **3.3 高级功能** | 4h | 标签系统、附件上传、导出功能 |

**总预计工时：约 36 小时**

---

## 🎯 下一步行动

### 立即执行（今天）

1. ✅ 添加 API 详情查询方法
2. ✅ 添加 API 删除方法
3. ✅ 优化新建页面富文本工具栏
4. ✅ 添加列表页面筛选功能

### 本周完成

1. 完善新建页面所有字段
2. 实现列表分页功能
3. 完善详情页面标签页
4. 添加关联任务显示

### 下周完成

1. 移动端适配
2. 批量操作功能
3. 评论和活动日志
4. 性能优化

---

## 📊 当前完成度

| 页面 | 完成度 | 说明 |
|------|--------|------|
| 新建需求 | 60% | 基础表单完成，缺少高级功能 |
| 需求列表 | 70% | 表格显示完成，缺少筛选分页 |
| 需求详情 | 50% | 基础信息完成，缺少标签页和关联项 |
| API 服务 | 60% | CRUD 基础完成，缺少高级查询 |

**总体完成度：约 60%**

---

## 🔗 相关文档

- `docs/需求_新建.md` - 新建需求完整设计
- `docs/需求_详情.md` - 需求详情完整设计
- `docs/需求列表.md` - 需求列表完整设计
- `src/lib/db/service.ts` - 数据库服务实现
- `prisma/schema.prisma` - 数据模型定义
