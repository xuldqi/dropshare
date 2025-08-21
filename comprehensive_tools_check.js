const fs = require('fs');
const path = require('path');

// 检查所有工具页面的实际翻译状况
function comprehensiveToolsCheck() {
    console.log('=== 全面检查工具页面翻译现状 ===\n');
    
    const pagesDir = './public/scripts/i18n/pages';
    if (!fs.existsSync(pagesDir)) {
        console.log('页面翻译目录不存在！');
        return;
    }
    
    // 获取所有页面目录
    const pageDirectories = fs.readdirSync(pagesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    
    console.log(`发现页面目录: ${pageDirectories.join(', ')}\n`);
    
    const languages = ['en', 'zh', 'zh-tw', 'fr', 'de', 'es', 'pt', 'ru', 'ar', 'ja', 'ko'];
    const summary = {};
    
    pageDirectories.forEach(pageDir => {
        console.log(`🔍 检查 ${pageDir.toUpperCase()} 页面:`);
        
        const pagePath = path.join(pagesDir, pageDir);
        const files = fs.readdirSync(pagePath);
        
        // 检查每种语言文件是否存在
        const pageStats = {
            existing: [],
            missing: [],
            english_keys: 0,
            translations_status: {}
        };
        
        languages.forEach(lang => {
            const langFile = `${lang}.js`;
            const langPath = path.join(pagePath, langFile);
            
            if (fs.existsSync(langPath)) {
                try {
                    const content = fs.readFileSync(langPath, 'utf8');
                    // 简单统计键的数量
                    const keyMatches = content.match(/'[^']+'\s*:/g);
                    const keyCount = keyMatches ? keyMatches.length : 0;
                    
                    pageStats.existing.push(lang);
                    pageStats.translations_status[lang] = keyCount;
                    
                    if (lang === 'en') {
                        pageStats.english_keys = keyCount;
                    }
                    
                    console.log(`  ✅ ${lang}: ${keyCount} 个键`);
                } catch (error) {
                    console.log(`  ❌ ${lang}: 文件损坏 - ${error.message}`);
                    pageStats.missing.push(lang);
                }
            } else {
                pageStats.missing.push(lang);
                console.log(`  ❌ ${lang}: 文件不存在`);
            }
        });
        
        // 计算完整度
        if (pageStats.english_keys > 0) {
            languages.forEach(lang => {
                if (lang !== 'en' && pageStats.translations_status[lang]) {
                    const completeness = ((pageStats.translations_status[lang] / pageStats.english_keys) * 100).toFixed(1);
                    console.log(`      ${lang} 完整度: ${completeness}%`);
                }
            });
        }
        
        summary[pageDir] = pageStats;
        console.log('');
    });
    
    // 输出总结
    console.log('=== 翻译状况总结 ===\n');
    
    Object.entries(summary).forEach(([pageDir, stats]) => {
        console.log(`📄 ${pageDir}:`);
        console.log(`  英文键数: ${stats.english_keys}`);
        console.log(`  已翻译语言: ${stats.existing.length}/${languages.length}`);
        console.log(`  缺失语言: ${stats.missing.join(', ') || '无'}`);
        
        // 计算平均完整度
        if (stats.english_keys > 0) {
            const completeness = [];
            Object.entries(stats.translations_status).forEach(([lang, count]) => {
                if (lang !== 'en') {
                    completeness.push((count / stats.english_keys) * 100);
                }
            });
            const avgCompleteness = completeness.length > 0 
                ? (completeness.reduce((a, b) => a + b, 0) / completeness.length).toFixed(1)
                : '0.0';
            console.log(`  平均完整度: ${avgCompleteness}%`);
            
            if (parseFloat(avgCompleteness) < 100) {
                console.log(`  🚨 需要翻译补充！`);
            }
        }
        console.log('');
    });
    
    // 找出最需要翻译的页面
    const needTranslation = Object.entries(summary)
        .filter(([_, stats]) => stats.missing.length > 0 || stats.english_keys === 0)
        .map(([pageDir, _]) => pageDir);
    
    if (needTranslation.length > 0) {
        console.log(`🔥 急需翻译的页面: ${needTranslation.join(', ')}`);
    } else {
        console.log(`🎉 所有页面翻译文件都存在！`);
    }
    
    // 检查日文翻译详情
    console.log('\n=== 日文翻译详细检查 ===');
    Object.entries(summary).forEach(([pageDir, stats]) => {
        if (stats.translations_status.ja && stats.english_keys > 0) {
            const jaCompleteness = ((stats.translations_status.ja / stats.english_keys) * 100).toFixed(1);
            console.log(`${pageDir}: 日文 ${stats.translations_status.ja}/${stats.english_keys} 键 (${jaCompleteness}%)`);
        } else {
            console.log(`${pageDir}: 日文翻译缺失或无基准`);
        }
    });
}

comprehensiveToolsCheck();