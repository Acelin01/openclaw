# ✅ 测试用例 Artifact 触发流程验证

## 📅 创建时间
2026-03-01 13:30

## 🎯 目标
在 chat-lite 聊天框中输入测试用例相关关键词，自动触发测试用例 artifact 显示。

---

## ✅ 实现内容

### 1. 测试用例管理器

**文件**: `/apps/chat-lite/src/services/testcase-manager.ts`

**功能**:
- ✅ 创建测试用例草稿
- ✅ 从关键词自动生成测试用例
- ✅ 转换为 artifact 内容格式

**使用方式**:
```typescript
import { testcaseManager } from "./services/testcase-manager";

// 从关键词创建测试用例
const draft = testcaseManager.createFromKeywords("用户登录功能测试");

// 转换为 artifact 内容
const artifactContent = testcaseManager.toArtifactContent(draft);
```

### 2. App 组件更新

**文件**: `/apps/chat-lite/src/components/app.ts`

**新增方法**:
- `_handleTestCaseCreation(input: string)` - 检测并处理测试用例创建
- `_addAssistantMessage(content, artifact?)` - 支持 artifact 的消息

**触发逻辑**:
```typescript
private _handleTestCaseCreation(input: string) {
  const testCaseKeywords = [
    "测试用例", "创建测试", "test case", "test",
    "功能测试", "性能测试", "安全测试", "集成测试"
  ];

  const hasTestCaseKeyword = testCaseKeywords.some(keyword => 
    input.toLowerCase().includes(keyword.toLowerCase())
  );

  if (hasTestCaseKeyword) {
    // 创建测试用例
    const draft = testcaseManager.createFromKeywords(input);
    const artifactContent = testcaseManager.toArtifactContent(draft);

    // 显示 artifact
    this.currentArtifact = {
      kind: "testcase",
      data: artifactContent,
    };

    // 添加消息（带 artifact 引用）
    this._addAssistantMessage(
      `已创建测试用例：**${draft.title}**`,
      {
        kind: "testcase",
        content: JSON.stringify(artifactContent),
      }
    );

    return true;
  }

  return false;
}
```

---

## 🔧 使用方式

### 在聊天框中输入

#### 示例 1: 功能测试
```
创建一个用户登录的测试用例
```

**触发效果**:
- 识别关键词："测试用例", "登录"
- 类型：FUNCTIONAL
- 优先级：MEDIUM
- 自动生成 4 个测试步骤
- 在聊天框显示消息，右侧显示 artifact 卡片

#### 示例 2: 性能测试
```
API 性能测试，需要测试高并发场景
```

**触发效果**:
- 识别关键词："性能测试", "API"
- 类型：PERFORMANCE
- 优先级：HIGH
- 生成性能测试步骤
- 显示 artifact 卡片

#### 示例 3: 安全测试
```
创建安全测试用例，检查权限控制
```

**触发效果**:
- 识别关键词："安全测试"
- 类型：SECURITY
- 优先级：CRITICAL
- 生成安全测试步骤
- 显示 artifact 卡片

---

## 📊 触发流程图

```
用户输入消息
    ↓
_handleLocalResponse(input)
    ↓
_handleTestCaseCreation(input)
    ↓
检测关键词
    ↓
是 → testcaseManager.createFromKeywords()
    ↓
生成测试用例草稿
    ↓
设置 currentArtifact = { kind: "testcase", data: {...} }
    ↓
添加助手消息（带 artifact 引用）
    ↓
聊天框显示消息 + 右侧显示 artifact 卡片
```

---

## 🎨 UI 效果

### 聊天框
```
┌─────────────────────────────────────────┐
│  👤 用户                                │
│  创建一个用户登录的测试用例               │
│  13:30                                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🤖 助手                                │
│  已创建测试用例：**用户登录功能测试**    │
│  类型：FUNCTIONAL                        │
│  优先级：MEDIUM                          │
│  共 4 个测试步骤。                        │
│  [📎 查看 testcase] ← 点击显示 artifact  │
│  13:30                                  │
└─────────────────────────────────────────┘
```

### 右侧 Artifact 面板
```
┌─────────────────────────────────────────┐
│  Artifact 查看器                        │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  用户登录功能测试                 │  │
│  │  [FUNCTIONAL] [MEDIUM] [APPROVED]│  │
│  ├───────────────────────────────────┤  │
│  │  ⏱️  前置条件                     │  │
│  │  测试环境已准备就绪               │  │
│  ├───────────────────────────────────┤  │
│  │  ▶️  测试步骤                     │  │
│  │  [表格显示 4 个步骤]                │  │
│  ├───────────────────────────────────┤  │
│  │  ✓ 预期结果                       │  │
│  │  测试步骤全部通过                 │  │
│  ├───────────────────────────────────┤  │
│  │  标签                             │  │
│  │  [功能测试] [用户认证] [冒烟测试] │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📁 修改的文件

| 文件 | 修改内容 |
|------|----------|
| `src/services/testcase-manager.ts` | ✅ 新增 |
| `src/components/app.ts` | ✅ 更新（添加测试用例触发逻辑） |
| `src/components/app.ts` | ✅ 导入 testcaseManager |

---

## 🧪 测试步骤

### 1. 构建 chat-lite
```bash
cd /Users/acelin/Documents/Next/AIGC/openclaw/apps/chat-lite
npm run build
```

### 2. 打开应用
```bash
open index.html
```

### 3. 在聊天框输入测试语句

**测试用例 1**:
```
创建一个用户登录的测试用例
```

**预期**: 右侧显示功能测试 artifact

**测试用例 2**:
```
API 性能测试，需要测试高并发
```

**预期**: 右侧显示性能测试 artifact

**测试用例 3**:
```
安全测试，检查权限控制
```

**预期**: 右侧显示安全测试 artifact

---

## ✅ 验证结果

- ✅ 关键词检测正常
- ✅ 测试用例自动生成
- ✅ Artifact 正确显示
- ✅ 消息和 artifact 联动

**现在可以在 chat-lite 聊天框中输入测试用例关键词，自动触发 artifact 显示！** 🎉
