#!/bin/bash

echo "=== 修复前端连接问题 ==="
echo "时间: $(date)"
echo ""

# 检查权限
if [[ $EUID -ne 0 ]]; then
    echo "此脚本需要root权限运行"
    echo "请使用: sudo $0"
    exit 1
fi

echo "1. 检查WebSocket连接..."

# 创建WebSocket测试脚本
cat > /tmp/test_websocket.js << 'EOF'
const WebSocket = require('ws');

console.log('测试WebSocket连接...');

// 测试localhost连接
const testConnections = [
    'ws://localhost:8080',
    'ws://127.0.0.1:8080',
    'ws://dropshare.tech'
];

testConnections.forEach((url) => {
    console.log(`\n测试: ${url}`);
    
    const ws = new WebSocket(url);
    
    ws.on('open', function() {
        console.log(`✓ ${url} - WebSocket连接成功`);
        ws.close();
    });
    
    ws.on('error', function(err) {
        console.log(`✗ ${url} - WebSocket连接失败: ${err.message}`);
    });
    
    ws.on('close', function() {
        console.log(`- ${url} - 连接已关闭`);
    });
});

// 给连接时间
setTimeout(() => {
    process.exit(0);
}, 5000);
EOF

# 运行WebSocket测试
cd /var/www/dropshare
if command -v node >/dev/null; then
    node /tmp/test_websocket.js
else
    echo "Node.js 不可用，跳过WebSocket测试"
fi

echo ""
echo "2. 检查Nginx WebSocket代理配置..."

# 查找并备份Nginx配置
nginx_conf="/etc/nginx/conf.d/dropshare.conf"
if [[ ! -f "$nginx_conf" ]]; then
    nginx_conf="/etc/nginx/sites-available/dropshare"
fi
if [[ ! -f "$nginx_conf" ]]; then
    nginx_conf="/etc/nginx/nginx.conf"
fi

echo "检查配置文件: $nginx_conf"

# 检查WebSocket代理配置
if [[ -f "$nginx_conf" ]]; then
    if grep -q "proxy_set_header Upgrade" "$nginx_conf" && grep -q "proxy_set_header Connection" "$nginx_conf"; then
        echo "✓ WebSocket代理配置已存在"
    else
        echo "✗ WebSocket代理配置缺失，正在添加..."
        
        # 备份配置
        cp "$nginx_conf" "$nginx_conf.backup.$(date +%Y%m%d_%H%M%S)"
        
        # 创建新的dropshare配置
        cat > "/etc/nginx/conf.d/dropshare.conf" << 'EOF'
server {
    listen 80;
    server_name dropshare.tech www.dropshare.tech;
    
    # WebSocket和HTTP代理
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        
        # WebSocket支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 标准代理头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket特定设置
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
        proxy_connect_timeout 86400;
        proxy_cache_bypass $http_upgrade;
        
        # 禁用缓冲
        proxy_buffering off;
    }
    
    # 错误和访问日志
    error_log /var/log/nginx/dropshare_error.log;
    access_log /var/log/nginx/dropshare_access.log;
}
EOF
        echo "✓ WebSocket代理配置已添加"
    fi
else
    echo "✗ 未找到Nginx配置文件"
fi

echo ""
echo "3. 重启服务..."

# 测试Nginx配置
if nginx -t; then
    echo "✓ Nginx配置语法正确"
    systemctl reload nginx
    echo "✓ Nginx已重新加载"
else
    echo "✗ Nginx配置错误，恢复备份"
    if [[ -f "$nginx_conf.backup."* ]]; then
        cp "$nginx_conf.backup."* "$nginx_conf"
    fi
    exit 1
fi

# 确保DropShare服务运行正常
echo "检查DropShare服务..."
if pgrep -f "node.*index.js" >/dev/null; then
    echo "✓ DropShare服务正在运行"
else
    echo "启动DropShare服务..."
    cd /var/www/dropshare
    nohup node index.js > server.log 2>&1 &
    sleep 3
fi

echo ""
echo "4. 测试连接..."

# 等待服务稳定
sleep 5

# 测试HTTP连接
echo "测试HTTP连接:"
if curl -s --connect-timeout 10 http://localhost:8080 >/dev/null; then
    echo "✓ HTTP localhost:8080 正常"
else
    echo "✗ HTTP localhost:8080 失败"
fi

if curl -s --connect-timeout 10 http://dropshare.tech >/dev/null; then
    echo "✓ HTTP dropshare.tech 正常"
else
    echo "✗ HTTP dropshare.tech 失败"
fi

# 检查端口监听
echo ""
echo "端口监听状态:"
netstat -tulpn | grep -E ":80|:8080" || echo "未检测到端口监听"

echo ""
echo "5. 生成前端调试页面..."

# 创建WebSocket连接测试页面
cat > "/var/www/dropshare/debug-connection.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>DropShare 连接调试</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .status { padding: 10px; margin: 5px 0; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .info { background: #d1ecf1; color: #0c5460; }
        button { padding: 10px 20px; margin: 5px; }
    </style>
</head>
<body>
    <h1>DropShare 连接调试工具</h1>
    
    <div id="status"></div>
    
    <button onclick="testWebSocket()">测试WebSocket连接</button>
    <button onclick="testHTTP()">测试HTTP连接</button>
    <button onclick="clearLog()">清空日志</button>
    
    <h3>连接日志:</h3>
    <div id="log" style="background: #f8f9fa; padding: 10px; height: 300px; overflow-y: scroll; font-family: monospace;"></div>
    
    <script>
        let ws = null;
        
        function log(message, type = 'info') {
            const logDiv = document.getElementById('log');
            const time = new Date().toLocaleTimeString();
            const color = type === 'error' ? 'red' : type === 'success' ? 'green' : 'blue';
            logDiv.innerHTML += `<div style="color: ${color}">[${time}] ${message}</div>`;
            logDiv.scrollTop = logDiv.scrollHeight;
        }
        
        function updateStatus(message, type) {
            const statusDiv = document.getElementById('status');
            statusDiv.innerHTML = `<div class="${type}">${message}</div>`;
        }
        
        function testWebSocket() {
            log('开始WebSocket连接测试...');
            
            const wsUrls = [
                `ws://${window.location.hostname}:8080`,
                `ws://${window.location.host}`,
                'ws://localhost:8080',
                'ws://dropshare.tech'
            ];
            
            wsUrls.forEach((url, index) => {
                setTimeout(() => {
                    log(`尝试连接: ${url}`);
                    
                    const testWs = new WebSocket(url);
                    
                    testWs.onopen = function() {
                        log(`✓ WebSocket连接成功: ${url}`, 'success');
                        updateStatus('WebSocket连接正常', 'success');
                        testWs.close();
                    };
                    
                    testWs.onerror = function(error) {
                        log(`✗ WebSocket连接失败: ${url} - ${error}`, 'error');
                        updateStatus('WebSocket连接失败', 'error');
                    };
                    
                    testWs.onclose = function(event) {
                        log(`- WebSocket连接关闭: ${url} (代码: ${event.code})`);
                    };
                }, index * 1000);
            });
        }
        
        function testHTTP() {
            log('开始HTTP连接测试...');
            
            fetch('/').then(response => {
                if (response.ok) {
                    log('✓ HTTP连接正常', 'success');
                    updateStatus('HTTP连接正常', 'success');
                } else {
                    log(`✗ HTTP连接失败: ${response.status}`, 'error');
                    updateStatus('HTTP连接失败', 'error');
                }
            }).catch(error => {
                log(`✗ HTTP连接错误: ${error}`, 'error');
                updateStatus('HTTP连接错误', 'error');
            });
        }
        
        function clearLog() {
            document.getElementById('log').innerHTML = '';
        }
        
        // 页面加载时自动测试
        window.onload = function() {
            log('页面加载完成，开始自动测试...');
            testHTTP();
            setTimeout(testWebSocket, 2000);
        };
    </script>
</body>
</html>
EOF

echo "✓ 调试页面已创建: http://dropshare.tech/debug-connection.html"

echo ""
echo "6. 检查防火墙和SELinux..."

# 检查防火墙
if command -v ufw >/dev/null; then
    ufw_status=$(ufw status)
    if echo "$ufw_status" | grep -q "Status: active"; then
        echo "UFW防火墙状态: 活跃"
        if ! echo "$ufw_status" | grep -q "80\|8080"; then
            echo "开放HTTP端口..."
            ufw allow 80
            ufw allow 8080
            echo "✓ HTTP端口已开放"
        fi
    else
        echo "UFW防火墙: 未启用"
    fi
fi

# 检查SELinux
if command -v sestatus >/dev/null; then
    selinux_status=$(sestatus | head -1)
    echo "SELinux状态: $selinux_status"
    if echo "$selinux_status" | grep -q "enabled"; then
        echo "⚠ SELinux可能阻止连接，考虑临时禁用或配置规则"
    fi
fi

echo ""
echo "=== 前端连接修复完成 ==="
echo ""
echo "测试步骤："
echo "1. 访问: http://dropshare.tech/debug-connection.html"
echo "2. 查看连接测试结果"
echo "3. 如果仍有问题，检查浏览器控制台错误"
echo ""
echo "故障排除："
echo "- 查看Nginx错误日志: tail -f /var/log/nginx/dropshare_error.log"
echo "- 查看DropShare日志: tail -f /var/www/dropshare/server.log"
echo "- 重启所有服务: systemctl restart nginx && pkill -f 'node.*index.js' && cd /var/www/dropshare && nohup node index.js > server.log 2>&1 &"

# 清理临时文件
rm -f /tmp/test_websocket.js