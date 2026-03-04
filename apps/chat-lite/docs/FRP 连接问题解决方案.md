# FRP 连接问题解决方案

## 🔍 问题诊断结果

```
错误：dial tcp 192.168.31.154:7000: i/o timeout

诊断结果：❌ 服务器完全无法访问
- Ping 测试：❌ 失败
- 端口测试：❌ 失败
```

## 📋 网络环境

| 设备 | IP 地址 | 状态 |
|------|---------|------|
| 你的电脑 | 192.168.31.204 | ✅ 正常 |
| 服务器 | 192.168.31.154 | ❌ 无法访问 |
| 网关/路由器 | 192.168.31.1 | - |

## 🛠️ 解决步骤

### 步骤 1：确认服务器状态

**问题**：服务器可能已关机或网络断开

**检查方法**：
```bash
# 1. Ping 测试
ping 192.168.31.154

# 2. 检查 ARP 缓存（确认服务器 MAC 地址）
arp -a | grep 192.168.31.154
```

**如果 Ping 不通**：
1. 确认服务器已开机
2. 检查服务器网线/WiFi 连接
3. 确认服务器 IP 地址是否变更

### 步骤 2：尝试 SSH 连接

```bash
# 尝试 SSH 连接
ssh root@192.168.31.154

# 如果 SSH 也连不上，说明服务器完全离线
# 需要到服务器现场检查和开机
```

### 步骤 3：检查服务器网络配置

**如果 SSH 能连接**，在服务器上执行：

```bash
# 1. 检查服务器 IP
ip addr show

# 2. 检查网络连通性
ping 192.168.31.1

# 3. 检查防火墙
ufw status
# 或
firewall-cmd --list-all

# 4. 检查 FRP 进程
ps aux | grep frps

# 5. 检查 FRP 监听端口
netstat -tlnp | grep 7000
```

### 步骤 4：启动 FRP 服务器

**在服务器上执行**：

```bash
# 方法 1：使用 systemd
systemctl start frps
systemctl enable frps
systemctl status frps

# 方法 2：手动启动
cd /opt/frp
./frps -c /etc/frp/frps.ini

# 方法 3：后台运行
nohup frps -c /etc/frp/frps.ini > /var/log/frp/frps.log 2>&1 &
```

### 步骤 5：配置防火墙

**在服务器上执行**：

```bash
# Ubuntu/Debian
ufw allow 7000/tcp
ufw allow 60123/tcp
ufw reload
ufw status

# CentOS/RHEL
firewall-cmd --permanent --add-port=7000/tcp
firewall-cmd --permanent --add-port=60123/tcp
firewall-cmd --reload
firewall-cmd --list-all

# 或临时关闭防火墙（测试用）
systemctl stop firewalld
# 或
ufw disable
```

### 步骤 6：验证连接

**在你的电脑上执行**：

```bash
# 1. Ping 测试
ping 192.168.31.154

# 2. 端口测试
nc -zv 192.168.31.154 7000

# 3. 启动 FRP 客户端
frpc -c ~/.openclaw-frp/frpc.ini
```

## 🔧 常见问题

### 问题 1：服务器关机了

**解决**：到服务器现场开机，然后执行：
```bash
ssh root@192.168.31.154
systemctl start frps
```

### 问题 2：IP 地址变更

**解决**：检查服务器当前 IP
```bash
# 在服务器上
ip addr show

# 或使用路由器管理界面查看
# 通常路由器地址是 192.168.31.1
# 浏览器访问 http://192.168.31.1
```

### 问题 3：防火墙阻止

**解决**：在服务器上开放端口
```bash
ufw allow 7000/tcp
ufw allow 60123/tcp
```

### 问题 4：FRP 未安装

**解决**：在服务器上安装 FRP
```bash
# 下载
wget https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_linux_amd64.tar.gz

# 解压
tar -xzf frp_*.tar.gz
cd frp_*

# 安装
sudo mv frps /usr/local/bin/
sudo mkdir -p /etc/frp
sudo cp frps.ini /etc/frp/
```

### 问题 5：网络隔离

**解决**：检查路由器设置
1. 确认没有启用 AP 隔离
2. 确认没有 VLAN 隔离
3. 重启路由器

## 📞 快速修复命令

```bash
# 一键修复（如果 SSH 能连接）
ssh root@192.168.31.154 << 'EOF'
# 启动 FRP
systemctl start frps

# 开放防火墙
ufw allow 7000/tcp
ufw allow 60123/tcp

# 检查状态
systemctl status frps
netstat -tlnp | grep 7000
EOF
```

## ✅ 验证成功

当看到以下输出时，说明连接成功：

```bash
# 端口测试成功
nc -zv 192.168.31.154 7000
# 输出：Connection to 192.168.31.154 7000 port [tcp/*] succeeded!

# FRP 客户端启动成功
frpc -c ~/.openclaw-frp/frpc.ini
# 输出：login to the server succeeded
```

## 📊 联系支持

如果以上方法都无法解决，请提供：
1. `ping 192.168.31.154` 的输出
2. `ssh root@192.168.31.154` 的输出
3. 服务器是否物理可达（能否到现场操作）
