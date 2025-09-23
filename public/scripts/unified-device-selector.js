/**
 * 统一设备选择器 - 提供统一的设备选择界面
 * 替换现有的各种设备选择实现，提供更好的用户体验
 */
class UnifiedDeviceSelector {
    constructor(transferManager) {
        this.transferManager = transferManager || new TransferManager();
        this.selectedDevices = new Set();
        this.currentFiles = null;
        this.modal = null;
        this.isVisible = false;
        
        // UI 元素
        this.elements = {};
        
        console.log('🖥️ UnifiedDeviceSelector initialized');
        this.init();
    }

    /**
     * 初始化设备选择器
     */
    init() {
        this.createModal();
        this.setupEventListeners();
        this.setupTransferManagerListeners();
    }

    /**
     * 创建模态框
     */
    createModal() {
        // 如果已存在，先移除
        const existingModal = document.getElementById('unifiedDeviceSelector');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'unifiedDeviceSelector';
        modal.className = 'unified-device-modal';
        modal.innerHTML = this.getModalHTML();
        
        document.body.appendChild(modal);
        this.modal = modal;
        
        // 缓存常用元素
        this.cacheElements();
        
        // 添加样式
        this.addStyles();
        
        console.log('✅ Device selector modal created');
    }

    /**
     * 获取模态框HTML
     */
    getModalHTML() {
        return `
            <div class="device-modal-overlay"></div>
            <div class="device-modal-content">
                <div class="device-modal-header">
                    <div class="header-content">
                        <div class="header-icon">📤</div>
                        <div class="header-text">
                            <h3 data-i18n="transfer_select_devices">选择接收设备</h3>
                            <p class="header-subtitle" data-i18n="transfer_select_subtitle">选择要接收文件的设备</p>
                        </div>
                    </div>
                    <button class="device-modal-close" type="button">&times;</button>
                </div>
                
                <!-- 文件信息显示 -->
                <div class="file-info-section">
                    <div class="file-info-header">
                        <span data-i18n="transfer_files_to_send">要发送的文件:</span>
                    </div>
                    <div class="file-list" id="fileList">
                        <!-- 文件列表将在这里动态生成 -->
                    </div>
                </div>
                
                <!-- 设备发现状态 -->
                <div class="device-discovery-section">
                    <div class="discovery-status" id="discoveryStatus">
                        <div class="discovery-spinner"></div>
                        <span class="discovery-text" data-i18n="transfer_discovering">正在搜索附近的设备...</span>
                    </div>
                </div>
                
                <!-- 设备列表 -->
                <div class="device-list-section">
                    <div class="device-list-header">
                        <div class="selection-controls">
                            <label class="select-all-checkbox">
                                <input type="checkbox" id="selectAllDevices">
                                <span data-i18n="transfer_select_all">全选设备</span>
                            </label>
                        </div>
                        <div class="device-count">
                            <span id="deviceCount">找到 0 台设备</span>
                        </div>
                    </div>
                    
                    <div class="device-list" id="deviceList">
                        <!-- 设备列表将在这里动态生成 -->
                    </div>
                    
                    <div class="no-devices-message" id="noDevicesMessage" style="display: none;">
                        <div class="no-devices-icon">📱</div>
                        <h4 data-i18n="transfer_no_devices">未发现可用设备</h4>
                        <p data-i18n="transfer_no_devices_desc">请确保其他设备已打开DropShare并连接到同一网络</p>
                        <button class="refresh-btn" id="refreshDevices">
                            <span>🔄</span>
                            <span data-i18n="transfer_refresh">刷新设备</span>
                        </button>
                    </div>
                </div>
                
                <!-- 操作按钮 -->
                <div class="device-modal-actions">
                    <button class="btn-secondary" id="cancelBtn">
                        <span data-i18n="transfer_cancel">取消</span>
                    </button>
                    <button class="btn-primary" id="sendBtn" disabled>
                        <span class="btn-icon">📤</span>
                        <span class="btn-text">
                            <span data-i18n="transfer_send_to">发送到</span>
                            <span id="selectedCount">0</span>
                            <span data-i18n="transfer_devices">台设备</span>
                        </span>
                    </button>
                </div>
                
                <!-- 传送进度 -->
                <div class="transfer-progress-section" id="transferProgress" style="display: none;">
                    <div class="progress-header">
                        <span class="progress-title" data-i18n="transfer_sending">正在发送文件...</span>
                        <span class="progress-percentage">0%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="progress-status" id="progressStatus">
                        <span data-i18n="transfer_preparing">准备中...</span>
                    </div>
                    <div class="progress-actions">
                        <button class="btn-secondary" id="cancelTransferBtn">
                            <span data-i18n="transfer_cancel">取消传送</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 缓存常用DOM元素
     */
    cacheElements() {
        this.elements = {
            overlay: this.modal.querySelector('.device-modal-overlay'),
            closeBtn: this.modal.querySelector('.device-modal-close'),
            fileList: this.modal.querySelector('#fileList'),
            discoveryStatus: this.modal.querySelector('#discoveryStatus'),
            deviceList: this.modal.querySelector('#deviceList'),
            deviceCount: this.modal.querySelector('#deviceCount'),
            noDevicesMessage: this.modal.querySelector('#noDevicesMessage'),
            selectAllDevices: this.modal.querySelector('#selectAllDevices'),
            refreshBtn: this.modal.querySelector('#refreshDevices'),
            cancelBtn: this.modal.querySelector('#cancelBtn'),
            sendBtn: this.modal.querySelector('#sendBtn'),
            selectedCount: this.modal.querySelector('#selectedCount'),
            transferProgress: this.modal.querySelector('#transferProgress'),
            progressFill: this.modal.querySelector('.progress-fill'),
            progressPercentage: this.modal.querySelector('.progress-percentage'),
            progressStatus: this.modal.querySelector('#progressStatus'),
            cancelTransferBtn: this.modal.querySelector('#cancelTransferBtn')
        };
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 关闭按钮
        this.elements.closeBtn.addEventListener('click', () => this.hide());
        this.elements.overlay.addEventListener('click', () => this.hide());
        this.elements.cancelBtn.addEventListener('click', () => this.hide());
        
        // 全选设备
        this.elements.selectAllDevices.addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });
        
        // 刷新设备
        this.elements.refreshBtn.addEventListener('click', () => {
            this.refreshDevices();
        });
        
        // 发送按钮
        this.elements.sendBtn.addEventListener('click', () => {
            this.startTransfer();
        });
        
        // 取消传送
        this.elements.cancelTransferBtn.addEventListener('click', () => {
            this.cancelTransfer();
        });
        
        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    /**
     * 设置传送管理器监听器
     */
    setupTransferManagerListeners() {
        this.transferManager.addEventListener('devices-updated', (devices) => {
            this.updateDeviceList(devices);
        });
        
        this.transferManager.addEventListener('device-added', (device) => {
            this.addDeviceToList(device);
        });
        
        this.transferManager.addEventListener('device-removed', (device) => {
            this.removeDeviceFromList(device);
        });
        
        this.transferManager.addEventListener('transfer-started', (transfer) => {
            this.showTransferProgress();
        });
        
        this.transferManager.addEventListener('transfer-progress', (transfer) => {
            this.updateTransferProgress(transfer);
        });
        
        this.transferManager.addEventListener('transfer-completed', (transfer) => {
            this.handleTransferCompleted(transfer);
        });
        
        this.transferManager.addEventListener('transfer-failed', (transfer) => {
            this.handleTransferFailed(transfer);
        });
    }

    /**
     * 显示设备选择器
     */
    show(fileOrFiles) {
        this.currentFiles = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
        this.selectedDevices.clear();
        
        // 显示模态框
        this.modal.classList.add('show');
        this.isVisible = true;
        
        // 更新文件信息
        this.updateFileList();
        
        // 开始设备发现
        this.startDeviceDiscovery();
        
        // 更新UI状态
        this.updateSendButton();
        this.hideTransferProgress();
        
        console.log(`📱 Device selector shown for ${this.currentFiles.length} files`);
    }

    /**
     * 隐藏设备选择器
     */
    hide() {
        this.modal.classList.remove('show');
        this.isVisible = false;
        
        // 重置状态
        this.selectedDevices.clear();
        this.currentFiles = null;
        this.currentTransferId = null;
        
        console.log('📱 Device selector hidden');
    }

    /**
     * 更新文件列表显示
     */
    updateFileList() {
        if (!this.currentFiles || this.currentFiles.length === 0) {
            this.elements.fileList.innerHTML = '<p>没有要发送的文件</p>';
            return;
        }
        
        const fileItems = this.currentFiles.map(file => {
            const fileSize = this.formatFileSize(file.size || 0);
            const fileName = file.name || '未知文件';
            const fileType = this.getFileTypeIcon(file.type || file.name);
            
            return `
                <div class="file-item">
                    <div class="file-icon">${fileType}</div>
                    <div class="file-info">
                        <div class="file-name">${fileName}</div>
                        <div class="file-size">${fileSize}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        this.elements.fileList.innerHTML = fileItems;
    }

    /**
     * 开始设备发现
     */
    startDeviceDiscovery() {
        // 显示发现状态
        this.elements.discoveryStatus.style.display = 'flex';
        this.elements.noDevicesMessage.style.display = 'none';
        
        // 清空设备列表
        this.elements.deviceList.innerHTML = '';
        this.updateDeviceCount(0);
        
        // 触发设备发现
        this.transferManager.startDeviceDiscovery();
        
        console.log('🔍 Device discovery started');
    }

    /**
     * 更新设备列表
     */
    updateDeviceList(devices) {
        console.log(`📱 Updating device list: ${devices.length} devices`);
        
        // 隐藏发现状态
        this.elements.discoveryStatus.style.display = 'none';
        
        if (devices.length === 0) {
            this.elements.noDevicesMessage.style.display = 'block';
            this.elements.deviceList.innerHTML = '';
        } else {
            this.elements.noDevicesMessage.style.display = 'none';
            this.renderDeviceList(devices);
        }
        
        this.updateDeviceCount(devices.length);
    }

    /**
     * 渲染设备列表
     */
    renderDeviceList(devices) {
        const deviceItems = devices.map(device => {
            const isSelected = this.selectedDevices.has(device.id);
            const deviceIcon = this.getDeviceIcon(device.type);
            const deviceStatus = this.getDeviceStatus(device);
            
            return `
                <div class="device-item ${isSelected ? 'selected' : ''}" data-device-id="${device.id}">
                    <div class="device-checkbox-container">
                        <input type="checkbox" class="device-checkbox" ${isSelected ? 'checked' : ''}>
                    </div>
                    <div class="device-icon">${deviceIcon}</div>
                    <div class="device-info">
                        <div class="device-name">${device.name}</div>
                        <div class="device-type">${device.type}</div>
                        <div class="device-status ${device.status}">${deviceStatus}</div>
                    </div>
                    <div class="device-signal">
                        <div class="signal-bars">
                            <div class="bar"></div>
                            <div class="bar"></div>
                            <div class="bar"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        this.elements.deviceList.innerHTML = deviceItems;
        
        // 添加点击事件
        this.elements.deviceList.querySelectorAll('.device-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const deviceId = item.getAttribute('data-device-id');
                this.toggleDeviceSelection(deviceId);
            });
        });
    }

    /**
     * 添加设备到列表
     */
    addDeviceToList(device) {
        // 如果设备列表为空，先隐藏"无设备"消息
        if (this.elements.deviceList.children.length === 0) {
            this.elements.noDevicesMessage.style.display = 'none';
        }
        
        // 检查设备是否已存在
        const existingDevice = this.elements.deviceList.querySelector(`[data-device-id="${device.id}"]`);
        if (existingDevice) {
            return; // 设备已存在，不重复添加
        }
        
        // 创建设备项
        const deviceElement = document.createElement('div');
        deviceElement.className = 'device-item';
        deviceElement.setAttribute('data-device-id', device.id);
        deviceElement.innerHTML = `
            <div class="device-checkbox-container">
                <input type="checkbox" class="device-checkbox">
            </div>
            <div class="device-icon">${this.getDeviceIcon(device.type)}</div>
            <div class="device-info">
                <div class="device-name">${device.name}</div>
                <div class="device-type">${device.type}</div>
                <div class="device-status ${device.status}">${this.getDeviceStatus(device)}</div>
            </div>
            <div class="device-signal">
                <div class="signal-bars">
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                </div>
            </div>
        `;
        
        // 添加点击事件
        deviceElement.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleDeviceSelection(device.id);
        });
        
        this.elements.deviceList.appendChild(deviceElement);
        
        // 更新设备计数
        this.updateDeviceCount(this.elements.deviceList.children.length);
    }

    /**
     * 从列表中移除设备
     */
    removeDeviceFromList(device) {
        const deviceElement = this.elements.deviceList.querySelector(`[data-device-id="${device.id}"]`);
        if (deviceElement) {
            deviceElement.remove();
            
            // 如果选中了这个设备，从选中列表中移除
            this.selectedDevices.delete(device.id);
            this.updateSendButton();
            
            // 更新设备计数
            this.updateDeviceCount(this.elements.deviceList.children.length);
            
            // 如果没有设备了，显示"无设备"消息
            if (this.elements.deviceList.children.length === 0) {
                this.elements.noDevicesMessage.style.display = 'block';
            }
        }
    }

    /**
     * 切换设备选择状态
     */
    toggleDeviceSelection(deviceId) {
        const deviceElement = this.elements.deviceList.querySelector(`[data-device-id="${deviceId}"]`);
        const checkbox = deviceElement.querySelector('.device-checkbox');
        
        if (this.selectedDevices.has(deviceId)) {
            this.selectedDevices.delete(deviceId);
            deviceElement.classList.remove('selected');
            checkbox.checked = false;
        } else {
            this.selectedDevices.add(deviceId);
            deviceElement.classList.add('selected');
            checkbox.checked = true;
        }
        
        this.updateSendButton();
        this.updateSelectAllCheckbox();
        
        console.log(`📱 Device ${deviceId} selection toggled. Selected: ${this.selectedDevices.size}`);
    }

    /**
     * 全选/取消全选设备
     */
    toggleSelectAll(selectAll) {
        this.elements.deviceList.querySelectorAll('.device-item').forEach(item => {
            const deviceId = item.getAttribute('data-device-id');
            const checkbox = item.querySelector('.device-checkbox');
            
            if (selectAll) {
                this.selectedDevices.add(deviceId);
                item.classList.add('selected');
                checkbox.checked = true;
            } else {
                this.selectedDevices.delete(deviceId);
                item.classList.remove('selected');
                checkbox.checked = false;
            }
        });
        
        this.updateSendButton();
        console.log(`📱 ${selectAll ? 'Selected all' : 'Deselected all'} devices`);
    }

    /**
     * 更新全选复选框状态
     */
    updateSelectAllCheckbox() {
        const totalDevices = this.elements.deviceList.children.length;
        const selectedDevices = this.selectedDevices.size;
        
        if (selectedDevices === 0) {
            this.elements.selectAllDevices.checked = false;
            this.elements.selectAllDevices.indeterminate = false;
        } else if (selectedDevices === totalDevices) {
            this.elements.selectAllDevices.checked = true;
            this.elements.selectAllDevices.indeterminate = false;
        } else {
            this.elements.selectAllDevices.checked = false;
            this.elements.selectAllDevices.indeterminate = true;
        }
    }

    /**
     * 更新发送按钮状态
     */
    updateSendButton() {
        const hasSelectedDevices = this.selectedDevices.size > 0;
        this.elements.sendBtn.disabled = !hasSelectedDevices;
        this.elements.selectedCount.textContent = this.selectedDevices.size;
        
        if (hasSelectedDevices) {
            this.elements.sendBtn.classList.add('enabled');
        } else {
            this.elements.sendBtn.classList.remove('enabled');
        }
    }

    /**
     * 更新设备计数
     */
    updateDeviceCount(count) {
        this.elements.deviceCount.textContent = `找到 ${count} 台设备`;
    }

    /**
     * 刷新设备列表
     */
    refreshDevices() {
        console.log('🔄 Refreshing devices...');
        this.startDeviceDiscovery();
    }

    /**
     * 开始传送
     */
    async startTransfer() {
        if (this.selectedDevices.size === 0 || !this.currentFiles) {
            return;
        }
        
        try {
            console.log(`📤 Starting transfer to ${this.selectedDevices.size} devices`);
            
            const deviceIds = Array.from(this.selectedDevices);
            this.currentTransferId = await this.transferManager.sendToDevices(this.currentFiles, deviceIds);
            
        } catch (error) {
            console.error('❌ Transfer failed:', error);
            alert('传送失败: ' + error.message);
        }
    }

    /**
     * 显示传送进度
     */
    showTransferProgress() {
        this.elements.transferProgress.style.display = 'block';
        this.elements.sendBtn.style.display = 'none';
        this.elements.cancelBtn.style.display = 'none';
        
        // 重置进度
        this.updateTransferProgress({ progress: 0, status: 'preparing' });
    }

    /**
     * 隐藏传送进度
     */
    hideTransferProgress() {
        this.elements.transferProgress.style.display = 'none';
        this.elements.sendBtn.style.display = 'block';
        this.elements.cancelBtn.style.display = 'block';
    }

    /**
     * 更新传送进度
     */
    updateTransferProgress(transfer) {
        const progress = Math.max(0, Math.min(100, transfer.progress || 0));
        
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressPercentage.textContent = `${Math.round(progress)}%`;
        
        // 更新状态文本
        let statusText = '准备中...';
        switch (transfer.status) {
            case 'preparing':
                statusText = '准备中...';
                break;
            case 'sending':
                statusText = `正在发送到 ${this.selectedDevices.size} 台设备...`;
                break;
            case 'completed':
                statusText = '传送完成！';
                break;
            case 'failed':
                statusText = '传送失败';
                break;
            case 'cancelled':
                statusText = '已取消';
                break;
        }
        
        this.elements.progressStatus.textContent = statusText;
    }

    /**
     * 处理传送完成
     */
    handleTransferCompleted(transfer) {
        console.log('✅ Transfer completed:', transfer);
        
        // 显示成功消息
        setTimeout(() => {
            alert(`✅ 文件已成功发送到 ${this.selectedDevices.size} 台设备！`);
            this.hide();
        }, 1000);
    }

    /**
     * 处理传送失败
     */
    handleTransferFailed(transfer) {
        console.error('❌ Transfer failed:', transfer);
        
        // 显示错误消息
        alert(`❌ 传送失败: ${transfer.error || '未知错误'}`);
        this.hideTransferProgress();
    }

    /**
     * 取消传送
     */
    cancelTransfer() {
        if (this.currentTransferId) {
            this.transferManager.cancelTransfer(this.currentTransferId);
            this.hideTransferProgress();
        }
    }

    /**
     * 获取设备图标
     */
    getDeviceIcon(deviceType) {
        const icons = {
            'iOS': '📱',
            'iPhone': '📱',
            'iPad': '📱',
            'Android': '📱',
            'macOS': '💻',
            'Mac': '💻',
            'Windows': '🖥️',
            'PC': '🖥️',
            'Linux': '🖥️',
            'Chrome': '🌐',
            'Firefox': '🌐',
            'Safari': '🌐',
            'Edge': '🌐',
            'Unknown': '📱'
        };
        
        return icons[deviceType] || icons['Unknown'];
    }

    /**
     * 获取设备状态文本
     */
    getDeviceStatus(device) {
        const statusTexts = {
            'online': '在线',
            'offline': '离线',
            'connecting': '连接中',
            'error': '错误'
        };
        
        return statusTexts[device.status] || '未知';
    }

    /**
     * 获取文件类型图标
     */
    getFileTypeIcon(fileType) {
        if (!fileType) return '📄';
        
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType.startsWith('video/')) return '🎥';
        if (fileType.startsWith('audio/')) return '🎵';
        if (fileType.includes('pdf')) return '📕';
        if (fileType.includes('word') || fileType.includes('document')) return '📝';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
        if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('archive')) return '🗜️';
        
        return '📄';
    }

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 添加样式
     */
    addStyles() {
        // 检查是否已添加样式
        if (document.getElementById('unifiedDeviceSelectorStyles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'unifiedDeviceSelectorStyles';
        style.textContent = `
            .unified-device-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: none;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .unified-device-modal.show {
                display: flex;
                opacity: 1;
            }
            
            .device-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
            }
            
            .device-modal-content {
                position: relative;
                background: white;
                border-radius: 16px;
                width: 90%;
                max-width: 600px;
                max-height: 85vh;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                display: flex;
                flex-direction: column;
            }
            
            .device-modal-header {
                padding: 20px 24px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #f9fafb;
            }
            
            .header-content {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .header-icon {
                font-size: 24px;
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #3b82f6;
                border-radius: 12px;
                color: white;
            }
            
            .header-text h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #111827;
            }
            
            .header-subtitle {
                margin: 4px 0 0 0;
                font-size: 14px;
                color: #6b7280;
            }
            
            .device-modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                padding: 8px;
                border-radius: 8px;
                color: #6b7280;
                transition: all 0.2s;
            }
            
            .device-modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .file-info-section {
                padding: 16px 24px;
                border-bottom: 1px solid #e5e7eb;
                background: #fefefe;
            }
            
            .file-info-header {
                font-size: 14px;
                font-weight: 500;
                color: #374151;
                margin-bottom: 12px;
            }
            
            .file-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
                max-height: 120px;
                overflow-y: auto;
            }
            
            .file-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px 12px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
            }
            
            .file-icon {
                font-size: 20px;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f3f4f6;
                border-radius: 6px;
            }
            
            .file-info {
                flex: 1;
                min-width: 0;
            }
            
            .file-name {
                font-size: 14px;
                font-weight: 500;
                color: #111827;
                truncate: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
            
            .file-size {
                font-size: 12px;
                color: #6b7280;
            }
            
            .device-discovery-section {
                padding: 20px 24px;
                text-align: center;
            }
            
            .discovery-status {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                padding: 16px;
                background: #f0f9ff;
                border: 1px solid #e0f2fe;
                border-radius: 8px;
            }
            
            .discovery-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid #bfdbfe;
                border-top-color: #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .discovery-text {
                font-size: 14px;
                color: #1e40af;
                font-weight: 500;
            }
            
            .device-list-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                min-height: 0;
            }
            
            .device-list-header {
                padding: 16px 24px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #fafafa;
            }
            
            .select-all-checkbox {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                font-size: 14px;
                color: #374151;
            }
            
            .select-all-checkbox input {
                margin: 0;
            }
            
            .device-count {
                font-size: 14px;
                color: #6b7280;
                font-weight: 500;
            }
            
            .device-list {
                flex: 1;
                overflow-y: auto;
                padding: 8px 24px;
                max-height: 300px;
            }
            
            .device-item {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 12px 16px;
                border: 2px solid transparent;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
                margin-bottom: 8px;
                background: white;
            }
            
            .device-item:hover {
                background: #f8fafc;
                border-color: #e2e8f0;
            }
            
            .device-item.selected {
                background: #eff6ff;
                border-color: #3b82f6;
            }
            
            .device-checkbox-container {
                display: flex;
                align-items: center;
            }
            
            .device-checkbox {
                margin: 0;
                transform: scale(1.2);
            }
            
            .device-icon {
                font-size: 24px;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f3f4f6;
                border-radius: 10px;
            }
            
            .device-item.selected .device-icon {
                background: #dbeafe;
            }
            
            .device-info {
                flex: 1;
                min-width: 0;
            }
            
            .device-name {
                font-size: 16px;
                font-weight: 600;
                color: #111827;
                margin-bottom: 2px;
            }
            
            .device-type {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 2px;
            }
            
            .device-status {
                font-size: 12px;
                font-weight: 500;
                padding: 2px 6px;
                border-radius: 4px;
                display: inline-block;
            }
            
            .device-status.online {
                background: #dcfce7;
                color: #166534;
            }
            
            .device-status.offline {
                background: #fee2e2;
                color: #991b1b;
            }
            
            .device-signal {
                display: flex;
                align-items: center;
            }
            
            .signal-bars {
                display: flex;
                gap: 2px;
                align-items: end;
                height: 16px;
            }
            
            .signal-bars .bar {
                width: 3px;
                background: #10b981;
                border-radius: 1px;
            }
            
            .signal-bars .bar:nth-child(1) { height: 4px; }
            .signal-bars .bar:nth-child(2) { height: 8px; }
            .signal-bars .bar:nth-child(3) { height: 12px; }
            
            .no-devices-message {
                text-align: center;
                padding: 40px 20px;
                color: #6b7280;
            }
            
            .no-devices-icon {
                font-size: 48px;
                margin-bottom: 16px;
            }
            
            .no-devices-message h4 {
                margin: 0 0 8px 0;
                font-size: 18px;
                color: #374151;
            }
            
            .no-devices-message p {
                margin: 0 0 20px 0;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .refresh-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                transition: background 0.2s;
            }
            
            .refresh-btn:hover {
                background: #2563eb;
            }
            
            .device-modal-actions {
                padding: 20px 24px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                background: #fafafa;
            }
            
            .btn-secondary, .btn-primary {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
            }
            
            .btn-secondary:hover {
                background: #e5e7eb;
            }
            
            .btn-primary {
                background: #6b7280;
                color: white;
            }
            
            .btn-primary.enabled {
                background: #3b82f6;
            }
            
            .btn-primary.enabled:hover {
                background: #2563eb;
            }
            
            .btn-primary:disabled {
                cursor: not-allowed;
                opacity: 0.6;
            }
            
            .transfer-progress-section {
                padding: 24px;
                border-top: 1px solid #e5e7eb;
                background: #fafafa;
            }
            
            .progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }
            
            .progress-title {
                font-size: 16px;
                font-weight: 500;
                color: #111827;
            }
            
            .progress-percentage {
                font-size: 14px;
                font-weight: 600;
                color: #3b82f6;
            }
            
            .progress-bar {
                width: 100%;
                height: 8px;
                background: #e5e7eb;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 12px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                border-radius: 4px;
                transition: width 0.3s ease;
                width: 0%;
            }
            
            .progress-status {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 16px;
            }
            
            .progress-actions {
                display: flex;
                justify-content: center;
            }
            
            @media (max-width: 768px) {
                .device-modal-content {
                    width: 95%;
                    max-height: 90vh;
                    margin: 20px;
                }
                
                .device-modal-header {
                    padding: 16px 20px;
                }
                
                .header-content {
                    gap: 12px;
                }
                
                .header-icon {
                    width: 40px;
                    height: 40px;
                    font-size: 20px;
                }
                
                .device-list {
                    padding: 8px 20px;
                }
                
                .device-item {
                    padding: 10px 12px;
                    gap: 12px;
                }
                
                .device-icon {
                    width: 36px;
                    height: 36px;
                    font-size: 20px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// 创建全局实例
window.UnifiedDeviceSelector = UnifiedDeviceSelector;

console.log('📦 UnifiedDeviceSelector class loaded');
