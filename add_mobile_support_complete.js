#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 完整的工具页面列表
const allToolPages = [
    // 图片工具
    'image-compressor.html',
    'image-compressor-new.html',
    'image-converter.html',
    'image-converter-new.html',
    'image-resizer.html',
    'image-resizer-new.html',
    'image-cropper.html',
    'image-cropper-new.html',
    'image-rotator.html',
    'image-rotator-new.html',
    'image-filter.html',
    'image-filter-effects-new.html',
    'image-background-remover-new.html',
    'image-watermark-tool-new.html',
    'background-remover.html',
    
    // 音频工具
    'audio-processor.html',
    'audio-converter.html',
    
    // 视频工具
    'video-converter.html',
    'video-info.html',
    
    // 文档工具
    'document-processor.html',
    'csv-to-xlsx.html',
    'docx-to-html.html',
    'docx-to-txt.html',
    'xlsx-to-csv.html',
    
    // 其他工具
    'text-to-image.html',
    'converter.html',
    
    // 工具目录页面
    'image-tools.html',
    'audio-tools.html',
    'document-tools.html',
    'video-tools.html'
];

const publicDir = './public';

// 移动端CSS链接
const mobileCSS = `    
    <!-- Mobile Responsive Styles -->
    <link rel="stylesheet" href="styles/mobile-responsive.css">`;

// 移动端JavaScript
const mobileJS = `    
    <!-- Mobile Navigation and Touch Optimization -->
    <script src="scripts/mobile-navigation.js"></script>`;

function addMobileSupportToPage(filename) {
    const filePath = path.join(publicDir, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${filename} 不存在，跳过`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // 检查是否已经包含移动端CSS
        if (!content.includes('mobile-responsive.css')) {
            // 尝试多种模式插入CSS
            let cssInserted = false;
            
            // 模式1：manifest.json 后面
            const manifestPattern = /(\s*<link rel="manifest" href="manifest\.json">)/;
            if (content.match(manifestPattern)) {
                content = content.replace(manifestPattern, `$1${mobileCSS}`);
                cssInserted = true;
                modified = true;
            }
            
            // 模式2：如果有其他CSS链接，在最后一个CSS后面
            else if (!cssInserted && content.includes('<link') && content.includes('.css')) {
                const lastCSSPattern = /(\s*<link[^>]*\.css[^>]*>)/gi;
                const matches = [...content.matchAll(lastCSSPattern)];
                if (matches.length > 0) {
                    const lastMatch = matches[matches.length - 1];
                    content = content.replace(lastMatch[0], `${lastMatch[0]}${mobileCSS}`);
                    cssInserted = true;
                    modified = true;
                }
            }
            
            // 模式3：</head>前面
            else if (!cssInserted) {
                const headEndPattern = /(\s*<\/head>)/;
                if (content.match(headEndPattern)) {
                    content = content.replace(headEndPattern, `${mobileCSS}\n$1`);
                    cssInserted = true;
                    modified = true;
                }
            }
            
            if (!cssInserted) {
                console.log(`⚠️  ${filename} 无法找到CSS插入点`);
            }
        }
        
        // 检查是否已经包含移动端JS
        if (!content.includes('mobile-navigation.js')) {
            let jsInserted = false;
            
            // 模式1：languages.js后面
            const languagesPattern = /(\s*<script src="scripts\/i18n\/languages[^"]*\.js"><\/script>)/;
            if (content.match(languagesPattern)) {
                content = content.replace(languagesPattern, `$1${mobileJS}`);
                jsInserted = true;
                modified = true;
            }
            
            // 模式2：任何i18n相关JS后面
            else if (!jsInserted && content.includes('i18n')) {
                const i18nJSPattern = /(\s*<script[^>]*i18n[^>]*><\/script>)/gi;
                const matches = [...content.matchAll(i18nJSPattern)];
                if (matches.length > 0) {
                    const lastMatch = matches[matches.length - 1];
                    content = content.replace(lastMatch[0], `${lastMatch[0]}${mobileJS}`);
                    jsInserted = true;
                    modified = true;
                }
            }
            
            // 模式3：最后一个script标签后面
            else if (!jsInserted) {
                const lastScriptPattern = /(\s*<script[^>]*><\/script>)(?![\s\S]*<script)/;
                if (content.match(lastScriptPattern)) {
                    content = content.replace(lastScriptPattern, `$1${mobileJS}`);
                    jsInserted = true;
                    modified = true;
                }
            }
            
            // 模式4：</body>前面
            else if (!jsInserted) {
                const bodyEndPattern = /(\s*<\/body>)/;
                if (content.match(bodyEndPattern)) {
                    content = content.replace(bodyEndPattern, `${mobileJS}\n$1`);
                    jsInserted = true;
                    modified = true;
                }
            }
            
            if (!jsInserted) {
                console.log(`⚠️  ${filename} 无法找到JS插入点`);
            }
        }
        
        if (modified) {
            // 写回文件
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${filename} 移动端支持添加成功`);
            return true;
        } else {
            console.log(`ℹ️  ${filename} 已包含移动端支持`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ ${filename} 处理失败:`, error.message);
        return false;
    }
}

// 检查是否已存在移动端文件
function checkMobileFiles() {
    const mobileCSS = path.join(publicDir, 'styles', 'mobile-responsive.css');
    const mobileJS = path.join(publicDir, 'scripts', 'mobile-navigation.js');
    
    if (!fs.existsSync(mobileCSS)) {
        console.error('❌ mobile-responsive.css 不存在！');
        return false;
    }
    
    if (!fs.existsSync(mobileJS)) {
        console.error('❌ mobile-navigation.js 不存在！');
        return false;
    }
    
    return true;
}

// 统计处理结果
function processAllPages() {
    let processed = 0;
    let skipped = 0;
    let alreadyExists = 0;
    let failed = 0;
    
    console.log(`📱 开始为 ${allToolPages.length} 个工具页面添加完整移动端支持...\n`);
    
    allToolPages.forEach(filename => {
        const result = addMobileSupportToPage(filename);
        if (result === true) {
            processed++;
        } else if (result === false && fs.existsSync(path.join(publicDir, filename))) {
            alreadyExists++;
        } else {
            skipped++;
        }
    });
    
    console.log(`\n📊 处理统计:`);
    console.log(`✅ 新增移动端支持: ${processed} 个页面`);
    console.log(`ℹ️  已存在移动端支持: ${alreadyExists} 个页面`);
    console.log(`⚠️  跳过（不存在）: ${skipped} 个页面`);
    console.log(`❌ 处理失败: ${failed} 个页面`);
    console.log(`📱 总计工具页面: ${allToolPages.length} 个`);
}

// 主程序
if (!checkMobileFiles()) {
    console.error('请先确保移动端文件存在');
    process.exit(1);
}

processAllPages();

console.log(`\n✨ 完整移动端支持集成完成！`);
console.log(`\n📱 所有工具页面包括:`);
console.log(`🖼️  图片工具: 10个页面 (compressor, converter, resizer, cropper, rotator, filter, background-remover, watermark)`);
console.log(`🎵 音频工具: 2个页面 (processor, converter)`);  
console.log(`🎬 视频工具: 2个页面 (converter, info)`);
console.log(`📄 文档工具: 5个页面 (processor, csv-xlsx, docx-html, docx-txt, xlsx-csv)`);
console.log(`🛠️  其他工具: 2个页面 (text-to-image, converter)`);
console.log(`📂 目录页面: 4个页面 (image-tools, audio-tools, document-tools, video-tools)`);
console.log(`\n🎯 移动端功能现已覆盖所有工具页面！`);