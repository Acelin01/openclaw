#!/bin/bash

# OpenClaw 一键配置脚本
# Last Updated: 2026-03-02
# Version: 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     OpenClaw One-Click Setup Script                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${BLUE}➜${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check frpc
    if command -v frpc &> /dev/null; then
        print_success "FRP client: installed ($(frpc --version))"
    else
        print_error "FRP client: not installed"
        print_status "Installing FRP client..."
        brew install frpc
    fi
    
    # Check Chat-Lite
    if [ -d "/Users/acelin/Documents/Next/AIGC/openclaw/apps/chat-lite" ]; then
        print_success "Chat-Lite: installed"
    else
        print_error "Chat-Lite: not found"
    fi
    
    # Check API Server
    if curl -s http://localhost:8000/api/v1/health > /dev/null 2>&1; then
        print_success "API Server: running"
    else
        print_warning "API Server: not running"
    fi
    
    echo ""
}

# Configure OpenClaw Gateway
configure_gateway() {
    print_status "Configuring OpenClaw Gateway..."
    
    CONFIG_FILE="$HOME/.openclaw/openclaw.json"
    
    if [ ! -f "$CONFIG_FILE" ]; then
        print_error "Config file not found: $CONFIG_FILE"
        return 1
    fi
    
    # Check if bind is already set to lan
    if grep -q '"bind": "lan"' "$CONFIG_FILE"; then
        print_success "Gateway already configured with bind=lan"
    else
        # Add bind: lan to gateway section
        sed -i '' 's/"mode": "local"/"mode": "local",\n    "bind": "lan"/' "$CONFIG_FILE"
        print_success "Gateway configured with bind=lan"
    fi
    
    echo ""
}

# Configure FRP
configure_frp() {
    print_status "Configuring FRP..."
    
    FRP_DIR="$HOME/.openclaw-frp"
    FRP_CONFIG="$FRP_DIR/frpc.ini"
    
    # Create directory
    mkdir -p "$FRP_DIR"
    
    # Get FRP server address
    echo ""
    print_status "FRP Server Configuration:"
    echo "  Enter FRP server address (or press Enter for default):"
    read -p "  Server Address [frp.openclaw.ai]: " FRP_SERVER
    FRP_SERVER=${FRP_SERVER:-frp.openclaw.ai}
    
    read -p "  Server Port [7000]: " FRP_PORT
    FRP_PORT=${FRP_PORT:-7000}
    
    read -p "  Token [openclaw_token_2026]: " FRP_TOKEN
    FRP_TOKEN=${FRP_TOKEN:-openclaw_token_2026}
    
    # Create config file
    cat > "$FRP_CONFIG" << EOF
[common]
server_addr = $FRP_SERVER
server_port = $FRP_PORT
token = $FRP_TOKEN

# Log configuration
log_file = $FRP_DIR/frpc.log
log_level = info
log_max_days = 7

# Chat-Lite service
[chat-lite]
type = http
local_ip = 127.0.0.1
local_port = 3002
custom_domains = chat-lite.openclaw.local

# API service
[api-server]
type = http
local_ip = 127.0.0.1
local_port = 8000
custom_domains = api.openclaw.local
EOF
    
    print_success "FRP configuration created at $FRP_CONFIG"
    echo ""
}

# Start FRP
start_frp() {
    print_status "Starting FRP client..."
    
    FRP_DIR="$HOME/.openclaw-frp"
    FRP_CONFIG="$FRP_DIR/frpc.ini"
    
    # Stop existing FRP
    pkill frpc 2>/dev/null || true
    sleep 1
    
    # Start FRP
    nohup frpc -c "$FRP_CONFIG" > "$FRP_DIR/frpc.log" 2>&1 &
    
    sleep 3
    
    # Check if FRP is running
    if pgrep -f "frpc" > /dev/null; then
        print_success "FRP client started"
        
        # Show logs
        echo ""
        print_status "FRP Logs (last 10 lines):"
        tail -10 "$FRP_DIR/frpc.log"
    else
        print_error "FRP client failed to start"
        print_status "Check logs: $FRP_DIR/frpc.log"
    fi
    
    echo ""
}

# Show status
show_status() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     Setup Complete!                                   ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    print_success "OpenClaw setup complete!"
    echo ""
    
    print_status "Services:"
    echo ""
    echo "  Chat-Lite:      http://localhost:3002"
    echo "  API Server:     http://localhost:8000"
    echo "  FRP Client:     $(pgrep -f frpc > /dev/null && echo 'running' || echo 'not running')"
    echo ""
    
    print_status "Configuration:"
    echo ""
    echo "  Gateway Config: ~/.openclaw/openclaw.json"
    echo "  FRP Config:     ~/.openclaw-frp/frpc.ini"
    echo "  FRP Logs:       ~/.openclaw-frp/frpc.log"
    echo ""
    
    print_status "Next steps:"
    echo ""
    echo "  1. Restart OpenClaw Gateway:"
    echo "     openclaw gateway restart"
    echo ""
    echo "  2. Check FRP connection:"
    echo "     tail -f ~/.openclaw-frp/frpc.log"
    echo ""
    echo "  3. Access Chat-Lite:"
    echo "     http://localhost:3002"
    echo ""
    
    print_status "For more information, see:"
    echo "  - FRP-CLIENT-SETUP-GUIDE.md"
    echo "  - workspace-xulinyi/FRP 连接状态报告.md"
    echo ""
}

# Main setup
main() {
    echo ""
    check_prerequisites
    configure_gateway
    configure_frp
    start_frp
    show_status
}

# Run main function
main

exit 0
