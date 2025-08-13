import translations from './i18n/pages/blog/index.js';

// Initialize translation functionality for the blog page
(function() {
    // Default to English if no language is set
    let currentLanguage = 'en';
    
    // Function to get the user's preferred language
    function getPreferredLanguage() {
        // First check localStorage for 'preferred_language' which is the primary key
        const storedLang = localStorage.getItem('preferred_language');
        if (storedLang && translations[storedLang]) {
            return storedLang;
        }
        
        // For backward compatibility, check old key
        const oldLang = localStorage.getItem('snapdrop-language');
        if (oldLang && translations[oldLang]) {
            // Migrate to new key
            localStorage.setItem('preferred_language', oldLang);
            return oldLang;
        }
        
        // Fallback to browser language
        const browserLang = navigator.language.split('-')[0];
        if (translations[browserLang]) {
            return browserLang;
        }
        
        // Default to English if no match
        return 'en';
    }
    
    // Function to translate the page
    function translatePage() {
        currentLanguage = getPreferredLanguage();
        const strings = translations[currentLanguage];
        
        // Update language selector if it exists
        const langSelector = document.getElementById('language-selector');
        if (langSelector && langSelector.value !== currentLanguage) {
            if (langSelector.querySelector(`option[value="${currentLanguage}"]`)) {
                langSelector.value = currentLanguage;
            }
        }
        
        // Set page title
        document.title = strings['blog_page_title'];
        
        // Set header
        document.querySelector('header h1').textContent = strings['blog_header_title'];
        
        // Set back button text
        document.querySelector('.back-button').textContent = strings['back_to_dropshare'];
        
        // Translate blog posts
        translateBlogPost(1, strings);
        translateBlogPost(2, strings);
        translateBlogPost(3, strings);
        
        // Set RTL direction for Arabic
        document.documentElement.setAttribute('dir', currentLanguage === 'ar' ? 'rtl' : 'ltr');
        
        // Update HTML's lang attribute
        document.documentElement.setAttribute('lang', currentLanguage);
    }
    
    // Helper function to translate a single blog post
    function translateBlogPost(postNumber, strings) {
        const articles = document.querySelectorAll('article.blog-card');
        if (articles.length >= postNumber) {
            const article = articles[postNumber - 1];
            
            // Translate date and category
            article.querySelector('.blog-date').textContent = strings[`blog_post${postNumber}_date`];
            article.querySelector('.blog-category').textContent = strings[`blog_post${postNumber}_category`];
            
            // Translate title
            article.querySelector('.blog-title').textContent = strings[`blog_post${postNumber}_title`];
            
            // Translate paragraphs
            const paragraphs = article.querySelectorAll('p');
            for (let i = 0; i < paragraphs.length; i++) {
                const key = `blog_post${postNumber}_paragraph${i + 1}`;
                if (strings[key]) {
                    paragraphs[i].textContent = strings[key];
                }
            }
            
            // Translate list items if they exist
            const listItems = article.querySelectorAll('li');
            if (listItems.length > 0) {
                for (let i = 0; i < listItems.length; i++) {
                    const key = `blog_post${postNumber}_item${i + 1}`;
                    if (strings[key]) {
                        listItems[i].innerHTML = strings[key];
                    }
                }
            }
        }
    }
    
    // Initialize the language selector
    function initLanguageSelector() {
        const langSelector = document.getElementById('language-selector');
        if (langSelector) {
            // Set initial value
            const savedLang = getPreferredLanguage();
            if (langSelector.querySelector(`option[value="${savedLang}"]`)) {
                langSelector.value = savedLang;
            }
            
            // Add event listener for language selection
            langSelector.addEventListener('change', function() {
                // Save selected language
                localStorage.setItem('preferred_language', this.value);
                
                // Update the UI with new language
                translatePage();
            });
        }
    }
    
    // Add event listener for language changes in localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'preferred_language') {
            translatePage();
        }
    });
    
    // Initialize page when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize language selector
        initLanguageSelector();
        
        // Translate the page
        translatePage();
    });
})(); 