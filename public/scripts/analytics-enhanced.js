// 增强的Firebase Analytics统计功能
class AnalyticsEnhanced {
    constructor() {
        this.analytics = null;
        this.sessionStartTime = Date.now();
        this.transferStats = {
            totalTransfers: 0,
            successfulTransfers: 0,
            failedTransfers: 0,
            totalBytes: 0
        };
        this.deviceInfo = this.getDeviceInfo();
        this.init();
    }

    init() {
        if (typeof firebase !== 'undefined' && firebase.analytics) {
            this.analytics = firebase.analytics();
            this.setupEventTracking();
            this.trackSessionStart();
            console.log('Enhanced Analytics initialized');
        }
    }

    // 获取设备信息
    getDeviceInfo() {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        const language = navigator.language;
        const screenResolution = `${screen.width}x${screen.height}`;
        const colorDepth = screen.colorDepth;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // 检测浏览器
        let browser = 'Unknown';
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        
        // 检测设备类型
        let deviceType = 'Desktop';
        if (/Mobi|Android/i.test(userAgent)) deviceType = 'Mobile';
        else if (/Tablet|iPad/i.test(userAgent)) deviceType = 'Tablet';
        
        return {
            browser,
            deviceType,
            platform,
            language,
            screenResolution,
            colorDepth,
            timezone,
            userAgent: userAgent.substring(0, 100) // 截取前100字符
        };
    }

    // 设置事件跟踪
    setupEventTracking() {
        // 跟踪页面停留时间
        window.addEventListener('beforeunload', () => {
            this.trackSessionEnd();
        });

        // 跟踪页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('page_hidden', { timestamp: Date.now() });
            } else {
                this.trackEvent('page_visible', { timestamp: Date.now() });
            }
        });

        // 跟踪网络状态
        if ('connection' in navigator) {
            this.trackNetworkInfo();
            navigator.connection.addEventListener('change', () => {
                this.trackNetworkInfo();
            });
        }
    }

    // 跟踪会话开始
    trackSessionStart() {
        this.trackEvent('session_start', {
            ...this.deviceInfo,
            timestamp: this.sessionStartTime,
            referrer: document.referrer
        });
    }

    // 跟踪会话结束
    trackSessionEnd() {
        const sessionDuration = Date.now() - this.sessionStartTime;
        this.trackEvent('session_end', {
            session_duration: sessionDuration,
            total_transfers: this.transferStats.totalTransfers,
            successful_transfers: this.transferStats.successfulTransfers,
            failed_transfers: this.transferStats.failedTransfers,
            total_bytes: this.transferStats.totalBytes
        });
    }

    // 跟踪网络信息
    trackNetworkInfo() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.trackEvent('network_info', {
                effective_type: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                save_data: connection.saveData
            });
        }
    }

    // 跟踪文件传输开始
    trackTransferStart(fileInfo) {
        this.transferStats.totalTransfers++;
        this.trackEvent('transfer_start', {
            file_type: fileInfo.type,
            file_size: fileInfo.size,
            file_name_length: fileInfo.name ? fileInfo.name.length : 0,
            transfer_id: fileInfo.transferId || this.generateTransferId(),
            peer_count: this.getPeerCount()
        });
    }

    // 跟踪文件传输进度
    trackTransferProgress(transferId, progress, speed) {
        this.trackEvent('transfer_progress', {
            transfer_id: transferId,
            progress: Math.round(progress),
            speed: Math.round(speed),
            timestamp: Date.now()
        });
    }

    // 跟踪文件传输完成
    trackTransferComplete(transferInfo) {
        this.transferStats.successfulTransfers++;
        this.transferStats.totalBytes += transferInfo.size;
        
        this.trackEvent('transfer_complete', {
            transfer_id: transferInfo.transferId,
            file_type: transferInfo.type,
            file_size: transferInfo.size,
            duration: transferInfo.duration,
            average_speed: transferInfo.size / (transferInfo.duration / 1000),
            success: true
        });
    }

    // 跟踪文件传输失败
    trackTransferFailed(transferInfo, error) {
        this.transferStats.failedTransfers++;
        
        this.trackEvent('transfer_failed', {
            transfer_id: transferInfo.transferId,
            file_type: transferInfo.type,
            file_size: transferInfo.size,
            error_type: error.type || 'unknown',
            error_message: error.message ? error.message.substring(0, 100) : '',
            duration: transferInfo.duration || 0
        });
    }

    // 跟踪功能使用
    trackFeatureUsage(featureName, details = {}) {
        this.trackEvent('feature_usage', {
            feature_name: featureName,
            ...details,
            timestamp: Date.now()
        });
    }

    // 跟踪用户交互
    trackUserInteraction(action, element, details = {}) {
        this.trackEvent('user_interaction', {
            action,
            element,
            ...details,
            timestamp: Date.now()
        });
    }

    // 跟踪错误
    trackError(error, context = '') {
        this.trackEvent('error_occurred', {
            error_message: error.message ? error.message.substring(0, 200) : '',
            error_stack: error.stack ? error.stack.substring(0, 500) : '',
            context,
            timestamp: Date.now()
        });
    }

    // 跟踪性能指标
    trackPerformance() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                this.trackEvent('performance_metrics', {
                    page_load_time: navigation.loadEventEnd - navigation.fetchStart,
                    dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
                    first_paint: this.getFirstPaint(),
                    memory_usage: this.getMemoryUsage()
                });
            }
        }
    }

    // 获取首次绘制时间
    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : null;
    }

    // 获取内存使用情况
    getMemoryUsage() {
        if ('memory' in performance) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    // 生成传输ID
    generateTransferId() {
        return 'transfer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 获取当前连接的设备数量
    getPeerCount() {
        // 这个需要根据实际的peer管理逻辑来实现
        const peers = document.querySelectorAll('.peer');
        return peers.length;
    }

    // 通用事件跟踪方法
    trackEvent(eventName, parameters = {}) {
        if (this.analytics) {
            // 添加通用参数
            const enhancedParams = {
                ...parameters,
                session_id: this.getSessionId(),
                user_agent_hash: this.hashString(navigator.userAgent),
                timestamp: Date.now()
            };
            
            this.analytics.logEvent(eventName, enhancedParams);
        }
    }

    // 获取会话ID
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }

    // 字符串哈希函数
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return Math.abs(hash).toString(36);
    }

    // 获取统计数据
    getStats() {
        return {
            ...this.transferStats,
            sessionDuration: Date.now() - this.sessionStartTime,
            deviceInfo: this.deviceInfo
        };
    }
}

// 全局实例
window.analyticsEnhanced = new AnalyticsEnhanced();

// 兼容性方法
window.trackFileSent = function(fileType, fileSize) {
    window.analyticsEnhanced.trackTransferStart({
        type: fileType,
        size: fileSize,
        transferId: window.analyticsEnhanced.generateTransferId()
    });
};

window.trackFileReceived = function(fileType, fileSize) {
    window.analyticsEnhanced.trackTransferComplete({
        type: fileType,
        size: fileSize,
        duration: 1000 // 默认值，实际应该传入真实时长
    });
};

// 页面加载完成后跟踪性能
window.addEventListener('load', () => {
    setTimeout(() => {
        window.analyticsEnhanced.trackPerformance();
    }, 1000);
});

// 错误跟踪
window.addEventListener('error', (event) => {
    window.analyticsEnhanced.trackError(event.error, 'global_error');
});

window.addEventListener('unhandledrejection', (event) => {
    window.analyticsEnhanced.trackError(new Error(event.reason), 'unhandled_promise_rejection');
});