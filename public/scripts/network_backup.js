// DropShare Network Module - Version 2.1 (Updated with WebRTC fixes)
window.URL = window.URL || window.webkitURL;
window.isRtcSupported = !!(window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection);

class ServerConnection {

    constructor() {
        this._reconnectAttempts = 0;
        this._maxReconnectAttempts = 10;
        this._heartbeatInterval = null;
        this._isManualDisconnect = false;
        this._connect();
        Events.on('beforeunload', e => this._disconnect());
        Events.on('pagehide', e => this._disconnect());
        document.addEventListener('visibilitychange', e => this._onVisibilityChange());
    }

    _connect() {
        clearTimeout(this._reconnectTimer);
        if (this._isConnected() || this._isConnecting()) return;
        
        console.log(`WS: Connecting... (attempt ${this._reconnectAttempts + 1}/${this._maxReconnectAttempts})`);
        
        const ws = new WebSocket(this._endpoint());
        ws.binaryType = 'arraybuffer';
        ws.onopen = e => this._onOpen();
        ws.onmessage = e => this._onMessage(e.data);
        ws.onclose = e => this._onDisconnect(e);
        ws.onerror = e => this._onError(e);
        this._socket = ws;
    }
    
    _onOpen() {
        console.log('WS: server connected');
        this._reconnectAttempts = 0;
        this._isManualDisconnect = false;
        this._startHeartbeat();
        Events.fire('notify-user', '');
    }
    
    _startHeartbeat() {
        this._stopHeartbeat();
        this._heartbeatInterval = setInterval(() => {
            if (this._isConnected()) {
                this.send({ type: 'ping' });
            } else {
                this._stopHeartbeat();
            }
        }, 30000); // 30秒心跳
    }
    
    _stopHeartbeat() {
        if (this._heartbeatInterval) {
            clearInterval(this._heartbeatInterval);
            this._heartbeatInterval = null;
        }
    }
    
    _onError(error) {
        console.error('WS: connection error', error);
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
                // Store current user's peer ID
                window.currentPeerId = msg.message.peerId || this._peerId;
                break;
            case 'pong':
                // Handle pong response from server
                break;
            case 'keep-alive':
                // Handle keep-alive messages
                break;
            case 'error':
                console.error('Server error:', msg.message);
                break;
            // Room-related message handling
            case 'room-created':
            case 'room-joined':
            case 'room-left':
            case 'room-error':
            case 'room-member-joined':
            case 'room-member-left':
            case 'room-disbanded':
            case 'room-kicked':
            case 'room-file-shared':
            case 'room-file-removed':
                // Forward room messages to room manager
                if (window.roomManager) {
                    window.roomManager.handleRoomMessage(msg);
                }
                
                // Also call the global room response handler
                if (window.handleRoomResponse) {
                    window.handleRoomResponse(msg);
                }
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
        return url;
    }

    _disconnect() {
        this._isManualDisconnect = true;
        this._stopHeartbeat();
        if (this._socket) {
            this.send({ type: 'disconnect' });
            this._socket.onclose = null;
            this._socket.close();
        }
    }

    _onDisconnect(event) {
        console.log('WS: server disconnected', event?.code, event?.reason);
        this._stopHeartbeat();
        
        if (this._isManualDisconnect) {
            console.log('WS: Manual disconnect, not reconnecting');
            return;
        }
        
        if (this._reconnectAttempts >= this._maxReconnectAttempts) {
            Events.fire('notify-user', 'Connection failed. Please refresh the page.');
            return;
        }
        
        this._reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this._reconnectAttempts - 1), 30000); // 指数退避，最多30秒
        
        Events.fire('notify-user', `Connection lost. Reconnecting in ${Math.ceil(delay/1000)} seconds... (${this._reconnectAttempts}/${this._maxReconnectAttempts})`);
        
        clearTimeout(this._reconnectTimer);
        this._reconnectTimer = setTimeout(() => this._connect(), delay);
    }

    _onVisibilityChange() {
        if (document.hidden) {
            // 页面隐藏时停止心跳，但保持连接
            console.log('WS: Page hidden, reducing activity');
            this._stopHeartbeat();
        } else {
            // 页面重新可见时恢复连接和心跳
            console.log('WS: Page visible, restoring connection');
            if (!this._isConnected()) {
                this._connect();
            } else {
                this._startHeartbeat();
            }
        }
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
        console.log('📥 File received:', proxyFile.name, 'Size:', proxyFile.size, 'Type:', proxyFile.mime);
        Events.fire('file-received', proxyFile);
        this.sendJSON({ type: 'transfer-complete' });
        
        // Track file receiving event
        if (window.trackFileReceived && proxyFile) {
            window.trackFileReceived(proxyFile.mime || 'unknown', proxyFile.size || 0);
        }
    }

    _onTransferCompleted() {
        this._onDownloadProgress(1);
        this._reader = null;
        this._busy = false;
        this._dequeueFile();
        // Events.fire('notify-user', 'File transfer completed.'); // Removed to prevent false notifications
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
        console.log('🔧 Opening connection to:', peerId?.substring(0,8), 'as caller:', isCaller);
        
        // 如果存在旧连接，先清理
        if (this._conn) {
            if (this._conn.connectionState !== 'closed' && this._conn.connectionState !== 'failed') {
                console.log('🔄 Connection already exists in state:', this._conn.connectionState);
                return;
            }
            console.log('🧹 Cleaning up old connection');
            this._conn.close();
        }
        
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
        channel.binaryType = 'arraybuffer';
        channel.onopen = e => this._onChannelOpened(e);
        this._conn.createOffer().then(d => this._onDescription(d)).catch(e => this._onError(e));
    }

    _onDescription(description) {
        // description.sdp = description.sdp.replace('b=AS:30', 'b=AS:1638400');
        console.log('🔧 Setting local description:', description.type, 'in state:', this._conn?.signalingState);
        
        this._conn.setLocalDescription(description)
            .then(_ => {
                console.log('✅ Local description set successfully');
                this._sendSignal({ sdp: description });
            })
            .catch(e => {
                console.error('❌ Failed to set local description:', e);
            });
    }

    _onIceCandidate(event) {
        if (!event.candidate) return;
        this._sendSignal({ ice: event.candidate });
    }

    onServerMessage(message) {
        console.log('📨 Server message:', message.type || 'unknown', 'from:', message.sender?.substring(0,8));
        
        if (!this._conn) {
            console.log('🔧 No connection exists, creating new one');
            this._connect(message.sender, false);
        } else {
            console.log('🔄 Connection exists in state:', this._conn.signalingState);
        }

        if (message.sdp) {
            console.log('📡 Received SDP:', message.sdp.type, 'current state:', this._conn.signalingState);
            
            this._conn.setRemoteDescription(new RTCSessionDescription(message.sdp))
                .then( _ => {
                    console.log('✅ Remote description set successfully');
                    if (message.sdp.type === 'offer') {
                        return this._conn.createAnswer()
                            .then(d => this._onDescription(d));
                    }
                })
                .catch(e => {
                    console.error('❌ Failed to set remote description:', e);
                    if (e.name === 'InvalidStateError' && message.sdp.type === 'offer') {
                        console.log('🔄 Restarting connection due to state error');
                        this._conn.close();
                        this._openConnection(this._peerId, false);
                        // Retry setting remote description
                        setTimeout(() => {
                            if (this._conn && this._conn.signalingState === 'stable') {
                                this._conn.setRemoteDescription(new RTCSessionDescription(message.sdp))
                                    .then(_ => {
                                        return this._conn.createAnswer()
                                            .then(d => this._onDescription(d));
                                    })
                                    .catch(e => console.error('Retry failed:', e));
                            }
                        }, 100);
                    }
                });
        } else if (message.ice) {
            console.log('📡 Received ICE candidate');
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
        channel.onmessage = e => this._onMessage(e.data);
        channel.onclose = e => this._onChannelClosed();
        this._channel = channel;
    }

    _onChannelClosed() {
        console.log('RTC: channel closed', this._peerId);
        if (!this.isCaller) return;
        this._connect(this._peerId, true); // reopen the channel
    }

    _onConnectionStateChange(e) {
        const state = this._conn.connectionState;
        console.log('🔗 RTC Connection state:', state, 'for peer:', this._peerId?.substring(0,8));
        switch (state) {
            case 'connecting':
                console.log('🔄 WebRTC connecting...');
                break;
            case 'connected':
                console.log('✅ WebRTC connection established!');
                break;
            case 'disconnected':
                console.log('🔌 WebRTC disconnected');
                this._onChannelClosed();
                break;
            case 'failed':
                console.error('❌ WebRTC connection failed');
                this._conn = null;
                this._onChannelClosed();
                break;
            case 'closed':
                console.log('🔒 WebRTC connection closed');
                this._onChannelClosed();
                break;
        }
    }

    _onIceConnectionStateChange() {
        const iceState = this._conn.iceConnectionState;
        console.log('🧊 ICE Connection state:', iceState, 'for peer:', this._peerId?.substring(0,8));
        switch (iceState) {
            case 'checking':
                console.log('🔍 ICE checking candidates...');
                break;
            case 'connected':
            case 'completed':
                console.log('✅ ICE connection established!');
                break;
            case 'failed':
                console.error('❌ ICE connection failed - retrying...');
                this._conn.restartIce();
                break;
            case 'disconnected':
                console.log('🔌 ICE disconnected');
                break;
            case 'closed':
                console.log('🔒 ICE connection closed');
                break;
            default:
                console.log('🧊 ICE Gathering:', iceState);
        }
    }

    _onError(error) {
        console.error(error);
    }

    _send(message) {
        if (!this._channel) return this.refresh();
        this._channel.send(message);
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
        console.log('📤 PeersManager: Files selected for peer:', message.to, 'Files:', message.files.length);
        if (this.peers[message.to]) {
            this.peers[message.to].sendFiles(message.files);
            console.log('✅ Files sent to peer:', message.to);
        } else {
            console.error('❌ Peer not found:', message.to, 'Available peers:', Object.keys(this.peers));
        }
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

class WSPeer {
    _send(message) {
        message.to = this._peerId;
        this._server.send(message);
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
        if (this._isPartitionEnd() || this.isFileEnd()) {
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
}


RTCPeer.config = {
    'sdpSemantics': 'unified-plan',
    'iceServers': [
        {
            urls: 'stun:stun.l.google.com:19302'
        },
        {
            urls: 'stun:stun1.l.google.com:19302'  
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
        send: (message) => serverConnection.send(message),
        isConnected: () => serverConnection._isConnected(),
        serverConnection: serverConnection,
        peersManager: peersManager
    };
    
    // Expose Events system
    window.Events = Events;
    
    console.log('Network system initialization completed, Events and network exposed globally');
});
