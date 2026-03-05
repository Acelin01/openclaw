# ChatLite Dockerfile - 简化版
# 直接使用已构建的 dist 目录

FROM docker.m.daocloud.io/library/nginx:alpine

# 复制已构建的静态文件
COPY dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
