/**
 * Enhanced FFmpeg.wasm Loader - 2025 Optimized Version
 * Solves common loading issues with multiple fallback strategies
 */
class FFmpegLoader {
    constructor() {
        this.ffmpegInstance = null;
        this.isLoading = false;
        this.loadPromise = null;
        this.listeners = new Set();
        
        // CDN sources with fallbacks
        this.cdnSources = [
            'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
            'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd',
            'https://fastly.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd'
        ];
        
        this.timeouts = {
            scriptLoad: 15000,  // 15秒脚本加载超时
            coreLoad: 30000,    // 30秒核心加载超时
            wasmLoad: 45000     // 45秒WASM加载超时
        };
    }
    
    /**
     * 懒加载FFmpeg实例
     */
    async load() {
        if (this.ffmpegInstance) {
            return this.ffmpegInstance;
        }
        
        if (this.isLoading) {
            return this.loadPromise;
        }
        
        this.isLoading = true;
        this.loadPromise = this._loadFFmpeg();
        
        try {
            await this.loadPromise;
            return this.ffmpegInstance;
        } finally {
            this.isLoading = false;
        }
    }
    
    /**
     * 内部加载逻辑
     */
    async _loadFFmpeg() {
        try {
            this._notifyProgress('Initializing FFmpeg...', 0);
            
            // 1. 确保FFmpeg脚本已加载
            await this._ensureScriptsLoaded();
            this._notifyProgress('Scripts loaded', 20);
            
            // 2. 创建FFmpeg实例
            const { FFmpeg } = window.FFmpegWASM || window.FFmpeg;
            const { toBlobURL } = window.FFmpegUtil;
            
            if (!FFmpeg || !toBlobURL) {
                throw new Error('FFmpeg libraries not found');
            }
            
            this.ffmpegInstance = new FFmpeg();
            this._setupEventListeners();
            this._notifyProgress('Instance created', 40);
            
            // 3. 加载核心文件
            await this._loadCoreFiles(toBlobURL);
            this._notifyProgress('FFmpeg ready', 100);
            
            console.log('✅ FFmpeg loaded successfully');
            return this.ffmpegInstance;
            
        } catch (error) {
            console.error('❌ FFmpeg load failed:', error);
            this.ffmpegInstance = null;
            throw new Error(`FFmpeg initialization failed: ${error.message}`);
        }
    }
    
    /**
     * 确保脚本已加载
     */
    async _ensureScriptsLoaded() {
        if (typeof window.FFmpegWASM !== 'undefined' && typeof window.FFmpegUtil !== 'undefined') {
            return;
        }
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Script loading timeout'));
            }, this.timeouts.scriptLoad);
            
            let scriptsLoaded = 0;
            const totalScripts = 2;
            
            const checkComplete = () => {
                scriptsLoaded++;
                if (scriptsLoaded === totalScripts) {
                    clearTimeout(timeout);
                    
                    // 给脚本初始化一点时间
                    setTimeout(() => {
                        if (typeof window.FFmpegWASM !== 'undefined' && typeof window.FFmpegUtil !== 'undefined') {
                            resolve();
                        } else {
                            reject(new Error('Scripts loaded but libraries not available'));
                        }
                    }, 500);
                }
            };
            
            // 动态加载FFmpeg脚本
            if (typeof window.FFmpegWASM === 'undefined') {
                const ffmpegScript = document.createElement('script');
                ffmpegScript.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.6/dist/umd/ffmpeg.js';
                ffmpegScript.onload = checkComplete;
                ffmpegScript.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error('Failed to load FFmpeg script'));
                };
                document.head.appendChild(ffmpegScript);
            } else {
                checkComplete();
            }
            
            // 动态加载Util脚本
            if (typeof window.FFmpegUtil === 'undefined') {
                const utilScript = document.createElement('script');
                utilScript.src = 'https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js';
                utilScript.onload = checkComplete;
                utilScript.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error('Failed to load FFmpeg util script'));
                };
                document.head.appendChild(utilScript);
            } else {
                checkComplete();
            }
        });
    }
    
    /**
     * 加载核心文件（支持多CDN fallback）
     */
    async _loadCoreFiles(toBlobURL) {
        const errors = [];
        
        for (let i = 0; i < this.cdnSources.length; i++) {
            const baseURL = this.cdnSources[i];
            
            try {
                this._notifyProgress(`Loading from CDN ${i + 1}/${this.cdnSources.length}...`, 60 + (i * 10));
                
                // 创建AbortController用于超时控制
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeouts.coreLoad);
                
                const [coreURL, wasmURL] = await Promise.all([
                    this._loadWithTimeout(
                        toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                        controller.signal
                    ),
                    this._loadWithTimeout(
                        toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
                        controller.signal
                    )
                ]);
                
                clearTimeout(timeoutId);
                
                // 尝试加载FFmpeg核心
                await this.ffmpegInstance.load({
                    coreURL,
                    wasmURL,
                    workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
                });
                
                console.log(`✅ FFmpeg core loaded from: ${baseURL}`);
                return; // 成功，退出循环
                
            } catch (error) {
                const errorMsg = `CDN ${i + 1} failed: ${error.message}`;
                console.warn(`⚠️ ${errorMsg}`);
                errors.push(errorMsg);
                
                if (i === this.cdnSources.length - 1) {
                    throw new Error(`All CDN sources failed:\n${errors.join('\n')}`);
                }
            }
        }
    }
    
    /**
     * 带超时的Promise包装器
     */
    async _loadWithTimeout(promise, signal) {
        return new Promise((resolve, reject) => {
            if (signal.aborted) {
                reject(new Error('Request aborted'));
                return;
            }
            
            signal.addEventListener('abort', () => {
                reject(new Error('Request timeout'));
            });
            
            promise.then(resolve).catch(reject);
        });
    }
    
    /**
     * 设置事件监听器
     */
    _setupEventListeners() {
        this.ffmpegInstance.on('log', ({ message }) => {
            console.log('FFmpeg:', message);
        });
        
        this.ffmpegInstance.on('progress', ({ progress }) => {
            const percent = Math.round(progress * 100);
            this._notifyProgress(`Processing... ${percent}%`, percent);
        });
    }
    
    /**
     * 通知进度更新
     */
    _notifyProgress(message, progress) {
        this.listeners.forEach(callback => {
            try {
                callback({ message, progress });
            } catch (error) {
                console.warn('Progress callback error:', error);
            }
        });
    }
    
    /**
     * 添加进度监听器
     */
    onProgress(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
    
    /**
     * 获取FFmpeg实例（如果已加载）
     */
    getInstance() {
        return this.ffmpegInstance;
    }
    
    /**
     * 检查是否已加载
     */
    isLoaded() {
        return this.ffmpegInstance !== null;
    }
    
    /**
     * 清理资源
     */
    cleanup() {
        if (this.ffmpegInstance) {
            this.ffmpegInstance.terminate();
            this.ffmpegInstance = null;
        }
        this.listeners.clear();
    }
}

// 创建全局实例
window.ffmpegLoader = new FFmpegLoader();

// 向后兼容的全局函数
window.loadFFmpeg = () => window.ffmpegLoader.load();