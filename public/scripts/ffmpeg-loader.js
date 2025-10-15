// Unified FFmpeg loader: local-first, proxy, then CDN
(function(){
  function loadScript(src){
    return new Promise((resolve, reject)=>{
      var s = document.createElement('script');
      s.src = src; s.async = true; s.onload = ()=>resolve(); s.onerror = (e)=>reject(new Error('Failed to load '+src));
      document.head.appendChild(s);
    });
  }

  async function ensureScripts(){
    if (typeof window.FFmpegWASM !== 'undefined' && typeof window.FFmpegUtil !== 'undefined') return;

    // Try local vendor first
    try {
      if (typeof window.FFmpegWASM === 'undefined') await loadScript('/vendor/ffmpeg/ffmpeg.js');
      if (typeof window.FFmpegUtil === 'undefined') await loadScript('/vendor/ffmpeg/util.js');
    } catch (e) {
      // ignore, fallback to CDN below
    }

    if (typeof window.FFmpegWASM !== 'undefined' && typeof window.FFmpegUtil !== 'undefined') return;

    // Fallback to CDN
    const cdnScripts = [
      'https://unpkg.com/@ffmpeg/ffmpeg@0.12.6/dist/umd/ffmpeg.js',
      'https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js'
    ];
    for (const url of cdnScripts) {
      if ((url.includes('/ffmpeg.js') && typeof window.FFmpegWASM !== 'undefined') ||
          (url.includes('/index.js') && typeof window.FFmpegUtil !== 'undefined')) continue;
      try { await loadScript(url); } catch (_) {}
    }

    if (typeof window.FFmpegWASM === 'undefined' || typeof window.FFmpegUtil === 'undefined') {
      throw new Error('FFmpeg scripts unavailable');
    }
  }

  function globals(){
    const lib = window.FFmpegWASM || window.FFmpeg || {};
    const FFmpeg = lib.FFmpeg;
    const util = window.FFmpegUtil || {};
    const toBlobURL = util.toBlobURL;
    if (!FFmpeg || !toBlobURL) throw new Error('FFmpeg libraries not available');
    return { FFmpeg, toBlobURL };
  }

  async function loadCore(ffmpeg){
    const { toBlobURL } = globals();
    const bases = [
      // Local mirror (fastest, no CORS)
      location.origin + '/vendor/ffmpeg',
      // Server proxy to avoid CDN blocks
      location.origin + '/ffmpeg-proxy/unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
      // Direct CDN
      'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
      // Another proxy and CDN
      location.origin + '/ffmpeg-proxy/cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd',
      'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd'
    ];
    let lastErr;
    for (const base of bases) {
      try {
        const coreURL = await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript');
        const wasmURL = await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm');
        await ffmpeg.load({ coreURL, wasmURL });
        lastErr = null;
        break;
      } catch (e) {
        lastErr = e;
      }
    }
    if (lastErr) throw lastErr;
  }

  async function loadReady(){
    await ensureScripts();
    const { FFmpeg } = globals();
    const ff = new FFmpeg();
    await loadCore(ff);
    return ff;
  }

  window.FFLoader = { ensureScripts, loadCore, loadReady, globals };
})();

