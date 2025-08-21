const fs = require('fs');
const path = require('path');

// 页面列表
const pages = ['about', 'blog', 'faq', 'privacy', 'terms'];
const mainLanguages = ['ar', 'de', 'en', 'es', 'fr', 'ja', 'ko', 'pt', 'ru', 'zh-tw', 'zh'];

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

function checkPageTranslations() {
    console.log('=== 检查页面翻译完整性 ===\n');
    
    pages.forEach(page => {
        console.log(`\n📄 ${page.toUpperCase()} 页面:`);
        
        const pageDir = `./public/scripts/i18n/pages/${page}`;
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
        mainLanguages.forEach(lang => {
            if (lang === 'en') return;
            
            const langFile = path.join(pageDir, `${lang}.js`);
            if (fs.existsSync(langFile)) {
                const langContent = fs.readFileSync(langFile, 'utf8');
                const langKeys = Object.keys(extractKeys(langContent));
                const missingKeys = enKeys.filter(key => !langKeys.includes(key));
                
                langStats[lang] = {
                    total: langKeys.length,
                    missing: missingKeys.length,
                    missingKeys: missingKeys
                };
                
                if (missingKeys.length === 0) {
                    console.log(`  ✅ ${lang}: 完整 (${langKeys.length}/${enKeys.length})`);
                } else {
                    console.log(`  ❌ ${lang}: 缺失 ${missingKeys.length} 个键 (${langKeys.length}/${enKeys.length})`);
                }
            } else {
                console.log(`  ❌ ${lang}: 文件不存在`);
                langStats[lang] = {
                    total: 0,
                    missing: enKeys.length,
                    missingKeys: enKeys
                };
            }
        });
        
        // 显示缺失最多的语言详情
        const missingLangs = Object.entries(langStats)
            .filter(([lang, stats]) => stats.missing > 0)
            .sort((a, b) => b[1].missing - a[1].missing)
            .slice(0, 3);
            
        if (missingLangs.length > 0) {
            console.log(`\n  📋 缺失最多的语言:`);
            missingLangs.forEach(([lang, stats]) => {
                console.log(`    ${lang}: 缺失 ${stats.missing} 个键`);
                if (stats.missing <= 5) {
                    console.log(`      缺失的键: ${stats.missingKeys.join(', ')}`);
                }
            });
        }
    });
    
    // 检查额外语言支持
    console.log(`\n\n🌍 额外语言支持检查:`);
    pages.forEach(page => {
        const pageDir = `./public/scripts/i18n/pages/${page}`;
        if (!fs.existsSync(pageDir)) return;
        
        const files = fs.readdirSync(pageDir);
        const extraLangs = files
            .filter(f => f.endsWith('.js') && f !== 'index.js')
            .map(f => f.replace('.js', ''))
            .filter(lang => !mainLanguages.includes(lang));
            
        if (extraLangs.length > 0) {
            console.log(`  ${page}: ${extraLangs.join(', ')}`);
        }
    });
}

checkPageTranslations();