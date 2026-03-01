# ✅ 需求列表 Artifact 组件验证

## 📅 创建时间
2026-03-01 16:30

## 🎯 目标
在 chat-lite 端调用项目需求列表查询技能服务时，通过 artifact 客户端组件显示需求列表页面。

---

## ✅ 已完成

### 1. 需求列表组件 (Lit)

**文件**: `/apps/chat-lite/src/artifacts/project-requirement/list-element.ts`

**组件**: `<chatlite-requirement-list>`

**功能**:
- ✅ 显示需求列表表格
- ✅ 支持 7 列：标题、状态、优先级、负责人、创建者、创建时间、操作
- ✅ 状态标签（待处理/进行中/已通过/已拒绝）
- ✅ 优先级显示（高/中/低/紧急）
- ✅ 用户头像和邮箱显示
- ✅ 编辑/删除操作按钮
- ✅ 响应式设计

**UI 预览**:
```
┌─────────────────────────────────────────────────────────────┐
│  📋 全部需求                              [1 条记录]        │
├─────────────────────────────────────────────────────────────┤
│  标题     │ 状态   │ 优先级 │ 负责人 │ 创建者 │ 创建时间 │操作│
├───────────┼────────┼────────┼────────┼────────┼──────────┼───┤
│ 有哪些问题│待处理  │   —    │ le │   le │2026-01-28│✏️🗑️│
│           │        │        │lenny@..│lenny@..│          │   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Viewer 注册

**文件**: `/apps/chat-lite/src/artifacts/viewer.ts`

```typescript
import "./project-requirement/list-element";
import type { RequirementListItem } from "./project-requirement/list-element";

export type ArtifactKind = "project-requirement" | "project-requirement-list" | "testcase" | string;

// switch 中添加 project-requirement-list 分支
case "project-requirement-list":
  return this._renderRequirementList();
```

### 3. 测试页面

**文件**: `/apps/chat-lite/test-requirement-list.html`

可以直接在浏览器中打开测试 artifact 显示效果。

---

## 🎨 样式特性

### 状态标签颜色
| 状态 | 样式 |
|------|------|
| 待处理 (pending) | 黄色背景，深黄文字 |
| 进行中 (in_progress) | 蓝色背景，深蓝文字 |
| 已通过 (approved) | 绿色背景，深绿文字 |
| 已拒绝 (rejected) | 红色背景，深红文字 |

### 优先级显示
| 优先级 | 样式 |
|--------|------|
| 紧急 (critical) | 红色文字 |
| 高 (high) | 红色文字 |
| 中 (medium) | 橙色文字 |
| 低 (low) | 绿色文字 |
| 无 | 灰色 "—" |

### 表格列
1. **标题** - 需求标题（最大 280px，超出省略）
2. **状态** - 带颜色标签
3. **优先级** - 文字或 "—"
4. **负责人** - 头像 + 邮箱
5. **创建者** - 头像 + 邮箱
6. **创建时间** - 日期格式
7. **操作** - 编辑/删除按钮

---

## 🔧 使用方式

### 在 chat-lite 中显示需求列表

```typescript
import type { RequirementListItem } from "./artifacts/project-requirement/list-element";

// 设置 artifact 内容
viewer.content = {
  kind: "project-requirement-list",
  data: {
    title: "全部需求",
    requirements: [
      {
        id: "req-001",
        title: "有哪些问题",
        status: "pending",
        assignee: {
          id: "user-001",
          name: "lenny540101",
          email: "lenny540101@163.com"
        },
        creator: {
          id: "user-001",
          name: "lenny540101",
          email: "lenny540101@163.com"
        },
        createdAt: Date.now()
      }
    ]
  }
};
```

### MCP 工具调用触发

当 chat-lite 调用 uxin-mcp 的 `requirement_query` 工具时：

```javascript
// MCP 工具响应
{
  "type": "artifact",
  "kind": "project-requirement-list",
  "data": {
    "title": "全部需求",
    "requirements": [...]
  }
}
```

chat-lite 会自动渲染 `<chatlite-requirement-list>` 组件。

---

## 📊 测试步骤

### 1. 构建 chat-lite
```bash
cd /Users/acelin/Documents/Next/AIGC/openclaw/apps/chat-lite
npm run build
```

### 2. 打开测试页面
```bash
open test-requirement-list.html
```

### 3. 点击按钮测试
- **加载需求列表**: 显示 4 条示例需求
- **清空**: 清除显示

---

## 📁 文件清单

| 文件 | 状态 | 说明 |
|------|------|------|
| `src/artifacts/project-requirement/list-element.ts` | ✅ | 需求列表组件 |
| `src/artifacts/viewer.ts` | ✅ | 已更新支持列表 |
| `test-requirement-list.html` | ✅ | 测试页面 |
| `docs/需求列表 Artifact 验证.md` | ✅ | 验证文档 |

---

## 🎯 验证流程

```
1. chat-lite 调用 uxin-mcp 工具
   ↓
2. MCP 返回需求列表数据
   ↓
3. chat-lite 设置 viewer.content
   ↓
4. viewer 渲染 chatlite-requirement-list 组件
   ↓
5. 用户看到需求列表表格
```

---

## ✅ 总结

**需求列表 Artifact 组件已在 chat-lite 端创建完成！**

- ✅ Lit 组件 (list-element.ts)
- ✅ Viewer 注册 (viewer.ts)
- ✅ 测试页面 (test-requirement-list.html)
- ✅ UI 样式完整（表格、标签、头像、操作按钮）
- ✅ 支持 4 种状态
- ✅ 支持 4 个优先级
- ✅ 响应式设计

**组件已准备就绪，可以在 chat-lite 端调用需求列表技能服务时显示！** 🎉
