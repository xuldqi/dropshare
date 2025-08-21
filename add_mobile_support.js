#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要添加移动端支持的页面
const pages = [
    'image-compressor.html',
    'image-converter.html', 
    'image-resizer.html',
    'image-cropper.html',
    'image-rotator.html',
    'document-processor.html',
    'audio-processor.html',
    'video-converter.html',
    'video-info.html',
    'csv-to-xlsx.html',
    'docx-to-html.html',
    'docx-to-txt.html',
    'xlsx-to-csv.html'
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
        return;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // 检查是否已经包含移动端CSS
        if (!content.includes('mobile-responsive.css')) {
            // 查找 manifest.json 后面插入CSS
            const manifestPattern = /(\s*<link rel="manifest" href="manifest\.json">)/;
            if (content.match(manifestPattern)) {
                content = content.replace(manifestPattern, `$1${mobileCSS}`);
                modified = true;
            } else {
                // 如果没有manifest，查找head结束标签前插入
                const headEndPattern = /(\s*<\/head>)/;
                if (content.match(headEndPattern)) {
                    content = content.replace(headEndPattern, `${mobileCSS}\n$1`);
                    modified = true;
                }
            }
        }
        
        // 检查是否已经包含移动端JS
        if (!content.includes('mobile-navigation.js')) {
            // 查找languages.js后面插入
            const languagesPattern = /(\s*<script src="scripts\/i18n\/languages\.js"><\/script>)/;
            if (content.match(languagesPattern)) {
                content = content.replace(languagesPattern, `$1${mobileJS}`);
                modified = true;
            } else {
                // 如果没有languages.js，查找body结束标签前插入
                const bodyEndPattern = /(\s*<\/body>)/;
                if (content.match(bodyEndPattern)) {
                    content = content.replace(bodyEndPattern, `${mobileJS}\n$1`);
                    modified = true;
                }
            }
        }
        
        if (modified) {
            // 写回文件
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${filename} 移动端支持添加成功`);
        } else {
            console.log(`ℹ️  ${filename} 已包含移动端支持或无法找到插入点`);
        }
        
    } catch (error) {
        console.error(`❌ ${filename} 处理失败:`, error.message);
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

// 主程序
console.log('📱 开始为工具页面添加移动端支持...\n');

if (!checkMobileFiles()) {
    console.error('请先确保移动端文件存在');
    process.exit(1);
}

pages.forEach(addMobileSupportToPage);

console.log('\n✨ 移动端支持集成完成！');
console.log('\n📱 移动端功能包括:');
console.log('- 响应式布局和汉堡菜单');
console.log('- 触摸优化和滑动手势');
console.log('- 移动端导航和语言选择');
console.log('- 设备特定的用户体验优化');
console.log('\n🔧 使用说明:');
console.log('1. 在移动端访问页面会自动显示汉堡菜单');
console.log('2. 支持右滑打开菜单，左滑关闭菜单');
console.log('3. 点击页面其他区域或按ESC键关闭菜单');
console.log('4. 所有触摸目标都已优化为44px最小尺寸');