#!/bin/bash

# 快速修复502错误的脚本

SERVER_HOST="107.174.250.34"
SERVER_USER="dokploy"
SSH_KEY_FILE="$HOME/.ssh/dropshare_server_key"

if [ ! -f "$SSH_KEY_FILE" ]; then
    echo "❌ SSH密钥文件不存在"
    exit 1
fi

SSH_OPTS="-i $SSH_KEY_FILE -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

echo "🔧 快速修复502错误..."
echo ""

# 使用ssh命令执行，而不是heredoc，这样可以更好地显示输出
ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST '
    set -e
    echo "📡 已连接到服务器"
    echo ""
    
    cd /var/www/dropshare || {
        echo "❌ 项目目录不存在，创建中..."
        sudo mkdir -p /var/www/dropshare
        sudo chown $USER:$USER /var/www/dropshare
        cd /var/www/dropshare
    }
    
    echo "1️⃣ 停止容器..."
    docker-compose down 2>&1 || true
    echo ""
    
    echo "2️⃣ 确保.env文件正确..."
    cat > .env << "EOF"
PRIMARY_DOMAIN=107.174.250.34
SECONDARY_DOMAIN=107.174.250.34
NODE_ENV=production
PORT=3000
MAX_FILE_SIZE=100MB
UPLOAD_PATH=./uploads
LOG_LEVEL=info
LOG_PATH=./logs
EOF
    echo "✅ .env文件已更新"
    echo ""
    
    echo "3️⃣ 启动容器..."
    docker-compose up -d --build 2>&1
    echo ""
    
    echo "4️⃣ 等待容器启动（10秒）..."
    sleep 10
    echo ""
    
    echo "5️⃣ 检查容器状态..."
    docker-compose ps
    echo ""
    
    echo "6️⃣ 检查容器日志（最后10行）..."
    docker logs --tail 10 dropshare-app 2>&1 || echo "⚠️  无法获取日志"
    echo ""
    
    echo "7️⃣ 测试连接..."
    sleep 5
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1 || echo "000")
    echo "HTTP状态码: $HTTP_CODE"
    echo ""
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
        echo "✅ 修复成功！应用已正常运行"
        echo "🌐 访问地址: http://107.174.250.34:3000"
    else
        echo "❌ 仍有问题，查看详细日志:"
        docker logs --tail 30 dropshare-app 2>&1
        echo ""
        echo "💡 提示: 检查端口监听状态"
        netstat -tlnp 2>/dev/null | grep 3000 || ss -tlnp 2>/dev/null | grep 3000 || echo "端口3000未监听"
    fi
'

echo ""
echo "✅ 修复完成！"

