const fs = require('fs');

// 添加缺失的翻译键
const missingKeys = {
    en: {
        'tab_extract': 'Text Extraction',
        'tab_convert': 'Format Convert'
    },
    zh: {
        'tab_extract': '文本提取', 
        'tab_convert': '格式转换'
    },
    ja: {
        'tab_extract': 'テキスト抽出',
        'tab_convert': '形式変換'
    }
};

// 为其他语言创建翻译
const otherLanguages = ['zh-tw', 'fr', 'de', 'es', 'pt', 'ru', 'ar', 'ko'];
otherLanguages.forEach(langCode => {
    missingKeys[langCode] = { ...missingKeys.en };
});

console.log('添加缺失的翻译键...');

// 读取当前的languages.js文件
const languagesPath = './public/scripts/i18n/languages.js';
const content = fs.readFileSync(languagesPath, 'utf8');

let LANGUAGES;
const startIdx = content.indexOf('const LANGUAGES = {');
const endIdx = content.indexOf('// Get user language from browser');
const langObj = content.substring(startIdx + 'const LANGUAGES = '.length, endIdx).trim();
const cleanObj = langObj.slice(0, -1); // 移除最后的 ;
LANGUAGES = eval(`(${cleanObj})`);

let totalAdded = 0;

// 为每种语言添加翻译
Object.keys(missingKeys).forEach(langCode => {
    if (LANGUAGES[langCode]) {
        const langTranslations = LANGUAGES[langCode].translations;
        const newTranslations = missingKeys[langCode];
        
        let added = 0;
        Object.keys(newTranslations).forEach(key => {
            if (!langTranslations[key]) {
                langTranslations[key] = newTranslations[key];
                added++;
                totalAdded++;
            }
        });
        
        console.log(`${LANGUAGES[langCode].name} (${langCode}): 添加了 ${added} 个翻译`);
    }
});

// 重新构建文件内容
const beforeLanguages = content.substring(0, content.indexOf('const LANGUAGES = {'));
const afterLanguages = content.substring(content.indexOf('// Get user language from browser'));

let newContent = beforeLanguages + 'const LANGUAGES = {\\n';

const langCodes = Object.keys(LANGUAGES);
langCodes.forEach((langCode, index) => {
    const lang = LANGUAGES[langCode];
    newContent += `    '${langCode}': {\\n`;
    newContent += `        code: '${lang.code}',\\n`;
    newContent += `        name: '${lang.name}',\\n`;
    newContent += `        rtl: ${lang.rtl},\\n`;
    newContent += `        translations: {\\n`;
    
    const translations = lang.translations;
    const keys = Object.keys(translations);
    keys.forEach((key, keyIndex) => {
        const value = translations[key].replace(/'/g, "\\\\'").replace(/\\n/g, '\\\\n');
        newContent += `            '${key}': '${value}'`;
        if (keyIndex < keys.length - 1) {
            newContent += ',\\n';
        } else {
            newContent += '\\n';
        }
    });
    
    newContent += '        }\\n';
    newContent += '    }';
    if (index < langCodes.length - 1) {
        newContent += ',\\n';
    } else {
        newContent += '\\n';
    }
});

newContent += '};\\n\\n' + afterLanguages;

// 写入更新后的文件
fs.writeFileSync(languagesPath, newContent, 'utf8');

console.log(`\\n🎉 成功添加了 ${totalAdded} 个缺失翻译键！`);