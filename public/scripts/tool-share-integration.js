/**
 * Tool Share Integration System
 * Integrates file sharing functionality into tool workflows
 */

class ToolShareSystem {
    constructor() {
        this.processedFiles = [];
        this.shareModal = null;
        this.selectedPeers = new Set();
        this.initializeSystem();
    }

    initializeSystem() {
        this.createShareModal();
        this.attachEventListeners();
        console.log('Tool Share System initialized');
    }

    // Create the share modal HTML structure
    createShareModal() {
        const modalHTML = `
            <div id="toolShareModal" class="tool-share-modal" style="display: none;">
                <div class="modal-backdrop" onclick="toolShareSystem.closeShareModal()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Share Processed Files</h3>
                        <button class="modal-close" onclick="toolShareSystem.closeShareModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="files-section">
                            <h4>Files to Share (<span id="fileCount">0</span>)</h4>
                            <div id="filesToShare" class="files-list"></div>
                        </div>
                        <div class="peers-section">
                            <h4>Select Devices</h4>
                            <div id="availablePeers" class="peers-grid">
                                <div class="no-peers-message">
                                    <p>No devices found nearby</p>
                                    <p class="hint">Make sure other devices have DropShare open</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="shareFilesBtn" class="btn btn-primary" disabled onclick="toolShareSystem.shareSelectedFiles()">
                            Share Files
                        </button>
                        <button class="btn btn-secondary" onclick="toolShareSystem.closeShareModal()">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Insert modal into page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.shareModal = document.getElementById('toolShareModal');
        this.addModalStyles();
    }

    // Add CSS styles for the share modal
    addModalStyles() {
        const styles = `
            <style id="toolShareModalStyles">
                .tool-share-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .modal-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                }

                .modal-content {
                    position: relative;
                    background: white;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow: hidden;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .modal-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1f2937;
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #6b7280;
                    padding: 0;
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-close:hover {
                    background: #f3f4f6;
                    color: #374151;
                }

                .modal-body {
                    padding: 24px;
                    max-height: 50vh;
                    overflow-y: auto;
                }

                .files-section, .peers-section {
                    margin-bottom: 24px;
                }

                .files-section h4, .peers-section h4 {
                    margin: 0 0 16px 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #374151;
                }

                .files-list {
                    max-height: 120px;
                    overflow-y: auto;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    background: #f9fafb;
                }

                .file-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .file-item:last-child {
                    border-bottom: none;
                }

                .file-icon {
                    font-size: 16px;
                    margin-right: 8px;
                }

                .file-info {
                    flex: 1;
                }

                .file-name {
                    font-weight: 500;
                    color: #374151;
                    margin-bottom: 2px;
                }

                .file-size {
                    font-size: 12px;
                    color: #6b7280;
                }

                .peers-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 12px;
                    min-height: 100px;
                }

                .peer-option {
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: white;
                }

                .peer-option:hover {
                    border-color: #3367d6;
                    background: #f8faff;
                }

                .peer-option.selected {
                    border-color: #3367d6;
                    background: #eff6ff;
                }

                .peer-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .peer-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #e5e7eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                }

                .peer-details {
                    flex: 1;
                }

                .peer-name {
                    font-weight: 500;
                    color: #374151;
                    margin-bottom: 2px;
                    font-size: 14px;
                }

                .peer-device {
                    font-size: 12px;
                    color: #6b7280;
                }

                .no-peers-message {
                    grid-column: 1 / -1;
                    text-align: center;
                    color: #6b7280;
                    padding: 40px 20px;
                }

                .no-peers-message p {
                    margin: 0 0 8px 0;
                }

                .no-peers-message .hint {
                    font-size: 14px;
                    color: #9ca3af;
                }

                .modal-footer {
                    padding: 20px 24px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .btn {
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                    border: none;
                    font-size: 14px;
                }

                .btn-primary {
                    background: #3367d6;
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    background: #2563eb;
                }

                .btn-primary:disabled {
                    background: #e5e7eb;
                    color: #9ca3af;
                    cursor: not-allowed;
                }

                .btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                }

                .btn-secondary:hover {
                    background: #e5e7eb;
                }

                @media (max-width: 768px) {
                    .modal-content {
                        max-width: calc(100vw - 40px);
                        max-height: calc(100vh - 40px);
                    }

                    .peers-grid {
                        grid-template-columns: 1fr;
                    }

                    .modal-footer {
                        flex-direction: column;
                    }

                    .btn {
                        width: 100%;
                    }
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    // Attach event listeners
    attachEventListeners() {
        // Listen for peer updates
        if (window.Events) {
            window.Events.on('peer-joined', () => this.updateAvailablePeers());
            window.Events.on('peer-left', () => this.updateAvailablePeers());
            window.Events.on('peers', () => this.updateAvailablePeers());
        }
    }

    // Add processed file to share list
    addProcessedFile(file, fileName = null, fileType = 'application/octet-stream') {
        const fileObj = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            file: file,
            name: fileName || 'processed_file',
            type: fileType,
            size: file instanceof Blob ? file.size : 0,
            timestamp: Date.now()
        };
        
        this.processedFiles.push(fileObj);
        console.log('Added processed file:', fileObj.name);
        return fileObj.id;
    }

    // Show share modal with current processed files
    showShareModal() {
        if (this.processedFiles.length === 0) {
            this.showToast('No files to share');
            return;
        }

        this.updateFilesDisplay();
        this.updateAvailablePeers();
        this.shareModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Close share modal
    closeShareModal() {
        this.shareModal.style.display = 'none';
        document.body.style.overflow = '';
        this.selectedPeers.clear();
        this.updateShareButton();
    }

    // Update files display in modal
    updateFilesDisplay() {
        const container = document.getElementById('filesToShare');
        const countEl = document.getElementById('fileCount');
        
        countEl.textContent = this.processedFiles.length;
        
        if (this.processedFiles.length === 0) {
            container.innerHTML = '<div class="no-files">No files to share</div>';
            return;
        }

        container.innerHTML = this.processedFiles.map(file => `
            <div class="file-item">
                <div class="file-icon">${this.getFileIcon(file.type)}</div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
            </div>
        `).join('');
    }

    // Update available peers display
    updateAvailablePeers() {
        const container = document.getElementById('availablePeers');
        if (!container) return;

        // Get peers from the main UI
        const peerElements = document.querySelectorAll('x-peer');
        
        if (peerElements.length === 0) {
            container.innerHTML = `
                <div class="no-peers-message">
                    <p>No devices found nearby</p>
                    <p class="hint">Make sure other devices have DropShare open</p>
                </div>
            `;
            return;
        }

        const peersHTML = Array.from(peerElements).map(peerEl => {
            const peerId = peerEl.id;
            const peerUI = peerEl.ui;
            if (!peerUI) return '';

            const displayName = peerUI._displayName();
            const deviceName = peerUI._deviceName();
            const isSelected = this.selectedPeers.has(peerId);

            return `
                <div class="peer-option ${isSelected ? 'selected' : ''}" 
                     onclick="toolShareSystem.togglePeerSelection('${peerId}')">
                    <div class="peer-info">
                        <div class="peer-icon">📱</div>
                        <div class="peer-details">
                            <div class="peer-name">${displayName}</div>
                            <div class="peer-device">${deviceName}</div>
                        </div>
                    </div>
                </div>
            `;
        }).filter(html => html).join('');

        container.innerHTML = peersHTML;
        this.updateShareButton();
    }

    // Toggle peer selection
    togglePeerSelection(peerId) {
        if (this.selectedPeers.has(peerId)) {
            this.selectedPeers.delete(peerId);
        } else {
            this.selectedPeers.add(peerId);
        }
        
        // Update visual selection
        const peerOption = document.querySelector(`.peer-option[onclick*="${peerId}"]`);
        if (peerOption) {
            peerOption.classList.toggle('selected');
        }
        
        this.updateShareButton();
    }

    // Update share button state
    updateShareButton() {
        const shareBtn = document.getElementById('shareFilesBtn');
        if (shareBtn) {
            shareBtn.disabled = this.selectedPeers.size === 0;
            shareBtn.textContent = this.selectedPeers.size === 0 
                ? 'Share Files' 
                : `Share to ${this.selectedPeers.size} Device${this.selectedPeers.size > 1 ? 's' : ''}`;
        }
    }

    // Share selected files to selected peers
    async shareSelectedFiles() {
        if (this.selectedPeers.size === 0 || this.processedFiles.length === 0) {
            return;
        }

        const shareBtn = document.getElementById('shareFilesBtn');
        shareBtn.disabled = true;
        shareBtn.textContent = 'Sharing...';

        try {
            // Convert processed files to File objects
            const filesToShare = [];
            for (const processedFile of this.processedFiles) {
                let file = processedFile.file;
                
                // If it's not a File object, convert it
                if (!(file instanceof File)) {
                    file = new File([file], processedFile.name, { 
                        type: processedFile.type 
                    });
                }
                filesToShare.push(file);
            }

            // Share files to each selected peer
            for (const peerId of this.selectedPeers) {
                if (window.Events) {
                    window.Events.fire('files-selected', {
                        files: filesToShare,
                        to: peerId
                    });
                }
            }

            this.showToast(`Sharing ${filesToShare.length} file${filesToShare.length > 1 ? 's' : ''} to ${this.selectedPeers.size} device${this.selectedPeers.size > 1 ? 's' : ''}`);
            
            // Close modal after successful sharing
            setTimeout(() => {
                this.closeShareModal();
                this.clearProcessedFiles();
            }, 1000);

        } catch (error) {
            console.error('Error sharing files:', error);
            this.showToast('Error sharing files. Please try again.');
        }

        shareBtn.disabled = false;
        shareBtn.textContent = 'Share Files';
    }

    // Clear processed files
    clearProcessedFiles() {
        this.processedFiles = [];
        this.selectedPeers.clear();
    }

    // Get file icon based on type
    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType.startsWith('video/')) return '🎥';
        if (fileType.startsWith('audio/')) return '🎧';
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word')) return '📄';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📈';
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
        return '📁';
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Show toast notification
    showToast(message) {
        if (window.Events) {
            window.Events.fire('notify-user', message);
        } else {
            // Fallback toast
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #374151;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 10001;
                font-size: 14px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            `;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 3000);
        }
    }
}

// Initialize the tool share system
let toolShareSystem;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    toolShareSystem = new ToolShareSystem();
    window.toolShareSystem = toolShareSystem;
});

// Helper function to create share button
function createToolShareButton(text = 'Share Files') {
    const button = document.createElement('button');
    button.className = 'btn btn-share';
    button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92S19.61 16.08 18 16.08z"/>
        </svg>
        ${text}
    `;
    button.onclick = () => {
        if (window.toolShareSystem) {
            window.toolShareSystem.showShareModal();
        }
    };
    
    // Add button styles
    button.style.cssText = `
        background: #10b981;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 20px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        transition: all 0.2s ease;
        margin-right: 12px;
    `;
    
    button.addEventListener('mouseenter', () => {
        button.style.background = '#059669';
        button.style.transform = 'translateY(-1px)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.background = '#10b981';
        button.style.transform = 'translateY(0)';
    });
    
    return button;
}

// Export for use in tools
window.createToolShareButton = createToolShareButton;