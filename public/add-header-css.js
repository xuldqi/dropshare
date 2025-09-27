const fs = require('fs');
const path = require('path');

// 统一的header CSS样式
const headerCSS = `
<style>
/* Unified Header Styles */
.header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid #e5e7eb;
    z-index: 3000;
    padding: 12px 0;
}

.header-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.brand-left { 
    display: flex; 
    align-items: center; 
    gap: 12px; 
}

.logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 24px;
    font-weight: bold;
    color: #2563eb;
}

.logo svg {
    width: 32px;
    height: 32px;
    fill: #2563eb;
}

.header-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

/* 桌面端导航链接居中 */
.nav-links {
    display: flex;
    gap: 24px;
    align-items: center;
    flex: 1;
    justify-content: center;
}

.nav-links a {
    color: #6b7280;
    text-decoration: none;
    font-weight: 500;
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.nav-links a:hover {
    color: #2563eb;
    background: #f3f4f6;
}

.nav-links a.active {
    color: #2563eb;
    background: #e3f2fd;
    font-weight: 600;
}

.control-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 140px;
    justify-content: flex-end;
}

/* Hamburger (hidden on desktop) */
.hamburger {
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    padding: 4px;
}

.hamburger span {
    width: 18px;
    height: 2px;
    background: #374151;
    transition: all 0.3s ease;
    border-radius: 1px;
    margin: 2px 0;
}

/* Language Selector */
.language-selector {
    position: relative;
}

.language-selector select {
    cursor: pointer;
}

/* Mobile Responsive */
@media (min-width: 769px) {
    .header {
        display: block;
    }
    
    .hamburger {
        display: none;
    }
    
    .nav-links {
        display: flex !important;
    }
}

@media (max-width: 768px) {
    .header {
        display: block;
    }
    
    .header-container {
        padding: 0 16px;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    
    .hamburger { 
        display: flex !important; 
        background: rgba(255,255,255,0.95);
        border: 1px solid #e5e7eb;
        border-radius: 10px;
    }
    
    /* 移动端隐藏导航链接，通过汉堡菜单显示 */
    .nav-links { 
        display: none !important; 
    }
    
    .nav-links.mobile-open {
        display: flex !important;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        position: fixed;
        top: 80px;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        padding: 20px;
        z-index: 999;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }
    
    .nav-links a {
        font-size: 14px;
        padding: 8px 12px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
    }
    
    /* 品牌区域只显示汉堡菜单，隐藏logo文字 */
    .brand-left .logo a { 
        display: none; 
    }
    
    /* 语言选择器保持在右侧 */
    .control-buttons { 
        min-width: auto !important; 
        justify-content: flex-end !important; 
    }
    
    .menu-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.35);
        z-index: 2000;
        display: none;
        pointer-events: auto;
    }
    .menu-backdrop.show { display: block; }
}

/* Mobile: hide header logo icon in navigation to save space */
@media (max-width: 768px) {
    .header .logo svg { display: none; }
}

/* 确保页面内容不被固定header遮挡 */
body {
    padding-top: 80px;
}
</style>`;

// 获取所有刚刚更新的页面列表
const updatedPages = [
    'audio-tools.html',
    'video-tools.html', 
    'document-tools.html',
    'about.html',
    'privacy.html',
    'terms.html',
    'faq.html',
    'blog.html',
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
    'image-cropper-new.html',
    'image-compressor-new.html',
    'image-converter-new.html',
    'image-filter-effects-new.html',
    'image-resizer-new.html',
    'image-rotator-new.html',
    'image-watermark-tool-new.html',
];

const publicDir = __dirname;

function addHeaderCSS(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 检查是否已经有header样式
        if (content.includes('Unified Header Styles')) {
            console.log(`~ CSS already exists in: ${path.basename(filePath)}`);
            return true;
        }
        
        // 在</head>前插入CSS
        content = content.replace(/(<\/head>)/i, `${headerCSS}\n$1`);
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Added CSS to: ${path.basename(filePath)}`);
        return true;
    } catch (error) {
        console.error(`✗ Error adding CSS to ${path.basename(filePath)}: ${error.message}`);
        return false;
    }
}

console.log('Adding unified header CSS to updated pages...\n');

let updated = 0;
let failed = 0;

updatedPages.forEach(page => {
    const filePath = path.join(publicDir, page);
    if (fs.existsSync(filePath)) {
        if (addHeaderCSS(filePath)) {
            updated++;
        } else {
            failed++;
        }
    } else {
        console.log(`⚠ File not found: ${page}`);
    }
});

console.log(`\n✨ CSS update complete!`);
console.log(`   Updated: ${updated} files`);
console.log(`   Failed: ${failed} files`);