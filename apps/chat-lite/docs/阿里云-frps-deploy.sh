#!/bin/bash
# 阿里云 FRP 服务器部署脚本
# 使用方法：在阿里云服务器上执行 bash install-frps.sh

set -e

echo "================================"
echo "🚀 阿里云 FRP 服务器部署"
echo "================================"
echo ""

# 配置变量
FRP_VERSION="0.61.1"
FRP_DIR="/opt/frp"
FRPS_CONFIG="/etc/frp/frps.ini"

# 检测系统架构
ARCH=$(uname -m)
if [ "$ARCH" = "x86_64" ]; then
    FRP_FILE="frp_${FRP_VERSION}_linux_amd64.tar.gz"
elif [ "$ARCH" = "aarch64" ]; then
    FRP_FILE="frp_${FRP_VERSION}_linux_arm64.tar.gz"
else
    echo "❌ 不支持的架构：$ARCH"
    exit 1
fi

echo "1️⃣  下载 FRP..."
mkdir -p $FRP_DIR
cd $FRP_DIR
wget -q "https://github.com/fatedier/frp/releases/download/v${FRP_VERSION}/${FRP_FILE}"
tar -xzf ${FRP_FILE}
mv frp_${FRP_VERSION}_linux_*/frps .
rm -rf frp_${FRP_VERSION}_linux_* ${FRP_FILE}
chmod +x frps
echo "✅ FRP 已安装到 $FRP_DIR"

echo ""
echo "2️⃣  创建配置目录..."
mkdir -p /etc/frp
mkdir -p /var/log/frp

echo ""
echo "3️⃣  创建 FRPS 配置..."
cat > $FRPS_CONFIG << 'EOF'
[common]
bind_addr = 0.0.0.0
bind_port = 7000
token = openclaw-platform-token-2026
log_file = /var/log/frp/frps.log
log_level = info
log_max_days = 7
dashboard_port = 7500
dashboard_user = admin
dashboard_pwd = admin123

# 本地电脑 Gateway 隧道
[local-gateway]
type = tcp
local_port = 19001
remote_port = 60123
health_check_type = tcp
health_check_interval_s = 30
EOF

echo "✅ 配置已创建：$FRPS_CONFIG"

echo ""
echo "4️⃣  配置防火墙..."
# Ubuntu
if command -v ufw > /dev/null; then
    ufw allow 7000/tcp
    ufw allow 60123/tcp
    ufw allow 7500/tcp
    echo "✅ UFW 防火墙规则已添加"
fi

# CentOS
if command -v firewall-cmd > /dev/null; then
    firewall-cmd --permanent --add-port=7000/tcp
    firewall-cmd --permanent --add-port=60123/tcp
    firewall-cmd --permanent --add-port=7500/tcp
    firewall-cmd --reload
    echo "✅ Firewalld 规则已添加"
fi

echo ""
echo "5️⃣  创建 systemd 服务..."
cat > /etc/systemd/system/frps.service << 'EOF'
[Unit]
Description=frp Server
After=network.target

[Service]
Type=simple
User=root
ExecStart=/opt/frp/frps -c /etc/frp/frps.ini
Restart=on-failure
RestartSec=5s
LimitNOFILE=1048576

[Install]
WantedBy=multi-user.target
EOF

echo ""
echo "6️⃣  启动 FRPS 服务..."
systemctl daemon-reload
systemctl enable frps
systemctl start frps

sleep 2

echo ""
echo "7️⃣  验证服务状态..."
systemctl status frps --no-pager | head -10

echo ""
echo "8️⃣  检查端口监听..."
netstat -tlnp | grep -E "7000|60123|7500" || ss -tlnp | grep -E "7000|60123|7500"

echo ""
echo "================================"
echo "✅ FRP 服务器部署完成！"
echo "================================"
echo ""

# 获取公网 IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "你的阿里云公网 IP")

echo "📊 服务信息："
echo "   - FRP 服务器：$PUBLIC_IP:7000"
echo "   - FRP 隧道：$PUBLIC_IP:60123"
echo "   - Dashboard: http://$PUBLIC_IP:7500"
echo "   - Dashboard 用户：admin"
echo "   - Dashboard 密码：admin123"
echo ""
echo "📝 客户端配置："
echo "   服务器地址：$PUBLIC_IP"
echo "   服务器端口：7000"
echo "   Token: openclaw-platform-token-2026"
echo ""
