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
    
    // 记录内存使用情况
    const memUsage = process.memoryUsage()
    console.log('Memory usage:')
    console.log(`RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB`)
    console.log(`Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`)
    console.log(`Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`)
    
    // 不要退出进程，继续运行
    console.log('Server continuing to run...')
})

process.on('unhandledRejection', (reason, promise) => {
    console.log('----- Unhandled Rejection at -----')
    console.log('Promise:', promise)
    console.log('Reason:', reason)
    console.log('Time:', new Date().toISOString())
    
    // 不要退出进程
    console.log('Server continuing to run...')
})

const express = require('express');
const RateLimit = require('express-rate-limit');
const http = require('http');

const limiter = RateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 5 minutes)
	message: 'Too many requests from this IP Address, please try again after 5 minutes.',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const app = express();
const port = process.env.PORT || 8080;
const publicRun = process.argv[2];

app.use(limiter);

// ensure correct client ip and not the ip of the reverse proxy is used for rate limiting on render.com
// see https://github.com/express-rate-limit/express-rate-limit#troubleshooting-proxy-issues
app.set('trust proxy', 5);

app.use(express.static('public'));

app.use(function(req, res) {
    res.redirect('/');
});

// 创建HTTP服务器
const server = http.createServer(app);

// 简化监听方式，添加错误处理
server.listen(port, '0.0.0.0', () => {
    console.log('---------------------------------------');
    console.log('DropShare 已启动，监听所有网络接口');
    console.log('端口: ' + port);
    console.log('请访问: http://localhost:' + port);
    console.log('---------------------------------------');
})
.on('error', (err) => {
    console.error('服务器启动失败:');
    console.error(err);
    if(err.code === 'EADDRINUSE') {
        console.error(`端口 ${port} 已被占用，请尝试使用不同的端口`);
}
});

const parser = require('ua-parser-js');
const { uniqueNamesGenerator, animals, colors } = require('unique-names-generator');

class DropShareServer {

    constructor() {
        const WebSocket = require('ws');
        this._wss = new WebSocket.Server({ server });
        this._wss.on('connection', (socket, request) => this._onConnection(new Peer(socket, request)));
        this._wss.on('headers', (headers, response) => this._onHeaders(headers, response));

        this._rooms = {};
        this._privateRooms = {}; // 私密房间存储
        this._recentlyDisconnected = new Map(); // 跟踪最近断开连接的用户，用于重连检测
        this._timers = new Map(); // 存储所有定时器用于清理

        // 添加服务器统计监控
        this._stats = {
            connections: 0,
            totalConnections: 0,
            startTime: Date.now()
        };

        // 每5分钟输出服务器状态
        this._statsTimer = setInterval(() => {
            this._logServerStats();
            this._cleanupExpiredData(); // 定期清理过期数据
        }, 5 * 60 * 1000);

        // 添加服务器关闭时的清理机制
        this._setupCleanupHandlers();

        console.log('DropShare is running on port', port);
    }

    // 设置服务器关闭时的清理处理器
    _setupCleanupHandlers() {
        const cleanup = () => {
            console.log('=== 服务器关闭，清理资源 ===');
            try {
                // 清理主要统计计时器
                if (this._statsTimer) {
                    clearInterval(this._statsTimer);
                    console.log('主统计计时器已清理');
                }
                
                // 清理所有自定义计时器
                let cleanedCount = 0;
                for (const [timerId, timerData] of this._timers) {
                    clearTimeout(timerData.timer);
                    cleanedCount++;
                }
                this._timers.clear();
                console.log(`已清理 ${cleanedCount} 个自定义计时器`);
                
                // 清理所有 peer 的 keepalive 计时器
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
                console.log(`已清理 ${peerTimerCount} 个 peer keepalive 计时器`);
                
                console.log('所有资源清理完成');
            } catch (error) {
                console.error('清理资源时发生错误:', error);
            }
        };

        // 监听进程退出信号
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        process.on('exit', cleanup);
    }

    _logServerStats() {
        const uptime = Math.round((Date.now() - this._stats.startTime) / 1000 / 60); // 分钟
        const memUsage = process.memoryUsage();
        
        console.log('=== Server Stats ===');
        console.log(`Uptime: ${uptime} minutes`);
        console.log(`Current connections: ${this._stats.connections}`);
        console.log(`Total connections: ${this._stats.totalConnections}`);
        console.log(`Active rooms: ${Object.keys(this._rooms).length}`);
        console.log(`Private rooms: ${Object.keys(this._privateRooms).length}`);
        console.log(`Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
        console.log('===================');
    }

    // 清理过期数据，防止内存泄漏
    _cleanupExpiredData() {
        try {
            console.log('=== 开始清理过期数据 ===');
            
            // 清理过期的重连记录（超过10分钟）
            const now = Date.now();
            const expiredThreshold = 10 * 60 * 1000; // 10分钟
            let cleanedReconnections = 0;
            
            for (const [peerId, data] of this._recentlyDisconnected) {
                if (now - data.disconnectTime > expiredThreshold) {
                    this._recentlyDisconnected.delete(peerId);
                    cleanedReconnections++;
                }
            }
            
            // 清理过期的计时器
            let cleanedTimers = 0;
            const timerTypes = {};
            for (const [timerId, timerData] of this._timers) {
                if (timerData.expiresAt && now > timerData.expiresAt) {
                    clearTimeout(timerData.timer);
                    this._timers.delete(timerId);
                    cleanedTimers++;
                    
                    // 统计计时器类型
                    timerTypes[timerData.type] = (timerTypes[timerData.type] || 0) + 1;
                }
            }
            
            if (cleanedTimers > 0) {
                console.log(`清理的计时器类型:`, timerTypes);
            }
            
            // 清理空的房间
            let cleanedRooms = 0;
            for (const [ip, room] of Object.entries(this._rooms)) {
                if (Object.keys(room).length === 0) {
                    delete this._rooms[ip];
                    cleanedRooms++;
                }
            }
            
            // 清理空的私密房间
            let cleanedPrivateRooms = 0;
            for (const [roomCode, room] of Object.entries(this._privateRooms)) {
                if (room.members.size === 0) {
                    delete this._privateRooms[roomCode];
                    cleanedPrivateRooms++;
                }
            }
            
            console.log(`清理完成 - 重连记录: ${cleanedReconnections}, 计时器: ${cleanedTimers}, 房间: ${cleanedRooms}, 私密房间: ${cleanedPrivateRooms}`);
            console.log(`当前状态 - 重连记录: ${this._recentlyDisconnected.size}, 计时器: ${this._timers.size}, 房间: ${Object.keys(this._rooms).length}, 私密房间: ${Object.keys(this._privateRooms).length}`);
        } catch (error) {
            console.error('清理数据时发生错误:', error);
        }
    }

    _onConnection(peer) {
        try {
            // 更新连接统计
            this._stats.connections++;
            this._stats.totalConnections++;
            console.log(`New connection: ${peer.id} (total: ${this._stats.connections})`);

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
                    this._stats.connections--;
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

    _onHeaders(headers, response) {
        if (response.headers.cookie && response.headers.cookie.indexOf('peerid=') > -1) return;
        response.peerId = Peer.uuid();
        headers.push('Set-Cookie: peerid=' + response.peerId + "; SameSite=Strict; Secure");
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
        switch (message.type) {
            case 'disconnect':
                this._leaveRoom(sender);
                break;
            case 'pong':
                sender.lastBeat = Date.now();
                break;
            case 'create-room':
                this._createPrivateRoom(sender, message.roomSettings);
                break;
            case 'join-room':
                this._joinPrivateRoom(sender, message.roomCode, message.password);
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
        }

        // relay message to recipient
        if (message.to && this._rooms[sender.ip]) {
            const recipientId = message.to; // TODO: sanitize
            const recipient = this._rooms[sender.ip][recipientId];
            if (recipient) {
                delete message.to;
                // add sender id
                message.sender = sender.id;
                this._send(recipient, message);
            }
            return;
        }
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

        // notify peer about the other peers
        const otherPeers = [];
        for (const otherPeerId in this._rooms[peer.ip]) {
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
                console.warn(`发送消息失败: WebSocket状态异常 (${peer.socket.readyState}) for peer ${peer.id}`);
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

    // 私密房间功能方法
    _createPrivateRoom(host, roomSettings) {
        const roomCode = roomSettings.code;
        
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
    }

    _joinPrivateRoom(peer, roomCode, password) {
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

        // 通知其他成员有新成员加入
        this._broadcastToRoom(roomCode, {
            type: 'room-member-joined',
            member: memberInfo
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
            memberId: peer.id
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
            reason: 'kicked'
        });
    }

    _broadcastToRoom(roomCode, message, excludePeerId = null) {
        const room = this._privateRooms[roomCode];
        if (!room) return;

        room.members.forEach((member, memberId) => {
            if (memberId !== excludePeerId) {
                const peer = this._findPeerById(memberId);
                if (peer) {
                    this._send(peer, message);
                }
            }
        });
    }

    _findPeerById(peerId) {
        for (const ip in this._rooms) {
            if (this._rooms[ip][peerId]) {
                return this._rooms[ip][peerId];
            }
        }
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
        
        // 收集所有活跃的peer ID
        for (const ip in this._rooms) {
            for (const peerId in this._rooms[ip]) {
                activePeers.add(peerId);
            }
        }
        
        // 检查房间成员，移除不活跃的
        for (const [memberId, memberInfo] of room.members) {
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
            reason: 'disconnected'
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
        
        // 检查文件数据大小，避免传输过大的数据
        const fileDataSize = message.fileData ? message.fileData.length : 0;
        const maxSize = 15 * 1024 * 1024; // 15MB limit for WebSocket message
        
        if (fileDataSize > maxSize) {
            console.log(`File ${message.fileInfo.name} is too large (${fileDataSize} bytes), sending metadata only`);
            // 只广播文件信息，不包含文件数据
            this._broadcastToRoom(message.roomCode, {
                type: 'room-file-shared',
                roomCode: message.roomCode,
                fileInfo: message.fileInfo
            }, sender.id);
        } else {
            // 广播文件共享消息和数据给房间内其他成员
            this._broadcastToRoom(message.roomCode, {
                type: 'room-file-shared',
                roomCode: message.roomCode,
                fileInfo: message.fileInfo,
                fileData: message.fileData // 包含文件数据
            }, sender.id);
        }
        
        console.log(`Room ${message.roomCode}: ${sender.name.displayName} shared file: ${message.fileInfo.name} (${fileDataSize > 0 ? 'with data' : 'metadata only'})`);
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
            this.id = request.headers.cookie.replace('peerid=', '');
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
            seed: this.id.hashCode()
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

new DropShareServer();
