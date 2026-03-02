# 🚀 Chat-Lite Client Setup Guide

**Last Updated**: 2026-03-02  
**Version**: 1.0.0

---

## 📋 Prerequisites

Before installing Chat-Lite client, ensure you have:

- **Node.js**: v20.19.5 or higher
- **pnpm**: v10.23.0 or higher
- **Git**: Latest version

### Check Versions

```bash
node --version    # Should be v20.19.5+
pnpm --version    # Should be 10.23.0+
git --version     # Should be 2.x+
```

---

## 🔧 Installation

### Option 1: Quick Install (Recommended)

```bash
# Clone the repository
cd /Users/acelin/Documents/Next/AIGC/openclaw

# Install dependencies
cd apps/chat-lite
pnpm install

# Start development server
pnpm dev
```

### Option 2: Using Install Script

```bash
# Run the installation script
cd /Users/acelin/Documents/Next/AIGC/openclaw
./install-client.sh
```

---

## 🏃 Running the Client

### Development Mode

```bash
cd /Users/acelin/Documents/Next/AIGC/openclaw/apps/chat-lite
pnpm dev
```

**Access**: http://localhost:3003

### Production Build

```bash
cd /Users/acelin/Documents/Next/AIGC/openclaw/apps/chat-lite
pnpm build
pnpm preview
```

---

## 🧪 Testing

### Run Tests

```bash
cd /Users/acelin/Documents/Next/AIGC/openclaw/workspace-xulinyi

# Set API token
export UXIN_API_TOKEN="milestone-test-cd7818cd63acc044e5da5d76c8544d01"

# Run project flow test
node test-project-flow.js

# Run milestone flow test
node test-milestone-simple.js
```

### Test in Chat-Lite

1. Open http://localhost:3003
2. Send message: "查看项目列表"
3. Send message: "创建新项目：名称=测试项目"
4. View artifact components

---

## 📁 Project Structure

```
apps/chat-lite/
├── src/
│   ├── artifacts/
│   │   ├── project/          # Project components
│   │   ├── milestone/        # Milestone components
│   │   └── ...
│   ├── components/
│   ├── lib/
│   └── main.ts
├── preview/                   # Preview pages
├── docs/                      # Design documents
├── package.json
└── README.md
```

---

## 🔗 Available Components

### Project Components
- **chatlite-project-list** - Project list view
- **chatlite-project-detail** - Project detail view
- **chatlite-project-create** - Create project form

### Milestone Components
- **chatlite-milestone-list** - Milestone list view
- **chatlite-milestone-detail** - Milestone detail view
- **chatlite-milestone-create** - Create milestone form

### Iteration Components
- **chatlite-iteration-overview** - Iteration overview
- **chatlite-iteration-list** - Iteration list
- **chatlite-iteration-workitems** - Work items view
- **chatlite-iteration-create** - Create iteration
- **chatlite-iteration-plan** - Iteration planning

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file in `apps/chat-lite/`:

```bash
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### Vite Configuration

Edit `apps/chat-lite/vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    port: 3003,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        ws: true,
      },
    },
  },
});
```

---

## 🐛 Troubleshooting

### Issue: Port 3003 already in use

```bash
# Kill process on port 3003
lsof -ti:3003 | xargs kill -9

# Or change port in vite.config.ts
```

### Issue: API connection failed

```bash
# Check API server is running
curl http://localhost:8000/api/v1/health

# Restart API server
pkill -f "tsx.*api"
cd apps/api && pnpm dev
```

### Issue: Components not loading

```bash
# Clear cache and reinstall
rm -rf node_modules
pnpm install

# Rebuild
pnpm build
```

---

## 📖 Documentation

### Design Documents
- apps/chat-lite/docs/项目_新建.md
- apps/chat-lite/docs/项目_设置.md
- apps/chat-lite/docs/项目概览.md
- apps/chat-lite/docs/里程碑_列表.md
- apps/chat-lite/docs/里程碑_详情.md
- apps/chat-lite/docs/里程碑_新建.md

### Test Reports
- workspace-xulinyi/项目管理功能实现报告.md
- workspace-xulinyi/项目功能测试报告.md
- workspace-xulinyi/项目管理功能 - 实现与测试总结.md

---

## 🎯 Quick Start

```bash
# 1. Install dependencies
cd /Users/acelin/Documents/Next/AIGC/openclaw/apps/chat-lite
pnpm install

# 2. Start development server
pnpm dev

# 3. Open browser
open http://localhost:3003

# 4. Test in chat
# Send: "查看项目列表"
# Send: "创建新项目：名称=测试项目"
```

---

## 📊 Status

| Component | Status | Test Status |
|-----------|--------|-------------|
| **Project List** | ✅ Complete | ⚠️ Needs fix |
| **Project Detail** | ✅ Complete | ⏳ Pending |
| **Project Create** | ✅ Complete | ⚠️ Needs fix |
| **Milestone List** | ✅ Complete | ✅ Passed |
| **Milestone Detail** | ✅ Complete | ⏳ Pending |
| **Milestone Create** | ✅ Complete | ⏳ Pending |

---

## 🆘 Support

For issues or questions:

1. Check troubleshooting section
2. Review design documents
3. Check test reports
4. Contact development team

---

**Guide Version**: 1.0.0  
**Last Updated**: 2026-03-02  
**Status**: ✅ Ready for use
