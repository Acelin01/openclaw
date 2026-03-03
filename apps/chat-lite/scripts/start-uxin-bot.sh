#!/bin/bash
# 启动客户机器人 uxin 服务
# 包括 FRP 隧道和 Gateway 服务

set -e

echo "🤖 启动客户机器人 uxin 服务..."
echo "================================"

# 检查 FRP 是否安装
if ! command -v frpc &> /dev/null; then
    echo "❌ FRP 客户端未安装，请先安装："
    echo "   brew install frp"
    echo "   或从 https://github.com/fatedier/frp/releases 下载"
    exit 1
fi

# 创建日志目录
mkdir -p ~/.openclaw-frp/logs

# 启动 FRP 客户端
echo "📡 启动 FRP 隧道..."
echo "   配置文件：~/.openclaw-frp/frpc.ini"
echo "   日志文件：~/.openclaw-frp/logs/frpc.log"

frpc -c ~/.openclaw-frp/frpc.ini > ~/.openclaw-frp/logs/frpc.log 2>&1 &
FRP_PID=$!

echo "✅ FRP 已启动 (PID: $FRP_PID)"

# 等待 FRP 连接
echo "⏳ 等待 FRP 连接服务器..."
sleep 3

# 检查 FRP 状态
if ps -p $FRP_PID > /dev/null; then
    echo "✅ FRP 运行正常"
else
    echo "❌ FRP 启动失败，请检查日志："
    cat ~/.openclaw-frp/logs/frpc.log
    exit 1
fi

# 检查本地 Gateway 端口
echo ""
echo "🔌 检查本地 Gateway 服务..."
if lsof -i :18789 > /dev/null 2>&1; then
    echo "✅ 本地 Gateway 已运行 (端口 18789)"
else
    echo "⚠️  本地 Gateway 未运行"
    echo "   请先启动 Gateway 服务："
    echo "   cd /Users/mac/Documents/GitHub/openclaw"
    echo "   pnpm gateway:dev"
fi

echo ""
echo "================================"
echo "📊 服务状态："
echo "   - FRP 隧道：运行中"
echo "   - 本地端口：18789"
echo "   - 远程端口：60123"
echo "   - 服务器：192.168.31.154:7000"
echo ""
echo "🔗 访问地址："
echo "   - 本地：ws://127.0.0.1:18789"
echo "   - 远程：ws://192.168.31.154:60123"
echo ""
echo "📝 停止服务："
echo "   kill $FRP_PID"
echo "   或 pkill -f 'frpc -c'"
echo "================================"

# 保持脚本运行
wait $FRP_PID
