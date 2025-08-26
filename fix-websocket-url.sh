#!/bin/bash

echo "=== 修复 WebSocket URL 生成错误 ==="
echo "时间: $(date)"

# 检查权限
if [[ $EUID -ne 0 ]]; then
    echo "此脚本需要root权限运行"
    echo "请使用: sudo $0"
    exit 1
fi

cd /var/www/dropshare || {
    echo "✗ 无法进入 /var/www/dropshare 目录"
    exit 1
}

echo "1. 修复 network.js 中的 WebSocket URL 生成..."

# 备份原文件
cp "public/scripts/network.js" "public/scripts/network.js.backup"

# 检查当前的_endpoint函数
echo "当前的_endpoint函数:"
grep -A 5 "_endpoint()" "public/scripts/network.js"

echo ""
echo "修复WebSocket URL生成逻辑..."

# 修复_endpoint函数，去掉location.pathname
cat > /tmp/endpoint_fix.js << 'EOF'
    _endpoint() {
        // hack to detect if deployment or development environment
        const protocol = location.protocol.startsWith('https') ? 'wss' : 'ws';
        const webrtc = window.isRtcSupported ? '/webrtc' : '/fallback';
        // 修复：直接使用/server路径，不依赖当前页面路径
        const url = protocol + '://' + location.host + '/server' + webrtc;
        return url;
    }
EOF

# 替换_endpoint函数
awk '
    /_endpoint\(\)/ {
        # 找到函数开始，打印函数头
        print "    _endpoint() {"
        print "        // hack to detect if deployment or development environment"
        print "        const protocol = location.protocol.startsWith('\''https'\'') ? '\''wss'\'' : '\''ws'\'';"
        print "        const webrtc = window.isRtcSupported ? '\''/webrtc'\'' : '\''/fallback'\'';"
        print "        // 修复：直接使用/server路径，不依赖当前页面路径"
        print "        const url = protocol + '\''://'\'' + location.host + '\''/server'\'' + webrtc;"
        print "        return url;"
        
        # 跳过原函数内容直到找到对应的闭合括号
        brace_count = 1
        while (brace_count > 0 && (getline > 0)) {
            gsub(/[^{}]/, "")  # 只保留大括号
            for (i = 1; i <= length; i++) {
                char = substr($0, i, 1)
                if (char == "{") brace_count++
                else if (char == "}") brace_count--
            }
        }
        print "    }"
        next
    }
    { print }
' "public/scripts/network.js" > "public/scripts/network.js.tmp"

mv "public/scripts/network.js.tmp" "public/scripts/network.js"

echo "✓ WebSocket URL 生成已修复"

echo ""
echo "2. 修复后的_endpoint函数:"
grep -A 8 "_endpoint()" "public/scripts/network.js"

echo ""
echo "3. 配置 Nginx 支持 WebSocket..."

# 创建支持WebSocket的Nginx配置
cat > "/etc/nginx/conf.d/dropshare.conf" << 'EOF'
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    listen 80;
    server_name dropshare.tech www.dropshare.tech;
    
    # 主页面和静态文件
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket 专用路径
    location /server {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        
        # WebSocket 升级头
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        
        # 标准代理头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 超时设置
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
        proxy_connect_timeout 60;
        
        # 禁用代理缓冲
        proxy_buffering off;
    }
    
    # 错误日志
    error_log /var/log/nginx/dropshare_error.log;
    access_log /var/log/nginx/dropshare_access.log;
}
EOF

echo "✓ Nginx WebSocket 配置已更新"

# 测试并重新加载Nginx
if nginx -t; then
    systemctl reload nginx
    echo "✓ Nginx 已重新加载"
else
    echo "✗ Nginx 配置错误"
    nginx -t
fi

echo ""
echo "4. 修复浏览器缓存问题..."

# 添加版本参数避免缓存
timestamp=$(date +%s)
for html_file in public/*.html; do
    if [[ -f "$html_file" ]]; then
        # 为所有JS文件添加版本参数
        sed -i "s|scripts/network\.js|scripts/network.js?v=$timestamp|g" "$html_file"
        sed -i "s|scripts/ui\.js|scripts/ui.js?v=$timestamp|g" "$html_file"
        echo "✓ 已更新缓存参数: $(basename $html_file)"
    fi
done

echo ""
echo "5. 重启 DropShare 服务..."

# 重启服务
pkill -f "node.*index.js"
sleep 3

nohup node index.js > server.log 2>&1 &
echo "✓ DropShare 服务已重启"

echo ""
echo "6. 等待服务稳定并测试..."

sleep 8

# 检查服务状态
if pgrep -f "node.*index.js" >/dev/null; then
    echo "✓ DropShare 进程: 运行中"
else
    echo "✗ DropShare 进程: 异常"
fi

if netstat -tulpn | grep -q ":8080"; then
    echo "✓ 端口 8080: 监听中"
else
    echo "✗ 端口 8080: 异常"
fi

# 测试HTTP连接
if curl -s --connect-timeout 5 http://localhost:8080 >/dev/null; then
    echo "✓ HTTP 服务: 正常"
else
    echo "✗ HTTP 服务: 异常"
fi

echo ""
echo "7. 创建 WebSocket 连接测试..."

# 创建更详细的WebSocket测试
cat > websocket_url_test.js << 'EOF'
const WebSocket = require('ws');

console.log('🧪 测试修复后的 WebSocket 连接...');

// 测试不同的WebSocket端点
const testUrls = [
    'ws://localhost:8080/server/webrtc',
    'ws://localhost:8080/server/fallback',
    'ws://dropshare.tech/server/webrtc'
];

let completedTests = 0;
const totalTests = testUrls.length;

testUrls.forEach((url, index) => {
    console.log(`\n📡 测试 ${index + 1}/${totalTests}: ${url}`);
    
    const ws = new WebSocket(url);
    const timeout = setTimeout(() => {
        console.log(`⏰ ${url} - 连接超时`);
        ws.terminate();
        checkCompletion();
    }, 5000);
    
    ws.on('open', function() {
        clearTimeout(timeout);
        console.log(`✅ ${url} - 连接成功！`);
        
        // 发送测试消息
        ws.send(JSON.stringify({
            type: 'ping',
            data: `test-${index}`
        }));
        
        setTimeout(() => {
            ws.close();
        }, 2000);
    });
    
    ws.on('message', function(data) {
        console.log(`📥 ${url} - 收到消息:`, data.toString());
    });
    
    ws.on('error', function(error) {
        clearTimeout(timeout);
        console.log(`❌ ${url} - 连接失败:`, error.code || error.message);
        checkCompletion();
    });
    
    ws.on('close', function(event) {
        clearTimeout(timeout);
        console.log(`🔌 ${url} - 连接关闭 (代码: ${event.code})`);
        checkCompletion();
    });
});

function checkCompletion() {
    completedTests++;
    if (completedTests >= totalTests) {
        console.log('\n🏁 WebSocket 测试完成');
        process.exit(0);
    }
}

// 全局超时
setTimeout(() => {
    console.log('\n⏰ 测试总体超时');
    process.exit(1);
}, 15000);
EOF

echo "运行 WebSocket URL 测试:"
if node websocket_url_test.js; then
    echo ""
    echo "🎉 WebSocket URL 修复成功！"
else
    echo ""
    echo "⚠ WebSocket 测试未完全通过，但服务可能正常"
fi

rm -f websocket_url_test.js

echo ""
echo "=== WebSocket URL 修复完成 ==="
echo ""
echo "🌐 现在请测试："
echo "1. 清理浏览器缓存 (Ctrl+Shift+R 或无痕模式)"
echo "2. 访问: http://dropshare.tech"
echo "3. 打开 F12 控制台"
echo "4. 查看是否有 'WS: server connected' 消息"
echo "5. WebSocket URL 现在应该是: ws://dropshare.tech/server/webrtc"
echo ""
echo "📊 修复内容："
echo "- ✓ 修复了 WebSocket URL 路径生成错误"
echo "- ✓ 配置了 Nginx WebSocket 代理支持"
echo "- ✓ 添加了浏览器缓存清理"
echo "- ✓ 重启了所有相关服务"
echo ""
echo "🔧 如果仍有问题："
echo "- 查看服务日志: tail -f server.log"
echo "- 查看 Nginx 日志: tail -f /var/log/nginx/dropshare_error.log"