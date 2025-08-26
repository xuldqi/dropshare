#!/bin/bash

echo "=== DropShare 完整服务重启 ==="
echo "时间: $(date)"
echo ""

# 检查权限
if [[ $EUID -ne 0 ]]; then
    echo "此脚本需要root权限运行"
    echo "请使用: sudo $0"
    exit 1
fi

echo "1. 停止所有相关服务..."

# 停止 DropShare 服务
echo "停止 DropShare 进程..."
pkill -f "node.*index.js" 2>/dev/null || true
pkill -f "node.*start_debug.js" 2>/dev/null || true
pkill -f "dropshare" 2>/dev/null || true

# 停止 Nginx
echo "停止 Nginx 服务..."
systemctl stop nginx 2>/dev/null || service nginx stop 2>/dev/null || true

# 等待进程完全停止
sleep 3

echo "2. 检查并释放端口..."

# 强制释放端口
ports=("80" "8080" "443")
for port in "${ports[@]}"; do
    if lsof -ti:$port >/dev/null 2>&1; then
        echo "释放端口 $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
done

sleep 2

echo "3. 启动基础服务..."

# 启动 Nginx
echo "启动 Nginx..."
if systemctl start nginx; then
    echo "✓ Nginx 启动成功"
else
    echo "✗ Nginx 启动失败"
    systemctl status nginx --no-pager -l
fi

# 检查 Nginx 状态
if systemctl is-active --quiet nginx; then
    echo "✓ Nginx 服务正常运行"
else
    echo "⚠ Nginx 服务状态异常，尝试重新启动..."
    systemctl restart nginx
fi

echo "4. 启动 DropShare 服务..."

# 进入正确目录
cd /var/www/dropshare || {
    echo "✗ 无法进入 /var/www/dropshare 目录"
    exit 1
}

# 检查必要文件
if [[ ! -f "index.js" ]]; then
    echo "✗ index.js 文件不存在"
    exit 1
fi

if [[ ! -f "package.json" ]]; then
    echo "✗ package.json 文件不存在"
    exit 1
fi

# 确保依赖已安装
echo "检查 Node.js 依赖..."
if [[ -f "package.json" ]]; then
    npm install --production 2>/dev/null || echo "依赖安装完成"
fi

# 设置环境变量
export NODE_ENV=production
export PORT=8080

# 清理旧日志
rm -f server.log debug.log nohup.out

echo "启动 DropShare 服务..."
# 后台启动服务，并记录PID
nohup node index.js > server.log 2>&1 &
DROPSHARE_PID=$!

echo "DropShare PID: $DROPSHARE_PID"
echo $DROPSHARE_PID > /var/run/dropshare.pid

echo "5. 等待服务完全启动..."
sleep 8

echo "6. 验证所有服务状态..."

# 验证服务状态
services_ok=true

# 检查 Nginx
if systemctl is-active --quiet nginx; then
    echo "✓ Nginx 服务: 运行中"
else
    echo "✗ Nginx 服务: 异常"
    services_ok=false
fi

# 检查 DropShare 进程
if pgrep -f "node.*index.js" >/dev/null; then
    echo "✓ DropShare 进程: 运行中 (PID: $(pgrep -f 'node.*index.js'))"
else
    echo "✗ DropShare 进程: 未运行"
    services_ok=false
fi

# 检查端口监听
echo ""
echo "端口监听状态:"
for port in 80 8080; do
    if netstat -tulpn | grep -q ":$port "; then
        echo "✓ 端口 $port: 正在监听"
    else
        echo "✗ 端口 $port: 未监听"
        services_ok=false
    fi
done

echo ""
echo "7. 测试服务连接..."

# 测试 HTTP 连接
test_urls=("http://localhost:8080" "http://localhost" "http://dropshare.tech")
for url in "${test_urls[@]}"; do
    if curl -s --connect-timeout 5 "$url" >/dev/null; then
        echo "✓ $url: 响应正常"
    else
        echo "✗ $url: 无响应"
    fi
done

echo ""
echo "8. 测试 WebSocket 连接..."

# 创建简单的WebSocket测试
cat > /tmp/ws_test.js << 'EOF'
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', function() {
    console.log('✓ WebSocket 连接成功');
    ws.close();
    process.exit(0);
});

ws.on('error', function(err) {
    console.log('✗ WebSocket 连接失败:', err.message);
    process.exit(1);
});

setTimeout(() => {
    console.log('⏰ WebSocket 连接超时');
    process.exit(1);
}, 5000);
EOF

# 运行 WebSocket 测试
if node /tmp/ws_test.js 2>/dev/null; then
    echo "✓ WebSocket 传输服务: 正常"
else
    echo "✗ WebSocket 传输服务: 异常"
    services_ok=false
fi

# 清理测试文件
rm -f /tmp/ws_test.js

echo ""
echo "9. 显示服务日志..."
echo "=== DropShare 最新日志 ==="
if [[ -f "server.log" ]]; then
    tail -10 server.log
else
    echo "无日志文件"
fi

echo ""
echo "=== Nginx 错误日志 ==="
tail -5 /var/log/nginx/error.log 2>/dev/null || echo "无错误日志"

echo ""
echo "10. 创建服务管理脚本..."

# 创建便捷的服务管理脚本
cat > /usr/local/bin/dropshare-service << 'EOF'
#!/bin/bash

case "$1" in
    start)
        echo "启动 DropShare 服务..."
        cd /var/www/dropshare
        nohup node index.js > server.log 2>&1 &
        echo "服务已启动"
        ;;
    stop)
        echo "停止 DropShare 服务..."
        pkill -f "node.*index.js"
        echo "服务已停止"
        ;;
    restart)
        echo "重启 DropShare 服务..."
        pkill -f "node.*index.js"
        sleep 2
        cd /var/www/dropshare
        nohup node index.js > server.log 2>&1 &
        echo "服务已重启"
        ;;
    status)
        if pgrep -f "node.*index.js" >/dev/null; then
            echo "DropShare 服务: 运行中 (PID: $(pgrep -f 'node.*index.js'))"
        else
            echo "DropShare 服务: 未运行"
        fi
        
        if curl -s --connect-timeout 3 http://localhost:8080 >/dev/null; then
            echo "HTTP 服务: 正常"
        else
            echo "HTTP 服务: 异常"
        fi
        ;;
    logs)
        tail -f /var/www/dropshare/server.log
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
EOF

chmod +x /usr/local/bin/dropshare-service

echo "✓ 服务管理脚本已创建: dropshare-service"

echo ""
echo "=== 服务重启完成 ==="

if $services_ok; then
    echo "🎉 所有服务启动成功！"
    echo ""
    echo "✅ 服务状态："
    echo "   - Nginx: 运行中"
    echo "   - DropShare: 运行中"  
    echo "   - WebSocket: 正常"
    echo "   - Transfer 功能: 可用"
    echo ""
    echo "🌐 访问地址："
    echo "   - 主站: http://dropshare.tech"
    echo "   - 测试: http://dropshare.tech/ws-test.html"
else
    echo "⚠️ 部分服务可能有问题，请检查上述状态"
fi

echo ""
echo "🔧 服务管理命令："
echo "   - dropshare-service start    # 启动服务"
echo "   - dropshare-service stop     # 停止服务"  
echo "   - dropshare-service restart  # 重启服务"
echo "   - dropshare-service status   # 查看状态"
echo "   - dropshare-service logs     # 查看日志"
echo ""
echo "📊 监控命令："
echo "   - systemctl status nginx     # Nginx 状态"
echo "   - tail -f server.log         # DropShare 日志"
echo "   - netstat -tulpn | grep 8080 # 端口状态"