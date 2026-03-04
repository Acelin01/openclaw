#!/bin/bash
# OpenClaw 自动配置脚本 (非交互模式)
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 OpenClaw 自动配置 (非交互模式)${NC}"
echo ""

# 配置变量
FRP_SERVER_ADDR="192.168.31.154"
FRP_SERVER_PORT="7000"
FRP_TOKEN="openclaw-platform-token-2026"
INSTALL_DIR="$HOME/.openclaw-frp"
OPENCLAW_CONFIG="$HOME/.openclaw/openclaw.json"
MACHINE_ID="machine-$(hostname | tr -d ' ')"

# 1. 检查依赖
echo "✅ 检查依赖..."
command -v python3 >/dev/null || { echo "❌ Python3 未安装"; exit 1; }
command -v curl >/dev/null || { echo "❌ curl 未安装"; exit 1; }
command -v tar >/dev/null || { echo "❌ tar 未安装"; exit 1; }
echo ""

# 2. 配置 Gateway
echo "⚙️  配置 Gateway..."
if [ ! -f "$OPENCLAW_CONFIG" ]; then
  echo "❌ OpenClaw 配置文件不存在"
  exit 1
fi

BACKUP_FILE="$OPENCLAW_CONFIG.bak.$(date +%Y%m%d%H%M%S)"
cp "$OPENCLAW_CONFIG" "$BACKUP_FILE"
echo "   备份：$BACKUP_FILE"

python3 << PYEOF
import json

with open('$OPENCLAW_CONFIG', 'r') as f:
    config = json.load(f)

config['gateway'] = {
    'mode': 'local',
    'bind': 'lan',
    'port': 18789,
    'auth': {
        'mode': 'token',
        'token': 'openclaw-auto-token-2026'
    }
}

with open('$OPENCLAW_CONFIG', 'w') as f:
    json.dump(config, f, indent=2)

print("   ✅ Gateway 配置完成")
PYEOF
echo ""

# 3. 安装 FRP
echo "⚙️  安装 FRP..."
mkdir -p "$INSTALL_DIR"

if [ ! -f "$INSTALL_DIR/frpc" ]; then
  echo "   下载 FRP..."
  cd /tmp
  curl -sL "https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_darwin_arm64.tar.gz" -o frp.tar.gz
  tar xzf frp.tar.gz
  cp frp_0.61.1_darwin_arm64/frpc "$INSTALL_DIR/"
  chmod +x "$INSTALL_DIR/frpc"
  echo "   ✅ FRP 安装完成"
else
  echo "   ✅ FRP 已安装"
fi

# 4. 配置 FRP
echo "⚙️  配置 FRP..."
PORT_OFFSET=$(echo "$MACHINE_ID" | cksum | cut -d' ' -f1 | awk '{print $1 % 1000 + 60000}')

cat > "$INSTALL_DIR/frpc.ini" << FRPCEOF
[common]
server_addr = "$FRP_SERVER_ADDR"
server_port = $FRP_SERVER_PORT
token = "$FRP_TOKEN"
client_id = "$MACHINE_ID"
log_file = "$INSTALL_DIR/frpc.log"
log_level = info

[openclaw-gateway]
type = tcp
local_ip = 127.0.0.1
local_port = 18789
remote_port = $PORT_OFFSET
health_check_type = tcp
health_check_interval_s = 30
FRPCEOF

echo "   ✅ FRP 配置完成"
echo "   映射端口：$PORT_OFFSET"
echo ""

# 5. 启动服务
echo "🔄 启动服务..."

# 启动 FRP
pkill -f "frpc" 2>/dev/null || true
sleep 1
cd "$INSTALL_DIR"
nohup ./frpc -c frpc.ini > /dev/null 2>&1 &
echo $! > "$INSTALL_DIR/frpc.pid"
sleep 3

if ps -p $(cat "$INSTALL_DIR/frpc.pid" 2>/dev/null) > /dev/null; then
  echo "   ✅ FRP 已启动 (PID: $(cat $INSTALL_DIR/frpc.pid))"
else
  echo "   ⚠️  FRP 启动失败"
fi
echo ""

# 6. 显示配置信息
echo "============================================================="
echo "🎉 配置完成！"
echo "============================================================="
echo ""
echo "📊 机器人信息："
echo "   机器 ID: $MACHINE_ID"
echo "   FRP 端口：$PORT_OFFSET"
echo "   访问地址：ws://$FRP_SERVER_ADDR:$PORT_OFFSET"
echo "   Gateway Token: openclaw-auto-token-2026"
echo ""
echo "📁 配置文件："
echo "   OpenClaw: $OPENCLAW_CONFIG"
echo "   FRP: $INSTALL_DIR/frpc.ini"
echo "   FRP 日志：$INSTALL_DIR/frpc.log"
echo ""
echo "🔧 常用命令："
echo "   查看 FRP 状态：tail -f $INSTALL_DIR/frpc.log"
echo "   重启 FRP: cd $INSTALL_DIR && ./frpc -c frpc.ini &"
echo ""

# 显示注册信息
echo "📋 平台注册信息："
echo "================================"
cat << REGEOF
【机器人注册信息】

机器 ID: $MACHINE_ID
配置时间：$(date '+%Y-%m-%d %H:%M:%S')

FRP 配置:
  - 服务端：$FRP_SERVER_ADDR:$FRP_SERVER_PORT
  - 映射端口：$PORT_OFFSET
  - 访问地址：ws://$FRP_SERVER_ADDR:$PORT_OFFSET

Gateway 配置:
  - Token: openclaw-auto-token-2026
  - 监听：0.0.0.0:18789
REGEOF
echo "================================"
echo ""
