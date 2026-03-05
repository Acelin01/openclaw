#!/bin/bash
# ChatLite 完整部署脚本 - 构建、推送、部署到阿里云

set -e

echo "======================================"
echo "🐳 ChatLite 阿里云部署脚本"
echo "======================================"
echo ""

# 配置变量
REGION="cn-hangzhou"
REGISTRY="registry.cn-hangzhou.aliyuncs.com"
IMAGE_NAME="chat-lite"
VERSION="latest"
SERVER_IP="120.26.178.246"
SERVER_USER="Administrator"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_step() {
    echo -e "${GREEN}==>${NC} $1"
}

echo_error() {
    echo -e "${RED}错误：${NC} $1"
}

echo_warning() {
    echo -e "${YELLOW}警告：${NC} $1"
}

# 步骤 1：检查 Docker
echo_step "步骤 1: 检查 Docker 环境"
if ! command -v docker &> /dev/null; then
    echo_error "Docker 未安装"
    exit 1
fi
docker --version
echo ""

# 步骤 2：构建镜像
echo_step "步骤 2: 构建 Docker 镜像"
cd /Users/mac/Documents/GitHub/openclaw/apps/chat-lite
docker build -t ${IMAGE_NAME}:${VERSION} .
echo ""

# 步骤 3：登录阿里云
echo_step "步骤 3: 登录阿里云容器镜像服务"
echo "请输入阿里云用户名："
read -p "Username: " ALIYUN_USERNAME
echo "请输入阿里云密码（输入时不显示）："
read -s -p "Password: " ALIYUN_PASSWORD
echo ""

echo "${REGISTRY}" | docker login --username=${ALIYUN_USERNAME} --password-stdin
echo ""

# 步骤 4：获取命名空间
echo_step "步骤 4: 配置命名空间"
echo "请输入阿里云容器镜像服务命名空间（Namespace）："
echo "提示：访问 https://cr.console.aliyun.com/cn-hangzhou/instances 查看"
read -p "Namespace: " NAMESPACE

# 步骤 5：标记镜像
echo_step "步骤 5: 标记镜像"
FULL_IMAGE_NAME="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${VERSION}"
docker tag ${IMAGE_NAME}:${VERSION} ${FULL_IMAGE_NAME}
echo "镜像已标记：${FULL_IMAGE_NAME}"
echo ""

# 步骤 6：推送镜像
echo_step "步骤 6: 推送镜像到阿里云"
docker push ${FULL_IMAGE_NAME}
echo ""

# 步骤 7：部署到服务器
echo_step "步骤 7: 部署到阿里云服务器"
echo "服务器：${SERVER_USER}@${SERVER_IP}"
echo ""

# 创建部署脚本
cat > /tmp/deploy-chatlite.sh << 'DEPLOY_EOF'
#!/bin/bash
IMAGE_NAME="$1"

echo "在服务器上部署 ChatLite..."

# 停止旧容器
docker stop chat-lite 2>/dev/null || true
docker rm chat-lite 2>/dev/null || true

# 拉取新镜像
docker pull ${IMAGE_NAME}

# 运行新容器
docker run -d \
  --name chat-lite \
  --restart unless-stopped \
  -p 80:80 \
  ${IMAGE_NAME}

echo ""
echo "✅ ChatLite 部署完成！"
echo "访问地址：http://${SERVER_IP}/"
DEPLOY_EOF

chmod +x /tmp/deploy-chatlite.sh

echo "部署脚本已创建，将在 SSH 连接后执行"
echo ""

# 步骤 8：SSH 连接并部署
echo_step "步骤 8: SSH 连接到服务器并部署"
echo "请输入服务器密码："
read -s -p "Server Password: " SERVER_PASSWORD
echo ""

# 使用 sshpass 或手动输入
if command -v sshpass &> /dev/null; then
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "bash -s" < /tmp/deploy-chatlite.sh "${FULL_IMAGE_NAME}"
else
    echo_warning "sshpass 未安装，请手动执行以下命令："
    echo ""
    echo "1. SSH 连接到服务器："
    echo "   ssh ${SERVER_USER}@${SERVER_IP}"
    echo ""
    echo "2. 在服务器上执行："
    echo "   docker pull ${FULL_IMAGE_NAME}"
    echo "   docker run -d --name chat-lite --restart unless-stopped -p 80:80 ${FULL_IMAGE_NAME}"
    echo ""
fi

echo ""
echo "======================================"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo "======================================"
echo ""
echo "📊 镜像信息:"
echo "   完整名称：${FULL_IMAGE_NAME}"
echo "   版本：${VERSION}"
echo ""
echo "🌐 访问地址:"
echo "   http://${SERVER_IP}/"
echo ""
echo "🔧 管理命令:"
echo "   查看状态：docker ps | grep chat-lite"
echo "   查看日志：docker logs chat-lite"
echo "   重启服务：docker restart chat-lite"
echo "   停止服务：docker stop chat-lite"
echo ""
