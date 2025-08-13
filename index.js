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
    console.log(error)
    console.log('----- Exception origin -----')
    console.log(origin)
})
process.on('unhandledRejection', (reason, promise) => {
    console.log('----- Unhandled Rejection at -----')
    console.log(promise)
    console.log('----- Reason -----')
    console.log(reason)
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

        console.log('DropShare is running on port', port);
    }

    _onConnection(peer) {
        this._joinRoom(peer);
        peer.socket.on('message', message => this._onMessage(peer, message));
        this._keepAlive(peer);

        // send displayName
        this._send(peer, {
            type: 'display-name',
            message: {
                displayName: peer.name.displayName,
                deviceName: peer.name.deviceName
            }
        });
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
            return; // TODO: handle malformed JSON
        }

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
        }

        // relay message to recipient
        if (message.to && this._rooms[sender.ip]) {
            const recipientId = message.to; // TODO: sanitize
            const recipient = this._rooms[sender.ip][recipientId];
            delete message.to;
            // add sender id
            message.sender = sender.id;
            this._send(recipient, message);
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
        if (!peer) return;
        if (this._wss.readyState !== this._wss.OPEN) return;
        message = JSON.stringify(message);
        peer.socket.send(message, error => '');
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
        
        // 检查房间码是否已存在
        if (this._privateRooms[roomCode]) {
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

        // 检查用户是否已在房间中
        if (room.members.has(peer.id)) {
            this._send(peer, {
                type: 'room-error',
                error: 'You are already in this room.'
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
