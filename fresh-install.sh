#!/bin/bash

echo "=== 全新安装 DropShare ==="

# 检查权限
if [[ $EUID -ne 0 ]]; then
    echo "需要root权限: sudo $0"
    exit 1
fi

echo "1. 完全清理..."
pkill -f "node.*index.js" || true
rm -rf /var/www/dropshare
mkdir -p /var/www/dropshare
cd /var/www/dropshare

echo "2. 克隆原始仓库..."
git clone https://github.com/Bellisario/node-snapdrop.git .

echo "3. 安装依赖..."
npm install

echo "4. 启动服务..."
nohup node index.js > server.log 2>&1 &

sleep 5

echo "5. 测试..."
if curl -s http://localhost:8080 >/dev/null; then
    echo "✅ 完成!"
    echo "访问: http://dropshare.tech"
else
    echo "❌ 失败，查看日志:"
    tail -5 server.log
fi