// Import the translation loader
import { loadPageTranslations, mergeTranslations } from './i18n/core/loader.js';

// Get base language from localStorage or default to English
// IMPORTANT: Use preferred_language as the primary key to match the main site
let currentLang = localStorage.getItem('preferred_language') || localStorage.getItem('snapdrop-language') || 'en';

// Initialize the terms page
async function initTermsPage() {
    // Set the language selector to the current language
    const langSelector = document.getElementById('language-selector');
    if (langSelector) {
        langSelector.value = currentLang;
        
        // Add event listener for language selector
        langSelector.addEventListener('change', async (e) => {
            const newLang = e.target.value;
            // IMPORTANT: Set preferred_language first - this is what the main site uses
            localStorage.setItem('preferred_language', newLang);
            
            currentLang = newLang;
            
            // Set RTL direction for Arabic
            document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
            
            // Update HTML's lang attribute
            document.documentElement.setAttribute('lang', newLang);
            
            // Reload translations and update UI
            await loadTranslations();
        });
    }
    
    // Load initial translations
    await loadTranslations();
}

// Load translations and apply them to the page
async function loadTranslations() {
    try {
        // Load translations for the terms page
        const translations = await loadPageTranslations('terms', currentLang);
        console.log("Loaded terms translations:", translations); // Debug
        
        // Apply translations to elements with data-i18n attributes
        if (translations) {
            // Update page title
            document.title = translations['terms_page_title'] || 'Terms of Service - DropShare';
            
            // Update header title
            const headerTitle = document.querySelector('header h1');
            if (headerTitle) {
                headerTitle.textContent = translations['terms_header_title'] || 'Terms of Service';
            }
            
            // Update last updated text
            const lastUpdated = document.querySelector('.last-updated');
            if (lastUpdated) {
                lastUpdated.textContent = translations['terms_last_updated'] ? 
                    `${translations['terms_last_updated']} ${translations['terms_last_updated_date'] || 'June 2023'}` : 
                    'Last Updated: June 2023';
            }
            
            // Update back button
            const backButton = document.querySelector('.back-button');
            if (backButton) {
                backButton.textContent = translations['back_to_dropshare'] || 'Back to DropShare';
            }
            
            // Update all section titles and content
            const sections = document.querySelectorAll('.terms-section');
            sections.forEach((section, index) => {
                // Get section number based on order (1-indexed)
                const sectionNumber = index + 1;
                
                // Get the title key 
                const titleKey = `terms_section${sectionNumber}_title`;
                
                // Update the title if translation exists
                const title = section.querySelector('h2');
                if (title && translations[titleKey]) {
                    title.textContent = translations[titleKey];
                }
                
                // Find all paragraphs and lists to translate
                const paragraphs = section.querySelectorAll('p');
                
                // If only one paragraph, try to use the content key
                if (paragraphs.length === 1 && translations[`terms_section${sectionNumber}_content`]) {
                    paragraphs[0].textContent = translations[`terms_section${sectionNumber}_content`];
                }
                // If there's an intro text specified
                else if (paragraphs.length > 0 && translations[`terms_section${sectionNumber}_intro`]) {
                    paragraphs[0].textContent = translations[`terms_section${sectionNumber}_intro`];
                    
                    // Handle remaining paragraphs
                    for (let i = 1; i < paragraphs.length; i++) {
                        const pKey = `terms_section${sectionNumber}_paragraph${i}`;
                        if (translations[pKey]) {
                            paragraphs[i].textContent = translations[pKey];
                        }
                    }
                }
                // Otherwise try individual paragraph keys
                else {
                    paragraphs.forEach((p, pIndex) => {
                        // Try specific paragraph key first
                        const pKey = `terms_section${sectionNumber}_paragraph${pIndex + 1}`;
                        if (translations[pKey]) {
                            p.textContent = translations[pKey];
                        } 
                    });
                }
                
                // Handle lists
                const lists = section.querySelectorAll('ol, ul');
                lists.forEach(list => {
                    const items = list.querySelectorAll('li');
                    items.forEach((item, itemIndex) => {
                        const itemKey = `terms_section${sectionNumber}_item${itemIndex + 1}`;
                        if (translations[itemKey]) {
                            item.textContent = translations[itemKey];
                        }
                    });
                });
            });
        }
    } catch (error) {
        console.error('Error loading translations:', error);
    }
}

// Initialize the page when the DOM is loaded
document.addEventListener('DOMContentLoaded', initTermsPage); 