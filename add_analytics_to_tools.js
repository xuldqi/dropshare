#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 需要添加Firebase Analytics的工具页面
const toolPages = [
    'audio-processor.html',
    'csv-to-xlsx.html', 
    'docx-to-html.html',
    'docx-to-txt.html',
    'video-info.html',
    'xlsx-to-csv.html',
    'image-resizer.html',
    'image-cropper.html',
    'image-rotator.html',
    'image-converter.html',
    'video-converter.html'
];

const publicDir = './public';

// Firebase Analytics代码块
const firebaseScripts = `    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics-compat.js"></script>
    
    <!-- Firebase Analytics Configuration -->
    <script src="scripts/firebase-analytics.js"></script>
    <script src="scripts/analytics-enhanced.js"></script>
    <script src="scripts/tools-analytics.js"></script>
    
    <!-- Load i18n system -->`;

function addAnalyticsToToolPage(filename) {
    const filePath = path.join(publicDir, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${filename} 不存在，跳过`);
        return;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 检查是否已经包含Firebase
        if (content.includes('firebase-app-compat.js')) {
            console.log(`✅ ${filename} 已经包含Firebase Analytics，跳过`);
            return;
        }
        
        // 查找并替换i18n system加载部分
        const i18nPattern = /(\s*)<!-- Load i18n system -->/;
        const match = content.match(i18nPattern);
        
        if (match) {
            const replacement = match[1] + firebaseScripts;
            content = content.replace(i18nPattern, replacement);
            
            // 写回文件
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${filename} Firebase Analytics 添加成功`);
        } else {
            console.log(`⚠️  ${filename} 未找到i18n system标记，跳过`);
        }
    } catch (error) {
        console.error(`❌ ${filename} 处理失败:`, error.message);
    }
}

// 处理所有工具页面
console.log('🚀 开始为工具页面添加Firebase Analytics...\n');

toolPages.forEach(addAnalyticsToToolPage);

console.log('\n✨ Firebase Analytics集成完成！');
console.log('\n📊 现在工具页面将收集以下统计数据:');
console.log('- 页面访问量和用户设备信息');
console.log('- 文件选择和处理事件');
console.log('- 用户交互和设置变更');
console.log('- 处理时间和成功率');
console.log('- 错误信息和性能指标');