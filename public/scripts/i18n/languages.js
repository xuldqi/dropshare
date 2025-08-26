// Compatibility shim. Do NOT override real i18n if already initialized.
(function(){
    if (window.DROPSHARE_I18N && typeof window.DROPSHARE_I18N.t === 'function') {
        return; // real i18n exists
    }

    window.DROPSHARE_I18N = {
        init: function() {
            // no-op; real init happens in scripts/i18n/init.js
        },
        t: function(key) {
            if (window.i18n && typeof window.i18n.t === 'function') {
                return window.i18n.t(key);
            }
            return key; // graceful fallback
        }
    };
})();

console.log('i18n compatibility shim loaded');