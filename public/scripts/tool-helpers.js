/**
 * Tool Helpers - Common functions for integrating sharing into tool pages
 */

window.ToolHelpers = {
    
    // Initialize sharing system for a tool page
    initializeToolSharing(options = {}) {
        // Default options
        const config = {
            shareButtonText: 'Share Processed File',
            shareButtonContainer: '#shareButtonContainer',
            onFileProcessed: null,
            onReset: null,
            ...options
        };

        // Store config for later use
        this.config = config;

        // Ensure share system is available
        if (!window.toolShareSystem) {
            console.warn('Tool share system not available');
            return false;
        }

        return true;
    },

    // Add a processed file to the share system
    addProcessedFileToShare(file, fileName, fileType, clearPrevious = true) {
        if (!window.toolShareSystem) {
            console.warn('Tool share system not available');
            return;
        }

        if (clearPrevious) {
            window.toolShareSystem.clearProcessedFiles();
        }

        const fileId = window.toolShareSystem.addProcessedFile(file, fileName, fileType);
        this.showShareButton();
        return fileId;
    },

    // Show the share button in the designated container
    showShareButton() {
        const container = document.querySelector(this.config.shareButtonContainer);
        if (!container || !window.createToolShareButton) {
            console.warn('Share button container not found or share system not available');
            return;
        }

        container.innerHTML = '';
        const shareButton = window.createToolShareButton(this.config.shareButtonText);
        container.appendChild(shareButton);
        container.style.display = 'block';
    },

    // Hide the share button and clear processed files
    hideShareButton() {
        const container = document.querySelector(this.config.shareButtonContainer);
        if (container) {
            container.style.display = 'none';
            container.innerHTML = '';
        }

        if (window.toolShareSystem) {
            window.toolShareSystem.clearProcessedFiles();
        }
    },

    // Convert canvas to blob and add to share system
    shareCanvasAsImage(canvas, fileName, format = 'png', quality = 0.9) {
        if (!canvas) {
            console.warn('Canvas not provided');
            return;
        }

        const mimeType = `image/${format}`;
        canvas.toBlob((blob) => {
            if (blob) {
                this.addProcessedFileToShare(blob, fileName, mimeType);
            }
        }, mimeType, quality);
    },

    // Convert data URL to blob and add to share system
    shareDataUrlAsFile(dataUrl, fileName, fileType) {
        try {
            const blob = this.dataURLToBlob(dataUrl);
            this.addProcessedFileToShare(blob, fileName, fileType);
        } catch (error) {
            console.error('Error converting data URL to blob:', error);
        }
    },

    // Convert data URL to blob
    dataURLToBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type: mime});
    },

    // Create a standard action buttons layout with sharing support
    createActionButtonsHTML(options = {}) {
        const {
            downloadButton = true,
            shareButton = true,
            resetButton = true,
            backButton = true,
            backUrl = 'image-tools.html',
            customButtons = []
        } = options;

        let html = '<div class="action-buttons">';
        
        if (downloadButton) {
            html += `
                <button class="btn btn-success" id="downloadBtn">
                    <span>📥 Download</span>
                </button>
            `;
        }

        if (shareButton) {
            html += '<div id="shareButtonContainer" style="display: none;"></div>';
        }

        // Add custom buttons
        customButtons.forEach(button => {
            html += `
                <button class="btn ${button.class || 'btn-secondary'}" id="${button.id || ''}" 
                        ${button.onclick ? `onclick="${button.onclick}"` : ''}>
                    <span>${button.text}</span>
                </button>
            `;
        });

        if (resetButton) {
            html += `
                <button class="btn btn-secondary" id="resetBtn">
                    <span>🔄 Reset</span>
                </button>
            `;
        }

        if (backButton) {
            html += `
                <a href="${backUrl}" class="btn btn-primary">
                    <span>← Back to Tools</span>
                </a>
            `;
        }

        html += '</div>';
        return html;
    },

    // Get file icon based on type
    getFileIcon(fileType) {
        if (!fileType) return '📁';
        
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType.startsWith('video/')) return '🎥';
        if (fileType.startsWith('audio/')) return '🎧';
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word')) return '📄';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📈';
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
        if (fileType.includes('zip') || fileType.includes('archive')) return '🗄️';
        return '📁';
    },

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Show notification
    showNotification(message, type = 'info') {
        if (window.Events) {
            window.Events.fire('notify-user', message);
        } else if (window.toolShareSystem) {
            window.toolShareSystem.showToast(message);
        } else {
            // Fallback alert
            alert(message);
        }
    },

    // Create a standard tool page structure
    createStandardToolHTML(config) {
        const {
            title = 'Tool',
            subtitle = 'Process your files',
            uploadText = 'Click to select files or drag here',
            uploadHint = 'Supports multiple file formats',
            acceptTypes = '*/*'
        } = config;

        return `
            <div class="container">
                <h1 class="page-title">${title}</h1>
                <p class="page-subtitle">${subtitle}</p>

                <div class="tool-card">
                    <div class="upload-area" id="uploadArea">
                        <div class="upload-icon">📁</div>
                        <div class="upload-text">${uploadText}</div>
                        <div class="upload-hint">${uploadHint}</div>
                        <input type="file" id="fileInput" accept="${acceptTypes}" multiple>
                    </div>

                    <div class="progress-bar" id="progressBar" style="display: none;">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>

                    <div class="tool-preview" id="toolPreview" style="display: none;">
                        <!-- Tool-specific content goes here -->
                    </div>

                    <div class="action-buttons" id="actionButtons" style="display: none;">
                        <!-- Action buttons will be inserted here -->
                    </div>
                </div>
            </div>
        `;
    },

    // Initialize standard drag and drop functionality
    initializeDragAndDrop(uploadArea, fileInput, callback) {
        // Click to select
        uploadArea.addEventListener('click', () => fileInput.click());
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0 && callback) {
                callback(files);
            }
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0 && callback) {
                callback(e.target.files);
            }
        });
    },

    // Show progress animation
    showProgress(callback) {
        const progressBar = document.getElementById('progressBar');
        const progressFill = document.getElementById('progressFill');
        
        if (progressBar && progressFill) {
            progressBar.style.display = 'block';
            let progress = 0;
            
            const interval = setInterval(() => {
                progress += 10;
                progressFill.style.width = progress + '%';
                
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        progressBar.style.display = 'none';
                        progressFill.style.width = '0%';
                        if (callback) callback();
                    }, 500);
                }
            }, 50);
        } else if (callback) {
            // If no progress bar, just call callback after a short delay
            setTimeout(callback, 100);
        }
    }
};

// Make it available globally
window.ToolHelpers = window.ToolHelpers;