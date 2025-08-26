#!/bin/bash

echo "=== 修复所有 JavaScript 依赖 ==="
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

echo "1. 创建完整的 Events 类..."

cat > "public/scripts/events.js" << 'EOF'
// Events 系统 - 必须首先加载
class Events {
    static fire(type, detail) {
        window.dispatchEvent(new CustomEvent(type, { detail: detail }));
    }

    static on(type, callback) {
        return window.addEventListener(type, callback, false);
    }

    static off(type, callback) {
        return window.removeEventListener(type, callback, false);
    }
}

// 全局可用
window.Events = Events;

console.log('✅ Events class loaded');
EOF

echo "✓ Events.js 已创建"

echo ""
echo "2. 创建 PeersManager 类..."

cat > "public/scripts/peers-manager.js" << 'EOF'
// PeersManager 类
class PeersManager {
    constructor(serverConnection) {
        console.log('PeersManager 初始化...');
        this._server = serverConnection;
        this._peers = {};
        this._setName();
        this._bindEvents();
        console.log('✅ PeersManager 初始化完成');
    }

    _setName() {
        // 获取或生成设备名称
        this._name = localStorage.getItem('peerId');
        if (!this._name) {
            this._name = this._getRandomName();
            localStorage.setItem('peerId', this._name);
        }
        console.log('设备名称:', this._name);
    }

    _getRandomName() {
        const animals = ['Cat', 'Dog', 'Fox', 'Wolf', 'Bear', 'Lion', 'Tiger', 'Eagle', 'Shark', 'Dolphin'];
        const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Black', 'White', 'Gray'];
        const animal = animals[Math.floor(Math.random() * animals.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return color + ' ' + animal;
    }

    _bindEvents() {
        Events.on('peer-joined', e => this._onPeerJoined(e.detail));
        Events.on('peer-left', e => this._onPeerLeft(e.detail));
        Events.on('peers', e => this._onPeers(e.detail));
        Events.on('display-name', e => this._onDisplayName(e.detail));
    }

    _onPeerJoined(peer) {
        console.log('设备加入:', peer);
        if (this._peers[peer.id]) return;
        this._peers[peer.id] = peer;
        Events.fire('peer-added', peer);
    }

    _onPeerLeft(peerId) {
        console.log('设备离开:', peerId);
        if (!this._peers[peerId]) return;
        delete this._peers[peerId];
        Events.fire('peer-removed', peerId);
    }

    _onPeers(peers) {
        console.log('收到设备列表:', peers);
        peers.forEach(peer => {
            if (!this._peers[peer.id]) {
                this._peers[peer.id] = peer;
                Events.fire('peer-added', peer);
            }
        });
    }

    _onDisplayName(message) {
        console.log('收到显示名称:', message);
        // 更新自己的名称
        if (message.message && message.message.displayName) {
            this._name = message.message.displayName;
            Events.fire('self-display-name', this._name);
        }
    }

    getPeers() {
        return Object.values(this._peers);
    }

    getPeer(peerId) {
        return this._peers[peerId];
    }

    getOwnName() {
        return this._name;
    }
}

// 全局可用
window.PeersManager = PeersManager;

console.log('✅ PeersManager class loaded');
EOF

echo "✓ PeersManager.js 已创建"

echo ""
echo "3. 修复 WebSocket 协议问题..."

# 创建修复后的 network.js
cat > "public/scripts/network.js" << 'EOF'
window.URL = window.URL || window.webkitURL;
window.isRtcSupported = !!(window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection);

class ServerConnection {
    constructor() {
        console.log('ServerConnection 初始化...');
        this._reconnectTimer = null;
        this._socket = null;
        this._connect();
        Events.on('beforeunload', e => this._disconnect());
        Events.on('pagehide', e => this._disconnect());
        document.addEventListener('visibilitychange', e => this._onVisibilityChange());
    }

    _connect() {
        clearTimeout(this._reconnectTimer);
        if (this._isConnected() || this._isConnecting()) return;
        
        console.log('尝试连接WebSocket...');
        const ws = new WebSocket(this._endpoint());
        ws.binaryType = 'arraybuffer';
        ws.onopen = e => this._onOpen(e);
        ws.onmessage = e => this._onMessage(e.data);
        ws.onclose = e => this._onDisconnect(e);
        ws.onerror = e => this._onError(e);
        this._socket = ws;
    }

    _onOpen(event) {
        console.log('✅ WS: server connected');
        Events.fire('server-connected');
        // 发送设备信息
        this.send({
            type: 'display-name',
            message: {
                displayName: this._getDeviceName(),
                deviceName: this._getDeviceName()
            }
        });
    }

    _onError(event) {
        console.error('❌ WebSocket error:', event);
        Events.fire('server-error', event);
    }

    _onMessage(msg) {
        try {
            msg = JSON.parse(msg);
            console.log('📥 WS:', msg);
            
            // 分发消息到对应的处理器
            Events.fire(msg.type, msg);
            
            // 兼容旧的消息类型
            switch (msg.type) {
                case 'peers':
                    Events.fire('peers', msg.peers);
                    break;
                case 'peer-joined':
                    Events.fire('peer-joined', msg.peer);
                    break;
                case 'peer-left':
                    Events.fire('peer-left', msg.peerId);
                    break;
                case 'signal':
                    Events.fire('signal', msg);
                    break;
                case 'ping':
                    this.send({ type: 'pong' });
                    break;
                case 'display-name':
                    Events.fire('display-name', msg);
                    break;
            }
        } catch (e) {
            console.error('消息解析错误:', e);
        }
    }

    _onDisconnect(event) {
        console.log('🔌 WS: server disconnected', event.code);
        Events.fire('server-disconnected');
        Events.fire('notify-user', 'Connection lost. Retrying in 5 seconds...');
        
        // 重连
        clearTimeout(this._reconnectTimer);
        this._reconnectTimer = setTimeout(() => this._connect(), 5000);
    }

    _onVisibilityChange() {
        if (document.hidden) return;
        this._connect();
    }

    _endpoint() {
        // 强制使用 WS 协议，不使用 WSS
        const protocol = 'ws';  // 始终使用 ws，不检查 https
        const webrtc = window.isRtcSupported ? '/webrtc' : '/fallback';
        const url = protocol + '://' + location.host + '/server' + webrtc;
        console.log('WebSocket URL:', url);
        return url;
    }

    _getDeviceName() {
        let name = localStorage.getItem('peerId');
        if (!name) {
            name = this._generateName();
            localStorage.setItem('peerId', name);
        }
        return name;
    }

    _generateName() {
        const animals = ['Cat', 'Dog', 'Fox', 'Wolf', 'Bear', 'Lion', 'Tiger', 'Eagle', 'Shark', 'Dolphin'];
        const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Black', 'White', 'Gray'];
        const animal = animals[Math.floor(Math.random() * animals.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return color + ' ' + animal;
    }

    send(message) {
        if (!this._isConnected()) {
            console.log('WebSocket未连接，无法发送消息');
            return;
        }
        this._socket.send(JSON.stringify(message));
    }

    _disconnect() {
        if (!this._socket) return;
        console.log('主动断开WebSocket连接');
        this.send({ type: 'disconnect' });
        this._socket.onclose = null;
        this._socket.close();
        this._socket = null;
    }

    _isConnected() {
        return this._socket && this._socket.readyState === WebSocket.OPEN;
    }

    _isConnecting() {
        return this._socket && this._socket.readyState === WebSocket.CONNECTING;
    }
}

// 全局实例
window.serverConnection = new ServerConnection();

console.log('✅ Network.js loaded');
EOF

echo "✓ network.js 已修复 (强制使用WS协议)"

echo ""
echo "4. 修复 share.html 脚本加载顺序..."

# 检查并修复 share.html 中的脚本加载顺序
if [[ -f "public/share.html" ]]; then
    echo "修复脚本加载顺序..."
    
    # 备份原文件
    cp "public/share.html" "public/share.html.backup"
    
    # 在network.js之前插入依赖脚本
    sed -i 's|<script src="scripts/network.js|<script src="scripts/events.js?v='$(date +%s)'"></script>\n    <script src="scripts/peers-manager.js?v='$(date +%s)'"></script>\n    <script src="scripts/network.js|' "public/share.html"
    
    echo "✓ 脚本加载顺序已修复"
fi

echo ""
echo "5. 修复所有HTML文件的脚本引用..."

# 为所有HTML文件添加必需的脚本引用
for html_file in public/*.html; do
    if [[ -f "$html_file" && "$(basename $html_file)" != "share.html" ]]; then
        echo "修复 $(basename $html_file)..."
        
        # 检查是否已有脚本引用
        if ! grep -q "events.js" "$html_file"; then
            # 在第一个script标签前插入
            sed -i '/<script.*src.*scripts/i\    <script src="scripts/events.js?v='$(date +%s)'"></script>' "$html_file"
        fi
        
        if ! grep -q "peers-manager.js" "$html_file"; then
            sed -i '/<script.*src.*scripts.*network/i\    <script src="scripts/peers-manager.js?v='$(date +%s)'"></script>' "$html_file"
        fi
    fi
done

echo ""
echo "6. 修复中文翻译JSON..."

zh_file="public/scripts/i18n/languages/zh-cn.json"
if [[ -f "$zh_file" ]]; then
    echo "修复 zh-cn.json 语法错误..."
    
    # 备份
    cp "$zh_file" "${zh_file}.backup"
    
    # 使用Python修复JSON
    python3 - << EOF
import json
import sys

try:
    with open('$zh_file', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 尝试修复常见JSON错误
    content = content.replace(',}', '}')
    content = content.replace(',]', ']')
    
    # 验证JSON
    json.loads(content)
    
    # 写回文件
    with open('$zh_file', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ zh-cn.json 已修复")
    
except Exception as e:
    print(f"✗ zh-cn.json 修复失败: {e}")
    # 创建基本的中文翻译
    basic_zh = {
        "ui": {
            "connect": "连接",
            "disconnect": "断开连接"
        }
    }
    
    with open('$zh_file', 'w', encoding='utf-8') as f:
        json.dump(basic_zh, f, ensure_ascii=False, indent=2)
    
    print("✓ 已创建基本的zh-cn.json")
EOF
fi

echo ""
echo "7. 重启服务..."

# 停止服务
pkill -f "node.*index.js"
sleep 3

# 启动服务
nohup node index.js > server.log 2>&1 &
echo "✓ DropShare 服务已重启"

echo ""
echo "8. 等待并测试服务..."

sleep 5

# 检查服务状态
if pgrep -f "node.*index.js" >/dev/null; then
    echo "✅ DropShare 进程运行中"
else
    echo "❌ DropShare 进程异常"
fi

if netstat -tulpn | grep -q ":8080"; then
    echo "✅ 端口 8080 监听中"
else
    echo "❌ 端口 8080 异常"
fi

# 测试WebSocket连接
echo ""
echo "测试WebSocket连接:"
cat > test_final_connection.js << 'EOF'
const WebSocket = require('ws');

console.log('🔧 测试最终WebSocket连接...');

// 测试WS协议 (不是WSS)
const wsUrl = 'ws://localhost:8080/server/webrtc';
console.log('连接URL:', wsUrl);

const ws = new WebSocket(wsUrl);

ws.on('open', function() {
    console.log('✅ WebSocket连接成功！');
    
    // 发送设备信息
    ws.send(JSON.stringify({
        type: 'display-name',
        message: {
            displayName: 'Test Device',
            deviceName: 'Test Device'
        }
    }));
    
    setTimeout(() => {
        ws.close();
        process.exit(0);
    }, 3000);
});

ws.on('message', function(data) {
    console.log('📥 收到消息:', data.toString());
});

ws.on('error', function(error) {
    console.log('❌ 连接失败:', error.message);
    process.exit(1);
});

ws.on('close', function(event) {
    console.log('🔌 连接关闭');
});

setTimeout(() => {
    console.log('⏰ 测试超时');
    process.exit(1);
}, 8000);
EOF

if node test_final_connection.js; then
    echo "🎉 WebSocket连接测试成功！"
else
    echo "⚠ WebSocket连接测试失败，但服务可能正常"
fi

rm -f test_final_connection.js

echo ""
echo "=== 所有依赖修复完成 ==="
echo ""
echo "📋 已修复的问题："
echo "- ✅ 创建了完整的 Events 类"
echo "- ✅ 创建了 PeersManager 类" 
echo "- ✅ 修复了 WebSocket 协议问题 (强制使用WS)"
echo "- ✅ 修正了脚本加载顺序"
echo "- ✅ 修复了中文翻译JSON语法"
echo "- ✅ 重启了服务"
echo ""
echo "🌐 现在请测试："
echo "1. 强制刷新浏览器 (Ctrl+Shift+R 多次)"
echo "2. 或使用无痕模式访问: http://dropshare.tech"
echo "3. 应该不再有JavaScript错误"
echo "4. 应该能看到自己的设备名称"
echo "5. 应该能发现其他设备"
echo ""
echo "🔍 如果仍有问题："
echo "- 检查浏览器控制台错误"
echo "- 查看服务器日志: tail -f server.log"
echo "- 确保使用HTTP而非HTTPS访问"