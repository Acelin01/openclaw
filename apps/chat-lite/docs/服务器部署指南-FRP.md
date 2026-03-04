# 服务器端 FRP 部署指南

## 📋 服务器信息

| 配置项 | 值 |
|--------|-----|
| 服务器地址 | 192.168.31.154 |
| FRP 服务器端口 | 7000 |
| 远程隧道端口 | 60123 |
| Dashboard 端口 | 7500 |
| 认证 Token | openclaw-platform-token-2026 |

## 🚀 快速部署

### 1. 上传配置文件到服务器

```bash
# 从本地电脑执行
scp /Users/mac/Documents/GitHub/openclaw/apps/chat-lite/config/frps.ini root@192.168.31.154:/etc/frp/frps.ini
scp /Users/mac/Documents/GitHub/openclaw/apps/chat-lite/scripts/check-frp-status.sh root@192.168.31.154:/
```

### 2. SSH 登录服务器

```bash
ssh root@192.168.31.154
```

### 3. 安装 FRP 服务器

```bash
# 创建目录
mkdir -p /etc/frp
mkdir -p /var/log/frp

# 下载 FRP（根据你的服务器架构）
# ARM 架构（如树莓派）
wget https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_linux_arm.tar.gz

# x86_64 架构
wget https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_linux_amd64.tar.gz

# 解压
tar -xzf frp_*.tar.gz
cd frp_*

# 移动到系统目录
mv frps /usr/local/bin/
chmod +x /usr/local/bin/frps
```

### 4. 配置 FRP 服务器

```bash
# 复制配置文件
cp /Users/mac/Documents/GitHub/openclaw/apps/chat-lite/config/frps.ini /etc/frp/frps.ini

# 或使用以下命令创建配置文件
cat > /etc/frp/frps.ini << 'EOF'
[common]
bind_addr = 0.0.0.0
bind_port = 7000
token = openclaw-platform-token-2026
log_file = /var/log/frp/frps.log
log_level = info
log_max_days = 7
dashboard_addr = 0.0.0.0
dashboard_port = 7500
dashboard_user = admin
dashboard_pwd = admin123
max_pool_count = 5
tcp_mux = true
heartbeat_timeout = 90
EOF
```

### 5. 启动 FRP 服务器

```bash
# 方法 1：前台运行（用于测试）
frps -c /etc/frp/frps.ini

# 方法 2：后台运行
nohup frps -c /etc/frp/frps.ini > /var/log/frp/frps.log 2>&1 &

# 方法 3：使用 systemd（推荐）
cat > /etc/systemd/system/frps.service << 'EOF'
[Unit]
Description=frp Server
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/frps -c /etc/frp/frps.ini
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

# 启动服务
systemctl daemon-reload
systemctl enable frps
systemctl start frps
systemctl status frps
```

### 6. 配置防火墙

```bash
# Ubuntu UFW
ufw allow 7000/tcp
ufw allow 60123/tcp
ufw allow 7500/tcp
ufw reload

# CentOS Firewalld
firewall-cmd --permanent --add-port=7000/tcp
firewall-cmd --permanent --add-port=60123/tcp
firewall-cmd --permanent --add-port=7500/tcp
firewall-cmd --reload

# 或直接关闭防火墙（不推荐生产环境）
systemctl stop firewalld
```

### 7. 验证服务器运行

```bash
# 检查进程
ps aux | grep frps

# 检查端口
netstat -tlnp | grep 7000
netstat -tlnp | grep 60123

# 查看日志
tail -f /var/log/frp/frps.log

# 测试连接
curl http://localhost:7500
```

## 🔍 故障排查

### 服务器无法启动

```bash
# 查看错误日志
tail -50 /var/log/frp/frps.log

# 检查配置文件语法
frps -c /etc/frp/frps.ini

# 检查端口占用
lsof -i :7000
lsof -i :7500
```

### 客户端无法连接

```bash
# 检查防火墙
ufw status
# 或
firewall-cmd --list-all

# 检查网络连通性
ping 客户端 IP

# 查看连接日志
tail -f /var/log/frp/frps.log | grep "client"
```

### 隧道未建立

```bash
# 查看客户端连接状态
netstat -an | grep 60123

# 查看 Dashboard
# 访问 http://192.168.31.154:7500
# 用户名：admin
# 密码：admin123
```

## 📊 监控和维护

### 查看运行状态

```bash
# systemd 状态
systemctl status frps

# 进程信息
ps aux | grep frps

# 资源使用
top -p $(pgrep frps)
```

### 查看日志

```bash
# 实时日志
tail -f /var/log/frp/frps.log

# 最近错误
grep -i error /var/log/frp/frps.log | tail -20

# 按日期查看
ls -lh /var/log/frp/
```

### 重启服务

```bash
# systemd
systemctl restart frps

# 手动
pkill frps
sleep 2
frps -c /etc/frp/frps.ini &
```

### 停止服务

```bash
# systemd
systemctl stop frps

# 手动
pkill frps
```

## 🔐 安全建议

1. **修改默认密码**
   - 修改 Dashboard 密码
   - 使用强 Token

2. **限制访问 IP**
   ```ini
   [common]
   allow_ports = 60123
   ```

3. **启用 HTTPS**
   - 配置 SSL 证书
   - 使用 WSS 协议

4. **定期更新**
   - 关注 FRP 安全更新
   - 定期升级版本

## 📞 技术支持

- FRP 官方文档：https://github.com/fatedier/frp
- 问题反馈：查看 /var/log/frp/frps.log
