const fs = require('fs');

// 完整的中文简体翻译补充
const zhCompleteTranslations = {
    // 基础功能
    'files': '文件',
    'texts': '文本',
    
    // 关于页面翻译
    'about_page_title': '关于 DropShare - 简单文件共享',
    'about_header_title': '关于 DropShare',
    'about_what_is_title': '什么是 DropShare？',
    'about_what_is_p1': 'DropShare 是一个现代化的网络应用程序，让您可以在同一网络上的设备之间轻松共享文件。无需设置、无需注册、无需云存储——只需即时的点对点文件分享。',
    'about_how_it_works_title': '工作原理',
    'about_how_it_works_p1': 'DropShare 使用 WebRTC 技术在设备之间建立直接连接。您的文件直接从一个设备传输到另一个设备，不经过服务器，确保隐私和速度。',
    'about_no_setup_title': '无需设置',
    'about_no_setup_p1': '只需在浏览器中打开 DropShare 即可立即开始共享文件。无需创建账户或安装软件。',
    'about_privacy_focused_title': '注重隐私',
    'about_privacy_focused_p1': '所有传输都是点对点的，这意味着您的文件永远不会存储在我们的服务器上。您的数据保持私密和安全。',
    'about_cross_platform_title': '跨平台',
    'about_cross_platform_p1': '适用于所有现代设备和浏览器，包括运行 Windows、macOS、Linux、iOS 或 Android 的智能手机、平板电脑和计算机。',
    'about_fast_transfers_title': '快速传输',
    'about_fast_transfers_p1': '设备到设备的直接连接意味着比基于云的服务更快的传输速度。',
    'about_how_to_use_title': '如何使用 DropShare',
    'about_step1_title': '步骤 1：连接设备',
    'about_step1_p1': '确保所有设备都连接到相同的 Wi-Fi 网络或局域网。',
    'about_step2_title': '步骤 2：打开 DropShare',
    'about_step2_p1': '在您想要共享文件的所有设备上打开 DropShare。只需在浏览器中访问网站即可。',
    'about_step3_title': '步骤 3：选择设备',
    'about_step3_p1': '您将看到网络上所有可用的设备。点击您想要发送文件的设备。',
    'about_step4_title': '步骤 4：发送文件',
    'about_step4_p1': '选择您想要共享的文件。接收方将收到通知并可以接受传输。',
    'about_back_button': '返回 DropShare',
    
    // 使用条款翻译
    'terms_last_updated_date': '2024年1月15日',
    'terms_section3_intro': '作为 DropShare 的用户，您同意：',
    'terms_section3_item1': '遵守所有适用的法律法规使用服务。',
    'terms_section3_item2': '不使用服务传输非法、有害、威胁性、辱骂性、骚扰性、诽谤性、粗俗、淫秽或其他令人反感的材料。',
    'terms_section3_item3': '不试图在未经许可的情况下访问任何其他用户的设备。',
    'terms_section3_item4': '不使用服务分发恶意软件、病毒或任何其他恶意代码。',
    'terms_section3_item5': '尊重其他用户的隐私和权利。',
    'terms_section3_item6': '对您通过服务共享的所有文件承担全部责任。',
    'terms_section4_content1': '您保留对通过 DropShare 共享的文件的所有所有权。但是，通过使用服务，您授予我们根据您的要求在设备之间传输您的文件的权利。',
    'terms_section4_content2': 'DropShare 名称、徽标以及所有相关名称、徽标、产品和服务名称、设计和标语均为 DropShare 或其关联公司的商标。未经 DropShare 事先书面许可，您不得使用此类标记。',
    'terms_section5_content1': '服务按"现状"和"可用"基础提供。DROPSHARE 不作任何明示或暗示的保证，包括但不限于适销性、特定用途适用性和非侵权的暗示保证。',
    'terms_section5_content2': 'DROPSHARE 不保证：',
    'terms_section5_item1': '服务将在任何特定时间或地点不间断、安全或可用；',
    'terms_section5_item2': '任何错误或缺陷将被纠正；',
    'terms_section5_item3': '服务没有病毒或其他有害组件；',
    'terms_section5_item4': '使用服务的结果将满足您的要求。',
    'terms_section6_item1': '您对服务的访问或使用或无法访问或使用服务；',
    'terms_section6_item2': '服务上任何第三方的任何行为或内容；',
    'terms_section6_item3': '从服务获得的任何内容；以及',
    'terms_section6_item4': '对您的传输或内容的未经授权的访问、使用或更改。',
    'terms_section9_title': '9. 条款变更',
    'terms_section9_content': '我们保留随时自行决定修改或替换这些条款的权利。通过在这些修订生效后继续访问或使用我们的服务，您同意受修订条款的约束。',
    'terms_section10_title': '10. 联系我们',
    'terms_section10_content': '如果您对这些条款有任何疑问，请通过以下方式联系我们：',
    'terms_section10_email': '邮箱：support@dropshare.example.com'
};

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

console.log('开始补充中文简体翻译...');

// 获取当前中文简体翻译
const zhTranslations = LANGUAGES.zh.translations;
const originalCount = Object.keys(zhTranslations).length;

// 添加缺失的翻译
let addedCount = 0;
for (const [key, value] of Object.entries(zhCompleteTranslations)) {
    if (!zhTranslations[key]) {
        zhTranslations[key] = value;
        addedCount++;
    }
}

console.log(`原有翻译数量: ${originalCount}`);
console.log(`添加翻译数量: ${addedCount}`);
console.log(`更新后翻译数量: ${Object.keys(zhTranslations).length}`);

// 重新构建文件内容
const beforeLanguages = content.substring(0, content.indexOf('const LANGUAGES = {'));
const afterLanguages = content.substring(content.indexOf('// Get user language from browser'));

let newContent = beforeLanguages + 'const LANGUAGES = {\n';

// 写入所有语言
const langCodes = Object.keys(LANGUAGES);
langCodes.forEach((langCode, index) => {
    const lang = LANGUAGES[langCode];
    newContent += `    '${langCode}': {\n`;
    newContent += `        code: '${lang.code}',\n`;
    newContent += `        name: '${lang.name}',\n`;
    newContent += `        rtl: ${lang.rtl},\n`;
    newContent += `        translations: {\n`;
    
    const translations = langCode === 'zh' ? zhTranslations : lang.translations;
    const keys = Object.keys(translations);
    keys.forEach((key, keyIndex) => {
        const value = translations[key].replace(/'/g, "\\'").replace(/\n/g, '\\n');
        newContent += `            '${key}': '${value}'`;
        if (keyIndex < keys.length - 1) {
            newContent += ',\n';
        } else {
            newContent += '\n';
        }
    });
    
    newContent += '        }\n';
    newContent += '    }';
    if (index < langCodes.length - 1) {
        newContent += ',\n';
    } else {
        newContent += '\n';
    }
});

newContent += '};\n\n' + afterLanguages;

// 写入文件
const outputPath = './public/scripts/i18n/languages_zh_complete.js';
fs.writeFileSync(outputPath, newContent, 'utf8');

console.log(`\n中文简体翻译修复完成！新文件已保存到: ${outputPath}`);

// 同时更新独立的中文简体语言文件
const zhFilePath = './public/scripts/i18n/languages/zh.js';
if (fs.existsSync(zhFilePath)) {
    let zhFileContent = fs.readFileSync(zhFilePath, 'utf8');
    let zhFileAddedCount = 0;
    
    // 检查并添加缺失的翻译
    for (const [key, value] of Object.entries(zhCompleteTranslations)) {
        const keyPattern = new RegExp(`"${key}"\\s*:`);
        
        if (!keyPattern.test(zhFileContent)) {
            // 在文件末尾的 "}" 前添加新的翻译
            const lastBraceIndex = zhFileContent.lastIndexOf('}');
            const beforeBrace = zhFileContent.substring(0, lastBraceIndex).trim();
            const afterBrace = zhFileContent.substring(lastBraceIndex);
            
            // 确保在最后一个键后添加逗号（如果还没有的话）
            const needsComma = !beforeBrace.endsWith(',');
            const comma = needsComma ? ',' : '';
            const escapedTranslation = value.replace(/"/g, '\\"');
            
            zhFileContent = beforeBrace + comma + 
                           `\n    "${key}": "${escapedTranslation}"` + 
                           '\n' + afterBrace;
            
            zhFileAddedCount++;
        }
    }
    
    if (zhFileAddedCount > 0) {
        fs.writeFileSync(zhFilePath, zhFileContent, 'utf8');
        console.log(`独立中文简体语言文件已更新，添加了 ${zhFileAddedCount} 个翻译`);
    }
}