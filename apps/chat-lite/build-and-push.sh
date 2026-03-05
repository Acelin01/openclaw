#!/bin/bash
# ChatLite Docker 构建和推送脚本

set -e

# 配置变量
IMAGE_NAME="chat-lite"
REGISTRY="registry.cn-hangzhou.aliyuncs.com"
NAMESPACE="your-namespace"  # 替换为你的阿里云命名空间
VERSION="latest"

echo "======================================"
echo "🐳 ChatLite Docker 构建脚本"
echo "======================================"
echo ""

# 1. 构建 Docker 镜像
echo "📦 步骤 1: 构建 Docker 镜像..."
docker build -t ${IMAGE_NAME}:${VERSION} .

echo ""
echo "✅ 镜像构建成功！"
echo "   镜像名称：${IMAGE_NAME}:${VERSION}"
echo ""

# 2. 标记镜像为阿里云 Registry
echo "🏷️  步骤 2: 标记镜像..."
FULL_IMAGE_NAME="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${VERSION}"
docker tag ${IMAGE_NAME}:${VERSION} ${FULL_IMAGE_NAME}
echo "   完整名称：${FULL_IMAGE_NAME}"
echo ""

# 3. 登录阿里云 Registry
echo "🔐 步骤 3: 登录阿里云 Registry..."
echo "请输入阿里云 Registry 密码（或访问令牌）："
read -s DOCKER_PASSWORD
echo ""
docker login --username=your-username ${REGISTRY}
echo ""

# 4. 推送镜像
echo "🚀 步骤 4: 推送镜像到阿里云..."
docker push ${FULL_IMAGE_NAME}

echo ""
echo "======================================"
echo "✅ 完成！"
echo "======================================"
echo ""
echo "📊 镜像信息:"
echo "   名称：${FULL_IMAGE_NAME}"
echo "   版本：${VERSION}"
echo ""
echo "🔧 在服务器上运行:"
echo "   docker pull ${FULL_IMAGE_NAME}"
echo "   docker run -d -p 80:80 ${FULL_IMAGE_NAME}"
echo ""
echo "🌐 访问地址:"
echo "   http://<服务器 IP>/"
echo ""
