const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const parser = require('ua-parser-js');
const { uniqueNamesGenerator, animals, colors } = require('unique-names-generator');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(function(req, res) {
    res.redirect('/');
});

const server = http.createServer(app);

class SimpleDropShareServer {
    constructor() {
        this._wss = new WebSocket.Server({ server });
        this._wss.on('connection', (socket, request) => this._onConnection(new Peer(socket, request)));
        this._rooms = {};
        console.log('Simple DropShare server initialized');
    }

    _onConnection(peer) {
        console.log(`New connection: ${peer.id}`);
        console.log(`📱 Generated device name: ${peer.name.displayName} (${peer.name.deviceName})`);
        this._joinRoom(peer);
        peer.socket.on('message', message => this._onMessage(peer, message));
        this._keepAlive(peer);

        // send displayName
        const displayNameMessage = {
            type: 'display-name',
            message: {
                displayName: peer.name.displayName,
                deviceName: peer.name.deviceName,
                peerId: peer.id
            }
        };
        console.log(`📡 Sending display-name message:`, displayNameMessage);
        this._send(peer, displayNameMessage);
    }

    _onMessage(sender, message) {
        // handle text messages
        if (typeof message !== 'string') return;
        message = JSON.parse(message);
        console.log('WS:', message.type, 'from', sender.id);

        switch (message.type) {
            case 'disconnect':
                this._leaveRoom(sender);
                break;
            case 'pong':
                sender.lastBeat = Date.now();
                break;
        }

        // relay message to recipient
        if (message.to && this._rooms[sender.ip]) {
            const recipient = this._rooms[sender.ip][message.to];
            if (recipient) {
                delete message.to;
                message.sender = sender.id;
                this._send(recipient, message);
            }
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
        if (!peer || !peer.socket) return;
        if (peer.socket.readyState !== 1) return; // 1 = OPEN
        
        try {
            peer.socket.send(JSON.stringify(message));
        } catch (error) {
            console.error('Send error:', error.message);
        }
    }

    _keepAlive(peer) {
        this._cancelKeepAlive(peer);
        const timeout = 30000;
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
        } else if (request.headers.cookie) {
            this.id = request.headers.cookie.replace('peerid=', '');
        } else {
            // Generate a random peer ID if no cookie is present
            this.id = Math.random().toString(36).substr(2, 16);
        }
    }

    toString() {
        return `<Peer id=${this.id} ip=${this.ip} rtcSupported=${this.rtcSupported}>`
    }

    _setName(req) {
        let ua = '';
        if (req.headers['user-agent']) {
            ua = parser(req.headers['user-agent']);
        }
        
        let deviceName = '';
        if (ua.os && ua.os.name) {
            deviceName = ua.os.name.replace('Mac OS', 'Mac') + ' ';
        }
        
        if (ua.device.model) {
            deviceName += ua.device.model;
        } else {
            deviceName += ua.browser.name;
        }
        
        if(!deviceName) deviceName = 'Unknown Device';

        const displayName = uniqueNamesGenerator({
            length: 2,
            separator: " ",
            dictionaries: [colors, animals],
            style: "capital",
            seed: this.id.hashCode()
        });

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
}

String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

const snapdrop = new SimpleDropShareServer();

server.listen(port, '0.0.0.0', () => {
    console.log('---------------------------------------');
    console.log('Simple DropShare started on port', port);
    console.log('Please visit: http://localhost:' + port);
    console.log('---------------------------------------');
});