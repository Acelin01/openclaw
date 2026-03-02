#!/bin/bash

# FRP 客户端安装脚本
# Last Updated: 2026-03-02
# Version: 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRP_VERSION="0.52.0"
INSTALL_DIR="/usr/local"
CONFIG_DIR="/usr/local/etc/frp"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     FRP Client Installation Script                    ║${NC}"
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

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_warning "This script should be run with sudo privileges"
        print_status "Please enter your password when prompted"
        echo ""
    fi
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check curl
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed"
        exit 1
    fi
    print_success "curl: installed"
    
    # Check tar
    if ! command -v tar &> /dev/null; then
        print_error "tar is not installed"
        exit 1
    fi
    print_success "tar: installed"
    
    # Check architecture
    ARCH=$(uname -m)
    if [ "$ARCH" = "arm64" ]; then
        FRP_ARCH="darwin_arm64"
        print_success "Architecture: Apple Silicon (arm64)"
    elif [ "$ARCH" = "x86_64" ]; then
        FRP_ARCH="darwin_amd64"
        print_success "Architecture: Intel (x86_64)"
    else
        print_error "Unsupported architecture: $ARCH"
        exit 1
    fi
    
    echo ""
}

# Check if frp is already installed
check_existing() {
    if command -v frpc &> /dev/null; then
        print_warning "FRP client is already installed"
        FRPC_VERSION=$(frpc --version 2>&1 | head -1)
        print_status "Current version: $FRPC_VERSION"
        
        read -p "Do you want to reinstall? (y/n) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Installation cancelled"
            exit 0
        fi
    fi
}

# Download and install FRP
install_frp() {
    print_status "Downloading FRP v$FRP_VERSION..."
    
    cd /tmp
    
    # Download
    DOWNLOAD_URL="https://github.com/fatedier/frp/releases/download/v${FRP_VERSION}/frp_${FRP_VERSION}_${FRP_ARCH}.tar.gz"
    print_status "Download URL: $DOWNLOAD_URL"
    
    if ! curl -LO "$DOWNLOAD_URL"; then
        print_error "Failed to download FRP"
        exit 1
    fi
    print_success "Download complete"
    
    # Extract
    print_status "Extracting..."
    tar -xzf frp_${FRP_VERSION}_${FRP_ARCH}.tar.gz
    
    # Install
    print_status "Installing to $INSTALL_DIR..."
    sudo mkdir -p "$INSTALL_DIR/bin"
    sudo mkdir -p "$CONFIG_DIR"
    sudo mv frp_${FRP_VERSION}_${FRP_ARCH}/frpc "$INSTALL_DIR/bin/"
    sudo chmod +x "$INSTALL_DIR/bin/frpc"
    
    # Copy example config
    if [ -f "frp_${FRP_VERSION}_${FRP_ARCH}/frpc.ini" ]; then
        sudo cp frp_${FRP_VERSION}_${FRP_ARCH}/frpc.ini "$CONFIG_DIR/frpc.ini.example"
        print_success "Example config copied to $CONFIG_DIR/frpc.ini.example"
    fi
    
    # Cleanup
    rm -rf frp_${FRP_VERSION}_${FRP_ARCH}.tar.gz frp_${FRP_VERSION}_${FRP_ARCH}
    print_success "Cleanup complete"
    
    echo ""
}

# Create configuration
create_config() {
    print_status "Creating configuration..."
    
    if [ ! -f "$CONFIG_DIR/frpc.ini" ]; then
        sudo cat > "$CONFIG_DIR/frpc.ini" << EOF
[common]
# FRP Server Configuration
server_addr = your.server.com
server_port = 7000
token = your_token

# Example: SSH Tunnel
# [ssh]
# type = tcp
# local_ip = 127.0.0.1
# local_port = 22
# remote_port = 6000

# Example: Web Service
# [web]
# type = http
# local_port = 80
# custom_domains = your.domain.com

# Example: Chat-Lite
# [chat-lite]
# type = http
# local_port = 3002
# subdomain = chat-lite
EOF
        print_success "Configuration created at $CONFIG_DIR/frpc.ini"
        print_warning "Please edit the configuration file with your server details"
    else
        print_warning "Configuration file already exists"
    fi
    
    echo ""
}

# Verify installation
verify_installation() {
    print_status "Verifying installation..."
    
    # Check command
    if command -v frpc &> /dev/null; then
        print_success "frpc command: available"
        frpc --version
    else
        print_error "frpc command: not found"
        exit 1
    fi
    
    # Check binary
    if [ -f "$INSTALL_DIR/bin/frpc" ]; then
        print_success "frpc binary: installed at $INSTALL_DIR/bin/frpc"
    else
        print_error "frpc binary: not found"
        exit 1
    fi
    
    # Check config
    if [ -f "$CONFIG_DIR/frpc.ini" ]; then
        print_success "Configuration: exists at $CONFIG_DIR/frpc.ini"
    else
        print_warning "Configuration: not found"
    fi
    
    echo ""
}

# Show next steps
show_next_steps() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     Installation Complete!                            ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    print_success "FRP client is installed!"
    echo ""
    
    print_status "Next steps:"
    echo ""
    echo "  1. Edit configuration:"
    echo "     sudo vi $CONFIG_DIR/frpc.ini"
    echo ""
    echo "  2. Verify configuration:"
    echo "     frpc verify -c $CONFIG_DIR/frpc.ini"
    echo ""
    echo "  3. Start FRP client:"
    echo "     sudo frpc -c $CONFIG_DIR/frpc.ini"
    echo ""
    echo "  4. Or run in background:"
    echo "     nohup sudo frpc -c $CONFIG_DIR/frpc.ini > /tmp/frpc.log 2>&1 &"
    echo ""
    echo "  5. Check logs:"
    echo "     tail -f /tmp/frpc.log"
    echo ""
    
    print_status "For more information, see:"
    echo "  - FRP-CLIENT-SETUP-GUIDE.md"
    echo "  - https://gofrp.org/docs/"
    echo ""
}

# Main installation
main() {
    echo ""
    check_root
    check_prerequisites
    check_existing
    install_frp
    create_config
    verify_installation
    show_next_steps
}

# Run main function
main

exit 0
