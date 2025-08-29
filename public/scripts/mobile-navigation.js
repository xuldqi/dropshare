// Mobile Navigation System
class MobileNavigation {
    constructor() {
        this.menuToggle = document.getElementById('mobile-menu-toggle');
        this.mobileNav = document.getElementById('mobile-nav');
        this.mobileLangSelector = document.getElementById('mobile-language-selector');
        this.isMenuOpen = false;
        
        this.init();
    }
    
    init() {
        // 绑定汉堡菜单点击事件
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleMenu());
        }
        
        // 绑定移动端语言选择器
        if (this.mobileLangSelector) {
            this.mobileLangSelector.addEventListener('change', (e) => {
                const language = e.target.value;
                this.changeLanguage(language);
            });
        }
        
        // 点击移动菜单外部关闭菜单
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && 
                !this.mobileNav.contains(e.target) && 
                !this.menuToggle.contains(e.target)) {
                this.closeMenu();
            }
        });
        
        // 点击移动菜单链接后关闭菜单
        if (this.mobileNav) {
            this.mobileNav.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    this.closeMenu();
                }
            });
        }
        
        // 初始化语言选择器状态
        this.updateLanguageSelector();
        
        // 监听语言变化
        if (window.DropshareI18N) {
            window.DropshareI18N.on('languageChanged', () => {
                this.updateLanguageSelector();
            });
        }
    }
    
    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        if (this.menuToggle && this.mobileNav) {
            this.menuToggle.classList.add('active');
            this.mobileNav.classList.add('active');
            this.isMenuOpen = true;
            document.body.style.overflow = 'hidden'; // 防止背景滚动
        }
    }
    
    closeMenu() {
        if (this.menuToggle && this.mobileNav) {
            this.menuToggle.classList.remove('active');
            this.mobileNav.classList.remove('active');
            this.isMenuOpen = false;
            document.body.style.overflow = ''; // 恢复滚动
        }
    }
    
    changeLanguage(language) {
        if (window.DropshareI18N) {
            window.DropshareI18N.setLanguage(language);
        }
    }
    
    updateLanguageSelector() {
        if (this.mobileLangSelector && window.DropshareI18N) {
            const currentLang = window.DropshareI18N.getCurrentLanguage();
            this.mobileLangSelector.value = currentLang;
        }
    }
}

// 页面加载完成后初始化移动端导航
document.addEventListener('DOMContentLoaded', () => {
    // 等待 i18n 系统加载完成
    const initMobileNav = () => {
        if (window.DropshareI18N) {
            new MobileNavigation();
        } else {
            // 如果 i18n 还没加载，延迟重试
            setTimeout(initMobileNav, 100);
        }
    };
    
    initMobileNav();
});

// 导出类供其他脚本使用
window.MobileNavigation = MobileNavigation;