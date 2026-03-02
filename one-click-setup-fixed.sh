#!/bin/bash
# ============================================
# OpenClaw 机器人分享 - 一键配置脚本 (修复版)
# ============================================
# 使用方法：
#   curl -O https://your-server/one-click-setup.sh
#   chmod +x one-click-setup.sh
#   ./one-click-setup.sh
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
FRP_SERVER_ADDR="192.168.31.154"
FRP_SERVER_PORT="7000"
FRP_TOKEN="openclaw-platform-token-2026"

echo ""
echo "============================================================="
echo "🚀 OpenClaw 机器人分享 - 一键配置 (修复版)"
echo "============================================================="
echo ""

# 检测系统
OS=$(uname -s)
ARCH=$(uname -m)
MACHINE_ID="machine-$(hostname | tr -d ' ')"

# 检查必要依赖
check_dependencies() {
  echo "============================================================="
  echo "0️⃣  检查依赖"
  echo "============================================================="
  echo ""
  
  # 检查 python3
  if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 未安装${NC}"
    echo "请安装：brew install python3"
    exit 1
  fi
  echo -e "${GREEN}✅ Python3: $(python3 --version)${NC}"
  
  # 检查 curl
  if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl 未安装${NC}"
    echo "请安装：brew install curl"
    exit 1
  fi
  echo -e "${GREEN}✅ curl: installed${NC}"
  
  # 检查 tar
  if ! command -v tar &> /dev/null; then
    echo -e "${RED}❌ tar 未安装${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ tar: installed${NC}"
  
  echo ""
}

check_dependencies

case $OS-$ARCH in
  Darwin-arm64|Darwin-arm)
    FRP_URL="https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_darwin_arm64.tar.gz"
    FRP_DIR="frp_0.61.1_darwin_arm64"
    ;;
  Darwin-x86_64)
    FRP_URL="https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_darwin_amd64.tar.gz"
    FRP_DIR="frp_0.61.1_darwin_amd64"
    ;;
  Linux-x86_64)
    FRP_URL="https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_linux_amd64.tar.gz"
    FRP_DIR="frp_0.61.1_linux_amd64"
    ;;
  Linux-aarch64|Linux-arm64)
    FRP_URL="https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_linux_arm64.tar.gz"
    FRP_DIR="frp_0.61.1_linux_arm64"
    ;;
  *)
    echo -e "${RED}❌ 不支持的操作系统：$OS $ARCH${NC}"
    exit 1
    ;;
esac

echo -e "${BLUE}📊 检测到系统：${NC}$OS $ARCH"
echo -e "${BLUE}📊 机器 ID: ${NC}$MACHINE_ID"
echo ""

# ============================================
# 步骤 1: 检查 OpenClaw 是否安装
# ============================================
echo "============================================================="
echo "1️⃣  检查 OpenClaw 安装"
echo "============================================================="
echo ""

if ! command -v openclaw &> /dev/null; then
  echo -e "${RED}❌ OpenClaw 未安装${NC}"
  echo ""
  echo "请先安装 OpenClaw："
  echo "  git clone https://github.com/openclaw/openclaw.git"
  echo "  cd openclaw"
  echo "  pnpm install"
  echo "  pnpm build"
  exit 1
else
  echo -e "${GREEN}✅ OpenClaw 已安装${NC}"
fi
echo ""

# ============================================
# 步骤 2: 配置 Gateway 远程访问
# ============================================
echo "============================================================="
echo "2️⃣  配置 Gateway 远程访问"
echo "============================================================="
echo ""

OPENCLAW_CONFIG="$HOME/.openclaw/openclaw.json"

if [ ! -f "$OPENCLAW_CONFIG" ]; then
  echo -e "${YELLOW}⚠️  OpenClaw 配置文件不存在${NC}"
  echo "请先运行：openclaw setup"
  exit 1
fi

# 备份原配置
BACKUP_FILE="$OPENCLAW_CONFIG.bak.$(date +%Y%m%d%H%M%S)"
cp "$OPENCLAW_CONFIG" "$BACKUP_FILE"
echo -e "${GREEN}✅ 已备份原配置：${NC}$BACKUP_FILE"

# 检查是否已有 gateway 配置
if grep -q '"gateway"' "$OPENCLAW_CONFIG"; then
  if grep -q '"bind": "lan"' "$OPENCLAW_CONFIG"; then
    echo -e "${GREEN}✅ Gateway 已配置为 LAN 模式${NC}"
  else
    echo -e "${YELLOW}⚠️  Gateway 已存在但未配置 LAN 模式${NC}"
    read -p "是否更新为 LAN 模式？[Y/n]: " UPDATE_GATEWAY
    if [[ ! $UPDATE_GATEWAY =~ ^[Nn]$ ]]; then
      python3 << PYEOF
import json

with open('$OPENCLAW_CONFIG', 'r') as f:
    config = json.load(f)

if 'gateway' not in config:
    config['gateway'] = {}

config['gateway']['bind'] = 'lan'
config['gateway']['mode'] = 'local'
config['gateway']['port'] = 18789

if 'auth' not in config['gateway']:
    config['gateway']['auth'] = {'mode': 'token', 'token': 'openclaw-gateway-token'}

with open('$OPENCLAW_CONFIG', 'w') as f:
    json.dump(config, f, indent=2)

print("✅ Gateway 配置已更新")
PYEOF
    fi
  fi
else
  echo "正在添加 gateway 配置..."
  read -p "设置 Gateway Token (用于认证): " GATEWAY_TOKEN
  GATEWAY_TOKEN=${GATEWAY_TOKEN:-"openclaw-gateway-$(date +%s)"}
  
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
        'token': '$GATEWAY_TOKEN'
    }
}

with open('$OPENCLAW_CONFIG', 'w') as f:
    json.dump(config, f, indent=2)

print("✅ Gateway 配置已添加")
PYEOF
fi

echo ""
echo -e "${GREEN}✅ Gateway 配置完成${NC}"
echo ""

# ============================================
# 步骤 3: 配置 AI 模型 API Key
# ============================================
echo "============================================================="
echo "3️⃣  配置 AI 模型 API Key"
echo "============================================================="
echo ""

echo "选择你要使用的 AI 模型提供商："
echo "  1) 阿里云通义千问 (推荐)"
echo "  2) DeepSeek"
echo "  3) OpenAI"
echo "  4) 跳过 (稍后手动配置)"
echo ""
read -p "请选择 [1-4]: " MODEL_CHOICE

case $MODEL_CHOICE in
  1)
    echo ""
    echo -e "${BLUE}阿里云通义千问${NC}"
    echo "获取 API Key: https://dashscope.console.aliyun.com/"
    echo ""
    read -p "输入 API Key: " API_KEY
    
    python3 << PYEOF
import json

with open('$OPENCLAW_CONFIG', 'r') as f:
    config = json.load(f)

if 'models' not in config:
    config['models'] = {'mode': 'merge', 'providers': {}}

config['models']['providers']['bailian'] = {
    'baseUrl': 'https://dashscope.aliyuncs.com/api/v1',
    'apiKey': '$API_KEY',
    'api': 'openai-completions',
    'models': [{
        'id': 'qwen3.5-plus',
        'name': '通义千问 3.5 Plus',
        'reasoning': False,
        'input': ['text'],
        'cost': {'input': 0, 'output': 0},
        'contextWindow': 1000000,
        'maxTokens': 65536
    }]
}

if 'agents' not in config:
    config['agents'] = {'defaults': {}}

config['agents']['defaults']['model'] = {'primary': 'bailian/qwen3.5-plus'}

with open('$OPENCLAW_CONFIG', 'w') as f:
    json.dump(config, f, indent=2)

print("✅ 阿里云模型配置已添加")
PYEOF
    ;;
  2)
    echo ""
    echo -e "${BLUE}DeepSeek${NC}"
    echo "获取 API Key: https://platform.deepseek.com/"
    echo ""
    read -p "输入 API Key: " API_KEY
    
    python3 << PYEOF
import json

with open('$OPENCLAW_CONFIG', 'r') as f:
    config = json.load(f)

if 'models' not in config:
    config['models'] = {'mode': 'merge', 'providers': {}}

config['models']['providers']['deepseek'] = {
    'baseUrl': 'https://api.deepseek.com/v1',
    'apiKey': '$API_KEY',
    'api': 'openai-completions',
    'models': [{
        'id': 'deepseek-chat',
        'name': 'DeepSeek Chat',
        'reasoning': False,
        'input': ['text'],
        'cost': {'input': 0, 'output': 0},
        'contextWindow': 128000,
        'maxTokens': 8192
    }]
}

if 'agents' not in config:
    config['agents'] = {'defaults': {}}

config['agents']['defaults']['model'] = {'primary': 'deepseek/deepseek-chat'}

with open('$OPENCLAW_CONFIG', 'w') as f:
    json.dump(config, f, indent=2)

print("✅ DeepSeek 模型配置已添加")
PYEOF
    ;;
  3)
    echo ""
    echo -e "${BLUE}OpenAI${NC}"
    echo "获取 API Key: https://platform.openai.com/"
    echo ""
    read -p "输入 API Key: " API_KEY
    
    python3 << PYEOF
import json

with open('$OPENCLAW_CONFIG', 'r') as f:
    config = json.load(f)

if 'models' not in config:
    config['models'] = {'mode': 'merge', 'providers': {}}

config['models']['providers']['openai'] = {
    'baseUrl': 'https://api.openai.com/v1',
    'apiKey': '$API_KEY',
    'api': 'openai-completions',
    'models': [{
        'id': 'gpt-4o',
        'name': 'GPT-4o',
        'reasoning': False,
        'input': ['text'],
        'cost': {'input': 0, 'output': 0},
        'contextWindow': 128000,
        'maxTokens': 16384
    }]
}

if 'agents' not in config:
    config['agents'] = {'defaults': {}}

config['agents']['defaults']['model'] = {'primary': 'openai/gpt-4o'}

with open('$OPENCLAW_CONFIG', 'w') as f:
    json.dump(config, f, indent=2)

print("✅ OpenAI 模型配置已添加")
PYEOF
    ;;
  *)
    echo -e "${YELLOW}⚠️  跳过模型配置，稍后可手动编辑 $OPENCLAW_CONFIG${NC}"
    ;;
esac

echo ""

# ============================================
# 步骤 4: 安装 FRP 客户端
# ============================================
echo "============================================================="
echo "4️⃣  安装 FRP 客户端"
echo "============================================================="
echo ""

INSTALL_DIR="$HOME/.openclaw-frp"

if [ -d "$INSTALL_DIR" ] && [ -f "$INSTALL_DIR/frpc" ]; then
  echo -e "${YELLOW}⚠️  FRP 客户端已安装${NC}"
  read -p "是否重新安装？[y/N]: " REINSTALL
  if [[ ! $REINSTALL =~ ^[Yy]$ ]]; then
    echo "跳过 FRP 安装"
    echo ""
  else
    echo "重新安装 FRP..."
  fi
fi

if [ ! -d "$INSTALL_DIR" ] || [ ! -f "$INSTALL_DIR/frpc" ]; then
  echo "📥 下载 FRP..."
  mkdir -p "$INSTALL_DIR"
  cd /tmp
  curl -sL "$FRP_URL" -o frp.tar.gz
  tar xzf frp.tar.gz
  cp "$FRP_DIR/frpc" "$INSTALL_DIR/"
  chmod +x "$INSTALL_DIR/frpc"
  echo -e "${GREEN}✅ FRP 客户端已安装${NC}"
fi

# 生成 FRP 配置
echo ""
echo "⚙️  生成 FRP 配置..."

# 分配端口（基于机器 ID 哈希）
PORT_OFFSET=$(echo "$MACHINE_ID" | cksum | cut -d' ' -f1 | awk '{print $1 % 1000 + 60000}')

# 使用 INI 格式（兼容性更好）
cat > "$INSTALL_DIR/frpc.ini" << FRPCEOF
# FRP 客户端配置 - OpenClaw
[common]
server_addr = "$FRP_SERVER_ADDR"
server_port = $FRP_SERVER_PORT
token = "$FRP_TOKEN"
client_id = "$MACHINE_ID"
log_file = "$INSTALL_DIR/frpc.log"
log_level = info
log_max_days = 7

[openclaw-gateway]
type = tcp
local_ip = 127.0.0.1
local_port = 18789
remote_port = $PORT_OFFSET
health_check_type = tcp
health_check_interval_s = 30
health_check_timeout_s = 10
health_check_max_failed = 3
FRPCEOF

echo -e "${GREEN}✅ FRP 配置已生成${NC}"
echo "   映射端口：$PORT_OFFSET"
echo "   配置文件：$INSTALL_DIR/frpc.ini"
echo ""

# ============================================
# 步骤 5: 启动服务
# ============================================
echo "============================================================="
echo "5️⃣  启动服务"
echo "============================================================="
echo ""

# 重启 Gateway
echo "🔄 重启 OpenClaw Gateway..."
pkill -f "openclaw.*gateway" 2>/dev/null || true
sleep 2

# 检查是否已有 Gateway 进程
if pgrep -f "openclaw.*gateway" > /dev/null; then
  echo -e "${GREEN}✅ Gateway 已在运行${NC}"
else
  echo "启动 Gateway..."
  
  # 尝试使用 openclaw 命令启动
  if command -v openclaw &> /dev/null; then
    openclaw gateway start &
    sleep 5
    
    if pgrep -f "openclaw.*gateway" > /dev/null; then
      echo -e "${GREEN}✅ Gateway 已启动${NC}"
    else
      echo -e "${YELLOW}⚠️  Gateway 启动失败，请手动运行：openclaw gateway start${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️  openclaw 命令不可用，请手动启动 Gateway${NC}"
  fi
fi

# 启动 FRP 客户端
echo ""
echo "🔄 启动 FRP 客户端..."
pkill -f "frpc" 2>/dev/null || true
sleep 1

cd "$INSTALL_DIR"
nohup ./frpc -c frpc.ini > /dev/null 2>&1 &
echo $! > "$INSTALL_DIR/frpc.pid"
sleep 3

if ps -p $(cat "$INSTALL_DIR/frpc.pid" 2>/dev/null) > /dev/null 2>&1; then
  echo -e "${GREEN}✅ FRP 客户端已启动${NC}"
  echo "   PID: $(cat $INSTALL_DIR/frpc.pid)"
else
  echo -e "${RED}❌ FRP 客户端启动失败${NC}"
  echo "查看日志：tail -f $INSTALL_DIR/frpc.log"
fi

echo ""

# ============================================
# 步骤 6: 验证配置
# ============================================
echo "============================================================="
echo "6️⃣  验证配置"
echo "============================================================="
echo ""

# 检查 Gateway
echo "检查 Gateway..."
if command -v lsof &> /dev/null; then
  if lsof -i :18789 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Gateway 正在运行${NC}"
    lsof -i :18789 | grep LISTEN | awk '{print "   " $0}'
  else
    echo -e "${RED}❌ Gateway 未运行${NC}"
  fi
else
  if netstat -an 2>/dev/null | grep -q "18789.*LISTEN"; then
    echo -e "${GREEN}✅ Gateway 正在运行${NC}"
  else
    echo -e "${YELLOW}⚠️  无法检查 Gateway 状态 (lsof 不可用)${NC}"
  fi
fi

# 检查 FRP
echo ""
echo "检查 FRP 客户端..."
FRPC_PID=$(cat "$INSTALL_DIR/frpc.pid" 2>/dev/null)
if [ -n "$FRPC_PID" ] && ps -p "$FRPC_PID" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ FRP 客户端正在运行${NC}"
  echo "   PID: $FRPC_PID"
  
  sleep 2
  if [ -f "$INSTALL_DIR/frpc.log" ]; then
    if tail -10 "$INSTALL_DIR/frpc.log" | grep -qi "success\|login.*ok"; then
      echo -e "${GREEN}✅ FRP 连接成功${NC}"
    else
      echo -e "${YELLOW}⚠️  FRP 可能正在连接中...${NC}"
      echo "查看日志：tail -f $INSTALL_DIR/frpc.log"
    fi
  fi
else
  echo -e "${RED}❌ FRP 客户端未运行${NC}"
fi

# 检查模型配置
echo ""
echo "检查模型配置..."
if grep -q "apiKey" "$OPENCLAW_CONFIG" 2>/dev/null; then
  echo -e "${GREEN}✅ 已配置 AI 模型${NC}"
else
  echo -e "${YELLOW}⚠️  未配置 AI 模型${NC}"
fi

echo ""

# ============================================
# 完成
# ============================================
echo "============================================================="
echo "🎉 配置完成！"
echo "============================================================="
echo ""

# 获取 Gateway Token
if [ -f "$OPENCLAW_CONFIG" ]; then
  GATEWAY_TOKEN=$(python3 -c "
import json, sys
try:
    with open('$OPENCLAW_CONFIG', 'r') as f:
        config = json.load(f)
    print(config.get('gateway', {}).get('auth', {}).get('token', '未配置'))
except Exception as e:
    print('读取失败')
    sys.exit(1)
" 2>/dev/null || echo "读取失败")
else
  GATEWAY_TOKEN="配置文件不存在"
fi

echo -e "${GREEN}✅ 所有配置已完成${NC}"
echo ""
echo "📊 你的机器人信息："
echo "   机器 ID: $MACHINE_ID"
echo "   FRP 映射端口：$PORT_OFFSET"
echo "   访问地址：ws://$FRP_SERVER_ADDR:$PORT_OFFSET"
echo "   Gateway Token: $GATEWAY_TOKEN"
echo ""
echo "📁 重要文件位置："
echo "   OpenClaw 配置：$OPENCLAW_CONFIG"
echo "   FRP 配置：$INSTALL_DIR/frpc.ini"
echo "   FRP 日志：$INSTALL_DIR/frpc.log"
echo "   配置备份：$BACKUP_FILE"
echo ""
echo "🔧 常用命令："
echo "   查看 FRP 状态：tail -f $INSTALL_DIR/frpc.log"
echo "   重启 Gateway:   pkill -f openclaw-gateway && openclaw gateway start"
echo "   重启 FRP:       cd $INSTALL_DIR && ./frpc -c frpc.ini &"
echo ""
echo "📝 下一步："
echo "   1. 等待 1-2 分钟让 FRP 完全连接"
echo "   2. 运行检查脚本验证配置"
echo "   3. 联系平台管理员注册你的机器人"
echo ""
echo "============================================================="
echo ""

# 显示平台注册信息
echo "📋 平台注册信息（复制给管理员）："
echo "================================"

GATEWAY_STATUS="❌ 未运行"
if command -v lsof &> /dev/null; then
  if lsof -i :18789 > /dev/null 2>&1; then
    GATEWAY_STATUS="✅ 运行中"
  fi
fi

FRP_STATUS="❌ 未运行"
FRPC_PID=$(cat "$INSTALL_DIR/frpc.pid" 2>/dev/null)
if [ -n "$FRPC_PID" ] && ps -p "$FRPC_PID" > /dev/null 2>&1; then
  FRP_STATUS="✅ 运行中"
fi

cat << REGEOF
【机器人注册信息】

机器 ID: $MACHINE_ID
配置时间：$(date '+%Y-%m-%d %H:%M:%S')

FRP 配置:
  - 服务端：$FRP_SERVER_ADDR:$FRP_SERVER_PORT
  - 映射端口：$PORT_OFFSET
  - 访问地址：ws://$FRP_SERVER_ADDR:$PORT_OFFSET

Gateway 配置:
  - Token: $GATEWAY_TOKEN
  - 监听：0.0.0.0:18789

状态:
  - Gateway: $GATEWAY_STATUS
  - FRP: $FRP_STATUS
REGEOF
echo "================================"
echo ""
echo "🎉 祝你使用愉快！"
echo ""
