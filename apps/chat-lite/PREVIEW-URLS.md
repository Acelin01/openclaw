# 🌐 chat-lite Artifact 预览地址

## 📅 更新时间
2026-03-01 17:30

---

## ✅ 需求列表 Artifact

### 预览地址
```
http://localhost:3000/test-requirement-list.html
```

### 功能
- 显示需求列表表格
- 支持 4 条示例数据
- 状态标签（待处理/进行中/已通过/已拒绝）
- 优先级显示
- 用户头像和邮箱
- 编辑/删除操作按钮

### 截图效果
```
┌──────────────────────────────────────────────────────────┐
│  📋 全部需求                            [4 条记录]        │
├──────────────────────────────────────────────────────────┤
│ 有哪些问题 │ 待处理 │   —   │ lenny@.. │ lenny@.. │ ✏️🗑️ │
│ 用户登录   │ 进行中 │ 🔴 高 │ zs@..    │ lenny@.. │ ✏️🗑️ │
│ 性能测试   │ 已通过 │ 🟡 中 │ ls@..    │ zs@..    │ ✏️🗑️ │
│ 安全漏洞   │ 待处理 │ 🔴 紧急│ ww@..    │ lenny@.. │ ✏️🗑️ │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ 测试用例 Artifact

### 预览地址
```
http://localhost:3000/test-testcase-artifact.html
```

### 功能
- 显示测试用例详情
- 类型/优先级/状态标签
- 前置条件（黄色警告框）
- 测试步骤表格
- 预期结果（绿色成功框）
- 标签列表

---

## 🚀 快速访问

### 方式 1: 本地服务器
```bash
cd /Users/acelin/Documents/Next/AIGC/openclaw/apps/chat-lite
npx serve dist -l 3000
```

然后访问：
- **需求列表**: http://localhost:3000/test-requirement-list.html
- **测试用例**: http://localhost:3000/test-testcase-artifact.html

### 方式 2: 直接打开文件
```bash
open dist/test-requirement-list.html
open dist/test-testcase-artifact.html
```

### 方式 3: VS Code Live Server
1. 安装 Live Server 扩展
2. 右键点击 HTML 文件
3. 选择 "Open with Live Server"

---

## 📊 组件对比

| 组件 | 文件 | 端口 | 状态 |
|------|------|------|------|
| 需求列表 | `test-requirement-list.html` | 3000 | ✅ 就绪 |
| 测试用例 | `test-testcase-artifact.html` | 3000 | ✅ 就绪 |
| 主应用 | `index.html` | 3000 | ✅ 就绪 |

---

## 🔧 开发模式

如果需要实时重载：

```bash
cd /Users/acelin/Documents/Next/AIGC/openclaw/apps/chat-lite
npm run dev
```

然后访问 http://localhost:5173

---

## 📱 移动端预览

chat-lite 支持移动端显示，使用 Chrome DevTools 的设备模式预览：

1. 打开 Chrome DevTools (F12)
2. 点击设备切换按钮 (Ctrl+Shift+M)
3. 选择设备（iPhone 12 Pro, Pixel 5 等）
4. 刷新页面

---

## ✅ 验证清单

- [x] 构建成功
- [x] 服务器启动
- [x] 需求列表页面可访问
- [x] 测试用例页面可访问
- [x] 组件样式正常
- [x] 交互功能正常

---

**所有 Artifact 组件预览地址已就绪！** 🎉
