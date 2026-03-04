#!/bin/bash

# Chat-Lite Client Installation Script
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
CHAT_LITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/apps/chat-lite" && pwd)"
WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/workspace-xulinyi" && pwd)"
API_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/apps/api" && pwd)"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Chat-Lite Client Installation Script              ║${NC}"
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
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    print_success "Node.js: $NODE_VERSION"
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed"
        print_warning "Install with: npm install -g pnpm"
        exit 1
    fi
    
    PNPM_VERSION=$(pnpm --version)
    print_success "pnpm: $PNPM_VERSION"
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    print_success "Git: $GIT_VERSION"
    
    echo ""
}

# Install dependencies
install_dependencies() {
    print_status "Installing Chat-Lite dependencies..."
    
    cd "$CHAT_LITE_DIR"
    
    if [ -d "node_modules" ]; then
        print_warning "node_modules exists, updating..."
        pnpm install
    else
        pnpm install
    fi
    
    print_success "Dependencies installed"
    echo ""
}

# Check API server
check_api_server() {
    print_status "Checking API server..."
    
    if curl -s http://localhost:8000/api/v1/health > /dev/null 2>&1; then
        print_success "API server is running"
    else
        print_warning "API server is not running"
        print_warning "Start with: cd $API_DIR && pnpm dev"
    fi
    
    echo ""
}

# Create .env file
create_env() {
    print_status "Creating .env file..."
    
    cd "$CHAT_LITE_DIR"
    
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
EOF
        print_success ".env file created"
    else
        print_warning ".env file already exists"
    fi
    
    echo ""
}

# Show preview links
show_preview_links() {
    print_status "Preview links:"
    echo ""
    echo "  Chat-Lite:        http://localhost:3003"
    echo "  API Server:       http://localhost:8000"
    echo "  Preview Pages:    file://$CHAT_LITE_DIR/preview/index.html"
    echo ""
}

# Show test commands
show_test_commands() {
    print_status "Test commands:"
    echo ""
    echo "  # Run project flow test"
    echo "  cd $WORKSPACE_DIR"
    echo "  export UXIN_API_TOKEN=\"milestone-test-cd7818cd63acc044e5da5d76c8544d01\""
    echo "  node test-project-flow.js"
    echo ""
    echo "  # Run milestone flow test"
    echo "  node test-milestone-simple.js"
    echo ""
}

# Show next steps
show_next_steps() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     Installation Complete!                            ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    print_success "Chat-Lite client is ready!"
    echo ""
    
    print_status "Next steps:"
    echo ""
    echo "  1. Start development server:"
    echo "     cd $CHAT_LITE_DIR"
    echo "     pnpm dev"
    echo ""
    echo "  2. Open browser:"
    echo "     http://localhost:3003"
    echo ""
    echo "  3. Test in chat:"
    echo "     - Send: \"查看项目列表\""
    echo "     - Send: \"创建新项目：名称=测试项目\""
    echo ""
    
    show_preview_links
    show_test_commands
    
    print_status "For more information, see:"
    echo "  - $CHAT_LITE_DIR/CLIENT-SETUP-GUIDE.md"
    echo "  - $CHAT_LITE_DIR/README.md"
    echo "  - $CHAT_LITE_DIR/docs/"
    echo ""
}

# Main installation
main() {
    echo ""
    check_prerequisites
    install_dependencies
    create_env
    check_api_server
    show_next_steps
}

# Run main function
main

exit 0
