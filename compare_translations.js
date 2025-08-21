const fs = require('fs');

// 语言文件列表
const languages = ['ar', 'de', 'en', 'es', 'fr', 'ja', 'ko', 'pt', 'ru', 'zh-tw', 'zh'];

// 提取键值对的正则表达式
const keyRegex = /"([^"]+)":\s*"([^"]*(?:\\.[^"]*)*)"/g;

function extractKeys(content) {
    const keys = {};
    let match;
    while ((match = keyRegex.exec(content)) !== null) {
        keys[match[1]] = match[2];
    }
    return keys;
}

// 读取所有语言文件
const allLanguageKeys = {};
const allLanguageData = {};

languages.forEach(lang => {
    try {
        const content = fs.readFileSync(`./public/scripts/i18n/languages/${lang}.js`, 'utf8');
        const keys = extractKeys(content);
        allLanguageKeys[lang] = Object.keys(keys);
        allLanguageData[lang] = keys;
        console.log(`${lang}: ${Object.keys(keys).length} 个键`);
    } catch (error) {
        console.log(`无法读取 ${lang}.js: ${error.message}`);
    }
});

// 以英文为基准，检查其他语言缺失的键
const enKeys = allLanguageKeys['en'] || [];
console.log(`\n=== 以英文为基准 (${enKeys.length} 个键) ===`);

languages.forEach(lang => {
    if (lang === 'en') return;
    
    const langKeys = allLanguageKeys[lang] || [];
    const missingKeys = enKeys.filter(key => !langKeys.includes(key));
    
    if (missingKeys.length > 0) {
        console.log(`\n${lang} 缺失的键 (${missingKeys.length} 个):`);
        missingKeys.forEach(key => {
            console.log(`  "${key}": "${allLanguageData['en'][key]}"`);
        });
    } else {
        console.log(`\n${lang}: ✓ 所有键都已翻译`);
    }
});