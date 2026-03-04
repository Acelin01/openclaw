#!/bin/bash
# FRP 连接问题诊断和修复脚本

echo "🔍 FRP 连接问题诊断工具"
echo "================================"
echo ""

SERVER_IP="192.168.31.154"
SERVER_PORT="7000"

# 1. 检查网络连通性
echo "1️⃣  检查网络连通性"
echo "--------------------------------"

# Ping 测试
echo -n "Ping 测试... "
if ping -c 2 -W 1 ${SERVER_IP} > /dev/null 2>&1; then
    echo "✅ 成功"
    PING_OK=true
else
    echo "❌ 失败"
    PING_OK=false
fi

# 端口测试
echo -n "端口 ${SERVER_PORT} 测试... "
if nc -z -w 2 ${SERVER_IP} ${SERVER_PORT} > /dev/null 2>&1; then
    echo "✅ 成功"
    PORT_OK=true
else
    echo "❌ 失败"
    PORT_OK=false
fi

echo ""

# 2. 诊断结果和建议
echo "2️⃣  诊断结果"
echo "--------------------------------"

if [ "$PING_OK" = true ] && [ "$PORT_OK" = true ]; then
    echo "✅ 网络正常，问题可能在 FRP 配置"
    echo ""
    echo "解决方案："
    echo "1. 检查 FRP 服务器是否运行：ssh root@${SERVER_IP} 'ps aux | grep frps'"
    echo "2. 检查 FRP 配置：ssh root@${SERVER_IP} 'cat /etc/frp/frps.ini'"
    echo "3. 重启 FRP 服务：ssh root@${SERVER_IP} 'systemctl restart frps'"
    
elif [ "$PING_OK" = true ] && [ "$PORT_OK" = false ]; then
    echo "⚠️  服务器可达但端口不通"
    echo ""
    echo "可能原因："
    echo "  - FRP 服务器未启动"
    echo "  - 防火墙阻止了端口"
    echo "  - 端口配置错误"
    echo ""
    echo "解决方案："
    echo "1. SSH 登录服务器：ssh root@${SERVER_IP}"
    echo "2. 检查 FRP 进程：ps aux | grep frps"
    echo "3. 检查防火墙：ufw status 或 firewall-cmd --list-all"
    echo "4. 启动 FRP：frps -c /etc/frp/frps.ini"
    echo "5. 开放端口：ufw allow ${SERVER_PORT}/tcp"
    
else
    echo "❌ 服务器完全无法访问"
    echo ""
    echo "可能原因："
    echo "  - 服务器已关机"
    echo "  - 网络不通（不在同一局域网）"
    echo "  - IP 地址错误"
    echo "  - 路由器/交换机问题"
    echo ""
    echo "解决方案："
    echo "1. 确认服务器 IP 地址是否正确"
    echo "2. 检查服务器是否开机"
    echo "3. 确认你在同一局域网（192.168.31.x 网段）"
    echo "4. 检查路由器设置"
    echo "5. 尝试其他设备访问服务器"
fi

echo ""
echo "3️⃣  网络配置检查"
echo "--------------------------------"

# 检查本地 IP
echo "本地网络配置："
ifconfig | grep -E "inet " | grep -v "127.0.0.1" | head -3

echo ""
echo "路由表："
netstat -rn | grep default | head -2

echo ""
echo "4️⃣  快速修复命令"
echo "--------------------------------"

cat << 'QUICKFIX'

如果服务器在局域网内，请执行：

# 方案 1: 重启服务器 FRP 服务
ssh root@192.168.31.154 "systemctl restart frps"

# 方案 2: 手动启动 FRP
ssh root@192.168.31.154 "pkill frps; sleep 2; frps -c /etc/frp/frps.ini &"

# 方案 3: 检查并开放防火墙
ssh root@192.168.31.154 "ufw allow 7000/tcp"

# 方案 4: 查看 FRP 日志
ssh root@192.168.31.154 "tail -50 /var/log/frp/frps.log"

QUICKFIX

echo ""
echo "================================"
