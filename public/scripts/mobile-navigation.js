/**
 * DropShare 移动端导航管理器
 */
class MobileNavigationManager {
    constructor() {
        this.isMobile = false;
        this.isMenuOpen = false;
        this.breakpoint = 768;
        this.init();
    }

    init() {
        this.createMobileElements();
        this.bindEvents();
        this.checkScreenSize();
        
        // 初始化时记录移动端访问
        if (this.isMobile && window.analyticsEnhanced) {
            window.analyticsEnhanced.trackEvent('mobile_visit', {
                screen_width: window.innerWidth,
                screen_height: window.innerHeight,
                user_agent: navigator.userAgent.substring(0, 100)
            });
        }
    }

    createMobileElements() {
        // 创建汉堡菜单按钮
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.id = 'mobile-menu-toggle';
        mobileToggle.setAttribute('aria-label', '打开导航菜单');
        mobileToggle.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;

        // 创建移动端导航菜单
        const mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-nav';
        mobileNav.id = 'mobile-nav';

        // 获取现有导航链接
        const desktopNavLinks = document.querySelector('.nav-links');
        const languageSelector = document.querySelector('#language-selector');
        
        if (desktopNavLinks) {
            const mobileNavLinks = document.createElement('div');
            mobileNavLinks.className = 'mobile-nav-links';
            
            // 复制导航链接到移动端菜单
            const links = desktopNavLinks.querySelectorAll('a');
            links.forEach(link => {
                const mobileLink = link.cloneNode(true);
                mobileLink.addEventListener('click', () => {
                    this.closeMobileMenu();
                    // 跟踪移动端导航点击
                    if (window.analyticsEnhanced) {
                        window.analyticsEnhanced.trackEvent('mobile_nav_click', {
                            link_text: mobileLink.textContent,
                            link_href: mobileLink.href
                        });
                    }
                });
                mobileNavLinks.appendChild(mobileLink);
            });
            
            mobileNav.appendChild(mobileNavLinks);
        }

        // 添加移动端语言选择器
        if (languageSelector) {
            const mobileLangSelector = document.createElement('div');
            mobileLangSelector.className = 'mobile-lang-selector';
            
            const langLabel = document.createElement('label');
            langLabel.textContent = '选择语言 / Language';
            langLabel.style.display = 'block';
            langLabel.style.marginBottom = '8px';
            langLabel.style.fontSize = '14px';
            langLabel.style.fontWeight = '500';
            langLabel.style.color = 'var(--gray-600)';
            
            const mobileSelect = languageSelector.cloneNode(true);
            mobileSelect.id = 'mobile-language-selector';
            
            // 同步语言选择
            mobileSelect.addEventListener('change', (e) => {
                languageSelector.value = e.target.value;
                languageSelector.dispatchEvent(new Event('change'));
                
                // 跟踪移动端语言切换
                if (window.analyticsEnhanced) {
                    window.analyticsEnhanced.trackEvent('mobile_language_change', {
                        from_language: languageSelector.dataset.previousValue || 'unknown',
                        to_language: e.target.value
                    });
                }
                
                languageSelector.dataset.previousValue = e.target.value;
                this.closeMobileMenu();
            });
            
            // 同步桌面端语言变化到移动端
            languageSelector.addEventListener('change', (e) => {
                mobileSelect.value = e.target.value;
            });
            
            mobileLangSelector.appendChild(langLabel);
            mobileLangSelector.appendChild(mobileSelect);
            mobileNav.appendChild(mobileLangSelector);
        }

        // 将元素添加到页面
        const headerControls = document.querySelector('.header-controls');
        if (headerControls) {
            headerControls.appendChild(mobileToggle);
        }

        document.body.appendChild(mobileNav);
    }

    bindEvents() {
        // 汉堡菜单点击事件
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileMenu();
            });
        }

        // 点击页面其他区域关闭菜单
        document.addEventListener('click', (e) => {
            const mobileNav = document.getElementById('mobile-nav');
            const mobileToggle = document.getElementById('mobile-menu-toggle');
            
            if (this.isMenuOpen && 
                !mobileNav.contains(e.target) && 
                !mobileToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // 窗口大小变化事件
        window.addEventListener('resize', () => {
            this.checkScreenSize();
            if (!this.isMobile && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // ESC键关闭菜单
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // 触摸事件优化
        let touchStartY = 0;
        const mobileNav = document.getElementById('mobile-nav');
        
        if (mobileNav) {
            mobileNav.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
            });

            mobileNav.addEventListener('touchmove', (e) => {
                const touchY = e.touches[0].clientY;
                const deltaY = touchY - touchStartY;
                
                // 如果向上滑动且已经滚动到顶部，阻止默认行为
                if (deltaY > 0 && mobileNav.scrollTop === 0) {
                    e.preventDefault();
                }
            });
        }
    }

    checkScreenSize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= this.breakpoint;
        
        // 如果从移动端切换到桌面端，记录事件
        if (wasMobile && !this.isMobile && window.analyticsEnhanced) {
            window.analyticsEnhanced.trackEvent('screen_size_change', {
                from: 'mobile',
                to: 'desktop',
                width: window.innerWidth,
                height: window.innerHeight
            });
        } else if (!wasMobile && this.isMobile && window.analyticsEnhanced) {
            window.analyticsEnhanced.trackEvent('screen_size_change', {
                from: 'desktop', 
                to: 'mobile',
                width: window.innerWidth,
                height: window.innerHeight
            });
        }
    }

    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        const mobileNav = document.getElementById('mobile-nav');
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        
        if (mobileNav && mobileToggle) {
            mobileNav.classList.add('active');
            mobileToggle.classList.add('active');
            mobileToggle.setAttribute('aria-label', '关闭导航菜单');
            
            // 防止页面滚动
            document.body.style.overflow = 'hidden';
            
            this.isMenuOpen = true;
            
            // 跟踪移动端菜单打开
            if (window.analyticsEnhanced) {
                window.analyticsEnhanced.trackEvent('mobile_menu_opened', {
                    timestamp: Date.now()
                });
            }
        }
    }

    closeMobileMenu() {
        const mobileNav = document.getElementById('mobile-nav');
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        
        if (mobileNav && mobileToggle) {
            mobileNav.classList.remove('active');
            mobileToggle.classList.remove('active');
            mobileToggle.setAttribute('aria-label', '打开导航菜单');
            
            // 恢复页面滚动
            document.body.style.overflow = '';
            
            this.isMenuOpen = false;
            
            // 跟踪移动端菜单关闭
            if (window.analyticsEnhanced) {
                window.analyticsEnhanced.trackEvent('mobile_menu_closed', {
                    timestamp: Date.now()
                });
            }
        }
    }

    // 获取移动端状态
    getStatus() {
        return {
            isMobile: this.isMobile,
            isMenuOpen: this.isMenuOpen,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight
        };
    }
}

// 移动端触摸优化
class MobileTouchOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeTouchTargets();
        this.addSwipeGestures();
        this.optimizeScrolling();
    }

    optimizeTouchTargets() {
        // 确保所有可点击元素有足够的触摸目标大小
        const clickableElements = document.querySelectorAll('button, a, .category-card, .tool-card');
        
        clickableElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.height < 44) { // 苹果推荐的最小触摸目标
                element.style.minHeight = '44px';
                element.style.display = 'flex';
                element.style.alignItems = 'center';
                element.style.justifyContent = 'center';
            }
        });
    }

    addSwipeGestures() {
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // 检测右滑手势（打开菜单）
            if (deltaX > 50 && Math.abs(deltaY) < 50 && startX < 50) {
                if (window.mobileNav && !window.mobileNav.isMenuOpen) {
                    window.mobileNav.openMobileMenu();
                    
                    if (window.analyticsEnhanced) {
                        window.analyticsEnhanced.trackEvent('mobile_swipe_menu_open', {
                            gesture: 'right_swipe'
                        });
                    }
                }
            }
            
            // 检测左滑手势（关闭菜单）
            if (deltaX < -50 && Math.abs(deltaY) < 50 && window.mobileNav?.isMenuOpen) {
                window.mobileNav.closeMobileMenu();
                
                if (window.analyticsEnhanced) {
                    window.analyticsEnhanced.trackEvent('mobile_swipe_menu_close', {
                        gesture: 'left_swipe'
                    });
                }
            }
        });
    }

    optimizeScrolling() {
        // 为iOS Safari优化滚动
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            document.body.style.webkitOverflowScrolling = 'touch';
            
            const scrollableElements = document.querySelectorAll('.mobile-nav');
            scrollableElements.forEach(element => {
                element.style.webkitOverflowScrolling = 'touch';
            });
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化移动端导航
    window.mobileNav = new MobileNavigationManager();
    
    // 初始化触摸优化（仅在移动设备上）
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        window.mobileTouchOptimizer = new MobileTouchOptimizer();
    }
    
    console.log('Mobile navigation initialized');
});

// 导出以供其他模块使用
window.MobileNavigationManager = MobileNavigationManager;
window.MobileTouchOptimizer = MobileTouchOptimizer;