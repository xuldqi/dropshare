const fs = require('fs');
const path = require('path');

// 统一的header HTML模板
const headerTemplate = `    <!-- Unified Header -->
    <header class="header">
        <div class="header-container">
            <div class="header-controls">
                <div class="brand-left">
                    <button class="hamburger" id="hamburgerBtn" aria-label="Open Menu"><span></span></button>
                    <div class="logo">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 2c0-3.31-2.69-6-6-6s-6 2.69-6 6c0 2.22 1.21 4.15 3 5.19l1-1.74c-1.19-.7-2-1.97-2-3.45 0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.48-.81 2.75-2 3.45l1 1.74c1.79-1.04 3-2.97 3-5.19zM12 3C6.48 3 2 7.48 2 13c0 3.7 2.01 6.92 4.99 8.65l1-1.73C5.61 18.53 4 15.96 4 13c0-4.42 3.58-8 8-8s8 3.58 8 8c0 2.96-1.61 5.53-4 6.92l1 1.73c2.99-1.73 5-4.95 5-8.65 0-5.52-4.48-10-10-10z"/>
                        </svg>
                        <a href="index.html" style="text-decoration: none; color: inherit;" data-i18n="site_name">DropShare</a>
                    </div>
                </div>
                <nav class="nav-links" id="mobileNavLinks">
                    <a href="transer.html" data-i18n="nav_transfer">Transfer</a>
                    <a href="rooms-improved.html" data-i18n="nav_rooms">Rooms</a>
                    <a href="image-tools.html" data-i18n="nav_images">Images</a>
                    <a href="audio-tools.html" data-i18n="nav_audio">Audio</a>
                    <a href="video-tools.html" data-i18n="nav_video">Video</a>
                    <a href="document-tools.html" data-i18n="nav_files">Files</a>
                </nav>
                <div class="control-buttons" style="min-width: 140px; display: flex; justify-content: flex-end; position: relative;">
                    <div class="language-selector" id="languageSelector">
                        <button id="langToggle" aria-haspopup="listbox" aria-expanded="false" style="display:none;">Language</button>
                        <select id="language-selector" style="padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 6px; background: white; color: #374151; font-size: 14px;">
                            <option value="en">English</option>
                            <option value="zh-CN">简体中文</option>
                            <option value="zh-TW">繁體中文</option>
                            <option value="ja">日本語</option>
                            <option value="ko">한국어</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                            <option value="pt">Português</option>
                            <option value="es">Español</option>
                        </select>
                        <div class="lang-menu" id="langMenu" role="listbox" aria-label="Select language"></div>
                    </div>
                </div>
            </div>
        </div>
    </header>`;

// 需要更新的页面列表
const pagesToUpdate = [
    // 分类页面（已经有正确header的可能需要验证）
    'audio-tools.html',
    'video-tools.html', 
    'document-tools.html',
    
    // 信息页面
    'about.html',
    'privacy.html',
    'terms.html',
    'faq.html',
    'blog.html',
    
    // 工具页面 - real系列
    'audio-compressor-real.html',
    'audio-converter-real.html',
    'audio-effects-real.html',
    'audio-merger-real.html',
    'audio-trimmer-real.html',
    'bitrate-converter-real.html',
    'document-converter-real.html',
    'frame-rate-converter-real.html',
    'metadata-editor-real.html',
    'pdf-compressor-real.html',
    'pdf-merger-real.html',
    'pdf-splitter-real.html',
    'resolution-changer-real.html',
    'subtitle-editor-real.html',
    'text-extractor-real.html',
    'video-compressor-real.html',
    'video-converter-real.html',
    'video-effects-real.html',
    'video-merger-real.html',
    'video-trimmer-real.html',
    'volume-normalizer-real.html',
    
    // 工具页面 - new系列
    'image-cropper-new.html',
    'image-compressor-new.html',
    'image-converter-new.html',
    'image-filter-effects-new.html',
    'image-resizer-new.html',
    'image-rotator-new.html',
    'image-watermark-tool-new.html',
];

const publicDir = __dirname;

function updateHeader(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 检查是否已经有header
        const headerRegex = /<header[^>]*>[\s\S]*?<\/header>/i;
        
        if (headerRegex.test(content)) {
            // 替换现有header
            content = content.replace(headerRegex, headerTemplate);
            console.log(`✓ Updated header in: ${path.basename(filePath)}`);
        } else {
            // 如果没有header，在<body>后插入
            content = content.replace(/(<body[^>]*>)/i, `$1\n${headerTemplate}\n`);
            console.log(`✓ Added header to: ${path.basename(filePath)}`);
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch (error) {
        console.error(`✗ Error updating ${path.basename(filePath)}: ${error.message}`);
        return false;
    }
}

console.log('Starting batch header update...\n');

let updated = 0;
let failed = 0;

pagesToUpdate.forEach(page => {
    const filePath = path.join(publicDir, page);
    if (fs.existsSync(filePath)) {
        if (updateHeader(filePath)) {
            updated++;
        } else {
            failed++;
        }
    } else {
        console.log(`⚠ File not found: ${page}`);
    }
});

console.log(`\n✨ Update complete!`);
console.log(`   Updated: ${updated} files`);
console.log(`   Failed: ${failed} files`);