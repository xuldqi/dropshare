const fs = require('fs');
const path = require('path');

// 需要添加SEO的页面列表
const pages = [
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
    'csv-to-xlsx.html',
    'share.html'
];

// SEO脚本模板
const seoScriptTemplate = `
    <!-- SEO System -->
    <script src="scripts/i18n/seo-config.js"></script>
    
    <!-- Structured Data -->
    <script src="scripts/structured-data.js"></script>`;

function addSEOToPage(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // 检查是否已经有SEO脚本
        if (content.includes('scripts/i18n/seo-config.js')) {
            console.log(`✅ ${path.basename(filePath)} 已有SEO支持`);
            return;
        }

        // 在i18n脚本后添加SEO脚本
        if (content.includes('scripts/i18n/init.js')) {
            const pattern = /(\s*<script src="scripts\/i18n\/init\.js"><\/script>\s*)/;
            if (pattern.test(content)) {
                content = content.replace(pattern, '$1' + seoScriptTemplate + '\n');
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ 已为 ${path.basename(filePath)} 添加SEO支持`);
        } else {
            console.log(`⚠️  ${path.basename(filePath)} 未找到合适的插入位置`);
        }
    } catch (error) {
        console.error(`❌ 处理 ${path.basename(filePath)} 时出错:`, error.message);
    }
}

// 主函数
function main() {
    console.log('🚀 开始为页面添加SEO支持...\n');

    const publicDir = path.join(__dirname, 'public');
    
    pages.forEach(page => {
        const filePath = path.join(publicDir, page);
        if (fs.existsSync(filePath)) {
            addSEOToPage(filePath);
        } else {
            console.log(`⚠️  文件不存在: ${page}`);
        }
    });

    console.log('\n🎉 SEO支持添加完成！');
}

main();
