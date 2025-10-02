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
        ws.onopen = e => {
            console.log('WS: server connected');
            Events.fire('peer-connected');
        };
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
                break;
            // 房间相关消息处理
            case 'room-created':
                Events.fire('room-created', msg);
                break;
            case 'room-joined':
                Events.fire('room-joined', msg);
                break;
            case 'room-left':
                Events.fire('room-left', msg);
                break;
            case 'room-error':
                Events.fire('room-error', msg);
                break;
            case 'room-member-joined':
                Events.fire('room-member-joined', msg);
                break;
            case 'room-member-left':
                Events.fire('room-member-left', msg);
                break;
            case 'room-disbanded':
                Events.fire('room-disbanded', msg);
                break;
            case 'room-kicked':
                Events.fire('room-kicked', msg);
                break;
            case 'room-file-shared':
                Events.fire('room-file-shared', msg);
                break;
            case 'room-file-removed':
                Events.fire('room-file-removed', msg);
                break;
            default:
                console.error('WS: unkown message type', msg);
        }
    }

    send(message) {
        if (!this._isConnected()) return;
        this._socket.send(JSON.stringify(message));
    }

    _endpoint() {
        // hack to detect if deployment or development environment
        const protocol = location.protocol.startsWith('https') ? 'wss' : 'ws';
        const webrtc = window.isRtcSupported ? '/webrtc' : '/fallback';
        // Always use root path for WebSocket server to avoid path issues
        const url = protocol + '://' + location.host + '/server' + webrtc;
        console.log('🔗 WebSocket endpoint:', url);
        return url;
    }

    _disconnect() {
        this.send({ type: 'disconnect' });
        this._socket.onclose = null;
        this._socket.close();
    }

    _onDisconnect() {
        console.log('WS: server disconnected');
        Events.fire('peer-disconnected');
        Events.fire('notify-user', 'Connection lost. Retry in 3 seconds...');
        clearTimeout(this._reconnectTimer);
        this._reconnectTimer = setTimeout(_ => this._connect(), 3000);
    }

    _onVisibilityChange() {
        if (document.hidden) return;
        this._connect();
    }

    _isConnected() {
        return this._socket && this._socket.readyState === this._socket.OPEN;
    }

    _isConnecting() {
        return this._socket && this._socket.readyState === this._socket.CONNECTING;
    }
}

class Peer {

    constructor(serverConnection, peerId) {
        this._server = serverConnection;
        this._peerId = peerId;
        this._filesQueue = [];
        this._busy = false;
    }

    sendJSON(message) {
        this._send(JSON.stringify(message));
    }

    sendFiles(files) {
        for (let i = 0; i < files.length; i++) {
            this._filesQueue.push(files[i]);
        }
        if (this._busy) return;
        this._dequeueFile();
    }

    _dequeueFile() {
        if (!this._filesQueue.length) return;
        this._busy = true;
        const file = this._filesQueue.shift();
        this._sendFile(file);
    }

    _sendFile(file) {
        this.sendJSON({
            type: 'header',
            name: file.name,
            mime: file.type,
            size: file.size
        });
        this._chunker = new FileChunker(file,
            chunk => this._send(chunk),
            offset => this._onPartitionEnd(offset));
        this._chunker.nextPartition();
    }

    _onPartitionEnd(offset) {
        this.sendJSON({ type: 'partition', offset: offset });
    }

    _onReceivedPartitionEnd(offset) {
        this.sendJSON({ type: 'partition-received', offset: offset });
    }

    _sendNextPartition() {
        if (!this._chunker || this._chunker.isFileEnd()) return;
        this._chunker.nextPartition();
    }

    _sendProgress(progress) {
        this.sendJSON({ type: 'progress', progress: progress });
    }

    _onMessage(message) {
        if (typeof message !== 'string') {
            this._onChunkReceived(message);
            return;
        }
        message = JSON.parse(message);
        console.log('RTC:', message);
        switch (message.type) {
            case 'header':
                this._onFileHeader(message);
                break;
            case 'partition':
                this._onReceivedPartitionEnd(message);
                break;
            case 'partition-received':
                this._sendNextPartition();
                break;
            case 'progress':
                this._onDownloadProgress(message.progress);
                break;
            case 'transfer-complete':
                this._onTransferCompleted();
                break;
            case 'text':
                this._onTextReceived(message);
                break;
        }
    }

    _onFileHeader(header) {
        this._lastProgress = 0;
        this._digester = new FileDigester({
            name: header.name,
            mime: header.mime,
            size: header.size
        }, file => this._onFileReceived(file));
    }

    _onChunkReceived(chunk) {
        if(!chunk.byteLength) return;
        
        this._digester.unchunk(chunk);
        const progress = this._digester.progress;
        this._onDownloadProgress(progress);

        // occasionally notify sender about our progress 
        if (progress - this._lastProgress < 0.01) return;
        this._lastProgress = progress;
        this._sendProgress(progress);
    }

    _onDownloadProgress(progress) {
        Events.fire('file-progress', { sender: this._peerId, progress: progress });
    }

    _onFileReceived(proxyFile) {
        Events.fire('file-received', proxyFile);
        this.sendJSON({ type: 'transfer-complete' });
    }

    _onTransferCompleted() {
        this._onDownloadProgress(1);
        this._reader = null;
        this._busy = false;
        this._dequeueFile();
        Events.fire('notify-user', 'File transfer completed.');
    }

    sendText(text) {
        const unescaped = btoa(unescape(encodeURIComponent(text)));
        this.sendJSON({ type: 'text', text: unescaped });
    }

    _onTextReceived(message) {
        const escaped = decodeURIComponent(escape(atob(message.text)));
        Events.fire('text-received', { text: escaped, sender: this._peerId });
    }
}

class RTCPeer extends Peer {

    constructor(serverConnection, peerId) {
        super(serverConnection, peerId);
        if (!peerId) return; // we will listen for a caller
        this._connect(peerId, true);
    }

    _connect(peerId, isCaller) {
        if (!this._conn) this._openConnection(peerId, isCaller);

        if (isCaller) {
            this._openChannel();
        } else {
            this._conn.ondatachannel = e => this._onChannelOpened(e);
        }
    }

    _openConnection(peerId, isCaller) {
        this._isCaller = isCaller;
        this._peerId = peerId;
        this._conn = new RTCPeerConnection(RTCPeer.config);
        this._conn.onicecandidate = e => this._onIceCandidate(e);
        this._conn.onconnectionstatechange = e => this._onConnectionStateChange(e);
        this._conn.oniceconnectionstatechange = e => this._onIceConnectionStateChange(e);
    }

    _openChannel() {
        const channel = this._conn.createDataChannel('data-channel', { 
            ordered: true,
            reliable: true // Obsolete. See https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel/reliable
        });
        channel.onopen = e => this._onChannelOpened(e);
        this._conn.createOffer().then(d => this._onDescription(d)).catch(e => this._onError(e));
    }

    _onDescription(description) {
        // description.sdp = description.sdp.replace('b=AS:30', 'b=AS:1638400');
        this._conn.setLocalDescription(description)
            .then(_ => this._sendSignal({ sdp: description }))
            .catch(e => this._onError(e));
    }

    _onIceCandidate(event) {
        if (!event.candidate) return;
        this._sendSignal({ ice: event.candidate });
    }

    onServerMessage(message) {
        if (!this._conn) this._connect(message.sender, false);

        if (message.sdp) {
            this._conn.setRemoteDescription(new RTCSessionDescription(message.sdp))
                .then( _ => {
                    if (message.sdp.type === 'offer') {
                        return this._conn.createAnswer()
                            .then(d => this._onDescription(d));
                    }
                })
                .catch(e => this._onError(e));
        } else if (message.ice) {
            if (this._conn.remoteDescription) {
                this._conn.addIceCandidate(new RTCIceCandidate(message.ice))
                    .catch(e => console.warn('Failed to add ICE candidate:', e));
            } else {
                console.warn('⚠️ Ignoring ICE candidate - no remote description set yet');
            }
        }
    }

    _onChannelOpened(event) {
        console.log('RTC: channel opened with', this._peerId);
        const channel = event.channel || event.target;
        channel.binaryType = 'arraybuffer';
        channel.onmessage = e => this._onMessage(e.data);
        channel.onclose = e => this._onChannelClosed();
        this._channel = channel;
    }

    _onChannelClosed() {
        console.log('RTC: channel closed', this._peerId);
        // Only reconnect if we're the caller and haven't explicitly closed
        if (!this._isCaller || !this._conn) return;
        // Add a small delay to avoid rapid reconnection attempts
        setTimeout(() => {
            if (this._conn && this._conn.connectionState === 'failed') {
                this._connect(this._peerId, true);
            }
        }, 1000);
    }

    _onConnectionStateChange(e) {
        if (!this._conn) return; // Guard against null connection
        console.log('🔗 RTC Connection State:', this._conn.connectionState);
        switch (this._conn.connectionState) {
            case 'connected':
                console.log('✅ RTC: peer connection established');
                break;
            case 'connecting':
                console.log('🔄 RTC: connecting to peer...');
                break;
            case 'disconnected':
                console.log('🔌 RTC: peer connection disconnected - attempting restart');
                this._resetConnection();
                // Only attempt reconnect for callers after a delay
                if (this._isCaller) {
                    setTimeout(() => {
                        console.log('🔄 RTC: attempting reconnection...');
                        this._connect(this._peerId, true);
                    }, 3000);
                }
                break;
            case 'failed':
                console.log('❌ RTC: peer connection failed');
                this._resetConnection();
                // Only attempt reconnect for callers after a delay
                if (this._isCaller) {
                    setTimeout(() => {
                        console.log('🔄 RTC: attempting reconnection...');
                        this._connect(this._peerId, true);
                    }, 5000);
                }
                break;
            case 'closed':
                console.log('🔒 RTC: peer connection closed');
                break;
            default:
                console.log('🔍 RTC Connection State:', this._conn.connectionState);
        }
    }

    _onIceConnectionStateChange() {
        console.log('🔗 ICE Connection State:', this._conn.iceConnectionState);
        switch (this._conn.iceConnectionState) {
            case 'connected':
                console.log('✅ ICE connection established');
                break;
            case 'completed':
                console.log('✅ ICE gathering completed');
                break;
            case 'disconnected':
                console.log('🔌 ICE connection disconnected - attempting restart');
                // Reset connection and try again for disconnected state
                this._resetConnection();
                setTimeout(() => {
                    if (this._isCaller) {
                        this._connect(this._peerId, true);
                    }
                }, 3000);
                break;
            case 'failed':
                console.error('❌ ICE connection failed - attempting restart');
                // Reset connection and try again
                this._resetConnection();
                setTimeout(() => {
                    if (this._isCaller) {
                        this._connect(this._peerId, true);
                    }
                }, 5000);
                break;
            case 'checking':
                console.log('🔄 ICE connection checking...');
                break;
            case 'new':
                console.log('🆕 ICE connection new');
                break;
            default:
                console.log('🔍 ICE Connection State:', this._conn.iceConnectionState);
        }
    }

    _onError(error) {
        console.error(error);
    }

    _send(message) {
        if (!this._channel) return this.refresh();
        
        // Check if the channel is in a ready state before sending
        if (this._channel.readyState !== 'open') {
            console.warn('WebRTC channel not ready, state:', this._channel.readyState);
            return;
        }
        
        try {
            this._channel.send(message);
        } catch (error) {
            console.error('Error sending message through WebRTC channel:', error);
            // If sending fails, try to refresh the connection
            this.refresh();
        }
    }

    _sendSignal(signal) {
        signal.type = 'signal';
        signal.to = this._peerId;
        this._server.send(signal);
    }

    refresh() {
        // check if channel is open. otherwise create one
        if (this._isConnected() || this._isConnecting()) return;
        this._connect(this._peerId, this._isCaller);
    }

    _isConnected() {
        return this._channel && this._channel.readyState === 'open';
    }

    _isConnecting() {
        return this._channel && this._channel.readyState === 'connecting';
    }
    
    _resetConnection() {
        console.log('🔄 Resetting WebRTC connection');
        
        // Close data channel first
        if (this._channel) {
            try {
                this._channel.close();
            } catch (e) {
                console.warn('Error closing data channel:', e);
            }
            this._channel = null;
        }
        
        // Close peer connection
        if (this._conn) {
            try {
                this._conn.close();
            } catch (e) {
                console.warn('Error closing peer connection:', e);
            }
            this._conn = null;
        }
    }
}

class PeersManager {

    constructor(serverConnection) {
        this.peers = {};
        this._server = serverConnection;
        Events.on('signal', e => this._onMessage(e.detail));
        Events.on('peers', e => this._onPeers(e.detail));
        Events.on('files-selected', e => this._onFilesSelected(e.detail));
        Events.on('send-text', e => this._onSendText(e.detail));
        Events.on('peer-left', e => this._onPeerLeft(e.detail));
    }

    _onMessage(message) {
        if (!this.peers[message.sender]) {
            this.peers[message.sender] = new RTCPeer(this._server);
        }
        this.peers[message.sender].onServerMessage(message);
    }

    _onPeers(peers) {
        peers.forEach(peer => {
            if (this.peers[peer.id]) {
                this.peers[peer.id].refresh();
                return;
            }
            if (window.isRtcSupported && peer.rtcSupported) {
                this.peers[peer.id] = new RTCPeer(this._server, peer.id);
            } else {
                this.peers[peer.id] = new WSPeer(this._server, peer.id);
            }
        })
    }

    sendTo(peerId, message) {
        this.peers[peerId].send(message);
    }

    _onFilesSelected(message) {
        this.peers[message.to].sendFiles(message.files);
    }

    _onSendText(message) {
        this.peers[message.to].sendText(message.text);
    }

    _onPeerLeft(peerId) {
        const peer = this.peers[peerId];
        delete this.peers[peerId];
        if (!peer || !peer._peer) return;
        peer._peer.close();
    }

}

class WSPeer extends Peer {

    _send(message) {
        message.to = this._peerId;
        this._server.send(message);
    }

    refresh() {
        // WebSocket peers don't need refreshing
    }
}

class FileChunker {

    constructor(file, onChunk, onPartitionEnd) {
        this._chunkSize = 64000; // 64 KB
        this._maxPartitionSize = 1e6; // 1 MB
        this._offset = 0;
        this._partitionSize = 0;
        this._file = file;
        this._onChunk = onChunk;
        this._onPartitionEnd = onPartitionEnd;
        this._reader = new FileReader();
        this._reader.addEventListener('load', e => this._onChunkRead(e.target.result));
    }

    nextPartition() {
        this._partitionSize = 0;
        this._readChunk();
    }

    _readChunk() {
        const chunk = this._file.slice(this._offset, this._offset + this._chunkSize);
        this._reader.readAsArrayBuffer(chunk);
    }

    _onChunkRead(chunk) {
        this._offset += chunk.byteLength;
        this._partitionSize += chunk.byteLength;
        this._onChunk(chunk);
        if (this.isFileEnd()) return;
        if (this._isPartitionEnd()) {
            this._onPartitionEnd(this._offset);
            return;
        }
        this._readChunk();
    }

    repeatPartition() {
        this._offset -= this._partitionSize;
        this._nextPartition();
    }

    _isPartitionEnd() {
        return this._partitionSize >= this._maxPartitionSize;
    }

    isFileEnd() {
        return this._offset >= this._file.size;
    }

    get progress() {
        return this._offset / this._file.size;
    }
}

class FileDigester {

    constructor(meta, callback) {
        this._buffer = [];
        this._bytesReceived = 0;
        this._size = meta.size;
        this._mime = meta.mime || 'application/octet-stream';
        this._name = meta.name;
        this._callback = callback;
    }

    unchunk(chunk) {
        this._buffer.push(chunk);
        this._bytesReceived += chunk.byteLength || chunk.size;
        const totalChunks = this._buffer.length;
        this.progress = this._bytesReceived / this._size;
        if (isNaN(this.progress)) this.progress = 1

        if (this._bytesReceived < this._size) return;
        // we are done
        let blob = new Blob(this._buffer, { type: this._mime });
        this._callback({
            name: this._name,
            mime: this._mime,
            size: this._size,
            blob: blob
        });
    }

}

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


RTCPeer.config = {
    'sdpSemantics': 'unified-plan',
    'iceServers': [
        {
            urls: 'stun:stun.l.google.com:19302'
        },
        {
            urls: 'stun:stun1.l.google.com:19302'
        },
        {
            urls: 'stun:stun2.l.google.com:19302'
        },
        {
            urls: 'stun:stun.cloudflare.com:3478'
        },
        {
            urls: 'stun:stun3.l.google.com:19302'
        }
    ],
    'iceCandidatePoolSize': 10
}

// Initialize network connection
let serverConnection, peersManager;

window.addEventListener('DOMContentLoaded', () => {
    serverConnection = new ServerConnection();
    peersManager = new PeersManager(serverConnection);
    
    // Expose network connection and event system globally for room manager use
    window.network = {
        serverConnection: serverConnection,
        peersManager: peersManager,
        Events: Events,
        send: function(message) {
            if (serverConnection && serverConnection.send) {
                serverConnection.send(message);
            } else {
                console.error('ServerConnection not available for sending message:', message);
            }
        },
        isConnected: function() {
            return serverConnection && serverConnection._isConnected();
        }
    };
    
    // Also expose Events globally for backward compatibility
    window.Events = Events;
    
    console.log('Network system initialization completed, Events and network exposed globally');
});

