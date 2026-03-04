#!/bin/bash
# 服务器端 FRP 状态检查脚本
# 使用方法：在服务器 192.168.31.154 上执行 bash check-frp-status.sh

echo "🔍 检查 FRP 服务器状态..."
echo "================================"
echo ""

# 1. 检查 FRP 服务器进程
echo "1️⃣  FRP 服务器进程 (frps)："
if ps aux | grep -v grep | grep frps > /dev/null; then
    echo "   ✅ FRP 服务器正在运行"
    ps aux | grep -v grep | grep frps
else
    echo "   ❌ FRP 服务器未运行"
    echo "   启动命令：frps -c /path/to/frps.ini"
fi
echo ""

# 2. 检查 FRP 服务器监听端口
echo "2️⃣  FRP 服务器监听端口："
if command -v netstat > /dev/null; then
    netstat -tlnp 2>/dev/null | grep -E "7000|60123" || echo "   未找到监听端口"
elif command -v ss > /dev/null; then
    ss -tlnp 2>/dev/null | grep -E "7000|60123" || echo "   未找到监听端口"
else
    echo "   ⚠️  netstat 和 ss 命令都不可用"
fi
echo ""

# 3. 检查 FRP 配置文件
echo "3️⃣  FRP 配置文件："
FRPS_CONFIG="/etc/frp/frps.ini"
if [ -f "$FRPS_CONFIG" ]; then
    echo "   ✅ 配置文件存在：$FRPS_CONFIG"
    echo "   内容预览："
    head -20 "$FRPS_CONFIG"
else
    echo "   ❌ 配置文件不存在：$FRPS_CONFIG"
    # 查找可能的配置文件
    echo "   搜索其他位置的配置文件..."
    find / -name "frps.ini" 2>/dev/null | head -5
fi
echo ""

# 4. 检查防火墙状态
echo "4️⃣  防火墙状态："
if command -v ufw > /dev/null; then
    echo "   UFW 防火墙："
    ufw status 2>/dev/null || echo "   UFW 未启用"
elif command -v firewall-cmd > /dev/null; then
    echo "   Firewalld："
    firewall-cmd --list-all 2>/dev/null || echo "   Firewalld 未运行"
elif command -v iptables > /dev/null; then
    echo "   iptables 规则："
    iptables -L -n 2>/dev/null | grep -E "7000|60123" || echo "   未找到相关规则"
else
    echo "   ⚠️  未检测到防火墙工具"
fi
echo ""

# 5. 检查系统资源
echo "5️⃣  系统资源："
echo "   CPU 使用率："
top -bn1 | grep "Cpu(s)" | head -1
echo "   内存使用率："
free -h | grep Mem
echo "   磁盘使用率："
df -h | grep -E "/$|/home" | head -2
echo ""

# 6. 检查网络连接
echo "6️⃣  网络连接："
echo "   活动连接数："
netstat -an 2>/dev/null | wc -l || echo "   无法统计"
echo "   FRP 相关连接："
netstat -an 2>/dev/null | grep -E "7000|60123" | head -10 || echo "   无相关连接"
echo ""

# 7. 查看 FRP 日志
echo "7️⃣  FRP 日志（最近 10 行）："
FRPS_LOG="/var/log/frp/frps.log"
if [ -f "$FRPS_LOG" ]; then
    tail -10 "$FRPS_LOG"
else
    echo "   日志文件不存在：$FRPS_LOG"
    # 查找可能的日志文件
    echo "   搜索其他位置的日志..."
    find /var/log -name "*frp*" 2>/dev/null | head -5
fi
echo ""

echo "================================"
echo "📋 快速启动/重启命令"
echo "================================"
echo ""
echo "# 启动 FRP 服务器"
echo "frps -c /etc/frp/frps.ini"
echo ""
echo "# 后台运行 FRP 服务器"
echo "nohup frps -c /etc/frp/frps.ini > /var/log/frp/frps.log 2>&1 &"
echo ""
echo "# 查看 FRP 进程"
echo "ps aux | grep frps"
echo ""
echo "# 停止 FRP 进程"
echo "pkill frps"
echo ""
echo "# 重启 FRP 服务器"
echo "pkill frps && sleep 2 && frps -c /etc/frp/frps.ini &"
echo ""
echo "================================"
