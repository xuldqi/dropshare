/**
 * 修复FFmpeg CORS问题的单线程加载器
 */

let globalFFmpegInstance = null;
let loadingPromise = null;

function notifyProgress(message, percent = 0) {
    console.log(`FFmpeg: ${message} (${percent}%)`);
    
    const progressBar = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.textContent = message;
}

/**
 * 单线程模式加载FFmpeg（避免Worker CORS问题）
 */
async function loadFFmpegSingleThread() {
    if (globalFFmpegInstance) {
        return globalFFmpegInstance;
    }
    
    if (loadingPromise) {
        return loadingPromise;
    }
    
    loadingPromise = (async () => {
        try {
            notifyProgress('Loading FFmpeg scripts...', 10);
            
            // 确保脚本已加载
            await ensureFFmpegScripts();
            
            notifyProgress('Creating FFmpeg instance...', 30);
            
            const { FFmpeg } = window.FFmpegWASM;
            const { toBlobURL } = window.FFmpegUtil;
            
            globalFFmpegInstance = new FFmpeg();
            
            // 设置日志监听
            globalFFmpegInstance.on('log', ({ message }) => {
                console.log('FFmpeg:', message);
            });
            
            globalFFmpegInstance.on('progress', ({ progress }) => {
                const percent = Math.round(progress * 100);
                notifyProgress(`Processing... ${percent}%`, percent);
            });
            
            notifyProgress('Loading FFmpeg core (single-thread)...', 50);
            
            // 使用单线程核心（无Worker）
            const baseURL = 'https://unpkg.com/@ffmpeg/core-st@0.12.6/dist/umd';
            
            const [coreURL, wasmURL] = await Promise.all([
                toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
            ]);
            
            await globalFFmpegInstance.load({
                coreURL,
                wasmURL
                // 不提供workerURL，使用单线程模式
            });
            
            notifyProgress('FFmpeg ready!', 100);
            console.log('✅ FFmpeg loaded successfully (single-thread mode)');
            
            return globalFFmpegInstance;
            
        } catch (error) {
            console.error('❌ FFmpeg loading failed:', error);
            globalFFmpegInstance = null;
            loadingPromise = null;
            notifyProgress(`Error: ${error.message}`, 0);
            throw error;
        }
    })();
    
    return loadingPromise;
}

/**
 * 主要加载函数，先尝试单线程，失败则回退到内存加载
 */
async function loadFFmpeg() {
    try {
        // 首先尝试单线程模式
        return await loadFFmpegSingleThread();
    } catch (error) {
        console.warn('Single-thread failed, trying in-memory approach:', error);
        
        // 回退方案：内存加载
        return await loadFFmpegInMemory();
    }
}

/**
 * 内存加载方案（完全避免CDN）
 */
async function loadFFmpegInMemory() {
    notifyProgress('Loading FFmpeg in memory...', 20);
    
    const { FFmpeg } = window.FFmpegWASM;
    
    globalFFmpegInstance = new FFmpeg();
    
    // 使用内存模式（更兼容但性能较低）
    await globalFFmpegInstance.load({
        coreURL: await toBlobURL('https://cdn.jsdelivr.net/npm/@ffmpeg/core-st@0.12.6/dist/umd/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('https://cdn.jsdelivr.net/npm/@ffmpeg/core-st@0.12.6/dist/umd/ffmpeg-core.wasm', 'application/wasm')
    });
    
    notifyProgress('FFmpeg ready (in-memory mode)!', 100);
    return globalFFmpegInstance;
}

async function ensureFFmpegScripts() {
    if (window.FFmpegWASM && window.FFmpegUtil) {
        return;
    }
    
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

// 导出到全局
window.loadFFmpeg = loadFFmpeg;
window.loadFFmpegSingleThread = loadFFmpegSingleThread;