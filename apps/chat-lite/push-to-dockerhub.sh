#!/bin/bash
# ChatLite Docker Hub 推送脚本

set -e

echo "======================================"
echo "🐳 ChatLite Docker Hub 推送"
echo "======================================"
echo ""

USERNAME="uxintop@163.com"
IMAGE="chat-lite:latest"

echo "1️⃣  登录 Docker Hub"
echo "   用户名：$USERNAME"
echo "   请在下方输入密码："
docker login -u $USERNAME

echo ""
echo "2️⃣  标记镜像"
docker tag $IMAGE $USERNAME/chat-lite:latest
echo "   ✅ 镜像已标记：$USERNAME/chat-lite:latest"

echo ""
echo "3️⃣  推送镜像"
docker push $USERNAME/chat-lite:latest

echo ""
echo "======================================"
echo "✅ 推送完成！"
echo "======================================"
echo ""
echo "📊 镜像信息:"
echo "   Docker Hub: https://hub.docker.com/r/$USERNAME/chat-lite"
echo "   镜像名称：$USERNAME/chat-lite:latest"
echo ""
echo "🔧 在阿里云服务器执行:"
echo "   docker pull $USERNAME/chat-lite:latest"
echo "   docker run -d --name chat-lite -p 80:80 $USERNAME/chat-lite:latest"
echo ""
echo "🌐 访问地址:"
echo "   http://120.26.178.246/"
echo ""
