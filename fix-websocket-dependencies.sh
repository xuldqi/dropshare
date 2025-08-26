#!/bin/bash

echo "=== 修复 WebSocket 依赖 ==="
echo "时间: $(date)"

cd /var/www/dropshare || {
    echo "✗ 无法进入 /var/www/dropshare 目录"
    exit 1
}

echo "1. 检查当前依赖..."
echo "当前目录: $(pwd)"

if [[ -f "package.json" ]]; then
    echo "✓ package.json 存在"
    
    # 显示当前dependencies
    echo "当前依赖:"
    grep -A 10 '"dependencies"' package.json || echo "无dependencies"
else
    echo "✗ package.json 不存在，创建基本配置..."
    
    # 创建基本的package.json
    cat > package.json << 'EOF'
{
  "name": "dropshare",
  "private": true,
  "version": "1.0.0",
  "description": "Instantly share files with devices on the same network",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^5.1.0",
    "express-rate-limit": "^7.5.0",
    "unique-names-generator": "^4.7.1",
    "ws": "^8.18.2",
    "ua-parser-js": "^2.0.3"
  }
}
EOF
    echo "✓ 基本 package.json 已创建"
fi

echo ""
echo "2. 安装 WebSocket 依赖..."

# 确保安装ws模块
if ! grep -q '"ws"' package.json; then
    echo "添加ws依赖到package.json..."
    
    # 使用npm添加依赖
    npm install ws@^8.18.2 --save
else
    echo "ws依赖已存在，重新安装..."
    npm install
fi

echo ""
echo "3. 验证依赖安装..."

# 检查node_modules中是否有ws
if [[ -d "node_modules/ws" ]]; then
    echo "✓ ws 模块已安装"
    ls -la node_modules/ws/package.json | head -1
else
    echo "✗ ws 模块安装失败，尝试手动安装..."
    npm install ws --save
fi

echo ""
echo "4. 测试 WebSocket 模块..."

# 创建简单的WebSocket测试
cat > test_ws_module.js << 'EOF'
try {
    const WebSocket = require('ws');
    console.log('✅ WebSocket 模块加载成功');
    console.log('WebSocket版本:', require('ws/package.json').version);
    process.exit(0);
} catch (error) {
    console.log('❌ WebSocket 模块加载失败:', error.message);
    process.exit(1);
}
EOF

if node test_ws_module.js; then
    echo "✓ WebSocket 模块测试通过"
else
    echo "✗ WebSocket 模块测试失败"
fi

rm -f test_ws_module.js

echo ""
echo "5. 重启 DropShare 服务..."

# 停止现有服务
pkill -f "node.*index.js" 2>/dev/null || true
sleep 2

# 启动服务
nohup node index.js > server.log 2>&1 &
echo "✓ DropShare 服务已重启"

sleep 5

echo ""
echo "6. 重新测试 WebSocket 连接..."

# 创建WebSocket连接测试
cat > final_ws_test.js << 'EOF'
const WebSocket = require('ws');

console.log('🔌 测试 WebSocket 连接...');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', function() {
    console.log('✅ WebSocket 连接成功！');
    
    // 发送ping消息
    ws.send(JSON.stringify({
        type: 'ping',
        data: 'connection-test'
    }));
    
    setTimeout(() => {
        console.log('✅ WebSocket 测试完成');
        ws.close();
        process.exit(0);
    }, 2000);
});

ws.on('message', function(data) {
    console.log('📥 收到消息:', data.toString());
});

ws.on('error', function(error) {
    console.log('❌ WebSocket 连接错误:', error.message);
    process.exit(1);
});

ws.on('close', function(event) {
    console.log('🔌 WebSocket 连接已关闭 (代码:', event.code, ')');
});

// 超时处理
setTimeout(() => {
    console.log('⏰ WebSocket 连接超时');
    process.exit(1);
}, 8000);
EOF

echo "运行 WebSocket 连接测试:"
if node final_ws_test.js; then
    echo ""
    echo "🎉 WebSocket 连接测试成功！"
else
    echo ""
    echo "❌ WebSocket 连接测试失败"
    
    echo ""
    echo "检查服务日志："
    tail -10 server.log
fi

rm -f final_ws_test.js

echo ""
echo "7. 检查服务状态..."

# 检查进程
if pgrep -f "node.*index.js" >/dev/null; then
    echo "✅ DropShare 进程: 运行中 (PID: $(pgrep -f 'node.*index.js'))"
else
    echo "❌ DropShare 进程: 未运行"
fi

# 检查端口
if netstat -tulpn | grep -q ":8080"; then
    echo "✅ 端口 8080: 正在监听"
else
    echo "❌ 端口 8080: 未监听"
fi

# 检查HTTP连接
if curl -s --connect-timeout 3 http://localhost:8080 >/dev/null; then
    echo "✅ HTTP 服务: 正常"
else
    echo "❌ HTTP 服务: 异常"
fi

echo ""
echo "=== WebSocket 依赖修复完成 ==="
echo ""
echo "✅ 修复结果："
echo "- WebSocket (ws) 模块已安装"
echo "- DropShare 服务已重启"
echo "- WebSocket 连接已测试"
echo ""
echo "🌐 现在请测试："
echo "1. 打开无痕浏览器窗口"
echo "2. 访问: http://dropshare.tech"
echo "3. 打开F12控制台，查看是否有 'WS: server connected' 消息"
echo "4. 检查是否还有 'Connection lost' 错误"
echo ""
echo "📊 如果仍有问题，可能需要："
echo "- 清理浏览器缓存: Ctrl+Shift+R"
echo "- 查看服务日志: tail -f server.log"
echo "- 检查 Nginx 配置: nginx -t"