# 阿里云 FRP 部署完整指南

## 📋 架构说明

```
                    阿里云 FRP 服务器
                    (公网 IP: x.x.x.x)
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    端口 7000        端口 60123      端口 60124
    (控制端口)      (本地电脑)       (客户机器)
          │               │               │
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ FRPS     │   │ 本地电脑  │   │ 客户机器  │
    │ 服务器   │   │ FRPC     │   │ FRPC     │
    └──────────┘   └──────────┘   └──────────┘
                          │               │
                          ▼               ▼
                    Gateway:19001    Gateway:19001
```

## 🚀 步骤 1：阿里云服务器准备

### 1.1 购买/准备阿里云 ECS

| 配置 | 要求 |
|------|------|
| 实例 | ecs.t5/t6 或更高 |
| 系统 | Ubuntu 20.04+ 或 CentOS 7+ |
| 公网 IP | 必须有（按量付费或包月） |
| 带宽 | 1Mbps 起步（建议 5Mbps+） |

### 1.2 配置安全组

在阿里云控制台 → 安全组 → 添加规则：

| 端口范围 | 授权对象 | 说明 |
|---------|---------|------|
| 7000/7000 | 0.0.0.0/0 | FRP 控制端口 |
| 60123/60123 | 0.0.0.0/0 | 本地电脑隧道 |
| 60124/60124 | 0.0.0.0/0 | 客户机器隧道 |
| 7500/7500 | 0.0.0.0/0 | Dashboard（可选） |

## 🚀 步骤 2：在阿里云部署 FRPS

### 2.1 SSH 登录阿里云服务器

```bash
ssh root@你的阿里云公网 IP
```

### 2.2 执行部署脚本

```bash
# 下载部署脚本
curl -O https://raw.githubusercontent.com/your-repo/openclaw/main/apps/chat-lite/docs/阿里云-frps-deploy.sh

# 或使用本地上传
# scp 阿里云-fr ps-deploy.sh root@你的阿里云公网 IP:/tmp/

# 执行
cd /tmp
chmod +x 阿里云-frps-deploy.sh
bash 阿里云-frps-deploy.sh
```

### 2.3 验证部署

```bash
# 检查服务状态
systemctl status frps

# 检查端口
netstat -tlnp | grep -E "7000|60123|7500"

# 查看日志
tail -f /var/log/frp/frps.log
```

## 🚀 步骤 3：本地电脑配置 FRPC

### 3.1 下载 FRP

```bash
cd /tmp
curl -L https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_darwin_arm64.tar.gz -o frp.tar.gz
tar -xzf frp.tar.gz
cd frp_*
sudo mv frpc /usr/local/bin/
```

### 3.2 创建配置

```bash
mkdir -p ~/.openclaw-frp
```

编辑 `~/.openclaw-frp/frpc.ini`：

```ini
[common]
server_addr = 你的阿里云公网 IP
server_port = 7000
token = openclaw-platform-token-2026
log_file = ~/.openclaw-frp/frpc.log
log_level = info

[local-gateway]
type = tcp
local_ip = 127.0.0.1
local_port = 19001
remote_port = 60123
```

### 3.3 启动 FRPC

```bash
# 前台运行（测试）
frpc -c ~/.openclaw-frp/frpc.ini

# 后台运行
nohup frpc -c ~/.openclaw-frp/frpc.ini > ~/.openclaw-frp/frpc.log 2>&1 &

# 或使用 systemd
sudo cat > /etc/systemd/system/frpc.service << 'EOF'
[Unit]
Description=frp Client
After=network.target

[Service]
Type=simple
User=$USER
ExecStart=/usr/local/bin/frpc -c /Users/你的用户名/.openclaw-frp/frpc.ini
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable frpc
sudo systemctl start frpc
```

### 3.4 验证连接

```bash
# 检查状态
ps aux | grep frpc

# 查看日志
tail -f ~/.openclaw-frp/frpc.log

# 应该看到：login to server succeeded
```

## 🚀 步骤 4：客户机器配置 FRPC

### 4.1 下载 FRP

```bash
# macOS
curl -L https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_darwin_arm64.tar.gz -o frp.tar.gz

# Linux
curl -L https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_linux_amd64.tar.gz -o frp.tar.gz

tar -xzf frp.tar.gz
cd frp_*
sudo mv frpc /usr/local/bin/
```

### 4.2 创建配置

```bash
mkdir -p ~/.openclaw-frp
```

编辑 `~/.openclaw-frp/frpc.ini`：

```ini
[common]
server_addr = 你的阿里云公网 IP
server_port = 7000
token = openclaw-platform-token-2026
log_file = ~/.openclaw-frp/frpc.log
log_level = info
client_id = machine-XLY.local

[customer-gateway]
type = tcp
local_ip = 127.0.0.1
local_port = 19001
remote_port = 60124
```

### 4.3 启动 FRPC

```bash
# 前台运行（测试）
frpc -c ~/.openclaw-frp/frpc.ini

# 后台运行
nohup frpc -c ~/.openclaw-frp/frpc.ini > ~/.openclaw-frp/frpc.log 2>&1 &
```

## 🚀 步骤 5：配置客户机器人

### 5.1 更新智能体配置

编辑 `apps/chat-lite/config/agents.config.json`：

```json
{
  "agents": [
    {
      "id": "uxin-customer-bot",
      "name": "客户机器人 uxin",
      "gateway": {
        "url": "ws://你的阿里云公网 IP:60124",
        "token": "openclaw-platform-token-2026",
        "type": "remote"
      }
    }
  ]
}
```

### 5.2 同步配置

```bash
cp apps/chat-lite/config/agents.config.json apps/chat-lite/public/config/agents.config.json
```

## 📊 验证连接

### 在阿里云服务器上

```bash
# 查看 FRPS 日志
tail -f /var/log/frp/frps.log

# 应该看到两个客户端连接：
# - local-gateway
# - customer-gateway
```

### 在本地电脑上

```bash
# 测试阿里云连接
ping 你的阿里云公网 IP
nc -zv 你的阿里云公网 IP 7000
```

### 在客户机器上

```bash
# 测试阿里云连接
ping 你的阿里云公网 IP
nc -zv 你的阿里云公网 IP 7000
```

## 🔧 故障排查

### 问题 1：客户端无法连接 FRPS

```bash
# 检查阿里云安全组
# 确保 7000 端口已开放

# 检查 FRPS 状态
systemctl status frps
netstat -tlnp | grep 7000

# 检查客户端日志
tail -f ~/.openclaw-frp/frpc.log
```

### 问题 2：隧道建立但无法转发

```bash
# 检查本地 Gateway 是否运行
lsof -i :19001

# 检查 FRPC 配置
cat ~/.openclaw-frp/frpc.ini

# 重启 FRPC
pkill frpc
frpc -c ~/.openclaw-frp/frpc.ini &
```

### 问题 3：Dashboard 无法访问

```bash
# 检查阿里云安全组
# 确保 7500 端口已开放

# 访问 http://你的阿里云公网 IP:7500
# 用户：admin
# 密码：admin123
```

## 📝 费用估算

| 项目 | 费用 |
|------|------|
| ECS 实例 (t5/t6) | ¥50-100/月 |
| 公网带宽 (1Mbps) | ¥20-50/月 |
| 合计 | ¥70-150/月 |

## ✅ 完成标志

- [ ] 阿里云 FRPS 运行正常
- [ ] 本地电脑 FRPC 连接成功
- [ ] 客户机器 FRPC 连接成功
- [ ] Dashboard 可以访问
- [ ] 客户机器人可以连接
