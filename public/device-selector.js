// 设备选择器 - 支持单选和多选发送文件
class DeviceSelector {
    constructor() {
        this.devices = [];
        this.selectedDevices = new Set();
        this.onDeviceUpdate = null;
        this.fileToShare = null;
        this.isVisible = false;
        
        this.createModal();
        this.bindEvents();
        this.startDeviceDiscovery();
    }
    
    // 创建弹窗模态框
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'deviceSelectorModal';
        modal.className = 'device-modal';
        modal.innerHTML = `
            <div class="device-modal-overlay"></div>
            <div class="device-modal-content">
                <div class="device-modal-header">
                    <h3>📤 Select Receiving Device</h3>
                    <button class="device-modal-close" type="button">&times;</button>
                </div>
                
                <div class="device-discovery-status">
                    <div class="discovery-spinner"></div>
                    <span class="discovery-text">Searching for nearby devices...</span>
                </div>
                
                <div class="device-list-container">
                    <div class="device-list-header">
                        <label class="select-all-devices">
                            <input type="checkbox" id="selectAllDevices">
                            <span>Select All Devices</span>
                        </label>
                        <span class="device-count">Found 0 devices</span>
                    </div>
                    
                    <div class="device-list" id="deviceList">
                        <!-- Device list will be dynamically generated here -->
                    </div>
                    
                    <div class="no-devices-message" style="display: none;">
                        <div class="no-devices-icon">📱</div>
                        <p>No nearby devices found</p>
                        <small>Make sure other devices have DropShare open and are on the same network</small>
                    </div>
                </div>
                
                <div class="device-modal-actions">
                    <button class="btn-secondary" id="refreshDevices">
                        🔄 刷新设备
                    </button>
                    <button class="btn-primary" id="sendToSelected" disabled>
                        📤 Send to Selected Devices (<span id="selectedCount">0</span>)
                    </button>
                </div>
                
                <div class="send-progress" style="display: none;">
                    <div class="progress-header">
                        <span>Sending file...</span>
                        <span class="progress-percentage">0%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="send-status"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modal = modal;
    }
    
    // 绑定事件
    bindEvents() {
        const modal = this.modal;
        
        // 关闭模态框
        modal.querySelector('.device-modal-close').onclick = () => this.hide();
        modal.querySelector('.device-modal-overlay').onclick = () => this.hide();
        
        // 全选设备
        modal.querySelector('#selectAllDevices').onchange = (e) => {
            this.toggleSelectAll(e.target.checked);
        };
        
        // 刷新设备
        modal.querySelector('#refreshDevices').onclick = () => {
            this.refreshDevices();
        };
        
        // 发送到选中设备
        modal.querySelector('#sendToSelected').onclick = () => {
            this.sendToSelectedDevices();
        };
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }
    
    // 显示设备选择器
    show(file) {
        this.fileToShare = file;
        this.selectedDevices.clear();
        this.updateSelectedCount();
        this.modal.style.display = 'block';
        this.isVisible = true;
        document.body.style.overflow = 'hidden';
        
        // 开始搜索设备
        this.startDeviceDiscovery();
    }
    
    // 隐藏设备选择器
    hide() {
        this.modal.style.display = 'none';
        this.isVisible = false;
        document.body.style.overflow = '';
        this.selectedDevices.clear();
    }
    
    // 开始设备发现
    startDeviceDiscovery() {
        this.showDiscoveryStatus(true);
        this.devices = [];
        this.renderDeviceList();
        
        // Simulate device discovery (in real app, need WebSocket communication with backend)
        this.discoverDevices();
    }
    
    // 模拟设备发现
    async discoverDevices() {
        // Here should connect to backend WebSocket to get real device list
        // Now simulate some devices
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.devices = [
            {
                id: 'device1',
                name: 'iPhone 13',
                type: 'mobile',
                os: 'iOS',
                online: true,
                lastSeen: new Date()
            },
            {
                id: 'device2', 
                name: 'MacBook Pro',
                type: 'desktop',
                os: 'macOS',
                online: true,
                lastSeen: new Date()
            },
            {
                id: 'device3',
                name: 'iPad Air',
                type: 'tablet',
                os: 'iPadOS',
                online: true,
                lastSeen: new Date()
            },
            {
                id: 'device4',
                name: 'Samsung Galaxy',
                type: 'mobile',
                os: 'Android',
                online: false,
                lastSeen: new Date(Date.now() - 300000)
            }
        ];
        
        this.showDiscoveryStatus(false);
        this.renderDeviceList();
    }
    
    // 显示/隐藏发现状态
    showDiscoveryStatus(show) {
        const status = this.modal.querySelector('.device-discovery-status');
        status.style.display = show ? 'flex' : 'none';
    }
    
    // 渲染设备列表
    renderDeviceList() {
        const deviceList = this.modal.querySelector('#deviceList');
        const noDevicesMessage = this.modal.querySelector('.no-devices-message');
        const deviceCount = this.modal.querySelector('.device-count');
        
        // 更新设备数量
        const onlineDevices = this.devices.filter(d => d.online);
        deviceCount.textContent = `Found ${onlineDevices.length} devices`;
        
        if (onlineDevices.length === 0) {
            deviceList.style.display = 'none';
            noDevicesMessage.style.display = 'block';
            return;
        }
        
        deviceList.style.display = 'block';
        noDevicesMessage.style.display = 'none';
        
        deviceList.innerHTML = this.devices.map(device => `
            <div class="device-item ${device.online ? 'online' : 'offline'}" data-device-id="${device.id}">
                <label class="device-checkbox">
                    <input type="checkbox" ${device.online ? '' : 'disabled'}>
                    <span class="checkmark"></span>
                </label>
                
                <div class="device-icon">
                    ${this.getDeviceIcon(device)}
                </div>
                
                <div class="device-info">
                    <div class="device-name">${device.name}</div>
                    <div class="device-details">
                        <span class="device-os">${device.os}</span>
                        <span class="device-status ${device.online ? 'online' : 'offline'}">
                            ${device.online ? '● Online' : '○ Offline'}
                        </span>
                    </div>
                </div>
                
                <div class="device-actions">
                    ${device.online ? `
                        <button class="btn-quick-send" onclick="deviceSelector.quickSend('${device.id}')">
                            Quick Send
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        // Bind device selection events
        deviceList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.onchange = (e) => {
                const deviceId = e.target.closest('.device-item').dataset.deviceId;
                this.toggleDeviceSelection(deviceId, e.target.checked);
            };
        });
    }
    
    // Get device icon
    getDeviceIcon(device) {
        const icons = {
            mobile: '📱',
            tablet: '📟', 
            desktop: '💻',
            laptop: '💻'
        };
        return icons[device.type] || '📱';
    }
    
    // Toggle device selection
    toggleDeviceSelection(deviceId, selected) {
        if (selected) {
            this.selectedDevices.add(deviceId);
        } else {
            this.selectedDevices.delete(deviceId);
        }
        this.updateSelectedCount();
        this.updateSelectAllCheckbox();
    }
    
    // Update select all state
    toggleSelectAll(selectAll) {
        const onlineDevices = this.devices.filter(d => d.online);
        const checkboxes = this.modal.querySelectorAll('.device-item.online input[type="checkbox"]');
        
        if (selectAll) {
            onlineDevices.forEach(device => this.selectedDevices.add(device.id));
            checkboxes.forEach(cb => cb.checked = true);
        } else {
            this.selectedDevices.clear();
            checkboxes.forEach(cb => cb.checked = false);
        }
        
        this.updateSelectedCount();
    }
    
            // Update select all checkbox state
    updateSelectAllCheckbox() {
        const selectAllCheckbox = this.modal.querySelector('#selectAllDevices');
        const onlineDevices = this.devices.filter(d => d.online);
        const selectedOnlineDevices = onlineDevices.filter(d => this.selectedDevices.has(d.id));
        
        if (selectedOnlineDevices.length === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (selectedOnlineDevices.length === onlineDevices.length) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }
    
    // Update selected device count
    updateSelectedCount() {
        const count = this.selectedDevices.size;
        const selectedCountSpan = this.modal.querySelector('#selectedCount');
        const sendButton = this.modal.querySelector('#sendToSelected');
        
        selectedCountSpan.textContent = count;
        sendButton.disabled = count === 0;
        
        if (count > 0) {
            sendButton.textContent = `📤 Send to Selected Devices (${count})`;
        } else {
            sendButton.textContent = '📤 Send to Selected Devices (0)';
        }
    }
    
    // Quick send to single device
    async quickSend(deviceId) {
        const device = this.devices.find(d => d.id === deviceId);
        if (!device) return;
        
        this.selectedDevices.clear();
        this.selectedDevices.add(deviceId);
        await this.sendToSelectedDevices();
    }
    
    // Send to selected devices
    async sendToSelectedDevices() {
        if (this.selectedDevices.size === 0) {
            alert('Please select receiving devices first');
            return;
        }
        
        const selectedDevicesList = Array.from(this.selectedDevices).map(id => 
            this.devices.find(d => d.id === id)
        ).filter(Boolean);
        
        // Show send progress
        this.showSendProgress(true);
        
        try {
            // Simulate sending process
            for (let i = 0; i < selectedDevicesList.length; i++) {
                const device = selectedDevicesList[i];
                const progress = ((i + 1) / selectedDevicesList.length) * 100;
                
                this.updateSendProgress(progress, `Sending to ${device.name}...`);
                
                // Simulate sending delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Here should call actual file sending API
                console.log(`Sending file to device: ${device.name}`, this.fileToShare);
            }
            
            this.updateSendProgress(100, `Successfully sent to ${selectedDevicesList.length} devices`);
            
            // Delay close
            setTimeout(() => {
                this.hide();
                this.showNotification(`File successfully sent to ${selectedDevicesList.length} devices`);
            }, 1500);
            
        } catch (error) {
            console.error('Send failed:', error);
            this.updateSendProgress(0, 'Send failed, please retry');
            setTimeout(() => this.showSendProgress(false), 2000);
        }
    }
    
    // Show/hide send progress
    showSendProgress(show) {
        const progress = this.modal.querySelector('.send-progress');
        const actions = this.modal.querySelector('.device-modal-actions');
        
        progress.style.display = show ? 'block' : 'none';
        actions.style.display = show ? 'none' : 'flex';
    }
    
    // Update send progress
    updateSendProgress(percentage, status) {
        const progressFill = this.modal.querySelector('.progress-fill');
        const progressPercentage = this.modal.querySelector('.progress-percentage');
        const sendStatus = this.modal.querySelector('.send-status');
        
        progressFill.style.width = `${percentage}%`;
        progressPercentage.textContent = `${Math.round(percentage)}%`;
        sendStatus.textContent = status;
    }
    
    // Refresh device list
    refreshDevices() {
        this.startDeviceDiscovery();
    }
    
    // Show notification
    showNotification(message) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = 'device-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// 创建全局设备选择器实例
window.deviceSelector = new DeviceSelector();
