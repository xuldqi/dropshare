var process = require('process')
// Handle SIGINT
process.on('SIGINT', () => {
  console.info("SIGINT Received, exiting...")
  process.exit(0)
})

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.info("SIGTERM Received, exiting...")
  process.exit(0)
})

// Handle APP ERRORS
process.on('uncaughtException', (error, origin) => {
    console.log('----- Uncaught exception -----')
    console.log('Error:', error.message)
    console.log('Stack:', error.stack)
    console.log('Origin:', origin)
    console.log('Time:', new Date().toISOString())
    
    // Log memory usage
    const memUsage = process.memoryUsage()
    console.log('Memory usage:')
    console.log(`RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB`)
    console.log(`Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`)
    console.log(`Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`)
    
    // Don't exit process, continue running
    console.log('Server continuing to run...')
})

process.on('unhandledRejection', (reason, promise) => {
    console.log('----- Unhandled Rejection at -----')
    console.log('Promise:', promise)
    console.log('Reason:', reason)
    console.log('Time:', new Date().toISOString())
    
    // Don't exit process
    console.log('Server continuing to run...')
})

const express = require('express');
const compression = require('compression');
const fetch = require('node-fetch');
const RateLimit = require('express-rate-limit');
const http = require('http');

const limiter = RateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 1000, // Limit each IP to 1000 requests per `window` (here, per 5 minutes)
	message: 'Too many requests from this IP Address, please try again after 5 minutes.',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const app = express();
const port = process.env.PORT || 8080;
const publicRun = process.argv[2];

app.use(limiter);

// Enable gzip compression to reduce transfer size of HTML/CSS/JS
app.use(compression({ threshold: 1024 }));

// ensure correct client ip and not the ip of the reverse proxy is used for rate limiting on render.com
// see https://github.com/express-rate-limit/express-rate-limit#troubleshooting-proxy-issues
app.set('trust proxy', 5);

// Serve static with proper MIME for .wasm and better cache defaults
app.use(express.static('public', {
    etag: true,
    lastModified: true,
    maxAge: '7d',
    setHeaders(res, path) {
        if (path.endsWith('.wasm')) {
            res.set('Content-Type', 'application/wasm');
        }
        // Never cache HTML to avoid stale pages
        if (path.endsWith('.html')) {
            res.set('Cache-Control', 'no-store');
            return;
        }
        // ffmpeg core is heavy: cache long-term in production, disable in dev
        if (/\/vendor\/ffmpeg\/ffmpeg-core\.(js|wasm)$/.test(path)) {
            if (process.env.NODE_ENV === 'production') {
                res.set('Cache-Control', 'public, max-age=31536000, immutable');
            } else {
                res.set('Cache-Control', 'no-store');
            }
        }
    }
}));

// Lightweight proxy for ffmpeg core files to mitigate CDN blocks
// Only allows known hosts to avoid SSRF risks
// Use prefix match to avoid path-to-regexp wildcard issues
app.use('/ffmpeg-proxy', async (req, res) => {
    try {
        // Remove leading `/ffmpeg-proxy/` and preserve rest of path
        const targetPath = decodeURIComponent((req.originalUrl || '').replace(/^\/ffmpeg-proxy\/?/, ''));
        const targetUrl = /^https?:\/\//i.test(targetPath) ? targetPath : `https://${targetPath}`;
        const u = new URL(targetUrl);
        const allowedHosts = new Set(['unpkg.com', 'cdn.jsdelivr.net']);
        if (!allowedHosts.has(u.hostname)) {
            return res.status(400).send('Host not allowed');
        }
        const upstream = await fetch(targetUrl);
        if (!upstream.ok) {
            res.status(upstream.status);
        }
        // Propagate content type; enforce wasm when applicable
        const ct = upstream.headers.get('content-type') || '';
        if (u.pathname.endsWith('.wasm')) {
            res.set('Content-Type', 'application/wasm');
        } else if (ct) {
            res.set('Content-Type', ct);
        }
        // Cache proxied binaries for a day
        res.set('Cache-Control', 'public, max-age=86400');
        upstream.body.pipe(res);
    } catch (err) {
        console.error('FFmpeg proxy error:', err.message);
        res.status(502).send('Bad gateway');
    }
});

// Handle WebSocket connection path for client connections
app.get('/server/webrtc', (req, res) => {
    // This route is specifically for WebSocket upgrade requests
    // The actual WebSocket handling is done by the WebSocket server
    res.status(200).send('WebSocket server ready');
});

app.get('/server/fallback', (req, res) => {
    // Fallback WebSocket connection path
    res.status(200).send('WebSocket fallback server ready');
});

const fs = require('fs');
const path = require('path');

// Helper function to read and parse the translations file
function getTranslations() {
    try {
        const langFilePath = path.join(__dirname, 'public', 'scripts', 'i18n', 'languages.js');
        const langFileContent = fs.readFileSync(langFilePath, 'utf8');

        // Extract the I18N_DATA object using a regex
        const match = langFileContent.match(/const I18N_DATA = ({[\s\S]*?});/);
        if (!match || !match[1]) {
            return null;
        }

        // Safely parse the object string
        const i18nData = new Function(`return ${match[1]}`)();
        return i18nData;
    } catch (error) {
        console.error('Error reading or parsing translations file:', error);
        return null;
    }
}

// Route for the translation admin tool
app.get('/admin/translations', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'translation_tool.html'));
});

// API endpoint to get available languages
app.get('/api/translations/languages', (req, res) => {
    const translations = getTranslations();
    if (!translations) {
        return res.status(500).json({ error: 'Could not load translations.' });
    }
    res.json(Object.keys(translations));
});

// API endpoint to compare two languages
app.get('/api/translations/compare', (req, res) => {
    const { source, target } = req.query;

    if (!source || !target) {
        return res.status(400).json({ error: 'Please provide both source and target language codes.' });
    }

    const translations = getTranslations();
    if (!translations) {
        return res.status(500).json({ error: 'Could not load translations.' });
    }

    const sourceKeys = translations[source] ? Object.keys(translations[source]) : [];
    const targetKeys = translations[target] ? Object.keys(translations[target]) : [];

    if (sourceKeys.length === 0) {
        return res.status(404).json({ error: `Source language '${source}' not found.` });
    }
    if (targetKeys.length === 0) {
        return res.status(404).json({ error: `Target language '${target}' not found.` });
    }

    const sourceKeySet = new Set(sourceKeys);
    const targetKeySet = new Set(targetKeys);

    const missing_in_target = sourceKeys.filter(key => !targetKeySet.has(key));
    const extra_in_target = targetKeys.filter(key => !sourceKeySet.has(key));

    res.json({
        source,
        target,
        missing_in_target,
        extra_in_target
    });
});

// Fallback: only redirect for HTML navigations; return 404 for missing assets to avoid HTML-as-JS
app.use(function(req, res) {
    const accept = req.headers['accept'] || '';
    const isHTML = accept.includes('text/html') || req.method === 'GET' && !req.path.includes('.');
    if (isHTML) {
        return res.redirect('/');
    }
    res.status(404).send('Not found');
});

// Create HTTP server
const server = http.createServer(app);

// 简化监听方式，添加错误处理
const host = process.env.HOST || '0.0.0.0';
server.listen(port, host, () => {
    console.log('---------------------------------------');
    console.log('DropShare started');
    console.log('Host: ' + host);
    console.log('Port: ' + port);
    console.log('Please visit: http://' + (host === '0.0.0.0' ? 'localhost' : host) + ':' + port);
    console.log('---------------------------------------');
})
.on('error', (err) => {
    console.error('Server startup failed:');
    console.error(err);
    if(err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use, please try a different port`);
}
});

const parser = require('ua-parser-js');
const { uniqueNamesGenerator, animals, colors } = require('unique-names-generator');

class DropShareServer {

    constructor() {
        const WebSocket = require('ws');
        console.log('正在初始化WebSocket服务器...');
        this._wss = new WebSocket.Server({ server });
        console.log('WebSocket服务器已创建，绑定到HTTP服务器');
        
        this._wss.on('connection', (socket, request) => {
            console.log('收到新的WebSocket连接请求');
            console.log('请求URL:', request.url);
            console.log('请求头:', request.headers);
            this._onConnection(new Peer(socket, request));
        });
        
        this._wss.on('headers', (headers, response) => {
            console.log('WebSocket握手头部事件');
            this._onHeaders(headers, response);
        });
        
        this._wss.on('error', (error) => {
            console.error('WebSocket服务器错误:', error);
        });
        
        console.log('WebSocket事件监听器已设置');

        this._rooms = {};
        this._privateRooms = {}; // Private room storage
        this._recentlyDisconnected = new Map(); // Track recently disconnected users for reconnection detection
        this._timers = new Map(); // Store all timers for cleanup

        // Add server statistics monitoring
        this._stats = {
            connections: 0,
            totalConnections: 0,
            startTime: Date.now()
        };

        // Output server status every 5 minutes
        this._statsTimer = setInterval(() => {
            this._logServerStats();
            this._cleanupExpiredData(); // Regularly clean up expired data
        }, 5 * 60 * 1000);

        // Add cleanup mechanism when server shuts down
        this._setupCleanupHandlers();

        console.log('DropShare is running on port', port);
    }

    // Debug helper - returns current peers grouped by room (IP)
    getPeersOverview() {
        const rooms = {};
        for (const ip in this._rooms) {
            const list = [];
            for (const id in this._rooms[ip]) {
                const p = this._rooms[ip][id];
                list.push({
                    id: p.id,
                    displayName: (p.name && p.name.displayName) || '',
                    deviceName: (p.name && p.name.deviceName) || '',
                    readyState: p.socket ? p.socket.readyState : -1
                });
            }
            rooms[ip] = list;
        }
        return {
            rooms,
            wsClients: this._wss && this._wss.clients ? this._wss.clients.size : 0
        };
    }

    // Set up cleanup handlers when server shuts down
    _setupCleanupHandlers() {
        const cleanup = () => {
            console.log('=== Server shutting down, cleaning up resources ===');
            try {
                // Clean up main statistics timer
                if (this._statsTimer) {
                    clearInterval(this._statsTimer);
                    console.log('Main statistics timer cleaned up');
                }
                
                // Clean up all custom timers
                let cleanedCount = 0;
                for (const [timerId, timerData] of this._timers) {
                    clearTimeout(timerData.timer);
                    cleanedCount++;
                }
                this._timers.clear();
                console.log(`Cleaned up ${cleanedCount} custom timers`);
                
                // Clean up all peer keepalive timers
                let peerTimerCount = 0;
                for (const ip in this._rooms) {
                    for (const peerId in this._rooms[ip]) {
                        const peer = this._rooms[ip][peerId];
                        if (peer && peer.timerId) {
                            clearTimeout(peer.timerId);
                            peerTimerCount++;
                        }
                    }
                }
                console.log(`Cleaned up ${peerTimerCount} peer keepalive timers`);
                
                console.log('All resources cleaned up');
            } catch (error) {
                console.error('Error occurred while cleaning up resources:', error);
            }
        };

        // Listen for process exit signals
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        process.on('exit', cleanup);
    }

    _logServerStats() {
        const uptime = Math.round((Date.now() - this._stats.startTime) / 1000 / 60); // minutes
        const memUsage = process.memoryUsage();
        
        // Debug info hidden - uncomment below lines to show server stats
        // console.log('=== Server Stats ===');
        // console.log(`Uptime: ${uptime} minutes`);
        // console.log(`Current connections: ${this._stats.connections}`);
        // console.log(`Total connections: ${this._stats.totalConnections}`);
        // console.log(`Active rooms: ${Object.keys(this._rooms).length}`);
        // console.log(`Private rooms: ${Object.keys(this._privateRooms).length}`);
        // console.log(`Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
        // console.log('===================');
    }

    // Clean up expired data to prevent memory leaks
    _cleanupExpiredData() {
        try {
            console.log('=== Starting cleanup of expired data ===');
            
            // Clean up expired reconnection records (over 10 minutes)
            const now = Date.now();
            const expiredThreshold = 10 * 60 * 1000; // 10 minutes
            let cleanedReconnections = 0;
            
            for (const [peerId, data] of this._recentlyDisconnected) {
                if (now - data.disconnectTime > expiredThreshold) {
                    this._recentlyDisconnected.delete(peerId);
                    cleanedReconnections++;
                }
            }
            
            // Clean up expired timers
            let cleanedTimers = 0;
            const timerTypes = {};
            for (const [timerId, timerData] of this._timers) {
                if (timerData.expiresAt && now > timerData.expiresAt) {
                    clearTimeout(timerData.timer);
                    this._timers.delete(timerId);
                    cleanedTimers++;
                    
                    // Count timer types
                    timerTypes[timerData.type] = (timerTypes[timerData.type] || 0) + 1;
                }
            }
            
            if (cleanedTimers > 0) {
                console.log(`Cleaned timer types:`, timerTypes);
            }
            
            // Clean up empty rooms
            let cleanedRooms = 0;
            for (const [ip, room] of Object.entries(this._rooms)) {
                if (Object.keys(room).length === 0) {
                    delete this._rooms[ip];
                    cleanedRooms++;
                }
            }
            
            // Clean up empty private rooms
            let cleanedPrivateRooms = 0;
            for (const [roomCode, room] of Object.entries(this._privateRooms)) {
                if (room.members.size === 0) {
                    delete this._privateRooms[roomCode];
                    cleanedPrivateRooms++;
                }
            }
            
            console.log(`Cleanup completed - Reconnection records: ${cleanedReconnections}, Timers: ${cleanedTimers}, Rooms: ${cleanedRooms}, Private rooms: ${cleanedPrivateRooms}`);
            console.log(`Current status - Reconnection records: ${this._recentlyDisconnected.size}, Timers: ${this._timers.size}, Rooms: ${Object.keys(this._rooms).length}, Private rooms: ${Object.keys(this._privateRooms).length}`);
        } catch (error) {
            console.error('Error occurred while cleaning up data:', error);
        }
    }

    _onConnection(peer) {
        try {
            // Check for recent disconnection to prevent rapid reconnections
            const now = Date.now();
            const recentDisconnectKey = `${peer.id}-${peer.ip}`;
            const lastDisconnect = this._recentlyDisconnected.get(recentDisconnectKey);
            
            if (lastDisconnect && (now - lastDisconnect < 500)) { // 减少到0.5秒
                console.log(`Ignoring rapid reconnection from ${peer.id} (${now - lastDisconnect}ms ago)`);
                peer.socket.close();
                return;
            }
            
            // Remove from recently disconnected list
            this._recentlyDisconnected.delete(recentDisconnectKey);
            
            // Check and remove ALL existing peers with same ID across all rooms
            for (const ip in this._rooms) {
                if (this._rooms[ip] && this._rooms[ip][peer.id]) {
                    console.log(`Found existing peer ${peer.id} in room ${ip}, removing old connection`);
                    const oldPeer = this._rooms[ip][peer.id];
                    
                    // Immediately remove from room to prevent self-connections
                    delete this._rooms[ip][peer.id];
                    
                    // Then clean up the old connection
                    this._cancelKeepAlive(oldPeer);
                    if (oldPeer.socket) {
                        oldPeer._isBeingReplaced = true;
                        oldPeer.socket.close();
                    }
                }
            }
            
            // Update connection statistics
            this._stats.connections++;
            this._stats.totalConnections++;
            console.log(`New connection: ${peer.id} (total: ${this._stats.connections})`);

            // 🔧 FIX: Assign peer object to WebSocket for _findPeerById to work
            peer.socket.peer = peer;
            console.log(`🔗 Peer object assigned to WebSocket: ${peer.id.substring(0, 8)}...`);

            this._joinRoom(peer);
            
            peer.socket.on('message', message => {
                try {
                    this._onMessage(peer, message);
                } catch (error) {
                    console.error('=== WebSocket消息处理错误 ===');
                    console.error('错误:', error.message);
                    console.error('堆栈:', error.stack);
                    console.error('Peer ID:', peer.id);
                    console.error('========================');
                }
            });
            
            peer.socket.on('close', () => {
                try {
                    // Only decrement if this wasn't a replaced connection
                    if (!peer._isBeingReplaced) {
                        this._stats.connections--;
                    }
                    console.log(`Connection closed: ${peer.id} (remaining: ${this._stats.connections})`);
                    this._leaveRoom(peer);
                } catch (error) {
                    console.error('连接关闭处理错误:', error.message);
                }
            });
            
            peer.socket.on('error', (error) => {
                console.error('=== WebSocket错误 ===');
                console.error('Peer ID:', peer.id);
                console.error('错误:', error.message);
                console.error('时间:', new Date().toISOString());
                console.error('==================');
            });
            
            this._keepAlive(peer);

            // send displayName
            console.log(`📝 Sending display-name to ${peer.id}: ${peer.name.displayName}`);
            this._send(peer, {
                type: 'display-name',
                message: {
                    displayName: peer.name.displayName,
                    deviceName: peer.name.deviceName,
                    peerId: peer.id
                }
            });
        } catch (error) {
            console.error('=== 连接处理错误 ===');
            console.error('错误:', error.message);
            console.error('堆栈:', error.stack);
            console.error('Peer ID:', peer ? peer.id : 'unknown');
            console.error('=================');
        }
    }

    _onHeaders(headers, request) {
        // Avoid resetting if client already has a peerid cookie
        if (request.headers.cookie && request.headers.cookie.indexOf('peerid=') > -1) return;
        const peerId = Peer.uuid();
        // Detect TLS (wss) or proxy-forwarded https to decide cookie flags
        const xfProto = (request.headers['x-forwarded-proto'] || '').toLowerCase();
        const isTLS = !!(request.connection && request.connection.encrypted);
        const isSecure = isTLS || xfProto === 'https' || xfProto === 'wss';
        const flags = [
            'Path=/',
            'SameSite=Strict'
        ];
        if (isSecure) flags.push('Secure');
        headers.push(`Set-Cookie: peerid=${peerId}; ${flags.join('; ')}`);
        // Attach to request for downstream handlers if needed
        request.peerId = peerId;
    }

    _onMessage(sender, message) {
        // Try to parse message 
        try {
            message = JSON.parse(message);
        } catch (e) {
            console.error('JSON解析失败:', e.message, '原始消息:', message.toString().substring(0, 100));
            return;
        }

        // 增强的错误处理
        try {
            this._processMessage(sender, message);
        } catch (error) {
            console.error('=== 消息处理错误 ===');
            console.error('错误:', error.message);
            console.error('堆栈:', error.stack);
            console.error('发送者:', sender.id);
            console.error('消息类型:', message.type);
            console.error('时间:', new Date().toISOString());
            console.error('================');
        }
    }

    _processMessage(sender, message) {
        // Helper to relay any message with a recipient
        const relay = () => {
            if (message.to && this._rooms[sender.ip]) {
                const recipientId = message.to;
                const recipient = this._rooms[sender.ip][recipientId];
                if (recipient) {
                    delete message.to;
                    message.sender = sender.id;
                    this._send(recipient, message);
                    return true;
                }
            }
            return false;
        };

        switch (message.type) {
            case 'disconnect':
                this._leaveRoom(sender);
                break;
            case 'pong':
                sender.lastBeat = Date.now();
                break;
            case 'ping':
                // 处理客户端主动发送的ping
                this._send(sender, { type: 'pong' });
                break;
            case 'get-peers':
                // 处理客户端请求当前房间的peer列表
                this._sendPeersList(sender);
                break;
            case 'signal':
                // 关键的WebRTC信令消息处理
                this._handleSignal(sender, message);
                break;
            // WebSocket relay paths for local networks (no WebRTC)
            case 'text':
            case 'header':
            case 'file-data':
            case 'partition':
            case 'partition-received':
            case 'progress':
            case 'transfer-complete':
                if (!relay()) {
                    console.log(`⚠️ Relay failed for ${message.type} from ${sender.id.substring(0,8)}...`);
                }
                break;
            case 'create-room':
                this._createPrivateRoom(sender, message.roomSettings, message.userInfo);
                break;
            case 'join-room':
                this._joinPrivateRoom(sender, message.roomCode, message.password, message.userInfo);
                break;
            case 'leave-room':
                this._leavePrivateRoom(sender, message.roomCode);
                break;
            case 'kick-member':
                this._kickMember(sender, message.roomCode, message.memberId);
                break;
            case 'room-file-shared':
                this._handleRoomFileShared(sender, message);
                break;
            case 'room-file-removed':
                this._handleRoomFileRemoved(sender, message);
                break;
            default:
                console.log(`未知消息类型: ${message.type} from ${sender.id.substring(0,8)}...`);
        }
    }

    _sendPeersList(peer) {
        if (!this._rooms[peer.ip]) {
            this._send(peer, { type: 'peers', peers: [] });
            return;
        }

        const otherPeers = [];
        for (const otherPeerId in this._rooms[peer.ip]) {
            // Skip if it's the same peer ID (prevents self-connection)
            if (otherPeerId === peer.id) {
                continue;
            }
            otherPeers.push(this._rooms[peer.ip][otherPeerId].getInfo());
        }

        console.log(`📋 Sending peers list to ${peer.id.substring(0,8)}...: ${otherPeers.length} peers`);
        this._send(peer, {
            type: 'peers',
            peers: otherPeers
        });
    }

    _joinRoom(peer) {
        // if room doesn't exist, create it
        if (!this._rooms[peer.ip]) {
            this._rooms[peer.ip] = {};
        }

        // notify all other peers
        for (const otherPeerId in this._rooms[peer.ip]) {
            const otherPeer = this._rooms[peer.ip][otherPeerId];
            this._send(otherPeer, {
                type: 'peer-joined',
                peer: peer.getInfo()
            });
        }

        // notify peer about the other peers (excluding self)
        const otherPeers = [];
        for (const otherPeerId in this._rooms[peer.ip]) {
            // Skip if it's the same peer ID (prevents self-connection)
            if (otherPeerId === peer.id) {
                console.log(`⚠️  Skipping duplicate peer with same ID: ${peer.id.substring(0,8)}...`);
                continue;
            }
            otherPeers.push(this._rooms[peer.ip][otherPeerId].getInfo());
        }

        this._send(peer, {
            type: 'peers',
            peers: otherPeers
        });

        // add peer to room
        this._rooms[peer.ip][peer.id] = peer;
    }

    _leaveRoom(peer) {
        if (!this._rooms[peer.ip] || !this._rooms[peer.ip][peer.id]) return;
        this._cancelKeepAlive(this._rooms[peer.ip][peer.id]);

        // Record disconnection time for debouncing
        const recentDisconnectKey = `${peer.id}-${peer.ip}`;
        this._recentlyDisconnected.set(recentDisconnectKey, Date.now());

        // delete the peer
        delete this._rooms[peer.ip][peer.id];

        // 清理私密房间成员身份
        this._cleanupPrivateRoomMembership(peer);

        peer.socket.terminate();
        //if room is empty, delete the room
        if (!Object.keys(this._rooms[peer.ip]).length) {
            delete this._rooms[peer.ip];
        } else {
            // notify all other peers
            for (const otherPeerId in this._rooms[peer.ip]) {
                const otherPeer = this._rooms[peer.ip][otherPeerId];
                this._send(otherPeer, { type: 'peer-left', peerId: peer.id });
            }
        }
    }

    _send(peer, message) {
        try {
            if (!peer || !peer.socket) {
                console.warn('发送消息失败: peer 或 socket 不存在');
                return;
            }
            
            if (peer.socket.readyState !== peer.socket.OPEN) {
                const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
                const stateName = states[peer.socket.readyState] || 'UNKNOWN';
                console.warn(`发送消息失败: WebSocket状态异常 (${peer.socket.readyState}=${stateName}) for peer ${peer.id}`);
                return;
            }
            
            const messageStr = JSON.stringify(message);
            peer.socket.send(messageStr, (error) => {
                if (error) {
                    console.error('=== 消息发送错误 ===');
                    console.error('Peer ID:', peer.id);
                    console.error('错误:', error.message);
                    console.error('消息类型:', message.type);
                    console.error('=================');
                }
            });
        } catch (error) {
            console.error('=== _send方法错误 ===');
            console.error('错误:', error.message);
            console.error('堆栈:', error.stack);
            console.error('Peer ID:', peer ? peer.id : 'unknown');
            console.error('消息:', message);
            console.error('=================');
        }
    }

    _keepAlive(peer) {
        this._cancelKeepAlive(peer);
        var timeout = 30000;
        if (!peer.lastBeat) {
            peer.lastBeat = Date.now();
        }
        if (Date.now() - peer.lastBeat > 2 * timeout) {
            this._leaveRoom(peer);
            return;
        }

        this._send(peer, { type: 'ping' });

        peer.timerId = setTimeout(() => this._keepAlive(peer), timeout);
    }

    _cancelKeepAlive(peer) {
        if (peer && peer.timerId) {
            clearTimeout(peer.timerId);
        }
    }

    _handleSignal(sender, message) {
        // 这是WebRTC信令处理 - 文件传输的核心
        let signalType = 'unknown';
        if (message.sdp) {
            signalType = message.sdp.type; // offer, answer
        } else if (message.ice) {
            signalType = 'ice-candidate';
        }
        console.log(`📡 Signal ${sender.id.substring(0,8)}... → ${message.to.substring(0,8)}...: ${signalType}`);
        
        // 继续原有的消息转发逻辑
        // 这个函数主要是为了调试，实际转发在后面的通用逻辑中进行
    }

    // 私密房间功能方法
    _createPrivateRoom(host, roomSettings, userInfo) {
        const roomCode = roomSettings.code;
        
        // 如果提供了userInfo，更新host的显示信息
        if (userInfo) {
            if (userInfo.displayName) {
                host.name.displayName = userInfo.displayName;
            }
            if (userInfo.deviceName) {
                host.name.deviceName = userInfo.deviceName;
            }
        }
        
        console.log(`=== 创建房间请求 ===`);
        console.log(`Host ID: ${host.id}, Room Code: ${roomCode}`);
        console.log(`当前房间存在: ${!!this._privateRooms[roomCode]}`);
        if (this._privateRooms[roomCode]) {
            console.log(`现有房间成员数: ${this._privateRooms[roomCode].members.size}`);
            console.log(`现有房间成员列表: ${Array.from(this._privateRooms[roomCode].members.keys())}`);
        }
        
        // 检查是否是重连场景
        const recentDisconnect = this._recentlyDisconnected.get(host.id);
        if (recentDisconnect && recentDisconnect.roomCode === roomCode && recentDisconnect.isHost) {
            // 这是房主重连
            console.log(`Host ${host.id} reconnecting to room ${roomCode} after disconnect`);
            
            const existingRoom = this._privateRooms[roomCode];
            if (existingRoom) {
                // 恢复房主身份
                existingRoom.members.set(host.id, {
                    id: host.id,
                    displayName: host.name.displayName,
                    deviceName: host.name.deviceName,
                    isHost: true,
                    joinedAt: recentDisconnect.memberInfo.joinedAt // 保持原有加入时间
                });
                
                host.currentRoom = roomCode;
                
                // 清除重连记录
                this._recentlyDisconnected.delete(host.id);
                
                // 清理重复成员
                this._deduplicateRoomMembers(roomCode);
                
                // 发送房间重连成功消息
                this._send(host, {
                    type: 'room-created',
                    room: {
                        code: existingRoom.code,
                        name: existingRoom.name,
                        maxMembers: existingRoom.maxMembers,
                        isPrivate: existingRoom.isPrivate
                    },
                    hostId: host.id,
                    hostInfo: existingRoom.members.get(host.id)
                });
                
                // 通知其他成员房主重新上线
                this._broadcastToRoom(roomCode, {
                    type: 'room-member-joined',
                    member: existingRoom.members.get(host.id),
                    isReconnect: true
                }, host.id);
                
                return;
            }
        }
        
        // 检查房间码是否已存在
        if (this._privateRooms[roomCode]) {
            const existingRoom = this._privateRooms[roomCode];
            
            // 检查这个用户是否是原房主 (其他重连场景)
            if (existingRoom.hostId === host.id) {
                console.log(`Host ${host.id} reconnecting to existing room ${roomCode}`);
                
                // 更新房主信息但不重复添加到成员列表
                if (!existingRoom.members.has(host.id)) {
                    existingRoom.members.set(host.id, {
                        id: host.id,
                        displayName: host.name.displayName,
                        deviceName: host.name.deviceName,
                        isHost: true,
                        joinedAt: Date.now()
                    });
                }
                
                host.currentRoom = roomCode;
                
                // 清理重复成员
                this._deduplicateRoomMembers(roomCode);
                
                // 发送房间重连成功消息
                this._send(host, {
                    type: 'room-created',
                    room: {
                        code: existingRoom.code,
                        name: existingRoom.name,
                        maxMembers: existingRoom.maxMembers,
                        isPrivate: existingRoom.isPrivate
                    },
                    hostId: host.id,
                    hostInfo: existingRoom.members.get(host.id)
                });
                
                return;
            }
            
            // 如果不是原房主，返回错误
            this._send(host, {
                type: 'room-error',
                error: 'Room code already exists. Please try again.'
            });
            return;
        }

        // 创建新房间
        const room = {
            code: roomCode,
            name: roomSettings.name,
            password: roomSettings.password,
            maxMembers: roomSettings.maxMembers,
            isPrivate: roomSettings.isPrivate,
            hostId: host.id,
            members: new Map(),
            files: new Map(), // 存储房间文件
            createdAt: Date.now()
        };

        // 添加房主到房间
        room.members.set(host.id, {
            id: host.id,
            displayName: host.name.displayName,
            deviceName: host.name.deviceName,
            isHost: true,
            joinedAt: Date.now()
        });

        this._privateRooms[roomCode] = room;
        host.currentRoom = roomCode;

        // 清理重复成员（新房间应该不会有，但为了保险起见）
        this._deduplicateRoomMembers(roomCode);

        // 通知房主房间创建成功
        console.log(`🚀 准备发送房间创建成功消息给 ${host.id}`);
        console.log(`房间代码: ${room.code}, 房间名称: ${room.name}`);
        
        this._send(host, {
            type: 'room-created',
            room: {
                code: room.code,
                name: room.name,
                maxMembers: room.maxMembers,
                isPrivate: room.isPrivate
            },
            hostId: host.id,
            hostInfo: room.members.get(host.id)
        });
        
        console.log(`✅ 房间创建成功消息已发送给 ${host.id}`);
    }

    _joinPrivateRoom(peer, roomCode, password, userInfo) {
        // 如果提供了userInfo，更新peer的显示信息
        if (userInfo) {
            if (userInfo.displayName) {
                peer.name.displayName = userInfo.displayName;
            }
            if (userInfo.deviceName) {
                peer.name.deviceName = userInfo.deviceName;
            }
        }
        
        const room = this._privateRooms[roomCode];
        
        if (!room) {
            this._send(peer, {
                type: 'room-error',
                error: 'Room not found. Please check the room code.'
            });
            return;
        }

        // 检查密码
        if (room.password && room.password !== password) {
            this._send(peer, {
                type: 'room-error',
                error: 'Incorrect password.'
            });
            return;
        }

        // 检查房间是否已满
        if (room.members.size >= room.maxMembers) {
            this._send(peer, {
                type: 'room-error',
                error: 'Room is full.'
            });
            return;
        }

        // 检查是否是重连场景
        const recentDisconnect = this._recentlyDisconnected.get(peer.id);
        if (recentDisconnect && recentDisconnect.roomCode === roomCode && !recentDisconnect.isHost) {
            // 这是普通成员重连
            console.log(`User ${peer.id} reconnecting to room ${roomCode} after disconnect`);
            
            // 恢复成员身份
            room.members.set(peer.id, {
                id: peer.id,
                displayName: peer.name.displayName,
                deviceName: peer.name.deviceName,
                isHost: false,
                joinedAt: recentDisconnect.memberInfo.joinedAt // 保持原有加入时间
            });
            
            peer.currentRoom = roomCode;
            
            // 清除重连记录
            this._recentlyDisconnected.delete(peer.id);
            
            // 清理重复成员
            this._deduplicateRoomMembers(roomCode);
            
            // 发送重连成功消息
            this._send(peer, {
                type: 'room-joined',
                room: {
                    code: room.code,
                    name: room.name,
                    maxMembers: room.maxMembers,
                    isPrivate: room.isPrivate
                },
                members: Array.from(room.members.values())
            });
            
            // 发送房间历史文件给重连用户
            if (room.files && room.files.size > 0) {
                console.log(`Sending ${room.files.size} historical files to reconnected user ${peer.id}`);
                room.files.forEach(fileRecord => {
                    this._send(peer, {
                        type: 'room-file-shared',
                        roomCode: roomCode,
                        fileInfo: fileRecord.info,
                        fileData: fileRecord.data,
                        isHistorical: true
                    });
                });
            }
            
            // 通知其他成员用户重新上线
            this._broadcastToRoom(roomCode, {
                type: 'room-member-joined',
                member: room.members.get(peer.id),
                isReconnect: true
            }, peer.id);
            
            return;
        }

        // 检查用户是否已在房间中 (其他重连场景)
        if (room.members.has(peer.id)) {
            console.log(`User ${peer.id} reconnecting to room ${roomCode}`);
            
            // 更新成员信息
            room.members.set(peer.id, {
                id: peer.id,
                displayName: peer.name.displayName,
                deviceName: peer.name.deviceName,
                isHost: false,
                joinedAt: room.members.get(peer.id).joinedAt // 保持原有加入时间
            });
            
            peer.currentRoom = roomCode;
            
            // 清理重复成员
            this._deduplicateRoomMembers(roomCode);
            
            // 发送重连成功消息
            this._send(peer, {
                type: 'room-joined',
                room: {
                    code: room.code,
                    name: room.name,
                    maxMembers: room.maxMembers,
                    isPrivate: room.isPrivate
                },
                members: Array.from(room.members.values())
            });
            
            // 发送房间历史文件给重连用户
            if (room.files && room.files.size > 0) {
                console.log(`Sending ${room.files.size} historical files to reconnected user ${peer.id}`);
                room.files.forEach(fileRecord => {
                    this._send(peer, {
                        type: 'room-file-shared',
                        roomCode: roomCode,
                        fileInfo: fileRecord.info,
                        fileData: fileRecord.data,
                        isHistorical: true
                    });
                });
            }
            
            return;
        }

        // 添加成员到房间
        const memberInfo = {
            id: peer.id,
            displayName: peer.name.displayName,
            deviceName: peer.name.deviceName,
            isHost: false,
            joinedAt: Date.now()
        };

        room.members.set(peer.id, memberInfo);
        peer.currentRoom = roomCode;

        // 清理重复成员
        this._deduplicateRoomMembers(roomCode);

        // 通知新成员加入成功
        this._send(peer, {
            type: 'room-joined',
            room: {
                code: room.code,
                name: room.name,
                maxMembers: room.maxMembers,
                isPrivate: room.isPrivate
            },
            members: Array.from(room.members.values())
        });

        // 发送房间历史文件给新成员
        if (room.files && room.files.size > 0) {
            console.log(`Sending ${room.files.size} historical files to new member ${peer.id}`);
            room.files.forEach(fileRecord => {
                this._send(peer, {
                    type: 'room-file-shared',
                    roomCode: roomCode,
                    fileInfo: fileRecord.info,
                    fileData: fileRecord.data,
                    isHistorical: true
                });
            });
        }

        // 通知其他成员有新成员加入
        this._broadcastToRoom(roomCode, {
            type: 'room-member-joined',
            member: memberInfo,
            room: {
                code: room.code,
                name: room.name,
                maxMembers: room.maxMembers,
                isPrivate: room.isPrivate,
                members: Array.from(room.members.values())
            }
        }, peer.id);
    }

    _leavePrivateRoom(peer, roomCode) {
        const room = this._privateRooms[roomCode];
        
        if (!room || !room.members.has(peer.id)) {
            return;
        }

        const isHost = room.members.get(peer.id).isHost;
        room.members.delete(peer.id);
        peer.currentRoom = null;

        // 通知其他成员有成员离开
        this._broadcastToRoom(roomCode, {
            type: 'room-member-left',
            memberId: peer.id,
            room: {
                code: room.code,
                name: room.name,
                maxMembers: room.maxMembers,
                isPrivate: room.isPrivate,
                members: Array.from(room.members.values())
            }
        });

        // 如果房主离开，解散房间
        if (isHost || room.members.size === 0) {
            this._broadcastToRoom(roomCode, {
                type: 'room-disbanded',
                reason: isHost ? 'Host left the room' : 'Room is empty'
            });
            
            // 清理所有成员的房间状态
            room.members.forEach((member, memberId) => {
                const memberPeer = this._findPeerById(memberId);
                if (memberPeer) {
                    memberPeer.currentRoom = null;
                }
            });
            
            delete this._privateRooms[roomCode];
        }

        // 通知离开的成员
        this._send(peer, {
            type: 'room-left',
            roomCode: roomCode
        });
    }

    _kickMember(host, roomCode, memberId) {
        const room = this._privateRooms[roomCode];
        
        if (!room || !room.members.has(host.id) || !room.members.get(host.id).isHost) {
            this._send(host, {
                type: 'room-error',
                error: 'You do not have permission to kick members.'
            });
            return;
        }

        if (!room.members.has(memberId)) {
            this._send(host, {
                type: 'room-error',
                error: 'Member not found in room.'
            });
            return;
        }

        const memberPeer = this._findPeerById(memberId);
        if (memberPeer) {
            // 通知被踢出的成员
            this._send(memberPeer, {
                type: 'room-kicked',
                roomCode: roomCode,
                reason: 'You have been removed from the room by the host.'
            });
            
            memberPeer.currentRoom = null;
        }

        room.members.delete(memberId);

        // 通知其他成员
        this._broadcastToRoom(roomCode, {
            type: 'room-member-left',
            memberId: memberId,
            reason: 'kicked',
            room: {
                code: room.code,
                name: room.name,
                maxMembers: room.maxMembers,
                isPrivate: room.isPrivate,
                members: Array.from(room.members.values())
            }
        });
    }

    _broadcastToRoom(roomCode, message, excludePeerId = null) {
        const room = this._privateRooms[roomCode];
        if (!room) {
            console.log(`⚠️ Attempted to broadcast to non-existent room: ${roomCode}`);
            return;
        }

        console.log(`📢 Broadcasting to room ${roomCode}: ${message.type}`);
        console.log(`📊 Room has ${room.members.size} members`);
        
        let sentCount = 0;
        room.members.forEach((member, memberId) => {
            if (memberId !== excludePeerId) {
                const peer = this._findPeerById(memberId);
                if (peer) {
                    console.log(`📤 Sending ${message.type} to member ${memberId} (${member.displayName})`);
                    this._send(peer, message);
                    sentCount++;
                } else {
                    console.log(`⚠️ Could not find peer for member ${memberId}`);
                }
            }
        });
        
        console.log(`✅ Broadcast complete: sent to ${sentCount} members`);
    }

    _findPeerById(peerId) {
        console.log(`🔍 Looking for peer: ${peerId.substring(0, 8)}...`);
        
        // 首先在普通房间中查找
        for (const ip in this._rooms) {
            if (this._rooms[ip][peerId]) {
                console.log(`✅ Found peer in regular room (IP: ${ip})`);
                return this._rooms[ip][peerId];
            }
        }
        
        // 然后在WebSocket连接中查找（私有房间用户）
        let wsCount = 0;
        for (const ws of this._wss.clients) {
            wsCount++;
            console.log(`🔍 Checking WebSocket ${wsCount}: state=${ws.readyState}, peerId=${ws.peer ? ws.peer.id.substring(0, 8) + '...' : 'none'}`);
            if (ws.readyState === ws.OPEN && ws.peer && ws.peer.id === peerId) {
                console.log(`✅ Found peer in WebSocket connections`);
                return ws.peer;
            }
        }
        
        console.log(`❌ Peer not found. Checked ${Object.keys(this._rooms).length} regular rooms and ${wsCount} WebSocket connections`);
        return null;
    }
    
    // 清理房间中的重复成员（只保留最新的）
    _deduplicateRoomMembers(roomCode) {
        const room = this._privateRooms[roomCode];
        if (!room) return;
        
        console.log(`开始清理房间 ${roomCode} 的重复成员`);
        console.log(`清理前成员数: ${room.members.size}`);
        
        const activePeers = new Set();
        const toRemove = [];
        
        // 收集所有活跃的peer ID（包括WebSocket连接）
        for (const ip in this._rooms) {
            for (const peerId in this._rooms[ip]) {
                const peer = this._rooms[ip][peerId];
                // 只有WebSocket连接正常的才算活跃
                if (peer && peer.socket && peer.socket.readyState === 1) {
                    activePeers.add(peerId);
                }
            }
        }
        
        console.log(`发现活跃连接: ${Array.from(activePeers)}`);
        
        // 检查房间成员，移除不活跃的（但要保留最近创建的成员）
        const now = Date.now();
        for (const [memberId, memberInfo] of room.members) {
            // 如果成员是最近加入的（2分钟内），不要移除
            const memberAge = now - (memberInfo.joinedAt || 0);
            if (memberAge < 120000) {
                console.log(`保留新成员: ${memberId} (加入时间: ${memberAge}ms 前)`);
                continue;
            }
            
            // 如果是房主，更加保守，保留更长时间（5分钟）
            if (memberInfo.isHost && memberAge < 300000) {
                console.log(`保留房主: ${memberId} (房主，加入时间: ${memberAge}ms 前)`);
                continue;
            }
            
            if (!activePeers.has(memberId)) {
                console.log(`发现不活跃成员: ${memberId}, 将被移除`);
                toRemove.push(memberId);
            }
        }
        
        // 移除不活跃的成员
        toRemove.forEach(memberId => {
            room.members.delete(memberId);
        });
        
        console.log(`清理后成员数: ${room.members.size}`);
        console.log(`剩余成员: ${Array.from(room.members.keys())}`);
        
        return toRemove.length > 0;
    }
    
    // 清理用户的私密房间成员身份（当WebSocket连接断开时）
    _cleanupPrivateRoomMembership(peer) {
        if (!peer.currentRoom) return;
        
        const roomCode = peer.currentRoom;
        const room = this._privateRooms[roomCode];
        
        if (!room || !room.members.has(peer.id)) return;
        
        console.log(`Cleaning up private room membership for ${peer.id} in room ${roomCode}`);
        
        const memberInfo = room.members.get(peer.id);
        const isHost = memberInfo.isHost;
        
        // 记录最近断开连接的用户信息，用于重连检测（5分钟内有效）
        this._recentlyDisconnected.set(peer.id, {
            roomCode: roomCode,
            memberInfo: memberInfo,
            disconnectTime: Date.now(),
            isHost: isHost
        });
        
        // 5分钟后清理记录
        const cleanupTimerId = `cleanup_reconnect_${peer.id}_${Date.now()}`;
        const cleanupTimer = setTimeout(() => {
            this._recentlyDisconnected.delete(peer.id);
            this._timers.delete(cleanupTimerId);
        }, 5 * 60 * 1000);
        
        // 将计时器添加到管理列表
        this._timers.set(cleanupTimerId, {
            timer: cleanupTimer,
            type: 'cleanup_reconnect',
            peerId: peer.id,
            createdAt: Date.now(),
            expiresAt: Date.now() + (5 * 60 * 1000)
        });
        
        room.members.delete(peer.id);
        peer.currentRoom = null;
        
        // 通知其他成员有成员离开（但不是明确退出，而是连接断开）
        this._broadcastToRoom(roomCode, {
            type: 'room-member-left',
            memberId: peer.id,
            reason: 'disconnected',
            room: {
                code: room.code,
                name: room.name,
                maxMembers: room.maxMembers,
                isPrivate: room.isPrivate,
                members: Array.from(room.members.values())
            }
        });
        
        // 如果房主断开连接，暂时不解散房间，给5分钟重连时间
        if (isHost) {
            console.log(`Host ${peer.id} disconnected from room ${roomCode}, giving 5 minutes to reconnect`);
            
            // 5分钟后如果房主还没重连，则解散房间
            const disbandTimerId = `disband_room_${roomCode}_${peer.id}_${Date.now()}`;
            const disbandTimer = setTimeout(() => {
                // 检查房主是否已经重连
                const currentRoom = this._privateRooms[roomCode];
                if (currentRoom && (!currentRoom.members.has(peer.id) || !currentRoom.members.get(peer.id).isHost)) {
                    console.log(`Host ${peer.id} did not reconnect to room ${roomCode}, disbanding room`);
                    this._broadcastToRoom(roomCode, {
                        type: 'room-disbanded',
                        reason: 'Host did not reconnect'
                    });
                    
                    // 清理所有成员的房间状态
                    if (currentRoom) {
                        currentRoom.members.forEach((member, memberId) => {
                            const memberPeer = this._findPeerById(memberId);
                            if (memberPeer) {
                                memberPeer.currentRoom = null;
                            }
                        });
                        delete this._privateRooms[roomCode];
                    }
                }
                // 清理计时器引用
                this._timers.delete(disbandTimerId);
            }, 5 * 60 * 1000);
            
            // 将计时器添加到管理列表
            this._timers.set(disbandTimerId, {
                timer: disbandTimer,
                type: 'disband_room',
                roomCode: roomCode,
                hostId: peer.id,
                createdAt: Date.now(),
                expiresAt: Date.now() + (5 * 60 * 1000)
            });
        } else if (room.members.size === 0) {
            // 如果不是房主断开，且房间为空，立即解散
            console.log(`Room ${roomCode} is empty, disbanding`);
            this._broadcastToRoom(roomCode, {
                type: 'room-disbanded',
                reason: 'Room is empty'
            });
            delete this._privateRooms[roomCode];
        }
    }
    
    // 处理房间文件共享
    _handleRoomFileShared(sender, message) {
        const room = this._privateRooms[message.roomCode];
        
        if (!room || !room.members.has(sender.id)) {
            this._send(sender, {
                type: 'room-error',
                error: 'You are not in this room.'
            });
            return;
        }
        
        // 保存文件到房间
        if (!room.files) {
            room.files = new Map();
        }
        
        const fileRecord = {
            id: message.fileInfo.id,
            info: message.fileInfo,
            data: message.fileData,
            uploadedBy: sender.id,
            uploadedAt: Date.now()
        };
        
        room.files.set(message.fileInfo.id, fileRecord);
        
        // 广播文件共享消息和数据给房间内其他成员（无文件大小限制）
        this._broadcastToRoom(message.roomCode, {
            type: 'room-file-shared',
            roomCode: message.roomCode,
            fileInfo: message.fileInfo,
            fileData: message.fileData // 包含文件数据
        }, sender.id);
        
        const fileDataSize = message.fileData ? message.fileData.length : 0;
        console.log(`Room ${message.roomCode}: ${sender.name.displayName} shared file: ${message.fileInfo.name} (${fileDataSize} bytes)`);
        console.log(`Room ${message.roomCode} now has ${room.files.size} files`);
    }
    
    // 处理房间文件删除
    _handleRoomFileRemoved(sender, message) {
        const room = this._privateRooms[message.roomCode];
        
        if (!room || !room.members.has(sender.id)) {
            this._send(sender, {
                type: 'room-error',
                error: 'You are not in this room.'
            });
            return;
        }
        
        // 广播文件删除消息给房间内其他成员
        this._broadcastToRoom(message.roomCode, {
            type: 'room-file-removed',
            roomCode: message.roomCode,
            fileId: message.fileId
        }, sender.id);
        
        console.log(`Room ${message.roomCode}: ${sender.name.displayName} removed file: ${message.fileId}`);
    }
}



class Peer {

    constructor(socket, request) {
        // set socket
        this.socket = socket;


        // set remote ip
        this._setIP(request);

        // set peer id
        this._setPeerId(request)
        // is WebRTC supported ?
        this.rtcSupported = request.url.indexOf('webrtc') > -1;
        // set name 
        this._setName(request);
        // for keepalive
        this.timerId = 0;
        this.lastBeat = Date.now();
    }

    _setIP(request) {
        if (request.headers['x-forwarded-for']) {
            this.ip = request.headers['x-forwarded-for'].split(/\s*,\s*/)[0];
        } else {
            this.ip = request.connection.remoteAddress;
        }
        // IPv4 and IPv6 use different values to refer to localhost
        if (this.ip == '::1' || this.ip == '::ffff:127.0.0.1') {
            this.ip = '127.0.0.1';
        }
    }

    _setPeerId(request) {
        if (request.peerId) {
            this.id = request.peerId;
        } else {
            // 正确解析cookie中的peerid
            const cookies = request.headers.cookie || '';
            const peerIdMatch = cookies.match(/(?:^|;\s*)peerid=([^;]+)/);
            this.id = peerIdMatch ? peerIdMatch[1] : Peer.uuid();
        }
    }

    toString() {
        return `<Peer id=${this.id} ip=${this.ip} rtcSupported=${this.rtcSupported}>`
    }

    _setName(req) {
        let ua = parser(req.headers['user-agent']);


        let deviceName = '';
        
        if (ua.os && ua.os.name) {
            deviceName = ua.os.name.replace('Mac OS', 'Mac') + ' ';
        }
        
        if (ua.device.model) {
            deviceName += ua.device.model;
        } else {
            deviceName += ua.browser.name;
        }

        if(!deviceName)
            deviceName = 'Unknown Device';

        const displayName = uniqueNamesGenerator({
            length: 2,
            separator: ' ',
            dictionaries: [colors, animals],
            style: 'capital',
            seed: Date.now() + Math.random() * 1000000  // 使用时间戳+随机数作为种子，每次都不同
        })

        this.name = {
            model: ua.device.model,
            os: ua.os.name,
            browser: ua.browser.name,
            type: ua.device.type,
            deviceName,
            displayName
        };
    }

    getInfo() {
        return {
            id: this.id,
            name: this.name,
            rtcSupported: this.rtcSupported
        }
    }

    // return uuid of form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    static uuid() {
        let uuid = '',
            ii;
        for (ii = 0; ii < 32; ii += 1) {
            switch (ii) {
                case 8:
                case 20:
                    uuid += '-';
                    uuid += (Math.random() * 16 | 0).toString(16);
                    break;
                case 12:
                    uuid += '-';
                    uuid += '4';
                    break;
                case 16:
                    uuid += '-';
                    uuid += (Math.random() * 4 | 8).toString(16);
                    break;
                default:
                    uuid += (Math.random() * 16 | 0).toString(16);
            }
        }
        return uuid;
    };
}

Object.defineProperty(String.prototype, 'hashCode', {
  value: function() {
    var hash = 0, i, chr;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
});

const dropShareServer = new DropShareServer();

// Local-only debug endpoints
function isLocalRequest(req) {
    const ip = (req.ip || '').replace('::ffff:', '');
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}

app.get('/debug/peers', (req, res) => {
    if (!isLocalRequest(req)) return res.status(403).send('Forbidden');
    res.json(dropShareServer.getPeersOverview());
});

app.get('/debug/kill/:peerId', (req, res) => {
    if (!isLocalRequest(req)) return res.status(403).send('Forbidden');
    const id = req.params.peerId;
    let removed = false;
    for (const ip in dropShareServer._rooms) {
        const room = dropShareServer._rooms[ip];
        if (room && room[id]) {
            try {
                const p = room[id];
                if (p && p.socket) p.socket.terminate();
            } catch (_) {}
            delete room[id];
            removed = true;
        }
    }
    res.json({ ok: true, removed });
});

app.get('/debug/clear', (req, res) => {
    if (!isLocalRequest(req)) return res.status(403).send('Forbidden');
    dropShareServer._rooms = {};
    res.json({ ok: true });
});
