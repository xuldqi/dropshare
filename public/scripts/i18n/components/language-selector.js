/**
 * DropShare 语言选择器组件
 * 支持9种语言的切换界面
 */

class LanguageSelector {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            showFlags: true,
            showNativeNames: true,
            showEnglishNames: false,
            position: 'bottom-right',
            theme: 'light',
            ...options
        };
        
        this.isOpen = false;
        this.currentLanguage = 'en';
        this.supportedLanguages = {};
        
        this.init();
    }

    /**
     * 初始化语言选择器
     */
    async init() {
        if (!this.container) {
            console.error('❌ Language selector container not found');
            return;
        }

        // 等待I18N系统初始化
        if (!window.DropshareI18N) {
            console.error('❌ DropshareI18N not found');
            return;
        }

        // 获取支持的语言
        this.supportedLanguages = window.DropshareI18N.getSupportedLanguages();
        this.currentLanguage = window.DropshareI18N.getCurrentLanguage();

        // 创建选择器HTML
        this.createSelectorHTML();
        
        // 绑定事件
        this.bindEvents();
        
        // 监听语言变化
        window.DropshareI18N.addObserver((event, data) => {
            if (event === 'languageChanged') {
                this.updateCurrentLanguage(data.language);
            }
        });

        console.log('🌍 Language selector initialized');
    }

    /**
     * 创建选择器HTML结构
     */
    createSelectorHTML() {
        const currentLang = this.supportedLanguages[this.currentLanguage];
        
        this.container.innerHTML = `
            <div class="language-selector ${this.options.theme}">
                <button class="language-selector__trigger" aria-label="Select language">
                    <span class="language-selector__flag">${currentLang?.flag || '🌐'}</span>
                    <span class="language-selector__name">${this.getDisplayName(currentLang)}</span>
                    <span class="language-selector__arrow">▼</span>
                </button>
                
                <div class="language-selector__dropdown">
                    <div class="language-selector__list">
                        ${this.generateLanguageOptions()}
                    </div>
                </div>
            </div>
        `;

        // 添加样式
        this.addStyles();
    }

    /**
     * 生成语言选项HTML
     */
    generateLanguageOptions() {
        return Object.entries(this.supportedLanguages)
            .map(([code, lang]) => {
                const isActive = code === this.currentLanguage;
                const displayName = this.getDisplayName(lang);
                
                return `
                    <button class="language-selector__option ${isActive ? 'active' : ''}" 
                            data-lang="${code}" 
                            aria-label="Switch to ${lang.nativeName}">
                        <span class="language-selector__flag">${lang.flag}</span>
                        <span class="language-selector__name">${displayName}</span>
                        ${isActive ? '<span class="language-selector__check">✓</span>' : ''}
                    </button>
                `;
            })
            .join('');
    }

    /**
     * 获取显示名称
     */
    getDisplayName(lang) {
        if (this.options.showNativeNames) {
            return lang.nativeName;
        } else if (this.options.showEnglishNames) {
            return lang.name;
        } else {
            return lang.nativeName;
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        const trigger = this.container.querySelector('.language-selector__trigger');
        const dropdown = this.container.querySelector('.language-selector__dropdown');
        const options = this.container.querySelectorAll('.language-selector__option');

        // 触发按钮点击事件
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // 语言选项点击事件
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const langCode = option.getAttribute('data-lang');
                this.selectLanguage(langCode);
            });
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // 键盘导航
        this.container.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
    }

    /**
     * 切换下拉菜单
     */
    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    /**
     * 打开下拉菜单
     */
    openDropdown() {
        const dropdown = this.container.querySelector('.language-selector__dropdown');
        const trigger = this.container.querySelector('.language-selector__trigger');
        const arrow = this.container.querySelector('.language-selector__arrow');

        dropdown.style.display = 'block';
        dropdown.classList.add('open');
        trigger.classList.add('active');
        arrow.style.transform = 'rotate(180deg)';
        
        this.isOpen = true;

        // 添加动画
        setTimeout(() => {
            dropdown.style.opacity = '1';
            dropdown.style.transform = 'translateY(0)';
        }, 10);
    }

    /**
     * 关闭下拉菜单
     */
    closeDropdown() {
        const dropdown = this.container.querySelector('.language-selector__dropdown');
        const trigger = this.container.querySelector('.language-selector__trigger');
        const arrow = this.container.querySelector('.language-selector__arrow');

        dropdown.style.opacity = '0';
        dropdown.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            dropdown.style.display = 'none';
            dropdown.classList.remove('open');
            trigger.classList.remove('active');
            arrow.style.transform = 'rotate(0deg)';
            this.isOpen = false;
        }, 200);
    }

    /**
     * 选择语言
     */
    async selectLanguage(langCode) {
        if (langCode === this.currentLanguage) {
            this.closeDropdown();
            return;
        }

        // 显示加载状态
        this.showLoadingState();

        try {
            // 切换语言
            const success = await window.DropshareI18N.setLanguage(langCode);
            
            if (success) {
                this.currentLanguage = langCode;
                this.updateCurrentLanguage(langCode);
                this.closeDropdown();
                
                // 显示成功提示
                this.showSuccessMessage(langCode);
            } else {
                throw new Error('Failed to switch language');
            }
        } catch (error) {
            console.error('❌ Language switch failed:', error);
            this.showErrorMessage();
        } finally {
            this.hideLoadingState();
        }
    }

    /**
     * 更新当前语言显示
     */
    updateCurrentLanguage(langCode) {
        const currentLang = this.supportedLanguages[langCode];
        const trigger = this.container.querySelector('.language-selector__trigger');
        const flag = trigger.querySelector('.language-selector__flag');
        const name = trigger.querySelector('.language-selector__name');
        const options = this.container.querySelectorAll('.language-selector__option');

        // 更新触发按钮
        flag.textContent = currentLang?.flag || '🌐';
        name.textContent = this.getDisplayName(currentLang);

        // 更新选项状态
        options.forEach(option => {
            const optionLang = option.getAttribute('data-lang');
            const check = option.querySelector('.language-selector__check');
            
            if (optionLang === langCode) {
                option.classList.add('active');
                if (!check) {
                    option.insertAdjacentHTML('beforeend', '<span class="language-selector__check">✓</span>');
                }
            } else {
                option.classList.remove('active');
                if (check) {
                    check.remove();
                }
            }
        });
    }

    /**
     * 显示加载状态
     */
    showLoadingState() {
        const trigger = this.container.querySelector('.language-selector__trigger');
        trigger.classList.add('loading');
        trigger.disabled = true;
    }

    /**
     * 隐藏加载状态
     */
    hideLoadingState() {
        const trigger = this.container.querySelector('.language-selector__trigger');
        trigger.classList.remove('loading');
        trigger.disabled = false;
    }

    /**
     * 显示成功消息
     */
    showSuccessMessage(langCode) {
        const lang = this.supportedLanguages[langCode];
        this.showToast(`Language switched to ${lang.nativeName}`, 'success');
    }

    /**
     * 显示错误消息
     */
    showErrorMessage() {
        this.showToast('Failed to switch language', 'error');
    }

    /**
     * 显示提示消息
     */
    showToast(message, type = 'info') {
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `language-selector__toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => toast.classList.add('show'), 10);
        
        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * 处理键盘导航
     */
    handleKeyboardNavigation(e) {
        const options = Array.from(this.container.querySelectorAll('.language-selector__option'));
        const currentIndex = options.findIndex(option => option.classList.contains('active'));
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!this.isOpen) {
                    this.openDropdown();
                } else {
                    const nextIndex = (currentIndex + 1) % options.length;
                    this.focusOption(options[nextIndex]);
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (this.isOpen) {
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
                    this.focusOption(options[prevIndex]);
                }
                break;
                
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (this.isOpen) {
                    const focused = this.container.querySelector('.language-selector__option:focus');
                    if (focused) {
                        focused.click();
                    }
                } else {
                    this.openDropdown();
                }
                break;
                
            case 'Escape':
                this.closeDropdown();
                break;
        }
    }

    /**
     * 聚焦选项
     */
    focusOption(option) {
        this.container.querySelectorAll('.language-selector__option').forEach(opt => {
            opt.classList.remove('focused');
        });
        option.classList.add('focused');
        option.focus();
    }

    /**
     * 添加样式
     */
    addStyles() {
        if (document.getElementById('language-selector-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'language-selector-styles';
        style.textContent = `
            .language-selector {
                position: relative;
                display: inline-block;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .language-selector__trigger {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 14px;
                color: #333;
                backdrop-filter: blur(10px);
            }

            .language-selector__trigger:hover {
                background: rgba(255, 255, 255, 1);
                border-color: rgba(0, 0, 0, 0.2);
                transform: translateY(-1px);
            }

            .language-selector__trigger.active {
                background: rgba(255, 255, 255, 1);
                border-color: #3367d6;
                box-shadow: 0 0 0 3px rgba(51, 103, 214, 0.1);
            }

            .language-selector__trigger.loading {
                opacity: 0.7;
                cursor: not-allowed;
            }

            .language-selector__flag {
                font-size: 16px;
                line-height: 1;
            }

            .language-selector__name {
                font-weight: 500;
                white-space: nowrap;
            }

            .language-selector__arrow {
                font-size: 10px;
                transition: transform 0.2s ease;
                color: #666;
            }

            .language-selector__dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 4px;
                background: white;
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                backdrop-filter: blur(10px);
                opacity: 0;
                transform: translateY(-10px);
                transition: all 0.2s ease;
                z-index: 1000;
                min-width: 200px;
                display: none;
            }

            .language-selector__dropdown.open {
                display: block;
            }

            .language-selector__list {
                padding: 8px 0;
            }

            .language-selector__option {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 100%;
                padding: 10px 16px;
                background: none;
                border: none;
                cursor: pointer;
                transition: background-color 0.2s ease;
                font-size: 14px;
                color: #333;
                text-align: left;
            }

            .language-selector__option:hover {
                background: rgba(51, 103, 214, 0.05);
            }

            .language-selector__option.active {
                background: rgba(51, 103, 214, 0.1);
                color: #3367d6;
                font-weight: 500;
            }

            .language-selector__option.focused {
                background: rgba(51, 103, 214, 0.05);
                outline: 2px solid #3367d6;
                outline-offset: -2px;
            }

            .language-selector__check {
                margin-left: auto;
                color: #3367d6;
                font-weight: bold;
            }

            /* Dark theme */
            .language-selector.dark .language-selector__trigger {
                background: rgba(30, 30, 30, 0.9);
                border-color: rgba(255, 255, 255, 0.1);
                color: #fff;
            }

            .language-selector.dark .language-selector__trigger:hover {
                background: rgba(30, 30, 30, 1);
                border-color: rgba(255, 255, 255, 0.2);
            }

            .language-selector.dark .language-selector__dropdown {
                background: rgba(30, 30, 30, 0.95);
                border-color: rgba(255, 255, 255, 0.1);
            }

            .language-selector.dark .language-selector__option {
                color: #fff;
            }

            .language-selector.dark .language-selector__option:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .language-selector.dark .language-selector__option.active {
                background: rgba(51, 103, 214, 0.2);
            }

            /* Toast notifications */
            .language-selector__toast {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-size: 14px;
                font-weight: 500;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }

            .language-selector__toast.show {
                transform: translateX(0);
            }

            .language-selector__toast.success {
                background: #10b981;
            }

            .language-selector__toast.error {
                background: #ef4444;
            }

            .language-selector__toast.info {
                background: #3b82f6;
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .language-selector__name {
                    display: none;
                }
                
                .language-selector__dropdown {
                    right: -50px;
                    min-width: 180px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // 移除样式
        const style = document.getElementById('language-selector-styles');
        if (style) {
            style.remove();
        }
    }
}

// 导出到全局作用域
window.LanguageSelector = LanguageSelector;
