#!/bin/bash

# FRP 客户端验证脚本
# Last Updated: 2026-03-02
# Version: 1.0.0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     FRP Client Verification Check                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check frpc command
if command -v frpc &> /dev/null; then
    echo -e "${GREEN}✓${NC} frpc command: installed"
    frpc --version 2>&1 | head -1
else
    echo -e "${RED}✗${NC} frpc command: not installed"
fi

echo ""

# Check frpc process
FRPC_PID=$(pgrep -f "frpc" 2>/dev/null | head -1)
if [ ! -z "$FRPC_PID" ]; then
    echo -e "${GREEN}✓${NC} frpc process: running (PID: $FRPC_PID)"
    ps aux | grep frpc | grep -v grep | head -1
else
    echo -e "${RED}✗${NC} frpc process: not running"
fi

echo ""

# Check configuration files
CONFIG_FOUND=false
for CONFIG_PATH in "/etc/frp/frpc.ini" "/usr/local/etc/frp/frpc.ini" "/opt/homebrew/etc/frp/frpc.ini" "$HOME/frp/frpc.ini"; do
    if [ -f "$CONFIG_PATH" ]; then
        echo -e "${GREEN}✓${NC} Configuration: $CONFIG_PATH exists"
        CONFIG_FOUND=true
    fi
done

if [ "$CONFIG_FOUND" = false ]; then
    echo -e "${RED}✗${NC} Configuration: not found"
fi

echo ""

# Check Homebrew installation
if brew list 2>/dev/null | grep -q frp; then
    echo -e "${GREEN}✓${NC} Homebrew: installed"
    brew info frp 2>&1 | head -2
else
    echo -e "${YELLOW}⚠${NC} Homebrew: not installed via brew"
fi

echo ""

# Check network connectivity
echo -e "${BLUE}➜${NC} Checking network connectivity..."
if [ -f "/usr/local/etc/frp/frpc.ini" ]; then
    SERVER_ADDR=$(grep "server_addr" /usr/local/etc/frp/frpc.ini 2>/dev/null | head -1 | cut -d'=' -f2 | tr -d ' ')
    SERVER_PORT=$(grep "server_port" /usr/local/etc/frp/frpc.ini 2>/dev/null | head -1 | cut -d'=' -f2 | tr -d ' ')
    
    if [ ! -z "$SERVER_ADDR" ] && [ ! -z "$SERVER_PORT" ]; then
        print_status "Testing connection to $SERVER_ADDR:$SERVER_PORT..."
        if nc -z "$SERVER_ADDR" "$SERVER_PORT" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Connection: successful"
        else
            echo -e "${RED}✗${NC} Connection: failed (server may be offline)"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Connection: server address not configured"
    fi
else
    echo -e "${YELLOW}⚠${NC} Connection: config file not found"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Verification Complete${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
