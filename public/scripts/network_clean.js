// DropShare Network Module - Simplified Version based on SnapDrop
// Version 3.0 - Simplified WebRTC implementation

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
            reliable: true
        });
        channel.onopen = e => this._onChannelOpened(e);
        this._conn.createOffer().then(d => this._onDescription(d)).catch(e => this._onError(e));
    }

    _onDescription(description) {
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
        console.log('RTC: channel opened with', this._peerId);
        const channel = event.channel || event.target;
        channel.binaryType = 'arraybuffer';
        channel.onmessage = e => this._onMessage(e.data);
        channel.onclose = e => this._onChannelClosed();
        this._channel = channel;
        Events.fire('peer-connected', { peerId: this._peerId });
    }

    _onChannelClosed() {
        console.log('RTC: channel closed', this._peerId);
        Events.fire('peer-disconnected', { peerId: this._peerId });
        if (!this._isCaller) return;
        this._connect(this._peerId, true); // reopen the channel
    }

    _onConnectionStateChange(e) {
        console.log('RTC: state changed:', this._conn.connectionState);
        switch (this._conn.connectionState) {
            case 'connected':
                console.log('✅ WebRTC connection established');
                break;
            case 'disconnected':
                this._onChannelClosed();
                break;
            case 'failed':
                console.error('❌ WebRTC connection failed');
                this._conn = null;
                this._onChannelClosed();
                break;
        }
    }

    _onIceConnectionStateChange() {
        switch (this._conn.iceConnectionState) {
            case 'connected':
            case 'completed':
                console.log('✅ ICE connection successful');
                break;
            case 'failed':
                console.error('❌ ICE Gathering failed');
                break;
            default:
                console.log('🧊 ICE Gathering:', this._conn.iceConnectionState);
        }
    }

    _onError(error) {
        console.error('WebRTC Error:', error);
    }

    _send(message) {
        if (!this._channel || this._channel.readyState !== 'open') {
            console.warn('Channel not ready, attempting refresh');
            this.refresh();
            return;
        }
        this._channel.send(message);
    }

    _sendSignal(signal) {
        signal.type = 'signal';
        signal.to = this._peerId;
        this._server.send(signal);
    }

    refresh() {
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

RTCPeer.config = {
    'sdpSemantics': 'unified-plan',
    'iceServers': [{
        urls: 'stun:stun.l.google.com:19302'
    }]
};