#!/bin/bash

echo "=== 部署最小化工作版本 ==="
echo "时间: $(date)"

# 检查权限
if [[ $EUID -ne 0 ]]; then
    echo "此脚本需要root权限运行"
    echo "请使用: sudo $0"
    exit 1
fi

echo "1. 停止所有相关服务..."
pkill -f "node.*index.js" 2>/dev/null || true
sleep 3

echo "2. 创建全新的最小化版本..."

# 备份当前版本
if [[ -d "/var/www/dropshare" ]]; then
    mv "/var/www/dropshare" "/var/www/dropshare_broken_$(date +%s)"
fi

# 创建新目录
mkdir -p "/var/www/dropshare/public/scripts"

cd /var/www/dropshare

echo "3. 创建基本的 package.json..."

cat > package.json << 'EOF'
{
  "name": "dropshare",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^5.1.0",
    "ws": "^8.18.2"
  }
}
EOF

echo "4. 创建最简单的工作 index.js..."

cat > index.js << 'EOF'
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 静态文件
app.use(express.static('public'));

// WebSocket处理
wss.on('connection', (ws) => {
    console.log('✅ WebSocket 客户端连接');
    
    ws.on('message', (message) => {
        console.log('📥 收到消息:', message.toString());
        
        // 广播消息给所有客户端
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
    
    ws.on('close', () => {
        console.log('🔌 WebSocket 客户端断开');
    });
    
    // 发送欢迎消息
    ws.send(JSON.stringify({
        type: 'connected',
        message: 'Welcome to DropShare'
    }));
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`✅ DropShare 服务运行在端口 ${PORT}`);
});
EOF

echo "5. 创建最基本的前端页面..."

cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>DropShare - Simple</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .status { padding: 15px; margin: 15px 0; border-radius: 5px; }
        .connected { background: #d4edda; color: #155724; }
        .disconnected { background: #f8d7da; color: #721c24; }
        .message { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 3px; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>DropShare - 简单版本</h1>
    
    <div id="status" class="status disconnected">未连接</div>
    
    <button onclick="connect()">连接</button>
    <button onclick="disconnect()">断开</button>
    <button onclick="sendTest()">发送测试消息</button>
    
    <h3>消息日志:</h3>
    <div id="messages"></div>
    
    <script>
        let ws = null;
        
        function updateStatus(text, connected) {
            const status = document.getElementById('status');
            status.textContent = text;
            status.className = `status ${connected ? 'connected' : 'disconnected'}`;
        }
        
        function addMessage(text) {
            const messages = document.getElementById('messages');
            const div = document.createElement('div');
            div.className = 'message';
            div.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
        }
        
        function connect() {
            if (ws && ws.readyState === WebSocket.OPEN) {
                addMessage('已经连接');
                return;
            }
            
            const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${location.host}`;
            
            addMessage(`尝试连接: ${wsUrl}`);
            
            ws = new WebSocket(wsUrl);
            
            ws.onopen = function() {
                updateStatus('✅ 已连接', true);
                addMessage('WebSocket 连接成功');
            };
            
            ws.onmessage = function(event) {
                try {
                    const data = JSON.parse(event.data);
                    addMessage(`收到: ${data.type} - ${data.message || 'no message'}`);
                } catch (e) {
                    addMessage(`收到原始消息: ${event.data}`);
                }
            };
            
            ws.onclose = function() {
                updateStatus('❌ 连接断开', false);
                addMessage('WebSocket 连接关闭');
            };
            
            ws.onerror = function(error) {
                updateStatus('❌ 连接错误', false);
                addMessage(`连接错误: ${error.message || 'Unknown error'}`);
            };
        }
        
        function disconnect() {
            if (ws) {
                ws.close();
            }
        }
        
        function sendTest() {
            if (ws && ws.readyState === WebSocket.OPEN) {
                const message = {
                    type: 'test',
                    message: 'Hello from browser',
                    timestamp: Date.now()
                };
                ws.send(JSON.stringify(message));
                addMessage(`发送: ${JSON.stringify(message)}`);
            } else {
                addMessage('未连接，无法发送消息');
            }
        }
        
        // 页面加载时自动连接
        window.onload = function() {
            addMessage('页面加载完成');
            setTimeout(connect, 1000);
        };
    </script>
</body>
</html>
EOF

echo "6. 安装依赖..."
npm install

echo "7. 启动服务..."
nohup node index.js > server.log 2>&1 &

sleep 3

echo "8. 测试服务..."

if pgrep -f "node.*index.js" >/dev/null; then
    echo "✅ 服务运行中"
else
    echo "❌ 服务启动失败"
    tail -5 server.log
    exit 1
fi

if curl -s --connect-timeout 5 http://localhost:8080 >/dev/null; then
    echo "✅ HTTP服务正常"
else
    echo "❌ HTTP服务异常"
fi

echo "9. 测试WebSocket..."

cat > test_minimal.js << 'EOF'
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    console.log('✅ WebSocket连接成功');
    ws.send(JSON.stringify({ type: 'test', message: 'Server test' }));
    setTimeout(() => process.exit(0), 2000);
});

ws.on('message', (data) => {
    console.log('📥 收到消息:', data.toString());
});

ws.on('error', (error) => {
    console.log('❌ WebSocket错误:', error.message);
    process.exit(1);
});

setTimeout(() => {
    console.log('⏰ 测试超时');
    process.exit(1);
}, 5000);
EOF

if node test_minimal.js; then
    echo "✅ WebSocket测试通过"
else
    echo "❌ WebSocket测试失败"
fi

rm -f test_minimal.js

echo ""
echo "=== 最小化版本部署完成 ==="
echo ""
echo "🌐 现在测试："
echo "1. 访问: http://dropshare.tech"
echo "2. 应该看到简单的连接界面"
echo "3. 点击'连接'按钮测试WebSocket"
echo "4. 应该显示'已连接'状态"
echo ""
echo "🔍 如果这个版本工作正常，说明基础连接没问题"
echo "🔍 如果这个版本也不行，说明是服务器网络/端口问题"