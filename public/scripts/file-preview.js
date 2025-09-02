// 文件预览功能
class FilePreview {
    constructor() {
        this.modal = null;
        this.currentFile = null;
        this.currentZoom = 1;
        this.currentRotation = 0;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.imagePosition = { x: 0, y: 0 };
        this.supportedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
        this.supportedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
        this.supportedAudioTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/m4a'];
        this.supportedDocumentTypes = ['application/pdf', 'text/plain', 'text/html', 'text/css', 'text/javascript', 'application/json'];
        
        this.init();
    }
    
    init() {
        this.createModal();
        this.bindEvents();
    }
    
    createModal() {
        const modalHTML = `
            <div class="file-preview-modal" id="filePreviewModal">
                <div class="preview-container" id="previewContainer">
                    <div class="preview-header">
                        <h3 class="preview-title" id="previewTitle">文件预览</h3>
                        <button class="preview-close" id="previewClose" title="关闭预览">
                            ×
                        </button>
                    </div>
                    <div class="preview-content" id="previewContent">
                        <div class="preview-loading" id="previewLoading">
                            <div class="loading-spinner"></div>
                            <div class="loading-text">正在加载...</div>
                        </div>
                    </div>
                    <div class="preview-controls" id="previewControls">
                        <!-- 控制按钮将根据文件类型动态生成 -->
                    </div>
                    <div class="file-info-panel" id="fileInfoPanel">
                        <!-- 文件信息将动态填充 -->
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('filePreviewModal');
    }
    
    bindEvents() {
        // 关闭按钮
        document.getElementById('previewClose').addEventListener('click', () => this.close());
        
        // 点击模态框背景关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.close();
            }
        });
        
        // 阻止模态框内容区域的点击事件冒泡
        document.getElementById('previewContainer').addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    open(file, fileName = null) {
        this.currentFile = file;
        this.currentZoom = 1;
        this.currentRotation = 0;
        this.imagePosition = { x: 0, y: 0 };
        
        const title = fileName || file.name || '未知文件';
        document.getElementById('previewTitle').textContent = title;
        
        this.showLoading();
        this.modal.classList.add('show');
        
        // 根据文件类型处理预览
        this.handleFileType(file);
        
        // 显示文件信息
        this.showFileInfo(file, title);
    }
    
    close() {
        this.modal.classList.remove('show');
        this.currentFile = null;
        
        // 清理内容
        setTimeout(() => {
            const content = document.getElementById('previewContent');
            content.innerHTML = '<div class="preview-loading" id="previewLoading"><div class="loading-spinner"></div><div class="loading-text">正在加载...</div></div>';
            document.getElementById('previewControls').innerHTML = '';
            document.getElementById('fileInfoPanel').classList.remove('show');
        }, 300);
    }
    
    showLoading() {
        const content = document.getElementById('previewContent');
        content.innerHTML = '<div class="preview-loading"><div class="loading-spinner"></div><div class="loading-text">正在加载...</div></div>';
    }
    
    showError(message = '无法预览此文件') {
        const content = document.getElementById('previewContent');
        content.innerHTML = `
            <div class="preview-error">
                <div class="error-icon">⚠️</div>
                <div class="error-message">${message}</div>
                <div class="error-details">请检查文件格式是否支持</div>
            </div>
        `;
    }
    
    handleFileType(file) {
        const fileType = file.type || this.getFileTypeFromName(file.name);
        
        if (this.supportedImageTypes.includes(fileType)) {
            this.previewImage(file);
        } else if (this.supportedVideoTypes.includes(fileType)) {
            this.previewVideo(file);
        } else if (this.supportedAudioTypes.includes(fileType)) {
            this.previewAudio(file);
        } else if (this.supportedDocumentTypes.includes(fileType)) {
            this.previewDocument(file);
        } else {
            this.showUnsupportedFile(file);
        }
    }
    
    getFileTypeFromName(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const typeMap = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'bmp': 'image/bmp',
            'svg': 'image/svg+xml',
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'ogg': 'video/ogg',
            'avi': 'video/avi',
            'mov': 'video/mov',
            'mp3': 'audio/mp3',
            'wav': 'audio/wav',
            'aac': 'audio/aac',
            'flac': 'audio/flac',
            'm4a': 'audio/m4a',
            'pdf': 'application/pdf',
            'txt': 'text/plain',
            'html': 'text/html',
            'css': 'text/css',
            'js': 'text/javascript',
            'json': 'application/json'
        };
        return typeMap[ext] || 'application/octet-stream';
    }
    
    previewImage(file) {
        const url = URL.createObjectURL(file);
        const content = document.getElementById('previewContent');
        
        const img = new Image();
        img.onload = () => {
            content.innerHTML = `<img class="preview-image" id="previewImage" src="${url}" alt="预览图片">`;
            this.setupImageControls();
            this.bindImageEvents();
        };
        img.onerror = () => {
            this.showError('图片加载失败');
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }
    
    previewVideo(file) {
        const url = URL.createObjectURL(file);
        const content = document.getElementById('previewContent');
        
        content.innerHTML = `
            <video class="preview-video" id="previewVideo" controls>
                <source src="${url}" type="${file.type}">
                您的浏览器不支持视频播放。
            </video>
        `;
        
        this.setupVideoControls();
        
        const video = document.getElementById('previewVideo');
        video.addEventListener('error', () => {
            this.showError('视频加载失败');
            URL.revokeObjectURL(url);
        });
    }
    
    previewAudio(file) {
        const url = URL.createObjectURL(file);
        const content = document.getElementById('previewContent');
        
        content.innerHTML = `
            <div class="audio-info">
                <div class="audio-icon">🎵</div>
                <div class="document-name">${file.name}</div>
                <div class="document-size">${this.formatFileSize(file.size)}</div>
            </div>
            <audio class="preview-audio" id="previewAudio" controls>
                <source src="${url}" type="${file.type}">
                您的浏览器不支持音频播放。
            </audio>
        `;
        
        this.setupAudioControls();
        
        const audio = document.getElementById('previewAudio');
        audio.addEventListener('error', () => {
            this.showError('音频加载失败');
            URL.revokeObjectURL(url);
        });
    }
    
    previewDocument(file) {
        const content = document.getElementById('previewContent');
        
        if (file.type === 'application/pdf') {
            const url = URL.createObjectURL(file);
            content.innerHTML = `<iframe class="preview-document" src="${url}" title="PDF预览"></iframe>`;
        } else if (file.type.startsWith('text/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                content.innerHTML = `<pre class="preview-text" style="padding: 20px; white-space: pre-wrap; font-family: monospace; max-height: 70vh; overflow: auto; background: var(--bg-color); color: var(--text-color);">${this.escapeHtml(text)}</pre>`;
            };
            reader.onerror = () => {
                this.showError('文本文件读取失败');
            };
            reader.readAsText(file);
        } else {
            this.showUnsupportedFile(file);
        }
        
        this.setupDocumentControls();
    }
    
    showUnsupportedFile(file) {
        const content = document.getElementById('previewContent');
        const icon = this.getFileIcon(file.name);
        
        content.innerHTML = `
            <div class="document-placeholder">
                <div class="document-icon">${icon}</div>
                <div class="document-info">
                    <div class="document-name">${file.name}</div>
                    <div class="document-size">${this.formatFileSize(file.size)}</div>
                </div>
                <div style="margin-top: 20px; opacity: 0.7;">此文件类型不支持预览</div>
                <button class="control-btn primary" onclick="filePreview.downloadFile()" style="margin-top: 16px;">
                    📥 下载文件
                </button>
            </div>
        `;
    }
    
    setupImageControls() {
        const controls = document.getElementById('previewControls');
        controls.innerHTML = `
            <div class="zoom-controls">
                <button class="control-btn" onclick="filePreview.zoomOut()">🔍-</button>
                <span class="zoom-level">${Math.round(this.currentZoom * 100)}%</span>
                <button class="control-btn" onclick="filePreview.zoomIn()">🔍+</button>
            </div>
            <div class="rotation-controls">
                <button class="control-btn" onclick="filePreview.rotateLeft()">↺</button>
                <button class="control-btn" onclick="filePreview.rotateRight()">↻</button>
            </div>
            <button class="control-btn" onclick="filePreview.resetImage()">重置</button>
            <button class="control-btn" onclick="filePreview.toggleFullscreen()">全屏</button>
            <button class="control-btn" onclick="filePreview.toggleFileInfo()">信息</button>
            <button class="control-btn primary" onclick="filePreview.downloadFile()">下载</button>
        `;
    }
    
    setupVideoControls() {
        const controls = document.getElementById('previewControls');
        controls.innerHTML = `
            <button class="control-btn" onclick="filePreview.toggleFullscreen()">全屏</button>
            <button class="control-btn" onclick="filePreview.toggleFileInfo()">信息</button>
            <button class="control-btn primary" onclick="filePreview.downloadFile()">下载</button>
        `;
    }
    
    setupAudioControls() {
        const controls = document.getElementById('previewControls');
        controls.innerHTML = `
            <button class="control-btn" onclick="filePreview.toggleFileInfo()">信息</button>
            <button class="control-btn primary" onclick="filePreview.downloadFile()">下载</button>
        `;
    }
    
    setupDocumentControls() {
        const controls = document.getElementById('previewControls');
        controls.innerHTML = `
            <button class="control-btn" onclick="filePreview.toggleFullscreen()">全屏</button>
            <button class="control-btn" onclick="filePreview.toggleFileInfo()">信息</button>
            <button class="control-btn primary" onclick="filePreview.downloadFile()">下载</button>
        `;
    }
    
    bindImageEvents() {
        const img = document.getElementById('previewImage');
        if (!img) return;
        
        // 鼠标拖拽
        img.addEventListener('mousedown', (e) => {
            if (this.currentZoom > 1) {
                this.isDragging = true;
                this.dragStart = { x: e.clientX - this.imagePosition.x, y: e.clientY - this.imagePosition.y };
                img.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.imagePosition.x = e.clientX - this.dragStart.x;
                this.imagePosition.y = e.clientY - this.dragStart.y;
                this.updateImageTransform();
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                const img = document.getElementById('previewImage');
                if (img) {
                    img.style.cursor = this.currentZoom > 1 ? 'grab' : 'default';
                }
            }
        });
        
        // 滚轮缩放
        img.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                this.zoomIn();
            } else {
                this.zoomOut();
            }
        });
        
        // 触摸事件（移动端）
        let touchStartDistance = 0;
        let touchStartZoom = 1;
        
        img.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                touchStartDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                touchStartZoom = this.currentZoom;
                e.preventDefault();
            }
        });
        
        img.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                const scale = currentDistance / touchStartDistance;
                this.currentZoom = Math.max(0.5, Math.min(5, touchStartZoom * scale));
                this.updateImageTransform();
                this.updateZoomLevel();
                e.preventDefault();
            }
        });
    }
    
    zoomIn() {
        this.currentZoom = Math.min(5, this.currentZoom * 1.2);
        this.updateImageTransform();
        this.updateZoomLevel();
    }
    
    zoomOut() {
        this.currentZoom = Math.max(0.5, this.currentZoom / 1.2);
        this.updateImageTransform();
        this.updateZoomLevel();
    }
    
    rotateLeft() {
        this.currentRotation -= 90;
        this.updateImageTransform();
    }
    
    rotateRight() {
        this.currentRotation += 90;
        this.updateImageTransform();
    }
    
    resetImage() {
        this.currentZoom = 1;
        this.currentRotation = 0;
        this.imagePosition = { x: 0, y: 0 };
        this.updateImageTransform();
        this.updateZoomLevel();
    }
    
    updateImageTransform() {
        const img = document.getElementById('previewImage');
        if (img) {
            img.style.transform = `translate(${this.imagePosition.x}px, ${this.imagePosition.y}px) scale(${this.currentZoom}) rotate(${this.currentRotation}deg)`;
            img.classList.toggle('zoomed', this.currentZoom > 1);
        }
    }
    
    updateZoomLevel() {
        const zoomLevel = document.querySelector('.zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(this.currentZoom * 100)}%`;
        }
    }
    
    toggleFullscreen() {
        const container = document.getElementById('previewContainer');
        container.classList.toggle('fullscreen');
    }
    
    toggleFileInfo() {
        const panel = document.getElementById('fileInfoPanel');
        panel.classList.toggle('show');
    }
    
    showFileInfo(file, fileName) {
        const panel = document.getElementById('fileInfoPanel');
        const fileType = file.type || this.getFileTypeFromName(file.name);
        
        panel.innerHTML = `
            <div class="info-row">
                <span class="info-label">文件名:</span>
                <span>${fileName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">大小:</span>
                <span>${this.formatFileSize(file.size)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">类型:</span>
                <span>${fileType}</span>
            </div>
            <div class="info-row">
                <span class="info-label">修改时间:</span>
                <span>${file.lastModified ? new Date(file.lastModified).toLocaleString() : '未知'}</span>
            </div>
        `;
    }
    
    downloadFile() {
        if (!this.currentFile) return;
        
        const url = URL.createObjectURL(this.currentFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.currentFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    getFileIcon(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const iconMap = {
            'pdf': '📄',
            'doc': '📝', 'docx': '📝',
            'xls': '📊', 'xlsx': '📊',
            'ppt': '📽️', 'pptx': '📽️',
            'txt': '📄',
            'zip': '🗜️', 'rar': '🗜️', '7z': '🗜️',
            'exe': '⚙️', 'msi': '⚙️',
            'dmg': '💿',
            'iso': '💿'
        };
        return iconMap[ext] || '📄';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 全局实例
const filePreview = new FilePreview();

// 导出给其他模块使用
window.FilePreview = FilePreview;
window.filePreview = filePreview;

// 为文件传输界面添加预览按钮
document.addEventListener('DOMContentLoaded', () => {
    // 监听文件选择事件，添加预览选项
    Events.on('files-selected', (e) => {
        const files = e.detail.files;
        if (files && files.length === 1) {
            // 如果只选择了一个文件，显示预览选项
            showPreviewOption(files[0]);
        }
    });
});

// 显示预览选项
function showPreviewOption(file) {
    // 检查是否支持预览
    const fileType = file.type || filePreview.getFileTypeFromName(file.name);
    const isSupported = filePreview.supportedImageTypes.includes(fileType) ||
                       filePreview.supportedVideoTypes.includes(fileType) ||
                       filePreview.supportedAudioTypes.includes(fileType) ||
                       filePreview.supportedDocumentTypes.includes(fileType);
    
    if (isSupported) {
        // 创建预览按钮（如果不存在）
        let previewBtn = document.getElementById('previewFileBtn');
        if (!previewBtn) {
            previewBtn = document.createElement('button');
            previewBtn.id = 'previewFileBtn';
            previewBtn.className = 'control-btn';
            previewBtn.innerHTML = '👁️ 预览文件';
            previewBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                background: var(--primary-color);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
            `;
            
            previewBtn.addEventListener('click', () => {
                filePreview.open(file);
                previewBtn.remove();
            });
            
            document.body.appendChild(previewBtn);
            
            // 5秒后自动隐藏
            setTimeout(() => {
                if (previewBtn.parentNode) {
                    previewBtn.remove();
                }
            }, 5000);
        }
    }
}