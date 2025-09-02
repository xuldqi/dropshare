/**
 * 工具页面专用Analytics跟踪
 */
class ToolsAnalytics {
    constructor() {
        this.currentTool = this.getCurrentTool();
        this.toolStartTime = Date.now();
        this.processingStats = {
            filesProcessed: 0,
            totalInputSize: 0,
            totalOutputSize: 0,
            conversionTime: 0
        };
        this.init();
    }

    init() {
        // 确保增强统计已加载
        if (typeof window.analyticsEnhanced !== 'undefined') {
            this.setupToolTracking();
            this.trackToolPageView();
        }
    }

    // 获取当前工具类型
    getCurrentTool() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        
        // 工具分类映射
        const toolCategories = {
            'image-compressor': { type: 'image', category: 'compression' },
            'image-converter': { type: 'image', category: 'format_conversion' },
            'image-resizer': { type: 'image', category: 'resize' },
            'image-cropper': { type: 'image', category: 'crop' },
            'image-rotator': { type: 'image', category: 'rotate' },
            'image-filter': { type: 'image', category: 'filter_effects' },
            'image-background-remover': { type: 'image', category: 'background_removal' },
            'image-watermark-tool': { type: 'image', category: 'watermark' },
            
            'audio-processor': { type: 'audio', category: 'processing' },
            'audio-converter': { type: 'audio', category: 'format_conversion' },
            
            'video-converter': { type: 'video', category: 'format_conversion' },
            'video-info': { type: 'video', category: 'metadata' },
            
            'document-processor': { type: 'document', category: 'processing' },
            'csv-to-xlsx': { type: 'document', category: 'format_conversion' },
            'xlsx-to-csv': { type: 'document', category: 'format_conversion' },
            'docx-to-html': { type: 'document', category: 'format_conversion' },
            'docx-to-txt': { type: 'document', category: 'format_conversion' },
            
            'text-to-image': { type: 'text', category: 'generation' }
        };

        return {
            name: filename,
            ...toolCategories[filename] || { type: 'unknown', category: 'other' }
        };
    }

    // 设置工具特定跟踪
    setupToolTracking() {
        // 跟踪文件选择
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                files.forEach(file => {
                    this.trackFileSelection(file);
                });
            });
        });

        // 跟踪按钮点击
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.trackButtonClick(button);
            });
        });

        // 跟踪设置变更
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.trackSettingChange(input);
            });
        });

        // 跟踪拖拽文件
        document.addEventListener('drop', (e) => {
            if (e.dataTransfer && e.dataTransfer.files.length > 0) {
                Array.from(e.dataTransfer.files).forEach(file => {
                    this.trackFileDrop(file);
                });
            }
        });
    }

    // 跟踪工具页面访问
    trackToolPageView() {
        window.analyticsEnhanced.trackEvent('tool_page_view', {
            tool_name: this.currentTool.name,
            tool_type: this.currentTool.type,
            tool_category: this.currentTool.category,
            page_url: window.location.href,
            referrer: document.referrer,
            user_agent: navigator.userAgent.substring(0, 100)
        });
    }

    // 跟踪文件选择
    trackFileSelection(file) {
        window.analyticsEnhanced.trackEvent('file_selected', {
            tool_name: this.currentTool.name,
            file_type: file.type || 'unknown',
            file_size: file.size,
            file_name_length: file.name ? file.name.length : 0,
            selection_method: 'file_input'
        });
    }

    // 跟踪文件拖拽
    trackFileDrop(file) {
        window.analyticsEnhanced.trackEvent('file_selected', {
            tool_name: this.currentTool.name,
            file_type: file.type || 'unknown',
            file_size: file.size,
            file_name_length: file.name ? file.name.length : 0,
            selection_method: 'drag_drop'
        });
    }

    // 跟踪按钮点击
    trackButtonClick(button) {
        const buttonText = button.textContent || button.innerText || '';
        const buttonId = button.id || '';
        const buttonClass = button.className || '';

        window.analyticsEnhanced.trackEvent('tool_button_click', {
            tool_name: this.currentTool.name,
            button_text: buttonText.substring(0, 50),
            button_id: buttonId,
            button_class: buttonClass.substring(0, 100)
        });
    }

    // 跟踪设置变更
    trackSettingChange(input) {
        const settingName = input.name || input.id || input.className;
        const settingValue = input.value;
        const settingType = input.type;

        window.analyticsEnhanced.trackEvent('tool_setting_change', {
            tool_name: this.currentTool.name,
            setting_name: settingName.substring(0, 50),
            setting_type: settingType,
            setting_value: settingValue ? settingValue.toString().substring(0, 100) : ''
        });
    }

    // 跟踪处理开始
    trackProcessingStart(inputFiles) {
        const totalSize = inputFiles.reduce((sum, file) => sum + file.size, 0);
        this.processingStartTime = Date.now();
        
        window.analyticsEnhanced.trackEvent('tool_processing_start', {
            tool_name: this.currentTool.name,
            input_file_count: inputFiles.length,
            total_input_size: totalSize,
            processing_id: this.generateProcessingId()
        });
    }

    // 跟踪处理进度
    trackProcessingProgress(progress, currentFile = null) {
        window.analyticsEnhanced.trackEvent('tool_processing_progress', {
            tool_name: this.currentTool.name,
            progress_percentage: Math.round(progress),
            current_file: currentFile ? currentFile.name.substring(0, 50) : '',
            elapsed_time: Date.now() - (this.processingStartTime || Date.now())
        });
    }

    // 跟踪处理完成
    trackProcessingComplete(outputFiles, inputFiles = []) {
        const processingTime = Date.now() - (this.processingStartTime || Date.now());
        const totalInputSize = inputFiles.reduce((sum, file) => sum + file.size, 0);
        const totalOutputSize = outputFiles.reduce((sum, file) => sum + (file.size || 0), 0);
        
        this.processingStats.filesProcessed += outputFiles.length;
        this.processingStats.totalInputSize += totalInputSize;
        this.processingStats.totalOutputSize += totalOutputSize;
        this.processingStats.conversionTime += processingTime;

        window.analyticsEnhanced.trackEvent('tool_processing_complete', {
            tool_name: this.currentTool.name,
            input_file_count: inputFiles.length,
            output_file_count: outputFiles.length,
            total_input_size: totalInputSize,
            total_output_size: totalOutputSize,
            processing_time: processingTime,
            compression_ratio: totalInputSize > 0 ? totalOutputSize / totalInputSize : 1,
            success: true
        });
    }

    // 跟踪处理错误
    trackProcessingError(error, context = '') {
        const processingTime = Date.now() - (this.processingStartTime || Date.now());
        
        window.analyticsEnhanced.trackEvent('tool_processing_error', {
            tool_name: this.currentTool.name,
            error_message: error.message ? error.message.substring(0, 200) : '',
            error_type: error.name || 'unknown',
            processing_time: processingTime,
            context: context.substring(0, 100)
        });
    }

    // 跟踪文件下载
    trackFileDownload(file, downloadMethod = 'direct') {
        window.analyticsEnhanced.trackEvent('tool_file_download', {
            tool_name: this.currentTool.name,
            file_type: file.type || 'unknown',
            file_size: file.size || 0,
            download_method: downloadMethod
        });
    }

    // 跟踪工具会话结束
    trackToolSessionEnd() {
        const sessionTime = Date.now() - this.toolStartTime;
        
        window.analyticsEnhanced.trackEvent('tool_session_end', {
            tool_name: this.currentTool.name,
            session_duration: sessionTime,
            files_processed: this.processingStats.filesProcessed,
            total_input_size: this.processingStats.totalInputSize,
            total_output_size: this.processingStats.totalOutputSize,
            total_conversion_time: this.processingStats.conversionTime
        });
    }

    // 生成处理ID
    generateProcessingId() {
        return `${this.currentTool.name}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    // 获取统计摘要
    getStatsSummary() {
        return {
            toolName: this.currentTool.name,
            sessionDuration: Date.now() - this.toolStartTime,
            ...this.processingStats
        };
    }
}

// 页面加载时初始化工具Analytics
document.addEventListener('DOMContentLoaded', function() {
    // 等待analyticsEnhanced加载
    setTimeout(() => {
        if (typeof window.analyticsEnhanced !== 'undefined') {
            window.toolsAnalytics = new ToolsAnalytics();
            console.log('Tools Analytics initialized for:', window.toolsAnalytics.currentTool.name);
        }
    }, 1000);
});

// 页面卸载时记录会话结束
window.addEventListener('beforeunload', function() {
    if (window.toolsAnalytics) {
        window.toolsAnalytics.trackToolSessionEnd();
    }
});

// 提供全局方法供工具页面调用
window.trackToolProcessing = {
    start: (inputFiles) => window.toolsAnalytics?.trackProcessingStart(inputFiles),
    progress: (progress, currentFile) => window.toolsAnalytics?.trackProcessingProgress(progress, currentFile),
    complete: (outputFiles, inputFiles) => window.toolsAnalytics?.trackProcessingComplete(outputFiles, inputFiles),
    error: (error, context) => window.toolsAnalytics?.trackProcessingError(error, context),
    download: (file, method) => window.toolsAnalytics?.trackFileDownload(file, method)
};