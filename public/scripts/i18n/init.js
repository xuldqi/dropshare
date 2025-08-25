/**
 * DropShare 多语言系统初始化脚本
 * 自动加载核心组件并初始化语言系统
 */

(function() {
    'use strict';

    // 等待DOM加载完成
    function initI18N() {
        // 检查是否已经初始化
        if (window.DropshareI18N && window.DropshareI18N.isInitialized) {
            console.log('🌍 I18N already initialized');
            return;
        }

        // 初始化多语言系统
        if (window.DropshareI18N) {
            window.DropshareI18N.init({
                defaultLanguage: 'en',
                fallbackLanguage: 'en',
                detectLanguage: true
            }).then(() => {
                console.log('🌍 I18N system initialized successfully');
                
                // 初始化语言选择器
                initLanguageSelector();
                
                // 触发初始化完成事件
                document.dispatchEvent(new CustomEvent('i18n:initialized', {
                    detail: { language: window.DropshareI18N.getCurrentLanguage() }
                }));
            }).catch(error => {
                console.error('❌ Failed to initialize I18N system:', error);
            });
        } else {
            console.error('❌ DropshareI18N not found');
        }
    }

    // 初始化语言选择器
    function initLanguageSelector() {
        // 查找语言选择器容器
        const selectorContainers = document.querySelectorAll('[data-i18n-selector]');
        
        selectorContainers.forEach(container => {
            try {
                if (window.LanguageSelector) {
                    new window.LanguageSelector(container, {
                        showFlags: true,
                        showNativeNames: true,
                        theme: 'light'
                    });
                }
            } catch (error) {
                console.error('❌ Failed to initialize language selector:', error);
            }
        });

        // 如果没有找到容器，尝试在header中创建
        if (selectorContainers.length === 0) {
            createDefaultLanguageSelector();
        }
    }

    // 创建默认语言选择器
    function createDefaultLanguageSelector() {
        const header = document.querySelector('header');
        if (!header) return;

        // 查找合适的位置插入语言选择器
        const headerControls = header.querySelector('.header-controls, .control-buttons, .nav-controls');
        
        if (headerControls) {
            const selectorContainer = document.createElement('div');
            selectorContainer.setAttribute('data-i18n-selector', '');
            selectorContainer.className = 'language-selector-container';
            
            headerControls.appendChild(selectorContainer);
            
            if (window.LanguageSelector) {
                new window.LanguageSelector(selectorContainer, {
                    showFlags: true,
                    showNativeNames: true,
                    theme: 'light'
                });
            }
        }
    }

    // 添加语言选择器样式
    function addLanguageSelectorStyles() {
        if (document.getElementById('i18n-init-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'i18n-init-styles';
        style.textContent = `
            .language-selector-container {
                display: flex;
                align-items: center;
                margin-left: 16px;
            }

            /* 确保语言选择器在移动端也能正常显示 */
            @media (max-width: 768px) {
                .language-selector-container {
                    margin-left: 8px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // 监听语言变化事件
    function setupEventListeners() {
        // 监听语言切换事件
        if (window.DropshareI18N) {
            window.DropshareI18N.addObserver((event, data) => {
                if (event === 'languageChanged') {
                    // 触发自定义事件
                    document.dispatchEvent(new CustomEvent('language-changed', {
                        detail: {
                            language: data.language,
                            previousLanguage: data.previousLanguage
                        }
                    }));

                    // 更新页面标题和meta标签
                    updatePageMeta(data.language);
                }
            });
        }
    }

    // 更新页面meta信息
    function updatePageMeta(language) {
        const lang = window.DropshareI18N?.supportedLanguages[language];
        if (!lang) return;

        // 更新html lang属性
        document.documentElement.lang = language;
        document.documentElement.dir = lang.direction || 'ltr';

        // 更新页面标题（如果有翻译）
        const titleKey = 'meta.page_title';
        const title = window.DropshareI18N.t(titleKey);
        if (title && title !== titleKey) {
            document.title = title;
        }

        // 更新meta description（如果有翻译）
        const descKey = 'meta.page_description';
        const description = window.DropshareI18N.t(descKey);
        if (description && description !== descKey) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.content = description;
            }
        }
    }

    // 添加工具函数到全局作用域
    window.i18nUtils = {
        // 获取当前语言
        getCurrentLanguage: () => {
            return window.DropshareI18N?.getCurrentLanguage() || 'en';
        },

        // 切换语言
        setLanguage: async (language) => {
            if (window.DropshareI18N) {
                return await window.DropshareI18N.setLanguage(language);
            }
            return false;
        },

        // 翻译文本
        t: (key, params) => {
            if (window.DropshareI18N) {
                return window.DropshareI18N.t(key, params);
            }
            return key;
        },

        // 获取支持的语言列表
        getSupportedLanguages: () => {
            return window.DropshareI18N?.getSupportedLanguages() || {};
        },

        // 格式化日期
        formatDate: (date, format) => {
            if (window.DropshareI18N) {
                return window.DropshareI18N.formatDate(date, format);
            }
            return date.toLocaleDateString();
        },

        // 格式化数字
        formatNumber: (number, options) => {
            if (window.DropshareI18N) {
                return window.DropshareI18N.formatNumber(number, options);
            }
            return number.toLocaleString();
        }
    };

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            addLanguageSelectorStyles();
            setupEventListeners();
            initI18N();
        });
    } else {
        // DOM已经加载完成
        addLanguageSelectorStyles();
        setupEventListeners();
        initI18N();
    }

    // 监听页面可见性变化，重新初始化（用于SPA应用）
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && window.DropshareI18N && !window.DropshareI18N.isInitialized) {
            setTimeout(initI18N, 100);
        }
    });

    console.log('🌍 I18N initialization script loaded');
})();
