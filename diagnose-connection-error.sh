#!/bin/bash

echo "=== DropShare 连接错误诊断 ==="
echo "时间: $(date)"
echo ""

echo "1. 检查服务运行状态..."

# 检查进程
echo "进程状态:"
if pgrep -f "node.*index.js" >/dev/null; then
    echo "✓ DropShare进程: 运行中 (PID: $(pgrep -f 'node.*index.js'))"
else
    echo "✗ DropShare进程: 未运行"
fi

if systemctl is-active --quiet nginx 2>/dev/null; then
    echo "✓ Nginx服务: 运行中"
else
    echo "✗ Nginx服务: 未运行或异常"
fi

echo ""
echo "2. 检查端口监听..."
echo "端口状态:"
netstat -tulpn 2>/dev/null | grep -E ":80|:8080" | head -5 || echo "无监听端口"

echo ""
echo "3. 测试连接..."

# 测试各种连接
urls=("http://localhost:8080" "http://127.0.0.1:8080" "http://localhost" "http://dropshare.tech")
for url in "${urls[@]}"; do
    echo -n "测试 $url: "
    
    response=$(curl -s -w "%{http_code}" -o /dev/null --connect-timeout 3 "$url" 2>/dev/null)
    
    if [[ "$response" == "200" ]]; then
        echo "✓ 正常 (HTTP $response)"
    elif [[ -n "$response" ]]; then
        echo "✗ 错误 (HTTP $response)"
    else
        echo "✗ 无法连接"
    fi
done

echo ""
echo "4. WebSocket连接测试..."

# 检查WebSocket依赖
if [[ -f "/var/www/dropshare/package.json" ]]; then
    cd /var/www/dropshare
    if grep -q "ws" package.json; then
        echo "✓ WebSocket依赖: 已配置"
    else
        echo "✗ WebSocket依赖: 缺失"
        echo "安装WebSocket依赖..."
        npm install ws 2>/dev/null
    fi
fi

# 简单WebSocket测试
echo "测试WebSocket连接:"
cat > /tmp/quick_ws_test.js << 'EOF'
try {
    const WebSocket = require('ws');
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.on('open', function() {
        console.log('✓ WebSocket连接成功');
        process.exit(0);
    });
    
    ws.on('error', function(err) {
        console.log('✗ WebSocket连接失败:', err.code || err.message);
        process.exit(1);
    });
    
    setTimeout(() => {
        console.log('✗ WebSocket连接超时');
        process.exit(1);
    }, 3000);
} catch (err) {
    console.log('✗ WebSocket模块错误:', err.message);
    process.exit(1);
}
EOF

cd /var/www/dropshare 2>/dev/null || cd /tmp
timeout 5 node /tmp/quick_ws_test.js 2>/dev/null || echo "WebSocket测试失败"

echo ""
echo "5. 检查错误日志..."

echo "DropShare日志 (最新5行):"
if [[ -f "/var/www/dropshare/server.log" ]]; then
    tail -5 /var/www/dropshare/server.log | grep -E "(error|Error|fail|Fail)" || echo "无明显错误"
else
    echo "无日志文件"
fi

echo ""
echo "Nginx错误日志 (最新3行):"
tail -3 /var/log/nginx/error.log 2>/dev/null | grep -E "(error|fail)" || echo "无相关错误"

echo ""
echo "6. DNS和网络检查..."

# 检查DNS解析
echo "DNS解析测试:"
if command -v nslookup >/dev/null 2>&1; then
    nslookup dropshare.tech 2>/dev/null | grep -A2 "Name:" || echo "DNS解析可能有问题"
else
    echo "无法进行DNS测试"
fi

echo ""
echo "7. 快速修复尝试..."

# 快速修复常见问题
fixes_applied=()

# 检查并修复Nginx配置
if [[ ! -f "/etc/nginx/conf.d/dropshare.conf" ]]; then
    echo "创建Nginx配置..."
    cat > "/etc/nginx/conf.d/dropshare.conf" << 'EOF'
server {
    listen 80;
    server_name dropshare.tech www.dropshare.tech;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
EOF
    fixes_applied+=("Nginx配置")
    nginx -t && systemctl reload nginx 2>/dev/null
fi

# 重启DropShare如果未运行
if ! pgrep -f "node.*index.js" >/dev/null; then
    echo "重启DropShare服务..."
    cd /var/www/dropshare
    nohup node index.js > server.log 2>&1 &
    sleep 3
    fixes_applied+=("DropShare重启")
fi

if [[ ${#fixes_applied[@]} -gt 0 ]]; then
    echo "已应用修复: ${fixes_applied[*]}"
    echo "等待服务稳定..."
    sleep 5
fi

echo ""
echo "8. 最终连接测试..."

final_test_url="http://dropshare.tech"
echo "最终测试: $final_test_url"

response=$(curl -s -w "%{http_code}" -o /tmp/final_test.html --connect-timeout 10 "$final_test_url" 2>/dev/null)

if [[ "$response" == "200" ]]; then
    echo "✓ HTTP连接正常"
    
    # 检查页面内容是否包含错误
    if grep -qi "connection.*lost\|error\|500\|502\|503" /tmp/final_test.html 2>/dev/null; then
        echo "⚠ 页面可能包含错误信息"
        echo "页面关键内容:"
        grep -i "connection\|error" /tmp/final_test.html | head -2
    else
        echo "✓ 页面内容正常"
    fi
else
    echo "✗ HTTP连接失败 (状态码: $response)"
fi

# 清理临时文件
rm -f /tmp/quick_ws_test.js /tmp/final_test.html

echo ""
echo "=== 诊断完成 ==="
echo ""
echo "🔧 建议操作:"

# 根据检测结果给出建议
if ! pgrep -f "node.*index.js" >/dev/null; then
    echo "1. 启动DropShare: cd /var/www/dropshare && nohup node index.js > server.log 2>&1 &"
fi

if ! systemctl is-active --quiet nginx 2>/dev/null; then
    echo "2. 启动Nginx: systemctl start nginx"
fi

if ! netstat -tulpn 2>/dev/null | grep -q ":8080"; then
    echo "3. 检查端口占用: lsof -i :8080 或重启服务"
fi

echo "4. 查看详细日志: tail -f /var/www/dropshare/server.log"
echo "5. 完全重启: ./restart-all-services.sh"

echo ""
echo "如果问题持续存在，请提供以上诊断结果。"