// 核心语言系统 - 传统JavaScript语法，兼容性更好
(function() {
    'use strict';
    
    // 核心语言定义
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
        },
        'zh-tw': {
            code: 'zh-tw',
            name: '中文繁體',
            rtl: false,
            translations: {
                'hero_title': '快速本地文件共享，連接您網路中的所有裝置',
                'hero_subtitle': '與附近裝置即時分享文件。無需設置，完全點對點傳輸。',
                'btn_start_sharing': '開始文件分享',
                'btn_multiuser_rooms': '多人房間',
                'nav_transfer': '傳送',
                'nav_rooms': '多人房間',
                'nav_images': '圖片',
                'nav_audio': '音頻',
                'nav_video': '視頻',
                'nav_files': '文件',
                'nav_about': '關於',
                'nav_faq': '常見問題',
                'nav_blog': '部落格',
                'nav_privacy': '隱私',
                'nav_terms': '條款',
                'section_choose_category': '選擇您的工具類別',
                'section_choose_description': '從我們按類別組織的綜合工具集合中選擇',
                'category_image_title': '圖像工具',
                'category_image_description': '編輯、轉換和最佳化圖像',
                'category_audio_title': '音頻工具',
                'category_audio_description': '在不同格式間轉換音頻',
                'category_document_title': '文件工具',
                'category_document_description': '轉換、合併、拆分和提取文字',
                'category_video_title': '視頻工具',
                'category_video_description': '在不同格式間轉換視頻',
                'tool_format_converter': '格式轉換器',
                'tool_image_cropper': '圖像裁剪器',
                'tool_background_remover': '背景移除器',
                'btn_view_tools': '查看工具 →',
                'popular_tools_title': '最受歡迎的工具',
                'popular_tools_description': '加入數千名信任我們工具的使用者',
                'btn_use_tool': '使用工具',
                'feature_free_title': '100% 免費',
                'feature_free_text': '所有工具完全免費使用，無隱藏費用或訂閱要求。',
                'feature_secure_title': '安全私密',
                'feature_secure_text': '您的檔案在本地安全處理。我們的伺服器不儲存任何資料。',
                'feature_fast_title': '快速便捷',
                'feature_fast_text': '無需註冊。只需上傳檔案，即可在幾秒鐘內獲得結果。',
                'you_are_known_as': '您的名稱是'
            }
        },
        'ja': {
            code: 'ja',
            name: '日本語',
            rtl: false,
            translations: {
                'hero_title': 'ネットワーク上のデバイス間で高速ローカルファイル共有',
                'hero_subtitle': '近くのデバイスとファイルを瞬時に共有。セットアップ不要、完全ピアツーピア。',
                'btn_start_sharing': 'ファイル共有を開始',
                'btn_multiuser_rooms': 'マルチユーザールーム',
                'nav_transfer': '転送',
                'nav_rooms': 'マルチユーザールーム',
                'nav_images': '画像',
                'nav_audio': '音声',
                'nav_video': '動画',
                'nav_files': 'ファイル',
                'nav_about': '概要',
                'nav_faq': 'よくある質問',
                'nav_blog': 'ブログ',
                'nav_privacy': 'プライバシー',
                'nav_terms': '利用規約',
                'section_choose_category': 'ツールカテゴリを選択',
                'section_choose_description': 'カテゴリ別に整理された包括的なツールコレクションから選択',
                'category_image_title': '画像ツール',
                'category_image_description': '画像の編集、変換、最適化',
                'category_audio_title': '音声ツール',
                'category_audio_description': '異なるフォーマット間で音声を変換',
                'category_document_title': '文書ツール',
                'category_document_description': '変換、結合、分割、テキスト抽出',
                'category_video_title': '動画ツール',
                'category_video_description': '異なるフォーマット間で動画を変換',
                'tool_format_converter': 'フォーマット変換器',
                'tool_image_cropper': '画像トリミング',
                'tool_background_remover': '背景削除',
                'btn_view_tools': 'ツールを見る →',
                'popular_tools_title': '人気のツール',
                'popular_tools_description': '私たちのツールを信頼する何千人ものユーザーに参加',
                'btn_use_tool': 'ツールを使用',
                'feature_free_title': '100% 無料',
                'feature_free_text': '隠れた料金やサブスクリプションなしで、すべてのツールを完全に無料で使用できます。',
                'feature_secure_title': '安全でプライベート',
                'feature_secure_text': 'ファイルはローカルで安全に処理されます。データはサーバーに保存されません。',
                'feature_fast_title': '高速で簡単',
                'feature_fast_text': '登録不要。ファイルをアップロードするだけで、数秒で結果を得られます。',
                'you_are_known_as': 'あなたの名前は'
            }
        }
    };

    // 可用语言列表
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

    // 已加载的语言缓存（包含核心语言）
    let loadedLanguages = Object.assign({}, CORE_LANGUAGES);

    console.log('Core language system initializing...');
    console.log('Available core languages:', Object.keys(loadedLanguages));

    // 翻译UI元素
    function translateUI() {
        console.log('translateUI called, current language:', currentLanguage);
        
        // 翻译text content
        const i18nElements = document.querySelectorAll('[data-i18n]');
        console.log('Found elements with data-i18n:', i18nElements.length);
        
        i18nElements.forEach(function(element) {
            const key = element.getAttribute('data-i18n');
            const translated = translate(key);
            console.log('Translating:', key, '->', translated);
            element.textContent = translated;
        });
        
        // 翻译placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function(element) {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = translate(key);
        });
        
        // 触发语言变更事件
        const event = new CustomEvent('language-changed', {
            detail: { language: currentLanguage }
        });
        document.dispatchEvent(event);
        console.log('Language changed event dispatched');
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
        console.warn('Translation not found for key:', key);
        return key; // 如果找不到翻译，返回key本身
    }

    // 改变语言
    function changeLanguage(langCode) {
        console.log('changeLanguage called with:', langCode);
        
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
            document.dispatchEvent(new CustomEvent('language-changed', { 
                detail: { language: langCode } 
            }));
        } else {
            console.warn('Language not available in core system:', langCode);
            console.log('Available languages:', Object.keys(loadedLanguages));
            // 对于未包含在核心系统中的语言，暂时回退到英语
            if (langCode !== 'en') {
                console.log('Falling back to English');
                changeLanguage('en');
            }
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
                Object.keys(AVAILABLE_LANGUAGES).forEach(function(langCode) {
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
        
        // 翻译UI
        console.log('Starting initial UI translation...');
        translateUI();
        
        // 延迟再次翻译，确保DOM完全加载
        setTimeout(translateUI, 100);
        console.log('Language initialization complete');
    }

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanguage);
    } else {
        // DOM already loaded
        setTimeout(initLanguage, 0);
    }

    // 导出到全局对象
    window.DROPSHARE_I18N = {
        changeLanguage: changeLanguage,
        translate: translate,
        init: initLanguage,
        getCurrentLanguage: getCurrentLanguage
    };

    console.log('Core language system loaded successfully');
    console.log('DROPSHARE_I18N exported to window:', typeof window.DROPSHARE_I18N);
})();