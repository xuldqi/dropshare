#!/bin/bash

# DropShare服务器修复脚本
# 用于修复Nginx配置、清理磁盘空间、重启服务

echo "🚀 开始修复DropShare服务器..."
echo "================================="

# 检查是否为root用户
if [[ $EUID -eq 0 ]]; then
   echo "❌ 请不要使用root用户运行此脚本"
   exit 1
fi

# 1. 清理磁盘空间
echo "🧹 第1步: 清理磁盘空间..."
echo "----------------------------"

# 显示当前磁盘使用情况
echo "当前磁盘使用情况:"
df -h | grep -E '/$|/var'

echo ""
echo "清理Docker资源..."
sudo docker system prune -a -f
sudo docker volume prune -f
sudo docker image prune -a -f

echo "清理系统日志..."
sudo journalctl --vacuum-time=7d
sudo journalctl --vacuum-size=100M

echo "清理临时文件..."
sudo rm -rf /tmp/* 2>/dev/null || true
sudo rm -rf /var/tmp/* 2>/dev/null || true

echo "✅ 磁盘清理完成"
echo ""

# 2. 备份现有Nginx配置
echo "💾 第2步: 备份Nginx配置..."
echo "----------------------------"

BACKUP_DIR="/tmp/nginx-backup-$(date +%Y%m%d-%H%M%S)"
sudo mkdir -p "$BACKUP_DIR"
sudo cp -r /etc/nginx/conf.d/* "$BACKUP_DIR/" 2>/dev/null || true
echo "Nginx配置已备份到: $BACKUP_DIR"
echo ""

# 3. 修复dropshare.tech的Nginx配置
echo "🔧 第3步: 修复dropshare.tech Nginx配置..."
echo "-------------------------------------------"

# 创建正确的dropshare HTTP配置
sudo tee /etc/nginx/conf.d/dropshare.tech.http.conf > /dev/null << 'EOF'
server {
    if ($host = www.dropshare.tech) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = dropshare.tech) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name dropshare.tech www.dropshare.tech;

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
    }
}
EOF

# 创建dropshare HTTPS配置
sudo tee /etc/nginx/conf.d/dropshare.tech.https.conf > /dev/null << 'EOF'
server {
    listen 443 ssl http2;
    server_name dropshare.tech www.dropshare.tech;

    # SSL配置 (如果证书存在)
    ssl_certificate /etc/letsencrypt/live/dropshare.tech/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/dropshare.tech/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

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
    }
}
EOF

echo "✅ dropshare.tech Nginx配置已更新"
echo ""

# 4. 修复colletools HTTP配置
echo "🔧 第4步: 修复colletools.com配置..."
echo "-----------------------------------"

sudo tee /etc/nginx/conf.d/colletools.com.http.conf > /dev/null << 'EOF'
server {
    if ($host = www.colletools.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = colletools.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name colletools.com www.colletools.com;
    return 404; # managed by Certbot
}
EOF

echo "✅ colletools.com配置已修复"
echo ""

# 5. 测试Nginx配置
echo "🧪 第5步: 测试Nginx配置..."
echo "----------------------------"

if sudo nginx -t; then
    echo "✅ Nginx配置测试通过"
else
    echo "❌ Nginx配置测试失败，恢复备份..."
    sudo cp -r "$BACKUP_DIR"/* /etc/nginx/conf.d/
    sudo nginx -t
    echo "备份已恢复，请检查配置问题"
    exit 1
fi
echo ""

# 6. 重启服务
echo "🔄 第6步: 重启服务..."
echo "--------------------"

echo "重启Nginx..."
sudo systemctl restart nginx
sleep 2

echo "检查Nginx状态..."
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx运行正常"
else
    echo "❌ Nginx启动失败"
    sudo systemctl status nginx
    exit 1
fi

echo "进入dropshare项目目录..."
cd /var/www/dropshare || {
    echo "❌ dropshare目录不存在，创建并克隆项目..."
    sudo mkdir -p /var/www/dropshare
    sudo chown $(whoami):$(whoami) /var/www/dropshare
    cd /var/www/dropshare
    git clone https://github.com/xuldqi/dropshare.git .
}

echo "拉取最新代码..."
git pull origin main

echo "重启dropshare容器..."
sudo docker-compose down || true
sudo docker-compose up -d --build
echo ""

# 7. 验证结果
echo "✅ 第7步: 验证修复结果..."
echo "--------------------------"

echo "磁盘使用情况:"
df -h | grep -E '/$|/var'
echo ""

echo "Docker容器状态:"
sudo docker ps | grep dropshare || echo "⚠️  dropshare容器未运行"
echo ""

echo "端口占用情况:"
sudo netstat -tlnp | grep -E ':80|:443|:3000' | head -5
echo ""

echo "测试网站访问:"
echo "HTTP dropshare.tech:"
curl -I -s http://dropshare.tech | head -2
echo ""

echo "HTTP colletools.com:"
curl -I -s http://colletools.com | head -2
echo ""

echo "================================="
echo "🎉 DropShare服务器修复完成！"
echo ""
echo "📋 接下来请检查:"
echo "1. 访问 http://dropshare.tech - 应该显示dropshare项目"
echo "2. 访问 http://colletools.com - 应该正常重定向"
echo "3. 测试FFmpeg功能是否正常加载"
echo ""
echo "如果还有问题，请检查:"
echo "- SSL证书是否存在: ls -la /etc/letsencrypt/live/"
echo "- Docker日志: sudo docker logs dropshare-app"
echo "- Nginx日志: sudo tail -f /var/log/nginx/error.log"
echo ""
echo "备份位置: $BACKUP_DIR"
echo "================================="
