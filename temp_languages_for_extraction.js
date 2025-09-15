
        var window = {};
        var self = {}; // Mock self for service worker contexts
        var navigator = { language: 'en' };
        var localStorage = { getItem: () => null, setItem: () => {} };
        var document = { 
            querySelectorAll: () => [], 
            addEventListener: () => {},
            documentElement: {
                setAttribute: () => {},
                getAttribute: () => {}
            }
        };
        
        // Simple English-only language system for DropShare
const TEXTS = {
    // Basic functionality (kept for compatibility)
    'open_snapdrop': 'Open DropShare on other devices to send files',
    'click_to_send': 'Click to send files or right click to send a message',
    'tap_to_send': 'Tap to send files or long press to send a message',
    'file_received': 'File Received',
    'filename': 'Filename',
    'save': 'Save',
    'ignore': 'Ignore',
    'send_message': 'Send a Message',
    'send': 'Send',
    'cancel': 'Cancel',
    'message_received': 'Message Received',
    'copy': 'Copy',
    'close': 'Close',
    'file_transfer_completed': 'File Transfer Completed',
    'you_are_known_as': 'You are known as',
    
    // Navigation
    'nav_about': 'About',
    'nav_faq': 'FAQ',
    'nav_blog': 'Blog',
    'nav_privacy': 'Privacy',
    'nav_terms': 'Terms',
    
    // Homepage
    'hero_title': 'Fast Local File Sharing Across Devices on Your Network',
    'hero_subtitle': 'Share files instantly between devices on the same network without any uploads, downloads, or accounts required',
    'btn_start_sharing': 'Start Sharing Files',
    'btn_multiuser_rooms': 'Multi-user Rooms',
    'section_choose_category': 'Choose Your Tool Category',
    'section_choose_description': 'Select from our comprehensive collection of file processing tools, designed to handle all your digital file needs efficiently and securely',
    'category_image_title': 'Image Tools',
    'category_audio_title': 'Audio Tools',
    'category_document_title': 'Document Tools',
    'category_video_title': 'Video Tools',
    
    // Page headers
    'about_header_title': 'About DropShare',
    'faq_header_title': 'Frequently Asked Questions',
    'blog_header_title': 'Blog',
    'privacy_header_title': 'Privacy Policy',
    'terms_header_title': 'Terms of Service',
    
    // Common buttons
    'btn_download': 'Download',
    'btn_convert': 'Convert',
    'back_button': 'Back to DropShare',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'ok': 'OK'
};

// Simple text function (no language switching)
function getText(key) {
    return TEXTS[key] || key;
}

// Compatibility functions (do nothing now)
function changeLanguage(langCode) {
    console.log('Language switching disabled - English only');
}

function getCurrentLanguage() {
    return 'en';
}

function translateUI() {
    // Simple translation without language switching
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const text = getText(key);
        if (text !== key) {
            element.textContent = text;
        }
    });
}

// Export for compatibility
window.DROPSHARE_I18N = {
    changeLanguage: changeLanguage,
    translate: getText,
    getCurrentLanguage: getCurrentLanguage
};

// Auto-translate on load
document.addEventListener('DOMContentLoaded', translateUI);

        
        // Expose the variable for Node.js
        if (typeof module !== 'undefined') { module.exports = dictionaries; }
    