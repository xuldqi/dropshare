const fs = require('fs');
const path = require('path');

// 读取languages.js文件
const languagesPath = path.join(__dirname, 'public/scripts/i18n/languages.js');
const content = fs.readFileSync(languagesPath, 'utf8');

// 提取LANGUAGES对象
const languagesMatch = content.match(/const LANGUAGES = (\{[\s\S]*?\});/);
if (!languagesMatch) {
    console.error('无法找到LANGUAGES对象');
    process.exit(1);
}

// 使用eval来解析对象（注意：这在生产环境中不安全，但对于脚本分析是可以的）
let LANGUAGES;
try {
    eval(`LANGUAGES = ${languagesMatch[1]}`);
} catch (error) {
    console.error('解析LANGUAGES对象失败:', error.message);
    process.exit(1);
}

// 获取所有语言代码
const languageCodes = Object.keys(LANGUAGES);
console.log('找到的语言:', languageCodes.join(', '));

// 以英文为基准，获取所有键
const englishKeys = new Set(Object.keys(LANGUAGES.en.translations));
console.log(`\n英文翻译包含 ${englishKeys.size} 个键`);

// 检查每种语言的键完整性
const report = {};
const allMissingKeys = new Set();

languageCodes.forEach(langCode => {
    if (langCode === 'en') return; // 跳过英文基准
    
    const langKeys = new Set(Object.keys(LANGUAGES[langCode].translations));
    const missingKeys = [...englishKeys].filter(key => !langKeys.has(key));
    const extraKeys = [...langKeys].filter(key => !englishKeys.has(key));
    
    report[langCode] = {
        name: LANGUAGES[langCode].name,
        totalKeys: langKeys.size,
        missingKeys: missingKeys,
        extraKeys: extraKeys,
        completeness: ((langKeys.size - extraKeys.length) / englishKeys.size * 100).toFixed(1)
    };
    
    // 收集所有缺失的键
    missingKeys.forEach(key => allMissingKeys.add(key));
});

// 输出报告
console.log('\n=== 翻译完整性报告 ===');
languageCodes.forEach(langCode => {
    if (langCode === 'en') return;
    
    const info = report[langCode];
    console.log(`\n${info.name} (${langCode}):`);
    console.log(`  完整度: ${info.completeness}% (${info.totalKeys}/${englishKeys.size})`);
    
    if (info.missingKeys.length > 0) {
        console.log(`  缺失键 (${info.missingKeys.length}):`);
        info.missingKeys.slice(0, 10).forEach(key => {
            console.log(`    - ${key}`);
        });
        if (info.missingKeys.length > 10) {
            console.log(`    ... 还有 ${info.missingKeys.length - 10} 个`);
        }
    }
    
    if (info.extraKeys.length > 0) {
        console.log(`  多余键 (${info.extraKeys.length}):`);
        info.extraKeys.slice(0, 5).forEach(key => {
            console.log(`    + ${key}`);
        });
        if (info.extraKeys.length > 5) {
            console.log(`    ... 还有 ${info.extraKeys.length - 5} 个`);
        }
    }
});

// 输出最常缺失的键
if (allMissingKeys.size > 0) {
    console.log('\n=== 最常缺失的键 ===');
    const keyFrequency = {};
    languageCodes.forEach(langCode => {
        if (langCode === 'en') return;
        report[langCode].missingKeys.forEach(key => {
            keyFrequency[key] = (keyFrequency[key] || 0) + 1;
        });
    });
    
    const sortedKeys = Object.entries(keyFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20);
    
    sortedKeys.forEach(([key, count]) => {
        console.log(`  ${key}: 缺失于 ${count}/${languageCodes.length - 1} 种语言`);
    });
}

console.log('\n=== 总结 ===');
const avgCompleteness = Object.values(report)
    .reduce((sum, info) => sum + parseFloat(info.completeness), 0) / Object.keys(report).length;
console.log(`平均完整度: ${avgCompleteness.toFixed(1)}%`);
console.log(`需要补充的唯一键数量: ${allMissingKeys.size}`);