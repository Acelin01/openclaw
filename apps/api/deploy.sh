#!/bin/bash

# 配置变量
REGISTRY="crpi-ip82pe7fa9qlwst8.cn-beijing.personal.cr.aliyuncs.com"
NAMESPACE="rrvc01"
SERVICE="api"
VERSION="latest"

# 完整的镜像名称
IMAGE_NAME="$REGISTRY/$NAMESPACE/$SERVICE:$VERSION"

echo "Processing service: $SERVICE..."

# 1. 构建镜像
# 注意：API 的 Dockerfile 需要在项目根目录下构建，因为它依赖于 packages/ 下的代码
echo "Building $SERVICE..."
cd ../..
docker build -t $IMAGE_NAME -f apps/api/Dockerfile .

# 2. 推送镜像
echo "Pushing $IMAGE_NAME..."
docker push $IMAGE_NAME

echo "Service $SERVICE processed successfully!"
