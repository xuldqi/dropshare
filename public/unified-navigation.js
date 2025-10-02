// Unified Navigation JavaScript - Handles hamburger menu and language selector interactions

// Initialize navigation functionality when DOM is loaded
function initializeNavigation() {
    // Navigation links active state
    const navLinks = document.querySelectorAll('.nav-links a');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href === currentPath || href.includes(currentPath.replace('.html', '')))) {
            link.classList.add('active');
        }
        
        // Add click handler for active state
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Mobile hamburger menu functionality
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNav = document.getElementById('mobileNavLinks');
    const menuBackdrop = document.getElementById('menuBackdrop');
    
    if (hamburgerBtn && mobileNav) {
        const closeMenu = () => {
            mobileNav.classList.remove('mobile-open');
            if (menuBackdrop) menuBackdrop.classList.remove('show');
            const langMenu = document.getElementById('langMenu');
            const langToggle = document.getElementById('langToggle');
            if (langMenu) langMenu.classList.remove('open');
            if (langToggle) langToggle.setAttribute('aria-expanded', 'false');
        };
        
        hamburgerBtn.addEventListener('click', () => {
            const willOpen = !mobileNav.classList.contains('mobile-open');
            mobileNav.classList.toggle('mobile-open');
            if (menuBackdrop) menuBackdrop.classList.toggle('show', willOpen);
            
            // Close language menu when opening hamburger menu
            if (willOpen) {
                const langMenu = document.getElementById('langMenu');
                if (langMenu) langMenu.classList.remove('open');
            }
        });
        
        if (menuBackdrop) menuBackdrop.addEventListener('click', closeMenu);
        
        // Close menu on route/hash changes
        window.addEventListener('hashchange', closeMenu);
        window.addEventListener('popstate', closeMenu);
        
        // Close menu when clicking navigation links
        navLinks.forEach(a => a.addEventListener('click', closeMenu));
        
        // Close menu when screen size changes to desktop
        const mql = window.matchMedia('(min-width: 769px)');
        mql.addEventListener('change', e => { if (e.matches) closeMenu(); });
    }

    // Language selector functionality
    const langSelect = document.getElementById('language-selector');
    const langToggle = document.getElementById('langToggle');
    const langMenu = document.getElementById('langMenu');
    
    if (langSelect && langToggle && langMenu) {
        const syncToggleLabel = () => {
            if (!langSelect) return;
            
            // If no option selected, try to set based on current language
            if (langSelect.selectedIndex < 0) {
                const currentLang = (window.DROPSHARE_I18N && window.DROPSHARE_I18N.getCurrentLanguage && window.DROPSHARE_I18N.getCurrentLanguage()) ||
                                  localStorage.getItem('preferred_language') || 'en';
                const matchingOption = Array.from(langSelect.options).find(o => o.value === currentLang);
                if (matchingOption) langSelect.value = currentLang;
            }
            
            const selectedOption = langSelect.options[langSelect.selectedIndex] || Array.from(langSelect.options)[0];
            const text = selectedOption ? selectedOption.textContent : 'Language';
            langToggle.textContent = text;
        };
        
        const buildMenu = () => {
            langMenu.innerHTML = '';
            Array.from(langSelect.options).forEach(option => {
                const item = document.createElement('div');
                item.className = 'lang-item';
                item.setAttribute('role', 'option');
                item.dataset.value = option.value;
                item.textContent = option.textContent;
                
                item.addEventListener('click', () => {
                    langSelect.value = option.value;
                    syncToggleLabel();
                    
                    // Trigger language change if i18n is available
                    if (window.DROPSHARE_I18N) {
                        window.DROPSHARE_I18N.setLanguage(option.value);
                        if (typeof translatePage === 'function') {
                            translatePage();
                        }
                    }
                    
                    langMenu.classList.remove('open');
                    langToggle.setAttribute('aria-expanded', 'false');
                });
                
                langMenu.appendChild(item);
            });
        };
        
        const updateSelectedState = () => {
            const items = langMenu.querySelectorAll('.lang-item');
            items.forEach(item => {
                item.classList.toggle('selected', item.dataset.value === langSelect.value);
            });
        };
        
        // Initialize language selector
        syncToggleLabel();
        buildMenu();
        updateSelectedState();
        
        // Toggle language menu
        langToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = langMenu.classList.contains('open');
            langMenu.classList.toggle('open');
            langToggle.setAttribute('aria-expanded', (!isOpen).toString());
            updateSelectedState();
            
            // Close hamburger menu if open
            if (!isOpen && mobileNav) {
                mobileNav.classList.remove('mobile-open');
                if (menuBackdrop) menuBackdrop.classList.remove('show');
            }
        });
        
        // Handle native select change (fallback)
        langSelect.addEventListener('change', () => {
            syncToggleLabel();
            updateSelectedState();
            
            if (window.DROPSHARE_I18N) {
                window.DROPSHARE_I18N.setLanguage(langSelect.value);
                if (typeof translatePage === 'function') {
                    translatePage();
                }
            }
        });
        
        // Close language menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!langToggle.contains(e.target) && !langMenu.contains(e.target)) {
                langMenu.classList.remove('open');
                langToggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Update when language changes externally
        window.addEventListener('languageChanged', () => {
            syncToggleLabel();
            updateSelectedState();
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavigation);
} else {
    initializeNavigation();
}

// Export for manual initialization if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initializeNavigation };
}