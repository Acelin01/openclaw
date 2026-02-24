# 微信小程序对接OpenClaw项目

## 项目概述

将微信小程序集成到OpenClaw AI助手中，实现双向通信。

## 架构设计

基于OpenClaw插件架构，参考feishu和telegram实现。

## 核心功能

1. **上行通信**：小程序 → OpenClaw Webhook
2. **下行通信**：OpenClaw → 微信客服消息API
3. **消息标准化**：微信格式 ↔ OpenClaw Activity
4. **安全验证**：签名验证、HTTPS要求

## 文件结构

```
src/
├── wechat-mini/
│   ├── client.ts              # 微信API客户端封装
│   ├── server.ts              # Webhook服务器
│   ├── send.ts                # 消息发送逻辑
│   └── types.ts               # 类型定义
├── channels/
│   └── plugins/
│       ├── normalize/
│       │   └── wechat-mini.ts # 消息标准化
│       └── outbound/
│           └── wechat-mini.ts # 出站消息适配器
└── config/
    └── zod-schema.providers-core.ts # 配置类型扩展
```

## 快速开始

1. 配置微信小程序信息
2. 启动Webhook服务器
3. 配置OpenClaw渠道插件
4. 测试消息收发

## 配置要求

- Node.js 18+
- OpenClaw 最新版本
- 微信小程序开发者账号
- HTTPS证书（生产环境）
