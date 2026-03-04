#!/bin/bash
# FRP 连接问题交互式诊断工具

SERVER_IP="192.168.31.154"

echo "🔍 FRP 连接问题交互式诊断"
echo "================================"
echo ""

# 1. Ping 测试
echo "步骤 1: Ping 测试"
echo "--------------------------------"
if ping -c 3 -W 1 ${SERVER_IP} > /dev/null 2>&1; then
    echo "✅ Ping 成功！服务器在线"
    CAN_PING=true
else
    echo "❌ Ping 失败！服务器离线"
    echo ""
    echo "请选择操作："
    echo "1. 继续尝试 SSH 连接"
    echo "2. 退出（需要到服务器现场开机）"
    read -p "请输入选项 (1/2): " choice
    
    if [ "$choice" = "2" ]; then
        echo ""
        echo "📍 请到服务器现场执行以下操作："
        echo "   1. 确认服务器已开机"
        echo "   2. 确认网络连接正常"
        echo "   3. 记下服务器 IP 地址"
        exit 1
    fi
fi

echo ""

# 2. SSH 测试
echo "步骤 2: SSH 连接测试"
echo "--------------------------------"
echo "尝试 SSH 连接..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes ${SERVER_IP} "echo '连接成功'" > /dev/null 2>&1; then
    echo "✅ SSH 连接成功！"
    CAN_SSH=true
else
    echo "❌ SSH 连接失败"
    echo ""
    echo "可能原因："
    echo "  - SSH 服务未启动"
    echo "  - 防火墙阻止 SSH"
    echo "  - 服务器不是 Linux 系统"
    echo ""
    echo "建议："
    echo "  1. 确认服务器操作系统"
    echo "  2. 检查 SSH 服务状态"
    echo "  3. 使用 VNC/显示器 直接操作服务器"
    exit 1
fi

echo ""

# 3. 检查 FRP 服务器状态
echo "步骤 3: 检查 FRP 服务器状态"
echo "--------------------------------"
ssh ${SERVER_IP} << 'SSHCOMMAND'
echo "检查 FRP 进程..."
if ps aux | grep -v grep | grep frps > /dev/null; then
    echo "✅ FRP 服务器正在运行"
    ps aux | grep -v grep | grep frps
else
    echo "❌ FRP 服务器未运行"
fi

echo ""
echo "检查 FRP 端口..."
if netstat -tlnp 2>/dev/null | grep -q 7000; then
    echo "✅ 端口 7000 正在监听"
else
    echo "❌ 端口 7000 未监听"
fi

echo ""
echo "检查防火墙..."
if command -v ufw > /dev/null; then
    ufw status | head -5
elif command -v firewall-cmd > /dev/null; then
    firewall-cmd --list-all | head -10
else
    echo "未检测到防火墙工具"
fi
SSHCOMMAND

echo ""
echo "步骤 4: 启动 FRP 服务器"
echo "--------------------------------"
read -p "是否启动/重启 FRP 服务器？(y/n): " restart

if [ "$restart" = "y" ]; then
    ssh ${SERVER_IP} << 'SSHCOMMAND'
echo "停止旧进程..."
pkill frps 2>/dev/null
sleep 1

echo "启动 FRP 服务器..."
if [ -f /etc/frp/frps.ini ]; then
    nohup frps -c /etc/frp/frps.ini > /var/log/frp/frps.log 2>&1 &
    sleep 2
    if ps aux | grep -v grep | grep frps > /dev/null; then
        echo "✅ FRP 启动成功"
    else
        echo "❌ FRP 启动失败"
        tail -10 /var/log/frp/frps.log
    fi
else
    echo "❌ 配置文件不存在：/etc/frp/frps.ini"
    echo "请先上传配置文件"
fi

echo ""
echo "验证端口..."
netstat -tlnp | grep 7000 || echo "端口未监听"
SSHCOMMAND
fi

echo ""
echo "步骤 5: 测试本地连接"
echo "--------------------------------"
echo "测试本地到服务器的连接..."
if nc -z -w 2 ${SERVER_IP} 7000 > /dev/null 2>&1; then
    echo "✅ 可以连接到 FRP 服务器！"
    echo ""
    echo "🎉 问题已解决！"
    echo "现在可以启动本地 FRP 客户端："
    echo "  frpc -c ~/.openclaw-frp/frpc.ini"
else
    echo "❌ 仍然无法连接"
    echo ""
    echo "可能需要："
    echo "  1. 在服务器上开放防火墙"
    echo "  2. 检查 FRP 配置"
    echo "  3. 重启服务器网络"
fi

echo ""
echo "================================"
echo "诊断完成！"
echo "================================"
