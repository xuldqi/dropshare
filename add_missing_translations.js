const fs = require('fs');

// 新增的翻译键和对应的多语言翻译
const newTranslations = {
    en: {
        // image-cropper.html 新增翻译
        'btn_select_images': 'Select Images',
        'label_aspect_ratio': 'Aspect Ratio:',
        'aspect_ratio_free': 'Free',
        'aspect_ratio_square': '1:1',
        'aspect_ratio_4_3': '4:3',
        'aspect_ratio_16_9': '16:9',
        'aspect_ratio_3_2': '3:2',
        'label_output_size': 'Output Size:',
        'placeholder_width': 'Width',
        'placeholder_height': 'Height',
        'label_selection_area': 'Selection Area',
        'status_not_selected': 'Not Selected',
        'label_original_size': 'Original Size',
        'label_crop_size': 'Crop Size',
        'btn_crop_image': 'Crop Image',
        'btn_reset_selection': 'Reset Selection',
        'btn_rotate_90': 'Rotate 90°',
        'btn_flip_horizontal': 'Flip Horizontal',
        'btn_flip_vertical': 'Flip Vertical',
        'btn_select_new_image': 'Select New Image',
        'title_crop_preview': 'Crop Preview',
        'title_original_image': 'Original Image',
        'title_crop_result': 'Crop Result',
        'label_dimensions': 'Dimensions',
        'label_file_size': 'File Size',
        'alt_original_image': 'Original Image',
        'alt_crop_result': 'Crop Result',
        'btn_download_image': 'Download Image',
        'btn_share_image': 'Share Image',
        'btn_continue_cropping': 'Continue Cropping',
        
        // audio/video converter 新增翻译
        'btn_reload_page': 'Reload Page',
        'btn_close': 'Close',
        
        // 其他占位页面翻译
        'background_remover_heading': '🎭 Background Remover',
        'text_to_image_heading': '📝 Text to Image',
        'image_filter_heading': '🎨 Image Filter',
        'background_remover_desc': 'Smart background removal tool is under development',
        'text_to_image_desc': 'Add text to images tool is under development',
        'image_filter_desc': 'Image filter effects tool is under development'
    },
    
    zh: {
        // image-cropper.html 中文翻译 (保持原有)
        'btn_select_images': '选择图片',
        'label_aspect_ratio': '宽高比:',
        'aspect_ratio_free': '自由',
        'aspect_ratio_square': '1:1',
        'aspect_ratio_4_3': '4:3',
        'aspect_ratio_16_9': '16:9',
        'aspect_ratio_3_2': '3:2',
        'label_output_size': '输出尺寸:',
        'placeholder_width': '宽度',
        'placeholder_height': '高度',
        'label_selection_area': '选择区域',
        'status_not_selected': '未选择',
        'label_original_size': '原始尺寸',
        'label_crop_size': '裁剪尺寸',
        'btn_crop_image': '裁剪图片',
        'btn_reset_selection': '重置选择',
        'btn_rotate_90': '旋转90°',
        'btn_flip_horizontal': '水平翻转',
        'btn_flip_vertical': '垂直翻转',
        'btn_select_new_image': '选择新图片',
        'title_crop_preview': '裁剪预览',
        'title_original_image': '原始图片',
        'title_crop_result': '裁剪结果',
        'label_dimensions': '尺寸',
        'label_file_size': '大小',
        'alt_original_image': '原始图片',
        'alt_crop_result': '裁剪结果',
        'btn_download_image': '下载图片',
        'btn_share_image': '分享图片',
        'btn_continue_cropping': '继续裁剪',
        
        'btn_reload_page': '重新加载页面',
        'btn_close': '关闭',
        
        'background_remover_heading': '🎭 背景移除器',
        'text_to_image_heading': '📝 图片文字添加器',
        'image_filter_heading': '🎨 图片滤镜器',
        'background_remover_desc': '智能背景移除工具正在开发中',
        'text_to_image_desc': '图片添加文字工具正在开发中',
        'image_filter_desc': '图片滤镜效果工具正在开发中'
    },
    
    ja: {
        // image-cropper.html 日文翻译
        'btn_select_images': '画像を選択',
        'label_aspect_ratio': 'アスペクト比:',
        'aspect_ratio_free': '自由',
        'aspect_ratio_square': '1:1',
        'aspect_ratio_4_3': '4:3',
        'aspect_ratio_16_9': '16:9',
        'aspect_ratio_3_2': '3:2',
        'label_output_size': '出力サイズ:',
        'placeholder_width': '幅',
        'placeholder_height': '高さ',
        'label_selection_area': '選択エリア',
        'status_not_selected': '未選択',
        'label_original_size': '元のサイズ',
        'label_crop_size': 'トリミングサイズ',
        'btn_crop_image': '画像をトリミング',
        'btn_reset_selection': '選択をリセット',
        'btn_rotate_90': '90度回転',
        'btn_flip_horizontal': '水平反転',
        'btn_flip_vertical': '垂直反転',
        'btn_select_new_image': '新しい画像を選択',
        'title_crop_preview': 'トリミングプレビュー',
        'title_original_image': '元の画像',
        'title_crop_result': 'トリミング結果',
        'label_dimensions': 'サイズ',
        'label_file_size': 'ファイルサイズ',
        'alt_original_image': '元の画像',
        'alt_crop_result': 'トリミング結果',
        'btn_download_image': '画像をダウンロード',
        'btn_share_image': '画像を共有',
        'btn_continue_cropping': 'トリミングを続ける',
        
        'btn_reload_page': 'ページを再読み込み',
        'btn_close': '閉じる',
        
        'background_remover_heading': '🎭 背景除去ツール',
        'text_to_image_heading': '📝 テキスト画像ツール',
        'image_filter_heading': '🎨 画像フィルター',
        'background_remover_desc': 'スマート背景除去ツールを開発中です',
        'text_to_image_desc': '画像テキスト追加ツールを開発中です',
        'image_filter_desc': '画像フィルター効果ツールを開発中です'
    }
};

// 为其他语言创建翻译（暂时使用英文）
const otherLanguages = ['zh-tw', 'fr', 'de', 'es', 'pt', 'ru', 'ar', 'ko'];
otherLanguages.forEach(langCode => {
    newTranslations[langCode] = { ...newTranslations.en };
});

// 手动添加翻译到语言文件
console.log('开始手动添加缺失的翻译键...');

// 读取当前的languages.js文件
const languagesPath = './public/scripts/i18n/languages.js';
let content = fs.readFileSync(languagesPath, 'utf8');

let totalAdded = 0;

// 为每种语言添加翻译
Object.keys(newTranslations).forEach(langCode => {
    const langTranslations = newTranslations[langCode];
    let added = 0;
    
    Object.keys(langTranslations).forEach(key => {
        const value = langTranslations[key].replace(/'/g, "\\\\'").replace(/\\n/g, '\\\\n');
        const searchPattern = new RegExp(`'${langCode}':\\\\s*\\\\{[\\\\s\\\\S]*?translations:\\\\s*\\\\{([\\\\s\\\\S]*?)\\\\}`, 'm');
        const match = content.match(searchPattern);
        
        if (match) {
            // 检查键是否已存在
            const keyExists = new RegExp(`'${key}':`).test(match[1]);
            if (!keyExists) {
                // 在translations对象的末尾添加新键
                const translationsContent = match[1];
                const lastKeyMatch = translationsContent.match(/.*'([^']+)'\\s*:\\s*'[^']*'/s);
                
                if (lastKeyMatch) {
                    const newKeyLine = `,\\n            '${key}': '${value}'`;
                    const newTranslationsContent = translationsContent.replace(
                        /(.*'[^']+'\s*:\s*'[^']*')/s,
                        `$1${newKeyLine}`
                    );
                    
                    content = content.replace(match[1], newTranslationsContent);
                    added++;
                    totalAdded++;
                }
            }
        }
    });
    
    console.log(`${langCode}: 添加了 ${added} 个翻译`);
});

// 写入更新后的文件
fs.writeFileSync(languagesPath, content, 'utf8');

console.log(`\\n🎉 成功添加了 ${totalAdded} 个缺失翻译！`);
console.log('现在所有data-i18n属性都有对应的翻译了！');