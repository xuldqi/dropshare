// 统计功能集成脚本
// 将增强的统计功能与现有的文件传输功能集成

class AnalyticsIntegration {
    constructor() {
        this.init();
    }

    init() {
        // 等待所有必要的组件加载完成
        document.addEventListener('DOMContentLoaded', () => {
            this.setupIntegration();
        });
    }

    setupIntegration() {
        // 集成文件传输事件跟踪
        this.integrateFileTransferTracking();
        
        // 集成用户交互跟踪
        this.integrateUserInteractionTracking();
        
        // 集成功能使用跟踪
        this.integrateFeatureUsageTracking();
        
        // 集成错误跟踪
        this.integrateErrorTracking();
        
        // 集成性能跟踪
        this.integratePerformanceTracking();
    }

    // 集成文件传输事件跟踪
    integrateFileTransferTracking() {
        // 监听文件发送事件
        document.addEventListener('file-send-start', (event) => {
            if (window.analyticsEnhanced) {
                const fileInfo = event.detail;
                window.analyticsEnhanced.trackTransferStart({
                    type: this.getFileType(fileInfo.name),
                    size: fileInfo.size,
                    name: fileInfo.name,
                    transferId: this.generateTransferId()
                });
                
                // 存储文件类型统计
                this.updateFileTypeStats(this.getFileType(fileInfo.name));
            }
        });

        // 监听文件传输进度
        document.addEventListener('file-transfer-progress', (event) => {
            if (window.analyticsEnhanced) {
                const { transferId, progress, speed } = event.detail;
                window.analyticsEnhanced.trackTransferProgress(transferId, progress, speed);
            }
        });

        // 监听文件传输完成
        document.addEventListener('file-transfer-complete', (event) => {
            if (window.analyticsEnhanced) {
                const transferInfo = event.detail;
                window.analyticsEnhanced.trackTransferComplete(transferInfo);
                
                // 更新最近传输记录
                this.updateRecentTransfers(transferInfo, 'success');
            }
        });

        // 监听文件传输失败
        document.addEventListener('file-transfer-failed', (event) => {
            if (window.analyticsEnhanced) {
                const { transferInfo, error } = event.detail;
                window.analyticsEnhanced.trackTransferFailed(transferInfo, error);
                
                // 更新最近传输记录
                this.updateRecentTransfers(transferInfo, 'failed');
            }
        });

        // 重写现有的文件传输函数以添加事件触发
        this.overrideFileTransferFunctions();
    }

    // 集成用户交互跟踪
    integrateUserInteractionTracking() {
        // 跟踪按钮点击
        document.addEventListener('click', (event) => {
            if (window.analyticsEnhanced) {
                const target = event.target;
                const button = target.closest('button, .button, .icon-button');
                
                if (button) {
                    const action = 'click';
                    const element = button.id || button.className || 'unknown-button';
                    window.analyticsEnhanced.trackUserInteraction(action, element);
                }
            }
        });

        // 跟踪拖拽操作
        document.addEventListener('dragover', (event) => {
            if (window.analyticsEnhanced && !this.dragTracked) {
                window.analyticsEnhanced.trackUserInteraction('drag_over', 'file_drop_zone');
                this.dragTracked = true;
                setTimeout(() => { this.dragTracked = false; }, 1000);
            }
        });

        document.addEventListener('drop', (event) => {
            if (window.analyticsEnhanced) {
                const files = event.dataTransfer?.files;
                if (files && files.length > 0) {
                    window.analyticsEnhanced.trackUserInteraction('file_drop', 'file_drop_zone', {
                        file_count: files.length
                    });
                }
            }
        });
    }

    // 集成功能使用跟踪
    integrateFeatureUsageTracking() {
        // 跟踪主题切换
        const themeButton = document.getElementById('theme');
        if (themeButton) {
            themeButton.addEventListener('click', () => {
                if (window.analyticsEnhanced) {
                    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                    window.analyticsEnhanced.trackFeatureUsage('theme_switch', {
                        from_theme: currentTheme,
                        to_theme: currentTheme === 'light' ? 'dark' : 'light'
                    });
                }
            });
        }

        // 跟踪传输历史功能使用
        const historyButton = document.getElementById('historyBtn');
        if (historyButton) {
            historyButton.addEventListener('click', () => {
                if (window.analyticsEnhanced) {
                    window.analyticsEnhanced.trackFeatureUsage('transfer_history_opened');
                }
            });
        }

        // 跟踪私密房间功能使用
        document.addEventListener('private-room-created', (event) => {
            if (window.analyticsEnhanced) {
                window.analyticsEnhanced.trackFeatureUsage('private_room_created', {
                    room_settings: event.detail
                });
            }
        });

        document.addEventListener('private-room-joined', (event) => {
            if (window.analyticsEnhanced) {
                window.analyticsEnhanced.trackFeatureUsage('private_room_joined');
            }
        });

        // 跟踪文件预览功能使用
        document.addEventListener('file-preview-opened', (event) => {
            if (window.analyticsEnhanced) {
                window.analyticsEnhanced.trackFeatureUsage('file_preview_opened', {
                    file_type: event.detail.fileType
                });
            }
        });
    }

    // 集成错误跟踪
    integrateErrorTracking() {
        // 跟踪WebRTC连接错误
        document.addEventListener('webrtc-error', (event) => {
            if (window.analyticsEnhanced) {
                window.analyticsEnhanced.trackError(event.detail.error, 'webrtc_connection');
            }
        });

        // 跟踪文件传输错误
        document.addEventListener('file-transfer-error', (event) => {
            if (window.analyticsEnhanced) {
                window.analyticsEnhanced.trackError(event.detail.error, 'file_transfer');
            }
        });
    }

    // 集成性能跟踪
    integratePerformanceTracking() {
        // 跟踪页面可见性变化对性能的影响
        document.addEventListener('visibilitychange', () => {
            if (window.analyticsEnhanced && !document.hidden) {
                // 页面重新可见时跟踪性能
                setTimeout(() => {
                    window.analyticsEnhanced.trackPerformance();
                }, 1000);
            }
        });

        // 跟踪网络状态变化
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                if (window.analyticsEnhanced) {
                    window.analyticsEnhanced.trackNetworkInfo();
                }
            });
        }
    }

    // 重写现有的文件传输函数
    overrideFileTransferFunctions() {
        // 这里需要根据实际的文件传输实现来重写相关函数
        // 由于我们无法直接修改现有的network.js和ui.js，我们通过事件监听来实现
        
        // 监听DOM变化来检测新的文件传输
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // 检测新添加的传输进度元素
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const progressElements = node.querySelectorAll ? 
                                node.querySelectorAll('.progress, [class*="progress"]') : [];
                            
                            progressElements.forEach((element) => {
                                this.observeTransferProgress(element);
                            });
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 观察传输进度
    observeTransferProgress(element) {
        const progressObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    // 解析进度值
                    const style = element.getAttribute('style');
                    const widthMatch = style?.match(/width:\s*(\d+(?:\.\d+)?)%/);
                    
                    if (widthMatch) {
                        const progress = parseFloat(widthMatch[1]);
                        
                        // 触发进度事件
                        document.dispatchEvent(new CustomEvent('file-transfer-progress', {
                            detail: {
                                transferId: this.generateTransferId(),
                                progress: progress,
                                speed: this.calculateSpeed() // 需要实现速度计算
                            }
                        }));
                    }
                }
            });
        });

        progressObserver.observe(element, {
            attributes: true,
            attributeFilter: ['style']
        });
    }

    // 获取文件类型
    getFileType(fileName) {
        if (!fileName) return 'unknown';
        
        const extension = fileName.split('.').pop()?.toLowerCase();
        
        const typeMap = {
            // 图片
            'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 
            'bmp': 'image', 'webp': 'image', 'svg': 'image',
            
            // 视频
            'mp4': 'video', 'avi': 'video', 'mov': 'video', 'wmv': 'video',
            'flv': 'video', 'webm': 'video', 'mkv': 'video',
            
            // 音频
            'mp3': 'audio', 'wav': 'audio', 'flac': 'audio', 'aac': 'audio',
            'ogg': 'audio', 'm4a': 'audio',
            
            // 文档
            'pdf': 'document', 'doc': 'document', 'docx': 'document',
            'xls': 'document', 'xlsx': 'document', 'ppt': 'document', 'pptx': 'document',
            
            // 文本
            'txt': 'text', 'md': 'text', 'rtf': 'text',
            
            // 压缩包
            'zip': 'archive', 'rar': 'archive', '7z': 'archive', 'tar': 'archive',
            'gz': 'archive', 'bz2': 'archive'
        };
        
        return typeMap[extension] || 'other';
    }

    // 生成传输ID
    generateTransferId() {
        return 'transfer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 更新文件类型统计
    updateFileTypeStats(fileType) {
        const stats = JSON.parse(localStorage.getItem('fileTypeStats') || '{}');
        stats[fileType] = (stats[fileType] || 0) + 1;
        localStorage.setItem('fileTypeStats', JSON.stringify(stats));
    }

    // 更新最近传输记录
    updateRecentTransfers(transferInfo, status) {
        const transfers = JSON.parse(localStorage.getItem('recentTransfers') || '[]');
        
        const newTransfer = {
            ...transferInfo,
            status,
            timestamp: Date.now()
        };
        
        transfers.unshift(newTransfer);
        
        // 只保留最近100条记录
        if (transfers.length > 100) {
            transfers.splice(100);
        }
        
        localStorage.setItem('recentTransfers', JSON.stringify(transfers));
    }

    // 计算传输速度（简化实现）
    calculateSpeed() {
        // 这里应该根据实际的传输数据来计算速度
        // 暂时返回一个模拟值
        return Math.random() * 1000000; // 随机速度，单位：字节/秒
    }
}

// 初始化统计集成
const analyticsIntegration = new AnalyticsIntegration();

// 导出到全局作用域
window.analyticsIntegration = analyticsIntegration;