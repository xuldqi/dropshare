/**
 * ColleTools-based FFmpeg Loader
 * Based on the working implementation from colletools.com
 */

let ffmpegInstance = null;
let loadingPromise = null;
let isLoading = false;

function updateProgress(message, progress = 0) {
    console.log(`[FFmpeg ColleTools] ${message} (${progress}%)`);
    
    // Update UI elements
    const statusEl = document.getElementById('engineStatus');
    const progressBar = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (statusEl) statusEl.textContent = message;
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) progressText.textContent = message;
}

/**
 * Check if FFmpeg is already loaded
 */
function isFFmpegLoaded() {
    console.log('[FFmpeg Check] Checking FFmpeg availability...');
    console.log('[FFmpeg Check] window.FFmpegWASM:', typeof window.FFmpegWASM);
    
    const isAvailable = typeof window.FFmpegWASM !== 'undefined' && window.FFmpegWASM;
    
    if (isAvailable) {
        console.log('[FFmpeg Check] ✅ FFmpeg found at window.FFmpegWASM');
        console.log('[FFmpeg Check] FFmpegWASM keys:', Object.keys(window.FFmpegWASM));
    } else {
        console.log('[FFmpeg Check] ❌ FFmpegWASM not found or not ready');
    }
    
    return isAvailable;
}

/**
 * Load FFmpeg using ColleTools method
 */
async function loadFFmpegColleTools() {
    console.log('[FFmpeg ColleTools] Starting to load FFmpeg...');
    
    if (ffmpegInstance) {
        console.log('[FFmpeg ColleTools] FFmpeg already initialized');
        return ffmpegInstance;
    }
    
    if (loadingPromise) {
        console.log('[FFmpeg ColleTools] FFmpeg already loading, waiting...');
        return loadingPromise;
    }
    
    loadingPromise = (async () => {
        try {
            updateProgress('正在加载FFmpeg 视频处理引擎...', 10);
            
            // Load FFmpeg script if not already loaded
            if (!isFFmpegLoaded()) {
                updateProgress('正在下载FFmpeg脚本...', 30);
                await loadFFmpegScript();
                
                updateProgress('正在初始化FFmpeg...', 70);
                // Give FFmpeg extra time to initialize (1000ms like ColleTools)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                if (!isFFmpegLoaded()) {
                    throw new Error('FFmpeg script loaded but not available');
                }
            }
            
            updateProgress('正在创建FFmpeg实例...', 80);
            
            const { FFmpeg } = window.FFmpegWASM;
            ffmpegInstance = new FFmpeg();
            
            // Set up event listeners
            ffmpegInstance.on('log', ({ message }) => {
                console.log('[FFmpeg Log]', message);
            });
            
            ffmpegInstance.on('progress', ({ progress }) => {
                const percent = Math.round(progress * 100);
                updateProgress(`处理中... ${percent}%`, 85 + percent * 0.15);
            });
            
            updateProgress('正在加载FFmpeg核心...', 90);
            
            // Load FFmpeg core - using the exact same version as ColleTools
            const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.7/dist/umd';
            const { toBlobURL } = window.FFmpegUtil || await loadFFmpegUtil();
            
            const [coreURL, wasmURL] = await Promise.all([
                toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
            ]);
            
            await ffmpegInstance.load({
                coreURL,
                wasmURL
            });
            
            updateProgress('✅ FFmpeg 视频处理引擎加载完成!', 100);
            console.log('✅ FFmpeg loaded successfully using ColleTools method');
            
            // Update UI to show success
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
 * Load FFmpeg script from CDN (ColleTools URL)
 */
async function loadFFmpegScript() {
    return new Promise((resolve, reject) => {
        if (isFFmpegLoaded()) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.7/dist/umd/ffmpeg.js';
        script.async = true;
        
        script.onload = () => {
            console.log('[FFmpeg Script] FFmpeg script loaded');
            // Wait a bit for initialization
            setTimeout(() => {
                if (isFFmpegLoaded()) {
                    resolve();
                } else {
                    console.error('[FFmpeg Script] Script loaded but FFmpegWASM not available');
                    console.error('[FFmpeg Script] Available window properties:', 
                        Object.keys(window).filter(k => k.includes('FF')));
                    reject(new Error('FFmpeg script loaded but not available'));
                }
            }, 100);
        };
        
        script.onerror = () => {
            reject(new Error('Failed to load FFmpeg script'));
        };
        
        document.head.appendChild(script);
    });
}

/**
 * Load FFmpeg util if needed
 */
async function loadFFmpegUtil() {
    if (window.FFmpegUtil) {
        return window.FFmpegUtil;
    }
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/umd/index.js';
        script.async = true;
        
        script.onload = () => {
            setTimeout(() => {
                if (window.FFmpegUtil) {
                    resolve(window.FFmpegUtil);
                } else {
                    reject(new Error('FFmpeg util loaded but not available'));
                }
            }, 100);
        };
        
        script.onerror = () => {
            reject(new Error('Failed to load FFmpeg util'));
        };
        
        document.head.appendChild(script);
    });
}

/**
 * Get FFmpeg instance
 */
function getFFmpegInstance() {
    return ffmpegInstance;
}

/**
 * Terminate FFmpeg instance
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

// Export to global scope
window.loadFFmpeg = loadFFmpegColleTools;
window.loadFFmpegColleTools = loadFFmpegColleTools;
window.getFFmpegInstance = getFFmpegInstance;
window.isFFmpegLoaded = isFFmpegLoaded;
window.terminateFFmpeg = terminateFFmpeg;

// Backward compatibility
window.initFFmpeg = loadFFmpegColleTools;