#!/bin/bash
# 服务器现场快速部署脚本
# 使用方法：在服务器 192.168.31.154 上直接执行 bash setup-frp-server.sh

set -e

echo "🤖 OpenClaw FRP 服务器快速部署"
echo "================================"
echo ""

# 检查是否 root
if [ "$EUID" -ne 0 ] && [ "$USER" != "root" ]; then 
    echo "⚠️  请使用 root 用户执行此脚本"
    echo "   sudo bash $0"
    exit 1
fi

# 1. 检查网络
echo "1️⃣  检查网络配置"
echo "--------------------------------"
echo "当前 IP 地址："
ip addr show | grep "inet " | grep -v "127.0.0.1" | head -3

echo ""
echo "网关："
ip route | grep default | head -1

echo ""
read -p "确认服务器 IP 是 192.168.31.154 吗？(y/n): " confirm_ip
if [ "$confirm_ip" != "y" ]; then
    echo "⚠️  IP 地址不匹配，请修改配置脚本中的 IP 地址"
fi

# 2. 安装 FRP
echo ""
echo "2️⃣  安装 FRP 服务器"
echo "--------------------------------"

if command -v frps > /dev/null 2>&1; then
    echo "✅ FRP 已安装"
    frps --version
else
    echo "正在下载 FRP..."
    cd /tmp
    
    # 检测架构
    ARCH=$(uname -m)
    if [ "$ARCH" = "x86_64" ]; then
        FRP_FILE="frp_0.61.1_linux_amd64.tar.gz"
    elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
        FRP_FILE="frp_0.61.1_linux_arm64.tar.gz"
    elif [ "$ARCH" = "armv7l" ]; then
        FRP_FILE="frp_0.61.1_linux_arm.tar.gz"
    else
        echo "❌ 不支持的架构：$ARCH"
        exit 1
    fi
    
    wget -q "https://github.com/fatedier/frp/releases/download/v0.61.1/${FRP_FILE}"
    tar -xzf ${FRP_FILE}
    cd frp_*
    
    mv frps /usr/local/bin/
    chmod +x /usr/local/bin/frps
    
    echo "✅ FRP 安装完成"
    frps --version
    
    cd /
    rm -rf /tmp/frp_*
fi

# 3. 配置 FRP
echo ""
echo "3️⃣  配置 FRP 服务器"
echo "--------------------------------"

mkdir -p /etc/frp
mkdir -p /var/log/frp

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

echo "✅ 配置文件已创建：/etc/frp/frps.ini"
cat /etc/frp/frps.ini

# 4. 启动 FRP
echo ""
echo "4️⃣  启动 FRP 服务器"
echo "--------------------------------"

# 停止旧进程
pkill frps 2>/dev/null || true
sleep 1

# 启动新进程
nohup frps -c /etc/frp/frps.ini > /var/log/frp/frps.log 2>&1 &
sleep 2

# 检查状态
if ps aux | grep -v grep | grep frps > /dev/null; then
    echo "✅ FRP 启动成功"
    ps aux | grep -v grep | grep frps
else
    echo "❌ FRP 启动失败"
    echo "日志："
    tail -20 /var/log/frp/frps.log
    exit 1
fi

# 5. 配置防火墙
echo ""
echo "5️⃣  配置防火墙"
echo "--------------------------------"

if command -v ufw > /dev/null; then
    echo "配置 UFW 防火墙..."
    ufw allow 7000/tcp 2>/dev/null || true
    ufw allow 60123/tcp 2>/dev/null || true
    ufw allow 7500/tcp 2>/dev/null || true
    echo "✅ UFW 规则已添加"
elif command -v firewall-cmd > /dev/null; then
    echo "配置 Firewalld..."
    firewall-cmd --permanent --add-port=7000/tcp 2>/dev/null || true
    firewall-cmd --permanent --add-port=60123/tcp 2>/dev/null || true
    firewall-cmd --permanent --add-port=7500/tcp 2>/dev/null || true
    firewall-cmd --reload 2>/dev/null || true
    echo "✅ Firewalld 规则已添加"
else
    echo "⚠️  未检测到防火墙工具，请手动配置"
fi

# 6. 验证服务
echo ""
echo "6️⃣  验证服务状态"
echo "--------------------------------"

echo "FRP 进程："
ps aux | grep -v grep | grep frps

echo ""
echo "监听端口："
netstat -tlnp | grep frps || ss -tlnp | grep frps

echo ""
echo "防火墙状态："
if command -v ufw > /dev/null; then
    ufw status | head -5
elif command -v firewall-cmd > /dev/null; then
    firewall-cmd --list-all | head -10
fi

# 7. 完成
echo ""
echo "================================"
echo "✅ FRP 服务器部署完成！"
echo "================================"
echo ""
echo "📊 服务信息："
echo "   - FRP 端口：7000"
echo "   - 隧道端口：60123"
echo "   - Dashboard: http://$(hostname -I | awk '{print $1}'):7500"
echo "   - Dashboard 用户：admin"
echo "   - Dashboard 密码：admin123"
echo ""
echo "🔧 管理命令："
echo "   - 查看状态：ps aux | grep frps"
echo "   - 查看日志：tail -f /var/log/frp/frps.log"
echo "   - 停止服务：pkill frps"
echo "   - 重启服务：pkill frps && frps -c /etc/frp/frps.ini &"
echo ""
echo "📝 下一步："
echo "   1. 确认防火墙已开放端口 7000 和 60123"
echo "   2. 从客户端电脑测试：ssh root@$(hostname -I | awk '{print $1}')"
echo "   3. 启动客户端 FRP: frpc -c ~/.openclaw-frp/frpc.ini"
echo ""
