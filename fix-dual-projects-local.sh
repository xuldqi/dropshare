#!/bin/bash

# 双项目共存修复脚本 - 本地版本
# 直接在服务器上运行，无需SSH

echo "🔧 配置双项目共存（本地版本）..."
echo "================================"

# 1. 备份现有配置
echo "💾 第1步: 备份现有Nginx配置..."
echo "-------------------------------"

BACKUP_DIR="/tmp/nginx-dual-backup-$(date +%Y%m%d-%H%M%S)"
sudo mkdir -p "$BACKUP_DIR"
sudo cp /etc/nginx/conf.d/* "$BACKUP_DIR/" 2>/dev/null || true
echo "备份到: $BACKUP_DIR"
echo ""

# 2. 检查当前项目状态
echo "🔍 第2步: 检查当前项目状态..."
echo "-----------------------------"

echo "=== dropshare项目 ==="
if [ -d "/var/www/dropshare" ]; then
    cd /var/www/dropshare
    echo "目录: $(pwd)"
    echo "项目名: $(grep '"name"' package.json 2>/dev/null | cut -d'"' -f4 || echo '未知')"
    echo "Git仓库: $(git remote get-url origin 2>/dev/null || echo '无Git')"
else
    echo "❌ /var/www/dropshare 不存在"
fi

echo ""
echo "=== colletools项目 ==="
if [ -d "/var/www/colletools" ]; then
    cd /var/www/colletools
    echo "目录: $(pwd)"
    echo "项目名: $(grep '"name"' package.json 2>/dev/null | cut -d'"' -f4 || echo '未知')"
    echo "Git仓库: $(git remote get-url origin 2>/dev/null || echo '无Git')"
else
    echo "❌ /var/www/colletools 不存在"
fi

echo ""
echo "=== Docker容器状态 ==="
sudo docker ps | grep -E "dropshare|colletools" || echo "未找到相关容器"

echo ""
echo "=== 端口占用情况 ==="
sudo netstat -tlnp | grep -E ":3000|:3001|:3003" || echo "相关端口未占用"
echo ""

# 3. 修复colletools配置文件
echo "🔧 第3步: 修复colletools Nginx配置..."
echo "------------------------------------"

# 修复colletools HTTP配置
sudo tee /etc/nginx/conf.d/colletools.com.http.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name colletools.com www.colletools.com;
    return 301 https://$server_name$request_uri;
}
EOF

# 修复colletools HTTPS配置
sudo tee /etc/nginx/conf.d/colletools.com.https.conf > /dev/null << 'EOF'
server {
    listen 443 ssl http2;
    server_name colletools.com www.colletools.com;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/colletools.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/colletools.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # 代理到colletools应用 (3003端口)
    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 错误和访问日志
    error_log /var/log/nginx/colletools_error.log;
    access_log /var/log/nginx/colletools_access.log;
}
EOF

echo "✅ colletools配置已修复"
echo ""

# 4. 创建dropshare配置
echo "⚙️  第4步: 创建dropshare Nginx配置..."
echo "------------------------------------"

# 删除可能冲突的dropshare配置
sudo rm -f /etc/nginx/conf.d/dropshare.tech.http.conf
sudo rm -f /etc/nginx/sites-enabled/dropshare.tech

# 创建dropshare配置
sudo tee /etc/nginx/conf.d/dropshare.tech.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name dropshare.tech www.dropshare.tech;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dropshare.tech www.dropshare.tech;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/dropshare.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dropshare.tech/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # 代理到dropshare应用 (3000端口)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 错误和访问日志
    error_log /var/log/nginx/dropshare_error.log;
    access_log /var/log/nginx/dropshare_access.log;
}
EOF

echo "✅ dropshare配置已创建"
echo ""

# 5. 测试Nginx配置
echo "🧪 第5步: 测试Nginx配置..."
echo "----------------------------"

if sudo nginx -t; then
    echo "✅ Nginx配置测试通过"
else
    echo "❌ Nginx配置测试失败"
    echo "恢复备份配置..."
    sudo cp "$BACKUP_DIR"/* /etc/nginx/conf.d/ 2>/dev/null || true
    exit 1
fi
echo ""

# 6. 重启Nginx
echo "🔄 第6步: 重启Nginx..."
echo "---------------------"

if sudo systemctl restart nginx; then
    echo "✅ Nginx重启成功"
else
    echo "❌ Nginx重启失败"
    sudo systemctl status nginx
    exit 1
fi
echo ""

# 7. 检查应用状态
echo "📊 第7步: 检查应用状态..."
echo "-------------------------"

echo "=== 端口监听状态 ==="
sudo netstat -tlnp | grep -E ":80|:443|:3000|:3003" | head -6

echo ""
echo "=== Docker容器状态 ==="
sudo docker ps | grep -E "dropshare|colletools" | head -5

echo ""
echo "=== 域名访问测试 ==="
echo "dropshare.tech HTTP状态: $(curl -s -o /dev/null -w '%{http_code}' http://dropshare.tech 2>/dev/null || echo '000')"
echo "dropshare.tech HTTPS状态: $(curl -s -o /dev/null -w '%{http_code}' https://dropshare.tech 2>/dev/null || echo '000')"
echo "colletools.com HTTP状态: $(curl -s -o /dev/null -w '%{http_code}' http://colletools.com 2>/dev/null || echo '000')"
echo "colletools.com HTTPS状态: $(curl -s -o /dev/null -w '%{http_code}' https://colletools.com 2>/dev/null || echo '000')"

echo ""
echo "================================"
echo "🎉 双项目配置完成！"
echo ""
echo "📋 项目访问:"
echo "- dropshare.tech → http://127.0.0.1:3000 (dropshare项目)"
echo "- colletools.com → http://127.0.0.1:3003 (colletools项目)"
echo ""
echo "🔍 测试访问:"
echo "1. 浏览器访问 https://dropshare.tech"
echo "2. 浏览器访问 https://colletools.com"
echo ""
echo "📝 如需调试:"
echo "- 查看dropshare日志: sudo tail -f /var/log/nginx/dropshare_error.log"
echo "- 查看colletools日志: sudo tail -f /var/log/nginx/colletools_error.log"
echo "- 查看容器日志: sudo docker logs dropshare-app"
echo ""
echo "配置备份位置: $BACKUP_DIR"
echo "================================"
