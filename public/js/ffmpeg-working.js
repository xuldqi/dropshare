/**
 * 真正工作的单线程FFmpeg加载器
 * 专门解决CORS Worker问题
 */

let ffmpegInstance = null;
let loadingPromise = null;

function updateProgress(message, progress = 0) {
    console.log(`[FFmpeg SingleThread] ${message} (${progress}%)`);
    
    const statusEl = document.getElementById('engineStatus');
    const progressBar = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (statusEl) statusEl.textContent = message;
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) progressText.textContent = message;
}

/**
 * 单线程FFmpeg加载器 - 完全避开Worker CORS问题
 */
async function loadFFmpegColleTools() {
    console.log('[FFmpeg SingleThread] Starting single-thread loading...');
    
    if (ffmpegInstance) {
        console.log('[FFmpeg SingleThread] FFmpeg already initialized');
        return ffmpegInstance;
    }
    
    if (loadingPromise) {
        console.log('[FFmpeg SingleThread] Already loading, waiting...');
        return loadingPromise;
    }
    
    loadingPromise = (async () => {
        try {
            updateProgress('正在加载FFmpeg脚本...', 10);
            
            // 1. 加载FFmpeg主脚本
            await loadScript('https://unpkg.com/@ffmpeg/ffmpeg@0.12.6/dist/umd/ffmpeg.js');
            updateProgress('FFmpeg脚本加载完成', 30);
            
            // 2. 加载Util脚本
            await loadScript('https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js');
            updateProgress('FFmpeg工具库加载完成', 50);
            
            // 3. 等待脚本初始化
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (!window.FFmpegWASM || !window.FFmpegUtil) {
                throw new Error('FFmpeg scripts loaded but globals not available');
            }
            
            updateProgress('正在创建FFmpeg实例...', 60);
            
            const { FFmpeg } = window.FFmpegWASM;
            const { toBlobURL } = window.FFmpegUtil;
            
            ffmpegInstance = new FFmpeg();
            
            // 设置事件监听
            ffmpegInstance.on('log', ({ message }) => {
                console.log('[FFmpeg Log]', message);
            });
            
            ffmpegInstance.on('progress', ({ progress }) => {
                const percent = Math.round(progress * 100);
                updateProgress(`处理中... ${percent}%`, 70 + percent * 0.25);
            });
            
            updateProgress('正在加载单线程核心...', 70);
            
            // 使用单线程核心，完全避开Worker
            try {
                // 先尝试单线程专用核心
                const stBaseURL = 'https://unpkg.com/@ffmpeg/core-st@0.12.6/dist/umd';
                
                const [coreURL, wasmURL] = await Promise.all([
                    toBlobURL(`${stBaseURL}/ffmpeg-core.js`, 'text/javascript'),
                    toBlobURL(`${stBaseURL}/ffmpeg-core.wasm`, 'application/wasm')
                ]);
                
                updateProgress('正在初始化单线程FFmpeg...', 85);
                
                await ffmpegInstance.load({
                    coreURL,
                    wasmURL
                    // 不提供workerURL，强制单线程模式
                });
                
                updateProgress('✅ FFmpeg单线程模式加载成功!', 100);
                console.log('✅ FFmpeg loaded successfully in single-thread mode');
                
            } catch (stError) {
                console.warn('Single-thread core failed, trying main thread mode:', stError);
                updateProgress('正在尝试主线程模式...', 75);
                
                // 回退到主线程模式
                const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
                
                const [coreURL, wasmURL] = await Promise.all([
                    toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                    toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
                ]);
                
                updateProgress('正在初始化主线程FFmpeg...', 90);
                
                await ffmpegInstance.load({
                    coreURL,
                    wasmURL,
                    multithread: false  // 强制单线程
                });
                
                updateProgress('✅ FFmpeg主线程模式加载成功!', 100);
                console.log('✅ FFmpeg loaded in main-thread mode');
            }
            
            // 更新UI显示成功
            const statusEl = document.getElementById('engineStatus');
            if (statusEl) {
                statusEl.textContent = '✓ Audio processing engine loaded and ready!';
                statusEl.classList.add('loaded');
                statusEl.style.color = '#28a745';
            }
            
            return ffmpegInstance;
            
        } catch (error) {
            console.error('❌ FFmpeg loading failed:', error);
            updateProgress(`加载失败: ${error.message}`, 0);
            
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
            
            ffmpegInstance = null;
            loadingPromise = null;
            throw error;
        }
    })();
    
    return loadingPromise;
}

/**
 * 加载脚本工具函数
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // 检查是否已经加载
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        
        script.onload = () => {
            console.log(`[Script Loader] Loaded: ${src}`);
            resolve();
        };
        
        script.onerror = () => {
            console.error(`[Script Loader] Failed: ${src}`);
            reject(new Error(`Failed to load script: ${src}`));
        };
        
        document.head.appendChild(script);
    });
}

/**
 * 检查FFmpeg是否已加载
 */
function isFFmpegLoaded() {
    return ffmpegInstance !== null;
}

/**
 * 获取FFmpeg实例
 */
function getFFmpegInstance() {
    return ffmpegInstance;
}

/**
 * 终止FFmpeg
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
    loadingPromise = null;
}

// 导出到全局
window.loadFFmpeg = loadFFmpegColleTools;
window.loadFFmpegColleTools = loadFFmpegColleTools;
window.getFFmpegInstance = getFFmpegInstance;
window.isFFmpegLoaded = isFFmpegLoaded;
window.terminateFFmpeg = terminateFFmpeg;

// 向后兼容
window.initFFmpeg = loadFFmpegColleTools;