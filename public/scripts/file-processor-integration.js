/**
 * 文件处理集成 - 为所有文件处理页面提供统一的传送功能
 * 自动检测处理结果并添加传送按钮，实现无缝的处理-传送体验
 */
class FileProcessorIntegration {
    constructor() {
        this.transferManager = null;
        this.deviceSelector = null;
        this.processedFiles = new Map();
        this.observers = [];
        this.integrationId = 'fileProcessor_' + Date.now();
        
        console.log('🔧 FileProcessorIntegration initialized');
        this.init();
    }

    /**
     * 初始化文件处理集成
     */
    async init() {
        try {
            // 初始化传送管理器和设备选择器
            await this.initTransferComponents();
            
            // 设置页面监控
            this.setupPageMonitoring();
            
            // 添加全局样式
            this.addGlobalStyles();
            
            // 扫描现有的下载按钮
            this.scanExistingElements();
            
            console.log('✅ FileProcessorIntegration initialization complete');
        } catch (error) {
            console.error('❌ FileProcessorIntegration initialization failed:', error);
        }
    }

    /**
     * 初始化传送组件
     */
    async initTransferComponents() {
        // 检查是否已有全局实例
        if (window.globalTransferManager) {
            this.transferManager = window.globalTransferManager;
        } else {
            this.transferManager = new TransferManager();
            window.globalTransferManager = this.transferManager;
        }
        
        if (window.globalDeviceSelector) {
            this.deviceSelector = window.globalDeviceSelector;
        } else {
            this.deviceSelector = new UnifiedDeviceSelector(this.transferManager);
            window.globalDeviceSelector = this.deviceSelector;
        }
        
        console.log('🔗 Transfer components initialized');
    }

    /**
     * 设置页面监控
     */
    setupPageMonitoring() {
        // 监控DOM变化，自动为新的下载按钮添加传送功能
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.scanElementForDownloadButtons(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        this.observers.push(observer);
        
        console.log('👀 Page monitoring setup complete');
    }

    /**
     * 扫描现有元素
     */
    scanExistingElements() {
        // 等待页面加载完成后扫描
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.scanElementForDownloadButtons(document.body), 1000);
            });
        } else {
            setTimeout(() => this.scanElementForDownloadButtons(document.body), 1000);
        }
    }

    /**
     * 扫描元素中的下载按钮
     */
    scanElementForDownloadButtons(element) {
        if (!element || !element.querySelectorAll) return;
        
        // 查找各种类型的下载按钮
        const downloadSelectors = [
            'button[onclick*="download"]',
            'a[download]',
            'button[class*="download"]',
            'a[class*="download"]',
            '.download-btn',
            '.btn-download',
            '#downloadBtn',
            '#download-button'
        ];
        
        downloadSelectors.forEach(selector => {
            const buttons = element.querySelectorAll(selector);
            buttons.forEach(button => this.processDownloadButton(button));
        });
        
        // 特殊处理：查找结果容器
        this.scanResultContainers(element);
    }

    /**
     * 扫描结果容器
     */
    scanResultContainers(element) {
        const resultSelectors = [
            '.result',
            '.output',
            '.processed',
            '#result',
            '#output',
            '.conversion-result',
            '.tool-result'
        ];
        
        resultSelectors.forEach(selector => {
            const containers = element.querySelectorAll(selector);
            containers.forEach(container => {
                if (container.style.display !== 'none' && !container.hidden) {
                    this.processResultContainer(container);
                }
            });
        });
    }

    /**
     * 处理下载按钮
     */
    processDownloadButton(button) {
        // 检查是否已经处理过
        if (button.hasAttribute('data-transfer-processed')) {
            return;
        }
        
        // 标记为已处理
        button.setAttribute('data-transfer-processed', 'true');
        
        // 获取文件信息
        const fileInfo = this.extractFileInfo(button);
        if (!fileInfo) {
            console.log('⚠️ Could not extract file info from button:', button);
            return;
        }
        
        // 创建传送按钮
        const transferButton = this.createTransferButton(fileInfo);
        
        // 插入传送按钮
        this.insertTransferButton(button, transferButton);
        
        console.log('✅ Transfer button added for:', fileInfo.name);
    }

    /**
     * 处理结果容器
     */
    processResultContainer(container) {
        // 检查是否已经处理过
        if (container.hasAttribute('data-transfer-container-processed')) {
            return;
        }
        
        // 标记为已处理
        container.setAttribute('data-transfer-container-processed', 'true');
        
        // 查找容器中的下载链接或文件信息
        const files = this.extractFilesFromContainer(container);
        if (files.length === 0) {
            return;
        }
        
        // 创建传送按钮组
        const transferButtonGroup = this.createTransferButtonGroup(files);
        
        // 插入到容器中
        container.appendChild(transferButtonGroup);
        
        console.log('✅ Transfer button group added to container with', files.length, 'files');
    }

    /**
     * 提取文件信息
     */
    extractFileInfo(button) {
        let fileInfo = null;
        
        // 方法1：从下载链接提取
        if (button.tagName === 'A' && button.download && button.href) {
            fileInfo = {
                name: button.download || 'processed-file',
                url: button.href,
                type: this.guessFileType(button.download || button.href),
                source: 'download-link'
            };
        }
        
        // 方法2：从onclick属性提取
        else if (button.onclick) {
            const onclickStr = button.onclick.toString();
            const urlMatch = onclickStr.match(/blob:[^"'\)]+/);
            const nameMatch = onclickStr.match(/download[^"']*["']([^"']+)["']/);
            
            if (urlMatch) {
                fileInfo = {
                    name: nameMatch ? nameMatch[1] : 'processed-file',
                    url: urlMatch[0],
                    type: nameMatch ? this.guessFileType(nameMatch[1]) : 'application/octet-stream',
                    source: 'onclick-blob'
                };
            }
        }
        
        // 方法3：从全局变量提取（一些页面将结果存储在全局变量中）
        else if (typeof window.processedFile !== 'undefined') {
            fileInfo = {
                name: window.processedFile.name || 'processed-file',
                data: window.processedFile.data || window.processedFile,
                type: window.processedFile.type || 'application/octet-stream',
                source: 'global-variable'
            };
        }
        
        // 方法4：查找相邻的canvas元素
        else {
            const canvas = this.findNearbyCanvas(button);
            if (canvas) {
                fileInfo = {
                    name: 'image-result.png',
                    canvas: canvas,
                    type: 'image/png',
                    source: 'canvas'
                };
            }
        }
        
        return fileInfo;
    }

    /**
     * 从容器中提取文件列表
     */
    extractFilesFromContainer(container) {
        const files = [];
        
        // 查找下载链接
        const downloadLinks = container.querySelectorAll('a[download], a[href^="blob:"]');
        downloadLinks.forEach(link => {
            const fileInfo = this.extractFileInfo(link);
            if (fileInfo) {
                files.push(fileInfo);
            }
        });
        
        // 查找canvas元素
        const canvases = container.querySelectorAll('canvas');
        canvases.forEach((canvas, index) => {
            files.push({
                name: `canvas-result-${index + 1}.png`,
                canvas: canvas,
                type: 'image/png',
                source: 'canvas'
            });
        });
        
        // 查找图片元素（如果src是blob）
        const images = container.querySelectorAll('img[src^="blob:"]');
        images.forEach((img, index) => {
            files.push({
                name: `image-result-${index + 1}.png`,
                url: img.src,
                type: 'image/png',
                source: 'image-blob'
            });
        });
        
        return files;
    }

    /**
     * 查找附近的canvas元素
     */
    findNearbyCanvas(button) {
        // 在按钮的父容器中查找canvas
        let parent = button.parentElement;
        while (parent && parent !== document.body) {
            const canvas = parent.querySelector('canvas');
            if (canvas) {
                return canvas;
            }
            parent = parent.parentElement;
        }
        
        // 在页面中查找最近创建的canvas
        const canvases = document.querySelectorAll('canvas');
        if (canvases.length > 0) {
            return canvases[canvases.length - 1];
        }
        
        return null;
    }

    /**
     * 创建传送按钮
     */
    createTransferButton(fileInfo) {
        const button = document.createElement('button');
        button.className = 'transfer-btn unified-transfer-btn';
        button.innerHTML = `
            <span class="transfer-icon">📤</span>
            <span class="transfer-text" data-i18n="transfer_to_device">传送到设备</span>
        `;
        
        // 添加点击事件
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            try {
                const file = await this.prepareFileForTransfer(fileInfo);
                if (file) {
                    this.deviceSelector.show(file);
                } else {
                    throw new Error('Failed to prepare file for transfer');
                }
            } catch (error) {
                console.error('❌ Failed to start transfer:', error);
                alert('传送失败: ' + error.message);
            }
        });
        
        return button;
    }

    /**
     * 创建传送按钮组（用于多文件）
     */
    createTransferButtonGroup(files) {
        const group = document.createElement('div');
        group.className = 'transfer-button-group';
        
        // 如果只有一个文件，创建单个按钮
        if (files.length === 1) {
            const button = this.createTransferButton(files[0]);
            group.appendChild(button);
        } else {
            // 多个文件，创建批量传送按钮
            const batchButton = document.createElement('button');
            batchButton.className = 'transfer-btn unified-transfer-btn batch-transfer';
            batchButton.innerHTML = `
                <span class="transfer-icon">📤</span>
                <span class="transfer-text">传送全部 (${files.length})</span>
            `;
            
            batchButton.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    const preparedFiles = [];
                    for (const fileInfo of files) {
                        const file = await this.prepareFileForTransfer(fileInfo);
                        if (file) {
                            preparedFiles.push(file);
                        }
                    }
                    
                    if (preparedFiles.length > 0) {
                        this.deviceSelector.show(preparedFiles);
                    } else {
                        throw new Error('No files could be prepared for transfer');
                    }
                } catch (error) {
                    console.error('❌ Failed to start batch transfer:', error);
                    alert('批量传送失败: ' + error.message);
                }
            });
            
            group.appendChild(batchButton);
        }
        
        return group;
    }

    /**
     * 插入传送按钮
     */
    insertTransferButton(originalButton, transferButton) {
        // 尝试不同的插入策略
        
        // 策略1：插入到原按钮后面
        if (originalButton.parentNode) {
            originalButton.parentNode.insertBefore(transferButton, originalButton.nextSibling);
            return;
        }
        
        // 策略2：包装在容器中
        const wrapper = document.createElement('div');
        wrapper.className = 'download-actions';
        wrapper.style.display = 'flex';
        wrapper.style.gap = '12px';
        wrapper.style.alignItems = 'center';
        
        originalButton.parentNode.insertBefore(wrapper, originalButton);
        wrapper.appendChild(originalButton);
        wrapper.appendChild(transferButton);
    }

    /**
     * 准备文件用于传送
     */
    async prepareFileForTransfer(fileInfo) {
        try {
            switch (fileInfo.source) {
                case 'download-link':
                case 'onclick-blob':
                case 'image-blob':
                    return await this.fetchBlobFile(fileInfo);
                
                case 'canvas':
                    return await this.canvasToFile(fileInfo);
                
                case 'global-variable':
                    return this.dataToFile(fileInfo);
                
                default:
                    throw new Error('Unknown file source: ' + fileInfo.source);
            }
        } catch (error) {
            console.error('❌ Failed to prepare file:', error);
            throw error;
        }
    }

    /**
     * 从blob URL获取文件
     */
    async fetchBlobFile(fileInfo) {
        const response = await fetch(fileInfo.url);
        const blob = await response.blob();
        
        return new File([blob], fileInfo.name, {
            type: fileInfo.type || blob.type || 'application/octet-stream'
        });
    }

    /**
     * Canvas转文件
     */
    async canvasToFile(fileInfo) {
        return new Promise((resolve, reject) => {
            fileInfo.canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], fileInfo.name, {
                        type: fileInfo.type || 'image/png'
                    });
                    resolve(file);
                } else {
                    reject(new Error('Failed to convert canvas to blob'));
                }
            }, fileInfo.type || 'image/png');
        });
    }

    /**
     * 数据转文件
     */
    dataToFile(fileInfo) {
        let blob;
        
        if (fileInfo.data instanceof Blob) {
            blob = fileInfo.data;
        } else if (typeof fileInfo.data === 'string') {
            blob = new Blob([fileInfo.data], { type: fileInfo.type });
        } else if (fileInfo.data instanceof ArrayBuffer) {
            blob = new Blob([fileInfo.data], { type: fileInfo.type });
        } else {
            // 尝试序列化为JSON
            const jsonData = JSON.stringify(fileInfo.data);
            blob = new Blob([jsonData], { type: 'application/json' });
        }
        
        return new File([blob], fileInfo.name, {
            type: fileInfo.type || blob.type
        });
    }

    /**
     * 猜测文件类型
     */
    guessFileType(filename) {
        if (!filename) return 'application/octet-stream';
        
        const ext = filename.split('.').pop().toLowerCase();
        
        const mimeTypes = {
            // 图片
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml',
            'bmp': 'image/bmp',
            
            // 视频
            'mp4': 'video/mp4',
            'avi': 'video/avi',
            'mov': 'video/quicktime',
            'wmv': 'video/x-ms-wmv',
            'flv': 'video/x-flv',
            'webm': 'video/webm',
            
            // 音频
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'flac': 'audio/flac',
            'aac': 'audio/aac',
            'ogg': 'audio/ogg',
            'm4a': 'audio/mp4',
            
            // 文档
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'txt': 'text/plain',
            'html': 'text/html',
            'css': 'text/css',
            'js': 'application/javascript',
            'json': 'application/json',
            'xml': 'application/xml',
            
            // 压缩文件
            'zip': 'application/zip',
            'rar': 'application/x-rar-compressed',
            '7z': 'application/x-7z-compressed',
            'tar': 'application/x-tar',
            'gz': 'application/gzip'
        };
        
        return mimeTypes[ext] || 'application/octet-stream';
    }

    /**
     * 添加全局样式
     */
    addGlobalStyles() {
        // 检查是否已添加样式
        if (document.getElementById('fileProcessorIntegrationStyles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'fileProcessorIntegrationStyles';
        style.textContent = `
            .unified-transfer-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.3s ease;
                text-decoration: none;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
            }
            
            .unified-transfer-btn:hover {
                background: linear-gradient(135deg, #059669, #047857);
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
            }
            
            .unified-transfer-btn:active {
                transform: translateY(0);
                box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
            }
            
            .transfer-icon {
                font-size: 16px;
                line-height: 1;
            }
            
            .transfer-text {
                line-height: 1;
            }
            
            .transfer-button-group {
                margin: 12px 0;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                align-items: center;
            }
            
            .batch-transfer {
                background: linear-gradient(135deg, #3b82f6, #2563eb);
            }
            
            .batch-transfer:hover {
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
            }
            
            .download-actions {
                display: flex;
                gap: 12px;
                align-items: center;
                flex-wrap: wrap;
            }
            
            /* 适配不同页面的按钮样式 */
            .result .unified-transfer-btn,
            .output .unified-transfer-btn,
            .processed .unified-transfer-btn {
                margin: 8px 0;
            }
            
            /* 移动端适配 */
            @media (max-width: 768px) {
                .unified-transfer-btn {
                    padding: 8px 12px;
                    font-size: 13px;
                }
                
                .download-actions {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .transfer-button-group {
                    flex-direction: column;
                    align-items: stretch;
                }
            }
            
            /* 确保按钮在各种主题下都可见 */
            .dark .unified-transfer-btn,
            .dark-theme .unified-transfer-btn {
                color: white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            /* 动画效果 */
            @keyframes transferButtonAppear {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .unified-transfer-btn {
                animation: transferButtonAppear 0.3s ease-out;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * 销毁集成
     */
    destroy() {
        // 停止所有观察器
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        
        // 移除添加的传送按钮
        document.querySelectorAll('.unified-transfer-btn').forEach(btn => btn.remove());
        
        // 清空处理记录
        this.processedFiles.clear();
        
        console.log('🧹 FileProcessorIntegration destroyed');
    }
}

// 自动初始化
let globalFileProcessorIntegration = null;

function initFileProcessorIntegration() {
    if (globalFileProcessorIntegration) {
        return globalFileProcessorIntegration;
    }
    
    // 确保依赖已加载
    if (typeof TransferManager === 'undefined' || typeof UnifiedDeviceSelector === 'undefined') {
        console.log('⏳ Waiting for dependencies to load...');
        setTimeout(initFileProcessorIntegration, 500);
        return;
    }
    
    globalFileProcessorIntegration = new FileProcessorIntegration();
    window.globalFileProcessorIntegration = globalFileProcessorIntegration;
    
    console.log('🚀 Global FileProcessorIntegration initialized');
    return globalFileProcessorIntegration;
}

// 页面加载完成后自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initFileProcessorIntegration, 1000);
    });
} else {
    setTimeout(initFileProcessorIntegration, 1000);
}

// 导出类和初始化函数
window.FileProcessorIntegration = FileProcessorIntegration;
window.initFileProcessorIntegration = initFileProcessorIntegration;

console.log('📦 FileProcessorIntegration class loaded');
