/**
 * DropShare 多语言翻译数据
 * 包含所有支持语言的翻译键值对
 */

// 多语言翻译数据
const TRANSLATIONS = {
    'en': {
        name: 'English',
        nativeName: 'English',
        direction: 'ltr',
        translations: {
            // 通用翻译
            'btn_home': '🏠 Home',
            'back_to_image_tools': '← Image Tools',
            'title_select_language': 'Select Language',
            
            // Image Cropper 翻译
            'image_cropper_title': 'Image Cropper - DropShare',
            'image_cropper_heading': '✂️ Image Cropper',
            'drop_images_here': 'Drag images here or click to select',
            'supported_formats_image': 'Supports JPG, PNG, GIF, WebP formats',
            'btn_select_image': 'Select Image',
            'aspect_ratio': 'Aspect Ratio:',
            'aspect_ratio_free': 'Free',
            'output_size': 'Output Size:',
            'placeholder_width': 'Width',
            'placeholder_height': 'Height',
            'maintain_quality': 'Maintain Original Quality',
            'selection_area': 'Selection Area',
            'not_selected': 'Not Selected',
            'original_size': 'Original Size',
            'crop_size': 'Crop Size',
            'btn_crop_image': 'Crop Image',
            'btn_reset_selection': 'Reset Selection',
            'btn_rotate_90': 'Rotate 90°',
            'btn_flip_horizontal': 'Flip Horizontal',
            'btn_flip_vertical': 'Flip Vertical',
            'btn_select_new_image': 'Select New Image',
            'crop_preview': 'Crop Preview',
            'original_image': 'Original Image',
            'crop_result': 'Crop Result',
            'dimensions': 'Dimensions',
            'file_size': 'File Size',
            'btn_download_image': 'Download Image',
            'btn_share_image': 'Share Image',
            'btn_continue_crop': 'Continue Cropping',
            
            // Audio Converter 翻译
            'tools.audio_converter.title': 'MP3 to WAV audio',
            'tools.audio_converter.subtitle': 'Convert MP3 to WAV audio',
            'tools.audio_converter.upload_text': 'Click to select audio files or drag them here',
            'tools.audio_converter.upload_hint': 'Supports MP3, WAV, AAC, OGG, FLAC formats, maximum 50MB',
            'tools.audio_converter.select_format': 'Select Output Format',
            'tools.audio_converter.format_mp3_desc': 'Most compatible',
            'tools.audio_converter.format_wav_desc': 'Lossless quality',
            'tools.audio_converter.format_aac_desc': 'Apple optimized',
            'tools.audio_converter.format_ogg_desc': 'Open source',
            'tools.audio_converter.format_flac_desc': 'Lossless compression',
            'tools.audio_converter.conversion_results': 'Conversion Results:',
            'tools.audio_converter.start_conversion': 'Start Conversion',
            'tools.audio_converter.download_all': '📥 Download All Files',
            'tools.audio_converter.share_all': '📤 Share All Files',
            'tools.audio_converter.clear_all': '🔄 Clear All',
            'tools.audio_converter.back_to_tools': '← Back to Audio Tools',
            
            // Image Compressor 翻译
            'tools.compressor.title': 'Image Compressor - DropShare',
            'tools.compressor.subtitle': 'Smart image compression, reduce file size while maintaining high quality',
            'tools.compressor.upload_text': 'Click to select image or drag here',
            'tools.compressor.upload_hint': 'Supports JPG, PNG, WebP formats, max 10MB',
            'tools.compressor.original_image': 'Original Image',
            'tools.compressor.compressed_image': 'Compressed Image',
            'tools.compressor.size_label': 'Size:',
            'tools.compressor.file_size_label': 'File size:',
            'tools.compressor.size_reduced_by': 'File size reduced by',
            'tools.compressor.image_quality': 'Image quality:',
            'tools.compressor.output_format': 'Output format:',
            'tools.compressor.download_btn': '📥 Download Compressed Image',
            'tools.compressor.share_btn': '📤 Share Image',
            'tools.compressor.reset_btn': '🔄 Reset',
            'tools.compressor.back_to_tools': '← Back to Tools'
        }
    },
    
    'zh': {
        name: '中文简体',
        nativeName: '中文简体',
        direction: 'ltr',
        translations: {
            // 通用翻译
            'btn_home': '🏠 首页',
            'back_to_image_tools': '← 图片工具',
            'title_select_language': '选择语言',
            
            // Image Cropper 翻译
            'image_cropper_title': '图片裁剪器 - DropShare',
            'image_cropper_heading': '✂️ 图片裁剪器',
            'drop_images_here': '拖拽图片到这里或点击选择',
            'supported_formats_image': '支持 JPG, PNG, GIF, WebP 等格式',
            'btn_select_image': '选择图片',
            'aspect_ratio': '宽高比:',
            'aspect_ratio_free': '自由',
            'output_size': '输出尺寸:',
            'placeholder_width': '宽度',
            'placeholder_height': '高度',
            'maintain_quality': '保持原始质量',
            'selection_area': '选择区域',
            'not_selected': '未选择',
            'original_size': '原始尺寸',
            'crop_size': '裁剪尺寸',
            'btn_crop_image': '裁剪图片',
            'btn_reset_selection': '重置选择',
            'btn_rotate_90': '旋转90°',
            'btn_flip_horizontal': '水平翻转',
            'btn_flip_vertical': '垂直翻转',
            'btn_select_new_image': '选择新图片',
            'crop_preview': '裁剪预览',
            'original_image': '原始图片',
            'crop_result': '裁剪结果',
            'dimensions': '尺寸',
            'file_size': '大小',
            'btn_download_image': '下载图片',
            'btn_share_image': '分享图片',
            'btn_continue_crop': '继续裁剪',
            
            // Audio Converter 翻译
            'tools.audio_converter.title': 'MP3 转 WAV 音频',
            'tools.audio_converter.subtitle': '转换 MP3 到 WAV 音频',
            'tools.audio_converter.upload_text': '点击选择音频文件或拖拽到这里',
            'tools.audio_converter.upload_hint': '支持 MP3、WAV、AAC、OGG、FLAC 格式，最大 50MB',
            'tools.audio_converter.select_format': '选择输出格式',
            'tools.audio_converter.format_mp3_desc': '最兼容',
            'tools.audio_converter.format_wav_desc': '无损质量',
            'tools.audio_converter.format_aac_desc': '苹果优化',
            'tools.audio_converter.format_ogg_desc': '开源格式',
            'tools.audio_converter.format_flac_desc': '无损压缩',
            'tools.audio_converter.conversion_results': '转换结果：',
            'tools.audio_converter.start_conversion': '开始转换',
            'tools.audio_converter.download_all': '📥 下载所有文件',
            'tools.audio_converter.share_all': '📤 分享所有文件',
            'tools.audio_converter.clear_all': '🔄 清除所有',
            'tools.audio_converter.back_to_tools': '← 返回音频工具',
            
            // Image Compressor 翻译
            'tools.compressor.title': '图片压缩器 - DropShare',
            'tools.compressor.subtitle': '智能图片压缩，在保持高质量的同时减少文件大小',
            'tools.compressor.upload_text': '点击选择图片或拖拽到这里',
            'tools.compressor.upload_hint': '支持 JPG、PNG、WebP 格式，最大 10MB',
            'tools.compressor.original_image': '原始图片',
            'tools.compressor.compressed_image': '压缩后图片',
            'tools.compressor.size_label': '尺寸：',
            'tools.compressor.file_size_label': '文件大小：',
            'tools.compressor.size_reduced_by': '文件大小减少了',
            'tools.compressor.image_quality': '图片质量：',
            'tools.compressor.output_format': '输出格式：',
            'tools.compressor.download_btn': '📥 下载压缩图片',
            'tools.compressor.share_btn': '📤 分享图片',
            'tools.compressor.reset_btn': '🔄 重置',
            'tools.compressor.back_to_tools': '← 返回工具'
        }
    },
    
    'ja': {
        name: '日本語',
        nativeName: '日本語',
        direction: 'ltr',
        translations: {
            // 通用翻译
            'btn_home': '🏠 ホーム',
            'back_to_image_tools': '← 画像ツール',
            'title_select_language': '言語を選択',
            
            // Image Cropper 翻译
            'image_cropper_title': '画像クロッパー - DropShare',
            'image_cropper_heading': '✂️ 画像クロッパー',
            'drop_images_here': '画像をここにドラッグするかクリックして選択',
            'supported_formats_image': 'JPG、PNG、GIF、WebP形式をサポート',
            'btn_select_image': '画像を選択',
            'aspect_ratio': 'アスペクト比:',
            'aspect_ratio_free': '自由',
            'output_size': '出力サイズ:',
            'placeholder_width': '幅',
            'placeholder_height': '高さ',
            'maintain_quality': '元の品質を保持',
            'selection_area': '選択エリア',
            'not_selected': '未選択',
            'original_size': '元のサイズ',
            'crop_size': 'トリミングサイズ',
            'btn_crop_image': '画像をトリミング',
            'btn_reset_selection': '選択をリセット',
            'btn_rotate_90': '90度回転',
            'btn_flip_horizontal': '水平反転',
            'btn_flip_vertical': '垂直反転',
            'btn_select_new_image': '新しい画像を選択',
            'crop_preview': 'トリミングプレビュー',
            'original_image': '元の画像',
            'crop_result': 'トリミング結果',
            'dimensions': 'サイズ',
            'file_size': 'ファイルサイズ',
            'btn_download_image': '画像をダウンロード',
            'btn_share_image': '画像を共有',
            'btn_continue_crop': 'トリミングを続ける',
            
            // Audio Converter 翻译
            'tools.audio_converter.title': 'MP3からWAVオーディオ',
            'tools.audio_converter.subtitle': 'MP3をWAVオーディオに変換',
            'tools.audio_converter.upload_text': 'オーディオファイルを選択するかここにドラッグ',
            'tools.audio_converter.upload_hint': 'MP3、WAV、AAC、OGG、FLAC形式をサポート、最大50MB',
            'tools.audio_converter.select_format': '出力形式を選択',
            'tools.audio_converter.format_mp3_desc': '最も互換性が高い',
            'tools.audio_converter.format_wav_desc': 'ロスレス品質',
            'tools.audio_converter.format_aac_desc': 'Apple最適化',
            'tools.audio_converter.format_ogg_desc': 'オープンソース',
            'tools.audio_converter.format_flac_desc': 'ロスレス圧縮',
            'tools.audio_converter.conversion_results': '変換結果：',
            'tools.audio_converter.start_conversion': '変換開始',
            'tools.audio_converter.download_all': '📥 すべてのファイルをダウンロード',
            'tools.audio_converter.share_all': '📤 すべてのファイルを共有',
            'tools.audio_converter.clear_all': '🔄 すべてクリア',
            'tools.audio_converter.back_to_tools': '← オーディオツールに戻る',
            
            // Image Compressor 翻译
            'tools.compressor.title': '画像コンプレッサー - DropShare',
            'tools.compressor.subtitle': 'スマート画像圧縮、高品質を保ちながらファイルサイズを削減',
            'tools.compressor.upload_text': '画像を選択またはここにドラッグ',
            'tools.compressor.upload_hint': 'JPG、PNG、WebP形式をサポート、最大10MB',
            'tools.compressor.original_image': '元の画像',
            'tools.compressor.compressed_image': '圧縮画像',
            'tools.compressor.size_label': 'サイズ：',
            'tools.compressor.file_size_label': 'ファイルサイズ：',
            'tools.compressor.size_reduced_by': 'ファイルサイズが削減されました',
            'tools.compressor.image_quality': '画像品質：',
            'tools.compressor.output_format': '出力形式：',
            'tools.compressor.download_btn': '📥 圧縮画像をダウンロード',
            'tools.compressor.share_btn': '📤 画像を共有',
            'tools.compressor.reset_btn': '🔄 リセット',
            'tools.compressor.back_to_tools': '← ツールに戻る'
        }
    }
};

// 简化的 i18n 系统
window.DROPSHARE_I18N = {
    currentLanguage: 'en',
    translations: TRANSLATIONS,
    
    init: function() {
        // 检测用户语言偏好
        const userLang = this.getUserLanguage();
        this.setLanguage(userLang);
        
        // 初始化页面翻译
        this.updatePageContent();
        
        // 初始化语言选择器
        this.initLanguageSelector();
        
        console.log('🌍 I18N system initialized with language:', this.currentLanguage);
    },
    
    getUserLanguage: function() {
        // 从 localStorage 获取保存的语言偏好
        const savedLang = localStorage.getItem('dropshare_language');
        if (savedLang && this.translations[savedLang]) {
            return savedLang;
        }
        
        // 从浏览器语言检测
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0];
        
        return this.translations[langCode] ? langCode : 'en';
    },
    
    setLanguage: function(langCode) {
        if (this.translations[langCode]) {
            this.currentLanguage = langCode;
            localStorage.setItem('dropshare_language', langCode);
            this.updatePageContent();
            
            // 更新语言选择器
            const selector = document.getElementById('language-selector');
            if (selector) {
                selector.value = langCode;
            }
            
            // 更新 HTML lang 属性
            document.documentElement.lang = langCode;
            
            console.log('🌍 Language changed to:', langCode);
            return true;
        }
        return false;
    },
    
    t: function(key) {
        const translation = this.translations[this.currentLanguage];
        if (translation && translation.translations[key]) {
            return translation.translations[key];
        }
        
        // 回退到英文
        const fallback = this.translations['en'];
        if (fallback && fallback.translations[key]) {
            return fallback.translations[key];
        }
        
        // 如果都没有，返回键名
        console.warn('Translation missing for key:', key);
        return key;
    },
    
    updatePageContent: function() {
        // 更新所有带有 data-i18n 属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'search')) {
                element.placeholder = translation;
            } else if (element.hasAttribute('title')) {
                element.title = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // 更新页面标题
        const titleElement = document.querySelector('title[data-i18n]');
        if (titleElement) {
            const titleKey = titleElement.getAttribute('data-i18n');
            document.title = this.t(titleKey);
        }
    },
    
    initLanguageSelector: function() {
        const selector = document.getElementById('language-selector');
        if (selector) {
            selector.value = this.currentLanguage;
            selector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }
};

// 全局函数，兼容现有代码
window.getUserLanguage = function() {
    return window.DROPSHARE_I18N.getUserLanguage();
};

window.setLanguage = function(langCode) {
    return window.DROPSHARE_I18N.setLanguage(langCode);
};

window.t = function(key) {
    return window.DROPSHARE_I18N.t(key);
};

// DOM 加载完成后自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.DROPSHARE_I18N.init();
    });
} else {
    window.DROPSHARE_I18N.init();
}

console.log('Languages.js loaded with full translation support');