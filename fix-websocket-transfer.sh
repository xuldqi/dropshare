#!/bin/bash

echo "=== 修复 DropShare WebSocket Transfer 服务 ==="
echo "时间: $(date)"
echo ""

# 检查权限
if [[ $EUID -ne 0 ]]; then
    echo "此脚本需要root权限运行"
    echo "请使用: sudo $0"
    exit 1
fi

echo "1. 停止现有服务..."
# 完全停止dropshare进程
pkill -f "node.*index.js" 2>/dev/null || true
sleep 3

echo "2. 修复Nginx WebSocket代理配置..."

# 创建正确的dropshare配置
cat > "/etc/nginx/conf.d/dropshare.conf" << 'EOF'
# DropShare WebSocket配置
server {
    listen 80;
    server_name dropshare.tech www.dropshare.tech;
    
    # 主要位置 - 支持WebSocket升级
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        
        # WebSocket关键配置
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 标准代理头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket超时设置
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        proxy_connect_timeout 60s;
        
        # 禁用代理缓存
        proxy_cache_bypass $http_upgrade;
        proxy_no_cache $http_upgrade;
        proxy_buffering off;
        
        # 额外的WebSocket支持
        proxy_set_header Origin "";
    }
    
    # 专门的WebSocket路径（如果前端使用特定路径）
    location /ws {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400s;
    }
    
    # 日志
    access_log /var/log/nginx/dropshare_access.log;
    error_log /var/log/nginx/dropshare_error.log debug;
}
EOF

echo "3. 测试并重新加载Nginx..."
if nginx -t; then
    systemctl reload nginx
    echo "✓ Nginx配置已重新加载"
else
    echo "✗ Nginx配置错误"
    nginx -t
    exit 1
fi

echo "4. 启动DropShare服务（调试模式）..."
cd /var/www/dropshare

# 创建调试启动脚本
cat > start_debug.js << 'EOF'
// 调试模式启动脚本
console.log('=== DropShare 调试启动 ===');
console.log('时间:', new Date().toISOString());
console.log('Node版本:', process.version);
console.log('工作目录:', process.cwd());

// 检查WebSocket模块
try {
    const WebSocket = require('ws');
    console.log('✓ WebSocket模块加载成功');
} catch (error) {
    console.log('✗ WebSocket模块加载失败:', error.message);
    process.exit(1);
}

// 设置环境变量
process.env.NODE_ENV = 'production';
process.env.PORT = '8080';

console.log('环境变量:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);

console.log('');
console.log('开始加载主程序...');

// 加载主程序
require('./index.js');
EOF

# 后台启动调试服务
nohup node start_debug.js > debug.log 2>&1 &
echo "✓ DropShare服务已启动（调试模式）"

echo "5. 等待服务稳定..."
sleep 5

echo "6. 验证服务状态..."

# 检查进程
if pgrep -f "node.*start_debug.js" >/dev/null; then
    echo "✓ DropShare进程正在运行"
else
    echo "✗ DropShare进程未运行"
    echo "调试日志："
    tail -10 debug.log
fi

# 检查端口监听
if netstat -tulpn | grep -q ":8080"; then
    echo "✓ 端口8080正在监听"
else
    echo "✗ 端口8080未监听"
fi

echo "7. 测试WebSocket连接..."

# 创建WebSocket测试脚本
cat > test_ws.js << 'EOF'
const WebSocket = require('ws');

console.log('测试WebSocket连接到 ws://localhost:8080');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', function open() {
    console.log('✓ WebSocket连接成功！');
    
    // 发送测试消息
    ws.send(JSON.stringify({
        type: 'ping',
        data: 'test connection'
    }));
    
    setTimeout(() => {
        ws.close();
        process.exit(0);
    }, 2000);
});

ws.on('message', function message(data) {
    console.log('收到消息:', data.toString());
});

ws.on('error', function error(err) {
    console.log('✗ WebSocket连接失败:', err.message);
    process.exit(1);
});

ws.on('close', function close() {
    console.log('WebSocket连接已关闭');
});

// 超时处理
setTimeout(() => {
    console.log('✗ WebSocket连接超时');
    process.exit(1);
}, 10000);
EOF

# 运行WebSocket测试
node test_ws.js

echo ""
echo "8. 检查服务日志..."
echo "=== 最新的调试日志 ==="
tail -20 debug.log

echo ""
echo "=== Nginx错误日志 ==="
tail -5 /var/log/nginx/dropshare_error.log 2>/dev/null || echo "无错误日志"

echo ""
echo "9. 创建浏览器测试页面..."

# 创建WebSocket测试页面
cat > "/var/www/dropshare/websocket-test.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Transfer 测试</title>
    <meta charset="utf-8">
    <style>
        body { font-family: monospace; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .info { background: #d1ecf1; color: #0c5460; }
        .warning { background: #fff3cd; color: #856404; }
        button { padding: 8px 16px; margin: 5px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
        #log { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; height: 400px; overflow-y: auto; white-space: pre-wrap; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 DropShare WebSocket Transfer 测试</h1>
        
        <div id="status" class="status info">准备测试WebSocket连接...</div>
        
        <div style="margin: 20px 0;">
            <button onclick="testWebSocket()">🔌 测试WebSocket连接</button>
            <button onclick="testMultipleConnections()">🔗 测试多重连接</button>
            <button onclick="simulateTransfer()">📁 模拟文件传输</button>
            <button onclick="clearLog()">🗑️ 清空日志</button>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
                <h3>连接信息</h3>
                <div id="connection-info" style="background: #f8f9fa; padding: 10px; border-radius: 4px;">
                    <div>服务器: <span id="server-url">-</span></div>
                    <div>状态: <span id="connection-status">未连接</span></div>
                    <div>协议: <span id="protocol">-</span></div>
                    <div>延迟: <span id="ping">-</span></div>
                </div>
            </div>
            <div>
                <h3>传输统计</h3>
                <div id="transfer-stats" style="background: #f8f9fa; padding: 10px; border-radius: 4px;">
                    <div>发送消息: <span id="sent-count">0</span></div>
                    <div>接收消息: <span id="received-count">0</span></div>
                    <div>错误次数: <span id="error-count">0</span></div>
                    <div>重连次数: <span id="reconnect-count">0</span></div>
                </div>
            </div>
        </div>
        
        <h3>实时日志</h3>
        <div id="log"></div>
    </div>
    
    <script>
        let ws = null;
        let stats = {
            sent: 0,
            received: 0,
            errors: 0,
            reconnects: 0
        };
        
        function log(message, type = 'info') {
            const logDiv = document.getElementById('log');
            const time = new Date().toLocaleTimeString();
            const colors = {
                info: '#0c5460',
                success: '#155724', 
                error: '#721c24',
                warning: '#856404'
            };
            
            logDiv.innerHTML += `<span style="color: ${colors[type] || colors.info}">[${time}] ${message}</span>\n`;
            logDiv.scrollTop = logDiv.scrollHeight;
        }
        
        function updateStatus(message, type) {
            const statusDiv = document.getElementById('status');
            statusDiv.className = `status ${type}`;
            statusDiv.textContent = message;
        }
        
        function updateConnectionInfo(url, status, protocol = '-') {
            document.getElementById('server-url').textContent = url || '-';
            document.getElementById('connection-status').textContent = status;
            document.getElementById('protocol').textContent = protocol;
        }
        
        function updateStats() {
            document.getElementById('sent-count').textContent = stats.sent;
            document.getElementById('received-count').textContent = stats.received;
            document.getElementById('error-count').textContent = stats.errors;
            document.getElementById('reconnect-count').textContent = stats.reconnects;
        }
        
        function testWebSocket() {
            log('🔌 开始WebSocket连接测试...', 'info');
            
            const wsUrl = `ws://${window.location.host}`;
            log(`尝试连接: ${wsUrl}`, 'info');
            
            if (ws && ws.readyState === WebSocket.OPEN) {
                log('关闭现有连接...', 'warning');
                ws.close();
            }
            
            ws = new WebSocket(wsUrl);
            updateConnectionInfo(wsUrl, '连接中...');
            
            const startTime = Date.now();
            
            ws.onopen = function(event) {
                const latency = Date.now() - startTime;
                log(`✅ WebSocket连接成功！延迟: ${latency}ms`, 'success');
                updateStatus('✅ WebSocket连接正常', 'success');
                updateConnectionInfo(wsUrl, '已连接', ws.protocol || 'ws');
                document.getElementById('ping').textContent = `${latency}ms`;
                
                // 发送心跳测试
                const testMessage = JSON.stringify({
                    type: 'ping',
                    timestamp: Date.now(),
                    data: 'browser-test'
                });
                
                ws.send(testMessage);
                stats.sent++;
                updateStats();
                log('📤 发送心跳消息', 'info');
            };
            
            ws.onmessage = function(event) {
                stats.received++;
                updateStats();
                log(`📥 收到消息: ${event.data}`, 'success');
            };
            
            ws.onerror = function(error) {
                stats.errors++;
                updateStats();
                log(`❌ WebSocket错误: ${error}`, 'error');
                updateStatus('❌ WebSocket连接失败', 'error');
                updateConnectionInfo(wsUrl, '连接失败');
            };
            
            ws.onclose = function(event) {
                log(`🔌 WebSocket连接关闭 (代码: ${event.code}, 原因: ${event.reason})`, 'warning');
                updateConnectionInfo(wsUrl, '已断开');
                
                if (event.code !== 1000) {
                    updateStatus('⚠️ WebSocket异常关闭', 'warning');
                }
            };
        }
        
        function testMultipleConnections() {
            log('🔗 测试多重连接...', 'info');
            
            for (let i = 1; i <= 3; i++) {
                setTimeout(() => {
                    const testWs = new WebSocket(`ws://${window.location.host}`);
                    log(`连接 #${i} 尝试中...`, 'info');
                    
                    testWs.onopen = function() {
                        log(`✅ 连接 #${i} 成功`, 'success');
                        setTimeout(() => testWs.close(), 2000);
                    };
                    
                    testWs.onerror = function() {
                        log(`❌ 连接 #${i} 失败`, 'error');
                    };
                }, i * 500);
            }
        }
        
        function simulateTransfer() {
            if (!ws || ws.readyState !== WebSocket.OPEN) {
                log('❌ 请先建立WebSocket连接', 'error');
                return;
            }
            
            log('📁 模拟文件传输...', 'info');
            
            // 模拟设备发现
            const deviceInfo = {
                type: 'device-discovery',
                deviceId: 'browser-test-' + Date.now(),
                deviceName: 'Test Browser',
                timestamp: Date.now()
            };
            
            ws.send(JSON.stringify(deviceInfo));
            stats.sent++;
            updateStats();
            log('📱 发送设备发现信息', 'info');
            
            // 模拟文件传输请求
            setTimeout(() => {
                const transferRequest = {
                    type: 'transfer-request',
                    fileName: 'test-file.txt',
                    fileSize: 1024,
                    fileType: 'text/plain',
                    timestamp: Date.now()
                };
                
                ws.send(JSON.stringify(transferRequest));
                stats.sent++;
                updateStats();
                log('📤 发送传输请求', 'info');
            }, 1000);
        }
        
        function clearLog() {
            document.getElementById('log').innerHTML = '';
        }
        
        // 页面加载时自动测试
        window.onload = function() {
            log('🚀 页面加载完成，开始自动测试...', 'info');
            setTimeout(testWebSocket, 1000);
        };
    </script>
</body>
</html>
EOF

echo "✓ 测试页面已创建: http://dropshare.tech/websocket-test.html"

echo ""
echo "=== WebSocket Transfer 修复完成 ==="
echo ""
echo "🔍 测试步骤："
echo "1. 访问: http://dropshare.tech/websocket-test.html"
echo "2. 点击'测试WebSocket连接'按钮"
echo "3. 查看连接状态和日志"
echo ""
echo "📊 监控命令："
echo "- 查看调试日志: tail -f debug.log"
echo "- 查看Nginx日志: tail -f /var/log/nginx/dropshare_error.log"
echo "- 检查进程: ps aux | grep node"
echo ""
echo "🔧 如果仍有问题："
echo "- 重启服务: pkill -f node && cd /var/www/dropshare && nohup node start_debug.js > debug.log 2>&1 &"
echo "- 检查防火墙: ufw status"
echo "- 测试本地连接: node test_ws.js"

# 清理临时文件
rm -f test_ws.js