#!/bin/bash

echo "=== 修复 Nginx WebSocket 代理配置 ==="

# 检查权限
if [[ $EUID -ne 0 ]]; then
    echo "❌ 需要root权限运行此脚本"
    echo "请使用: sudo $0"
    exit 1
fi

# 检查Nginx是否安装
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx 未安装"
    exit 1
fi

echo "✅ Nginx 检查通过"

# 查找Nginx配置文件
NGINX_CONFIG=""
if [[ -f "/etc/nginx/sites-enabled/dropshare" ]]; then
    NGINX_CONFIG="/etc/nginx/sites-enabled/dropshare"
elif [[ -f "/etc/nginx/conf.d/dropshare.conf" ]]; then
    NGINX_CONFIG="/etc/nginx/conf.d/dropshare.conf"
elif [[ -f "/etc/nginx/nginx.conf" ]]; then
    NGINX_CONFIG="/etc/nginx/nginx.conf"
else
    echo "❌ 找不到 Nginx 配置文件"
    echo "请手动指定配置文件路径"
    exit 1
fi

echo "✅ 找到配置文件: $NGINX_CONFIG"

# 备份配置文件
BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$NGINX_CONFIG" "$BACKUP_FILE"
echo "✅ 配置已备份到: $BACKUP_FILE"

# 创建新的Nginx配置
echo "📝 创建新的 Nginx 配置..."

cat > "$NGINX_CONFIG" << 'EOF'
upstream dropshare_backend {
    server 127.0.0.1:8080;
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    listen 80;
    server_name dropshare.tech;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dropshare.tech;

    # SSL 配置（使用现有证书）
    ssl_certificate /etc/letsencrypt/live/dropshare.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dropshare.tech/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # 根路径代理到 Docker 容器
    location / {
        proxy_pass http://dropshare_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket 特定设置
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
        proxy_connect_timeout 60;
    }

    # WebSocket 服务端点
    location /server {
        proxy_pass http://dropshare_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 超时设置
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_connect_timeout 60s;
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://dropshare_backend;
        proxy_set_header Host $host;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

echo "✅ 新配置已写入"

# 测试配置语法
echo "🔍 测试 Nginx 配置语法..."
if nginx -t; then
    echo "✅ Nginx 配置语法正确"
else
    echo "❌ Nginx 配置语法错误，恢复备份"
    cp "$BACKUP_FILE" "$NGINX_CONFIG"
    exit 1
fi

# 重新加载Nginx
echo "🔄 重新加载 Nginx..."
if systemctl reload nginx; then
    echo "✅ Nginx 重新加载成功"
else
    echo "❌ Nginx 重新加载失败，恢复备份"
    cp "$BACKUP_FILE" "$NGINX_CONFIG"
    systemctl reload nginx
    exit 1
fi

# 等待服务稳定
sleep 3

# 测试配置效果
echo "🧪 测试配置效果..."

# 测试HTTP重定向
echo "测试 HTTP -> HTTPS 重定向:"
HTTP_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://dropshare.tech)
if [[ "$HTTP_TEST" == "301" ]]; then
    echo "✅ HTTP 重定向正常 (301)"
else
    echo "⚠️ HTTP 重定向异常 ($HTTP_TEST)"
fi

# 测试HTTPS访问
echo "测试 HTTPS 主页访问:"
HTTPS_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://dropshare.tech)
if [[ "$HTTPS_TEST" == "200" ]]; then
    echo "✅ HTTPS 主页正常 (200)"
else
    echo "⚠️ HTTPS 主页异常 ($HTTPS_TEST)"
fi

# 测试WebSocket端点
echo "测试 WebSocket 端点:"
WS_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://dropshare.tech/server/webrtc)
if [[ "$WS_TEST" == "426" ]] || [[ "$WS_TEST" == "101" ]] || [[ "$WS_TEST" == "200" ]]; then
    echo "✅ WebSocket 端点响应正常 ($WS_TEST)"
else
    echo "⚠️ WebSocket 端点响应异常 ($WS_TEST)"
fi

# 检查Docker容器状态
echo "检查 Docker 容器状态:"
if docker compose ps | grep -q "Up"; then
    echo "✅ Docker 容器运行正常"
else
    echo "⚠️ Docker 容器可能有问题"
    docker compose ps
fi

echo ""
echo "=== 配置修复完成 ==="
echo ""
echo "🌐 现在测试："
echo "1. 访问: https://dropshare.tech"
echo "2. 检查浏览器控制台，WebSocket应该连接成功"
echo "3. 应该显示设备名称和可以发现其他设备"
echo ""
echo "📋 如果还有问题："
echo "- 查看 Nginx 日志: tail -f /var/log/nginx/error.log"
echo "- 查看 Docker 日志: docker compose logs -f"
echo "- 恢复备份: cp $BACKUP_FILE $NGINX_CONFIG && systemctl reload nginx"
echo ""
echo "✨ 强制刷新浏览器 (Ctrl+Shift+R) 测试修复效果！"