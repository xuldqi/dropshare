// 统计仪表板管理器
class AnalyticsDashboard {
    constructor() {
        this.isVisible = false;
        this.charts = {};
        this.refreshInterval = null;
        this.init();
    }

    init() {
        this.createDashboardHTML();
        this.bindEvents();
        this.loadStoredData();
    }

    // 创建仪表板HTML结构
    createDashboardHTML() {
        const dashboardHTML = `
            <div id="analytics-dashboard" class="analytics-dashboard hidden">
                <div class="dashboard-overlay"></div>
                <div class="dashboard-content">
                    <div class="dashboard-header">
                        <h2>📊 使用统计</h2>
                        <div class="dashboard-controls">
                            <button class="refresh-btn" title="刷新数据">🔄</button>
                            <button class="export-btn" title="导出数据">📥</button>
                            <button class="close-btn" title="关闭">✕</button>
                        </div>
                    </div>
                    
                    <div class="dashboard-tabs">
                        <button class="tab-btn active" data-tab="overview">概览</button>
                        <button class="tab-btn" data-tab="transfers">传输统计</button>
                        <button class="tab-btn" data-tab="devices">设备信息</button>
                        <button class="tab-btn" data-tab="performance">性能指标</button>
                    </div>
                    
                    <div class="dashboard-body">
                        <!-- 概览标签页 -->
                        <div class="tab-content active" data-tab="overview">
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <div class="stat-icon">📁</div>
                                    <div class="stat-info">
                                        <div class="stat-value" id="total-transfers">0</div>
                                        <div class="stat-label">总传输次数</div>
                                    </div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-icon">✅</div>
                                    <div class="stat-info">
                                        <div class="stat-value" id="success-rate">0%</div>
                                        <div class="stat-label">成功率</div>
                                    </div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-icon">💾</div>
                                    <div class="stat-info">
                                        <div class="stat-value" id="total-data">0 MB</div>
                                        <div class="stat-label">总传输数据</div>
                                    </div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-icon">⏱️</div>
                                    <div class="stat-info">
                                        <div class="stat-value" id="session-time">0分钟</div>
                                        <div class="stat-label">会话时长</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="chart-container">
                                <h3>传输趋势</h3>
                                <canvas id="transfer-trend-chart" width="400" height="200"></canvas>
                            </div>
                        </div>
                        
                        <!-- 传输统计标签页 -->
                        <div class="tab-content" data-tab="transfers">
                            <div class="transfer-stats">
                                <div class="chart-row">
                                    <div class="chart-half">
                                        <h3>文件类型分布</h3>
                                        <canvas id="file-type-chart" width="300" height="300"></canvas>
                                    </div>
                                    <div class="chart-half">
                                        <h3>传输状态</h3>
                                        <canvas id="transfer-status-chart" width="300" height="300"></canvas>
                                    </div>
                                </div>
                                
                                <div class="transfer-history">
                                    <h3>最近传输记录</h3>
                                    <div class="transfer-list" id="recent-transfers"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 设备信息标签页 -->
                        <div class="tab-content" data-tab="devices">
                            <div class="device-stats">
                                <div class="device-info-grid">
                                    <div class="device-card">
                                        <h4>当前设备</h4>
                                        <div class="device-details" id="current-device"></div>
                                    </div>
                                    <div class="device-card">
                                        <h4>浏览器分布</h4>
                                        <canvas id="browser-chart" width="250" height="250"></canvas>
                                    </div>
                                    <div class="device-card">
                                        <h4>设备类型</h4>
                                        <canvas id="device-type-chart" width="250" height="250"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 性能指标标签页 -->
                        <div class="tab-content" data-tab="performance">
                            <div class="performance-stats">
                                <div class="perf-metrics">
                                    <div class="metric-item">
                                        <span class="metric-label">页面加载时间:</span>
                                        <span class="metric-value" id="page-load-time">-</span>
                                    </div>
                                    <div class="metric-item">
                                        <span class="metric-label">DOM加载时间:</span>
                                        <span class="metric-value" id="dom-load-time">-</span>
                                    </div>
                                    <div class="metric-item">
                                        <span class="metric-label">首次绘制时间:</span>
                                        <span class="metric-value" id="first-paint-time">-</span>
                                    </div>
                                    <div class="metric-item">
                                        <span class="metric-label">内存使用:</span>
                                        <span class="metric-value" id="memory-usage">-</span>
                                    </div>
                                </div>
                                
                                <div class="chart-container">
                                    <h3>传输速度分布</h3>
                                    <canvas id="speed-chart" width="400" height="200"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', dashboardHTML);
    }

    // 绑定事件
    bindEvents() {
        const dashboard = document.getElementById('analytics-dashboard');
        
        // 关闭按钮
        dashboard.querySelector('.close-btn').addEventListener('click', () => {
            this.hide();
        });
        
        // 点击遮罩关闭
        dashboard.querySelector('.dashboard-overlay').addEventListener('click', () => {
            this.hide();
        });
        
        // 刷新按钮
        dashboard.querySelector('.refresh-btn').addEventListener('click', () => {
            this.refreshData();
        });
        
        // 导出按钮
        dashboard.querySelector('.export-btn').addEventListener('click', () => {
            this.exportData();
        });
        
        // 标签页切换
        dashboard.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    // 显示仪表板
    show() {
        const dashboard = document.getElementById('analytics-dashboard');
        dashboard.classList.remove('hidden');
        this.isVisible = true;
        this.refreshData();
        this.startAutoRefresh();
        
        // 跟踪仪表板打开事件
        if (window.analyticsEnhanced) {
            window.analyticsEnhanced.trackFeatureUsage('analytics_dashboard_opened');
        }
    }

    // 隐藏仪表板
    hide() {
        const dashboard = document.getElementById('analytics-dashboard');
        dashboard.classList.add('hidden');
        this.isVisible = false;
        this.stopAutoRefresh();
    }

    // 切换标签页
    switchTab(tabName) {
        // 更新标签按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // 更新内容区域
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });
        
        // 根据标签页刷新相应数据
        this.refreshTabData(tabName);
    }

    // 刷新数据
    refreshData() {
        this.updateOverviewStats();
        this.updateTransferStats();
        this.updateDeviceStats();
        this.updatePerformanceStats();
    }

    // 刷新特定标签页数据
    refreshTabData(tabName) {
        switch (tabName) {
            case 'overview':
                this.updateOverviewStats();
                break;
            case 'transfers':
                this.updateTransferStats();
                break;
            case 'devices':
                this.updateDeviceStats();
                break;
            case 'performance':
                this.updatePerformanceStats();
                break;
        }
    }

    // 更新概览统计
    updateOverviewStats() {
        if (!window.analyticsEnhanced) return;
        
        const stats = window.analyticsEnhanced.getStats();
        
        document.getElementById('total-transfers').textContent = stats.totalTransfers;
        
        const successRate = stats.totalTransfers > 0 
            ? Math.round((stats.successfulTransfers / stats.totalTransfers) * 100)
            : 0;
        document.getElementById('success-rate').textContent = successRate + '%';
        
        const totalMB = (stats.totalBytes / (1024 * 1024)).toFixed(1);
        document.getElementById('total-data').textContent = totalMB + ' MB';
        
        const sessionMinutes = Math.round(stats.sessionDuration / (1000 * 60));
        document.getElementById('session-time').textContent = sessionMinutes + '分钟';
        
        this.updateTrendChart();
    }

    // 更新传输统计
    updateTransferStats() {
        this.updateFileTypeChart();
        this.updateTransferStatusChart();
        this.updateRecentTransfers();
    }

    // 更新设备统计
    updateDeviceStats() {
        if (!window.analyticsEnhanced) return;
        
        const deviceInfo = window.analyticsEnhanced.deviceInfo;
        const deviceDetails = document.getElementById('current-device');
        
        deviceDetails.innerHTML = `
            <div class="device-detail"><strong>设备类型:</strong> ${deviceInfo.deviceType}</div>
            <div class="device-detail"><strong>浏览器:</strong> ${deviceInfo.browser}</div>
            <div class="device-detail"><strong>平台:</strong> ${deviceInfo.platform}</div>
            <div class="device-detail"><strong>语言:</strong> ${deviceInfo.language}</div>
            <div class="device-detail"><strong>分辨率:</strong> ${deviceInfo.screenResolution}</div>
            <div class="device-detail"><strong>时区:</strong> ${deviceInfo.timezone}</div>
        `;
        
        this.updateBrowserChart();
        this.updateDeviceTypeChart();
    }

    // 更新性能统计
    updatePerformanceStats() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                const pageLoadTime = Math.round(navigation.loadEventEnd - navigation.fetchStart);
                const domLoadTime = Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart);
                
                document.getElementById('page-load-time').textContent = pageLoadTime + 'ms';
                document.getElementById('dom-load-time').textContent = domLoadTime + 'ms';
            }
            
            const paintEntries = performance.getEntriesByType('paint');
            const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
            if (firstPaint) {
                document.getElementById('first-paint-time').textContent = Math.round(firstPaint.startTime) + 'ms';
            }
            
            if ('memory' in performance) {
                const memoryMB = (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1);
                document.getElementById('memory-usage').textContent = memoryMB + ' MB';
            }
        }
        
        this.updateSpeedChart();
    }

    // 简单的图表绘制方法（使用Canvas）
    drawPieChart(canvasId, data, colors) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) {
            ctx.fillStyle = '#ccc';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('暂无数据', centerX, centerY);
            return;
        }
        
        let currentAngle = -Math.PI / 2;
        
        data.forEach((item, index) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            
            // 绘制标签
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 15);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 15);
            
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, labelX, labelY);
            
            currentAngle += sliceAngle;
        });
    }

    // 更新文件类型图表
    updateFileTypeChart() {
        const data = this.getFileTypeData();
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
        this.drawPieChart('file-type-chart', data, colors);
    }

    // 更新传输状态图表
    updateTransferStatusChart() {
        if (!window.analyticsEnhanced) return;
        
        const stats = window.analyticsEnhanced.getStats();
        const data = [
            { label: '成功', value: stats.successfulTransfers },
            { label: '失败', value: stats.failedTransfers }
        ];
        const colors = ['#4CAF50', '#F44336'];
        this.drawPieChart('transfer-status-chart', data, colors);
    }

    // 获取文件类型数据（从localStorage或其他存储）
    getFileTypeData() {
        const stored = localStorage.getItem('fileTypeStats');
        if (stored) {
            const stats = JSON.parse(stored);
            return Object.entries(stats).map(([type, count]) => ({
                label: type,
                value: count
            }));
        }
        return [];
    }

    // 更新最近传输记录
    updateRecentTransfers() {
        const transferList = document.getElementById('recent-transfers');
        const transfers = this.getRecentTransfers();
        
        if (transfers.length === 0) {
            transferList.innerHTML = '<div class="no-data">暂无传输记录</div>';
            return;
        }
        
        transferList.innerHTML = transfers.map(transfer => `
            <div class="transfer-item">
                <div class="transfer-icon">${this.getFileIcon(transfer.type)}</div>
                <div class="transfer-info">
                    <div class="transfer-name">${transfer.name || '未知文件'}</div>
                    <div class="transfer-details">
                        ${this.formatFileSize(transfer.size)} • 
                        ${transfer.status === 'success' ? '✅ 成功' : '❌ 失败'} • 
                        ${this.formatTime(transfer.timestamp)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 获取最近传输记录
    getRecentTransfers() {
        const stored = localStorage.getItem('recentTransfers');
        return stored ? JSON.parse(stored).slice(0, 10) : [];
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // 格式化时间
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }

    // 获取文件图标
    getFileIcon(type) {
        const iconMap = {
            'image': '🖼️',
            'video': '🎥',
            'audio': '🎵',
            'document': '📄',
            'archive': '📦',
            'text': '📝'
        };
        return iconMap[type] || '📁';
    }

    // 导出数据
    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            stats: window.analyticsEnhanced ? window.analyticsEnhanced.getStats() : {},
            fileTypes: this.getFileTypeData(),
            recentTransfers: this.getRecentTransfers(),
            deviceInfo: window.analyticsEnhanced ? window.analyticsEnhanced.deviceInfo : {}
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // 跟踪导出事件
        if (window.analyticsEnhanced) {
            window.analyticsEnhanced.trackFeatureUsage('analytics_data_exported');
        }
    }

    // 加载存储的数据
    loadStoredData() {
        // 这里可以从localStorage或其他存储加载历史数据
    }

    // 开始自动刷新
    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            if (this.isVisible) {
                this.refreshData();
            }
        }, 30000); // 每30秒刷新一次
    }

    // 停止自动刷新
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // 占位方法，实际图表实现
    updateTrendChart() {
        // 这里可以实现更复杂的趋势图表
    }

    updateBrowserChart() {
        // 浏览器分布图表
    }

    updateDeviceTypeChart() {
        // 设备类型图表
    }

    updateSpeedChart() {
        // 传输速度图表
    }
}

// 全局实例
window.analyticsDashboard = new AnalyticsDashboard();

// 添加快捷键打开仪表板（Ctrl+Shift+A）
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        window.analyticsDashboard.show();
    }
});