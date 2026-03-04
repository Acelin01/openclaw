#!/bin/bash
# 手动启动 FRPS

FRPS_DIR="/tmp/frps-docker"
mkdir -p $FRPS_DIR

# 下载 FRPS 二进制
cd $FRPS_DIR
if [ ! -f frps ]; then
    echo "下载 FRPS..."
    curl -L https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_darwin_amd64.tar.gz -o frp.tar.gz
    tar -xzf frp.tar.gz
    cd frp_*
    mv frps .
    cd frps
fi

# 创建配置
cat > frps.ini << 'EOF'
[common]
bind_addr = 0.0.0.0
bind_port = 7000
token = openclaw-platform-token-2026
dashboard_port = 7500
dashboard_user = admin
dashboard_pwd = admin123

[openclaw-gateway]
type = tcp
local_port = 18789
remote_port = 60123
health_check_type = tcp
health_check_interval_s = 30
EOF

# 启动
echo "启动 FRPS..."
./frps -c frps.ini &

sleep 3

# 验证
echo ""
echo "FRPS 状态："
ps aux | grep -v grep | grep frps
netstat -tlnp | grep 7000

echo ""
echo "✅ FRPS 已启动"
echo "   监听端口：7000, 60123, 7500"
