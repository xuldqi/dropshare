/**
 * FFmpeg.wasm 懒加载管理器
 * 提供按需加载 FFmpeg 的功能，支持多 CDN 故障转移
 */
class FFmpegLazyLoader {
    constructor() {
        this.ffmpeg = null;
        this.isLoaded = false;
        this.isLoading = false;
        this.loadPromise = null;
        this.loadingCallbacks = [];
        
        this.cdnSources = [
            // unpkg CDN (主要源)
            {
                name: 'unpkg',
                core: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js',
                ffmpeg: 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.7/dist/umd/ffmpeg.js'
            },
            // jsDelivr CDN (备用源1)
            {
                name: 'jsDelivr',
                core: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js',
                ffmpeg: 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.7/dist/umd/ffmpeg.js'
            },
            // esm.sh CDN (备用源2)
            {
                name: 'esm.sh',
                core: 'https://esm.sh/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js',
                ffmpeg: 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7/dist/umd/ffmpeg.js'
            }
        ];
    }

    /**
     * 获取 FFmpeg 实例，如果尚未加载则触发加载
     * @param {Object} options - 加载选项
     * @param {Function} options.onProgress - 进度回调函数
     * @param {Function} options.onStatusUpdate - 状态更新回调函数
     * @returns {Promise<FFmpeg>} FFmpeg 实例
     */
    async getFFmpeg(options = {}) {
        if (this.isLoaded && this.ffmpeg) {
            return this.ffmpeg;
        }

        if (this.isLoading) {
            // 如果正在加载，等待现有的加载完成
            return this.loadPromise;
        }

        // 开始新的加载过程
        this.isLoading = true;
        this.loadPromise = this._loadFFmpeg(options);
        
        try {
            const ffmpeg = await this.loadPromise;
            this.isLoaded = true;
            this.isLoading = false;
            return ffmpeg;
        } catch (error) {
            this.isLoading = false;
            this.loadPromise = null;
            throw error;
        }
    }

    /**
     * 检查 FFmpeg 是否已加载
     * @returns {boolean} 是否已加载
     */
    isFFmpegLoaded() {
        return this.isLoaded && this.ffmpeg !== null;
    }

    /**
     * 重置加载状态（用于错误恢复）
     */
    reset() {
        this.ffmpeg = null;
        this.isLoaded = false;
        this.isLoading = false;
        this.loadPromise = null;
    }

    /**
     * 内部加载 FFmpeg 的方法
     * @param {Object} options - 加载选项
     * @returns {Promise<FFmpeg>} FFmpeg 实例
     */
    async _loadFFmpeg(options = {}) {
        const { onProgress, onStatusUpdate } = options;

        try {
            // 步骤1：加载 FFmpeg 脚本
            onStatusUpdate?.('正在加载 FFmpeg 库...');
            await this._loadFFmpegScripts(onStatusUpdate);

            // 步骤2：初始化 FFmpeg 实例
            onStatusUpdate?.('正在初始化 FFmpeg...');
            const { FFmpeg } = FFmpegWASM;
            this.ffmpeg = new FFmpeg();

            // 设置日志和进度监听
            this.ffmpeg.on('log', ({ message }) => {
                console.log('[FFmpeg]', message);
            });

            this.ffmpeg.on('progress', ({ progress }) => {
                if (progress > 0) {
                    const percent = Math.round(progress * 100);
                    onProgress?.(percent, `转换中... ${percent}%`);
                }
            });

            // 步骤3：加载 FFmpeg 核心
            onStatusUpdate?.('正在加载 FFmpeg 核心模块...');
            await this.ffmpeg.load();

            onStatusUpdate?.('FFmpeg 加载完成！');
            console.log('✅ FFmpeg 加载完成');
            
            return this.ffmpeg;
        } catch (error) {
            console.error('❌ FFmpeg 加载失败:', error);
            onStatusUpdate?.(`FFmpeg 加载失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 加载 FFmpeg 脚本文件
     * @param {Function} onStatusUpdate - 状态更新回调
     * @returns {Promise<void>}
     */
    async _loadFFmpegScripts(onStatusUpdate) {
        for (let i = 0; i < this.cdnSources.length; i++) {
            const source = this.cdnSources[i];
            
            try {
                onStatusUpdate?.(`正在从 ${source.name} CDN 加载 FFmpeg...`);
                console.log(`尝试从 ${source.name} CDN 加载 FFmpeg...`);
                
                // 依次加载 core 和 ffmpeg 脚本
                await this._loadScript(source.core);
                await this._loadScript(source.ffmpeg);
                
                console.log(`✅ 成功从 ${source.name} CDN 加载 FFmpeg 脚本`);
                return; // 成功加载，退出循环
                
            } catch (error) {
                console.warn(`❌ ${source.name} CDN 加载失败:`, error.message);
                
                if (i === this.cdnSources.length - 1) {
                    // 所有 CDN 都失败了
                    throw new Error('所有 CDN 源都无法访问，请检查网络连接');
                }
                
                // 继续尝试下一个 CDN
                onStatusUpdate?.(`${source.name} CDN 不可用，尝试备用 CDN...`);
            }
        }
    }

    /**
     * 加载单个脚本文件
     * @param {string} url - 脚本 URL
     * @param {number} timeout - 超时时间（毫秒）
     * @returns {Promise<void>}
     */
    async _loadScript(url, timeout = 15000) {
        return new Promise((resolve, reject) => {
            // 检查脚本是否已经加载
            const existingScript = document.querySelector(`script[src="${url}"]`);
            if (existingScript) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = url;
            script.type = 'text/javascript';
            
            const timeoutId = setTimeout(() => {
                script.remove();
                reject(new Error(`加载超时: ${url}`));
            }, timeout);
            
            script.onload = () => {
                clearTimeout(timeoutId);
                resolve();
            };
            
            script.onerror = () => {
                clearTimeout(timeoutId);
                script.remove();
                reject(new Error(`加载失败: ${url}`));
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * 预加载 FFmpeg（可选的预热功能）
     * @param {Object} options - 加载选项
     * @returns {Promise<void>}
     */
    async preload(options = {}) {
        if (this.isLoaded || this.isLoading) {
            return;
        }
        
        try {
            await this.getFFmpeg(options);
            console.log('FFmpeg 预加载完成');
        } catch (error) {
            console.warn('FFmpeg 预加载失败:', error);
        }
    }

    /**
     * 获取加载状态信息
     * @returns {Object} 状态信息
     */
    getStatus() {
        return {
            isLoaded: this.isLoaded,
            isLoading: this.isLoading,
            hasInstance: this.ffmpeg !== null
        };
    }
}

// 创建全局单例实例
window.ffmpegLoader = window.ffmpegLoader || new FFmpegLazyLoader();

// 导出用于模块化使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FFmpegLazyLoader;
}