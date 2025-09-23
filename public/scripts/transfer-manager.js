/**
 * 统一传送管理器 - 负责设备发现、文件传送和状态管理
 * 与主传送系统(share.html)的设备发现机制集成
 */
class TransferManager {
    constructor() {
        this.devices = new Map();
        this.transferQueue = [];
        this.activeTransfers = new Map();
        this.eventListeners = new Map();
        this.isInitialized = false;
        
        console.log('🚀 TransferManager initialized');
        this.init();
    }

    /**
     * 初始化传送管理器
     */
    async init() {
        try {
            // 尝试连接到主传送系统的事件总线
            this.connectToMainTransferSystem();
            
            // 设置设备发现监听器
            this.setupDeviceDiscoveryListeners();
            
            // 开始设备发现
            await this.startDeviceDiscovery();
            
            this.isInitialized = true;
            console.log('✅ TransferManager initialization complete');
        } catch (error) {
            console.error('❌ TransferManager initialization failed:', error);
        }
    }

    /**
     * 连接到主传送系统的事件总线
     */
    connectToMainTransferSystem() {
        // 检查是否有主传送系统的Events对象
        if (typeof window.Events !== 'undefined') {
            console.log('🔗 Connected to main transfer system Events');
            
            // 监听设备更新事件
            window.Events.on('peers', (e) => {
                this.handlePeersUpdate(e.detail);
            });
            
            // 监听传送进度事件
            window.Events.on('file-progress', (e) => {
                this.handleTransferProgress(e.detail);
            });
            
            return true;
        } else {
            console.log('⚠️ Main transfer system not available, using fallback mode');
            return false;
        }
    }

    /**
     * 设置设备发现监听器
     */
    setupDeviceDiscoveryListeners() {
        // 如果有主传送系统的PeersManager，直接获取设备列表
        if (typeof window.peersManager !== 'undefined') {
            this.syncWithPeersManager();
        }
    }

    /**
     * 与主传送系统的PeersManager同步
     */
    syncWithPeersManager() {
        try {
            // 获取当前已连接的设备
            if (window.peersManager && window.peersManager.peers) {
                const peers = window.peersManager.peers;
                Object.keys(peers).forEach(peerId => {
                    const peer = peers[peerId];
                    this.addDevice({
                        id: peerId,
                        name: peer.name || peerId,
                        type: peer.deviceType || 'Unknown',
                        status: 'online',
                        connection: peer
                    });
                });
                console.log(`🔄 Synced ${this.devices.size} devices from PeersManager`);
            }
        } catch (error) {
            console.error('❌ Failed to sync with PeersManager:', error);
        }
    }

    /**
     * 开始设备发现
     */
    async startDeviceDiscovery() {
        // 如果主传送系统可用，使用其设备发现
        if (typeof window.Events !== 'undefined') {
            console.log('🔍 Using main transfer system for device discovery');
            return;
        }
        
        // 否则使用模拟设备发现（开发模式）
        console.log('🔍 Starting simulated device discovery');
        await this.simulateDeviceDiscovery();
    }

    /**
     * 模拟设备发现（用于开发和测试）
     */
    async simulateDeviceDiscovery() {
        // 模拟发现一些设备
        const simulatedDevices = [
            {
                id: 'sim-device-1',
                name: 'iPhone 15 Pro',
                type: 'iOS',
                status: 'online'
            },
            {
                id: 'sim-device-2', 
                name: 'MacBook Pro',
                type: 'macOS',
                status: 'online'
            },
            {
                id: 'sim-device-3',
                name: 'Windows PC',
                type: 'Windows',
                status: 'online'
            }
        ];

        // 延迟模拟网络发现时间
        await new Promise(resolve => setTimeout(resolve, 1500));

        simulatedDevices.forEach(device => {
            this.addDevice(device);
        });

        console.log(`📱 Simulated discovery complete: ${this.devices.size} devices found`);
    }

    /**
     * 处理设备列表更新
     */
    handlePeersUpdate(peers) {
        console.log('📱 Peers updated:', peers);
        
        // 清空现有设备列表
        this.devices.clear();
        
        // 添加新的设备
        if (Array.isArray(peers)) {
            peers.forEach(peer => {
                this.addDevice({
                    id: peer.id,
                    name: peer.name || peer.id,
                    type: peer.deviceType || 'Unknown',
                    status: 'online',
                    connection: peer
                });
            });
        }
        
        // 通知监听器设备列表已更新
        this.notifyListeners('devices-updated', Array.from(this.devices.values()));
    }

    /**
     * 添加设备到列表
     */
    addDevice(device) {
        this.devices.set(device.id, {
            ...device,
            lastSeen: Date.now()
        });
        
        console.log(`➕ Device added: ${device.name} (${device.id})`);
        
        // 通知监听器有新设备
        this.notifyListeners('device-added', device);
    }

    /**
     * 移除设备
     */
    removeDevice(deviceId) {
        if (this.devices.has(deviceId)) {
            const device = this.devices.get(deviceId);
            this.devices.delete(deviceId);
            console.log(`➖ Device removed: ${device.name} (${deviceId})`);
            
            // 通知监听器设备已移除
            this.notifyListeners('device-removed', device);
        }
    }

    /**
     * 获取在线设备列表
     */
    getOnlineDevices() {
        return Array.from(this.devices.values()).filter(device => 
            device.status === 'online'
        );
    }

    /**
     * 发送文件到指定设备
     */
    async sendToDevices(fileOrFiles, deviceIds) {
        if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
            throw new Error('No devices selected');
        }

        const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
        const transferId = this.generateTransferId();
        
        console.log(`📤 Starting transfer ${transferId} to ${deviceIds.length} devices`);
        
        // 创建传送记录
        const transfer = {
            id: transferId,
            files: files,
            devices: deviceIds,
            status: 'preparing',
            progress: 0,
            startTime: Date.now(),
            errors: []
        };
        
        this.activeTransfers.set(transferId, transfer);
        
        try {
            // 通知开始传送
            this.notifyListeners('transfer-started', transfer);
            
            // 如果有主传送系统，使用其传送机制
            if (typeof window.Events !== 'undefined') {
                await this.sendViaMainSystem(files, deviceIds, transferId);
            } else {
                // 否则使用模拟传送
                await this.simulateTransfer(files, deviceIds, transferId);
            }
            
        } catch (error) {
            console.error('❌ Transfer failed:', error);
            transfer.status = 'failed';
            transfer.error = error.message;
            this.notifyListeners('transfer-failed', transfer);
            throw error;
        }
        
        return transferId;
    }

    /**
     * 通过主传送系统发送文件
     */
    async sendViaMainSystem(files, deviceIds, transferId) {
        const transfer = this.activeTransfers.get(transferId);
        transfer.status = 'sending';
        
        // 向每个设备发送文件
        for (const deviceId of deviceIds) {
            try {
                console.log(`📤 Sending to device: ${deviceId}`);
                
                // 使用主传送系统的Events发送文件
                window.Events.fire('files-selected', {
                    files: files,
                    to: deviceId
                });
                
                // 更新进度
                transfer.progress = Math.round((deviceIds.indexOf(deviceId) + 1) / deviceIds.length * 100);
                this.notifyListeners('transfer-progress', transfer);
                
            } catch (error) {
                console.error(`❌ Failed to send to device ${deviceId}:`, error);
                transfer.errors.push({
                    deviceId: deviceId,
                    error: error.message
                });
            }
        }
        
        // 标记传送完成
        transfer.status = 'completed';
        transfer.progress = 100;
        transfer.endTime = Date.now();
        
        console.log(`✅ Transfer ${transferId} completed`);
        this.notifyListeners('transfer-completed', transfer);
    }

    /**
     * 模拟文件传送（用于开发和测试）
     */
    async simulateTransfer(files, deviceIds, transferId) {
        const transfer = this.activeTransfers.get(transferId);
        transfer.status = 'sending';
        
        // 模拟传送进度
        for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            
            transfer.progress = progress;
            this.notifyListeners('transfer-progress', transfer);
        }
        
        // 标记传送完成
        transfer.status = 'completed';
        transfer.endTime = Date.now();
        
        console.log(`✅ Simulated transfer ${transferId} completed to ${deviceIds.length} devices`);
        this.notifyListeners('transfer-completed', transfer);
    }

    /**
     * 处理传送进度更新
     */
    handleTransferProgress(progressData) {
        // 如果有对应的传送记录，更新其进度
        const transfer = Array.from(this.activeTransfers.values()).find(t => 
            t.files.some(f => f.name === progressData.fileName)
        );
        
        if (transfer) {
            transfer.progress = progressData.progress;
            this.notifyListeners('transfer-progress', transfer);
        }
    }

    /**
     * 获取传送状态
     */
    getTransferStatus(transferId) {
        return this.activeTransfers.get(transferId);
    }

    /**
     * 取消传送
     */
    cancelTransfer(transferId) {
        const transfer = this.activeTransfers.get(transferId);
        if (transfer && transfer.status === 'sending') {
            transfer.status = 'cancelled';
            console.log(`🛑 Transfer ${transferId} cancelled`);
            this.notifyListeners('transfer-cancelled', transfer);
        }
    }

    /**
     * 添加事件监听器
     */
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * 移除事件监听器
     */
    removeEventListener(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * 通知所有监听器
     */
    notifyListeners(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * 生成传送ID
     */
    generateTransferId() {
        return 'transfer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 清理资源
     */
    destroy() {
        this.devices.clear();
        this.transferQueue = [];
        this.activeTransfers.clear();
        this.eventListeners.clear();
        console.log('🧹 TransferManager destroyed');
    }
}

// 创建全局实例
window.TransferManager = TransferManager;

console.log('📦 TransferManager class loaded');
