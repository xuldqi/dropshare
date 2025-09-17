// DropShare Rooms 功能修复方案
// 统一房间状态管理和文件上传逻辑

class RoomDebugger {
    constructor() {
        this.isDebugMode = localStorage.getItem('roomDebug') === 'true';
        this.log('🔧 Room Debugger initialized');
    }
    
    log(message) {
        if (this.isDebugMode) {
            console.log(`[RoomDebug] ${message}`);
        }
    }
    
    // 检查房间功能的必要条件
    checkRoomRequirements() {
        const requirements = {
            networkExists: !!window.network,
            networkSend: !!(window.network && window.network.send),
            networkConnected: !!(window.network && window.network.isConnected && window.network.isConnected()),
            roomManager: !!window.roomManager,
            isInRoomMode: window.location.hash === '#rooms' || window.location.hash === '#room',
            roomInfo: document.getElementById('roomInfo'),
            fileInput: document.getElementById('fileInput'),
            sharedFilesList: document.getElementById('sharedFilesList')
        };
        
        this.log('Room requirements check:');
        Object.entries(requirements).forEach(([key, value]) => {
            this.log(`  ${key}: ${value}`);
        });
        
        return requirements;
    }
    
    // 修复网络连接问题
    fixNetworkConnection() {
        if (!window.network) {
            this.log('❌ window.network not found, waiting for initialization...');
            return new Promise((resolve) => {
                const checkNetwork = () => {
                    if (window.network && window.network.send) {
                        this.log('✅ Network connection established');
                        resolve(true);
                    } else {
                        setTimeout(checkNetwork, 100);
                    }
                };
                checkNetwork();
            });
        }
        return Promise.resolve(true);
    }
    
    // 强制刷新房间状态
    forceRefreshRoomState() {
        const roomInfo = document.getElementById('roomInfo');
        const roomContainer = document.getElementById('roomContainer');
        const fileTransferArea = document.getElementById('fileTransferArea');
        
        if (roomInfo && roomInfo.classList.contains('active')) {
            this.log('✅ Room is active, showing file transfer area');
            if (fileTransferArea) {
                fileTransferArea.style.display = 'block';
            }
        } else {
            this.log('❌ Room not active, hiding file transfer area');
            if (fileTransferArea) {
                fileTransferArea.style.display = 'none';
            }
        }
    }
    
    // 修复文件上传功能
    fixFileUpload() {
        const fileInput = document.getElementById('fileInput');
        if (!fileInput) {
            this.log('❌ File input not found');
            return;
        }
        
        // 移除旧的事件监听器
        const newFileInput = fileInput.cloneNode(true);
        fileInput.parentNode.replaceChild(newFileInput, fileInput);
        
        // 添加新的事件监听器
        newFileInput.addEventListener('change', (event) => {
            this.handleFileSelection(event.target.files);
        });
        
        this.log('✅ File upload event listener fixed');
    }
    
    // 处理文件选择
    async handleFileSelection(files) {
        if (!files || files.length === 0) {
            this.log('❌ No files selected');
            return Promise.resolve();
        }
        
        this.log(`📁 Processing ${files.length} files`);
        
        // 检查房间状态
        const roomInfo = document.getElementById('roomInfo');
        if (!roomInfo || !roomInfo.classList.contains('active')) {
            alert('请先加入房间才能上传文件');
            this.log('❌ Not in room, cannot upload');
            return Promise.reject(new Error('Not in room'));
        }
        
        // 确保网络连接
        await this.fixNetworkConnection();
        
        // 上传文件
        const uploadPromises = [];
        for (const file of files) {
            uploadPromises.push(this.uploadSingleFile(file));
        }
        
        return Promise.allSettled(uploadPromises);
    }
    
    // 上传单个文件
    async uploadSingleFile(file) {
        this.log(`📤 Uploading: ${file.name} (${file.size} bytes)`);
        
        try {
            // 创建文件信息
            const fileInfo = {
                id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: file.size,
                type: file.type,
                uploader: 'You',
                uploadTime: Date.now(),
                isLocal: true
            };
            
            // 立即添加到本地列表（乐观更新）
            this.addFileToLocalList(fileInfo);
            
            // 如果有网络连接，发送到服务器
            if (window.network && window.network.send && window.network.isConnected()) {
                // 转换文件为 Base64
                const arrayBuffer = await file.arrayBuffer();
                const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
                
                const message = {
                    type: 'room-file-upload',
                    fileInfo: fileInfo,
                    fileData: base64Data
                };
                
                window.network.send(message);
                this.log(`📤 File sent to server: ${file.name}`);
            } else {
                this.log('⚠️ No network connection, file stored locally only');
            }
            
        } catch (error) {
            this.log(`❌ Upload failed for ${file.name}: ${error}`);
            alert(`上传失败: ${file.name}`);
        }
    }
    
    // 添加文件到本地列表
    addFileToLocalList(fileInfo) {
        const sharedFilesList = document.getElementById('sharedFilesList');
        if (!sharedFilesList) {
            this.log('❌ Shared files list not found');
            return;
        }
        
        // 隐藏空状态提示
        const noFiles = sharedFilesList.querySelector('.no-shared-files');
        if (noFiles) {
            noFiles.style.display = 'none';
        }
        
        // 创建文件项
        const fileItem = document.createElement('div');
        fileItem.className = 'shared-file-item';
        fileItem._fileData = fileInfo;
        
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-name">${fileInfo.name}</div>
                <div class="file-details">${this.formatFileSize(fileInfo.size)} • ${fileInfo.uploader}</div>
            </div>
            <div class="file-actions">
                <button class="download-btn" onclick="roomDebugger.downloadFile('${fileInfo.id}')">下载</button>
                <button class="remove-btn" onclick="roomDebugger.removeFile('${fileInfo.id}')">删除</button>
            </div>
        `;
        
        sharedFilesList.appendChild(fileItem);
        this.updateFileCount();
        this.log(`✅ File added to local list: ${fileInfo.name}`);
    }
    
    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // 更新文件数量
    updateFileCount() {
        const fileCount = document.getElementById('fileCount');
        const sharedFilesList = document.getElementById('sharedFilesList');
        
        if (fileCount && sharedFilesList) {
            const count = sharedFilesList.querySelectorAll('.shared-file-item').length;
            fileCount.textContent = count;
        }
    }
    
    // 下载文件
    downloadFile(fileId) {
        const fileItem = document.querySelector(`[data-file-id="${fileId}"], .shared-file-item`);
        if (!fileItem || !fileItem._fileData) {
            this.log(`❌ File not found: ${fileId}`);
            return;
        }
        
        const fileData = fileItem._fileData;
        this.log(`📥 Downloading file: ${fileData.name}`);
        
        // 如果是本地文件，从 IndexedDB 或缓存中获取
        // 这里需要实现具体的下载逻辑
        alert(`下载功能需要进一步实现: ${fileData.name}`);
    }
    
    // 删除文件
    removeFile(fileId) {
        const fileItems = document.querySelectorAll('.shared-file-item');
        let targetItem = null;
        
        for (const item of fileItems) {
            if (item._fileData && item._fileData.id === fileId) {
                targetItem = item;
                break;
            }
        }
        
        if (targetItem) {
            targetItem.remove();
            this.updateFileCount();
            this.log(`🗑️ File removed: ${fileId}`);
            
            // 检查是否需要显示空状态
            const sharedFilesList = document.getElementById('sharedFilesList');
            const remainingFiles = sharedFilesList.querySelectorAll('.shared-file-item');
            if (remainingFiles.length === 0) {
                const noFiles = sharedFilesList.querySelector('.no-shared-files');
                if (noFiles) {
                    noFiles.style.display = 'block';
                }
            }
        } else {
            this.log(`❌ File item not found for removal: ${fileId}`);
        }
    }
    
    // 启用调试模式
    enableDebug() {
        localStorage.setItem('roomDebug', 'true');
        this.isDebugMode = true;
        this.log('🐛 Debug mode enabled');
    }
    
    // 禁用调试模式
    disableDebug() {
        localStorage.setItem('roomDebug', 'false');
        this.isDebugMode = false;
        console.log('[RoomDebug] Debug mode disabled');
    }
    
    // 修复所有已知问题
    fixAllIssues() {
        this.log('🔧 Starting comprehensive room fix...');
        
        setTimeout(() => {
            this.forceRefreshRoomState();
            this.fixFileUpload();
            this.updateFileCount();
            this.log('✅ Room fix completed');
        }, 1000);
    }
}

// 全局初始化房间调试器
if (typeof window !== 'undefined') {
    window.roomDebugger = new RoomDebugger();
    
    // 页面加载后自动修复
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => window.roomDebugger.fixAllIssues(), 2000);
        });
    } else {
        setTimeout(() => window.roomDebugger.fixAllIssues(), 2000);
    }
}

// 添加控制台快捷命令
console.log(`
🔧 DropShare Rooms 调试工具已加载

可用命令:
• roomDebugger.enableDebug() - 启用调试模式
• roomDebugger.checkRoomRequirements() - 检查房间功能要求
• roomDebugger.fixAllIssues() - 修复所有已知问题
• roomDebugger.forceRefreshRoomState() - 强制刷新房间状态
`);