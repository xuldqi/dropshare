/**
 * 单线程FFmpeg加载器 - 立即解决CORS问题，无需服务器重启
 */

let globalFFmpegInstance = null;
let loadingPromise = null;

function notifyProgress(message, percent = 0) {
    console.log(`FFmpeg: ${message} (${percent}%)`);
    
    const progressBar = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.textContent = message;
    
    // 更新状态显示
    const statusEl = document.getElementById('engineStatus');
    if (statusEl) {
        statusEl.textContent = message;
        if (percent === 100) {
            statusEl.classList.add('loaded');
        }
    }
}

/**
 * 单线程FFmpeg加载 - 完全避开Worker CORS问题
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
            
            notifyProgress('Creating single-thread FFmpeg instance...', 30);
            
            const { FFmpeg } = window.FFmpegWASM;
            const { toBlobURL } = window.FFmpegUtil;
            
            globalFFmpegInstance = new FFmpeg();
            
            // 设置日志监听
            globalFFmpegInstance.on('log', ({ message }) => {
                console.log('FFmpeg:', message);
            });
            
            globalFFmpegInstance.on('progress', ({ progress }) => {
                const percent = Math.round(progress * 100);
                notifyProgress(`Processing... ${percent}%`, 50 + percent * 0.4);
            });
            
            notifyProgress('Loading single-thread core...', 50);
            
            // 使用单线程核心（无Worker依赖）
            const stBaseURL = 'https://unpkg.com/@ffmpeg/core-st@0.12.6/dist/umd';
            
            try {
                const [coreURL, wasmURL] = await Promise.all([
                    toBlobURL(`${stBaseURL}/ffmpeg-core.js`, 'text/javascript'),
                    toBlobURL(`${stBaseURL}/ffmpeg-core.wasm`, 'application/wasm')
                ]);
                
                await globalFFmpegInstance.load({
                    coreURL,
                    wasmURL
                    // 不提供workerURL，强制使用单线程
                });
                
                notifyProgress('✓ FFmpeg ready (single-thread mode)!', 100);
                console.log('✅ FFmpeg loaded successfully in single-thread mode');
                
                return globalFFmpegInstance;
                
            } catch (stError) {
                console.warn('Single-thread core failed, trying alternative...', stError);
                
                // 回退到主线程模式
                notifyProgress('Trying alternative loading method...', 70);
                
                const altBaseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd';
                
                const [coreURL, wasmURL] = await Promise.all([
                    toBlobURL(`${altBaseURL}/ffmpeg-core.js`, 'text/javascript'),
                    toBlobURL(`${altBaseURL}/ffmpeg-core.wasm`, 'application/wasm')
                ]);
                
                // 强制主线程模式
                await globalFFmpegInstance.load({
                    coreURL,
                    wasmURL,
                    // 通过设置multithread: false 强制单线程
                    multithread: false
                });
                
                notifyProgress('✓ FFmpeg ready (main-thread mode)!', 100);
                console.log('✅ FFmpeg loaded in main-thread mode');
                
                return globalFFmpegInstance;
            }
            
        } catch (error) {
            console.error('❌ All loading methods failed:', error);
            notifyProgress(`Loading failed: ${error.message}`, 0);
            
            // 显示用户友好的错误信息
            const errorEl = document.getElementById('progressText') || document.getElementById('engineStatus');
            if (errorEl) {
                errorEl.innerHTML = `
                    <div style="color: #e74c3c;">
                        ❌ FFmpeg loading failed<br>
                        <small>Error: ${error.message}</small><br>
                        <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 15px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            🔄 Retry
                        </button>
                    </div>
                `;
            }
            
            globalFFmpegInstance = null;
            loadingPromise = null;
            throw error;
        }
    })();
    
    return loadingPromise;
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

// 导出到全局 - 优先使用单线程方法
window.loadFFmpeg = loadFFmpegSingleThread;
window.loadFFmpegSingleThread = loadFFmpegSingleThread;

// 向后兼容
window.initFFmpeg = loadFFmpegSingleThread;