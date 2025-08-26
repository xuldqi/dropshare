#!/bin/bash

echo "=== 修复 DropShare 传输服务 ==="
echo "时间: $(date)"
echo ""

# 进入dropshare目录
cd /var/www/dropshare || { echo "错误: 无法进入 /var/www/dropshare 目录"; exit 1; }

echo "1. 停止现有服务..."
# 停止所有node进程
pkill -f "node.*index.js" 2>/dev/null || true
pkill -f "dropshare" 2>/dev/null || true

# 等待进程完全停止
sleep 3

echo "2. 检查端口占用..."
# 强制释放8080端口
if lsof -ti:8080 >/dev/null 2>&1; then
    echo "强制释放端口 8080"
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
fi

# 检查WebSocket端口（如果使用不同端口）
if lsof -ti:8081 >/dev/null 2>&1; then
    echo "强制释放端口 8081"  
    lsof -ti:8081 | xargs kill -9 2>/dev/null || true
fi

sleep 2

echo "3. 检查 index.js 配置..."
if [[ ! -f "index.js" ]]; then
    echo "错误: index.js 文件不存在"
    exit 1
fi

# 检查WebSocket配置
if grep -q "WebSocket\|ws\|wss" index.js; then
    echo "✓ WebSocket 配置已找到"
else
    echo "⚠ 警告: 未在 index.js 中找到 WebSocket 配置"
fi

echo "4. 检查依赖..."
# 确保WebSocket依赖已安装
if [[ -f "package.json" ]]; then
    if grep -q "\"ws\"" package.json; then
        echo "✓ WebSocket 依赖 (ws) 已配置"
    else
        echo "安装 WebSocket 依赖..."
        npm install ws
    fi
    
    # 安装其他可能需要的依赖
    npm install
fi

echo "5. 设置环境变量..."
# 确保正确的环境变量
export NODE_ENV=production
export PORT=8080
export HOST=0.0.0.0

echo "6. 启动传输服务..."
# 创建启动脚本，确保WebSocket服务正确启动
cat > start_transfer_service.sh << 'EOF'
#!/bin/bash
cd /var/www/dropshare

# 设置环境变量
export NODE_ENV=production
export PORT=8080
export HOST=0.0.0.0

# 启动服务，确保输出到日志
echo "$(date): 启动 DropShare 传输服务..." >> server.log
node index.js >> server.log 2>&1
EOF

chmod +x start_transfer_service.sh

# 后台启动服务
echo "后台启动服务..."
nohup ./start_transfer_service.sh &

# 等待服务启动
echo "等待服务启动..."
sleep 5

echo "7. 验证服务状态..."
# 检查进程
if pgrep -f "node.*index.js" > /dev/null; then
    echo "✓ Node.js 进程正在运行"
    echo "进程信息: $(pgrep -f 'node.*index.js')"
else
    echo "✗ Node.js 进程未运行"
fi

# 检查端口监听
if netstat -tulpn 2>/dev/null | grep -q ":8080" || ss -tulpn 2>/dev/null | grep -q ":8080"; then
    echo "✓ 端口 8080 正在监听"
else
    echo "✗ 端口 8080 未监听"
fi

# 测试HTTP响应
echo "8. 测试服务响应..."
if curl -s --connect-timeout 5 http://localhost:8080 >/dev/null; then
    echo "✓ HTTP 服务响应正常"
else
    echo "✗ HTTP 服务无响应"
fi

# 测试WebSocket连接（如果有wscat工具）
if command -v wscat >/dev/null 2>&1; then
    echo "测试 WebSocket 连接..."
    timeout 3 wscat -c ws://localhost:8080 >/dev/null 2>&1 && echo "✓ WebSocket 连接正常" || echo "⚠ WebSocket 连接测试超时"
fi

# 显示最近日志
echo "9. 最近的服务日志:"
if [[ -f "server.log" ]]; then
    tail -10 server.log
else
    echo "未找到服务日志文件"
fi

echo ""
echo "10. 测试传输功能..."
# 创建一个简单的测试页面来验证传输功能
curl -s http://localhost:8080 | grep -q "DropShare" && echo "✓ 主页加载正常" || echo "✗ 主页加载失败"

echo ""
echo "=== 传输服务修复完成 ==="
echo ""
echo "服务状态检查:"
echo "- 进程状态: $(pgrep -f 'node.*index.js' >/dev/null && echo '运行中' || echo '未运行')"
echo "- 端口监听: $(netstat -tulpn 2>/dev/null | grep -q ':8080' && echo '正常' || echo '异常')"
echo "- HTTP响应: $(curl -s --connect-timeout 3 http://localhost:8080 >/dev/null && echo '正常' || echo '异常')"
echo ""
echo "如果传输功能仍有问题，请检查:"
echo "1. 浏览器控制台错误信息"
echo "2. 服务器日志: tail -f server.log"
echo "3. 防火墙设置: sudo ufw status"
echo "4. Nginx代理配置"
echo ""
echo "访问测试: http://dropshare.tech"
echo "本地测试: http://localhost:8080"