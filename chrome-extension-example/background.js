// Chrome Extension Background Service Worker
// DropShare Extension - WebRTC File Transfer

class DropShareExtension {
  constructor() {
    this.signalingSocket = null;
    this.peerConnections = new Map(); // 支持多个peer连接
    this.dataChannels = new Map();
    this.deviceId = null;
    this.deviceName = null;
    this.connectedPeers = new Map();
    this.currentFile = null;
    this.fileQueue = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    
    // 从存储或环境获取服务器URL
    this.serverUrl = null;
    
    this.init();
  }

  async init() {
    console.log('DropShare Extension initialized');
    await this.generateDeviceId();
    await this.loadSettings();
    this.connectToSignalingServer();
    this.setupMessageListeners();
    this.setupAlarms();
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['serverUrl', 'deviceName'], async (result) => {
        // 如果已有保存的服务器地址，直接使用
        if (result.serverUrl) {
          this.serverUrl = result.serverUrl;
          console.log('Using saved server URL:', this.serverUrl);
        } else {
          // 自动检测服务器地址
          this.serverUrl = await this.autoDetectServerUrl();
          // 保存检测到的地址
          if (this.serverUrl) {
            chrome.storage.sync.set({ serverUrl: this.serverUrl }, () => {
              console.log('Auto-detected and saved server URL:', this.serverUrl);
            });
          } else {
            // 如果自动检测失败，使用默认的WSS线上服务器
            this.serverUrl = 'wss://dropshare.tech/server/webrtc';
            console.log('Using default server URL (WSS):', this.serverUrl);
          }
        }
        
        this.deviceName = result.deviceName || this.getDeviceName();
        console.log('Final Server URL:', this.serverUrl);
        resolve();
      });
    });
  }

  async autoDetectServerUrl() {
    return new Promise((resolve) => {
      // 方法1: 从打开的标签页中检测DropShare网站
      chrome.tabs.query({}, (tabs) => {
        // 查找DropShare相关的标签页（优先级从高到低）
        let dropshareTab = tabs.find(tab => {
          const url = tab.url || '';
          return url.includes('dropshare.tech') || 
                 url.includes('dropshare');
        });

        // 如果没有找到，查找localhost
        if (!dropshareTab) {
          dropshareTab = tabs.find(tab => {
            const url = tab.url || '';
            return url.includes('localhost:8080') ||
                   url.includes('127.0.0.1:8080') ||
                   url.includes('transer.html') ||
                   url.includes('share.html');
          });
        }

        if (dropshareTab && dropshareTab.url) {
          try {
            const url = new URL(dropshareTab.url);
            // 重要：HTTPS网站必须使用WSS，HTTP网站使用WS
            const protocol = url.protocol === 'https:' ? 'wss' : 'ws';
            const host = url.host;
            const wsUrl = `${protocol}://${host}/server/webrtc`;
            console.log('✅ Auto-detected server from tab:', wsUrl);
            console.log('✅ Protocol:', protocol, '(website protocol:', url.protocol, ')');
            resolve(wsUrl);
            return;
          } catch (e) {
            console.log('Failed to parse tab URL:', e);
          }
        }

        // 方法2: 如果没有找到标签页，尝试常见的服务器地址
        // 优先尝试线上服务器（使用WSS，因为线上服务器通常是HTTPS）
        const commonUrls = [
          'wss://dropshare.tech/server/webrtc',  // 线上服务器（WSS，安全连接）
          'ws://localhost:8080/server/webrtc',   // 本地开发（WS）
          'ws://127.0.0.1:8080/server/webrtc'    // 本地备用（WS）
        ];

        // 快速测试第一个地址（线上服务器）
        this.quickTestServerUrl(commonUrls[0]).then(works => {
          if (works) {
            console.log('✅ Using online server:', commonUrls[0]);
            resolve(commonUrls[0]);
          } else {
            // 如果线上服务器不可用，尝试本地
            console.log('⚠️ Online server not available, trying localhost...');
            this.quickTestServerUrl(commonUrls[1]).then(localWorks => {
              if (localWorks) {
                console.log('✅ Using local server:', commonUrls[1]);
                resolve(commonUrls[1]);
              } else {
                // 都不可用，使用默认的线上服务器（WSS，安全连接）
                console.log('⚠️ No server available, using default online server (WSS)');
                resolve(commonUrls[0]); // wss://dropshare.tech/server/webrtc
              }
            });
          }
        });
      });
    });
  }

  async quickTestServerUrl(url) {
    return new Promise((resolve) => {
      try {
        const testWs = new WebSocket(url);
        let resolved = false;
        
        testWs.onopen = () => {
          if (!resolved) {
            resolved = true;
            testWs.close();
            resolve(true);
          }
        };

        testWs.onerror = () => {
          if (!resolved) {
            resolved = true;
            resolve(false);
          }
        };

        // 1秒超时
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            if (testWs.readyState === WebSocket.CONNECTING) {
              testWs.close();
            }
            resolve(false);
          }
        }, 1000);
      } catch (error) {
        resolve(false);
      }
    });
  }

  async generateDeviceId() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['deviceId'], (result) => {
        if (result.deviceId) {
          this.deviceId = result.deviceId;
          resolve();
        } else {
          this.deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
          chrome.storage.local.set({ deviceId: this.deviceId }, () => {
            console.log('Generated device ID:', this.deviceId);
            resolve();
          });
        }
      });
    });
  }

  connectToSignalingServer() {
    if (this.signalingSocket && this.signalingSocket.readyState === WebSocket.OPEN) {
      return; // 已经连接
    }

    if (this.signalingSocket && this.signalingSocket.readyState === WebSocket.CONNECTING) {
      return; // 正在连接
    }

    try {
      console.log('Connecting to signaling server:', this.serverUrl);
      this.signalingSocket = new WebSocket(this.serverUrl);
      this.signalingSocket.binaryType = 'arraybuffer';
      
      this.signalingSocket.onopen = () => {
        console.log('✅ Connected to signaling server');
        this.reconnectAttempts = 0;
        this.notifyPopup('connected', '已连接到服务器');
        
        // 服务器会在连接后自动发送peer列表（通过_joinRoom）
        // 但我们也可以主动请求一次，确保获取最新列表
        setTimeout(() => {
          this.sendSignalingMessage({ type: 'get-peers' });
        }, 500);
        
        // 定期发送ping保持连接，并定期请求peer列表
        this.startKeepAlive();
        
        // 定期请求peer列表（每5秒）
        this.startPeerListRefresh();
      };

      this.signalingSocket.onmessage = (event) => {
        try {
          // 检查是否是二进制数据
          if (event.data instanceof ArrayBuffer) {
            console.log('Received binary data, size:', event.data.byteLength);
            // 二进制数据应该在WebRTC DataChannel中处理，这里不应该收到
            return;
          }
          
          const message = JSON.parse(event.data);
          this.handleSignalingMessage(message);
        } catch (error) {
          console.error('Error parsing message:', error, event.data);
        }
      };

      this.signalingSocket.onclose = (event) => {
        console.log('Disconnected from signaling server', event.code, event.reason);
        this.stopKeepAlive();
        
        // 检查是否是协议错误（301重定向通常表示应该使用WSS）
        if (event.code === 1006 && this.serverUrl.startsWith('ws://')) {
          // 尝试自动切换到WSS
          const wssUrl = this.serverUrl.replace('ws://', 'wss://');
          console.log('⚠️ Connection failed with WS, trying WSS:', wssUrl);
          this.serverUrl = wssUrl;
          chrome.storage.sync.set({ serverUrl: wssUrl }, () => {
            console.log('✅ Updated server URL to WSS');
          });
          this.notifyPopup('error', '自动切换到安全连接（WSS）...');
          // 立即重试，使用新的URL
          setTimeout(() => this.connectToSignalingServer(), 1000);
          return;
        }
        
        let disconnectMsg = '与服务器断开连接';
        if (event.code === 1006) {
          // 1006表示异常关闭（没有收到关闭帧）
          if (this.serverUrl.includes('localhost')) {
            disconnectMsg = '无法连接到本地服务器，请确保服务器正在运行';
          } else if (this.serverUrl.startsWith('ws://') && !this.serverUrl.includes('localhost')) {
            disconnectMsg = '连接失败，请尝试使用WSS（安全连接）';
          } else {
            disconnectMsg = '连接失败，请检查服务器地址和网络';
          }
        }
        
        this.notifyPopup('disconnected', disconnectMsg);
        
        // 重连逻辑
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(3000 * this.reconnectAttempts, 30000); // 最多30秒
          console.log(`Retrying connection in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => this.connectToSignalingServer(), delay);
        } else {
          console.error('Max reconnection attempts reached');
          let errorMsg = '无法连接到服务器';
          if (this.serverUrl.includes('localhost')) {
            errorMsg = '无法连接到本地服务器，请确保服务器正在运行（node index.js）';
          } else if (this.serverUrl.startsWith('ws://') && !this.serverUrl.includes('localhost')) {
            errorMsg = '连接失败，请检查服务器地址（建议使用WSS://）';
          } else {
            errorMsg = '无法连接到服务器，请检查设置和网络连接';
          }
          this.notifyPopup('error', errorMsg);
        }
      };

      this.signalingSocket.onerror = (error) => {
        console.error('Signaling server error:', error);
        const errorMsg = this.getConnectionErrorMessage(error, this.serverUrl);
        console.error('Connection error details:', errorMsg);
        this.notifyPopup('error', errorMsg);
      };
    } catch (error) {
      console.error('Failed to connect to signaling server:', error);
      const errorMsg = this.getConnectionErrorMessage(error, this.serverUrl);
      this.notifyPopup('error', errorMsg);
    }
  }

  getConnectionErrorMessage(error, serverUrl) {
    if (!serverUrl) {
      return '服务器地址未配置';
    }
    
    if (serverUrl.includes('localhost') || serverUrl.includes('127.0.0.1')) {
      return '无法连接到本地服务器，请确保服务器正在运行';
    }
    
    if (serverUrl.startsWith('ws://') && !serverUrl.includes('localhost')) {
      return '连接失败，请尝试使用WSS://（安全连接）';
    }
    
    if (error && error.message) {
      if (error.message.includes('301') || error.message.includes('redirect')) {
        return '连接失败：服务器要求使用安全连接（WSS://）';
      }
      if (error.message.includes('ERR_CONNECTION_REFUSED')) {
        return '连接被拒绝，请检查服务器地址和端口';
      }
      if (error.message.includes('ERR_NAME_NOT_RESOLVED')) {
        return '无法解析服务器地址，请检查域名是否正确';
      }
    }
    
    return '连接服务器时出错，请检查设置和网络';
  }

  startKeepAlive() {
    this.keepAliveInterval = setInterval(() => {
      if (this.signalingSocket && this.signalingSocket.readyState === WebSocket.OPEN) {
        this.sendSignalingMessage({ type: 'ping' });
      }
    }, 30000); // 每30秒发送一次ping
  }

  startPeerListRefresh() {
    // 每5秒请求一次peer列表
    if (this.peerListRefreshInterval) {
      clearInterval(this.peerListRefreshInterval);
    }
    this.peerListRefreshInterval = setInterval(() => {
      if (this.signalingSocket && this.signalingSocket.readyState === WebSocket.OPEN) {
        console.log('🔄 Refreshing peer list...');
        this.sendSignalingMessage({ type: 'get-peers' });
      }
    }, 5000); // 每5秒刷新一次
  }

  stopPeerListRefresh() {
    if (this.peerListRefreshInterval) {
      clearInterval(this.peerListRefreshInterval);
      this.peerListRefreshInterval = null;
    }
  }

  stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    this.stopPeerListRefresh();
  }

  notifyPopup(type, message) {
    chrome.runtime.sendMessage({
      type: 'status-updated',
      status: type,
      message: message
    }).catch(() => {
      // Popup可能未打开，忽略错误
    });
  }

  sendSignalingMessage(message) {
    if (this.signalingSocket && this.signalingSocket.readyState === WebSocket.OPEN) {
      this.signalingSocket.send(JSON.stringify(message));
    }
  }

  handleSignalingMessage(message) {
    console.log('Received signaling message:', message.type, message);

    switch (message.type) {
      case 'peers':
        this.handlePeerList(message.peers || []);
        break;
      case 'signal':
        this.handleSignal(message);
        break;
      case 'peer-joined':
        console.log('🆕 Peer joined:', message.peer || message);
        // 当有新peer加入时，请求更新peer列表
        setTimeout(() => {
          this.sendSignalingMessage({ type: 'get-peers' });
        }, 500);
        this.handlePeerJoined(message.peer || message);
        break;
      case 'peer-left':
        console.log('👋 Peer left:', message.peerId || message);
        // 当peer离开时，请求更新peer列表
        setTimeout(() => {
          this.sendSignalingMessage({ type: 'get-peers' });
        }, 500);
        this.handlePeerLeft(message.peerId || message);
        break;
      case 'pong':
        // 服务器响应ping
        break;
      case 'display-name':
        // 服务器分配的显示名称和peer ID
        console.log('📌 Received display-name message:', message);
        
        // 服务器发送的格式可能是 message.message.peerId
        const serverPeerId = message.peerId || (message.message && message.message.peerId);
        const displayName = message.name || (message.message && message.message.displayName);
        
        if (displayName) {
          this.deviceName = displayName;
          console.log('📌 Server assigned display name:', displayName);
        }
        
        if (serverPeerId) {
          console.log('📌 Server assigned peer ID:', serverPeerId);
          console.log('📌 Current extension device ID:', this.deviceId);
          
          // 更新device ID为服务器分配的peer ID，这样扩展和网站就能同步
          if (this.deviceId !== serverPeerId) {
            console.log('🔄 Updating device ID from', this.deviceId, 'to', serverPeerId);
            const oldDeviceId = this.deviceId;
            this.deviceId = serverPeerId;
            
            // 保存新的device ID
            chrome.storage.local.set({ deviceId: serverPeerId }, () => {
              console.log('✅ Device ID updated and saved');
              // 通知popup设备ID已更新
              chrome.runtime.sendMessage({
                type: 'device-id-updated',
                deviceId: serverPeerId,
                oldDeviceId: oldDeviceId
              }).catch(() => {});
            });
          } else {
            console.log('✅ Device ID matches server peer ID');
          }
        }
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  handlePeerList(peers) {
    console.log('📋 Received peer list:', peers);
    console.log('📋 Current device ID (extension):', this.deviceId);
    console.log('📋 Total peers received:', peers ? peers.length : 0);
    
    if (!peers || !Array.isArray(peers)) {
      console.warn('⚠️ Invalid peer list received:', peers);
      peers = [];
    }
    
    // 重要：不要过滤peer，让服务器处理
    // 服务器已经在_joinRoom中过滤掉了自己（通过peer.id比较）
    // 扩展接收到的peer列表应该已经排除了自己
    
    console.log('✅ Available peers (from server):', peers.length);
    if (peers.length > 0) {
      console.log('✅ Peer IDs:', peers.map(p => p.id ? p.id.substring(0, 8) + '...' : 'Unknown'));
      // 检查是否有peer的ID与扩展的device ID相同
      const selfPeer = peers.find(p => p.id === this.deviceId);
      if (selfPeer) {
        console.log('⚠️ Found self in peer list, this should not happen');
      }
    } else {
      console.log('ℹ️ No other peers available. Make sure:');
      console.log('   1. Other devices/browsers are connected to the same server');
      console.log('   2. Other devices are on the same network (same client IP)');
      console.log('   3. Server is correctly grouping peers by IP');
    }
    
    // 通知popup更新设备列表
    chrome.runtime.sendMessage({
      type: 'peer-list-updated',
      peers: peers, // 直接使用服务器返回的列表，不再次过滤
      deviceId: this.deviceId
    }).catch(() => {
      // Popup可能未打开，忽略错误
    });
  }

  async handleSignal(message) {
    const senderId = message.sender || message.from;
    const signal = message.signal || message;

    if (!senderId) {
      console.error('No sender ID in signal message');
      return;
    }

    let peerConnection = this.peerConnections.get(senderId);
    let dataChannel = this.dataChannels.get(senderId);

    // 如果没有连接，创建一个新的
    if (!peerConnection) {
      peerConnection = await this.createPeerConnection(senderId);
    }

    try {
      if (signal.type === 'offer') {
        // 接收offer，创建answer
        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        this.sendSignalingMessage({
          type: 'signal',
          to: senderId,
          signal: {
            type: 'answer',
            sdp: answer.sdp
          }
        });

        // 等待DataChannel（接收端）
        this.waitForDataChannel(senderId, peerConnection);
      } else if (signal.type === 'answer') {
        // 接收answer
        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
      } else if (signal.candidate || signal.type === 'ice-candidate') {
        // ICE候选
        const candidate = signal.candidate || signal;
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    } catch (error) {
      console.error('Error handling signal:', error);
    }
  }

  async createPeerConnection(peerId) {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    };

    const peerConnection = new RTCPeerConnection(config);
    this.peerConnections.set(peerId, peerConnection);

    // 设置连接状态处理
    this.setupPeerConnectionHandlers(peerId, peerConnection);

    // 如果是发起连接，创建数据通道
    if (!this.dataChannels.has(peerId)) {
      const dataChannel = peerConnection.createDataChannel('fileTransfer', {
        ordered: true
      });
      this.dataChannels.set(peerId, dataChannel);
      this.setupDataChannelHandlers(peerId, dataChannel);
    }

    return peerConnection;
  }

  waitForDataChannel(peerId, peerConnection) {
    peerConnection.ondatachannel = (event) => {
      console.log('DataChannel received from peer:', peerId);
      const dataChannel = event.channel;
      this.dataChannels.set(peerId, dataChannel);
      this.setupDataChannelHandlers(peerId, dataChannel);
    };
  }

  setupDataChannelHandlers(peerId, dataChannel) {
    dataChannel.onopen = () => {
      console.log('✅ DataChannel opened with peer:', peerId);
      chrome.runtime.sendMessage({
        type: 'connection-ready',
        peerId: peerId
      }).catch(() => {});
      
      // 如果有待发送的文件，开始发送
      this.processFileQueue(peerId);
    };

    dataChannel.onmessage = (event) => {
      this.handleDataChannelMessage(peerId, event.data);
    };

    dataChannel.onerror = (error) => {
      console.error('DataChannel error with peer', peerId, ':', error);
    };

    dataChannel.onclose = () => {
      console.log('DataChannel closed with peer:', peerId);
      chrome.runtime.sendMessage({
        type: 'connection-closed',
        peerId: peerId
      }).catch(() => {});
    };

    dataChannel.onbufferedamountlow = () => {
      // 缓冲区有空间，可以继续发送
      this.processFileQueue(peerId);
    };
  }

  setupPeerConnectionHandlers(peerId, peerConnection) {
    // 存储当前peerId以便在回调中使用
    const currentPeerId = peerId;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'signal',
          to: currentPeerId,
          signal: {
            type: 'ice-candidate',
            candidate: event.candidate
          }
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      console.log(`Connection state with ${currentPeerId}:`, state);
      
      if (state === 'connected') {
        chrome.runtime.sendMessage({
          type: 'peer-connected',
          peerId: currentPeerId
        }).catch(() => {});
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        // 清理连接
        this.cleanupPeerConnection(currentPeerId);
        chrome.runtime.sendMessage({
          type: 'peer-disconnected',
          peerId: currentPeerId
        }).catch(() => {});
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state with ${currentPeerId}:`, peerConnection.iceConnectionState);
    };
  }

  cleanupPeerConnection(peerId) {
    const peerConnection = this.peerConnections.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(peerId);
    }
    
    const dataChannel = this.dataChannels.get(peerId);
    if (dataChannel) {
      dataChannel.close();
      this.dataChannels.delete(peerId);
    }
  }

  handleDataChannelMessage(peerId, data) {
    // 检查是否是ArrayBuffer，需要转换为字符串
    let messageStr = null;
    if (data instanceof ArrayBuffer) {
      messageStr = new TextDecoder().decode(data);
    } else if (typeof data === 'string') {
      messageStr = data;
    } else {
      // Blob
      return; // 暂时不支持Blob
    }

    try {
      // 尝试解析为JSON（文件头信息）
      const message = JSON.parse(messageStr);
      if (message.type === 'header' || message.type === 'file-header') {
        this.handleFileHeader(peerId, message);
      } else if (message.type === 'partition') {
        // 分区结束，发送确认
        this.sendDataChannelMessage(peerId, JSON.stringify({ type: 'partition-received', offset: message.offset }));
      } else if (message.type === 'progress') {
        // 接收进度更新
        chrome.runtime.sendMessage({
          type: 'file-progress',
          progress: message.progress,
          peerId: peerId
        }).catch(() => {});
      }
    } catch (e) {
      // 二进制数据（文件块）
      if (data instanceof ArrayBuffer) {
        this.handleFileChunk(peerId, data);
      }
    }
  }

  handleFileHeader(peerId, header) {
    const fileInfo = {
      name: header.name || 'unknown',
      size: header.size || 0,
      type: header.mime || header.type || 'application/octet-stream',
      chunks: [],
      receivedSize: 0,
      peerId: peerId
    };
    
    // 为每个peer存储独立的文件接收状态
    if (!this.receivingFiles) {
      this.receivingFiles = new Map();
    }
    this.receivingFiles.set(peerId, fileInfo);
    
    console.log('Receiving file:', fileInfo.name, 'from peer:', peerId);
    
    // 通知popup显示接收文件提示
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: '接收文件',
      message: `正在接收: ${fileInfo.name}`
    }).catch(() => {
      // 如果没有权限，忽略
    });

    chrome.runtime.sendMessage({
      type: 'file-receiving',
      fileName: fileInfo.name,
      fileSize: fileInfo.size,
      peerId: peerId
    }).catch(() => {});
  }

  handleFileChunk(peerId, chunk) {
    const fileInfo = this.receivingFiles?.get(peerId);
    if (!fileInfo) {
      console.warn('Received chunk but no file header for peer:', peerId);
      return;
    }

    fileInfo.chunks.push(chunk);
    fileInfo.receivedSize += chunk.byteLength;
    const progress = fileInfo.receivedSize / fileInfo.size;

    // 更新进度
    chrome.runtime.sendMessage({
      type: 'file-progress',
      progress: Math.min(progress, 1),
      fileName: fileInfo.name,
      peerId: peerId,
      received: fileInfo.receivedSize,
      total: fileInfo.size
    }).catch(() => {});

    // 文件接收完成
    if (fileInfo.receivedSize >= fileInfo.size) {
      this.saveFile(peerId, fileInfo);
      this.receivingFiles.delete(peerId);
    }
  }

  saveFile(peerId, fileInfo) {
    const blob = new Blob(fileInfo.chunks, { type: fileInfo.type });
    const url = URL.createObjectURL(blob);

    // 创建下载链接
    chrome.downloads.download({
      url: url,
      filename: fileInfo.name,
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('Download error:', chrome.runtime.lastError);
        chrome.runtime.sendMessage({
          type: 'file-error',
          error: chrome.runtime.lastError.message,
          fileName: fileInfo.name
        }).catch(() => {});
      } else {
        console.log('File downloaded:', downloadId);
        chrome.runtime.sendMessage({
          type: 'file-completed',
          fileName: fileInfo.name,
          peerId: peerId
        }).catch(() => {});
        
        // 显示通知
        chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icons/icon48.png'),
          title: '文件接收完成',
          message: `${fileInfo.name} 已保存`
        }).catch(() => {});
      }
      
      // 清理URL
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  async sendFile(file, targetPeerId) {
    const dataChannel = this.dataChannels.get(targetPeerId);
    if (!dataChannel || dataChannel.readyState !== 'open') {
      console.error('DataChannel not ready for peer:', targetPeerId);
      throw new Error('DataChannel not ready');
    }

    return new Promise((resolve, reject) => {
      // 发送文件头信息
      const header = JSON.stringify({
        type: 'header',
        name: file.name,
        mime: file.type || 'application/octet-stream',
        size: file.size
      });

      try {
        dataChannel.send(header);
        console.log('Sent file header:', file.name, file.size);

        // 分块发送文件
        const chunkSize = 64 * 1024; // 64KB
        let offset = 0;
        const reader = new FileReader();

        reader.onload = (e) => {
          const chunk = e.target.result;
          if (dataChannel.readyState === 'open') {
            try {
              dataChannel.send(chunk);
              offset += chunk.byteLength;

              // 更新进度
              const progress = Math.min(offset / file.size, 1);
              chrome.runtime.sendMessage({
                type: 'file-send-progress',
                progress: progress,
                fileName: file.name,
                peerId: targetPeerId,
                sent: offset,
                total: file.size
              }).catch(() => {});

              if (offset < file.size) {
                // 检查缓冲区，避免溢出
                if (dataChannel.bufferedAmount > dataChannel.bufferedAmountLowThreshold * 2) {
                  // 缓冲区太满，等待
                  dataChannel.onbufferedamountlow = () => {
                    dataChannel.onbufferedamountlow = null;
                    const slice = file.slice(offset, Math.min(offset + chunkSize, file.size));
                    reader.readAsArrayBuffer(slice);
                  };
                } else {
                  const slice = file.slice(offset, Math.min(offset + chunkSize, file.size));
                  reader.readAsArrayBuffer(slice);
                }
              } else {
                // 发送完成
                console.log('File sent completely:', file.name);
                resolve();
              }
            } catch (error) {
              console.error('Error sending chunk:', error);
              reject(error);
            }
          } else {
            reject(new Error('DataChannel closed during send'));
          }
        };

        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          reject(error);
        };

        // 开始读取第一个块
        const slice = file.slice(offset, Math.min(offset + chunkSize, file.size));
        reader.readAsArrayBuffer(slice);
      } catch (error) {
        console.error('Error sending file header:', error);
        reject(error);
      }
    });
  }

  processFileQueue(peerId) {
    // 处理文件队列
    const queue = this.fileQueue.filter(item => item.peerId === peerId);
    if (queue.length === 0) return;

    const dataChannel = this.dataChannels.get(peerId);
    if (!dataChannel || dataChannel.readyState !== 'open') {
      return;
    }

    // 发送队列中的文件
    queue.forEach(async (item) => {
      try {
        await this.sendFile(item.file, peerId);
        // 从队列中移除
        this.fileQueue = this.fileQueue.filter(q => q !== item);
      } catch (error) {
        console.error('Error sending file from queue:', error);
      }
    });
  }

  getDeviceName() {
    return navigator.userAgentData?.platform || navigator.platform || 'Unknown';
  }

  handlePeerJoined(message) {
    console.log('Peer joined:', message.peerId);
  }

  handlePeerLeft(message) {
    console.log('Peer left:', message.peerId);
    this.connectedPeers.delete(message.peerId);
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'send-file':
          this.handleSendFile(message.file, message.targetPeerId)
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true; // 异步响应

        case 'connect-to-peer':
          this.connectToPeer(message.peerId)
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true;

        case 'get-peers':
          this.sendSignalingMessage({ type: 'get-peers' });
          sendResponse({ success: true });
          break;

        case 'get-device-id':
          sendResponse({ deviceId: this.deviceId, deviceName: this.deviceName });
          break;

        case 'update-settings':
          this.updateSettings(message.settings)
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true;

        case 'get-settings':
          chrome.storage.sync.get(['serverUrl', 'deviceName'], (result) => {
            if (chrome.runtime.lastError) {
              sendResponse({ error: chrome.runtime.lastError.message });
            } else {
              // 如果没有设置，返回默认值（WSS线上服务器）
              if (!result.serverUrl) {
                result.serverUrl = 'wss://dropshare.tech/server/webrtc';
              }
              sendResponse(result);
            }
          });
          return true; // 异步响应

        default:
          console.log('Unknown message type:', message.type);
      }
    });
  }

  async handleSendFile(fileData, targetPeerId) {
    // fileData可能是File对象或包含ArrayBuffer的对象
    let file;
    
    if (fileData instanceof File) {
      file = fileData;
    } else if (fileData.data instanceof ArrayBuffer) {
      // 从popup传递的ArrayBuffer需要转换为File对象
      const blob = new Blob([fileData.data], { type: fileData.type || 'application/octet-stream' });
      file = new File([blob], fileData.name, { type: fileData.type || 'application/octet-stream' });
    } else if (fileData.data instanceof Uint8Array) {
      // 处理Uint8Array
      const blob = new Blob([fileData.data], { type: fileData.type || 'application/octet-stream' });
      file = new File([blob], fileData.name, { type: fileData.type || 'application/octet-stream' });
    } else {
      throw new Error('Invalid file data format');
    }

    // 检查连接状态
    const dataChannel = this.dataChannels.get(targetPeerId);
    if (dataChannel && dataChannel.readyState === 'open') {
      // 直接发送
      return await this.sendFile(file, targetPeerId);
    } else {
      // 添加到队列，等待连接建立
      this.fileQueue.push({ file: file, peerId: targetPeerId });
      // 尝试建立连接
      await this.connectToPeer(targetPeerId);
    }
  }

  sendDataChannelMessage(peerId, message) {
    const dataChannel = this.dataChannels.get(peerId);
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(message);
    }
  }

  async connectToPeer(peerId) {
    let peerConnection = this.peerConnections.get(peerId);
    
    if (!peerConnection) {
      peerConnection = await this.createPeerConnection(peerId);
    }

    // 如果已经有数据通道且已打开，直接返回
    const dataChannel = this.dataChannels.get(peerId);
    if (dataChannel && dataChannel.readyState === 'open') {
      return;
    }

    // 创建offer
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      this.sendSignalingMessage({
        type: 'signal',
        to: peerId,
        signal: {
          type: 'offer',
          sdp: offer.sdp
        }
      });

      console.log('Sent offer to peer:', peerId);
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  async updateSettings(settings) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(settings, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          if (settings.serverUrl) {
            this.serverUrl = settings.serverUrl;
            // 重新连接
            if (this.signalingSocket) {
              this.signalingSocket.close();
            }
            this.connectToSignalingServer();
          }
          if (settings.deviceName) {
            this.deviceName = settings.deviceName;
          }
          resolve();
        }
      });
    });
  }

  setupAlarms() {
    // 定期请求peer列表
    chrome.alarms.create('refreshPeers', { periodInMinutes: 1 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'refreshPeers') {
        if (this.signalingSocket && this.signalingSocket.readyState === WebSocket.OPEN) {
          this.sendSignalingMessage({ type: 'get-peers' });
        }
      }
    });
  }
}

// 初始化扩展
const dropShare = new DropShareExtension();

