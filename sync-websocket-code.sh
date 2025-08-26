#!/bin/bash

echo "=== 同步本地WebSocket代码到服务器 ==="
echo "时间: $(date)"

# 检查权限
if [[ $EUID -ne 0 ]]; then
    echo "此脚本需要root权限运行"
    echo "请使用: sudo $0"
    exit 1
fi

echo "1. 备份服务器现有文件..."

# 创建备份目录
backup_dir="/var/www/dropshare/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"

# 备份关键文件
key_files=(
    "public/scripts/network.js"
    "public/scripts/ui.js"
    "public/index.html"
)

for file in "${key_files[@]}"; do
    if [[ -f "/var/www/dropshare/$file" ]]; then
        cp "/var/www/dropshare/$file" "$backup_dir/"
        echo "✓ 已备份: $file"
    fi
done

echo "备份完成，位置: $backup_dir"

echo ""
echo "2. 检查本地正确的WebSocket代码..."

# 检查本地的network.js是否存在
if [[ ! -f "public/scripts/network.js" ]]; then
    echo "✗ 本地network.js文件不存在"
    exit 1
fi

# 显示本地WebSocket endpoint配置
echo "本地WebSocket配置:"
grep -A 5 "_endpoint()" "public/scripts/network.js" || echo "未找到_endpoint函数"

echo ""
echo "3. 更新服务器WebSocket代码..."

# 复制network.js到服务器
cp "public/scripts/network.js" "/var/www/dropshare/public/scripts/"
echo "✓ network.js 已更新"

# 复制ui.js（如果存在）
if [[ -f "public/scripts/ui.js" ]]; then
    cp "public/scripts/ui.js" "/var/www/dropshare/public/scripts/"
    echo "✓ ui.js 已更新"
fi

# 检查并更新其他必要的脚本文件
other_scripts=(
    "public/scripts/theme.js"
    "public/scripts/clipboard.js"
    "public/scripts/firebase-analytics.js"
)

for script in "${other_scripts[@]}"; do
    if [[ -f "$script" ]]; then
        cp "$script" "/var/www/dropshare/$script"
        echo "✓ $(basename $script) 已更新"
    fi
done

echo ""
echo "4. 验证WebSocket配置..."

# 检查更新后的_endpoint函数
echo "服务器WebSocket配置:"
grep -A 5 "_endpoint()" "/var/www/dropshare/public/scripts/network.js"

echo ""
echo "5. 清理浏览器缓存文件..."

# 确保没有缓存问题
echo "添加缓存清理头部..."
timestamp=$(date +%s)

# 在主页添加缓存清理参数
if [[ -f "/var/www/dropshare/public/index.html" ]]; then
    # 添加版本参数到script标签
    sed -i "s|scripts/network.js|scripts/network.js?v=$timestamp|g" "/var/www/dropshare/public/index.html"
    sed -i "s|scripts/ui.js|scripts/ui.js?v=$timestamp|g" "/var/www/dropshare/public/index.html"
    echo "✓ 已添加缓存清理参数"
fi

echo ""
echo "6. 重启DropShare服务..."

# 重启服务确保配置生效
pkill -f "node.*index.js"
sleep 3

cd /var/www/dropshare
nohup node index.js > server.log 2>&1 &

echo "✓ DropShare服务已重启"

echo ""
echo "7. 测试WebSocket连接..."

sleep 5

# 创建WebSocket测试
cat > /tmp/test_updated_ws.js << 'EOF'
const WebSocket = require('ws');

console.log('测试更新后的WebSocket连接...');

// 测试WebSocket服务器
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', function() {
    console.log('✅ WebSocket连接成功');
    
    // 发送测试消息
    ws.send(JSON.stringify({
        type: 'ping',
        data: 'test-connection'
    }));
    
    setTimeout(() => {
        ws.close();
        process.exit(0);
    }, 2000);
});

ws.on('message', function(data) {
    console.log('📥 收到消息:', data.toString());
});

ws.on('error', function(error) {
    console.log('❌ WebSocket连接失败:', error.message);
    process.exit(1);
});

ws.on('close', function() {
    console.log('🔌 连接已关闭');
});

// 超时处理
setTimeout(() => {
    console.log('⏰ 连接超时');
    process.exit(1);
}, 5000);
EOF

# 运行测试
if node /tmp/test_updated_ws.js; then
    echo "✅ WebSocket服务器测试通过"
else
    echo "❌ WebSocket服务器测试失败"
fi

rm -f /tmp/test_updated_ws.js

echo ""
echo "8. 验证HTTP服务..."

# 测试HTTP访问
if curl -s --connect-timeout 5 http://localhost:8080 >/dev/null; then
    echo "✅ HTTP服务正常"
else
    echo "❌ HTTP服务异常"
fi

echo ""
echo "=== WebSocket代码同步完成 ==="
echo ""
echo "✅ 已完成的操作："
echo "- 备份了原有文件到: $backup_dir"
echo "- 更新了WebSocket相关脚本文件"
echo "- 添加了缓存清理参数"
echo "- 重启了DropShare服务"
echo ""
echo "🌐 现在请测试："
echo "1. 打开浏览器无痕模式"
echo "2. 访问: http://dropshare.tech"
echo "3. 按F12查看控制台，应该看到 'WS: server connected'"
echo "4. 如果仍有问题，请强制刷新 (Ctrl+Shift+R)"
echo ""
echo "📊 服务状态:"
echo "- DropShare: $(pgrep -f 'node.*index.js' >/dev/null && echo '✅ 运行中' || echo '❌ 异常')"
echo "- WebSocket: $(netstat -tulpn 2>/dev/null | grep -q ':8080' && echo '✅ 监听中' || echo '❌ 异常')"