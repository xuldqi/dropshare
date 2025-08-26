#!/bin/bash

echo "=== 部署 AdSense 验证代码 ==="

cd /var/www/dropshare

echo "1. 拉取最新代码..."
git pull origin main

echo "2. 重新构建Docker镜像..."
docker compose build

echo "3. 重启服务..."
docker compose down
docker compose up -d dropshare

echo "4. 等待服务启动..."
sleep 10

echo "5. 验证部署..."
echo "检查 ads.txt:"
curl -I https://dropshare.tech/ads.txt

echo -e "\n检查 AdSense 验证代码:"
if curl -s https://dropshare.tech | grep -q "adsbygoogle"; then
    echo "✅ AdSense 验证代码已加载"
else
    echo "❌ AdSense 验证代码未找到"
fi

echo -e "\n检查 Share 页面:"
if curl -s https://dropshare.tech/share.html | grep -q "adsbygoogle"; then
    echo "✅ Share 页面 AdSense 代码已加载"
else
    echo "❌ Share 页面 AdSense 代码未找到"
fi

echo -e "\n=== 部署完成 ==="
echo "现在可以重新在 AdSense 后台点击验证！"