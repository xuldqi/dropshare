/**
 * 使用本地代理解决CORS问题的FFmpeg加载器
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
 * 主要的FFmpeg加载函数 - 使用本地代理
 */
async function loadFFmpeg() {
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
            
            notifyProgress('Loading FFmpeg core via proxy...', 50);
            
            // 使用本地代理加载核心文件
            const proxyBaseURL = '/ffmpeg-proxy/unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            
            const [coreURL, wasmURL] = await Promise.all([
                toBlobURL(`${proxyBaseURL}/ffmpeg-core.js`, 'text/javascript'),
                toBlobURL(`${proxyBaseURL}/ffmpeg-core.wasm`, 'application/wasm')
            ]);
            
            await globalFFmpegInstance.load({
                coreURL,
                wasmURL
            });
            
            notifyProgress('FFmpeg ready!', 100);
            console.log('✅ FFmpeg loaded successfully via proxy');
            
            return globalFFmpegInstance;
            
        } catch (error) {
            console.error('❌ Proxy loading failed, trying single-thread:', error);
            
            // 回退到单线程模式
            return await loadFFmpegSingleThread();
        }
    })();
    
    return loadingPromise;
}

/**
 * 单线程模式（回退方案）
 */
async function loadFFmpegSingleThread() {
    try {
        notifyProgress('Loading FFmpeg (single-thread mode)...', 60);
        
        const { FFmpeg } = window.FFmpegWASM;
        const { toBlobURL } = window.FFmpegUtil;
        
        if (globalFFmpegInstance) {
            globalFFmpegInstance.terminate();
        }
        
        globalFFmpegInstance = new FFmpeg();
        
        // 使用单线程核心
        const stBaseURL = 'https://unpkg.com/@ffmpeg/core-st@0.12.6/dist/umd';
        
        const [coreURL, wasmURL] = await Promise.all([
            toBlobURL(`${stBaseURL}/ffmpeg-core.js`, 'text/javascript'),
            toBlobURL(`${stBaseURL}/ffmpeg-core.wasm`, 'application/wasm')
        ]);
        
        await globalFFmpegInstance.load({
            coreURL,
            wasmURL
        });
        
        notifyProgress('FFmpeg ready (single-thread)!', 100);
        console.log('✅ FFmpeg loaded in single-thread mode');
        
        return globalFFmpegInstance;
        
    } catch (error) {
        console.error('❌ All loading methods failed:', error);
        notifyProgress(`Loading failed: ${error.message}`, 0);
        
        // 显示用户友好的错误信息
        const errorEl = document.getElementById('progressText');
        if (errorEl) {
            errorEl.innerHTML = `
                <div style="color: #e74c3c;">
                    ❌ FFmpeg loading failed<br>
                    <small>Please refresh the page and try again</small><br>
                    <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 15px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        🔄 Refresh Page
                    </button>
                </div>
            `;
        }
        
        throw error;
    }
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