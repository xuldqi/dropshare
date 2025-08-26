#!/bin/bash

echo "=== 修复 Nginx 配置错误 ==="
echo "时间: $(date)"

# 检查是否以root权限运行
if [[ $EUID -ne 0 ]]; then
    echo "此脚本需要root权限运行"
    echo "请使用: sudo $0"
    exit 1
fi

# 查找Nginx配置文件
echo "1. 查找Nginx配置文件..."
nginx_configs=(
    "/etc/nginx/nginx.conf"
    "/etc/nginx/conf.d/*.conf"
    "/etc/nginx/sites-available/*"
    "/etc/nginx/sites-enabled/*"
    "/usr/local/etc/nginx/nginx.conf"
)

found_configs=()
for pattern in "${nginx_configs[@]}"; do
    for file in $pattern; do
        if [[ -f "$file" ]]; then
            found_configs+=("$file")
        fi
    done
done

if [[ ${#found_configs[@]} -eq 0 ]]; then
    echo "✗ 未找到Nginx配置文件"
    exit 1
fi

echo "找到以下配置文件:"
for config in "${found_configs[@]}"; do
    echo "  - $config"
done

# 备份配置文件
echo ""
echo "2. 备份现有配置..."
backup_dir="/tmp/nginx_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"

for config in "${found_configs[@]}"; do
    cp "$config" "$backup_dir/"
    echo "  备份: $config -> $backup_dir/$(basename $config)"
done

# 修复错误的upstream配置
echo ""
echo "3. 修复upstream配置错误..."

# 常见的错误模式和修复
declare -A fixes=(
    ["http://t::1:8080"]="http://127.0.0.1:8080"
    ["http://t::1:3000"]="http://127.0.0.1:3000"
    ["upstream: \"http://t::1"]="upstream: \"http://127.0.0.1"
    ["proxy_pass http://t::1"]="proxy_pass http://127.0.0.1"
)

fixed_files=()
for config in "${found_configs[@]}"; do
    original_content=$(cat "$config")
    modified_content="$original_content"
    
    for error_pattern in "${!fixes[@]}"; do
        fixed_pattern="${fixes[$error_pattern]}"
        if echo "$original_content" | grep -q "$error_pattern"; then
            echo "  修复 $config 中的: $error_pattern -> $fixed_pattern"
            modified_content=$(echo "$modified_content" | sed "s|$error_pattern|$fixed_pattern|g")
            fixed_files+=("$config")
        fi
    done
    
    # 如果有修改，写入文件
    if [[ "$original_content" != "$modified_content" ]]; then
        echo "$modified_content" > "$config"
        echo "  ✓ 已修复: $config"
    fi
done

# 检查Nginx配置语法
echo ""
echo "4. 验证Nginx配置语法..."
if nginx -t; then
    echo "✓ Nginx配置语法正确"
else
    echo "✗ Nginx配置语法错误"
    echo "正在恢复备份..."
    for config in "${found_configs[@]}"; do
        cp "$backup_dir/$(basename $config)" "$config"
    done
    echo "已恢复备份，请手动检查配置"
    exit 1
fi

# 生成标准的dropshare配置
echo ""
echo "5. 生成标准配置..."
cat > "/etc/nginx/conf.d/dropshare.conf" << 'EOF'
server {
    listen 80;
    server_name dropshare.tech www.dropshare.tech;
    
    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # WebSocket支持
    location /ws {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://127.0.0.1:8080;
        proxy_cache_valid 200 1d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

echo "✓ 已生成标准dropshare配置: /etc/nginx/conf.d/dropshare.conf"

# 重启相关服务
echo ""
echo "6. 重启服务..."

# 重启Nginx
echo "重启Nginx..."
if systemctl restart nginx; then
    echo "✓ Nginx重启成功"
else
    echo "✗ Nginx重启失败"
    systemctl status nginx
fi

# 检查dropshare服务
echo "检查dropshare服务..."
if systemctl is-active --quiet dropshare; then
    echo "✓ DropShare服务正在运行"
    systemctl restart dropshare
    echo "✓ DropShare服务已重启"
elif pgrep -f "node.*index.js" > /dev/null; then
    echo "✓ DropShare进程正在运行"
    pkill -f "node.*index.js"
    sleep 2
    cd /var/www/dropshare
    nohup node index.js > /dev/null 2>&1 &
    echo "✓ DropShare进程已重启"
else
    echo "启动DropShare服务..."
    cd /var/www/dropshare
    nohup node index.js > /dev/null 2>&1 &
    echo "✓ DropShare服务已启动"
fi

# 验证修复结果
echo ""
echo "7. 验证修复结果..."

sleep 5

# 检查端口监听
if netstat -tulpn | grep -q ":8080"; then
    echo "✓ 端口8080正在监听"
else
    echo "✗ 端口8080未监听"
fi

if netstat -tulpn | grep -q ":80"; then
    echo "✓ 端口80正在监听"
else
    echo "✗ 端口80未监听"
fi

# 测试HTTP响应
echo "测试本地连接..."
if curl -s --connect-timeout 5 http://localhost:8080 > /dev/null; then
    echo "✓ 后端服务响应正常"
else
    echo "✗ 后端服务无响应"
fi

if curl -s --connect-timeout 5 http://localhost > /dev/null; then
    echo "✓ Nginx代理响应正常"
else
    echo "✗ Nginx代理无响应"
fi

echo ""
echo "=== 修复完成 ==="
echo "备份位置: $backup_dir"
echo ""
echo "如果仍有问题，请检查:"
echo "1. 防火墙设置: ufw status"
echo "2. SELinux状态: sestatus"
echo "3. 服务日志: journalctl -u nginx -f"
echo "4. DropShare日志: tail -f /var/www/dropshare/server.log"
echo ""
echo "测试连接:"
echo "- 内部: curl http://localhost"
echo "- 外部: curl http://dropshare.tech"