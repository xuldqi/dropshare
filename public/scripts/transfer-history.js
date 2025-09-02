// 传输历史记录管理系统
class TransferHistory {
    constructor() {
        this.storageKey = 'dropshare_transfer_history';
        this.maxRecords = 1000; // 最大记录数
        this.history = this.loadHistory();
        this.initEventListeners();
    }

    // 初始化事件监听器
    initEventListeners() {
        // 监听文件发送事件
        Events.on('files-selected', e => this.recordFileSent(e.detail));
        
        // 监听文件接收事件
        Events.on('file-received', e => this.recordFileReceived(e.detail));
        
        // 监听文本发送事件
        Events.on('send-text', e => this.recordTextSent(e.detail));
        
        // 监听文本接收事件
        Events.on('text-received', e => this.recordTextReceived(e.detail));
        
        // 监听传输完成事件
        Events.on('notify-user', e => {
            if (e.detail && e.detail.includes('completed')) {
                this.updateLastTransferStatus('completed');
            }
        });
    }

    // 记录文件发送
    recordFileSent(data) {
        if (!data.files || !data.to) return;
        
        data.files.forEach(file => {
            const record = {
                id: this.generateId(),
                type: 'file',
                direction: 'sent',
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type || this.getFileTypeFromName(file.name),
                timestamp: Date.now(),
                peerId: data.to,
                peerName: this.getPeerName(data.to),
                status: 'sending',
                transferSpeed: 0,
                duration: 0
            };
            this.addRecord(record);
        });
    }

    // 记录文件接收
    recordFileReceived(file) {
        const record = {
            id: this.generateId(),
            type: 'file',
            direction: 'received',
            fileName: file.name,
            fileSize: file.size,
            fileType: file.mime || this.getFileTypeFromName(file.name),
            timestamp: Date.now(),
            peerId: 'unknown', // 需要从事件中获取
            peerName: 'Unknown Device',
            status: 'completed',
            transferSpeed: 0,
            duration: 0
        };
        this.addRecord(record);
    }

    // 记录文本发送
    recordTextSent(data) {
        const record = {
            id: this.generateId(),
            type: 'text',
            direction: 'sent',
            content: data.text.substring(0, 100) + (data.text.length > 100 ? '...' : ''),
            contentLength: data.text.length,
            timestamp: Date.now(),
            peerId: data.to,
            peerName: this.getPeerName(data.to),
            status: 'completed'
        };
        this.addRecord(record);
    }

    // 记录文本接收
    recordTextReceived(data) {
        const record = {
            id: this.generateId(),
            type: 'text',
            direction: 'received',
            content: data.text.substring(0, 100) + (data.text.length > 100 ? '...' : ''),
            contentLength: data.text.length,
            timestamp: Date.now(),
            peerId: data.sender,
            peerName: this.getPeerName(data.sender),
            status: 'completed'
        };
        this.addRecord(record);
    }

    // 添加记录
    addRecord(record) {
        this.history.unshift(record);
        
        // 限制记录数量
        if (this.history.length > this.maxRecords) {
            this.history = this.history.slice(0, this.maxRecords);
        }
        
        this.saveHistory();
        this.notifyHistoryUpdate();
    }

    // 更新最后一次传输状态
    updateLastTransferStatus(status) {
        const lastRecord = this.history.find(record => 
            record.direction === 'sent' && record.status === 'sending'
        );
        
        if (lastRecord) {
            lastRecord.status = status;
            lastRecord.duration = Date.now() - lastRecord.timestamp;
            this.saveHistory();
            this.notifyHistoryUpdate();
        }
    }

    // 获取历史记录
    getHistory(filters = {}) {
        let filteredHistory = [...this.history];
        
        // 按类型筛选
        if (filters.type) {
            filteredHistory = filteredHistory.filter(record => record.type === filters.type);
        }
        
        // 按方向筛选
        if (filters.direction) {
            filteredHistory = filteredHistory.filter(record => record.direction === filters.direction);
        }
        
        // 按日期范围筛选
        if (filters.dateFrom) {
            filteredHistory = filteredHistory.filter(record => record.timestamp >= filters.dateFrom);
        }
        
        if (filters.dateTo) {
            filteredHistory = filteredHistory.filter(record => record.timestamp <= filters.dateTo);
        }
        
        // 按文件类型筛选
        if (filters.fileType) {
            filteredHistory = filteredHistory.filter(record => 
                record.fileType && record.fileType.includes(filters.fileType)
            );
        }
        
        // 搜索关键词
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredHistory = filteredHistory.filter(record => 
                (record.fileName && record.fileName.toLowerCase().includes(searchTerm)) ||
                (record.peerName && record.peerName.toLowerCase().includes(searchTerm)) ||
                (record.content && record.content.toLowerCase().includes(searchTerm))
            );
        }
        
        // 排序
        if (filters.sortBy) {
            filteredHistory.sort((a, b) => {
                const aVal = a[filters.sortBy];
                const bVal = b[filters.sortBy];
                
                if (filters.sortOrder === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }
        
        return filteredHistory;
    }

    // 获取统计信息
    getStatistics() {
        const stats = {
            totalTransfers: this.history.length,
            totalFilesSent: 0,
            totalFilesReceived: 0,
            totalTextsSent: 0,
            totalTextsReceived: 0,
            totalDataSent: 0,
            totalDataReceived: 0,
            mostActiveDevice: '',
            mostCommonFileType: '',
            averageFileSize: 0,
            transfersByDay: {},
            fileTypeDistribution: {},
            deviceActivity: {}
        };
        
        let totalFileSize = 0;
        let fileCount = 0;
        
        this.history.forEach(record => {
            // 基本统计
            if (record.type === 'file') {
                if (record.direction === 'sent') {
                    stats.totalFilesSent++;
                    stats.totalDataSent += record.fileSize || 0;
                } else {
                    stats.totalFilesReceived++;
                    stats.totalDataReceived += record.fileSize || 0;
                }
                
                if (record.fileSize) {
                    totalFileSize += record.fileSize;
                    fileCount++;
                }
                
                // 文件类型分布
                const fileType = this.getMainFileType(record.fileType);
                stats.fileTypeDistribution[fileType] = (stats.fileTypeDistribution[fileType] || 0) + 1;
            } else if (record.type === 'text') {
                if (record.direction === 'sent') {
                    stats.totalTextsSent++;
                } else {
                    stats.totalTextsReceived++;
                }
            }
            
            // 设备活动统计
            if (record.peerName) {
                stats.deviceActivity[record.peerName] = (stats.deviceActivity[record.peerName] || 0) + 1;
            }
            
            // 按日期统计
            const date = new Date(record.timestamp).toDateString();
            stats.transfersByDay[date] = (stats.transfersByDay[date] || 0) + 1;
        });
        
        // 计算平均文件大小
        stats.averageFileSize = fileCount > 0 ? Math.round(totalFileSize / fileCount) : 0;
        
        // 找出最活跃设备
        let maxActivity = 0;
        Object.entries(stats.deviceActivity).forEach(([device, count]) => {
            if (count > maxActivity) {
                maxActivity = count;
                stats.mostActiveDevice = device;
            }
        });
        
        // 找出最常见文件类型
        let maxFileTypeCount = 0;
        Object.entries(stats.fileTypeDistribution).forEach(([type, count]) => {
            if (count > maxFileTypeCount) {
                maxFileTypeCount = count;
                stats.mostCommonFileType = type;
            }
        });
        
        return stats;
    }

    // 清理历史记录
    clearHistory(olderThan = null) {
        if (olderThan) {
            this.history = this.history.filter(record => record.timestamp > olderThan);
        } else {
            this.history = [];
        }
        
        this.saveHistory();
        this.notifyHistoryUpdate();
    }

    // 导出历史记录
    exportHistory(format = 'json') {
        const data = {
            exportDate: new Date().toISOString(),
            totalRecords: this.history.length,
            statistics: this.getStatistics(),
            records: this.history
        };
        
        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            return this.convertToCSV(this.history);
        }
        
        return data;
    }

    // 转换为CSV格式
    convertToCSV(records) {
        if (records.length === 0) return '';
        
        const headers = ['时间', '类型', '方向', '文件名/内容', '大小', '文件类型', '设备名称', '状态'];
        const csvRows = [headers.join(',')];
        
        records.forEach(record => {
            const row = [
                new Date(record.timestamp).toLocaleString(),
                record.type,
                record.direction === 'sent' ? '发送' : '接收',
                record.fileName || record.content || '',
                record.fileSize ? this.formatFileSize(record.fileSize) : '',
                record.fileType || '',
                record.peerName || '',
                record.status || ''
            ];
            csvRows.push(row.map(field => `"${field}"`).join(','));
        });
        
        return csvRows.join('\n');
    }

    // 辅助方法
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getPeerName(peerId) {
        // 尝试从当前连接的设备中获取名称
        const peerElement = document.getElementById(peerId);
        if (peerElement) {
            const nameElement = peerElement.querySelector('.name');
            if (nameElement) {
                return nameElement.textContent;
            }
        }
        return 'Unknown Device';
    }

    getFileTypeFromName(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const typeMap = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain',
            'mp4': 'video/mp4',
            'mp3': 'audio/mpeg',
            'zip': 'application/zip'
        };
        return typeMap[extension] || 'application/octet-stream';
    }

    getMainFileType(mimeType) {
        if (!mimeType) return 'other';
        
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        if (mimeType.startsWith('text/')) return 'text';
        if (mimeType.includes('pdf')) return 'pdf';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
        if (mimeType.includes('zip') || mimeType.includes('archive')) return 'archive';
        
        return 'other';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 存储和加载
    saveHistory() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.history));
        } catch (e) {
            console.warn('Failed to save transfer history:', e);
        }
    }

    loadHistory() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.warn('Failed to load transfer history:', e);
            return [];
        }
    }

    // 通知历史更新
    notifyHistoryUpdate() {
        Events.fire('transfer-history-updated', {
            totalRecords: this.history.length,
            latestRecord: this.history[0]
        });
    }
}

// 全局实例
window.transferHistory = new TransferHistory();