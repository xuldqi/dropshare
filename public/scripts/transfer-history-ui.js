// 传输历史UI管理类
class TransferHistoryUI {
    constructor() {
        this.isVisible = false;
        this.currentFilters = {};
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.initUI();
        this.bindEvents();
    }

    // 初始化UI
    initUI() {
        this.createHistoryDialog();
        this.createHistoryButton();
    }

    // 创建历史记录按钮 - 使用HTML中已存在的按钮
    createHistoryButton() {
        // 使用HTML中已存在的 historyBtn，避免重复创建
        const existingHistoryBtn = document.getElementById('historyBtn');
        if (existingHistoryBtn) {
            // 添加徽章到现有按钮
            const badge = document.createElement('span');
            badge.className = 'history-badge';
            badge.id = 'history-badge';
            badge.style.display = 'none';
            existingHistoryBtn.appendChild(badge);
            
            // 绑定事件到现有按钮（移除可能存在的旧事件监听器）
            const newBtn = existingHistoryBtn.cloneNode(true);
            existingHistoryBtn.parentNode.replaceChild(newBtn, existingHistoryBtn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showHistory();
            });
        }
    }

    // 创建历史记录对话框
    createHistoryDialog() {
        const dialog = document.createElement('x-dialog');
        dialog.id = 'history-dialog';
        // 确保对话框初始时是隐藏的
        dialog.style.display = 'none';
        dialog.innerHTML = `
            <x-background class="full"></x-background>
            <x-paper shadow="2">
                <h3 >Transfer History</h3>
                
                <!-- 统计信息 -->
                <div class="history-stats">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-number" id="total-transfers">0</span>
                            <span class="stat-label" >Total Transfers</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number" id="total-files">0</span>
                            <span class="stat-label" >Files</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number" id="total-data">0</span>
                            <span class="stat-label" >Data</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number" id="most-active-device">-</span>
                            <span class="stat-label" >Most Active</span>
                        </div>
                    </div>
                </div>
                
                <!-- 筛选和搜索 -->
                <div class="history-filters">
                    <div class="filter-row">
                        <input type="text" id="history-search" placeholder="Search files, devices...">
                        <select id="filter-type">
                            <option value="" >All Types</option>
                            <option value="file" >Files</option>
                            <option value="text" >Texts</option>
                        </select>
                        <select id="filter-direction">
                            <option value="" >All</option>
                            <option value="sent" >Sent</option>
                            <option value="received" >Received</option>
                        </select>
                    </div>
                    <div class="filter-row">
                        <select id="filter-file-type">
                            <option value="" >All File Types</option>
                            <option value="image">Images</option>
                            <option value="video">Videos</option>
                            <option value="audio">Audio</option>
                            <option value="document">Documents</option>
                            <option value="archive">Archives</option>
                            <option value="other">Other</option>
                        </select>
                        <input type="date" id="filter-date-from" title="From date">
                        <input type="date" id="filter-date-to" title="To date">
                        <button id="clear-filters" >Clear</button>
                    </div>
                </div>
                
                <!-- 历史记录列表 -->
                <div class="history-list-container">
                    <div class="history-list-header">
                        <span class="sort-btn" data-sort="timestamp" >Time</span>
                        <span class="sort-btn" data-sort="type" >Type</span>
                        <span class="sort-btn" data-sort="direction" >Direction</span>
                        <span class="sort-btn" data-sort="fileName" >Name</span>
                        <span class="sort-btn" data-sort="fileSize" >Size</span>
                        <span class="sort-btn" data-sort="peerName" >Device</span>
                    </div>
                    <div class="history-list" id="history-list">
                        <!-- 历史记录项将在这里动态生成 -->
                    </div>
                </div>
                
                <!-- 分页 -->
                <div class="history-pagination">
                    <button id="prev-page" disabled>‹</button>
                    <span id="page-info">1 / 1</span>
                    <button id="next-page" disabled>›</button>
                </div>
                
                <!-- 操作按钮 -->
                <div class="history-actions">
                    <button id="export-history" >Export</button>
                    <button id="clear-history" >Clear History</button>
                    <button class="button--close" >Close</button>
                </div>
            </x-paper>
        `;
        
        document.body.appendChild(dialog);
        this.dialog = dialog;
    }

    // 绑定事件
    bindEvents() {
        // 监听历史更新事件
        Events.on('transfer-history-updated', (e) => {
            this.updateHistoryBadge(e.detail.totalRecords);
            if (this.isVisible) {
                this.refreshHistoryList();
            }
        });

        // 搜索和筛选事件
        const searchInput = document.getElementById('history-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.applyFilters());
        }

        ['filter-type', 'filter-direction', 'filter-file-type', 'filter-date-from', 'filter-date-to'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.applyFilters());
            }
        });

        // 清除筛选
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }

        // 排序事件
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleSort(btn.dataset.sort));
        });

        // 分页事件
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousPage());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextPage());

        // 操作按钮事件
        const exportBtn = document.getElementById('export-history');
        const clearBtn = document.getElementById('clear-history');
        const closeBtn = this.dialog.querySelector('.button--close');
        
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportHistory());
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearHistory());
        if (closeBtn) closeBtn.addEventListener('click', () => this.hideHistory());

        // 对话框背景点击关闭
        const background = this.dialog.querySelector('x-background');
        if (background) {
            background.addEventListener('click', () => this.hideHistory());
        }
    }

    // 显示历史记录
    showHistory() {
        this.isVisible = true;
        this.dialog.setAttribute('show', '');
        this.refreshHistoryList();
        this.updateStatistics();
    }

    // 隐藏历史记录
    hideHistory() {
        this.isVisible = false;
        this.dialog.removeAttribute('show');
    }

    // 更新历史记录徽章
    updateHistoryBadge(count) {
        const badge = document.getElementById('history-badge');
        if (!badge) return;

        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count.toString();
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }

    // 应用筛选
    applyFilters() {
        this.currentFilters = {
            search: document.getElementById('history-search')?.value || '',
            type: document.getElementById('filter-type')?.value || '',
            direction: document.getElementById('filter-direction')?.value || '',
            fileType: document.getElementById('filter-file-type')?.value || '',
            dateFrom: document.getElementById('filter-date-from')?.value ? 
                new Date(document.getElementById('filter-date-from').value).getTime() : null,
            dateTo: document.getElementById('filter-date-to')?.value ? 
                new Date(document.getElementById('filter-date-to').value).getTime() + 86400000 : null
        };
        
        this.currentPage = 1;
        this.refreshHistoryList();
    }

    // 清除筛选
    clearFilters() {
        document.getElementById('history-search').value = '';
        document.getElementById('filter-type').value = '';
        document.getElementById('filter-direction').value = '';
        document.getElementById('filter-file-type').value = '';
        document.getElementById('filter-date-from').value = '';
        document.getElementById('filter-date-to').value = '';
        
        this.currentFilters = {};
        this.currentPage = 1;
        this.refreshHistoryList();
    }

    // 处理排序
    handleSort(sortBy) {
        const currentSort = this.currentFilters.sortBy;
        const currentOrder = this.currentFilters.sortOrder || 'desc';
        
        if (currentSort === sortBy) {
            this.currentFilters.sortOrder = currentOrder === 'desc' ? 'asc' : 'desc';
        } else {
            this.currentFilters.sortBy = sortBy;
            this.currentFilters.sortOrder = 'desc';
        }
        
        this.refreshHistoryList();
    }

    // 刷新历史记录列表
    refreshHistoryList() {
        if (!window.transferHistory) return;
        
        const filteredHistory = window.transferHistory.getHistory(this.currentFilters);
        const totalPages = Math.ceil(filteredHistory.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = filteredHistory.slice(startIndex, endIndex);
        
        this.renderHistoryList(pageData);
        this.updatePagination(this.currentPage, totalPages);
    }

    // 渲染历史记录列表
    renderHistoryList(records) {
        const listContainer = document.getElementById('history-list');
        if (!listContainer) return;
        
        if (records.length === 0) {
            listContainer.innerHTML = `
                <div class="no-history">
                    <p >No transfer history found</p>
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = records.map(record => this.createHistoryItem(record)).join('');
    }

    // 创建历史记录项
    createHistoryItem(record) {
        const time = new Date(record.timestamp).toLocaleString();
        const direction = record.direction === 'sent' ? '↑' : '↓';
        const directionClass = record.direction === 'sent' ? 'sent' : 'received';
        const typeIcon = this.getTypeIcon(record.type, record.fileType);
        const size = record.fileSize ? window.transferHistory.formatFileSize(record.fileSize) : 
                    record.contentLength ? `${record.contentLength} chars` : '-';
        const name = record.fileName || record.content || '-';
        const status = this.getStatusBadge(record.status);
        
        return `
            <div class="history-item ${directionClass}" data-id="${record.id}">
                <div class="item-time">${time}</div>
                <div class="item-type">
                    <span class="type-icon">${typeIcon}</span>
                    <span class="direction">${direction}</span>
                </div>
                <div class="item-name" title="${name}">${name}</div>
                <div class="item-size">${size}</div>
                <div class="item-device">${record.peerName}</div>
                <div class="item-status">${status}</div>
            </div>
        `;
    }

    // 获取类型图标
    getTypeIcon(type, fileType) {
        if (type === 'text') return '💬';
        
        if (fileType) {
            if (fileType.startsWith('image/')) return '🖼️';
            if (fileType.startsWith('video/')) return '🎥';
            if (fileType.startsWith('audio/')) return '🎵';
            if (fileType.includes('pdf')) return '📄';
            if (fileType.includes('zip') || fileType.includes('archive')) return '📦';
        }
        
        return '📁';
    }

    // 获取状态徽章
    getStatusBadge(status) {
        const badges = {
            'completed': '<span class="status-badge success">✓</span>',
            'sending': '<span class="status-badge pending">⏳</span>',
            'failed': '<span class="status-badge error">✗</span>'
        };
        
        return badges[status] || '';
    }

    // 更新分页
    updatePagination(currentPage, totalPages) {
        const pageInfo = document.getElementById('page-info');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (pageInfo) pageInfo.textContent = `${currentPage} / ${totalPages}`;
        if (prevBtn) prevBtn.disabled = currentPage <= 1;
        if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    }

    // 上一页
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.refreshHistoryList();
        }
    }

    // 下一页
    nextPage() {
        this.currentPage++;
        this.refreshHistoryList();
    }

    // 更新统计信息
    updateStatistics() {
        if (!window.transferHistory) return;
        
        const stats = window.transferHistory.getStatistics();
        
        document.getElementById('total-transfers').textContent = stats.totalTransfers;
        document.getElementById('total-files').textContent = stats.totalFilesSent + stats.totalFilesReceived;
        document.getElementById('total-data').textContent = 
            window.transferHistory.formatFileSize(stats.totalDataSent + stats.totalDataReceived);
        document.getElementById('most-active-device').textContent = stats.mostActiveDevice || '-';
    }

    // 导出历史记录
    exportHistory() {
        if (!window.transferHistory) return;
        
        const format = confirm('Export as CSV? (Cancel for JSON)') ? 'csv' : 'json';
        const data = window.transferHistory.exportHistory(format);
        const filename = `dropshare-history-${new Date().toISOString().split('T')[0]}.${format}`;
        
        this.downloadFile(data, filename, format === 'csv' ? 'text/csv' : 'application/json');
    }

    // 清除历史记录
    clearHistory() {
        if (!confirm('Are you sure you want to clear all transfer history? This action cannot be undone.')) {
            return;
        }
        
        if (window.transferHistory) {
            window.transferHistory.clearHistory();
            this.refreshHistoryList();
            this.updateStatistics();
        }
    }

    // 下载文件
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// 初始化历史记录UI
document.addEventListener('DOMContentLoaded', () => {
    window.transferHistoryUI = new TransferHistoryUI();
});