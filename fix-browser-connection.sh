#!/bin/bash

echo "=== 修复浏览器连接问题 ==="
echo "时间: $(date)"

# 检查权限
if [[ $EUID -ne 0 ]]; then
    echo "此脚本需要root权限运行"
    echo "请使用: sudo $0"
    exit 1
fi

echo "1. 清理浏览器缓存问题..."

# 在public目录创建缓存清理页面
cat > "/var/www/dropshare/public/clear-cache.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>清理缓存并重新连接</title>
    <meta charset="utf-8">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
        }
        .button {
            display: inline-block;
            padding: 15px 30px;
            margin: 10px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            border: none;
            cursor: pointer;
            font-size: 16px;
        }
        .button:hover { background: #0056b3; }
        .status { padding: 15px; margin: 15px 0; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .info { background: #d1ecf1; color: #0c5460; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔄 DropShare 连接修复</h1>
        <p>如果你遇到连接错误，请按以下步骤操作：</p>
        
        <div id="status" class="status info">准备清理缓存...</div>
        
        <button class="button" onclick="clearCacheAndReload()">🗑️ 清理缓存并刷新</button>
        <button class="button" onclick="forceReconnect()">🔌 强制重新连接</button>
        <a href="/" class="button">🏠 返回主页</a>
        
        <h3>手动清理步骤：</h3>
        <ol style="text-align: left;">
            <li>按 <strong>Ctrl+Shift+R</strong> (或 Cmd+Shift+R) 强制刷新</li>
            <li>按 <strong>F12</strong> 打开开发者工具</li>
            <li>右键点击刷新按钮，选择 "清空缓存并硬性重新加载"</li>
            <li>或者在设置中清理浏览器数据</li>
        </ol>
        
        <div id="connection-test" style="margin-top: 20px;"></div>
    </div>
    
    <script>
        function updateStatus(message, type) {
            document.getElementById('status').className = `status ${type}`;
            document.getElementById('status').textContent = message;
        }
        
        function clearCacheAndReload() {
            updateStatus('正在清理缓存...', 'info');
            
            // 清理localStorage
            try {
                localStorage.clear();
                updateStatus('localStorage已清理', 'success');
            } catch(e) {
                console.log('localStorage清理失败:', e);
            }
            
            // 清理sessionStorage
            try {
                sessionStorage.clear();
                updateStatus('sessionStorage已清理', 'success');
            } catch(e) {
                console.log('sessionStorage清理失败:', e);
            }
            
            // 强制刷新页面
            setTimeout(() => {
                updateStatus('正在刷新页面...', 'info');
                window.location.href = '/?t=' + Date.now();
            }, 1000);
        }
        
        function forceReconnect() {
            updateStatus('测试WebSocket连接...', 'info');
            
            const wsUrl = `ws://${window.location.host}`;
            const ws = new WebSocket(wsUrl);
            
            ws.onopen = function() {
                updateStatus('✅ WebSocket连接成功！可以返回主页了', 'success');
                ws.close();
            };
            
            ws.onerror = function(error) {
                updateStatus('❌ WebSocket连接失败，请联系管理员', 'error');
            };
            
            ws.onclose = function(event) {
                if (event.code === 1000) {
                    updateStatus('✅ 连接测试完成', 'success');
                }
            };
        }
        
        // 页面加载时自动测试连接
        window.onload = function() {
            setTimeout(() => {
                updateStatus('正在自动测试连接...', 'info');
                forceReconnect();
            }, 1000);
        };
    </script>
</body>
</html>
EOF

echo "✓ 缓存清理页面已创建"

echo "2. 检查WebSocket连接配置..."

# 检查前端JavaScript中的WebSocket连接
if [[ -f "/var/www/dropshare/public/scripts/network.js" ]]; then
    echo "检查network.js配置..."
    
    # 备份原文件
    cp "/var/www/dropshare/public/scripts/network.js" "/var/www/dropshare/public/scripts/network.js.backup"
    
    # 检查WebSocket连接配置是否正确
    if grep -q "localhost" "/var/www/dropshare/public/scripts/network.js"; then
        echo "发现localhost配置，可能导致连接问题"
        
        # 修复WebSocket连接地址
        sed -i 's/localhost:8080/window.location.host/g' "/var/www/dropshare/public/scripts/network.js"
        sed -i 's/127.0.0.1:8080/window.location.host/g' "/var/www/dropshare/public/scripts/network.js"
        
        echo "✓ WebSocket连接地址已修复"
    fi
fi

echo "3. 重新生成前端配置..."

# 创建一个WebSocket连接修复脚本
cat > "/var/www/dropshare/public/fix-ws.js" << 'EOF'
// WebSocket连接修复脚本
(function() {
    console.log('🔧 DropShare WebSocket修复脚本加载');
    
    // 覆盖原有的WebSocket连接
    if (window.WebSocket) {
        const OriginalWebSocket = window.WebSocket;
        
        window.WebSocket = function(url, protocols) {
            // 自动修复WebSocket地址
            let fixedUrl = url;
            
            if (url.includes('localhost') || url.includes('127.0.0.1')) {
                fixedUrl = `ws://${window.location.host}`;
                console.log('🔧 WebSocket地址已修复:', url, '->', fixedUrl);
            }
            
            const ws = new OriginalWebSocket(fixedUrl, protocols);
            
            ws.addEventListener('open', function() {
                console.log('✅ WebSocket连接成功:', fixedUrl);
            });
            
            ws.addEventListener('error', function(error) {
                console.error('❌ WebSocket连接失败:', error);
                console.log('尝试的地址:', fixedUrl);
                console.log('建议: 清理浏览器缓存或访问 /clear-cache.html');
            });
            
            return ws;
        };
        
        console.log('✅ WebSocket修复脚本已激活');
    }
})();
EOF

echo "✓ WebSocket修复脚本已创建"

echo "4. 添加调试信息到主页..."

# 在主页添加调试信息
if [[ -f "/var/www/dropshare/public/index.html" ]]; then
    # 在</head>之前添加修复脚本
    if ! grep -q "fix-ws.js" "/var/www/dropshare/public/index.html"; then
        sed -i 's|</head>|    <script src="fix-ws.js"></script>\n</head>|' "/var/www/dropshare/public/index.html"
        echo "✓ 修复脚本已添加到主页"
    fi
fi

echo "5. 重启服务确保配置生效..."

# 重启DropShare服务
pkill -f "node.*index.js"
sleep 2

cd /var/www/dropshare
nohup node index.js > server.log 2>&1 &

echo "✓ DropShare服务已重启"

# 重新加载Nginx
nginx -s reload 2>/dev/null || systemctl reload nginx

echo "✓ Nginx配置已重新加载"

echo "6. 最终测试..."

sleep 5

# 测试连接
if curl -s --connect-timeout 5 http://localhost:8080 >/dev/null; then
    echo "✅ HTTP连接正常"
else
    echo "❌ HTTP连接异常"
fi

# 测试WebSocket
echo "测试WebSocket..."
cat > /tmp/final_ws_test.js << 'EOF'
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8080');
ws.on('open', () => { console.log('✅ WebSocket OK'); process.exit(0); });
ws.on('error', () => { console.log('❌ WebSocket Failed'); process.exit(1); });
setTimeout(() => process.exit(1), 3000);
EOF

if timeout 5 node /tmp/final_ws_test.js 2>/dev/null; then
    echo "✅ WebSocket连接正常"
else
    echo "❌ WebSocket连接异常"
fi

rm -f /tmp/final_ws_test.js

echo ""
echo "=== 浏览器连接修复完成 ==="
echo ""
echo "🌐 请尝试以下步骤："
echo "1. 访问 http://dropshare.tech/clear-cache.html 清理缓存"
echo "2. 按照页面指示清理浏览器缓存"
echo "3. 返回主页 http://dropshare.tech 测试"
echo ""
echo "🔧 如果仍有问题："
echo "- 按 Ctrl+Shift+R 强制刷新"
echo "- 按 F12 查看浏览器控制台错误"
echo "- 尝试无痕模式浏览"
echo ""
echo "📊 服务状态:"
echo "- DropShare: $(pgrep -f 'node.*index.js' >/dev/null && echo '运行中' || echo '异常')"
echo "- Nginx: $(systemctl is-active --quiet nginx && echo '运行中' || echo '异常')"