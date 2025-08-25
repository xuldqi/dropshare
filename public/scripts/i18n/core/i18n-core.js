/**
 * DropShare 多语言系统核心引擎
 * 纯前端实现，支持9种语言
 */

class DropshareI18N {
    constructor() {
        this.currentLanguage = 'en';
        this.fallbackLanguage = 'en';
        this.translations = {};
        this.translationCache = new Map();
        this.observers = [];
        this.isInitialized = false;
        
        // 支持的语言配置
        this.supportedLanguages = {
            en: {
                name: 'English',
                nativeName: 'English',
                flag: '🇺🇸',
                direction: 'ltr',
                dateFormat: 'MM/DD/YYYY',
                numberFormat: 'en-US'
            },
            'zh-cn': {
                name: 'Simplified Chinese',
                nativeName: '简体中文',
                flag: '🇨🇳',
                direction: 'ltr',
                dateFormat: 'YYYY/MM/DD',
                numberFormat: 'zh-CN'
            },
            'zh-tw': {
                name: 'Traditional Chinese',
                nativeName: '繁體中文',
                flag: '🇹🇼',
                direction: 'ltr',
                dateFormat: 'YYYY/MM/DD',
                numberFormat: 'zh-TW'
            },
            fr: {
                name: 'French',
                nativeName: 'Français',
                flag: '🇫🇷',
                direction: 'ltr',
                dateFormat: 'DD/MM/YYYY',
                numberFormat: 'fr-FR'
            },
            de: {
                name: 'German',
                nativeName: 'Deutsch',
                flag: '🇩🇪',
                direction: 'ltr',
                dateFormat: 'DD.MM.YYYY',
                numberFormat: 'de-DE'
            },
            es: {
                name: 'Spanish',
                nativeName: 'Español',
                flag: '🇪🇸',
                direction: 'ltr',
                dateFormat: 'DD/MM/YYYY',
                numberFormat: 'es-ES'
            },
            pt: {
                name: 'Portuguese',
                nativeName: 'Português',
                flag: '🇵🇹',
                direction: 'ltr',
                dateFormat: 'DD/MM/YYYY',
                numberFormat: 'pt-PT'
            },
            ja: {
                name: 'Japanese',
                nativeName: '日本語',
                flag: '🇯🇵',
                direction: 'ltr',
                dateFormat: 'YYYY/MM/DD',
                numberFormat: 'ja-JP'
            },
            ko: {
                name: 'Korean',
                nativeName: '한국어',
                flag: '🇰🇷',
                direction: 'ltr',
                dateFormat: 'YYYY/MM/DD',
                numberFormat: 'ko-KR'
            }
        };
    }

    /**
     * 初始化多语言系统
     */
    async init(options = {}) {
        if (this.isInitialized) return;

        const config = {
            defaultLanguage: 'en',
            fallbackLanguage: 'en',
            detectLanguage: true,
            ...options
        };

        this.fallbackLanguage = config.fallbackLanguage;
        
        // 检测用户语言
        if (config.detectLanguage) {
            this.currentLanguage = this.detectUserLanguage();
        } else {
            this.currentLanguage = config.defaultLanguage;
        }

        // 加载翻译文件
        await this.loadTranslations(this.currentLanguage);
        
        // 应用翻译到页面
        this.updatePageContent();
        
        // 设置文档语言属性
        document.documentElement.lang = this.currentLanguage;
        document.documentElement.dir = this.supportedLanguages[this.currentLanguage]?.direction || 'ltr';
        
        this.isInitialized = true;
        
        // 触发初始化完成事件
        this.notifyObservers('initialized', { language: this.currentLanguage });
        
        console.log(`🌍 I18N initialized with language: ${this.currentLanguage}`);
    }

    /**
     * 检测用户语言偏好
     */
    detectUserLanguage() {
        // 1. 检查localStorage中的用户偏好
        const savedLanguage = localStorage.getItem('dropshare-language');
        if (savedLanguage && this.supportedLanguages[savedLanguage]) {
            return savedLanguage;
        }

        // 2. 检查浏览器语言
        const browserLanguages = navigator.languages || [navigator.language];
        
        for (const lang of browserLanguages) {
            const langCode = lang.toLowerCase().split('-')[0];
            
            // 精确匹配
            if (this.supportedLanguages[lang]) {
                return lang;
            }
            
            // 模糊匹配
            for (const supportedLang of Object.keys(this.supportedLanguages)) {
                if (supportedLang.startsWith(langCode)) {
                    return supportedLang;
                }
            }
        }

        // 3. 默认语言
        return 'en';
    }

    /**
     * 加载翻译文件
     */
    async loadTranslations(language) {
        try {
            // 检查缓存
            if (this.translationCache.has(language)) {
                this.translations = this.translationCache.get(language);
                return;
            }

            // 加载翻译文件
            const response = await fetch(`/scripts/i18n/languages/${language}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${language}`);
            }

            const translations = await response.json();
            
            // 缓存翻译
            this.translationCache.set(language, translations);
            this.translations = translations;
            
            console.log(`📚 Loaded translations for ${language}`);
            
        } catch (error) {
            console.error(`❌ Failed to load translations for ${language}:`, error);
            
            // 回退到默认语言
            if (language !== this.fallbackLanguage) {
                await this.loadTranslations(this.fallbackLanguage);
            }
        }
    }

    /**
     * 翻译文本
     */
    t(key, params = {}) {
        if (!key) return '';
        
        // 获取翻译文本
        let text = this.getNestedValue(this.translations, key);
        
        // 如果翻译不存在，使用键名作为回退
        if (!text) {
            console.warn(`⚠️ Translation missing for key: ${key}`);
            text = key;
        }
        
        // 替换参数
        if (params && typeof params === 'object') {
            text = this.replaceParams(text, params);
        }
        
        return text;
    }

    /**
     * 获取嵌套对象的值
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    /**
     * 替换翻译中的参数
     */
    replaceParams(text, params) {
        return text.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    /**
     * 切换语言
     */
    async setLanguage(language) {
        if (!this.supportedLanguages[language]) {
            console.error(`❌ Unsupported language: ${language}`);
            return false;
        }

        if (this.currentLanguage === language) {
            return true;
        }

        try {
            // 加载新语言翻译
            await this.loadTranslations(language);
            
            const previousLanguage = this.currentLanguage;
            // 更新当前语言
            this.currentLanguage = language;
            
            // 保存用户偏好
            localStorage.setItem('dropshare-language', language);
            
            // 更新页面内容
            this.updatePageContent();
            
            // 更新文档属性
            document.documentElement.lang = language;
            document.documentElement.dir = this.supportedLanguages[language]?.direction || 'ltr';
            
            // 触发语言切换事件
            this.notifyObservers('languageChanged', { 
                language: language,
                previousLanguage
            });
            
            console.log(`🔄 Language switched to: ${language}`);
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to switch to language ${language}:`, error);
            return false;
        }
    }

    /**
     * 更新页面内容
     */
    updatePageContent() {
        // 更新所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const params = this.parseI18nParams(element);
            
            const translation = this.t(key, params);
            
            // 根据元素类型更新内容
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else if (element.hasAttribute('title')) {
                element.title = translation;
            } else {
                element.textContent = translation;
            }
        });

        // 更新动态内容
        this.updateDynamicContent();
    }

    /**
     * 解析 i18n 参数
     */
    parseI18nParams(element) {
        const paramsAttr = element.getAttribute('data-i18n-params');
        if (!paramsAttr) return {};
        
        try {
            return JSON.parse(paramsAttr);
        } catch (error) {
            console.error('❌ Invalid i18n params:', paramsAttr);
            return {};
        }
    }

    /**
     * 更新动态内容
     */
    updateDynamicContent() {
        // 更新动态生成的元素
        document.querySelectorAll('[data-i18n-dynamic]').forEach(element => {
            const key = element.getAttribute('data-i18n-dynamic');
            const translation = this.t(key);
            element.textContent = translation;
        });
    }

    /**
     * 获取当前语言
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * 获取支持的语言列表
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    /**
     * 添加观察者
     */
    addObserver(callback) {
        this.observers.push(callback);
    }

    /**
     * 移除观察者
     */
    removeObserver(callback) {
        const index = this.observers.indexOf(callback);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    /**
     * 通知观察者
     */
    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('❌ Observer error:', error);
            }
        });
    }

    /**
     * 格式化日期
     */
    formatDate(date, format = null) {
        const langConfig = this.supportedLanguages[this.currentLanguage];
        const dateFormat = format || langConfig?.dateFormat || 'MM/DD/YYYY';
        
        // 简单的日期格式化实现
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return dateFormat
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day);
    }

    /**
     * 格式化数字
     */
    formatNumber(number, options = {}) {
        const langConfig = this.supportedLanguages[this.currentLanguage];
        const locale = langConfig?.numberFormat || 'en-US';
        
        return new Intl.NumberFormat(locale, options).format(number);
    }
}

// 创建全局实例
window.DropshareI18N = new DropshareI18N();

// 导出到全局作用域
window.i18n = window.DropshareI18N;
