# OperaBot Client SDK

OperaBot Client SDK 是一个用于将 AI 智聊运营机器人集成到网站的 JavaScript SDK。

## 功能特性

- 🚀 **简单易用** - 一行代码即可集成
- 🎨 **可定制化** - 支持主题和位置自定义
- 📱 **响应式** - 适配移动端和桌面端
- 🔌 **WebSocket 实时通信** - 低延迟消息传输
- 📊 **内置分析** - 用户行为和交互统计
- 🌐 **多语言支持** - 中英文界面
- ⚡ **轻量级** - 体积小，加载快

## 快速开始

### 1. 安装

```bash
npm install @uxin/opera-bot-client
```

### 2. 基础使用

#### 纯 JavaScript 版本

```javascript
import { createOperaBotWidget } from "@uxin/opera-bot-client";

// 创建 OperaBot 小部件
const widget = createOperaBotWidget({
  apiKey: "your-api-key-here",
  position: "bottom-right",
  theme: {
    primaryColor: "#007bff",
    backgroundColor: "#ffffff",
    textColor: "#333333",
  },
});
```

#### React 版本

```jsx
import { OperaBotWidget } from "@uxin/opera-bot-client";

function App() {
  return (
    <OperaBotWidget
      config={{
        apiKey: "your-api-key-here",
        position: "bottom-right",
        features: {
          enableQuickReplies: true,
          showTypingIndicator: true,
        },
      }}
    />
  );
}
```

### 3. 高级配置

```javascript
const widget = createOperaBotWidget({
  apiKey: "your-api-key-here",
  serverUrl: "wss://your-server.com/opera-bot",
  userId: "user-123",
  language: "zh-CN",
  position: "bottom-right",
  theme: {
    primaryColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    backgroundColor: "#ffffff",
    textColor: "#333333",
    borderRadius: "12px",
  },
  features: {
    enableVoice: false,
    enableFileUpload: false,
    enableQuickReplies: true,
    showTypingIndicator: true,
  },
});
```

## API 参考

### OperaBotClient

核心客户端类，负责与 OperaBot 服务器通信。

```javascript
import { OperaBotClient } from "@uxin/opera-bot-client";

const client = new OperaBotClient({
  apiKey: "your-api-key",
  serverUrl: "wss://api.uxin.com/opera-bot",
});

// 初始化连接
await client.initialize();

// 发送消息
client.send("你好，OperaBot！");

// 监听事件
client.on("message", ({ message }) => {
  console.log("收到消息:", message.content);
});

client.on("typing", ({ isTyping }) => {
  console.log("对方正在输入:", isTyping);
});

// 获取消息历史
const messages = client.getMessages();

// 获取分析数据
const analytics = client.getAnalytics();
```

### 事件监听

```javascript
// 连接状态变化
widget.on("connection", (data) => {
  console.log("连接状态:", data.status);
});

// 收到新消息
widget.on("message", ({ message, quickReplies }) => {
  console.log("消息内容:", message.content);
  console.log("快捷回复:", quickReplies);
});

// 错误处理
widget.on("error", (error) => {
  console.error("发生错误:", error);
});

// 分析数据更新
widget.on("analytics_update", (analytics) => {
  console.log("会话统计:", analytics);
});
```

### 主题定制

```javascript
const widget = createOperaBotWidget({
  apiKey: "your-api-key",
  theme: {
    // 渐变色主题
    primaryColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    backgroundColor: "#ffffff",
    textColor: "#333333",
    borderRadius: "16px",
  },
});
```

### 位置设置

```javascript
const widget = createOperaBotWidget({
  apiKey: "your-api-key",
  position: "bottom-left", // 可选: 'bottom-right', 'bottom-left', 'top-right', 'top-left'
});
```

### 功能开关

```javascript
const widget = createOperaBotWidget({
  apiKey: "your-api-key",
  features: {
    enableVoice: false, // 语音输入
    enableFileUpload: false, // 文件上传
    enableQuickReplies: true, // 快捷回复
    showTypingIndicator: true, // 输入状态指示
  },
});
```

## 集成示例

### HTML 页面集成

```html
<!DOCTYPE html>
<html>
  <head>
    <title>我的网站</title>
  </head>
  <body>
    <!-- 页面内容 -->

    <!-- OperaBot SDK -->
    <script type="module">
      import { createOperaBotWidget } from "https://unpkg.com/@uxin/opera-bot-client";

      // 初始化 OperaBot
      const widget = createOperaBotWidget({
        apiKey: "your-api-key-here",
        position: "bottom-right",
        language: "zh-CN",
      });

      // 监听用户消息
      widget.on("message", ({ message }) => {
        console.log("用户消息:", message.content);
      });
    </script>
  </body>
</html>
```

### Vue.js 集成

```vue
<template>
  <div id="app">
    <!-- 页面内容 -->
    <OperaBotWidget :config="botConfig" />
  </div>
</template>

<script>
import { OperaBotWidget } from "@uxin/opera-bot-client";

export default {
  components: {
    OperaBotWidget,
  },
  data() {
    return {
      botConfig: {
        apiKey: "your-api-key-here",
        position: "bottom-right",
        theme: {
          primaryColor: "#007bff",
        },
      },
    };
  },
};
</script>
```

### 自定义容器

```javascript
// 将 OperaBot 嵌入到指定容器中
const widget = createOperaBotWidget({
  apiKey: "your-api-key",
  container: "#my-chat-container", // CSS 选择器或 DOM 元素
  theme: {
    primaryColor: "#28a745",
  },
});
```

## 多语言支持

```javascript
const widget = createOperaBotWidget({
  apiKey: "your-api-key",
  language: "en-US", // 支持 'zh-CN' 和 'en-US'
  features: {
    enableQuickReplies: true,
  },
});
```

## 分析功能

```javascript
// 获取会话分析数据
const analytics = widget.getAnalytics();

console.log("会话统计:", {
  sessionId: analytics.sessionId,
  userId: analytics.userId,
  messageCount: analytics.messages,
  intents: analytics.intents,
  averageResponseTime: analytics.averageResponseTime,
});
```

## 错误处理

```javascript
widget.on("error", (error) => {
  switch (error.type) {
    case "connection":
      console.error("连接错误:", error.message);
      break;
    case "authentication":
      console.error("认证错误:", error.message);
      break;
    case "rate_limit":
      console.error("请求频率限制:", error.message);
      break;
    default:
      console.error("未知错误:", error);
  }
});
```

## 销毁和清理

```javascript
// 销毁小部件并清理资源
widget.destroy();
```

## 浏览器支持

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## 许可证

MIT License
