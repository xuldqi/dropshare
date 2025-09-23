/**
 * 基于最佳实践的FFmpeg加载器 - 2025年有效方案
 * 参考成功的在线工具实现
 */

let ffmpegInstance = null;
let isLoading = false;

// 进度通知函数
function updateProgress(message, progress = 0) {
    console.log(`[FFmpeg] ${message} (${progress}%)`);
    
    // 更新UI元素
    const statusEl = document.getElementById('engineStatus');
    const progressBar = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (statusEl) statusEl.textContent = message;
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) progressText.textContent = message;
}

/**
 * 最简单可靠的FFmpeg加载方案
 */
async function loadFFmpegReliable() {
    if (ffmpegInstance) {
        return ffmpegInstance;
    }
    
    if (isLoading) {
        // 等待当前加载完成
        while (isLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return ffmpegInstance;
    }
    
    isLoading = true;
    
    try {
        updateProgress('Initializing FFmpeg...', 10);
        
        // 确保库已加载
        if (!window.FFmpegWASM || !window.FFmpegUtil) {
            throw new Error('FFmpeg libraries not loaded');
        }
        
        const { FFmpeg } = window.FFmpegWASM;
        const { toBlobURL } = window.FFmpegUtil;
        
        updateProgress('Creating FFmpeg instance...', 20);
        
        ffmpegInstance = new FFmpeg();
        
        // 简单的事件监听
        ffmpegInstance.on('log', ({ message }) => {
            console.log(`[FFmpeg Log] ${message}`);
        });
        
        ffmpegInstance.on('progress', ({ progress }) => {
            const percent = Math.round(progress * 100);
            updateProgress(`Processing... ${percent}%`, 50 + percent * 0.5);
        });
        
        updateProgress('Loading core files...', 30);
        
        // 使用最稳定的配置
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        
        // 预加载文件
        const coreJS = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
        const coreWASM = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
        
        updateProgress('Initializing WebAssembly...', 60);
        
        // 加载核心（不指定worker，让FFmpeg自动处理）
        await ffmpegInstance.load({
            coreURL: coreJS,
            wasmURL: coreWASM
        });
        
        updateProgress('✓ FFmpeg ready!', 100);
        console.log('✅ FFmpeg loaded successfully');
        
        // 成功后的UI更新
        const statusEl = document.getElementById('engineStatus');
        if (statusEl) {
            statusEl.textContent = '✓ Audio processing engine loaded and ready!';
            statusEl.classList.add('loaded');
            statusEl.style.color = '#28a745';
        }
        
        return ffmpegInstance;
        
    } catch (error) {
        console.error('❌ FFmpeg loading failed:', error);
        
        // 重置状态
        ffmpegInstance = null;
        
        // 显示错误
        updateProgress(`Failed: ${error.message}`, 0);
        
        const statusEl = document.getElementById('engineStatus');
        if (statusEl) {
            statusEl.innerHTML = `
                <div style="color: #dc3545;">
                    ❌ Failed to load processing engine<br>
                    <small style="color: #6c757d;">Error: ${error.message}</small><br>
                    <button onclick="location.reload()" style="
                        margin-top: 8px; 
                        padding: 4px 12px; 
                        background: #007bff; 
                        color: white; 
                        border: none; 
                        border-radius: 4px; 
                        cursor: pointer;
                        font-size: 12px;
                    ">🔄 Reload Page</button>
                </div>
            `;
        }
        
        throw error;
        
    } finally {
        isLoading = false;
    }
}

/**
 * 获取FFmpeg实例
 */
function getFFmpegInstance() {
    return ffmpegInstance;
}

/**
 * 检查是否已加载
 */
function isFFmpegLoaded() {
    return ffmpegInstance !== null;
}

/**
 * 清理FFmpeg实例
 */
function terminateFFmpeg() {
    if (ffmpegInstance) {
        try {
            ffmpegInstance.terminate();
        } catch (error) {
            console.warn('FFmpeg termination error:', error);
        }
        ffmpegInstance = null;
    }
}

// 导出到全局作用域
window.loadFFmpeg = loadFFmpegReliable;
window.loadFFmpegReliable = loadFFmpegReliable;
window.getFFmpegInstance = getFFmpegInstance;
window.isFFmpegLoaded = isFFmpegLoaded;
window.terminateFFmpeg = terminateFFmpeg;

// 向后兼容
window.initFFmpeg = loadFFmpegReliable;