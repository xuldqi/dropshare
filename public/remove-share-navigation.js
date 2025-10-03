// 从图片工具相关页面的导航中移除 Share/Transfer 入口（兜底）
(function removeShareInNavForToolPages() {
    try {
        const pathname = window.location.pathname || '';
        const page = pathname.split('/').pop();
        const isImagePage = /(^|\/)image-(?:[a-z0-9\-]+)\.html$/i.test(pathname) || page === 'image-tools.html';
        const isAudioPage = /(^|\/)audio-(?:[a-z0-9\-]+)\.html$/i.test(pathname) || page === 'audio-tools.html';
        const isVideoPage = /(^|\/)video-(?:[a-z0-9\-]+)\.html$/i.test(pathname) || page === 'video-tools.html';
        const isDocumentPage = /(^|\/)(?:pdf|document|text|subtitle|metadata|frame-rate|resolution)(?:-[a-z0-9\-]+)?\.html$/i.test(pathname) || page === 'document-tools.html';
        if (!(isImagePage || isAudioPage || isVideoPage || isDocumentPage)) return;

        const nav = document.querySelector('nav, .nav-links');
        if (!nav) return;

        // 移除 href 指向 share.html 或 transer.html 的链接，以及带 nav_transfer 的元素
        const links = nav.querySelectorAll('a');
        links.forEach(a => {
            const href = (a.getAttribute('href') || '').toLowerCase();
            const hasI18n = (a.getAttribute('data-i18n') || '') === 'nav_transfer';
            if (hasI18n || href.includes('share.html') || href.includes('transer.html')) {
                a.remove();
            }
        });
    } catch (e) {
        // 忽略
    }
})();


