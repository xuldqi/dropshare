#!/bin/bash

# 502 Bad Gateway 自动修复脚本

set -e

echo "🔧 开始修复 502 Bad Gateway 错误..."
echo ""

# 服务器信息
SERVER_HOST="107.174.250.34"
SERVER_USER="novcat"
SSH_KEY_FILE="$HOME/.ssh/dropshare_server_key"

# 检查SSH密钥
if [ ! -f "$SSH_KEY_FILE" ]; then
    echo "❌ SSH密钥文件不存在: $SSH_KEY_FILE"
    exit 1
fi

SSH_OPTS="-i $SSH_KEY_FILE -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

echo "📡 连接到服务器 $SERVER_USER@$SERVER_HOST..."
echo ""

# 执行修复
ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST << 'ENDSSH'
    set -e
    
    echo "=========================================="
    echo "步骤1: 检查并重启Docker容器"
    echo "=========================================="
    
    cd /var/www/dropshare || {
        echo "❌ 项目目录不存在，创建中..."
        sudo mkdir -p /var/www/dropshare
        sudo chown $USER:$USER /var/www/dropshare
        cd /var/www/dropshare
    }
    
    # 检查docker-compose.yml
    if [ ! -f "docker-compose.yml" ]; then
        echo "❌ docker-compose.yml 不存在，请先部署项目"
        exit 1
    fi
    
    # 停止现有容器
    echo "🛑 停止现有容器..."
    docker-compose down || true
    
    # 检查.env文件
    if [ ! -f ".env" ]; then
        echo "📝 创建.env文件..."
        cat > .env << 'EOF'
PRIMARY_DOMAIN=107.174.250.34
SECONDARY_DOMAIN=107.174.250.34
NODE_ENV=production
PORT=3000
MAX_FILE_SIZE=100MB
UPLOAD_PATH=./uploads
LOG_LEVEL=info
LOG_PATH=./logs
EOF
    fi
    
    # 创建必要目录
    mkdir -p uploads logs ssl
    
    # 启动容器
    echo "🚀 启动Docker容器..."
    docker-compose up -d --build
    
    # 等待容器启动
    echo "⏳ 等待容器启动（10秒）..."
    sleep 10
    
    # 检查容器状态
    echo ""
    echo "=========================================="
    echo "步骤2: 检查容器状态"
    echo "=========================================="
    docker-compose ps
    
    # 检查容器日志
    echo ""
    echo "=========================================="
    echo "步骤3: 检查容器日志（最后20行）"
    echo "=========================================="
    if docker ps | grep -q dropshare-app; then
        docker logs --tail 20 dropshare-app
    else
        echo "❌ 容器未运行，查看完整日志:"
        docker logs dropshare-app 2>&1 | tail -50
    fi
    
    # 测试本地连接
    echo ""
    echo "=========================================="
    echo "步骤4: 测试应用连接"
    echo "=========================================="
    echo "等待应用启动..."
    sleep 5
    
    for i in {1..10}; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|404"; then
            echo "✅ 应用已启动，可以响应请求"
            break
        else
            echo "⏳ 等待应用启动... ($i/10)"
            sleep 2
        fi
    done
    
    # 检查端口监听
    echo ""
    echo "=========================================="
    echo "步骤5: 检查端口监听"
    echo "=========================================="
    if netstat -tlnp 2>/dev/null | grep -q :3000 || ss -tlnp 2>/dev/null | grep -q :3000; then
        echo "✅ 端口3000正在监听"
    else
        echo "❌ 端口3000未监听，检查容器日志:"
        docker logs dropshare-app 2>&1 | tail -30
    fi
    
    # 检查Nginx配置（如果存在）
    echo ""
    echo "=========================================="
    echo "步骤6: 检查Nginx配置（如果使用）"
    echo "=========================================="
    if command -v nginx &> /dev/null; then
        if sudo nginx -t 2>&1; then
            echo "✅ Nginx配置正确"
            echo "🔄 重启Nginx..."
            sudo systemctl restart nginx || true
        else
            echo "❌ Nginx配置有误，请手动修复"
        fi
    else
        echo "⚠️  Nginx未安装，跳过"
    fi
    
    echo ""
    echo "=========================================="
    echo "修复完成！"
    echo "=========================================="
    echo ""
    echo "📊 当前状态:"
    echo "--- Docker容器 ---"
    docker-compose ps
    echo ""
    echo "--- 端口监听 ---"
    (netstat -tlnp 2>/dev/null || ss -tlnp 2>/dev/null) | grep -E ":3000|:80|:443" || echo "未找到相关端口"
    echo ""
    echo "--- 测试连接 ---"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1 || echo "000")
    echo "HTTP状态码: $HTTP_CODE"
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
        echo "✅ 应用运行正常"
    else
        echo "❌ 应用可能有问题，查看日志: docker logs dropshare-app"
    fi
    echo ""
    echo "🌐 访问地址:"
    echo "  - 直接访问: http://107.174.250.34:3000"
    echo "  - WebSocket: ws://107.174.250.34:3000/server/webrtc"
ENDSSH

echo ""
echo "✅ 修复脚本执行完成！"

