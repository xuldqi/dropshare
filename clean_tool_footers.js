#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要清理footer的工具目录页面
const toolDirectoryPages = [
    'image-tools.html',
    'audio-tools.html',
    'document-tools.html',
    'video-tools.html'
];

const publicDir = './public';

// 简化的footer替代内容
const simplifiedFooter = `
    <!-- Simplified Footer -->
    <footer style="background: #f8f9fa; padding: 20px 0; margin-top: 40px; border-top: 1px solid #e9ecef;">
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 20px; text-align: center;">
            <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 12px;">
                <svg width="24" height="24" viewBox="0 0 24 24" style="fill: #3367d6;">
                    <path d="M12 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 2c0-3.31-2.69-6-6-6s-6 2.69-6 6c0 2.22 1.21 4.15 3 5.19l1-1.74c-1.19-.7-2-1.97-2-3.45 0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.48-.81 2.75-2 3.45l1 1.74c1.79-1.04 3-2.97 3-5.19zM12 3C6.48 3 2 7.48 2 13c0 3.7 2.01 6.92 4.99 8.65l1-1.73C5.61 18.53 4 15.96 4 13c0-4.42 3.58-8 8-8s8 3.58 8 8c0 2.96-1.61 5.53-4 6.92l1 1.73c2.99-1.73 5-4.95 5-8.65 0-5.52-4.48-10-10-10z"/>
                </svg>
                <span style="font-size: 18px; font-weight: 600; color: #3367d6;">DropShare</span>
            </div>
            <p style="margin: 0; color: #6b7280; font-size: 14px;" data-i18n="footer_simple_copyright">© 2024 DropShare. 让文件分享更简单 ❤️</p>
        </div>
    </footer>`;

function cleanFooterFromPage(filename) {
    const filePath = path.join(publicDir, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${filename} 不存在，跳过`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // 检查是否包含完整的footer
        if (content.includes('site-footer') && content.includes('footer-grid')) {
            console.log(`🔍 ${filename} 包含完整footer，正在清理...`);
            
            // 匹配并移除完整的footer部分（从 <!-- Footer --> 或 <footer class="site-footer"> 到 </footer>）
            const fullFooterPattern = /\s*(?:<!-- Footer -->\s*)?<footer[^>]*class="site-footer"[^>]*>[\s\S]*?<\/footer>/gi;
            
            if (content.match(fullFooterPattern)) {
                content = content.replace(fullFooterPattern, simplifiedFooter);
                modified = true;
                console.log(`✅ ${filename} Footer已简化`);
            }
            
            // 同时移除footer相关的CSS样式
            const footerCSSPattern = /\s*\/\* Footer \*\/[\s\S]*?(?=\s*\/\*|\s*<\/style>|\s*<style>)/gi;
            if (content.match(footerCSSPattern)) {
                content = content.replace(footerCSSPattern, '\n        /* Footer styles removed for cleaner tool page */\n');
                console.log(`🎨 ${filename} Footer CSS已移除`);
                modified = true;
            }
            
            // 移除footer responsive样式
            const footerResponsivePattern = /\s*\/\* Footer responsive \*\/[\s\S]*?(?=\s*}[\s\S]*?@media|\s*}[\s\S]*?<\/style>)/gi;
            content = content.replace(footerResponsivePattern, '');
            
        } else {
            console.log(`ℹ️  ${filename} 没有完整footer或已经简化`);
        }
        
        if (modified) {
            // 写回文件
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${filename} Footer清理完成`);
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error(`❌ ${filename} 处理失败:`, error.message);
        return false;
    }
}

// 主程序
console.log('🧹 开始清理工具页面的复杂Footer...\n');

let cleaned = 0;
let skipped = 0;

toolDirectoryPages.forEach(filename => {
    const result = cleanFooterFromPage(filename);
    if (result) {
        cleaned++;
    } else {
        skipped++;
    }
    console.log('---');
});

console.log(`\n📊 Footer清理统计:`);
console.log(`✅ 已清理: ${cleaned} 个页面`);
console.log(`ℹ️  跳过: ${skipped} 个页面`);

console.log(`\n✨ Footer清理完成！`);
console.log(`🎯 工具目录页面现在使用简洁的footer:`);
console.log(`- 只显示DropShare logo和版权信息`);
console.log(`- 移除了冗余的导航链接和社交媒体链接`);
console.log(`- 保持页面简洁专注于工具功能`);
console.log(`- 移动端友好的响应式设计`);