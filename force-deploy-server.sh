#!/bin/bash

# 强制覆盖服务器代码脚本
# 从本地完全覆盖服务器上的dropshare项目

echo "🚀 开始强制覆盖服务器代码..."
echo "================================"

# 检查参数
if [ $# -eq 0 ]; then
    echo "❌ 请提供服务器地址"
    echo "用法: $0 user@server-ip"
    echo "例如: $0 root@dropshare.tech"
    exit 1
fi

SERVER="$1"
SERVER_PATH="/var/www/dropshare"
LOCAL_PATH="$(pwd)"

echo "服务器: $SERVER"
echo "服务器路径: $SERVER_PATH"
echo "本地路径: $LOCAL_PATH"
echo ""

# 1. 验证本地项目
echo "📋 第1步: 验证本地项目..."
echo "-------------------------"

if [ ! -f "package.json" ]; then
    echo "❌ 当前目录不是dropshare项目"
    exit 1
fi

PROJECT_NAME=$(grep '"name"' package.json | cut -d'"' -f4)
echo "本地项目名称: $PROJECT_NAME"

if [ "$PROJECT_NAME" != "dropshare" ]; then
    echo "❌ 本地项目名称不正确，应该是dropshare"
    exit 1
fi

echo "✅ 本地项目验证通过"
echo ""

# 2. 连接服务器并备份
echo "💾 第2步: 备份服务器现有代码..."
echo "-------------------------------"

ssh $SERVER << 'EOF'
    # 创建备份
    BACKUP_DIR="/tmp/dropshare-backup-$(date +%Y%m%d-%H%M%S)"
    echo "创建备份: $BACKUP_DIR"
    
    if [ -d "/var/www/dropshare" ]; then
        sudo cp -r /var/www/dropshare "$BACKUP_DIR"
        echo "✅ 备份完成: $BACKUP_DIR"
    else
        echo "⚠️  /var/www/dropshare 目录不存在"
    fi
EOF

echo ""

# 3. 停止服务器上的容器
echo "🛑 第3步: 停止服务器容器..."
echo "---------------------------"

ssh $SERVER << 'EOF'
    cd /var/www/dropshare 2>/dev/null || true
    
    # 停止容器
    echo "停止Docker容器..."
    sudo docker-compose down --volumes --remove-orphans 2>/dev/null || true
    
    # 清理Docker资源
    echo "清理Docker资源..."
    sudo docker system prune -f
    
    echo "✅ 容器已停止"
EOF

echo ""

# 4. 清理服务器目录
echo "🗑️  第4步: 清理服务器目录..."
echo "----------------------------"

ssh $SERVER << EOF
    # 完全删除现有目录
    echo "删除现有目录..."
    sudo rm -rf $SERVER_PATH
    
    # 创建新目录
    echo "创建新目录..."
    sudo mkdir -p $SERVER_PATH
    
    # 设置权限
    sudo chown -R \$(whoami):\$(whoami) $SERVER_PATH
    
    echo "✅ 目录清理完成"
EOF

echo ""

# 5. 上传本地代码
echo "📤 第5步: 上传本地代码..."
echo "-------------------------"

# 排除不需要的文件
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'uploads' \
    --exclude 'logs' \
    --exclude '*.log' \
    --exclude '.DS_Store' \
    --exclude 'Thumbs.db' \
    ./ $SERVER:$SERVER_PATH/

echo "✅ 代码上传完成"
echo ""

# 6. 验证服务器代码
echo "🔍 第6步: 验证服务器代码..."
echo "---------------------------"

ssh $SERVER << EOF
    cd $SERVER_PATH
    
    # 检查项目名称
    PROJECT_NAME=\$(grep '"name"' package.json | cut -d'"' -f4)
    echo "服务器项目名称: \$PROJECT_NAME"
    
    if [ "\$PROJECT_NAME" = "dropshare" ]; then
        echo "✅ 项目名称正确"
    else
        echo "❌ 项目名称错误: \$PROJECT_NAME"
        exit 1
    fi
    
    # 检查主页标题
    TITLE=\$(head -20 public/index.html | grep '<title>' | head -1)
    echo "主页标题: \$TITLE"
    
    # 检查关键文件
    echo "检查关键文件..."
    if [ -f "docker-compose.yml" ]; then echo "✅ docker-compose.yml"; else echo "❌ docker-compose.yml"; fi
    if [ -f "Dockerfile" ]; then echo "✅ Dockerfile"; else echo "❌ Dockerfile"; fi
    if [ -f "package.json" ]; then echo "✅ package.json"; else echo "❌ package.json"; fi
    if [ -f "index.js" ]; then echo "✅ index.js"; else echo "❌ index.js"; fi
    if [ -d "public" ]; then echo "✅ public/"; else echo "❌ public/"; fi
    
    echo "✅ 代码验证完成"
EOF

echo ""

# 7. 重新启动服务
echo "🚀 第7步: 重新启动服务..."
echo "-------------------------"

ssh $SERVER << EOF
    cd $SERVER_PATH
    
    # 启动Docker容器
    echo "启动Docker容器..."
    sudo docker-compose up -d --build
    
    # 等待容器启动
    echo "等待容器启动..."
    sleep 10
    
    # 检查容器状态
    echo "检查容器状态..."
    sudo docker ps | grep dropshare || echo "⚠️  未找到dropshare容器"
    
    echo "✅ 服务重启完成"
EOF

echo ""

# 8. 测试访问
echo "🧪 第8步: 测试网站访问..."
echo "-------------------------"

ssh $SERVER << 'EOF'
    echo "测试本地访问..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
    echo "本地端口3000状态: $HTTP_CODE"
    
    echo "测试域名访问..."
    DOMAIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://dropshare.tech 2>/dev/null || echo "000")
    echo "dropshare.tech状态: $DOMAIN_CODE"
EOF

echo ""
echo "================================"
echo "🎉 强制覆盖部署完成！"
echo ""
echo "📋 验证步骤:"
echo "1. 访问 https://dropshare.tech"
echo "2. 检查是否显示dropshare项目"
echo "3. 测试FFmpeg工具加载"
echo "4. 确认英文界面"
echo ""
echo "如果仍有问题，请检查:"
echo "- SSH到服务器: ssh $SERVER"
echo "- 检查容器: sudo docker ps"
echo "- 查看日志: sudo docker logs dropshare-app"
echo "================================"
