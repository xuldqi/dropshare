const fs = require('fs');

// 为占位页面添加翻译键
const placeholderTranslations = {
    en: {
        // image-compressor.html
        'image_compressor_title': 'Image Compressor - DropShare',
        'image_compressor_heading': '📦 Image Compressor',
        'back_to_image_tools': '← Image Tools',
        'btn_home': '🏠 Home',
        'coming_soon_icon': '🚧',
        'coming_soon': 'Coming Soon',
        'tool_development_desc': 'Smart image compression tool is under development and will provide high-quality image compression services',
        'expected_features': '🎯 Expected Features',
        'feature_lossless_compression': 'Lossless compression algorithm',
        'feature_smart_quality': 'Smart quality adjustment',
        'feature_batch_processing': 'Batch processing support',
        'feature_realtime_preview': 'Real-time compression preview',
        'feature_size_comparison': 'File size comparison',
        'feature_compression_levels': 'Multiple compression levels',
        'btn_notify_launch': '🔔 Notify Me When Live',
        'alert_notify_message': 'Thank you for your interest! We will launch this feature as soon as possible.',

        // image-resizer.html  
        'image_resizer_title': 'Image Resizer - DropShare',
        'image_resizer_heading': '📐 Image Resizer',
        
        // image-cropper.html
        'image_cropper_title': 'Image Cropper - DropShare', 
        'image_cropper_heading': '✂️ Image Cropper',
        
        // image-rotator.html
        'image_rotator_title': 'Image Rotator - DropShare',
        'image_rotator_heading': '🔄 Image Rotator',
        
        // background-remover.html
        'background_remover_title': 'Background Remover - DropShare',
        'background_remover_heading': '🖼️ Background Remover',
        
        // text-to-image.html
        'text_to_image_title': 'Text to Image - DropShare',
        'text_to_image_heading': '🎨 Text to Image',
        
        // history.html
        'history_title': 'Transfer History - DropShare',
        'history_heading': '📋 Transfer History',
        
        // analytics.html
        'analytics_title': 'Analytics - DropShare',
        'analytics_heading': '📊 Analytics',
        
        // converter.html
        'converter_title': 'File Converter - DropShare',
        'converter_heading': '🔄 File Converter'
    },
    
    zh: {
        // image-compressor.html
        'image_compressor_title': '图片压缩器 - DropShare',
        'image_compressor_heading': '📦 图片压缩器',
        'back_to_image_tools': '← 图片工具',
        'btn_home': '🏠 首页',
        'coming_soon_icon': '🚧',
        'coming_soon': '即将推出',
        'tool_development_desc': '智能图片压缩工具正在开发中，将为您提供高质量的图片压缩服务',
        'expected_features': '🎯 预期功能',
        'feature_lossless_compression': '无损压缩算法',
        'feature_smart_quality': '智能质量调整',
        'feature_batch_processing': '批量处理支持',
        'feature_realtime_preview': '实时压缩预览',
        'feature_size_comparison': '文件大小对比',
        'feature_compression_levels': '多种压缩级别',
        'btn_notify_launch': '🔔 通知我上线',
        'alert_notify_message': '感谢您的关注！我们会尽快推出这个功能。',
        
        // image-resizer.html
        'image_resizer_title': '图片尺寸调整器 - DropShare',
        'image_resizer_heading': '📐 图片尺寸调整器',
        
        // image-cropper.html
        'image_cropper_title': '图片裁剪器 - DropShare',
        'image_cropper_heading': '✂️ 图片裁剪器',
        
        // image-rotator.html
        'image_rotator_title': '图片旋转器 - DropShare',
        'image_rotator_heading': '🔄 图片旋转器',
        
        // background-remover.html
        'background_remover_title': '背景移除器 - DropShare',
        'background_remover_heading': '🖼️ 背景移除器',
        
        // text-to-image.html
        'text_to_image_title': '文字转图片 - DropShare',
        'text_to_image_heading': '🎨 文字转图片',
        
        // history.html
        'history_title': '传输历史 - DropShare',
        'history_heading': '📋 传输历史',
        
        // analytics.html
        'analytics_title': '数据分析 - DropShare',
        'analytics_heading': '📊 数据分析',
        
        // converter.html
        'converter_title': '文件转换器 - DropShare',
        'converter_heading': '🔄 文件转换器'
    },
    
    ja: {
        // image-compressor.html
        'image_compressor_title': '画像圧縮ツール - DropShare',
        'image_compressor_heading': '📦 画像圧縮ツール',
        'back_to_image_tools': '← 画像ツール',
        'btn_home': '🏠 ホーム',
        'coming_soon_icon': '🚧',
        'coming_soon': '近日公開',
        'tool_development_desc': 'スマート画像圧縮ツールを開発中です。高品質な画像圧縮サービスを提供します',
        'expected_features': '🎯 予定機能',
        'feature_lossless_compression': 'ロスレス圧縮アルゴリズム',
        'feature_smart_quality': 'スマート品質調整',
        'feature_batch_processing': 'バッチ処理サポート',
        'feature_realtime_preview': 'リアルタイム圧縮プレビュー',
        'feature_size_comparison': 'ファイルサイズ比較',
        'feature_compression_levels': '複数の圧縮レベル',
        'btn_notify_launch': '🔔 リリース通知',
        'alert_notify_message': 'ご関心をお寄せいただき、ありがとうございます！できるだけ早くこの機能をリリースします。',
        
        // image-resizer.html
        'image_resizer_title': '画像リサイズツール - DropShare',
        'image_resizer_heading': '📐 画像リサイズツール',
        
        // image-cropper.html
        'image_cropper_title': '画像トリミングツール - DropShare',
        'image_cropper_heading': '✂️ 画像トリミングツール',
        
        // image-rotator.html
        'image_rotator_title': '画像回転ツール - DropShare',
        'image_rotator_heading': '🔄 画像回転ツール',
        
        // background-remover.html
        'background_remover_title': '背景除去ツール - DropShare',
        'background_remover_heading': '🖼️ 背景除去ツール',
        
        // text-to-image.html
        'text_to_image_title': 'テキスト画像変換 - DropShare',
        'text_to_image_heading': '🎨 テキスト画像変換',
        
        // history.html
        'history_title': '転送履歴 - DropShare',
        'history_heading': '📋 転送履歴',
        
        // analytics.html
        'analytics_title': 'アナリティクス - DropShare',
        'analytics_heading': '📊 アナリティクス',
        
        // converter.html
        'converter_title': 'ファイルコンバーター - DropShare',
        'converter_heading': '🔄 ファイルコンバーター'
    }
};

// 为其他语言创建翻译
const otherLanguages = ['zh-tw', 'fr', 'de', 'es', 'pt', 'ru', 'ar', 'ko'];
otherLanguages.forEach(langCode => {
    placeholderTranslations[langCode] = { ...placeholderTranslations.en };
});

console.log('开始添加占位页面翻译...');

// 读取当前的languages.js文件
const languagesPath = './public/scripts/i18n/languages.js';
const content = fs.readFileSync(languagesPath, 'utf8');

let LANGUAGES;
const startIdx = content.indexOf('const LANGUAGES = {');
const endIdx = content.indexOf('// Get user language from browser');
const langObj = content.substring(startIdx + 'const LANGUAGES = '.length, endIdx).trim();
const cleanObj = langObj.slice(0, -1);
LANGUAGES = eval(`(${cleanObj})`);

let totalAdded = 0;

// 为每种语言添加翻译
Object.keys(placeholderTranslations).forEach(langCode => {
    if (LANGUAGES[langCode]) {
        const langTranslations = LANGUAGES[langCode].translations;
        const newTranslations = placeholderTranslations[langCode];
        
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

console.log(`\\n🎉 成功添加了 ${totalAdded} 个占位页面翻译！`);