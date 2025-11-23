#!/bin/bash

# DropShare 服务器部署脚本（云端部署版本）
# 服务器: 107.174.250.34
# 用户: novcat/dokploy

set -e

echo "🚀 开始部署 DropShare 到服务器（云端部署）..."

# 服务器信息
SERVER_HOST="107.174.250.34"
SERVER_USER="novcat"
SERVER_PORT="22"
DEPLOY_PATH="/var/www/dropshare"

# 检查SSH密钥文件
SSH_KEY_FILE="$HOME/.ssh/dropshare_server_key"
if [ ! -f "$SSH_KEY_FILE" ]; then
    echo "📝 创建SSH密钥文件..."
    mkdir -p ~/.ssh
    cat > "$SSH_KEY_FILE" << 'EOF'
-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----
EOF
    chmod 600 "$SSH_KEY_FILE"
    echo "✅ SSH密钥文件已创建: $SSH_KEY_FILE"
fi

# SSH连接选项
SSH_OPTS="-i $SSH_KEY_FILE -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

echo "📡 连接到服务器 $SERVER_USER@$SERVER_HOST..."

# 执行部署命令
ssh $SSH_OPTS -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'ENDSSH'
    set -e
    
    echo "🔧 检查服务器环境..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo "📦 安装Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # 创建项目目录
    if [ ! -d "/var/www/dropshare" ]; then
        echo "📁 创建项目目录..."
        sudo mkdir -p /var/www/dropshare
        sudo chown $USER:$USER /var/www/dropshare
    fi
    
    cd /var/www/dropshare
    
    # 如果目录为空，初始化git仓库
    if [ ! -d ".git" ]; then
        echo "📥 初始化Git仓库..."
        git init
        git remote add origin https://github.com/xuldqi/dropshare.git || true
    fi
    
    # 拉取最新代码
    echo "📥 拉取最新代码..."
    git fetch origin main || git pull origin main || true
    
    # 创建.env文件
    if [ ! -f ".env" ]; then
        echo "📝 创建.env配置文件..."
        cat > .env << 'EOF'
# DropShare 服务器配置
PRIMARY_DOMAIN=107.174.250.34
SECONDARY_DOMAIN=107.174.250.34

# 应用配置
NODE_ENV=production
PORT=3000

# 文件上传配置
MAX_FILE_SIZE=100MB
UPLOAD_PATH=./uploads

# 日志配置
LOG_LEVEL=info
LOG_PATH=./logs
EOF
    fi
    
    # 创建必要目录
    mkdir -p uploads logs ssl
    
    # 安装依赖
    echo "📦 安装依赖..."
    npm install --production
    
    # 停止现有进程（如果使用PM2）
    if command -v pm2 &> /dev/null; then
        echo "🛑 停止现有PM2进程..."
        pm2 stop dropshare || pm2 delete dropshare || true
    fi
    
    # 启动应用（使用PM2或直接启动）
    if command -v pm2 &> /dev/null; then
        echo "🚀 使用PM2启动应用..."
        pm2 start index.js --name dropshare
        pm2 save
    else
        echo "⚠️  PM2未安装，请手动启动应用:"
        echo "   nohup node index.js > logs/app.log 2>&1 &"
        echo "   或安装PM2: npm install -g pm2"
    fi
    
    # 等待应用启动
    sleep 5
    
    # 检查应用状态
    echo "✅ 检查应用状态..."
    if command -v pm2 &> /dev/null; then
        pm2 status
    fi
    
    # 测试连接
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
    echo "HTTP状态码: $HTTP_CODE"
    
    echo ""
    echo "🎉 部署完成！"
    echo "📡 服务器地址: http://107.174.250.34:3000"
    echo "🔌 WebSocket地址: ws://107.174.250.34:3000/server/webrtc"
ENDSSH

echo ""
echo "✅ 部署脚本执行完成！"
echo ""
echo "📝 下一步："
echo "1. 在Chrome扩展中配置服务器地址: ws://107.174.250.34:3000/server/webrtc"
echo "2. 或者访问网站: http://107.174.250.34:3000"
echo "3. 如果需要HTTPS，请配置Nginx反向代理和SSL证书"
