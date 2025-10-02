window.URL = window.URL || window.webkitURL;
window.isRtcSupported = !!(window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection);

class ServerConnection {

    constructor() {
        this._currentFileDigester = null; // 初始化文件接收器
        this._wsReceiveState = { bytes: 0, size: 0, sender: null }; // 追踪WS接收进度
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
            this._send({ type: 'ping' });
            this._startPingTimer();
        };
        ws.onmessage = e => this._onMessage(e.data);
        ws.onclose = e => this._onDisconnect();
        ws.onerror = e => console.error(e);
        this._socket = ws;
    }

    send(message) {
        if (this._socket && this._socket.readyState === WebSocket.OPEN) {
            this._socket.send(JSON.stringify(message));
        }
    }

    _send(message) {
        this.send(message);
    }

    _onFileHeaderReceived(header) {
        console.log('📁 收到文件头信息:', header);
        // 创建FileDigester来处理文件数据
        this._currentFileDigester = new FileDigester({
            name: header.name,
            mime: header.mime,
            size: header.size
        }, file => this._onFileReceived(file));

        // 记录WS接收状态并发出0%进度
        this._wsReceiveState.bytes = 0;
        this._wsReceiveState.size = header.size || 0;
        this._wsReceiveState.sender = header.sender || header.from || null;
        try {
            Events.fire('file-progress', { sender: this._wsReceiveState.sender, progress: 0 });
        } catch (e) {
            console.warn('WS progress(0) fire error:', e);
        }
    }

    _onFileChunkReceived(chunkMsg) {
        console.log('📁 收到文件数据块:', chunkMsg);
        console.log('🔧 调试版本 v2.0 - 时间戳:', Date.now());
        if (this._currentFileDigester && chunkMsg.data) {
            // 将base64数据转换为ArrayBuffer
            const binaryString = atob(chunkMsg.data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            console.log('📁 发送数据块到FileDigester:', {
                chunkSize: bytes.buffer.byteLength,
                totalSize: this._currentFileDigester._size,
                bytesReceived: this._currentFileDigester._bytesReceived
            });
            this._currentFileDigester.unchunk(bytes.buffer);

            // 更新并派发进度
            try {
                // 注意：base64转原始字节后长度为 binaryString.length
                this._wsReceiveState.bytes += binaryString.length;
                const total = this._wsReceiveState.size || 1; // 防止除0
                let progress = this._wsReceiveState.bytes / total;
                if (progress > 1) progress = 1;
                Events.fire('file-progress', { sender: chunkMsg.sender || this._wsReceiveState.sender, progress });
            } catch (e) {
                console.warn('WS progress fire error:', e);
            }
        }
    }

    _onFileReceived(file) {
        console.log('📁 文件接收完成:', file);
        console.log('📁 文件详情:', {
            name: file.name,
            size: file.size,
            mime: file.mime,
            hasBlob: !!file.blob
        });
        Events.fire('file-received', file);
        this._currentFileDigester = null;
    }

    _onMessage(msg) {
        // 检查是否是二进制数据（文件块）
        if (msg instanceof ArrayBuffer || msg instanceof Blob) {
            console.log('📁 收到二进制数据块');
            this._onChunkReceived(msg);
            return;
        }
        
        msg = JSON.parse(msg);
        console.log('WS:', msg);
        switch (msg.type) {
            case 'peers':
                console.log('🔍 Received peers message from server:', msg.peers);
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
            case 'pong':
                // 处理pong响应，无需特殊处理
                break;
            case 'display-name':
                Events.fire('display-name', msg);
                break;
            case 'text':
                console.log('📨 收到文本消息:', msg);
                // 解码base64编码的文本
                const decodedText = decodeURIComponent(escape(atob(msg.text)));
                Events.fire('text-received', { text: decodedText, sender: msg.sender });
                break;
            case 'header':
                console.log('📁 收到文件头信息:', msg);
                this._onFileHeader(msg);
                break;
            case 'partition':
                console.log('📁 收到分区结束消息:', msg);
                this._onPartitionEnd(msg);
                break;
            case 'partition-received':
                console.log('📁 收到分区确认消息:', msg);
                this._onPartitionReceived(msg);
                break;
            case 'progress':
                console.log('📁 收到进度消息:', msg);
                Events.fire('file-progress', { sender: msg.sender, progress: msg.progress });
                break;
            case 'transfer-complete':
                console.log('✅ 收到传输完成消息:', msg);
                this._onTransferCompleted();
                break;
            case 'file-data':
                console.log('📁 收到文件数据消息:', msg.data ? msg.data.length : 0, 'characters');
                // 将base64数据转换为ArrayBuffer
                const binaryString = atob(msg.data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                this._onChunkReceived(bytes.buffer);
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
        const url = protocol + '://' + location.host;
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
        Events.fire('notify-user', 'Connection lost. Retry in 5 seconds...');
        this._stopPingTimer();
        clearTimeout(this._reconnectTimer);
        this._reconnectTimer = setTimeout(_ => this._connect(), 5000);
    }

    _startPingTimer() {
        this._stopPingTimer();
        this._pingTimer = setInterval(() => {
            if (this._isConnected()) {
                this._send({ type: 'ping' });
            }
        }, 30000); // 每30秒ping一次
    }

    _stopPingTimer() {
        if (this._pingTimer) {
            clearInterval(this._pingTimer);
            this._pingTimer = null;
        }
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

    _onFileHeader(header) {
        console.log('📁 ServerConnection: 收到文件头信息:', header);
        this._currentFileDigester = new FileDigester({
            name: header.name,
            mime: header.mime,
            size: header.size
        }, file => this._onFileReceived(file));
        this._lastProgress = 0;
    }

    _onPartitionEnd(msg) {
        console.log('📁 ServerConnection: 分区结束，offset:', msg.offset);
        // 发送分区确认
        this.send({ type: 'partition-received', offset: msg.offset });
    }

    _onChunkReceived(chunk) {
        console.log('📁 ServerConnection: 收到二进制数据块:', chunk.byteLength, 'bytes');
        if (!chunk.byteLength) return;
        
        if (this._currentFileDigester) {
            this._currentFileDigester.unchunk(chunk);
            const progress = this._currentFileDigester.progress;
            Events.fire('file-progress', { sender: 'server', progress: progress });

            // 偶尔通知发送方我们的进度
            if (progress - this._lastProgress < 0.01) return;
            this._lastProgress = progress;
            this._sendProgress(progress);
        }
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
        
        // 跟踪文件接收事件
        if (window.trackFileReceived && proxyFile) {
            window.trackFileReceived(proxyFile.mime || 'unknown', proxyFile.size || 0);
        }
    }

    _onTransferCompleted() {
        this._onDownloadProgress(1);
        this._reader = null;
        this._busy = false;
        this._dequeueFile();
        Events.fire('notify-user', 'File transfer completed.');
    }

    sendText(text) {
        console.log('📤 尝试发送文本消息:', text);
        const unescaped = btoa(unescape(encodeURIComponent(text)));
        console.log('✅ 发送消息到 peer:', this._peerId);
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
        channel.binaryType = 'arraybuffer';
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
            this._conn.addIceCandidate(new RTCIceCandidate(message.ice));
        }
    }

    _onChannelOpened(event) {
        console.log('📡 RTC 数据通道已打开:', this._peerId);
        const channel = event.channel || event.target;
        console.log('📡 数据通道状态:', channel.readyState);
        channel.onmessage = e => this._onMessage(e.data);
        channel.onclose = e => this._onChannelClosed();
        this._channel = channel;
        console.log('✅ 数据通道已准备就绪，可以发送消息:', this._peerId);
    }

    _onChannelClosed() {
        console.log('RTC: channel closed', this._peerId);
        if (!this.isCaller) return;
        this._connect(this._peerId, true); // reopen the channel
    }

    _onConnectionStateChange(e) {
        console.log('🔗 RTC 连接状态变化:', this._conn.connectionState, 'peer:', this._peerId);
        switch (this._conn.connectionState) {
            case 'connected':
                console.log('✅ WebRTC 连接已建立:', this._peerId);
                break;
            case 'connecting':
                console.log('🔄 WebRTC 连接中:', this._peerId);
                break;
            case 'disconnected':
                console.log('❌ WebRTC 连接断开:', this._peerId);
                this._onChannelClosed();
                break;
            case 'failed':
                console.log('❌ WebRTC 连接失败:', this._peerId);
                this._conn = null;
                this._onChannelClosed();
                break;
        }
    }

    _onIceConnectionStateChange() {
        switch (this._conn.iceConnectionState) {
            case 'failed':
                console.error('ICE Gathering failed');
                break;
            default:
                console.log('ICE Gathering', this._conn.iceConnectionState);
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
        console.log('📨 Received message from:', message.sender);
        if (!this.peers[message.sender]) {
            console.log('🆕 Creating new peer from message:', message.sender);
            this.peers[message.sender] = new RTCPeer(this._server, message.sender);
            console.log('🔍 Created peer object:', this.peers[message.sender]);
            console.log('🔍 Peer has sendText method:', typeof this.peers[message.sender].sendText);
            console.log('🔍 Peer has sendFiles method:', typeof this.peers[message.sender].sendFiles);
        }
        this.peers[message.sender].onServerMessage(message);
    }

    _onPeers(peers) {
        console.log('📡 _onPeers called with:', peers);
        console.log('📡 Received peers list:', peers.map(p => p.id));
        
        if (!peers || !Array.isArray(peers)) {
            console.error('❌ Invalid peers data:', peers);
            return;
        }
        
        peers.forEach(peer => {
            console.log('🔍 Processing peer:', peer);
            if (this.peers[peer.id]) {
                console.log('🔄 Refreshing existing peer:', peer.id);
                this.peers[peer.id].refresh();
                return;
            }
            if (window.isRtcSupported && peer.rtcSupported) {
                console.log('🆕 Creating new RTCPeer:', peer.id);
                this.peers[peer.id] = new RTCPeer(this._server, peer.id);
            } else {
                console.log('🆕 Creating new WSPeer:', peer.id);
                this.peers[peer.id] = new WSPeer(this._server, peer.id);
            }
            console.log('✅ Created peer object:', this.peers[peer.id]);
            console.log('✅ Peer has sendFiles:', typeof this.peers[peer.id].sendFiles);
        });
        console.log('📋 Final peers list:', Object.keys(this.peers));
        console.log('📋 All peer objects:', this.peers);
    }

    sendTo(peerId, message) {
        this.peers[peerId].send(message);
    }

    _onFilesSelected(message) {
        console.log('📤 _onFilesSelected called with:', message);
        console.log('📤 Looking for peer:', message.to);
        console.log('📤 Available peers:', Object.keys(this.peers));
        console.log('📤 Peer object details:', this.peers);
        
        const peer = this.peers[message.to];
        if (!peer) {
            console.error('❌ Peer not found:', message.to);
            console.error('❌ Available peer IDs:', Object.keys(this.peers));
            return;
        }
        if (typeof peer.sendFiles !== 'function') {
            console.error('❌ Peer does not have sendFiles method:', message.to, peer);
            console.error('❌ Peer object:', peer);
            return;
        }
        console.log('✅ Found peer, sending files:', message.files.length, 'files');
        peer.sendFiles(message.files);
    }

    _onSendText(message) {
        console.log('🔍 Looking for peer:', message.to);
        console.log('📋 Available peers:', Object.keys(this.peers));
        const peer = this.peers[message.to];
        if (!peer) {
            console.error('❌ Peer not found:', message.to);
            console.error('❌ Available peer IDs:', Object.keys(this.peers));
            return;
        }
        if (typeof peer.sendText !== 'function') {
            console.error('❌ Peer does not have sendText method:', message.to, peer);
            return;
        }
        peer.sendText(message.text);
    }

    _onPeerLeft(peerId) {
        const peer = this.peers[peerId];
        delete this.peers[peerId];
        if (!peer || !peer._peer) return;
        peer._peer.close();
    }

}

class WSPeer extends Peer {
    constructor(serverConnection, peerId) {
        super(serverConnection, peerId);
    }

    _send(message) {
        // 如果是二进制数据，需要包装成JSON消息发送
        if (message instanceof ArrayBuffer || message instanceof Blob) {
            // 将二进制数据转换为base64字符串
            const base64 = btoa(String.fromCharCode(...new Uint8Array(message)));
            this._server.send({
                to: this._peerId,
                type: 'file-data',
                data: base64
            });
        } else {
            // 否则发送JSON消息
            this._server.send({
                to: this._peerId,
                ...message
            });
        }
    }

    sendJSON(message) {
        this._send(message);
    }

    sendText(text) {
        console.log('📤 WSPeer: Sending text message:', text);
        const unescaped = btoa(unescape(encodeURIComponent(text)));
        this.sendJSON({
            type: 'text',
            text: unescaped
        });
    }

    sendFiles(files) {
        console.log('📤 WSPeer: sendFiles called with:', files.length, 'files');
        console.log('📤 WSPeer: files details:', files);
        for (let i = 0; i < files.length; i++) {
            console.log('📤 WSPeer: 添加文件到队列:', files[i].name, files[i].size);
            this._filesQueue.push(files[i]);
        }
        console.log('📤 WSPeer: 开始发送下一个文件');
        this._sendNextFile();
    }

    _sendNextFile() {
        console.log('📤 WSPeer: _sendNextFile called');
        console.log('📤 WSPeer: _busy =', this._busy);
        console.log('📤 WSPeer: _filesQueue.length =', this._filesQueue.length);
        if (this._busy || this._filesQueue.length === 0) {
            console.log('📤 WSPeer: 跳过发送，原因:', this._busy ? 'busy' : 'no files');
            return;
        }
        this._busy = true;
        console.log('📤 WSPeer: 开始处理文件发送');

        const file = this._filesQueue.shift();
        console.log('📤 WSPeer: 开始发送文件:', file.name, file.size);
        // 先发送文件头信息
        this.sendJSON({
            type: 'header',
            name: file.name,
            mime: file.type,
            size: file.size
        });
        console.log('📤 WSPeer: 发送文件头信息:', file.name);
        
        const fileChunker = new FileChunker(file,
            chunk => {
                console.log('📤 WSPeer: 发送文件数据块:', chunk.byteLength, 'bytes');
                console.log('📤 WSPeer: chunk type:', typeof chunk, chunk.constructor.name);
                // 直接发送二进制数据，不使用JSON包装
                this._send(chunk);
            },
            offset => {
                console.log('📤 WSPeer: 分区结束，offset:', offset);
                this.sendJSON({ type: 'partition', offset: offset });
                // 重置busy状态并发送下一个文件
                this._busy = false;
                this._sendNextFile();
            }
        );

        fileChunker.nextPartition();
    }

    refresh() {
        // WSPeer doesn't need refresh
    }
}

class FileChunker {

    constructor(file, onChunk, onPartitionEnd) {
        this._chunkSize = 64000; // 64 KB
        this._maxPartitionSize = 100e6; // 100 MB - 移除文件大小限制
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

        console.log('📁 FileDigester进度:', {
            name: this._name,
            bytesReceived: this._bytesReceived,
            totalSize: this._size,
            progress: this.progress,
            chunks: totalChunks
        });

        if (this._bytesReceived < this._size) return;
        // we are done
        console.log('📁 FileDigester完成文件组装:', this._name);
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
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        { urls: 'stun:stun.ekiga.net' },
        { urls: 'stun:stun.ideasip.com' },
        { urls: 'stun:stun.schlund.de' },
        { urls: 'stun:stun.stunprotocol.org:3478' },
        { urls: 'stun:stun.voiparound.com' },
        { urls: 'stun:stun.voipbuster.com' },
        { urls: 'stun:stun.voipstunt.com' },
        { urls: 'stun:stun.counterpath.com' },
        { urls: 'stun:stun.1und1.de' },
        { urls: 'stun:stun.gmx.net' },
        { urls: 'stun:stun.callwithus.com' },
        { urls: 'stun:stun.counterpath.net' },
        { urls: 'stun:stun.internetcalls.com' }
    ],
    'iceCandidatePoolSize': 10,
    'iceTransportPolicy': 'all'
}

// 为ServerConnection添加原始Snapdrop的文件处理方法
ServerConnection.prototype._onFileHeader = function(header) {
    console.log('📁 收到文件头信息:', header);
    this._currentFileDigester = new FileDigester({
        name: header.name,
        mime: header.mime,
        size: header.size
    }, file => this._onFileReceived(file));
    this._lastProgress = 0;
};

ServerConnection.prototype._onChunkReceived = function(chunk) {
    if (!chunk.byteLength) return;
    
    if (this._currentFileDigester) {
        this._currentFileDigester.unchunk(chunk);
        const progress = this._currentFileDigester.progress;
        Events.fire('file-progress', { sender: this._peerId, progress: progress });

        // 偶尔通知发送方我们的进度
        if (progress - this._lastProgress < 0.01) return;
        this._lastProgress = progress;
        this._sendProgress(progress);
    }
};

ServerConnection.prototype._onPartitionEnd = function(msg) {
    console.log('📁 分区结束，offset:', msg.offset);
    // 发送分区确认
    this.send({ type: 'partition-received', offset: msg.offset });
};

ServerConnection.prototype._onPartitionReceived = function(msg) {
    console.log('📁 收到分区确认，offset:', msg.offset);
    // 可以在这里处理分区确认，但WebSocket模式下通常不需要
};

ServerConnection.prototype._onTransferCompleted = function() {
    console.log('✅ 传输完成');
    Events.fire('file-progress', { sender: this._peerId, progress: 1 });
    this._currentFileDigester = null;
    Events.fire('notify-user', 'File transfer completed.');
};

ServerConnection.prototype._sendProgress = function(progress) {
    this.send({ type: 'progress', progress: progress });
};
