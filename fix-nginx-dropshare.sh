#!/bin/bash

# DropShare Nginx配置修复脚本
# 专门解决dropshare.tech显示colletools内容的问题

echo "🔧 开始修复dropshare.tech的Nginx配置..."
echo "=========================================="

# 检查是否为root用户
if [[ $EUID -eq 0 ]]; then
   echo "❌ 请不要使用root用户运行此脚本"
   exit 1
fi

# 1. 备份现有Nginx配置
echo "💾 第1步: 备份现有Nginx配置..."
echo "--------------------------------"

BACKUP_DIR="/tmp/nginx-dropshare-backup-$(date +%Y%m%d-%H%M%S)"
sudo mkdir -p "$BACKUP_DIR"
sudo cp /etc/nginx/conf.d/*dropshare* "$BACKUP_DIR/" 2>/dev/null || true
sudo cp /etc/nginx/sites-enabled/*dropshare* "$BACKUP_DIR/" 2>/dev/null || true
echo "Nginx配置已备份到: $BACKUP_DIR"
echo ""

# 2. 检查dropshare容器状态
echo "🐳 第2步: 检查dropshare容器状态..."
echo "-----------------------------------"

if sudo docker ps | grep -q dropshare; then
    echo "✅ dropshare容器正在运行"
    sudo docker ps | grep dropshare
else
    echo "⚠️  dropshare容器未运行，尝试启动..."
    cd /var/www/dropshare && sudo docker-compose up -d
    sleep 5
    if sudo docker ps | grep -q dropshare; then
        echo "✅ dropshare容器启动成功"
    else
        echo "❌ dropshare容器启动失败，请检查"
        exit 1
    fi
fi
echo ""

# 3. 测试本地端口3000
echo "🧪 第3步: 测试本地端口3000..."
echo "-----------------------------"

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    echo "✅ 端口3000响应正常"
else
    echo "⚠️  端口3000无响应，等待容器完全启动..."
    sleep 10
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
        echo "✅ 端口3000现在响应正常"
    else
        echo "❌ 端口3000仍无响应，但继续配置Nginx"
    fi
fi
echo ""

# 4. 删除旧的dropshare配置文件
echo "🗑️  第4步: 清理旧的dropshare配置..."
echo "-----------------------------------"

sudo rm -f /etc/nginx/conf.d/dropshare.tech.http.conf
sudo rm -f /etc/nginx/conf.d/dropshare.tech.https.conf
sudo rm -f /etc/nginx/sites-enabled/dropshare.tech
sudo rm -f /etc/nginx/sites-available/dropshare.tech
echo "✅ 旧配置文件已清理"
echo ""

# 5. 检查SSL证书
echo "🔐 第5步: 检查SSL证书..."
echo "------------------------"

SSL_CERT="/etc/letsencrypt/live/dropshare.tech/fullchain.pem"
SSL_KEY="/etc/letsencrypt/live/dropshare.tech/privkey.pem"

if [[ -f "$SSL_CERT" && -f "$SSL_KEY" ]]; then
    echo "✅ SSL证书存在，创建HTTPS配置"
    USE_SSL=true
else
    echo "⚠️  SSL证书不存在，创建HTTP配置"
    USE_SSL=false
fi
echo ""

# 6. 创建新的Nginx配置
echo "⚙️  第6步: 创建新的Nginx配置..."
echo "-------------------------------"

if [[ "$USE_SSL" == "true" ]]; then
    # 创建HTTPS配置
    sudo tee /etc/nginx/conf.d/dropshare.tech.conf > /dev/null << 'EOF'
# HTTP重定向到HTTPS
server {
    listen 80;
    server_name dropshare.tech www.dropshare.tech;
    return 301 https://$server_name$request_uri;
}

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name dropshare.tech www.dropshare.tech;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/dropshare.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dropshare.tech/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # 代理到dropshare应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 错误和访问日志
    error_log /var/log/nginx/dropshare_error.log;
    access_log /var/log/nginx/dropshare_access.log;
}
EOF
    echo "✅ 创建了HTTPS配置"
else
    # 创建HTTP配置
    sudo tee /etc/nginx/conf.d/dropshare.tech.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name dropshare.tech www.dropshare.tech;

    # 代理到dropshare应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 错误和访问日志
    error_log /var/log/nginx/dropshare_error.log;
    access_log /var/log/nginx/dropshare_access.log;
}
EOF
    echo "✅ 创建了HTTP配置"
fi
echo ""

# 7. 测试Nginx配置
echo "🧪 第7步: 测试Nginx配置..."
echo "----------------------------"

if sudo nginx -t; then
    echo "✅ Nginx配置测试通过"
else
    echo "❌ Nginx配置测试失败，恢复备份..."
    sudo cp "$BACKUP_DIR"/* /etc/nginx/conf.d/ 2>/dev/null || true
    sudo nginx -t
    echo "备份已恢复"
    exit 1
fi
echo ""

# 8. 重启Nginx
echo "🔄 第8步: 重启Nginx..."
echo "---------------------"

if sudo systemctl restart nginx; then
    echo "✅ Nginx重启成功"
else
    echo "❌ Nginx重启失败"
    sudo systemctl status nginx
    exit 1
fi

# 等待一下让Nginx完全启动
sleep 3
echo ""

# 9. 验证配置
echo "✅ 第9步: 验证修复结果..."
echo "--------------------------"

echo "测试HTTP访问:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://dropshare.tech)
echo "HTTP状态码: $HTTP_CODE"

if [[ "$USE_SSL" == "true" ]]; then
    echo ""
    echo "测试HTTPS访问:"
    HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://dropshare.tech)
    echo "HTTPS状态码: $HTTPS_CODE"
fi

echo ""
echo "检查Nginx进程:"
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx运行正常"
else
    echo "❌ Nginx未运行"
fi

echo ""
echo "检查端口监听:"
sudo netstat -tlnp | grep -E ':80|:443' | head -3

echo ""
echo "=========================================="
echo "🎉 dropshare.tech Nginx配置修复完成！"
echo ""
echo "📋 测试步骤:"
echo "1. 浏览器访问: dropshare.tech"
if [[ "$USE_SSL" == "true" ]]; then
    echo "2. 浏览器访问: https://dropshare.tech"
fi
echo "3. 检查是否显示dropshare项目（英文界面）"
echo "4. 测试FFmpeg工具是否显示'✓ Loaded'"
echo ""
echo "如果仍有问题，请检查:"
echo "- Docker日志: sudo docker logs dropshare-app"
echo "- Nginx错误日志: sudo tail -f /var/log/nginx/error.log"
echo "- Nginx访问日志: sudo tail -f /var/log/nginx/dropshare_access.log"
echo ""
echo "配置备份位置: $BACKUP_DIR"
echo "=========================================="
