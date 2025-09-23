/**
 * 简化但可靠的FFmpeg加载器 - 修复所有常见问题
 */

let globalFFmpegInstance = null;
let loadingPromise = null;

// 简单的进度回调
function notifyProgress(message, percent = 0) {
    console.log(`FFmpeg: ${message} (${percent}%)`);
    
    // 更新UI（如果存在进度条）
    const progressBar = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.textContent = message;
}

/**
 * 加载FFmpeg脚本（如果未加载）
 */
async function ensureFFmpegScripts() {
    // 检查是否已存在
    if (window.FFmpegWASM && window.FFmpegUtil) {
        return;
    }
    
    notifyProgress('Loading FFmpeg scripts...', 10);
    
    return new Promise((resolve, reject) => {
        let loaded = 0;
        const scripts = [
            {
                url: 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.6/dist/umd/ffmpeg.js',
                global: 'FFmpegWASM'
            },
            {
                url: 'https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js', 
                global: 'FFmpegUtil'
            }
        ];
        
        function onLoad() {
            loaded++;
            if (loaded === scripts.length) {
                // 等待脚本初始化
                setTimeout(() => {
                    if (window.FFmpegWASM && window.FFmpegUtil) {
                        resolve();
                    } else {
                        reject(new Error('Scripts loaded but globals not available'));
                    }
                }, 100);
            }
        }
        
        scripts.forEach(({ url, global }) => {
            if (window[global]) {
                onLoad();
                return;
            }
            
            const script = document.createElement('script');
            script.src = url;
            script.onload = onLoad;
            script.onerror = () => reject(new Error(`Failed to load ${url}`));
            document.head.appendChild(script);
        });
    });
}

/**
 * 主要的FFmpeg加载函数
 */
async function loadFFmpeg() {
    // 如果已经加载，直接返回
    if (globalFFmpegInstance) {
        return globalFFmpegInstance;
    }
    
    // 如果正在加载，等待完成
    if (loadingPromise) {
        return loadingPromise;
    }
    
    loadingPromise = (async () => {
        try {
            notifyProgress('Initializing FFmpeg...', 0);
            
            // 1. 确保脚本已加载
            await ensureFFmpegScripts();
            notifyProgress('Scripts loaded', 20);
            
            // 2. 创建FFmpeg实例
            const { FFmpeg } = window.FFmpegWASM;
            const { toBlobURL } = window.FFmpegUtil;
            
            globalFFmpegInstance = new FFmpeg();
            
            // 3. 设置日志和进度监听
            globalFFmpegInstance.on('log', ({ message }) => {
                console.log('FFmpeg log:', message);
            });
            
            globalFFmpegInstance.on('progress', ({ progress }) => {
                const percent = Math.round(progress * 100);
                notifyProgress(`Processing... ${percent}%`, percent);
            });
            
            notifyProgress('Loading FFmpeg core...', 40);
            
            // 4. 加载核心文件 - 使用最可靠的CDN
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            
            try {
                const [coreURL, wasmURL] = await Promise.all([
                    toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                    toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
                ]);
                
                await globalFFmpegInstance.load({
                    coreURL,
                    wasmURL
                });
                
                notifyProgress('FFmpeg ready!', 100);
                console.log('✅ FFmpeg loaded successfully');
                
            } catch (error) {
                // Fallback to JSDelivr CDN
                console.warn('Unpkg failed, trying JSDelivr...', error);
                notifyProgress('Trying backup CDN...', 50);
                
                const fallbackURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd';
                
                const [coreURL, wasmURL] = await Promise.all([
                    toBlobURL(`${fallbackURL}/ffmpeg-core.js`, 'text/javascript'),
                    toBlobURL(`${fallbackURL}/ffmpeg-core.wasm`, 'application/wasm')
                ]);
                
                await globalFFmpegInstance.load({
                    coreURL,
                    wasmURL
                });
                
                notifyProgress('FFmpeg ready!', 100);
                console.log('✅ FFmpeg loaded from fallback CDN');
            }
            
            return globalFFmpegInstance;
            
        } catch (error) {
            console.error('❌ Failed to load FFmpeg:', error);
            globalFFmpegInstance = null;
            loadingPromise = null;
            
            notifyProgress('Failed to load FFmpeg', 0);
            throw new Error(`FFmpeg load failed: ${error.message}`);
        }
    })();
    
    return loadingPromise;
}

/**
 * 检查FFmpeg是否已加载
 */
function isFFmpegLoaded() {
    return globalFFmpegInstance !== null;
}

/**
 * 获取FFmpeg实例（如果已加载）
 */
function getFFmpegInstance() {
    return globalFFmpegInstance;
}

/**
 * 清理FFmpeg实例
 */
function cleanupFFmpeg() {
    if (globalFFmpegInstance) {
        try {
            globalFFmpegInstance.terminate();
        } catch (error) {
            console.warn('FFmpeg cleanup error:', error);
        }
        globalFFmpegInstance = null;
        loadingPromise = null;
    }
}

// 导出到全局
window.loadFFmpeg = loadFFmpeg;
window.isFFmpegLoaded = isFFmpegLoaded;
window.getFFmpegInstance = getFFmpegInstance;
window.cleanupFFmpeg = cleanupFFmpeg;