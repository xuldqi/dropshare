// Import the translation loader
import { loadPageTranslations, mergeTranslations } from './i18n/core/loader.js';

// Get base language from localStorage or default to English
// IMPORTANT: Use preferred_language as the primary key to match the main site
let currentLang = localStorage.getItem('preferred_language') || localStorage.getItem('snapdrop-language') || 'en';

// Initialize the privacy page
async function initPrivacyPage() {
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
        // Load translations for the privacy page
        const translations = await loadPageTranslations('privacy', currentLang);
        console.log("Loaded translations:", translations); // Debug
        
        // Apply translations to elements with data-i18n attributes
        if (translations) {
            // Update page title
            document.title = translations['privacy_page_title'] || 'Privacy Policy - DropShare';
            
            // Update header title
            const headerTitle = document.querySelector('header h1');
            if (headerTitle) {
                headerTitle.textContent = translations['privacy_header_title'] || 'Privacy Policy';
            }
            
            // Update last updated text
            const lastUpdated = document.querySelector('.last-updated');
            if (lastUpdated) {
                lastUpdated.textContent = translations['last_updated'] || 'Last Updated: June 2023';
            }
            
            // Update back button
            const backButton = document.querySelector('.back-button');
            if (backButton) {
                backButton.textContent = translations['back_to_dropshare'] || 'Back to DropShare';
            }
            
            // Update all section titles and content
            const sections = document.querySelectorAll('.policy-section');
            sections.forEach((section) => {
                const title = section.querySelector('h2');
                if (title) {
                    const titleText = title.textContent.trim();
                    
                    // Map section titles to translation keys
                    const sectionMap = {
                        'Introduction': 'introduction',
                        'Information We Collect': 'info_collect',
                        'How We Use Your Information': 'info_use',
                        'Cookies and Tracking Technologies': 'cookies',
                        'Third-Party Services': 'third_party',
                        'Data Security': 'data_security',
                        'Changes to This Privacy Policy': 'changes',
                        'Contact Us': 'contact'
                    };
                    
                    const sectionKey = sectionMap[titleText] || titleText.toLowerCase().replace(/\s+/g, '_');
                    
                    // Update section title
                    const titleKey = `${sectionKey}_title`;
                    if (translations[titleKey]) {
                        title.textContent = translations[titleKey];
                    }
                    
                    // Find all paragraphs to translate
                    const paragraphs = section.querySelectorAll('p');
                    
                    // Special case for sections with intro and content
                    if (paragraphs.length === 1 && translations[`${sectionKey}_content`]) {
                        paragraphs[0].textContent = translations[`${sectionKey}_content`];
                    } else if (paragraphs.length === 1 && translations[`${sectionKey}_intro`]) {
                        paragraphs[0].textContent = translations[`${sectionKey}_intro`];
                    } else if (paragraphs.length > 1) {
                        // First paragraph might be intro
                        if (translations[`${sectionKey}_intro`]) {
                            paragraphs[0].textContent = translations[`${sectionKey}_intro`];
                        }
                        
                        // Handle specific cases for sections with multiple paragraphs
                        if (sectionKey === 'third_party') {
                            if (translations['third_party_content1'] && paragraphs.length > 1) {
                                paragraphs[0].textContent = translations['third_party_content1'];
                            }
                            if (translations['third_party_content2'] && paragraphs.length > 1) {
                                // Handle the paragraph with a link
                                const linkElement = paragraphs[1].querySelector('a');
                                if (linkElement && translations['ads_settings_link_text']) {
                                    linkElement.textContent = translations['ads_settings_link_text'];
                                    // Replace the text but keep the link
                                    paragraphs[1].innerHTML = translations['third_party_content2'] + ' <a href="https://www.google.com/settings/ads" target="_blank">' + translations['ads_settings_link_text'] + '</a>.';
                                }
                            }
                        } else {
                            // Handle remaining paragraphs
                            for (let i = 1; i < paragraphs.length; i++) {
                                // Try different key patterns for additional paragraphs
                                const keys = [
                                    `${sectionKey}_content${i > 1 ? i : ''}`,
                                    `${sectionKey}_paragraph${i}`,
                                    `${sectionKey}_p${i}`
                                ];
                                
                                for (const key of keys) {
                                    if (translations[key]) {
                                        paragraphs[i].textContent = translations[key];
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    
                    // Handle lists
                    const lists = section.querySelectorAll('ul, ol');
                    lists.forEach((list) => {
                        const items = list.querySelectorAll('li');
                        items.forEach((item, itemIndex) => {
                            // Try key pattern for list items
                            const itemKey = `${sectionKey}_item${itemIndex + 1}`;
                            
                            if (translations[itemKey]) {
                                // If the item contains a strong tag, handle it properly
                                const strongTag = item.querySelector('strong');
                                if (strongTag) {
                                    const strongText = strongTag.textContent.trim();
                                    const strongKey = strongText.toLowerCase().replace(/[^a-z0-9]/g, '_');
                                    const titleKey = `${strongKey}_title` || `${sectionKey}_${strongKey}_title`;
                                    
                                    // Check if we have a translation for the strong tag
                                    if (translations[titleKey]) {
                                        strongTag.textContent = translations[titleKey];
                                    }
                                    
                                    // Update the content after the strong tag
                                    const contentKey = `${strongKey}_content` || `${sectionKey}_${strongKey}_content`;
                                    if (translations[contentKey]) {
                                        // Keep the strong tag but replace the rest
                                        const cleanItem = item.innerHTML.split('</strong>');
                                        if (cleanItem.length > 1) {
                                            item.innerHTML = cleanItem[0] + '</strong> ' + translations[contentKey];
                                        }
                                    } else {
                                        // If no specific content key, use the general item key
                                        // But preserve the strong tag structure
                                        const parts = translations[itemKey].split(':');
                                        if (parts.length > 1) {
                                            item.innerHTML = `<strong>${strongTag.textContent}</strong> ${parts[1].trim()}`;
                                        } else {
                                            item.textContent = translations[itemKey];
                                        }
                                    }
                                } else {
                                    // No strong tag, just update the text
                                    item.textContent = translations[itemKey];
                                }
                            }
                        });
                    });
                }
            });
            
            // Special fix for translations in the info-collect-list
            const infoCollectList = document.querySelector('.info-collect-list');
            if (infoCollectList && ['ja', 'es', 'pt', 'de', 'ru', 'zh', 'zh-tw'].includes(currentLang)) {
                const items = infoCollectList.querySelectorAll('li');
                if (items.length >= 3) {
                    // Use colon appropriate for the language
                    let colon = '：'; // Default colon for Asian languages
                    if (['es', 'pt', 'de', 'ru'].includes(currentLang)) {
                        colon = ': '; // Western languages use : with a space
                    }
                    
                    if (translations['device_info_title'] && translations['device_info_content']) {
                        items[0].innerHTML = `<strong>${translations['device_info_title']}</strong>${colon}${translations['device_info_content']}`;
                    }
                    if (translations['network_info_title'] && translations['network_info_content']) {
                        items[1].innerHTML = `<strong>${translations['network_info_title']}</strong>${colon}${translations['network_info_content']}`;
                    }
                    if (translations['files_messages_title'] && translations['files_messages_content']) {
                        items[2].innerHTML = `<strong>${translations['files_messages_title']}</strong>${colon}${translations['files_messages_content']}`;
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error loading translations:', error);
    }
}

// Initialize the page when the DOM is loaded
document.addEventListener('DOMContentLoaded', initPrivacyPage); 