// 核心语言系统 - 只包含基础语言，支持按需加载
const CORE_LANGUAGES = {
    'en': {
        code: 'en',
        name: 'English',
        rtl: false,
        translations: {
            'hero_title': 'Fast Local File Sharing Across Devices on Your Network',
            'hero_subtitle': 'Instantly share files with nearby devices. No setup required, completely peer-to-peer.',
            'btn_start_sharing': 'Start Sharing Files',
            'btn_multiuser_rooms': 'Multi-user Rooms',
            'nav_transfer': 'Transfer',
            'nav_rooms': 'Rooms',
            'nav_images': 'Images',
            'nav_audio': 'Audio',
            'nav_video': 'Video',
            'nav_files': 'Files',
            'nav_about': 'About',
            'nav_faq': 'FAQ',
            'nav_blog': 'Blog',
            'nav_privacy': 'Privacy',
            'nav_terms': 'Terms',
            'section_choose_category': 'Choose Your Tool Category',
            'section_choose_description': 'Select from our comprehensive collection of tools organized by category',
            'category_image_title': 'Image Tools',
            'category_image_description': 'Edit, convert, and optimize images',
            'category_audio_title': 'Audio Tools',
            'category_audio_description': 'Convert audio between different formats',
            'category_document_title': 'Document Tools',
            'category_document_description': 'Convert, merge, split, and extract text',
            'category_video_title': 'Video Tools',
            'category_video_description': 'Convert videos between different formats',
            'tool_format_converter': 'Format Converter',
            'tool_image_cropper': 'Image Cropper',
            'tool_background_remover': 'Background Remover',
            'btn_view_tools': 'View Tools →',
            'popular_tools_title': 'Most Popular Tools',
            'popular_tools_description': 'Join thousands of users who trust our tools',
            'btn_use_tool': 'Use Tool',
            'feature_free_title': '100% Free',
            'feature_free_text': 'All tools are completely free to use with no hidden charges or subscriptions required.',
            'feature_secure_title': 'Secure & Private',
            'feature_secure_text': 'Your files are processed locally and securely. No data is stored on our servers.',
            'feature_fast_title': 'Fast & Easy',
            'feature_fast_text': 'No registration required. Simply upload your file and get results in seconds.',
            'you_are_known_as': 'You are known as'
        }
    },
    'zh': {
        code: 'zh',
        name: '中文简体',
        rtl: false,
        translations: {
            'hero_title': '快速本地文件共享，连接您网络中的所有设备',
            'hero_subtitle': '与附近设备即时分享文件。无需设置，完全点对点传输。',
            'btn_start_sharing': '开始文件分享',
            'btn_multiuser_rooms': '多人房间',
            'nav_transfer': '传送',
            'nav_rooms': '多人房间',
            'nav_images': '图片',
            'nav_audio': '音频',
            'nav_video': '视频',
            'nav_files': '文件',
            'nav_about': '关于',
            'nav_faq': '常见问题',
            'nav_blog': '博客',
            'nav_privacy': '隐私',
            'nav_terms': '条款',
            'section_choose_category': '选择您的工具类别',
            'section_choose_description': '从我们按类别组织的综合工具集合中选择',
            'category_image_title': '图像工具',
            'category_image_description': '编辑、转换和优化图像',
            'category_audio_title': '音频工具',
            'category_audio_description': '在不同格式间转换音频',
            'category_document_title': '文档工具',
            'category_document_description': '转换、合并、拆分和提取文本',
            'category_video_title': '视频工具',
            'category_video_description': '在不同格式间转换视频',
            'tool_format_converter': '格式转换器',
            'tool_image_cropper': '图像裁剪器',
            'tool_background_remover': '背景移除器',
            'btn_view_tools': '查看工具 →',
            'popular_tools_title': '最受欢迎的工具',
            'popular_tools_description': '加入数千名信任我们工具的用户',
            'btn_use_tool': '使用工具',
            'feature_free_title': '100% 免费',
            'feature_free_text': '所有工具完全免费使用，无隐藏费用或订阅要求。',
            'feature_secure_title': '安全私密',
            'feature_secure_text': '您的文件在本地安全处理。我们的服务器不存储任何数据。',
            'feature_fast_title': '快速便捷',
            'feature_fast_text': '无需注册。只需上传文件，即可在几秒钟内获得结果。',
            'you_are_known_as': '您的名称是'
        }
    }
};

// 可用语言列表（用于生成语言选择器）
const AVAILABLE_LANGUAGES = {
    'en': 'English',
    'zh': '中文简体',
    'zh-tw': '中文繁體',
    'ja': '日本語',
    'fr': 'Français',
    'es': 'Español',
    'de': 'Deutsch',
    'pt': 'Português',
    'ru': 'Русский',
    'ar': 'العربية',
    'ko': '한국어'
};

// 当前语言
let currentLanguage = 'en';

// 已加载的语言缓存
let loadedLanguages = { ...CORE_LANGUAGES };

// 加载中的语言（防止重复加载）
const loadingLanguages = new Set();

// 异步加载语言文件
async function loadLanguage(langCode) {
    if (loadedLanguages[langCode] || loadingLanguages.has(langCode)) {
        return loadedLanguages[langCode];
    }

    if (langCode === 'en' || langCode === 'zh') {
        return loadedLanguages[langCode];
    }

    loadingLanguages.add(langCode);
    console.log('Loading language:', langCode);

    try {
        // 动态导入对应语言文件
        const module = await import(`./lang/${langCode}.js`);
        loadedLanguages[langCode] = module.default;
        console.log('Language loaded successfully:', langCode);
        return loadedLanguages[langCode];
    } catch (error) {
        console.warn(`Failed to load language ${langCode}, fallback to English:`, error);
        loadedLanguages[langCode] = loadedLanguages['en']; // 回退到英语
        return loadedLanguages[langCode];
    } finally {
        loadingLanguages.delete(langCode);
    }
}

// 翻译UI元素
function translateUI() {
    console.log('translateUI called, current language:', currentLanguage);
    
    // 翻译text content
    const i18nElements = document.querySelectorAll('[data-i18n]');
    console.log('Found elements with data-i18n:', i18nElements.length);
    
    i18nElements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translated = translate(key);
        element.textContent = translated;
    });
    
    // 翻译placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = translate(key);
    });
    
    // 触发语言变更事件
    const event = new CustomEvent('language-changed', {
        detail: { language: currentLanguage }
    });
    document.dispatchEvent(event);
}

// 获取翻译文本
function translate(key) {
    const lang = loadedLanguages[currentLanguage];
    if (lang && lang.translations && lang.translations[key]) {
        return lang.translations[key];
    }
    // 回退到英语
    if (loadedLanguages['en'] && loadedLanguages['en'].translations[key]) {
        return loadedLanguages['en'].translations[key];
    }
    return key; // 如果找不到翻译，返回key本身
}

// 改变语言
async function changeLanguage(langCode) {
    console.log('changeLanguage called with:', langCode);
    
    // 如果语言未加载，先加载
    if (!loadedLanguages[langCode]) {
        await loadLanguage(langCode);
    }

    if (loadedLanguages[langCode]) {
        console.log('Language found, changing to:', langCode);
        currentLanguage = langCode;
        document.documentElement.lang = langCode;
        document.documentElement.dir = loadedLanguages[langCode].rtl ? 'rtl' : 'ltr';

        // 保存语言设置
        localStorage.setItem('preferred_language', langCode);
        console.log('Language saved to localStorage:', langCode);
        
        // 更新UI
        console.log('Calling translateUI...');
        translateUI();

        // 更新语言选择器
        const langSelect = document.getElementById('language-selector');
        if (langSelect) {
            langSelect.value = langCode;
            console.log('Language selector updated to:', langCode);
        }
        
        // 派发自定义事件
        document.dispatchEvent(new CustomEvent('language-changed', { detail: { language: langCode } }));
    } else {
        console.error('Language not found:', langCode);
    }
}

// 获取当前语言
function getCurrentLanguage() {
    return currentLanguage;
}

// 语言选择器事件处理器
function handleLanguageChange(e) {
    console.log('Language change event triggered:', e.target.value);
    changeLanguage(e.target.value);
}

// 初始化语言系统
function initLanguage() {
    console.log('initLanguage called');
    
    // 获取保存的语言偏好
    const savedLang = localStorage.getItem('preferred_language');
    console.log('Saved language from localStorage:', savedLang);
    
    // 默认英语，除非用户明确保存了其他语言
    const initialLang = savedLang || 'en';
    console.log('Initial language selected:', initialLang);
    
    // 设置初始语言
    currentLanguage = initialLang;
    document.documentElement.lang = initialLang;
    
    // 设置语言选择器
    const langSelect = document.getElementById('language-selector');
    console.log('Language selector found:', !!langSelect);
    
    if (langSelect) {
        console.log('Existing options count:', langSelect.children.length);
        
        // 如果选项为空，创建选项
        if (langSelect.children.length === 0) {
            console.log('Creating language options...');
            Object.keys(AVAILABLE_LANGUAGES).forEach(langCode => {
                const langName = AVAILABLE_LANGUAGES[langCode];
                const option = document.createElement('option');
                option.value = langCode;
                option.textContent = langName;
                langSelect.appendChild(option);
                console.log('Added option:', langCode, '-', langName);
            });
        }
        
        // 设置当前选中的语言
        langSelect.value = currentLanguage;
        console.log('Set selector value to:', currentLanguage);
        
        // 绑定事件监听器
        langSelect.removeEventListener('change', handleLanguageChange);
        langSelect.addEventListener('change', handleLanguageChange);
        console.log('Event listener attached');
    } else {
        console.error('Language selector not found!');
    }
    
    // 如果需要加载非核心语言，异步加载
    if (initialLang !== 'en' && initialLang !== 'zh' && !loadedLanguages[initialLang]) {
        loadLanguage(initialLang).then(() => {
            translateUI();
        });
    } else {
        translateUI();
    }
    
    // 延迟再次翻译，确保DOM完全加载
    setTimeout(translateUI, 100);
}

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', initLanguage);

// 导出到全局对象
window.DROPSHARE_I18N = {
    changeLanguage: changeLanguage,
    translate: translate,
    init: initLanguage,
    getCurrentLanguage: getCurrentLanguage,
    loadLanguage: loadLanguage
};

console.log('Core language system loaded');