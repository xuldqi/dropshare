const fs = require('fs');

// 读取languages.js文件
const languagesPath = './public/scripts/i18n/languages.js';
const content = fs.readFileSync(languagesPath, 'utf8');

// 提取LANGUAGES对象
const languagesMatch = content.match(/const LANGUAGES = (\{[\s\S]*?\});/);
if (!languagesMatch) {
    console.error('无法找到LANGUAGES对象');
    process.exit(1);
}

let LANGUAGES;
try {
    eval(`LANGUAGES = ${languagesMatch[1]}`);
} catch (error) {
    console.error('解析LANGUAGES对象失败:', error.message);
    process.exit(1);
}

// 分析各语言缺失情况
const enTranslations = LANGUAGES.en.translations;
const targetLanguages = ['fr', 'de', 'es', 'pt', 'ru', 'ar', 'ja', 'ko'];

console.log('=== 多语言缺失分析 ===\n');
console.log(`英语基准键数: ${Object.keys(enTranslations).length}\n`);

const languageAnalysis = {};

targetLanguages.forEach(langCode => {
    const langTranslations = LANGUAGES[langCode].translations;
    const missing = [];
    
    for (const key in enTranslations) {
        if (!langTranslations[key]) {
            missing.push(key);
        }
    }
    
    languageAnalysis[langCode] = {
        name: LANGUAGES[langCode].name,
        current: Object.keys(langTranslations).length,
        missing: missing.length,
        missingKeys: missing,
        completeness: ((Object.keys(langTranslations).length / Object.keys(enTranslations).length) * 100).toFixed(1)
    };
    
    console.log(`${LANGUAGES[langCode].name} (${langCode}):`);
    console.log(`  当前键数: ${languageAnalysis[langCode].current}`);
    console.log(`  缺失键数: ${languageAnalysis[langCode].missing}`);
    console.log(`  完整度: ${languageAnalysis[langCode].completeness}%\n`);
});

// 分析最常缺失的键类型
const keyCategories = {
    'file_': '文件管理',
    'transfer_': '传输功能', 
    'device_': '设备管理',
    'security_': '安全设置',
    'notification': '通知系统',
    'theme': '界面主题',
    'advanced_': '高级功能',
    'help_': '帮助支持',
    'preview': '文件预览',
    'search_': '搜索过滤',
    'batch_': '批量操作',
    'cloud_': '云同步',
    'collaboration': '协作功能',
    'performance': '性能优化',
    'accessibility': '无障碍',
    'shortcuts': '快捷操作'
};

console.log('=== 缺失键类型分析 ===\n');

// 统计各类型缺失情况
const categoryStats = {};
Object.keys(keyCategories).forEach(prefix => {
    categoryStats[prefix] = 0;
});

// 分析所有语言共同缺失的键
const commonMissing = [];
const firstLangMissing = languageAnalysis[targetLanguages[0]].missingKeys;

firstLangMissing.forEach(key => {
    let missingInAll = true;
    for (let i = 1; i < targetLanguages.length; i++) {
        if (!languageAnalysis[targetLanguages[i]].missingKeys.includes(key)) {
            missingInAll = false;
            break;
        }
    }
    if (missingInAll) {
        commonMissing.push(key);
        
        // 统计类型
        for (const prefix of Object.keys(keyCategories)) {
            if (key.includes(prefix)) {
                categoryStats[prefix]++;
                break;
            }
        }
    }
});

console.log(`所有语言共同缺失的键: ${commonMissing.length} 个\n`);

Object.entries(categoryStats).forEach(([prefix, count]) => {
    if (count > 0) {
        console.log(`${keyCategories[prefix]}: ${count} 个缺失键`);
    }
});

// 显示前20个最常缺失的键
console.log('\n=== 最常缺失的功能键 (前20个) ===');
commonMissing.slice(0, 20).forEach((key, index) => {
    console.log(`${index + 1}. ${key}: "${enTranslations[key]}"`);
});

// 保存分析结果
const analysisResult = {
    totalEnglishKeys: Object.keys(enTranslations).length,
    languages: languageAnalysis,
    commonMissingKeys: commonMissing,
    categoryStats: categoryStats
};

fs.writeFileSync('./multilingual_analysis.json', JSON.stringify(analysisResult, null, 2), 'utf8');
console.log('\n分析结果已保存到: multilingual_analysis.json');

console.log('\n=== 翻译策略建议 ===');
console.log('1. 优先翻译所有语言共同缺失的键');
console.log('2. 技术术语保持原文 (如 PDF, MP3, API 等)');
console.log('3. 按语言系分组批量翻译提高效率');
console.log('4. 重点关注用户界面和常用功能的翻译质量');