# 飞书机器人配置检查清单

## 1. 飞书开放平台配置

### 应用类型

- [ ] 创建的是 **企业自建应用**（不是第三方应用）
- [ ] 应用已发布（不是草稿状态）

### 权限配置

- [ ] 开通 **消息** 相关权限
- [ ] 开通 **机器人** 权限
- [ ] 权限已提交审核（如需）

### 事件订阅（长连接方式）

- [ ] **事件订阅** 已开启
- [ ] **请求地址** 已配置（必须是公网可访问的 HTTPS URL）
- [ ] **加密策略** 已选择（建议先用"不加密"测试）
- [ ] 验证状态显示 **验证成功** ✅

### 机器人配置

- [ ] **机器人** 已启用
- [ ] 已添加到群聊或可接收私聊

---

## 2. OpenClaw 配置

当前配置 (`openclaw.json`):

```json
{
  "feishu": {
    "appId": "cli_a91e3fad7d789cd3",
    "appSecret": "nRcFy0MlKEoFBoC2qaeoIbKIbDDU3D5U",
    "enabled": true
  }
}
```

### 需要添加的配置

```json
{
  "feishu": {
    "appId": "cli_a91e3fad7d789cd3",
    "appSecret": "nRcFy0MlKEoFBoC2qaeoIbKIbDDU3D5U",
    "enabled": true,
    "webhookPath": "/feishu/webhook",
    "port": 18800,
    "verifyToken": "your_verify_token"
  }
}
```

---

## 3. 网络可达性测试

### 本地测试

```bash
# 检查端口是否监听
netstat -an | grep 18800

# 测试本地访问
curl http://localhost:18800/feishu/webhook
```

### 公网测试（使用内网穿透后）

```bash
# ngrok 提供的公网 URL
curl https://xxx.ngrok.io/feishu/webhook

# 应该返回 200 或 405（方法不对），而不是连接失败
```

---

## 4. 飞书开放平台验证步骤

1. 登录 https://open.feishu.cn/
2. 进入 **应用开发** → 选择你的应用
3. 点击 **事件订阅** 标签
4. 配置 **请求地址**
5. 点击 **保存**，飞书会发送验证请求
6. 验证通过后状态变为 **验证成功**

---

## 5. 常见问题

### Q: "验证失败，URL 不可达"

**A:** 确保：

- 使用 HTTPS（不是 HTTP）
- 域名可公网访问
- 端口开放（通常是 443）
- 服务器正在运行并监听该路径

### Q: "验证超时"

**A:** 确保：

- 你的服务在 5 秒内响应验证请求
- 正确处理飞书的 challenge 响应

### Q: 没有公网 IP 怎么办？

**A:** 使用内网穿透工具：

- [ngrok](https://ngrok.com/)
- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [natapp](https://natapp.cn/)（国内速度快）

---

## 6. 快速测试命令

```bash
# 1. 启动内网穿透
ngrok http 18800

# 2. 复制 https URL 到飞书开放平台

# 3. 重启 OpenClaw
openclaw gateway restart

# 4. 查看日志
openclaw gateway logs | grep feishu
```

---

_最后更新：2025-02-28_
