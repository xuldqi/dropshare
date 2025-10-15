// 统一传送集成加载器（原 remove-share-navigation 升级版）
// 该脚本在各工具页面中引用，用于确保设备分享组件已加载
(function ensureUnifiedTransferIntegration() {
    const SCRIPT_ID = 'unifiedTransferIntegrationScript';
    const SCRIPT_SRC = 'scripts/unified-transfer-integration.js?v=20241015';

    function loadTransferIntegration() {
        try {
            // 如果统一传送系统已就绪则无需重复加载
            if (window.DropShareTransfer && typeof window.DropShareTransfer.isReady === 'function') {
                return;
            }

            // 避免重复插入脚本
            if (document.getElementById(SCRIPT_ID)) {
                return;
            }

            const script = document.createElement('script');
            script.id = SCRIPT_ID;
            script.src = SCRIPT_SRC;
            script.async = true;
            script.dataset.loadedBy = 'remove-share-navigation.js';

            script.onload = () => {
                if (window.DropShareTransfer && window.DropShareTransfer.isReady) {
                    console.log('[DropShare] Unified transfer integration initialized.');
                }
            };

            script.onerror = (err) => {
                console.error('[DropShare] Failed to load unified transfer integration:', err);
            };

            document.head.appendChild(script);
        } catch (error) {
            console.error('[DropShare] Error while initializing unified transfer integration:', error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadTransferIntegration, { once: true });
    } else {
        loadTransferIntegration();
    }
})();
