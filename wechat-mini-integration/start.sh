#!/bin/bash

# 微信小程序对接OpenClaw - 启动脚本

set -e

echo "=== 微信小程序对接OpenClaw启动脚本 ==="
echo ""

# 检查Node.js版本
NODE_VERSION=$(node --version | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ $NODE_MAJOR -lt 18 ]; then
    echo "错误: 需要Node.js 18或更高版本，当前版本: $NODE_VERSION"
    exit 1
fi

echo "✓ Node.js版本: $NODE_VERSION"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
else
    echo "✓ 依赖已安装"
fi

# 检查TypeScript构建
if [ ! -d "dist" ]; then
    echo "构建TypeScript..."
    npm run build
else
    echo "✓ 已构建"
fi

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "警告: 未找到.env文件，使用示例配置"
    echo "请复制.env.example为.env并填写实际配置"
    cp .env.example .env
fi

# 加载环境变量
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# 检查必要配置
if [ -z "$WECHAT_APP_ID" ] || [ "$WECHAT_APP_ID" = "your_app_id_here" ]; then
    echo "错误: 请设置WECHAT_APP_ID环境变量"
    exit 1
fi

if [ -z "$WECHAT_APP_SECRET" ] || [ "$WECHAT_APP_SECRET" = "your_app_secret_here" ]; then
    echo "错误: 请设置WECHAT_APP_SECRET环境变量"
    exit 1
fi

echo "✓ 配置检查通过"
echo ""

# 显示配置摘要
echo "=== 配置摘要 ==="
echo "应用ID: $WECHAT_APP_ID"
echo "服务器端口: ${PORT:-3000}"
echo "环境: ${NODE_ENV:-development}"
echo "================="
echo ""

# 启动选项
echo "请选择启动模式:"
echo "1) 开发模式 (tsx watch)"
echo "2) 生产模式 (node dist)"
echo "3) 测试模式"
echo "4) 退出"
echo ""

read -p "请输入选项 (1-4): " choice

case $choice in
    1)
        echo "启动开发模式..."
        npm run dev
        ;;
    2)
        echo "启动生产模式..."
        npm start
        ;;
    3)
        echo "运行测试..."
        npm test
        ;;
    4)
        echo "退出"
        exit 0
        ;;
    *)
        echo "无效选项"
        exit 1
        ;;
esac