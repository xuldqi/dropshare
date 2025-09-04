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
                    <h3>📤 选择接收设备</h3>
                    <button class="device-modal-close" type="button">&times;</button>
                </div>
                
                <div class="device-discovery-status">
                    <div class="discovery-spinner"></div>
                    <span class="discovery-text">正在搜索附近设备...</span>
                </div>
                
                <div class="device-list-container">
                    <div class="device-list-header">
                        <label class="select-all-devices">
                            <input type="checkbox" id="selectAllDevices">
                            <span>全选设备</span>
                        </label>
                        <span class="device-count">找到 0 个设备</span>
                    </div>
                    
                    <div class="device-list" id="deviceList">
                        <!-- 设备列表将在这里动态生成 -->
                    </div>
                    
                    <div class="no-devices-message" style="display: none;">
                        <div class="no-devices-icon">📱</div>
                        <p>未发现附近设备</p>
                        <small>确保其他设备也打开了 DropShare 并在同一网络中</small>
                    </div>
                </div>
                
                <div class="device-modal-actions">
                    <button class="btn-secondary" id="refreshDevices">
                        🔄 刷新设备
                    </button>
                    <button class="btn-primary" id="sendToSelected" disabled>
                        📤 发送到选中设备 (<span id="selectedCount">0</span>)
                    </button>
                </div>
                
                <div class="send-progress" style="display: none;">
                    <div class="progress-header">
                        <span>正在发送文件...</span>
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
        
        // ESC键关闭
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
        
        // 模拟设备发现（实际应用中需要与后端WebSocket通信）
        this.discoverDevices();
    }
    
    // 模拟设备发现
    async discoverDevices() {
        // 这里应该连接到后端WebSocket获取真实设备列表
        // 现在先模拟一些设备
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
        deviceCount.textContent = `找到 ${onlineDevices.length} 个设备`;
        
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
                            ${device.online ? '● 在线' : '○ 离线'}
                        </span>
                    </div>
                </div>
                
                <div class="device-actions">
                    ${device.online ? `
                        <button class="btn-quick-send" onclick="deviceSelector.quickSend('${device.id}')">
                            快速发送
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        // 绑定设备选择事件
        deviceList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.onchange = (e) => {
                const deviceId = e.target.closest('.device-item').dataset.deviceId;
                this.toggleDeviceSelection(deviceId, e.target.checked);
            };
        });
    }
    
    // 获取设备图标
    getDeviceIcon(device) {
        const icons = {
            mobile: '📱',
            tablet: '📟', 
            desktop: '💻',
            laptop: '💻'
        };
        return icons[device.type] || '📱';
    }
    
    // 切换设备选择
    toggleDeviceSelection(deviceId, selected) {
        if (selected) {
            this.selectedDevices.add(deviceId);
        } else {
            this.selectedDevices.delete(deviceId);
        }
        this.updateSelectedCount();
        this.updateSelectAllCheckbox();
    }
    
    // 更新全选状态
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
    
    // 更新全选复选框状态
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
    
    // 更新选中设备数量
    updateSelectedCount() {
        const count = this.selectedDevices.size;
        const selectedCountSpan = this.modal.querySelector('#selectedCount');
        const sendButton = this.modal.querySelector('#sendToSelected');
        
        selectedCountSpan.textContent = count;
        sendButton.disabled = count === 0;
        
        if (count > 0) {
            sendButton.textContent = `📤 发送到选中设备 (${count})`;
        } else {
            sendButton.textContent = '📤 发送到选中设备 (0)';
        }
    }
    
    // 快速发送到单个设备
    async quickSend(deviceId) {
        const device = this.devices.find(d => d.id === deviceId);
        if (!device) return;
        
        this.selectedDevices.clear();
        this.selectedDevices.add(deviceId);
        await this.sendToSelectedDevices();
    }
    
    // 发送到选中设备
    async sendToSelectedDevices() {
        if (this.selectedDevices.size === 0) {
            alert('请先选择接收设备');
            return;
        }
        
        const selectedDevicesList = Array.from(this.selectedDevices).map(id => 
            this.devices.find(d => d.id === id)
        ).filter(Boolean);
        
        // 显示发送进度
        this.showSendProgress(true);
        
        try {
            // 模拟发送过程
            for (let i = 0; i < selectedDevicesList.length; i++) {
                const device = selectedDevicesList[i];
                const progress = ((i + 1) / selectedDevicesList.length) * 100;
                
                this.updateSendProgress(progress, `正在发送到 ${device.name}...`);
                
                // 模拟发送延迟
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // 这里应该调用实际的文件发送API
                console.log(`发送文件到设备: ${device.name}`, this.fileToShare);
            }
            
            this.updateSendProgress(100, `成功发送到 ${selectedDevicesList.length} 个设备`);
            
            // 延迟关闭
            setTimeout(() => {
                this.hide();
                this.showNotification(`文件已成功发送到 ${selectedDevicesList.length} 个设备`);
            }, 1500);
            
        } catch (error) {
            console.error('发送失败:', error);
            this.updateSendProgress(0, '发送失败，请重试');
            setTimeout(() => this.showSendProgress(false), 2000);
        }
    }
    
    // 显示/隐藏发送进度
    showSendProgress(show) {
        const progress = this.modal.querySelector('.send-progress');
        const actions = this.modal.querySelector('.device-modal-actions');
        
        progress.style.display = show ? 'block' : 'none';
        actions.style.display = show ? 'none' : 'flex';
    }
    
    // 更新发送进度
    updateSendProgress(percentage, status) {
        const progressFill = this.modal.querySelector('.progress-fill');
        const progressPercentage = this.modal.querySelector('.progress-percentage');
        const sendStatus = this.modal.querySelector('.send-status');
        
        progressFill.style.width = `${percentage}%`;
        progressPercentage.textContent = `${Math.round(percentage)}%`;
        sendStatus.textContent = status;
    }
    
    // 刷新设备列表
    refreshDevices() {
        this.startDeviceDiscovery();
    }
    
    // 显示通知
    showNotification(message) {
        // 创建临时通知
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
        
        // 3秒后自动移除
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// 创建全局设备选择器实例
window.deviceSelector = new DeviceSelector();
