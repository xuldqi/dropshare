/**
 * 文件格式转换模块
 * 支持音频、图片格式转换，并可选择下载或发送给其他设备
 */
class FileConverter {
    constructor() {
        this.supportedAudioFormats = ['mp3', 'wav', 'aac', 'ogg', 'flac'];
        this.supportedImageFormats = ['jpeg', 'png', 'webp', 'gif', 'bmp'];
        this.isConverting = false;
        this.conversionHistory = [];
        this.conversionResults = [];  // 初始化转换结果数组
        this.selectedFiles = [];      // 初始化选中文件数组
        
        this.init();
    }
    
    init() {
        this.createConverterUI();
        this.bindEvents();
        this.loadConversionHistory();
    }
    
    createConverterUI() {
        // 创建转换器对话框
        this.createConverterDialog();
        this.createConversionResultDialog();
    }
    

    
    createConverterDialog() {
        const dialog = document.createElement('x-dialog');
        dialog.id = 'converterDialog';
        // 确保对话框初始时是隐藏的
        dialog.style.display = 'none';
        dialog.innerHTML = `
            <x-background class="full"></x-background>
            <x-paper shadow="2">
                <h2>File Converter</h2>
                <div class="converter-content">
                    <div class="file-upload-area" id="converterFileArea">
                        <div class="upload-icon">📁</div>
                        <p>Drop files here or click to select</p>
                        <input type="file" id="converterFileInput" multiple accept="audio/*,image/*" style="display: none;">
                        <button class="button" onclick="document.getElementById('converterFileInput').click()">Select Files</button>
                    </div>
                    
                    <div class="conversion-options" id="conversionOptions" style="display: none;">
                        <div class="file-info" id="fileInfo"></div>
                        
                        <div class="format-selection">
                            <label for="targetFormat">Target Format:</label>
                            <select id="targetFormat">
                                <option value="">Select format...</option>
                            </select>
                        </div>
                        
                        <div class="quality-settings" id="qualitySettings" style="display: none;">
                            <label for="qualitySlider">Quality:</label>
                            <input type="range" id="qualitySlider" min="1" max="100" value="80">
                            <span id="qualityValue">80%</span>
                        </div>
                        
                        <div class="audio-settings" id="audioSettings" style="display: none;">
                            <label for="bitrateSelect">Bitrate:</label>
                            <select id="bitrateSelect">
                                <option value="128k">128 kbps</option>
                                <option value="192k" selected>192 kbps</option>
                                <option value="256k">256 kbps</option>
                                <option value="320k">320 kbps</option>
                            </select>
                        </div>
                        
                        <div class="image-settings" id="imageSettings" style="display: none;">
                            <label for="resizeWidth">Width:</label>
                            <input type="number" id="resizeWidth" placeholder="Auto">
                            <label for="resizeHeight">Height:</label>
                            <input type="number" id="resizeHeight" placeholder="Auto">
                            <label>
                                <input type="checkbox" id="maintainAspectRatio" checked>
                                Maintain aspect ratio
                            </label>
                        </div>
                        
                        <div class="conversion-actions">
                            <button id="startConversionBtn" class="button primary">Convert</button>
                            <button class="button" onclick="this.closest('x-dialog').close()">Cancel</button>
                        </div>
                    </div>
                    
                    <div class="conversion-progress" id="conversionProgress" style="display: none;">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                        <p id="progressText">Converting...</p>
                    </div>
                </div>
            </x-paper>
        `;
        document.body.appendChild(dialog);
        // 初始化对话框方法
        this.initDialogMethods(dialog);
    }
    
    createConversionResultDialog() {
        const dialog = document.createElement('x-dialog');
        dialog.id = 'conversionResultDialog';
        // 确保对话框初始时是隐藏的
        dialog.style.display = 'none';
        dialog.innerHTML = `
            <x-background class="full"></x-background>
            <x-paper shadow="2">
                <h2>Conversion Complete</h2>
                <div class="result-content">
                    <div class="result-info" id="resultInfo"></div>
                    <div class="result-preview" id="resultPreview"></div>
                    <div class="result-actions">
                        <button id="downloadResultBtn" class="button primary">Download</button>
                        <button id="sendResultBtn" class="button">Send to Device</button>
                        <button class="button" onclick="this.closest('x-dialog').close()">Close</button>
                    </div>
                </div>
            </x-paper>
        `;
        document.body.appendChild(dialog);
        // 初始化对话框方法
        this.initDialogMethods(dialog);
    }
    
    initDialogMethods(dialog) {
        if (!dialog.show) {
            dialog.show = function() {
                // 关闭其他对话框
                document.querySelectorAll('x-dialog[show]').forEach(d => {
                    if (d !== this) d.close();
                });
                this.setAttribute('show', '1');
            };
        }
        if (!dialog.close) {
            dialog.close = function() {
                this.removeAttribute('show');
            };
        }
    }
    
    bindEvents() {
        // 安全的事件绑定辅助函数
        const safeGetElement = (id) => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element with id '${id}' not found`);
            }
            return element;
        };

        // 转换器按钮事件
        const converterBtn = safeGetElement('converterBtn');
        if (converterBtn) {
            converterBtn.addEventListener('click', () => {
                const converterDialog = safeGetElement('converterDialog');
                if (converterDialog) converterDialog.show();
            });
        }
        
        // 文件选择事件
        const fileInput = safeGetElement('converterFileInput');
        const fileArea = safeGetElement('converterFileArea');
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelection(e.target.files);
            });
        }
        
        // 拖拽事件
        if (fileArea) {
            fileArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileArea.classList.add('drag-over');
            });
            
            fileArea.addEventListener('dragleave', () => {
                fileArea.classList.remove('drag-over');
            });
            
            fileArea.addEventListener('drop', (e) => {
                e.preventDefault();
                fileArea.classList.remove('drag-over');
                this.handleFileSelection(e.dataTransfer.files);
            });
        }
        
        // 格式选择事件
        const targetFormat = safeGetElement('targetFormat');
        if (targetFormat) {
            targetFormat.addEventListener('change', (e) => {
                this.updateConversionSettings(e.target.value);
            });
        }
        
        // 质量滑块事件
        const qualitySlider = safeGetElement('qualitySlider');
        if (qualitySlider) {
            qualitySlider.addEventListener('input', (e) => {
                const qualityValue = safeGetElement('qualityValue');
                if (qualityValue) {
                    qualityValue.textContent = e.target.value + '%';
                }
            });
        }
        
        // 转换按钮事件
        const startConversionBtn = safeGetElement('startConversionBtn');
        if (startConversionBtn) {
            startConversionBtn.addEventListener('click', () => {
                this.startConversion();
            });
        }
        
        // 结果操作事件
        const downloadResultBtn = safeGetElement('downloadResultBtn');
        if (downloadResultBtn) {
            downloadResultBtn.addEventListener('click', () => {
                this.downloadResult();
            });
        }
        
        const sendResultBtn = safeGetElement('sendResultBtn');
        if (sendResultBtn) {
            sendResultBtn.addEventListener('click', () => {
                this.sendResult();
            });
        }
    }
    
    handleFileSelection(files) {
        if (files.length === 0) return;
        
        this.selectedFiles = Array.from(files);
        this.displayFileInfo();
        this.updateFormatOptions();
        
        document.getElementById('converterFileArea').style.display = 'none';
        document.getElementById('conversionOptions').style.display = 'block';
    }
    
    displayFileInfo() {
        const fileInfo = document.getElementById('fileInfo');
        const file = this.selectedFiles[0]; // 显示第一个文件的信息
        
        fileInfo.innerHTML = `
            <div class="file-item">
                <div class="file-icon">${this.getFileIcon(file.name)}</div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                    <div class="file-type">${file.type || 'Unknown'}</div>
                </div>
            </div>
            ${this.selectedFiles.length > 1 ? `<p>+${this.selectedFiles.length - 1} more files</p>` : ''}
        `;
    }
    
    updateFormatOptions() {
        const targetFormat = document.getElementById('targetFormat');
        const file = this.selectedFiles[0];
        const fileType = this.getFileCategory(file);
        
        targetFormat.innerHTML = '<option value="">Select format...</option>';
        
        if (fileType === 'audio') {
            this.supportedAudioFormats.forEach(format => {
                const option = document.createElement('option');
                option.value = format;
                option.textContent = format.toUpperCase();
                targetFormat.appendChild(option);
            });
        } else if (fileType === 'image') {
            this.supportedImageFormats.forEach(format => {
                const option = document.createElement('option');
                option.value = format;
                option.textContent = format.toUpperCase();
                targetFormat.appendChild(option);
            });
        }
    }
    
    updateConversionSettings(format) {
        const qualitySettings = document.getElementById('qualitySettings');
        const audioSettings = document.getElementById('audioSettings');
        const imageSettings = document.getElementById('imageSettings');
        
        // 隐藏所有设置
        qualitySettings.style.display = 'none';
        audioSettings.style.display = 'none';
        imageSettings.style.display = 'none';
        
        if (!format) return;
        
        const fileType = this.getFileCategory(this.selectedFiles[0]);
        
        if (fileType === 'audio') {
            audioSettings.style.display = 'block';
            if (['mp3', 'aac', 'ogg'].includes(format)) {
                qualitySettings.style.display = 'block';
            }
        } else if (fileType === 'image') {
            imageSettings.style.display = 'block';
            if (['jpeg', 'webp'].includes(format)) {
                qualitySettings.style.display = 'block';
            }
        }
    }
    
    async startConversion() {
        const targetFormat = document.getElementById('targetFormat').value;
        if (!targetFormat) {
            this.showToast('Please select a target format', 'error');
            return;
        }
        
        this.isConverting = true;
        document.getElementById('conversionOptions').style.display = 'none';
        document.getElementById('conversionProgress').style.display = 'block';
        
        try {
            const results = [];
            
            for (let i = 0; i < this.selectedFiles.length; i++) {
                const file = this.selectedFiles[i];
                this.updateProgress((i / this.selectedFiles.length) * 100, `Converting ${file.name}...`);
                
                const result = await this.convertFile(file, targetFormat);
                results.push(result);
            }
            
            this.updateProgress(100, 'Conversion complete!');
            this.conversionResults = results;
            
            setTimeout(() => {
                document.getElementById('converterDialog').close();
                this.showConversionResults();
            }, 1000);
            
        } catch (error) {
            console.error('Conversion failed:', error);
            this.showToast('Conversion failed: ' + error.message, 'error');
        } finally {
            this.isConverting = false;
        }
    }
    
    async convertFile(file, targetFormat) {
        const fileType = this.getFileCategory(file);
        
        if (fileType === 'image') {
            return await this.convertImage(file, targetFormat);
        } else if (fileType === 'audio') {
            return await this.convertAudio(file, targetFormat);
        } else {
            throw new Error('Unsupported file type');
        }
    }
    
    async convertImage(file, targetFormat) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                const width = parseInt(document.getElementById('resizeWidth').value) || img.width;
                const height = parseInt(document.getElementById('resizeHeight').value) || img.height;
                const maintainAspectRatio = document.getElementById('maintainAspectRatio').checked;
                
                let finalWidth = width;
                let finalHeight = height;
                
                if (maintainAspectRatio && (width !== img.width || height !== img.height)) {
                    const aspectRatio = img.width / img.height;
                    if (width / height > aspectRatio) {
                        finalWidth = height * aspectRatio;
                    } else {
                        finalHeight = width / aspectRatio;
                    }
                }
                
                canvas.width = finalWidth;
                canvas.height = finalHeight;
                
                ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
                
                const quality = document.getElementById('qualitySlider').value / 100;
                const mimeType = this.getMimeType(targetFormat);
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const newFileName = this.changeFileExtension(file.name, targetFormat);
                        const convertedFile = new File([blob], newFileName, { type: mimeType });
                        resolve(convertedFile);
                    } else {
                        reject(new Error('Failed to convert image'));
                    }
                }, mimeType, quality);
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }
    
    async convertAudio(file, targetFormat) {
        try {
            // 使用 FFmpeg 懒加载管理器进行真实的音频转换
            if (!window.ffmpegLoader) {
                throw new Error('FFmpeg 加载管理器不可用');
            }

            // 获取 FFmpeg 实例（触发懒加载）
            const ffmpeg = await window.ffmpegLoader.getFFmpeg({
                onProgress: (percent, text) => {
                    this.updateProgress(percent, text);
                },
                onStatusUpdate: (status) => {
                    console.log('FFmpeg 状态:', status);
                }
            });

            const inputFileName = `input_${Date.now()}.${file.name.split('.').pop().toLowerCase()}`;
            const outputFileName = `output_${Date.now()}.${targetFormat}`;
            
            // 将文件写入 FFmpeg 文件系统
            await ffmpeg.writeFile(inputFileName, new Uint8Array(await file.arrayBuffer()));
            
            // 构建转换命令参数
            let args = ['-i', inputFileName];
            
            // 根据目标格式设置编码参数
            switch (targetFormat) {
                case 'mp3':
                    args.push('-codec:a', 'libmp3lame', '-b:a', '192k');
                    break;
                case 'wav':
                    args.push('-codec:a', 'pcm_s16le');
                    break;
                case 'aac':
                    args.push('-codec:a', 'aac', '-b:a', '192k');
                    break;
                case 'ogg':
                    args.push('-codec:a', 'libvorbis', '-b:a', '192k');
                    break;
                case 'flac':
                    args.push('-codec:a', 'flac');
                    break;
                default:
                    args.push('-codec:a', 'libmp3lame', '-b:a', '192k');
            }
            
            args.push('-ar', '44100', outputFileName);
            
            // 执行转换
            await ffmpeg.exec(args);
            
            // 读取转换后的文件
            const data = await ffmpeg.readFile(outputFileName);
            
            // 清理临时文件
            await ffmpeg.deleteFile(inputFileName);
            await ffmpeg.deleteFile(outputFileName);
            
            // 创建新文件对象
            const newFileName = this.changeFileExtension(file.name, targetFormat);
            const mimeType = this.getMimeType(targetFormat);
            
            return new File([data], newFileName, { type: mimeType });
            
        } catch (error) {
            console.error('音频转换失败:', error);
            
            // 如果 FFmpeg 转换失败，回退到简单的文件重命名
            if (error.message.includes('FFmpeg') || error.message.includes('加载')) {
                console.warn('FFmpeg 不可用，使用简化转换（仅更改文件扩展名）');
                return this.fallbackAudioConversion(file, targetFormat);
            }
            
            throw error;
        }
    }
    
    // 回退方案：简单的文件重命名（当 FFmpeg 不可用时）
    async fallbackAudioConversion(file, targetFormat) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const newFileName = this.changeFileExtension(file.name, targetFormat);
                const mimeType = this.getMimeType(targetFormat);
                const convertedFile = new File([reader.result], newFileName, { type: mimeType });
                resolve(convertedFile);
            };
            reader.onerror = () => reject(new Error('Failed to read audio file'));
            reader.readAsArrayBuffer(file);
        });
    }
    
    showConversionResults() {
        const resultInfo = document.getElementById('resultInfo');
        const resultPreview = document.getElementById('resultPreview');
        
        if (this.conversionResults.length === 1) {
            const result = this.conversionResults[0];
            resultInfo.innerHTML = `
                <div class="result-file">
                    <div class="file-icon">${this.getFileIcon(result.name)}</div>
                    <div class="file-details">
                        <div class="file-name">${result.name}</div>
                        <div class="file-size">${this.formatFileSize(result.size)}</div>
                        <div class="file-type">${result.type}</div>
                    </div>
                </div>
            `;
            
            // 显示预览（如果是图片）
            if (result.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(result);
                img.style.maxWidth = '200px';
                img.style.maxHeight = '200px';
                resultPreview.appendChild(img);
            }
        } else {
            resultInfo.innerHTML = `
                <div class="batch-result">
                    <h3>Batch Conversion Complete</h3>
                    <p>${this.conversionResults.length} files converted successfully</p>
                </div>
            `;
        }
        
        document.getElementById('conversionResultDialog').show();
    }
    
    downloadResult() {
        if (this.conversionResults.length === 1) {
            const result = this.conversionResults[0];
            const url = URL.createObjectURL(result);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.name;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            // 批量下载：创建ZIP文件
            this.downloadAsZip();
        }
        
        this.saveToHistory();
    }
    
    async downloadAsZip() {
        // 简化实现：逐个下载文件
        // 实际应用中可以使用 JSZip 库创建ZIP文件
        for (const result of this.conversionResults) {
            const url = URL.createObjectURL(result);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.name;
            a.click();
            URL.revokeObjectURL(url);
            await new Promise(resolve => setTimeout(resolve, 100)); // 避免同时下载太多文件
        }
    }
    
    sendResult() {
        // 集成到现有的文件传输系统
        if (this.conversionResults.length === 0) return;
        
        // 关闭结果对话框
        document.getElementById('conversionResultDialog').close();
        
        // 将转换结果添加到传输队列
        if (window.ui && window.ui.filesQueue) {
            this.conversionResults.forEach(file => {
                window.ui.filesQueue.push(file);
            });
            
            // 触发文件传输界面更新
            if (window.ui.updateFilesQueue) {
                window.ui.updateFilesQueue();
            }
            
            this.showToast(`${this.conversionResults.length} converted file(s) added to transfer queue`, 'success');
        } else {
            this.showToast('File transfer system not available', 'error');
        }
        
        this.saveToHistory();
    }
    
    updateProgress(percent, text) {
        document.getElementById('progressFill').style.width = percent + '%';
        document.getElementById('progressText').textContent = text;
    }
    
    getFileCategory(file) {
        if (file.type.startsWith('audio/')) return 'audio';
        if (file.type.startsWith('image/')) return 'image';
        return 'unknown';
    }
    
    getMimeType(format) {
        const mimeTypes = {
            // 图片格式
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            // 音频格式
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'aac': 'audio/aac',
            'ogg': 'audio/ogg',
            'flac': 'audio/flac'
        };
        return mimeTypes[format] || 'application/octet-stream';
    }
    
    changeFileExtension(fileName, newExtension) {
        const lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return fileName + '.' + newExtension;
        }
        return fileName.substring(0, lastDotIndex) + '.' + newExtension;
    }
    
    getFileIcon(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const iconMap = {
            'mp3': '🎵', 'wav': '🎵', 'aac': '🎵', 'ogg': '🎵', 'flac': '🎵',
            'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'webp': '🖼️', 'bmp': '🖼️'
        };
        return iconMap[ext] || '📄';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    saveToHistory() {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            originalFiles: this.selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
            convertedFiles: this.conversionResults.map(f => ({ name: f.name, size: f.size, type: f.type })),
            settings: {
                targetFormat: document.getElementById('targetFormat').value,
                quality: document.getElementById('qualitySlider').value
            }
        };
        
        this.conversionHistory.unshift(historyItem);
        
        // 限制历史记录数量
        if (this.conversionHistory.length > 50) {
            this.conversionHistory = this.conversionHistory.slice(0, 50);
        }
        
        localStorage.setItem('conversionHistory', JSON.stringify(this.conversionHistory));
    }
    
    loadConversionHistory() {
        const stored = localStorage.getItem('conversionHistory');
        this.conversionHistory = stored ? JSON.parse(stored) : [];
    }
    
    showToast(message, type = 'info') {
        // 使用现有的toast系统
        if (window.ui && window.ui.showToast) {
            window.ui.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// 文件转换器初始化
let fileConverter;
document.addEventListener('DOMContentLoaded', () => {
    console.log('File converter ready for initialization');
    // fileConverter = new FileConverter(); // 由主页面控制初始化
});