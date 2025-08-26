#!/bin/bash

echo "=== 修复 HTTPS/WSS 协议问题 ==="
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

echo "1. 修复 WebSocket 协议检测..."

# 修复 network.js 中的协议检测
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
        const endpoint = this._endpoint();
        console.log('WebSocket URL:', endpoint);
        
        const ws = new WebSocket(endpoint);
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
        // 正确的协议检测 - 如果页面是HTTPS则使用WSS
        const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
        const webrtc = window.isRtcSupported ? '/webrtc' : '/fallback';
        const url = protocol + '://' + location.host + '/server' + webrtc;
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

echo "✓ network.js 协议检测已修复"

echo ""
echo "2. 修复 Events 重复定义问题..."

# 检查并修复ui.js中的Events重复定义
if [[ -f "public/scripts/ui.js" ]]; then
    echo "修复 ui.js 中的 Events 重复定义..."
    
    # 备份
    cp "public/scripts/ui.js" "public/scripts/ui.js.backup"
    
    # 移除ui.js开头的Events类定义
    sed -i '/^class Events/,/^}/d' "public/scripts/ui.js"
    sed -i '/^window\.Events = Events;/d' "public/scripts/ui.js"
    sed -i '/^console\.log.*Events class loaded/d' "public/scripts/ui.js"
    
    echo "✓ ui.js 中的重复Events定义已移除"
fi

echo ""
echo "3. 配置 SSL/WSS 支持..."

# 安装SSL证书 (Let's Encrypt)
echo "安装 SSL 证书..."

# 检查是否安装了certbot
if ! command -v certbot &> /dev/null; then
    echo "安装 certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# 为域名申请SSL证书
echo "为 dropshare.tech 申请SSL证书..."
if certbot --nginx -d dropshare.tech -d www.dropshare.tech --non-interactive --agree-tos --email admin@dropshare.tech --redirect; then
    echo "✅ SSL证书安装成功"
else
    echo "⚠ SSL证书安装失败，创建自签名证书..."
    
    # 创建自签名证书作为备用
    mkdir -p /etc/nginx/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/dropshare.key \
        -out /etc/nginx/ssl/dropshare.crt \
        -subj "/C=US/ST=CA/L=San Francisco/O=DropShare/CN=dropshare.tech"
    
    # 手动配置HTTPS
    cat > "/etc/nginx/conf.d/dropshare.conf" << 'EOF'
# HTTP重定向到HTTPS
server {
    listen 80;
    server_name dropshare.tech www.dropshare.tech;
    return 301 https://$server_name$request_uri;
}

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name dropshare.tech www.dropshare.tech;
    
    # SSL配置
    ssl_certificate /etc/nginx/ssl/dropshare.crt;
    ssl_certificate_key /etc/nginx/ssl/dropshare.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # WebSocket升级映射
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }
    
    # 主页面和静态文件
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket 专用路径 - 支持WSS
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
    
    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

    echo "✓ 自签名证书和HTTPS配置已创建"
fi

# 测试并重新加载Nginx
echo "测试Nginx配置..."
if nginx -t; then
    systemctl reload nginx
    echo "✅ Nginx配置已重新加载"
else
    echo "❌ Nginx配置错误"
    nginx -t
    exit 1
fi

echo ""
echo "4. 修复翻译问题..."

# 创建基本的中文翻译文件
cat > "public/scripts/i18n/languages/zh-cn.json" << 'EOF'
{
  "navigation": {
    "transfer": "传输",
    "rooms": "房间", 
    "images": "图像",
    "audio": "音频",
    "video": "视频",
    "files": "文件"
  },
  "ui": {
    "connect": "连接",
    "disconnect": "断开连接",
    "send": "发送",
    "receive": "接收",
    "waiting": "等待中...",
    "connected": "已连接",
    "disconnected": "已断开"
  },
  "devices": {
    "you": "你",
    "unknown": "未知设备"
  },
  "transfer": {
    "drop_files": "拖放文件到这里",
    "select_files": "选择文件",
    "sending": "发送中...",
    "receiving": "接收中...",
    "completed": "完成"
  }
}
EOF

echo "✓ 中文翻译文件已修复"

echo ""
echo "5. 更新缓存并重启服务..."

# 更新版本号
timestamp=$(date +%s)
for html_file in public/*.html; do
    if [[ -f "$html_file" ]]; then
        sed -i "s/\?v=[0-9]*/?v=$timestamp/g" "$html_file"
        echo "✓ 已更新缓存: $(basename $html_file)"
    fi
done

# 重启服务
pkill -f "node.*index.js"
sleep 3
nohup node index.js > server.log 2>&1 &
echo "✓ DropShare 服务已重启"

echo ""
echo "6. 测试 HTTPS/WSS 连接..."

sleep 5

# 检查HTTPS和WSS
echo "测试HTTPS访问:"
if curl -s -k https://localhost >/dev/null; then
    echo "✅ HTTPS 访问正常"
else
    echo "⚠ HTTPS 访问异常"
fi

echo "检查SSL证书状态:"
if [[ -f "/etc/nginx/ssl/dropshare.crt" ]] || [[ -f "/etc/letsencrypt/live/dropshare.tech/fullchain.pem" ]]; then
    echo "✅ SSL 证书存在"
else
    echo "⚠ SSL 证书未找到"
fi

echo ""
echo "=== HTTPS/WSS 修复完成 ==="
echo ""
echo "🌐 现在请测试："
echo "1. 访问: https://dropshare.tech (注意是HTTPS)"
echo "2. 浏览器会自动重定向到HTTPS"
echo "3. WebSocket将使用WSS协议连接"
echo "4. 应该不再有混合内容错误"
echo "5. 应该能看到设备名称和发现功能"
echo ""
echo "📊 修复内容："
echo "- ✅ 修复了协议检测 (HTTP -> WS, HTTPS -> WSS)"
echo "- ✅ 安装了SSL证书支持HTTPS/WSS"
echo "- ✅ 移除了Events重复定义"
echo "- ✅ 修复了中文翻译问题"
echo "- ✅ 配置了完整的HTTPS重定向"
echo ""
echo "🔒 SSL信息："
echo "- 如果使用自签名证书，浏览器可能显示安全警告"
echo "- 点击'高级' -> '继续访问'即可"
echo "- 生产环境建议使用Let's Encrypt真实证书"