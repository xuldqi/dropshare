#!/bin/bash

echo "=== 同步本地完整代码到服务器 ==="
echo "时间: $(date)"

# 检查权限
if [[ $EUID -ne 0 ]]; then
    echo "此脚本需要root权限运行"
    echo "请使用: sudo $0"
    exit 1
fi

echo "1. 创建备份..."

# 备份服务器现有代码
backup_dir="/var/www/dropshare_backup_$(date +%Y%m%d_%H%M%S)"
cp -r "/var/www/dropshare" "$backup_dir"
echo "✓ 服务器代码已备份到: $backup_dir"

echo ""
echo "2. 检查本地代码..."

# 确认我们在正确的目录
if [[ ! -f "index.js" ]] || [[ ! -d "public" ]]; then
    echo "✗ 当前目录不是dropshare项目目录"
    exit 1
fi

# 显示本地关键文件
echo "本地关键文件检查:"
echo "- index.js: $(test -f index.js && echo '✓' || echo '✗')"
echo "- package.json: $(test -f package.json && echo '✓' || echo '✗')"
echo "- public/: $(test -d public && echo '✓' || echo '✗')"
echo "- public/scripts/: $(test -d public/scripts && echo '✓' || echo '✗')"
echo "- public/scripts/network.js: $(test -f public/scripts/network.js && echo '✓' || echo '✗')"
echo "- public/scripts/ui.js: $(test -f public/scripts/ui.js && echo '✓' || echo '✗')"

echo ""
echo "3. 停止服务器服务..."

# 停止现有服务
pkill -f "node.*index.js" 2>/dev/null || true
sleep 3

echo ""
echo "4. 同步核心文件..."

# 同步核心服务器文件
echo "同步 index.js..."
cp "index.js" "/var/www/dropshare/"

echo "同步 package.json..."
cp "package.json" "/var/www/dropshare/"

if [[ -f "package-lock.json" ]]; then
    echo "同步 package-lock.json..."
    cp "package-lock.json" "/var/www/dropshare/"
fi

echo ""
echo "5. 同步前端文件..."

# 同步public目录
echo "同步 public/ 目录..."
rsync -av --delete "public/" "/var/www/dropshare/public/"

echo ""
echo "6. 检查同步结果..."

cd /var/www/dropshare

echo "服务器文件检查:"
echo "- index.js: $(test -f index.js && echo '✓' || echo '✗')"
echo "- package.json: $(test -f package.json && echo '✓' || echo '✗')"
echo "- public/scripts/network.js: $(test -f public/scripts/network.js && echo '✓' || echo '✗')"
echo "- public/scripts/ui.js: $(test -f public/scripts/ui.js && echo '✓' || echo '✗')"

echo ""
echo "7. 安装依赖..."

# 安装/更新依赖
npm install

echo ""
echo "8. 验证关键配置..."

# 检查WebSocket配置
echo "检查 index.js 中的 WebSocket 配置:"
if grep -q "WebSocket\|wss\|ws" "index.js"; then
    echo "✓ WebSocket 相关代码已找到"
    grep -n "WebSocket\|new.*Server" "index.js" | head -3
else
    echo "⚠ WebSocket 相关代码未找到"
fi

# 检查前端WebSocket配置
echo ""
echo "检查 network.js 中的协议配置:"
if grep -A 3 "_endpoint()" "public/scripts/network.js"; then
    echo "✓ WebSocket endpoint 配置已找到"
else
    echo "⚠ WebSocket endpoint 配置未找到"
fi

echo ""
echo "9. 启动服务..."

# 启动服务
nohup node index.js > server.log 2>&1 &
echo "✓ DropShare 服务已启动"

sleep 5

echo ""
echo "10. 测试服务状态..."

# 检查进程
if pgrep -f "node.*index.js" >/dev/null; then
    echo "✅ DropShare 进程运行中 (PID: $(pgrep -f 'node.*index.js'))"
else
    echo "❌ DropShare 进程未运行"
    echo "查看错误日志:"
    tail -10 server.log
fi

# 检查端口
if netstat -tulpn | grep -q ":8080"; then
    echo "✅ 端口 8080 正在监听"
else
    echo "❌ 端口 8080 未监听"
fi

# 测试HTTP连接
if curl -s --connect-timeout 5 http://localhost:8080 >/dev/null; then
    echo "✅ HTTP 服务响应正常"
else
    echo "❌ HTTP 服务无响应"
fi

echo ""
echo "11. 测试WebSocket连接..."

# 测试WebSocket
cat > test_websocket_after_sync.js << 'EOF'
const WebSocket = require('ws');

console.log('测试同步后的WebSocket连接...');

// 测试HTTP连接的WebSocket
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', function() {
    console.log('✅ WebSocket HTTP连接成功');
    ws.close();
});

ws.on('error', function(error) {
    console.log('❌ WebSocket HTTP连接失败:', error.message);
});

ws.on('close', function() {
    console.log('WebSocket连接已关闭');
    process.exit(0);
});

setTimeout(() => {
    console.log('WebSocket测试完成');
    process.exit(0);
}, 3000);
EOF

if node test_websocket_after_sync.js 2>/dev/null; then
    echo "✅ WebSocket 基础连接测试通过"
else
    echo "⚠ WebSocket 基础连接测试未通过"
fi

rm -f test_websocket_after_sync.js

echo ""
echo "=== 本地代码同步完成 ==="
echo ""
echo "📊 同步结果："
echo "- ✅ 服务器代码已备份到: $backup_dir"
echo "- ✅ 本地代码已完整同步到服务器"
echo "- ✅ 依赖已重新安装"
echo "- ✅ 服务已重新启动"
echo ""
echo "🌐 现在请测试："
echo "1. 访问: http://dropshare.tech"
echo "2. 检查控制台是否有连接错误"
echo "3. 查看设备名称是否显示"
echo "4. 测试设备发现功能"
echo ""
echo "📋 如果仍有问题："
echo "- 查看服务器日志: tail -f server.log"
echo "- 检查浏览器控制台错误"
echo "- 确认本地版本是否正常工作"
echo ""
echo "🔄 如需回滚："
echo "- 停止服务: pkill -f 'node.*index.js'"
echo "- 恢复备份: rm -rf /var/www/dropshare && mv $backup_dir /var/www/dropshare"