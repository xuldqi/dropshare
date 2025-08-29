#!/bin/bash

# SSL 证书自动续期脚本
# 运行: ./ssl-renew.sh

echo "开始 SSL 证书续期..."

# 停止 nginx 容器
docker-compose stop nginx

# 运行 certbot 续期
docker-compose run --rm certbot renew

# 重新启动 nginx 容器
docker-compose up -d nginx

echo "SSL 证书续期完成！"

