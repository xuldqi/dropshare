const fs = require('fs');
const path = require('path');

// 工具页面列表
const toolPages = [
    'audio-tools.html',
    'video-tools.html',
    'image-tools.html',
    'document-tools.html',
    'audio-processor.html',
    'audio-converter.html',
    'video-converter.html',
    'document-processor.html',
    'pdf-to-word.html',
    'docx-to-html.html',
    'docx-to-txt.html',
    'xlsx-to-csv.html',
    'csv-to-xlsx.html'
];

// 移动端导航HTML模板
const mobileNavTemplate = `
            <!-- Mobile Menu Toggle Button -->
            <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Toggle mobile menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </header>

    <!-- Mobile Navigation Menu -->
    <nav class="mobile-nav" id="mobile-nav">
        <div class="mobile-nav-links">
            <a href="share.html" data-i18n="navigation.transfer">Transfer</a>
            <a href="share.html#rooms" data-i18n="navigation.rooms">Rooms</a>
            <a href="image-tools.html" data-i18n="navigation.images">Images</a>
            <a href="audio-tools.html" data-i18n="navigation.audio">Audio</a>
            <a href="video-tools.html" data-i18n="navigation.video">Video</a>
            <a href="document-tools.html" data-i18n="navigation.files">Files</a>
        </div>
        <div class="mobile-lang-selector">
            <select id="mobile-language-selector" title="Select Language">
                <option value="en">English</option>
                <option value="zh-cn">中文简体</option>
                <option value="zh-tw">中文繁體</option>
                <option value="ko">한국어</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="ja">日本語</option>
                <option value="pt">Português</option>
                <option value="de">Deutsch</option>
            </select>
        </div>
    </nav>`;

// 移动端导航脚本模板
const mobileScriptTemplate = `
    <!-- Mobile Navigation and Touch Optimization -->
    <script src="scripts/mobile-navigation.js"></script>`;

function addMobileNavigationToPage(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // 检查是否已经有移动端导航
        if (content.includes('mobile-menu-toggle') || content.includes('mobile-nav')) {
            console.log(`✅ ${path.basename(filePath)} 已有移动端导航`);
            return;
        }

        // 添加移动端菜单按钮到header
        if (content.includes('<!-- Language Selector Container -->')) {
            const headerEndPattern = /(\s*<!-- Language Selector Container -->\s*<div data-i18n-selector><\/div>\s*<\/div>\s*<\/div>\s*<\/header>)/;
            if (headerEndPattern.test(content)) {
                content = content.replace(headerEndPattern, mobileNavTemplate);
                modified = true;
            }
        }

        // 添加移动端导航脚本
        if (!content.includes('scripts/mobile-navigation.js')) {
            const scriptEndPattern = /(\s*<\/body>\s*<\/html>)/;
            if (scriptEndPattern.test(content)) {
                content = content.replace(scriptEndPattern, mobileScriptTemplate + '\n$1');
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ 已为 ${path.basename(filePath)} 添加移动端导航`);
        } else {
            console.log(`⚠️  ${path.basename(filePath)} 未找到合适的插入位置`);
        }
    } catch (error) {
        console.error(`❌ 处理 ${path.basename(filePath)} 时出错:`, error.message);
    }
}

// 主函数
function main() {
    console.log('🚀 开始为工具页面添加移动端导航...\n');

    const publicDir = path.join(__dirname, 'public');
    
    toolPages.forEach(page => {
        const filePath = path.join(publicDir, page);
        if (fs.existsSync(filePath)) {
            addMobileNavigationToPage(filePath);
        } else {
            console.log(`⚠️  文件不存在: ${page}`);
        }
    });

    console.log('\n🎉 移动端导航添加完成！');
}

main();
