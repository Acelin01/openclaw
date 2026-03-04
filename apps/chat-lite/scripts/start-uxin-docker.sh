#!/bin/bash
# 在 Docker 上启动客户机器人 uxin

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"
cd "$SCRIPT_DIR"

echo "🚀 启动客户机器人 uxin (Docker 版)"
echo "================================"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker Desktop"
    echo "   https://www.docker.com/products/docker-desktop"
    exit 1
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装"
    exit 1
fi

# 创建配置目录
mkdir -p docker

# 检查配置文件
if [ ! -f docker/frps.ini ]; then
    echo "⚠️  创建 FRP 配置文件..."
    cat > docker/frps.ini << 'FRPCONFIG'
[common]
bind_addr = 0.0.0.0
bind_port = 7000
token = openclaw-platform-token-2026
log_file = /dev/stdout
log_level = info
dashboard_port = 7500
dashboard_user = admin
dashboard_pwd = admin123

[openclaw-gateway]
type = tcp
local_port = 18789
remote_port = 60123
health_check_type = tcp
health_check_interval_s = 30
FRPCONFIG
fi

echo "1️⃣  启动 Docker 容器..."
docker-compose -f docker-compose-uxin.yml up -d

echo ""
echo "2️⃣  等待服务启动..."
sleep 10

echo ""
echo "3️⃣  检查服务状态..."
docker-compose -f docker-compose-uxin.yml ps

echo ""
echo "4️⃣  查看日志..."
echo "   FRP 日志：docker-compose logs frps"
echo "   Gateway 日志：docker-compose logs openclaw-gateway"

echo ""
echo "================================"
echo "✅ 服务已启动！"
echo "================================"
echo ""
echo "📊 服务信息："
echo "   - FRP 服务器：127.0.0.1:7000"
echo "   - FRP 隧道：127.0.0.1:60123"
echo "   - Gateway: 127.0.0.1:18789"
echo "   - Dashboard: http://127.0.0.1:7500"
echo ""
echo "🔧 管理命令："
echo "   - 查看状态：docker-compose -f docker-compose-uxin.yml ps"
echo "   - 查看日志：docker-compose -f docker-compose-uxin.yml logs -f"
echo "   - 停止服务：docker-compose -f docker-compose-uxin.yml down"
echo "   - 重启服务：docker-compose -f docker-compose-uxin.yml restart"
echo ""
echo "📝 下一步："
echo "   1. 更新 agents.config.json（已自动配置）"
echo "   2. 刷新浏览器 http://localhost:3003"
echo "   3. 选择 客户机器人 uxin 测试"
echo ""
