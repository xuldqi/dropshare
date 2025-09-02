// FAQ page script to handle page-specific translations

// Import the translation loader
import { loadPageTranslations, mergeTranslations } from './i18n/core/loader.js';

// Get base language from localStorage or default to English
// IMPORTANT: Use preferred_language as the primary key to match the main site
let currentLang = localStorage.getItem('preferred_language') || localStorage.getItem('dropshare_language') || 'en';

// Initialize the FAQ page
async function initFaqPage() {
    // Set the language selector to the current language
    document.getElementById('language-selector').value = currentLang;
    
    // Add event listener for language selector
    document.getElementById('language-selector').addEventListener('change', async (e) => {
        const newLang = e.target.value;
        // IMPORTANT: Set preferred_language first - this is what the main site uses
        localStorage.setItem('preferred_language', newLang);
        // Also set dropshare_language for backward compatibility
        localStorage.setItem('dropshare_language', newLang);
        currentLang = newLang;
        
        // Set RTL direction for Arabic
        document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
        
        // Update HTML's lang attribute
        document.documentElement.setAttribute('lang', newLang);
        
        // Reload translations and update UI
        await loadTranslations();
    });
    
    // Add event listeners for FAQ category filtering
    const categories = document.querySelectorAll('.faq-category');
    categories.forEach(category => {
        category.addEventListener('click', () => {
            // Remove active class from all categories
            categories.forEach(c => c.classList.remove('active'));
            // Add active class to clicked category
            category.classList.add('active');
            
            // TODO: Add filtering functionality
        });
    });
    
    // Load initial translations
    await loadTranslations();
}

// Load translations for the FAQ page
async function loadTranslations() {
    try {
        // Load the FAQ page translations
        const translations = await loadPageTranslations('faq', currentLang);
        
        // Apply translations to the page
        translateUI(translations);
    } catch (error) {
        console.error('Error loading translations:', error);
    }
}

// Translate the UI with the provided translations
function translateUI(translations) {
    // Find all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    
    // Update each element's text content based on the translation key
    elements.forEach((element) => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });
    
    // Also update page title
    if (translations['faq_page_title']) {
        document.title = translations['faq_page_title'];
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initFaqPage); 