/**
 * FFmpeg诊断和修复工具
 */

// 诊断函数
async function diagnoseFFmpegIssues() {
    const results = {
        network: false,
        cors: false,
        scripts: false,
        wasm: false,
        errors: []
    };
    
    console.log('🔍 Diagnosing FFmpeg loading issues...');
    
    // 1. 检查网络连接
    try {
        const response = await fetch('https://unpkg.com/@ffmpeg/ffmpeg@0.12.6/package.json', {
            method: 'HEAD',
            mode: 'cors'
        });
        results.network = response.ok;
        console.log('✅ Network access to unpkg.com:', results.network);
    } catch (error) {
        results.errors.push(`Network: ${error.message}`);
        console.log('❌ Network issue:', error.message);
    }
    
    // 2. 检查CORS
    try {
        const testURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js';
        const response = await fetch(testURL, {
            method: 'HEAD',
            mode: 'cors'
        });
        results.cors = response.ok;
        console.log('✅ CORS access:', results.cors);
    } catch (error) {
        results.errors.push(`CORS: ${error.message}`);
        console.log('❌ CORS issue:', error.message);
    }
    
    // 3. 检查脚本加载
    results.scripts = !!(window.FFmpegWASM && window.FFmpegUtil);
    console.log('✅ Scripts loaded:', results.scripts);
    
    // 4. 检查WebAssembly支持
    results.wasm = typeof WebAssembly !== 'undefined';
    console.log('✅ WebAssembly support:', results.wasm);
    
    return results;
}

// 本地fallback方案
function createLocalFFmpegFallback() {
    console.log('🔧 Creating local FFmpeg fallback...');
    
    // 创建简化的音频处理器（无需FFmpeg）
    return {
        isLoaded: () => true,
        writeFile: async (name, data) => {
            console.log(`Mock: Writing file ${name}`);
        },
        readFile: async (name) => {
            console.log(`Mock: Reading file ${name}`);
            return new Uint8Array(0);
        },
        exec: async (args) => {
            console.log(`Mock: Executing FFmpeg with args:`, args);
            // 模拟处理延迟
            await new Promise(resolve => setTimeout(resolve, 2000));
            return 0;
        },
        on: (event, callback) => {
            console.log(`Mock: Listening to ${event}`);
        }
    };
}

/**
 * 增强版FFmpeg加载器，包含完整的错误处理和fallback
 */
async function loadFFmpegRobust() {
    const progressCallback = (msg, percent) => {
        console.log(`📊 ${msg} (${percent}%)`);
        const progressBar = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.textContent = msg;
    };
    
    try {
        progressCallback('Starting FFmpeg initialization...', 0);
        
        // 诊断问题
        const diagnosis = await diagnoseFFmpegIssues();
        
        if (!diagnosis.network) {
            throw new Error('Network connectivity issue - cannot access CDN');
        }
        
        if (!diagnosis.wasm) {
            throw new Error('WebAssembly not supported in this browser');
        }
        
        progressCallback('Loading FFmpeg scripts...', 20);
        
        // 动态加载脚本（如果需要）
        if (!window.FFmpegWASM) {
            await loadScript('https://unpkg.com/@ffmpeg/ffmpeg@0.12.6/dist/umd/ffmpeg.js');
        }
        
        if (!window.FFmpegUtil) {
            await loadScript('https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js');
        }
        
        progressCallback('Scripts loaded, initializing...', 50);
        
        // 等待全局变量可用
        await waitForGlobals(['FFmpegWASM', 'FFmpegUtil'], 5000);
        
        const { FFmpeg } = window.FFmpegWASM;
        const { toBlobURL } = window.FFmpegUtil;
        
        const ffmpeg = new FFmpeg();
        
        progressCallback('Loading FFmpeg core...', 70);
        
        // 尝试多个CDN源
        const cdnSources = [
            'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
            'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd'
        ];
        
        let loadSuccess = false;
        
        for (const baseURL of cdnSources) {
            try {
                console.log(`🔄 Trying CDN: ${baseURL}`);
                
                const [coreURL, wasmURL] = await Promise.all([
                    toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                    toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
                ]);
                
                await Promise.race([
                    ffmpeg.load({ coreURL, wasmURL }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Load timeout')), 30000)
                    )
                ]);
                
                loadSuccess = true;
                console.log(`✅ Successfully loaded from: ${baseURL}`);
                break;
                
            } catch (error) {
                console.warn(`⚠️ Failed to load from ${baseURL}:`, error.message);
            }
        }
        
        if (!loadSuccess) {
            throw new Error('Failed to load FFmpeg from all CDN sources');
        }
        
        progressCallback('FFmpeg ready!', 100);
        
        // 设置事件监听
        ffmpeg.on('progress', ({ progress }) => {
            progressCallback(`Processing... ${Math.round(progress * 100)}%`, Math.round(progress * 100));
        });
        
        return ffmpeg;
        
    } catch (error) {
        console.error('❌ FFmpeg loading failed:', error);
        progressCallback(`Error: ${error.message}`, 0);
        
        // 显示友好的错误信息
        const errorMsg = document.getElementById('progressText');
        if (errorMsg) {
            errorMsg.innerHTML = `
                <div style="color: #e74c3c;">
                    ❌ Failed to load audio processing engine<br>
                    <small>Error: ${error.message}</small><br>
                    <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 15px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        🔄 Retry
                    </button>
                </div>
            `;
        }
        
        throw error;
    }
}

// 辅助函数：加载脚本
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}

// 辅助函数：等待全局变量
function waitForGlobals(globals, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        function check() {
            const allAvailable = globals.every(name => typeof window[name] !== 'undefined');
            
            if (allAvailable) {
                resolve();
            } else if (Date.now() - startTime > timeout) {
                reject(new Error(`Timeout waiting for globals: ${globals.join(', ')}`));
            } else {
                setTimeout(check, 100);
            }
        }
        
        check();
    });
}

// 替换全局loadFFmpeg函数
window.loadFFmpeg = loadFFmpegRobust;
window.diagnoseFFmpegIssues = diagnoseFFmpegIssues;