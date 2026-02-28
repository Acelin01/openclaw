#!/bin/bash
# MCP SSE Server Startup Script
# Usage: ./scripts/start-mcp-sse.sh [port]

set -e

PORT=${1:-3004}
API_BASE_URL=${API_BASE_URL:-"http://localhost:8000"}

echo "================================================"
echo "  Starting Uxin MCP SSE Server"
echo "================================================"
echo "  Port:        ${PORT}"
echo "  API Base:    ${API_BASE_URL}"
echo "  Config:      ~/.openclaw/credentials/"
echo "================================================"

# Check if API is running
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
  echo "[WARN] API server at http://localhost:8000 is not responding"
  echo "       Please start the API server first: pnpm --filter @uxin/api run dev"
  echo ""
fi

# Export environment variables
export MCP_PORT="${PORT}"
export API_BASE_URL="${API_BASE_URL}"
export SERVER_API_URL="${API_BASE_URL}"

# Load credentials if available
CREDENTIALS_FILE="$HOME/.openclaw/credentials/uxin-api-token"
if [ -f "$CREDENTIALS_FILE" ]; then
  export UXIN_API_TOKEN=$(cat "$CREDENTIALS_FILE" | tr -d '\n')
  echo "[INFO] Loaded UXIN_API_TOKEN from ~/.openclaw/credentials/"
else
  echo "[WARN] No API token found at ~/.openclaw/credentials/uxin-api-token"
  echo "       Using default service secret"
fi

# Start the SSE server
echo ""
echo "[INFO] Starting MCP SSE server..."
pnpm run mcp:sse
