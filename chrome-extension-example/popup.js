// Popup script for DropShare Extension

class PopupManager {
  constructor() {
    this.selectedFiles = [];
    this.selectedPeerId = null;
    this.peers = [];
    this.deviceId = null;
    
    this.init();
  }

  setupEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const sendButton = document.getElementById('sendButton');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    const serverUrlInput = document.getElementById('serverUrlInput');

    fileInput.addEventListener('change', (e) => {
      this.selectedFiles = Array.from(e.target.files);
      this.updateSelectedFiles();
      this.updateSendButton();
    });

    sendButton.addEventListener('click', () => {
      this.sendFiles();
    });

    // 设置按钮
    settingsBtn.addEventListener('click', () => {
      const isVisible = settingsPanel.style.display !== 'none';
      settingsPanel.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) {
        this.loadSettings();
      }
    });

    // 保存设置
    saveSettingsBtn.addEventListener('click', () => {
      const serverUrl = serverUrlInput.value.trim();
      if (serverUrl) {
        this.saveSettings(serverUrl);
      } else {
        alert('请输入服务器地址');
      }
    });

    // 取消设置
    cancelSettingsBtn.addEventListener('click', () => {
      settingsPanel.style.display = 'none';
    });

    // 自动检测服务器地址
    const autoDetectBtn = document.getElementById('autoDetectBtn');
    if (autoDetectBtn) {
      autoDetectBtn.addEventListener('click', () => {
        this.autoDetectServerUrl();
      });
    }
  }

  autoDetectServerUrl() {
    // 尝试从所有打开的标签页检测服务器地址
    chrome.tabs.query({}, (tabs) => {
      // 查找DropShare相关的标签页
      const dropshareTab = tabs.find(tab => {
        const url = tab.url || '';
        return url.includes('dropshare') || 
               url.includes('localhost:8080') ||
               url.includes('transer.html') ||
               url.includes('share.html') ||
               url.includes('index.html');
      });

      if (dropshareTab && dropshareTab.url) {
        try {
          const url = new URL(dropshareTab.url);
          // 重要：HTTPS网站必须使用WSS，HTTP网站使用WS
          const protocol = url.protocol === 'https:' ? 'wss' : 'ws';
          const host = url.host;
          const wsUrl = `${protocol}://${host}/server/webrtc`;
          
          console.log('🔍 Auto-detected server URL:', wsUrl);
          console.log('🔍 Website protocol:', url.protocol, '→ WebSocket protocol:', protocol);
          
          // 自动保存配置
          this.saveSettings(wsUrl, true);
        } catch (error) {
          console.error('Failed to auto-detect:', error);
        }
      } else {
        // 如果没有找到DropShare标签页，尝试从当前活动标签页检测
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0] && tabs[0].url) {
            try {
              const url = new URL(tabs[0].url);
              // 重要：HTTPS网站必须使用WSS，HTTP网站使用WS
              const protocol = url.protocol === 'https:' ? 'wss' : 'ws';
              const host = url.host;
              const wsUrl = `${protocol}://${host}/server/webrtc`;
              
              console.log('🔍 Auto-detected from current tab:', wsUrl);
              console.log('🔍 Website protocol:', url.protocol, '→ WebSocket protocol:', protocol);
              
              // 填充到输入框（如果设置面板打开）
              const input = document.getElementById('serverUrlInput');
              if (input) {
                input.value = wsUrl;
                input.style.borderColor = '#10b981';
                setTimeout(() => {
                  input.style.borderColor = '#d1d5db';
                }, 2000);
              }
            } catch (error) {
              console.error('Failed to parse URL:', error);
            }
          }
        });
      }
    });
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'peer-list-updated':
          if (message.deviceId) {
            this.deviceId = message.deviceId;
          }
          console.log('📋 Popup received peer list update:', message.peers.length, 'peers');
          this.updatePeerList(message.peers);
          break;
        case 'device-id-updated':
          this.deviceId = message.deviceId;
          console.log('📌 Device ID updated in popup:', message.deviceId);
          // 重新请求peer列表
          this.requestPeerList();
          break;
        case 'status-updated':
          this.updateStatus(message.status, message.message);
          break;
        case 'connection-ready':
          this.updateStatus('connected', `已连接到 ${message.peerId?.substring(0, 8)}...`);
          break;
        case 'connection-closed':
          this.updateStatus('disconnected', '连接已关闭');
          break;
        case 'file-progress':
        case 'file-send-progress':
          this.updateProgress(message.progress, message.fileName, message.received, message.total);
          break;
        case 'file-receiving':
          this.showFileReceiving(message.fileName, message.fileSize);
          break;
        case 'file-completed':
          this.showFileCompleted(message.fileName);
          break;
        case 'file-error':
          this.showFileError(message.error, message.fileName);
          break;
        case 'peer-connected':
          this.updateStatus('connected', `已连接到设备`);
          break;
        case 'peer-disconnected':
          this.updateStatus('disconnected', '设备已断开');
          break;
      }
    });
  }

  requestPeerList() {
    chrome.runtime.sendMessage({ type: 'get-peers' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError);
      }
    });
  }

  updatePeerList(peers) {
    // 过滤掉自己
    this.peers = peers.filter(peer => peer.id !== this.deviceId);
    const deviceList = document.getElementById('deviceList');

    if (this.peers.length === 0) {
      deviceList.innerHTML = '<p style="color: #9ca3af; font-size: 14px; text-align: center; padding: 20px;">未发现其他设备<br><small style="font-size: 12px;">确保其他设备也在线</small></p>';
      return;
    }

    deviceList.innerHTML = this.peers.map(peer => `
      <div class="device-item" data-peer-id="${peer.id}">
        <div>
          <div class="device-name">${peer.name || peer.deviceName || '未知设备'}</div>
          <div class="device-id">${peer.id.substring(0, 8)}...</div>
        </div>
        <div style="font-size: 12px; color: #10b981;">●</div>
      </div>
    `).join('');

    // 添加点击事件
    deviceList.querySelectorAll('.device-item').forEach(item => {
      item.addEventListener('click', () => {
        // 移除之前的选中状态
        deviceList.querySelectorAll('.device-item').forEach(i => {
          i.classList.remove('selected');
        });
        // 添加选中状态
        item.classList.add('selected');
        this.selectedPeerId = item.dataset.peerId;
        this.updateSendButton();
      });
    });
  }

  updateSelectedFiles() {
    const selectedFilesDiv = document.getElementById('selectedFiles');
    if (this.selectedFiles.length === 0) {
      selectedFilesDiv.textContent = '';
      return;
    }

    const fileList = this.selectedFiles.map(file => {
      const size = this.formatFileSize(file.size);
      return `${file.name} (${size})`;
    }).join('<br>');

    selectedFilesDiv.innerHTML = fileList;
  }

  updateSendButton() {
    const sendButton = document.getElementById('sendButton');
    sendButton.disabled = !this.selectedPeerId || this.selectedFiles.length === 0;
  }

  updateStatus(status, message) {
    const statusDiv = document.getElementById('status');
    statusDiv.className = `status ${status}`;
    statusDiv.textContent = message;
  }

  async sendFiles() {
    if (!this.selectedPeerId || this.selectedFiles.length === 0) {
      return;
    }

    const sendButton = document.getElementById('sendButton');
    sendButton.disabled = true;
    sendButton.textContent = '连接中...';

    // 连接到对等端
    chrome.runtime.sendMessage({
      type: 'connect-to-peer',
      peerId: this.selectedPeerId
    }, async (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError);
        this.updateStatus('error', '连接失败: ' + chrome.runtime.lastError.message);
        sendButton.disabled = false;
        sendButton.textContent = '发送文件';
        return;
      }

      if (!response || !response.success) {
        this.updateStatus('error', '连接失败');
        sendButton.disabled = false;
        sendButton.textContent = '发送文件';
        return;
      }

      // 等待连接建立
      await this.waitForConnection(this.selectedPeerId);

      // 发送文件
      await this.sendFilesToPeer();
    });
  }

  waitForConnection(peerId, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkConnection = setInterval(() => {
        chrome.runtime.sendMessage({
          type: 'get-device-id'
        }, (response) => {
          if (Date.now() - startTime > timeout) {
            clearInterval(checkConnection);
            reject(new Error('Connection timeout'));
          }
          // 简化：假设1秒后连接建立
          if (Date.now() - startTime > 1000) {
            clearInterval(checkConnection);
            resolve();
          }
        });
      }, 500);
    });
  }

  async sendFilesToPeer() {
    const progressDiv = document.getElementById('progress');
    progressDiv.style.display = 'block';
    const sendButton = document.getElementById('sendButton');

    for (let i = 0; i < this.selectedFiles.length; i++) {
      const file = this.selectedFiles[i];
      sendButton.textContent = `发送中 (${i + 1}/${this.selectedFiles.length})...`;

      try {
        // 读取文件为ArrayBuffer
        const arrayBuffer = await this.readFileAsArrayBuffer(file);
        
        // 发送文件信息
        await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({
            type: 'send-file',
            file: {
              name: file.name,
              size: file.size,
              type: file.type,
              data: arrayBuffer
            },
            targetPeerId: this.selectedPeerId
          }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (response && response.success) {
              resolve();
            } else {
              reject(new Error(response?.error || '发送失败'));
            }
          });
        });

        console.log('File sent successfully:', file.name);
      } catch (error) {
        console.error('Error sending file:', error);
        this.showFileError(error.message, file.name);
      }
    }

    // 重置
    sendButton.textContent = '发送文件';
    sendButton.disabled = false;
    this.selectedFiles = [];
    document.getElementById('fileInput').value = '';
    this.updateSelectedFiles();
    this.updateSendButton();
    progressDiv.style.display = 'none';
    this.updateStatus('connected', '文件发送完成');
  }

  readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  updateProgress(progress, fileName, received, total) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progressFill.style.width = `${progress * 100}%`;
    
    if (received && total) {
      const receivedStr = this.formatFileSize(received);
      const totalStr = this.formatFileSize(total);
      progressText.textContent = `${Math.round(progress * 100)}% - ${fileName} (${receivedStr} / ${totalStr})`;
    } else {
      progressText.textContent = `${Math.round(progress * 100)}% - ${fileName}`;
    }
  }

  showFileReceiving(fileName, fileSize) {
    const progressDiv = document.getElementById('progress');
    progressDiv.style.display = 'block';
    const progressText = document.getElementById('progressText');
    progressText.textContent = `接收中: ${fileName} (${this.formatFileSize(fileSize)})`;
    this.updateStatus('connected', '正在接收文件...');
  }

  showFileCompleted(fileName) {
    const progressDiv = document.getElementById('progress');
    progressDiv.style.display = 'none';
    this.updateStatus('connected', `${fileName} 接收完成`);
    
    // 3秒后恢复状态
    setTimeout(() => {
      this.updateStatus('connected', '已连接');
    }, 3000);
  }

  showFileError(error, fileName) {
    this.updateStatus('error', `错误: ${error}`);
    console.error('File error:', error, fileName);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  async init() {
    this.setupEventListeners();
    this.setupMessageListeners();
    await this.loadDeviceId();
    await this.checkAndAutoConfig();
    this.requestPeerList();
    this.startPeerListRefresh();
  }

  async checkAndAutoConfig() {
    // 检查是否有服务器配置，如果没有则尝试自动配置
    chrome.runtime.sendMessage({ type: 'get-settings' }, async (response) => {
      if (response && !response.serverUrl) {
        // 没有配置，尝试自动检测
        this.autoDetectServerUrl();
      } else if (response && response.serverUrl) {
        // 已有配置，显示当前配置
        const statusDiv = document.getElementById('status');
        const host = new URL(response.serverUrl).host;
        statusDiv.textContent = `已配置: ${host}`;
        statusDiv.className = 'status connected';
      }
    });
  }

  async loadDeviceId() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'get-device-id' }, (response) => {
        if (response && response.deviceId) {
          this.deviceId = response.deviceId;
        }
        resolve();
      });
    });
  }

  startPeerListRefresh() {
    // 每5秒刷新一次peer列表
    setInterval(() => {
      this.requestPeerList();
    }, 5000);
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'get-settings' }, (response) => {
        if (response && response.serverUrl) {
          document.getElementById('serverUrlInput').value = response.serverUrl;
        }
        resolve();
      });
    });
  }

  async saveSettings(serverUrl, silent = false) {
    // 验证URL格式
    if (!serverUrl.startsWith('ws://') && !serverUrl.startsWith('wss://')) {
      if (!silent) {
        alert('服务器地址必须以 ws:// 或 wss:// 开头');
      }
      return;
    }
    
    // 智能协议检测：如果不是localhost，建议使用WSS
    if (serverUrl.startsWith('ws://') && !serverUrl.includes('localhost') && !serverUrl.includes('127.0.0.1')) {
      console.log('⚠️ Using WS for non-localhost server, consider using WSS');
      if (!silent) {
        const useWSS = confirm('检测到您使用的是非本地服务器。\n\n建议使用WSS（安全连接）以获得更好的兼容性。\n\n是否自动切换到WSS？');
        if (useWSS) {
          serverUrl = serverUrl.replace('ws://', 'wss://');
          const input = document.getElementById('serverUrlInput');
          if (input) {
            input.value = serverUrl;
          }
        }
      }
    }

    chrome.runtime.sendMessage({
      type: 'update-settings',
      settings: {
        serverUrl: serverUrl
      }
    }, (response) => {
      if (chrome.runtime.lastError) {
        if (!silent) {
          alert('保存失败: ' + chrome.runtime.lastError.message);
        }
      } else if (response && response.success) {
        if (!silent) {
          alert('设置已保存，正在重新连接...');
          document.getElementById('settingsPanel').style.display = 'none';
        }
        this.updateStatus('disconnected', '正在重新连接...');
      } else {
        if (!silent) {
          alert('保存失败');
        }
      }
    });
  }
}

// 初始化popup
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});

