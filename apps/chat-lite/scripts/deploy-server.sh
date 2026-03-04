#!/bin/bash
# 服务器一键部署脚本
# 使用方法：./deploy-server.sh root@192.168.31.154

SERVER_USER="${1:-root}"
SERVER_HOST="${2:-192.168.31.154}"
SERVER="${SERVER_USER}@${SERVER_HOST}"

echo "🚀 开始部署 FRP 服务器..."
echo "================================"
echo "服务器：${SERVER}"
echo "================================"
echo ""

# 1. 测试连接
echo "1️⃣  测试服务器连接..."
if ping -c 1 -W 2 ${SERVER_HOST} > /dev/null 2>&1; then
    echo "   ✅ 服务器可达"
else
    echo "   ⚠️  服务器不可达，继续尝试 SSH..."
fi

# 2. 上传配置文件
echo ""
echo "2️⃣  上传配置文件..."
scp /Users/mac/Documents/GitHub/openclaw/apps/chat-lite/config/frps.ini ${SERVER}:/tmp/frps.ini
if [ $? -eq 0 ]; then
    echo "   ✅ 配置文件已上传"
else
    echo "   ❌ 上传失败，请检查 SSH 连接"
    exit 1
fi

# 3. SSH 执行部署
echo ""
echo "3️⃣  在服务器上执行部署..."
ssh ${SERVER} << 'EOF'
# 创建目录
mkdir -p /etc/frp
mkdir -p /var/log/frp

# 移动配置文件
mv /tmp/frps.ini /etc/frp/frps.ini
echo "✅ 配置文件已放置"

# 检查 FRP 是否已安装
if command -v frps > /dev/null 2>&1; then
    echo "✅ FRP 已安装"
    frps --version
else
    echo "⚠️  FRP 未安装，请手动安装"
    echo "下载地址：https://github.com/fatedier/frp/releases"
fi

# 检查端口
echo ""
echo "📊 当前端口状态："
netstat -tlnp 2>/dev/null | grep -E "7000|60123" || echo "未找到相关端口"

# 检查进程
echo ""
echo "📊 FRP 进程状态："
ps aux | grep -v grep | grep frps || echo "FRP 服务器未运行"

# 启动 FRP
echo ""
echo "🚀 启动 FRP 服务器..."
pkill frps 2>/dev/null
sleep 1
nohup frps -c /etc/frp/frps.ini > /var/log/frp/frps.log 2>&1 &
sleep 2

# 验证启动
if ps aux | grep -v grep | grep frps > /dev/null; then
    echo "✅ FRP 服务器已启动"
    ps aux | grep -v grep | grep frps
else
    echo "❌ FRP 服务器启动失败"
    echo "查看日志：tail /var/log/frp/frps.log"
fi

# 显示日志
echo ""
echo "📋 最近日志："
tail -20 /var/log/frp/frps.log
EOF

echo ""
echo "================================"
echo "✅ 部署完成！"
echo "================================"
echo ""
echo "📊 验证命令："
echo "   ssh ${SERVER} 'ps aux | grep frps'"
echo "   ssh ${SERVER} 'netstat -tlnp | grep 7000'"
echo "   ssh ${SERVER} 'tail /var/log/frp/frps.log'"
echo ""
echo "🌐 Dashboard 地址："
echo "   http://${SERVER_HOST}:7500"
echo "   用户名：admin"
echo "   密码：admin123"
echo ""
