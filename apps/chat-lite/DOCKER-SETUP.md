# Docker 镜像加速器配置指南

## 🔧 配置 Docker Desktop（Mac）

### 步骤 1：打开 Docker Desktop
点击菜单栏 Docker 图标 → Dashboard

### 步骤 2：进入设置
点击右上角 ⚙️ 设置图标

### 步骤 3：选择 Docker Engine
在左侧菜单选择 "Docker Engine"

### 步骤 4：添加镜像加速器配置
在右侧 JSON 配置中添加：

```json
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.1panel.live",
    "https://hub.rat.dev",
    "https://docker.1ms.run",
    "https://docker.fxxk.dedyn.io"
  ],
  "max-concurrent-downloads": 10,
  "log-driver": "json-file",
  "log-level": "warn",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### 步骤 5：应用并重启
点击 "Apply & Restart"

### 步骤 6：验证配置
```bash
docker info | grep -A 5 "Registry Mirrors"
```

---

## 🐳 构建和推送镜像

### 1. 构建镜像
```bash
cd /Users/mac/Documents/GitHub/openclaw/apps/chat-lite
docker build -t chat-lite:latest .
```

### 2. 标记镜像
```bash
# 替换为你的阿里云命名空间
docker tag chat-lite:latest registry.cn-hangzhou.aliyuncs.com/YOUR_NAMESPACE/chat-lite:latest
```

### 3. 登录阿里云
```bash
docker login registry.cn-hangzhou.aliyuncs.com
# 输入用户名和密码
```

### 4. 推送镜像
```bash
docker push registry.cn-hangzhou.aliyuncs.com/YOUR_NAMESPACE/chat-lite:latest
```

---

## 📊 在阿里云服务器部署

### 1. 拉取镜像
```bash
docker pull registry.cn-hangzhou.aliyuncs.com/YOUR_NAMESPACE/chat-lite:latest
```

### 2. 运行容器
```bash
docker run -d -p 80:80 --name chat-lite registry.cn-hangzhou.aliyuncs.com/YOUR_NAMESPACE/chat-lite:latest
```

### 3. 验证
```bash
docker ps
curl http://localhost/
```

---

## 🔗 阿里云容器镜像服务

**命名空间管理**：
https://cr.console.aliyun.com/

**镜像仓库**：
https://cr.console.aliyun.com/cn-hangzhou/instances

**访问凭证**：
https://cr.console.aliyun.com/cn-hangzhou/instances/credentials
