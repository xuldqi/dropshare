#!/bin/bash

# 502 Bad Gateway 诊断脚本
# 用于检查服务器状态和配置

echo "🔍 开始诊断 502 Bad Gateway 错误..."
echo ""

# 服务器信息
SERVER_HOST="107.174.250.34"
SERVER_USER="novcat"
SSH_KEY_FILE="$HOME/.ssh/dropshare_server_key"

# 检查SSH密钥
if [ ! -f "$SSH_KEY_FILE" ]; then
    echo "❌ SSH密钥文件不存在: $SSH_KEY_FILE"
    echo "请先运行部署脚本或手动创建SSH密钥文件"
    exit 1
fi

SSH_OPTS="-i $SSH_KEY_FILE -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

echo "📡 连接到服务器 $SERVER_USER@$SERVER_HOST..."
echo ""

# 执行诊断
ssh $SSH_OPTS $SERVER_USER@$SERVER_HOST << 'ENDSSH'
    echo "=========================================="
    echo "1. 检查Docker容器状态"
    echo "=========================================="
    docker ps -a | grep dropshare || echo "❌ 没有找到dropshare容器"
    echo ""
    
    echo "=========================================="
    echo "2. 检查容器日志（最近50行）"
    echo "=========================================="
    if docker ps | grep -q dropshare-app; then
        echo "--- dropshare-app 容器日志 ---"
        docker logs --tail 50 dropshare-app 2>&1 | tail -20
    else
        echo "❌ dropshare-app 容器未运行"
    fi
    echo ""
    
    echo "=========================================="
    echo "3. 检查端口监听状态"
    echo "=========================================="
    echo "端口3000监听状态:"
    netstat -tlnp 2>/dev/null | grep :3000 || ss -tlnp 2>/dev/null | grep :3000 || echo "❌ 端口3000未监听"
    echo ""
    echo "端口80监听状态:"
    netstat -tlnp 2>/dev/null | grep :80 || ss -tlnp 2>/dev/null | grep :80 || echo "⚠️  端口80未监听（可能使用Nginx）"
    echo ""
    echo "端口443监听状态:"
    netstat -tlnp 2>/dev/null | grep :443 || ss -tlnp 2>/dev/null | grep :443 || echo "⚠️  端口443未监听（可能使用Nginx）"
    echo ""
    
    echo "=========================================="
    echo "4. 检查Nginx状态"
    echo "=========================================="
    if command -v nginx &> /dev/null; then
        systemctl status nginx --no-pager -l | head -20 || echo "❌ Nginx未运行"
        echo ""
        echo "Nginx配置测试:"
        sudo nginx -t 2>&1 || echo "❌ Nginx配置有误"
    else
        echo "⚠️  Nginx未安装"
    fi
    echo ""
    
    echo "=========================================="
    echo "5. 检查应用健康状态"
    echo "=========================================="
    echo "测试本地3000端口:"
    curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" http://localhost:3000 || echo "❌ 无法连接到localhost:3000"
    echo ""
    
    echo "测试容器内3000端口:"
    if docker ps | grep -q dropshare-app; then
        docker exec dropshare-app curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" http://localhost:3000 2>&1 || echo "❌ 容器内无法连接"
    fi
    echo ""
    
    echo "=========================================="
    echo "6. 检查环境变量"
    echo "=========================================="
    if [ -f "/var/www/dropshare/.env" ]; then
        echo "--- .env 文件内容 ---"
        cat /var/www/dropshare/.env
    else
        echo "❌ .env 文件不存在"
    fi
    echo ""
    
    echo "=========================================="
    echo "7. 检查Docker Compose配置"
    echo "=========================================="
    if [ -f "/var/www/dropshare/docker-compose.yml" ]; then
        echo "--- docker-compose.yml 端口映射 ---"
        grep -A 2 "ports:" /var/www/dropshare/docker-compose.yml || echo "未找到端口配置"
    else
        echo "❌ docker-compose.yml 不存在"
    fi
    echo ""
    
    echo "=========================================="
    echo "8. 检查防火墙状态"
    echo "=========================================="
    if command -v ufw &> /dev/null; then
        ufw status | head -10
    elif command -v firewall-cmd &> /dev/null; then
        firewall-cmd --list-all 2>/dev/null | head -10
    else
        echo "⚠️  未检测到防火墙管理工具"
    fi
    echo ""
    
    echo "=========================================="
    echo "9. 检查进程状态"
    echo "=========================================="
    echo "Node.js进程:"
    ps aux | grep node | grep -v grep || echo "❌ 没有Node.js进程"
    echo ""
    echo "Docker进程:"
    ps aux | grep docker | grep -v grep | head -3
    echo ""
    
    echo "=========================================="
    echo "10. 快速修复建议"
    echo "=========================================="
    echo "如果容器未运行，执行:"
    echo "  cd /var/www/dropshare && docker-compose up -d"
    echo ""
    echo "如果容器运行但端口未监听，检查:"
    echo "  docker logs dropshare-app"
    echo ""
    echo "如果Nginx配置有问题，检查:"
    echo "  sudo nginx -t"
    echo "  sudo tail -f /var/log/nginx/error.log"
    echo ""
ENDSSH

echo ""
echo "✅ 诊断完成！"
echo ""
echo "📝 常见问题和解决方案："
echo "1. 容器未运行 → cd /var/www/dropshare && docker-compose up -d"
echo "2. 端口未监听 → 检查应用日志: docker logs dropshare-app"
echo "3. Nginx配置错误 → sudo nginx -t 检查配置"
echo "4. 防火墙阻止 → 开放端口: sudo ufw allow 3000"

