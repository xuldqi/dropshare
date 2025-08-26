#!/bin/bash

echo "=== 简单修复 WebSocket Transfer 问题 ==="
echo "时间: $(date)"

# 检查权限
if [[ $EUID -ne 0 ]]; then
    echo "此脚本需要root权限运行"
    echo "请使用: sudo $0"
    exit 1
fi

echo "1. 修复 Nginx WebSocket 代理..."

# 创建简单有效的nginx配置
cat > "/etc/nginx/conf.d/dropshare.conf" << 'EOF'
server {
    listen 80;
    server_name dropshare.tech www.dropshare.tech;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        
        # WebSocket 升级
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 长连接支持
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
EOF

# 重载 Nginx
nginx -t && systemctl reload nginx
echo "✓ Nginx 配置已更新"

echo "2. 重启 DropShare 服务..."

# 杀掉现有进程
pkill -f "node.*index.js" 2>/dev/null || true
pkill -f "node.*start_debug.js" 2>/dev/null || true
sleep 2

# 进入正确目录
cd /var/www/dropshare

# 后台启动服务
nohup node index.js > server.log 2>&1 &
echo "✓ DropShare 服务已重启"

echo "3. 创建测试页面（放在 public 目录）..."

# 创建简单的WebSocket测试页面（放在public目录）
cat > "/var/www/dropshare/public/ws-test.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket 连接测试</title>
    <meta charset="utf-8">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .status { 
            padding: 15px; 
            margin: 15px 0; 
            border-radius: 5px; 
            font-weight: bold;
        }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .info { background: #d1ecf1; color: #0c5460; }
        button { 
            padding: 12px 20px; 
            margin: 10px 5px; 
            background: #007bff; 
            color: white; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer;
            font-size: 16px;
        }
        button:hover { background: #0056b3; }
        #log { 
            background: #f8f9fa; 
            border: 1px solid #dee2e6; 
            padding: 15px; 
            height: 300px; 
            overflow-y: auto; 
            font-family: monospace;
            font-size: 14px;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 DropShare WebSocket 传输测试</h1>
        
        <div id="status" class="status info">准备测试 WebSocket 连接...</div>
        
        <button onclick="testWebSocket()">🔌 测试 WebSocket 连接</button>
        <button onclick="clearLog()">🗑️ 清空日志</button>
        
        <h3>实时日志：</h3>
        <div id="log"></div>
    </div>
    
    <script>
        let ws = null;
        
        function log(message, type = 'info') {
            const logDiv = document.getElementById('log');
            const time = new Date().toLocaleTimeString();
            const colors = {
                success: '#28a745',
                error: '#dc3545',
                info: '#17a2b8',
                warning: '#ffc107'
            };
            
            logDiv.innerHTML += `<span style="color: ${colors[type]}">[${time}] ${message}</span>\n`;
            logDiv.scrollTop = logDiv.scrollHeight;
        }
        
        function updateStatus(message, type) {
            const statusDiv = document.getElementById('status');
            statusDiv.className = `status ${type}`;
            statusDiv.textContent = message;
        }
        
        function testWebSocket() {
            log('🚀 开始 WebSocket 连接测试...', 'info');
            
            // 尝试不同的WebSocket URL
            const wsUrls = [
                `ws://${window.location.host}`,
                'ws://dropshare.tech',
                'ws://localhost:8080'
            ];
            
            let currentIndex = 0;
            
            function tryConnection(url) {
                log(`🔌 尝试连接: ${url}`, 'info');
                updateStatus(`正在连接 ${url}...`, 'info');
                
                if (ws) {
                    ws.close();
                }
                
                ws = new WebSocket(url);
                
                const timeout = setTimeout(() => {
                    log(`⏰ 连接超时: ${url}`, 'error');
                    ws.close();
                    tryNext();
                }, 5000);
                
                ws.onopen = function() {
                    clearTimeout(timeout);
                    log(`✅ WebSocket 连接成功！URL: ${url}`, 'success');
                    updateStatus('✅ WebSocket 连接成功！Transfer 服务正常', 'success');
                    
                    // 发送测试消息
                    const testMsg = JSON.stringify({
                        type: 'ping',
                        data: 'browser-test'
                    });
                    ws.send(testMsg);
                    log('📤 发送测试消息', 'info');
                };
                
                ws.onmessage = function(event) {
                    log(`📥 收到消息: ${event.data}`, 'success');
                };
                
                ws.onerror = function(error) {
                    clearTimeout(timeout);
                    log(`❌ WebSocket 错误: ${url}`, 'error');
                    tryNext();
                };
                
                ws.onclose = function(event) {
                    clearTimeout(timeout);
                    if (event.code === 1000) {
                        log(`🔌 连接正常关闭`, 'info');
                    } else {
                        log(`⚠️ 连接异常关闭 (代码: ${event.code})`, 'warning');
                        tryNext();
                    }
                };
            }
            
            function tryNext() {
                currentIndex++;
                if (currentIndex < wsUrls.length) {
                    setTimeout(() => tryConnection(wsUrls[currentIndex]), 1000);
                } else {
                    log('❌ 所有连接尝试失败', 'error');
                    updateStatus('❌ WebSocket 连接失败 - Transfer 服务异常', 'error');
                }
            }
            
            tryConnection(wsUrls[0]);
        }
        
        function clearLog() {
            document.getElementById('log').innerHTML = '';
        }
        
        // 页面加载后自动测试
        window.onload = function() {
            log('🌐 页面加载完成', 'info');
            log(`📍 当前地址: ${window.location.href}`, 'info');
            
            // 延迟2秒后自动测试
            setTimeout(() => {
                log('🔄 开始自动测试...', 'info');
                testWebSocket();
            }, 2000);
        };
    </script>
</body>
</html>
EOF

echo "✓ 测试页面已创建在 public 目录"

echo "4. 等待服务启动..."
sleep 5

echo "5. 验证服务状态..."

# 检查进程
if pgrep -f "node.*index.js" >/dev/null; then
    echo "✓ DropShare 进程正在运行"
else
    echo "✗ DropShare 进程未运行"
fi

# 检查端口
if netstat -tulpn | grep -q ":8080"; then
    echo "✓ 端口 8080 正在监听"
else
    echo "✗ 端口 8080 未监听"
fi

# 测试 HTTP 连接
if curl -s --connect-timeout 5 http://localhost:8080 >/dev/null; then
    echo "✓ HTTP 服务响应正常"
else
    echo "✗ HTTP 服务无响应"
fi

echo ""
echo "=== WebSocket Transfer 修复完成 ==="
echo ""
echo "🔍 测试方法："
echo "1. 访问: http://dropshare.tech/ws-test.html"
echo "2. 查看页面是否正常显示（不会跳转到首页）"
echo "3. 观察自动WebSocket连接测试结果"
echo "4. 如果显示'✅ WebSocket连接成功'，则Transfer服务已修复"
echo ""
echo "📊 监控命令："
echo "- 服务日志: tail -f /var/www/dropshare/server.log"  
echo "- Nginx日志: tail -f /var/log/nginx/error.log"
echo "- 重启服务: pkill -f node && cd /var/www/dropshare && nohup node index.js > server.log 2>&1 &"
echo ""
echo "✅ 如果测试成功，回到主页 http://dropshare.tech 应该不再显示 Connection lost 错误"