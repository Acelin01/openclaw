# ✅ 测试用例 Artifact 组件验证 (chat-lite)

## 📅 创建时间
2026-03-01 13:00

## 🎯 目标
在 chat-lite 端调用测试用例技能服务时，通过 artifact 客户端组件显示测试用例内容。

---

## ✅ 已完成

### 1. Artifact 客户端组件 (Lit)

**文件**: `/apps/chat-lite/src/artifacts/testcase/element.ts`

**组件**: `<chatlite-testcase>`

**功能**:
- ✅ 显示测试用例标题和描述
- ✅ 显示类型、优先级、状态标签（带颜色）
- ✅ 显示前置条件（黄色警告框）
- ✅ 显示测试步骤表格
- ✅ 显示预期结果（绿色成功框）
- ✅ 显示标签列表

**UI 预览**:
```
┌─────────────────────────────────────────────────────┐
│  用户登录功能测试                                   │
│  验证用户使用正确的用户名和密码可以成功登录系统       │
├─────────────────────────────────────────────────────┤
│  [FUNCTIONAL] [HIGH] [APPROVED]                     │
├─────────────────────────────────────────────────────┤
│  ⏱️  前置条件                                       │
│  用户已注册且账号处于激活状态                        │
├─────────────────────────────────────────────────────┤
│  ▶️  测试步骤                                       │
│  ┌──────┬──────────────┬──────────────────┐        │
│  │ 步骤 │ 操作         │ 预期结果         │        │
│  ├──────┼──────────────┼──────────────────┤        │
│  │ 1    │ 打开登录页面 │ 页面正常加载     │        │
│  │ 2    │ 输入用户名   │ 输入框接受输入   │        │
│  │ 3    │ 输入密码     │ 密码掩码显示     │        │
│  │ 4    │ 点击登录     │ 跳转到首页       │        │
│  └──────┴──────────────┴──────────────────┘        │
├─────────────────────────────────────────────────────┤
│  ✓ 预期结果                                         │
│  用户成功登录系统，页面跳转到用户首页                │
├─────────────────────────────────────────────────────┤
│  标签                                               │
│  [登录] [用户认证] [核心功能] [冒烟测试]            │
└─────────────────────────────────────────────────────┘
```

### 2. Artifact Viewer 注册

**文件**: `/apps/chat-lite/src/artifacts/viewer.ts`

```typescript
import "./testcase/element";
import type { TestCaseContent } from "./testcase/element";

export type ArtifactKind = "project-requirement" | "testcase" | string;

// switch 中添加 testcase 分支
case "testcase":
  return this._renderTestCase();
```

### 3. 测试页面

**文件**: `/apps/chat-lite/test-testcase-artifact.html`

可以直接在浏览器中打开测试 artifact 显示效果。

---

## 🎨 样式特性

### 类型标签颜色
| 类型 | 样式 |
|------|------|
| FUNCTIONAL | 蓝色背景，深蓝文字 |
| INTEGRATION | 紫色背景，深紫文字 |
| PERFORMANCE | 黄色背景，深黄文字 |
| SECURITY | 红色背景，深红文字 |
| REGRESSION | 灰色背景，深灰文字 |
| ACCEPTANCE | 绿色背景，深绿文字 |

### 优先级标签颜色
| 优先级 | 样式 |
|--------|------|
| LOW | 灰色背景，深灰文字 |
| MEDIUM | 蓝色背景，深蓝文字 |
| HIGH | 橙色背景，深橙文字 |
| CRITICAL | 红色背景，深红文字 |

### 状态标签颜色
| 状态 | 样式 |
|------|------|
| DRAFT | 灰色背景，深灰文字 |
| PENDING_REVIEW | 黄色背景，深黄文字 |
| APPROVED | 绿色背景，深绿文字 |
| REJECTED | 红色背景，深红文字 |
| ARCHIVED | 灰色背景，浅灰文字 |

---

## 🔧 使用方式

### 在 chat-lite 中显示测试用例

```typescript
import type { TestCaseContent } from "./artifacts/testcase/element";

// 设置 artifact 内容
viewer.content = {
  kind: "testcase",
  data: {
    id: "tc-001",
    title: "用户登录功能测试",
    description: "验证用户登录功能",
    type: "FUNCTIONAL",
    priority: "HIGH",
    projectId: "proj-uxin",
    precondition: "用户已注册",
    steps: [
      { step: "1", action: "打开页面", expected: "页面加载" }
    ],
    expectedResult: "用户成功登录",
    tags: ["登录", "测试"],
    status: "APPROVED"
  }
};
```

### MCP 工具调用触发

当 chat-lite 调用 uxin-mcp 的 `test_case_create` 或 `test_case_query` 工具时：

```javascript
// MCP 工具响应
{
  "type": "artifact",
  "kind": "testcase",
  "data": {
    "id": "tc-001",
    "title": "用户登录功能测试",
    ...
  }
}
```

chat-lite 会自动渲染 `<chatlite-testcase>` 组件。

---

## 📊 测试步骤

### 1. 构建 chat-lite
```bash
cd /Users/acelin/Documents/Next/AIGC/openclaw/apps/chat-lite
npm run build
```

### 2. 打开测试页面
```bash
open test-testcase-artifact.html
```

### 3. 点击按钮测试
- **加载测试用例 1**: 功能测试用例
- **加载测试用例 2**: 性能测试用例
- **清空**: 清除显示

---

## 📁 文件清单

| 文件 | 状态 | 说明 |
|------|------|------|
| `src/artifacts/testcase/element.ts` | ✅ | 测试用例组件 |
| `src/artifacts/viewer.ts` | ✅ | 已更新支持 testcase |
| `test-testcase-artifact.html` | ✅ | 测试页面 |
| `docs/测试用例 Artifact 验证.md` | ✅ | 验证文档 |

---

## 🎯 验证流程

```
1. chat-lite 调用 uxin-mcp 工具
   ↓
2. MCP 返回测试用例数据
   ↓
3. chat-lite 设置 viewer.content
   ↓
4. viewer 渲染 chatlite-testcase 组件
   ↓
5. 用户看到精美的测试用例卡片
```

---

## ✅ 总结

**测试用例 Artifact 组件已在 chat-lite 端创建完成！**

- ✅ Lit 组件 (element.ts)
- ✅ Viewer 注册 (viewer.ts)
- ✅ 测试页面 (test-testcase-artifact.html)
- ✅ UI 样式完整（标签、表格、警告框、成功框）
- ✅ 支持 6 种测试类型
- ✅ 支持 4 个优先级
- ✅ 支持 5 个状态

**组件已准备就绪，可以在 chat-lite 端调用测试用例技能服务时显示！** 🎉
