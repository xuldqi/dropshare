const fs = require('fs');
const path = require('path');

// 工具页面列表
const toolPages = ['document-tools', 'image-tools', 'audio-tools', 'video-tools'];
const languages = ['ar', 'de', 'en', 'es', 'fr', 'ja', 'ko', 'pt', 'ru', 'zh-tw', 'zh'];

// 提取键值对的正则表达式
const keyRegex = /'([^']+)':\s*['"`]([^'"`]*(?:\\.[^'"`]*)*)['"`]/g;

function extractKeys(content) {
    const keys = {};
    let match;
    while ((match = keyRegex.exec(content)) !== null) {
        keys[match[1]] = match[2];
    }
    return keys;
}

function checkToolPagesTranslations() {
    console.log('=== 检查工具页面翻译完整性 ===\n');
    
    toolPages.forEach(toolPage => {
        console.log(`🛠️  ${toolPage.toUpperCase().replace('-', ' ')} 页面:`);
        
        const pageDir = `./public/scripts/i18n/pages/${toolPage}`;
        if (!fs.existsSync(pageDir)) {
            console.log(`  ⚠️  页面目录不存在: ${pageDir}`);
            return;
        }
        
        // 获取英文版本作为基准
        const enFile = path.join(pageDir, 'en.js');
        if (!fs.existsSync(enFile)) {
            console.log(`  ⚠️  英文版本不存在: ${enFile}`);
            return;
        }
        
        const enContent = fs.readFileSync(enFile, 'utf8');
        const enKeys = Object.keys(extractKeys(enContent));
        console.log(`  📊 英文键数量: ${enKeys.length}`);
        
        // 检查每种语言
        const langStats = {};
        let hasIncomplete = false;
        
        languages.forEach(lang => {
            if (lang === 'en') return;
            
            const langFile = path.join(pageDir, `${lang}.js`);
            if (fs.existsSync(langFile)) {
                const langContent = fs.readFileSync(langFile, 'utf8');
                const langKeys = Object.keys(extractKeys(langContent));
                const missingKeys = enKeys.filter(key => !langKeys.includes(key));
                
                langStats[lang] = {
                    total: langKeys.length,
                    missing: missingKeys.length,
                    missingKeys: missingKeys,
                    completeness: ((langKeys.length / enKeys.length) * 100).toFixed(1)
                };
                
                if (missingKeys.length === 0) {
                    console.log(`  ✅ ${lang}: 完整 (${langKeys.length}/${enKeys.length})`);
                } else {
                    console.log(`  ❌ ${lang}: 缺失 ${missingKeys.length} 个键 (${langKeys.length}/${enKeys.length}) - ${langStats[lang].completeness}%`);
                    hasIncomplete = true;
                    
                    // 显示前5个缺失的键
                    if (missingKeys.length <= 5) {
                        console.log(`      缺失键: ${missingKeys.join(', ')}`);
                    } else {
                        console.log(`      缺失键: ${missingKeys.slice(0, 5).join(', ')} ... (还有${missingKeys.length - 5}个)`);
                    }
                }
            } else {
                console.log(`  ❌ ${lang}: 文件不存在`);
                langStats[lang] = {
                    total: 0,
                    missing: enKeys.length,
                    missingKeys: enKeys,
                    completeness: '0.0'
                };
                hasIncomplete = true;
            }
        });
        
        // 显示页面总体状态
        const avgCompleteness = Object.values(langStats)
            .reduce((sum, stats) => sum + parseFloat(stats.completeness), 0) / Object.keys(langStats).length;
        
        console.log(`  📈 平均完整度: ${avgCompleteness.toFixed(1)}%`);
        
        if (hasIncomplete) {
            console.log(`  🚨 该页面需要翻译补充!\n`);
        } else {
            console.log(`  🎉 该页面翻译完整!\n`);
        }
    });
}

checkToolPagesTranslations();