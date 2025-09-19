// FFmpeg Loading Fix - Improved version
// This replaces the problematic FFmpeg loading code in audio/video tools

// 1. Add this to the head section after other scripts
// <script src="https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js"></script>
// <script src="https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/util.js"></script>

// 2. Improved initialization function
async function initFFmpeg() {
    const statusEl = document.getElementById('engineStatus');
    if (!statusEl) return;
    
    statusEl.style.display = 'block';
    statusEl.textContent = 'Loading audio processing engine...';
    statusEl.style.background = '#fef3c7';
    statusEl.style.color = '#92400e';
    
    try {
        // Check if FFmpeg is available from CDN first
        if (typeof FFmpeg === 'undefined') {
            // Try to load from unpkg CDN
            await loadFFmpegFromCDN();
        }
        
        // Initialize FFmpeg
        const { FFmpeg } = window.FFmpeg || window.FFmpegWASM;
        const { toBlobURL } = window.FFmpegUtil;
        
        if (!FFmpeg || !toBlobURL) {
            throw new Error('FFmpeg libraries not available');
        }
        
        ffmpeg = new FFmpeg();
        
        // Set up event handlers
        ffmpeg.on('log', ({ message }) => {
            console.log('FFmpeg:', message);
        });
        
        ffmpeg.on('progress', ({ progress }) => {
            const percentage = Math.round(progress * 100);
            updateProgress(percentage);
        });
        
        // Load core files with multiple fallback strategies
        await loadFFmpegCore(statusEl, toBlobURL);
        
        isEngineLoaded = true;
        statusEl.textContent = '✓ Audio processing engine loaded successfully!';
        statusEl.style.background = '#d1fae5';
        statusEl.style.color = '#065f46';
        
        // Enable convert button
        const convertBtn = document.getElementById('convertBtn');
        if (convertBtn) {
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert Audio';
        }
        
        console.log('✅ FFmpeg loaded successfully');
        
    } catch (error) {
        console.error('❌ Failed to load FFmpeg:', error);
        handleFFmpegLoadError(statusEl, error);
    }
}

// Function to load FFmpeg from CDN if not already loaded
async function loadFFmpegFromCDN() {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (typeof FFmpeg !== 'undefined') {
            resolve();
            return;
        }
        
        let scriptsLoaded = 0;
        const totalScripts = 2;
        
        function checkComplete() {
            scriptsLoaded++;
            if (scriptsLoaded === totalScripts) {
                // Give a moment for scripts to initialize
                setTimeout(() => {
                    if (typeof FFmpeg !== 'undefined') {
                        resolve();
                    } else {
                        reject(new Error('FFmpeg scripts loaded but not available'));
                    }
                }, 100);
            }
        }
        
        // Load FFmpeg core
        const ffmpegScript = document.createElement('script');
        ffmpegScript.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js';
        ffmpegScript.onload = checkComplete;
        ffmpegScript.onerror = () => reject(new Error('Failed to load FFmpeg script'));
        document.head.appendChild(ffmpegScript);
        
        // Load FFmpeg util
        const utilScript = document.createElement('script');
        utilScript.src = 'https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/util.js';
        utilScript.onload = checkComplete;
        utilScript.onerror = () => reject(new Error('Failed to load FFmpeg util script'));
        document.head.appendChild(utilScript);
        
        // Timeout after 10 seconds
        setTimeout(() => {
            reject(new Error('FFmpeg loading timeout'));
        }, 10000);
    });
}

// Improved core loading with multiple fallback strategies
async function loadFFmpegCore(statusEl, toBlobURL) {
    // Define multiple core file sources
    const coreSources = [
        // Unpkg CDN (most reliable)
        'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
        // JSDelivr CDN (backup)
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd',
        // Local files (if available)
        `${location.origin}/vendor/ffmpeg`
    ];
    
    for (let i = 0; i < coreSources.length; i++) {
        const baseURL = coreSources[i];
        statusEl.textContent = `Loading FFmpeg core from source ${i + 1}/${coreSources.length}...`;
        
        try {
            // Try to load core files with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
            
            const coreURL = await toBlobURL(
                `${baseURL}/ffmpeg-core.js`, 
                'text/javascript',
                false, // no progress callback for now
                { signal: controller.signal }
            );
            
            const wasmURL = await toBlobURL(
                `${baseURL}/ffmpeg-core.wasm`, 
                'application/wasm',
                false,
                { signal: controller.signal }
            );
            
            clearTimeout(timeoutId);
            
            // Load FFmpeg with the core files
            await ffmpeg.load({ coreURL, wasmURL });
            
            console.log(`✅ FFmpeg core loaded from: ${baseURL}`);
            return; // Success, exit the loop
            
        } catch (error) {
            console.warn(`⚠️ Failed to load from ${baseURL}:`, error.message);
            
            if (i === coreSources.length - 1) {
                // Last attempt failed
                throw new Error(`Failed to load FFmpeg core from all sources. Last error: ${error.message}`);
            }
            
            // Try next source
            continue;
        }
    }
}

// Handle FFmpeg loading errors with user-friendly messages
function handleFFmpegLoadError(statusEl, error) {
    console.error('FFmpeg loading error details:', error);
    
    let errorMessage = '✗ Failed to load audio processing engine.';
    let suggestion = '';
    
    if (error.message.includes('timeout')) {
        suggestion = 'Please check your internet connection and try again.';
    } else if (error.message.includes('fetch')) {
        suggestion = 'Network issue detected. Please refresh the page.';
    } else if (error.message.includes('not available')) {
        suggestion = 'Browser compatibility issue. Please try a different browser.';
    } else {
        suggestion = 'Please refresh the page or try again later.';
    }
    
    statusEl.textContent = `${errorMessage} ${suggestion}`;
    statusEl.style.background = '#fee2e2';
    statusEl.style.color = '#dc2626';
    
    // Add retry button
    const retryButton = document.createElement('button');
    retryButton.textContent = 'Retry Loading';
    retryButton.style.marginLeft = '10px';
    retryButton.style.padding = '4px 8px';
    retryButton.style.background = '#dc2626';
    retryButton.style.color = 'white';
    retryButton.style.border = 'none';
    retryButton.style.borderRadius = '4px';
    retryButton.style.cursor = 'pointer';
    
    retryButton.onclick = () => {
        retryButton.remove();
        initFFmpeg();
    };
    
    statusEl.appendChild(retryButton);
}

// Usage: Replace the existing initFFmpeg function with this improved version
// Also add this to DOMContentLoaded event:
/*
document.addEventListener('DOMContentLoaded', function() {
    // Initialize FFmpeg
    initFFmpeg();
    
    // Initialize other components...
});
*/