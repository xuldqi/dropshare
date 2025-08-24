// Simplified i18n system
window.DROPSHARE_I18N = {
    init: function() {
        console.log('I18N system initialized');
    },
    t: function(key) {
        return key; // Return key as fallback
    }
};

console.log('Languages.js loaded');