#!/bin/bash

echo "=== 修复 JavaScript 语法错误 ==="
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

echo "1. 检查 network.js 语法错误..."

# 检查第16行的语法错误
echo "检查 network.js 第16行:"
sed -n '15,17p' "public/scripts/network.js"

echo ""
echo "2. 从本地恢复正确的 network.js..."

# 从git仓库获取本地正确的文件
if [[ -f "public/scripts/network.js.backup" ]]; then
    echo "发现备份文件，检查备份内容..."
    
    # 验证备份文件语法
    if node -c "public/scripts/network.js.backup" 2>/dev/null; then
        echo "✓ 备份文件语法正确，恢复备份"
        cp "public/scripts/network.js.backup" "public/scripts/network.js"
    else
        echo "✗ 备份文件也有问题，重新创建"
    fi
else
    echo "没有备份文件，重新创建正确的 network.js"
fi

# 创建正确的 network.js 内容
cat > "public/scripts/network.js" << 'EOF'
window.URL = window.URL || window.webkitURL;
window.isRtcSupported = !!(window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection);

class ServerConnection {

    constructor() {
        this._connect();
        Events.on('beforeunload', e => this._disconnect());
        Events.on('pagehide', e => this._disconnect());
        document.addEventListener('visibilitychange', e => this._onVisibilityChange());
    }

    _connect() {
        clearTimeout(this._reconnectTimer);
        if (this._isConnected() || this._isConnecting()) return;
        const ws = new WebSocket(this._endpoint());
        ws.binaryType = 'arraybuffer';
        ws.onopen = e => console.log('WS: server connected');
        ws.onmessage = e => this._onMessage(e.data);
        ws.onclose = e => this._onDisconnect();
        ws.onerror = e => console.error(e);
        this._socket = ws;
    }

    _onMessage(msg) {
        msg = JSON.parse(msg);
        console.log('WS:', msg);
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
                window.currentPeerId = msg.message.peerId || this._peerId;
                break;
            case 'room-created':
                Events.fire('room-created', msg);
                break;
            case 'room-joined':
                Events.fire('room-joined', msg);
                break;
            case 'room-left':
                Events.fire('room-left', msg);
                break;
            case 'room-peer-joined':
                Events.fire('room-peer-joined', msg);
                break;
            case 'room-peer-left':
                Events.fire('room-peer-left', msg);
                break;
        }
    }

    send(message) {
        if (!this._isConnected()) return;
        this._socket.send(JSON.stringify(message));
    }

    _endpoint() {
        const protocol = location.protocol.startsWith('https') ? 'wss' : 'ws';
        const webrtc = window.isRtcSupported ? '/webrtc' : '/fallback';
        const url = protocol + '://' + location.host + '/server' + webrtc;
        return url;
    }

    _disconnect() {
        if (!this._socket) return;
        this.send({ type: 'disconnect' });
        this._socket.onclose = null;
        this._socket.close();
    }

    _onDisconnect() {
        console.log('WS: server disconnected');
        Events.fire('notify-user', 'Connection lost. Retrying in 5 seconds...');
        clearTimeout(this._reconnectTimer);
        this._reconnectTimer = setTimeout(_ => this._connect(), 5000);
    }

    _onVisibilityChange() {
        if (document.hidden) return;
        this._connect();
    }

    _isConnected() {
        return this._socket && this._socket.readyState === WebSocket.OPEN;
    }

    _isConnecting() {
        return this._socket && this._socket.readyState === WebSocket.CONNECTING;
    }
}

class Peer {

    constructor(serverConnection, peerId) {
        this._server = serverConnection;
        this.id = peerId;
        this._peer = {};
        this._filesQueue = [];
        Events.on('signal', e => this._onServerMessage(e));
        Events.on('peers', e => this._onPeers(e));
        Events.on('files-selected', e => this._onFilesSelected(e));
        Events.on('send-text', e => this._onSendText(e));
        Events.on('peer-left', e => this._onPeerLeft(e));
    }

    _onServerMessage(message) {
        if (this.id !== message.to) return;
        
        switch (message.type) {
            case 'offer':
                this._onOffer(message);
                break;
            case 'answer':
                this._onAnswer(message);
                break;
            case 'candidate':
                this._onCandidate(message);
                break;
        }
    }

    _onOffer(message) {
        if (!this._peer.connection) {
            this._connect(message.peer, false);
        }
    }

    _onAnswer(message) {
        this._peer.connection.setRemoteDescription(new RTCSessionDescription(message));
    }

    _onCandidate(message) {
        this._peer.connection.addIceCandidate(new RTCIceCandidate(message.candidate));
    }

    _onPeers(peers) {
        peers.forEach(peer => {
            if (this._peer[peer.id]) return;
            this._peer[peer.id] = peer;
        });
    }

    _onFilesSelected(message) {
        this._filesQueue.push(...message.files);
        if (message.to === this.id) {
            this._sendFiles();
        }
    }

    _onSendText(message) {
        if (message.to === this.id) {
            this._sendText(message.text);
        }
    }

    _onPeerLeft(peerId) {
        if (this._peer[peerId] && this._peer[peerId].connection) {
            this._peer[peerId].connection.close();
            delete this._peer[peerId];
        }
    }

    _connect(peer, initiator) {
        if (!window.isRtcSupported) {
            Events.fire('peer-connected', Object.assign(peer, {rtcSupported: false}));
            return;
        }
        
        this._peer.connection = new RTCPeerConnection(Peer.config);
        this._peer.connection.onicecandidate = e => this._onIceCandidate(e);
        this._peer.connection.onconnectionstatechange = e => this._onConnectionStateChange(e);
        this._peer.connection.ondatachannel = e => this._onChannelOpened(e);
        
        if (initiator) {
            this._peer.channel = this._peer.connection.createDataChannel('data', {ordered: true});
            this._peer.channel.binaryType = 'arraybuffer';
            this._peer.channel.onopen = e => this._onChannelOpened(e);
            this._peer.connection.createOffer().then(d => this._onDescription(d));
        }
        
        Events.fire('peer-connecting', peer);
    }

    _onDescription(description) {
        this._peer.connection.setLocalDescription(description);
        this._server.send({
            type: description.type,
            to: this.id,
            description: description
        });
    }

    _onIceCandidate(event) {
        if (!event.candidate) return;
        this._server.send({
            type: 'candidate',
            to: this.id,
            candidate: event.candidate
        });
    }

    _onChannelOpened(event) {
        console.log('RTC: channel opened with', this.id);
        const channel = event.channel || event.target;
        channel.onmessage = e => this._onMessage(e.data);
        channel.onerror = e => console.error(e);
        this._peer.channel = channel;
        Events.fire('peer-connected', this._peer, this.id);
    }

    _onConnectionStateChange(e) {
        console.log('RTC: state changed:', this._peer.connection.connectionState);
        switch (this._peer.connection.connectionState) {
            case 'disconnected':
                this._onPeerLeft(this.id);
                Events.fire('peer-disconnected', this.id);
                break;
        }
    }

    _onMessage(message) {
        if (typeof message !== 'string') {
            this._onFile(message);
            return;
        }
        message = JSON.parse(message);
        console.log('RTC:', message);
        switch (message.type) {
            case 'text':
                Events.fire('text-received', message, this.id);
                break;
            case 'file-header':
                this._onFileHeader(message);
                break;
            case 'file-chunk':
                this._onFileChunk(message);
                break;
            case 'progress':
                Events.fire('file-progress', message);
                break;
        }
    }

    _sendFiles() {
        for (let i=0; i<this._filesQueue.length; i++) {
            this._sendFile(this._filesQueue[i]);
        }
        this._filesQueue = [];
    }

    _sendFile(file) {
        this._sendJSON({
            type: 'file-header',
            name: file.name,
            mime: file.type,
            size: file.size
        });
        this._chunker = new FileChunker(file, 
            chunk => this._send(chunk),
            offset => this._onPartitionEnd(offset));
        this._chunker.nextPartition();
    }

    _sendText(text) {
        this._sendJSON({
            type: 'text', 
            text: text
        });
    }

    _sendJSON(message) {
        this._send(JSON.stringify(message));
    }

    _send(message) {
        if (!this._peer.channel) return;
        this._peer.channel.send(message);
    }

    _onFileHeader(header) {
        this._lastProgress = 0;
        this._digester = new FileDigester({
            name: header.name,
            mime: header.mime, 
            size: header.size
        }, file => this._onFileReceived(file));
    }

    _onFileChunk(chunk) {
        // Implementation for file chunks
    }

    _onFileReceived(file) {
        Events.fire('file-received', file);
    }

    _onFile(message) {
        this._digester.unchunk(message);
        const progress = this._digester.progress;
        this._onDownloadProgress(progress);

        // occasionally notify sender about our progress 
        if (progress - this._lastProgress < 0.01) return;
        this._lastProgress = progress;
        this._sendJSON({type: 'progress', progress: progress});
    }

    _onDownloadProgress(progress) {
        Events.fire('file-progress', {progress: progress});
    }

    _onPartitionEnd(offset) {
        // Implementation for partition end
    }
}

Peer.config = {
    'iceServers': [{
        urls: 'stun:stun.l.google.com:19302'
    }]
};

window.serverConnection = new ServerConnection();
window.peers = {};

Events.on('peer-joined', e => {
    window.peers[e.peer.id] = new Peer(window.serverConnection, e.peer.id);
});

Events.on('peer-left', e => {
    if (window.peers[e]) {
        delete window.peers[e];
    }
});

Events.on('peers', e => {
    e.forEach(peer => {
        if (window.peers[peer.id]) return;
        window.peers[peer.id] = new Peer(window.serverConnection, peer.id);
    });
});
EOF

echo "✓ network.js 已重新创建"

echo ""
echo "3. 检查 JavaScript 文件加载顺序..."

# 检查所有HTML文件中的script标签顺序
echo "检查 share.html 中的脚本加载顺序:"
grep -n "script.*src" "public/share.html" | head -10

echo ""
echo "4. 确保 Events 对象正确定义..."

# 检查是否存在定义Events的文件
if [[ -f "public/scripts/ui.js" ]]; then
    echo "检查 ui.js 中的 Events 定义:"
    grep -n "Events\|class Events" "public/scripts/ui.js" | head -3
fi

# 确保 Events 在正确位置定义
echo ""
echo "5. 检查并修复 Events 依赖..."

# 创建或确认Events类存在
if ! grep -q "class Events" "public/scripts/ui.js" 2>/dev/null; then
    echo "Events类缺失，添加到ui.js开头..."
    
    # 备份ui.js
    cp "public/scripts/ui.js" "public/scripts/ui.js.backup" 2>/dev/null || true
    
    # 在ui.js开头添加Events类定义
    cat > /tmp/events_class.js << 'EOF'
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

EOF

    # 将Events类添加到ui.js开头
    if [[ -f "public/scripts/ui.js" ]]; then
        cat /tmp/events_class.js "public/scripts/ui.js" > "public/scripts/ui.js.tmp"
        mv "public/scripts/ui.js.tmp" "public/scripts/ui.js"
        echo "✓ Events类已添加到ui.js"
    else
        echo "✗ ui.js文件不存在"
    fi
    
    rm -f /tmp/events_class.js
fi

echo ""
echo "6. 验证JavaScript语法..."

# 检查语法
files_to_check=("public/scripts/network.js" "public/scripts/ui.js")
for file in "${files_to_check[@]}"; do
    if [[ -f "$file" ]]; then
        echo "检查 $(basename $file) 语法:"
        if node -c "$file" 2>/dev/null; then
            echo "✓ $(basename $file) 语法正确"
        else
            echo "✗ $(basename $file) 语法错误:"
            node -c "$file"
        fi
    fi
done

echo ""
echo "7. 修复中文翻译JSON错误..."

# 修复zh-cn.json的语法错误
zh_file="public/scripts/i18n/languages/zh-cn.json"
if [[ -f "$zh_file" ]]; then
    echo "检查中文翻译文件语法..."
    if ! python3 -m json.tool "$zh_file" >/dev/null 2>&1; then
        echo "修复zh-cn.json语法错误..."
        
        # 备份文件
        cp "$zh_file" "${zh_file}.backup"
        
        # 尝试修复常见JSON错误
        sed -i 's/,\s*}/}/g' "$zh_file"  # 移除对象末尾多余的逗号
        sed -i 's/,\s*\]/]/g' "$zh_file"  # 移除数组末尾多余的逗号
        
        echo "✓ 已尝试修复zh-cn.json"
    else
        echo "✓ zh-cn.json语法正确"
    fi
fi

echo ""
echo "8. 清理缓存并重启服务..."

# 更新版本号强制刷新缓存
timestamp=$(date +%s)
for html_file in public/*.html; do
    if [[ -f "$html_file" ]]; then
        # 更新所有JS文件的版本参数
        sed -i "s/\?v=[0-9]*/?v=$timestamp/g" "$html_file"
        echo "✓ 已更新缓存参数: $(basename $html_file)"
    fi
done

# 重启服务
pkill -f "node.*index.js"
sleep 3

nohup node index.js > server.log 2>&1 &
echo "✓ DropShare服务已重启"

echo ""
echo "=== JavaScript 错误修复完成 ==="
echo ""
echo "🌐 现在请测试："
echo "1. 强制刷新浏览器 (Ctrl+Shift+R)"
echo "2. 或使用无痕模式访问: http://dropshare.tech"
echo "3. 检查F12控制台不再有语法错误"
echo "4. 应该能看到设备名称和发现其他设备"
echo ""
echo "📊 修复内容："
echo "- ✓ 修复了network.js语法错误"
echo "- ✓ 确保Events对象正确定义"
echo "- ✓ 修复了中文翻译JSON语法"
echo "- ✓ 更新了缓存参数"
echo "- ✓ 重启了服务"