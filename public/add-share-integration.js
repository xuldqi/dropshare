// 为所有工具页面添加分享功能的集成脚本

// 1. Add share button to result area
function addShareButtons() {
    // Find download buttons and add share buttons next to them
    const downloadButtons = document.querySelectorAll('button[onclick*="download"], a[download]');
    
    downloadButtons.forEach(button => {
        // If share button already exists, skip
        if (button.parentNode.querySelector('.share-button')) return;
        
        // Create share button
        const shareButton = document.createElement('button');
        shareButton.className = 'share-button';
        shareButton.innerHTML = '📤 Share to Device';
        shareButton.style.cssText = `
            margin-left: 10px;
            padding: 10px 20px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        `;
        
        shareButton.onmouseover = () => shareButton.style.background = '#059669';
        shareButton.onmouseout = () => shareButton.style.background = '#10b981';
        
        // Add click event
        shareButton.onclick = () => shareCurrentFile();
        
        // Insert after download button
        button.parentNode.insertBefore(shareButton, button.nextSibling);
    });
}

// 2. Function to share current file
function shareCurrentFile() {
    // Try to get the processing result from current page
    const resultFile = getCurrentResultFile();
    
    if (resultFile) {
        // If result file exists, show device selector
        if (window.deviceSelector) {
            window.deviceSelector.show(resultFile);
        } else {
            // Fallback: open share page
            openSharePage(resultFile);
        }
    } else {
        // If no result file, open share page for user upload
        window.open('/share.html', '_blank');
    }
}

// 3. Get result file from current page
function getCurrentResultFile() {
    // Try to get result file from various possible locations
    
    // Method 1: Check if there's a download link
    const downloadLink = document.querySelector('a[download]');
    if (downloadLink && downloadLink.href && downloadLink.href.startsWith('blob:')) {
        return {
            url: downloadLink.href,
            name: downloadLink.download || 'processed-file',
            type: 'processed'
        };
    }
    
    // Method 2: Check canvas result
    const canvas = document.querySelector('canvas');
    if (canvas) {
        return {
            canvas: canvas,
            name: 'image-result.png',
            type: 'canvas'
        };
    }
    
    // Method 3: Check result image
    const resultImg = document.querySelector('.result img, #resultImage');
    if (resultImg && resultImg.src && resultImg.src.startsWith('blob:')) {
        return {
            url: resultImg.src,
            name: 'image-result',
            type: 'image'
        };
    }
    
    return null;
}

// 4. Open share page and pass file
function openSharePage(file) {
    // Store file to sessionStorage for share page to use
    if (file.url) {
        sessionStorage.setItem('shareFile', JSON.stringify({
            url: file.url,
            name: file.name,
            type: file.type
        }));
    } else if (file.canvas) {
        // Convert canvas to blob
        file.canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            sessionStorage.setItem('shareFile', JSON.stringify({
                url: url,
                name: file.name,
                type: 'canvas'
            }));
        });
    }
    
    // Open share page
    window.open('/share.html?auto=true', '_blank');
}

// 5. 在主页添加分享入口
function addShareEntryToHomepage() {
    // 检查是否在主页
    if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') return;
    
    // 查找工具分类区域
    const toolsSection = document.querySelector('.tools-grid, .tool-categories');
    if (!toolsSection) return;
    
    // 创建分享工具卡片
    const shareCard = document.createElement('div');
    shareCard.className = 'tool-card share-card';
    shareCard.innerHTML = `
        <div class="tool-icon">📤</div>
        <h3>Device Sharing</h3>
        <p>Share files directly between devices on the same network</p>
    `;
    shareCard.style.cssText = `
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        cursor: pointer;
        transition: transform 0.3s;
    `;
    
    shareCard.onmouseover = () => shareCard.style.transform = 'scale(1.05)';
    shareCard.onmouseout = () => shareCard.style.transform = 'scale(1)';
    shareCard.onclick = () => window.open('/share.html', '_blank');
    
    // 插入到工具列表的第一个位置
    toolsSection.insertBefore(shareCard, toolsSection.firstChild);
}

// 6. 修改导航菜单，添加分享链接
function addShareToNavigation() {
    const nav = document.querySelector('nav, .nav-links');
    if (!nav) return;

    // 在以下页面禁用导航中的 Share 注入：
    // 1) 首页 index.html
    // 2) 图片工具相关页面 image-*.html 与 image-tools.html
    try {
        const pathname = window.location.pathname || '';
        const page = pathname.split('/').pop();
        const isHome = (page === 'index.html' || pathname === '/' || pathname === '');
        const isImagePage = /(^|\/)image-(?:[a-z0-9\-]+)\.html$/i.test(pathname) || page === 'image-tools.html';
        const isAudioPage = /(^|\/)audio-(?:[a-z0-9\-]+)\.html$/i.test(pathname) || page === 'audio-tools.html';
        const isVideoPage = /(^|\/)video-(?:[a-z0-9\-]+)\.html$/i.test(pathname) || page === 'video-tools.html';
        const isDocumentPage = /(^|\/)(?:pdf|document|text|subtitle|metadata|frame-rate|resolution)(?:-[a-z0-9\-]+)?\.html$/i.test(pathname) || page === 'document-tools.html';
        if (isHome || isImagePage || isAudioPage || isVideoPage || isDocumentPage) {
            return;
        }
    } catch (e) {
        // 忽略路径解析错误，默认继续（仅首页会被拦截）
    }
    
    // 检查是否已经有分享链接
    if (nav.querySelector('a[href*="share"]')) return;
    
    // 创建分享链接（非首页）
    const shareLink = document.createElement('a');
    shareLink.href = '/share.html';
    shareLink.textContent = 'Share';
    shareLink.style.cssText = `
        color: #10b981;
        text-decoration: none;
        font-weight: 500;
        margin: 0 15px;
    `;
    
    // 添加到导航菜单
    nav.appendChild(shareLink);
}

// 7. 初始化函数
function initShareIntegration() {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initShareIntegration);
        return;
    }
    
    console.log('🔗 初始化分享功能集成...');
    
    // 添加各种分享功能
    addShareToNavigation();
    addShareEntryToHomepage();
    
    // 延迟添加分享按钮，等待页面工具加载完成
    setTimeout(() => {
        addShareButtons();
        
        // 每5秒检查一次新的下载按钮
        setInterval(addShareButtons, 5000);
    }, 1000);
    
    console.log('✅ 分享功能集成完成');
}

// 8. 自动启动
initShareIntegration();

// 导出函数供其他脚本使用
window.DropShareIntegration = {
    addShareButtons,
    shareCurrentFile,
    addShareEntryToHomepage,
    addShareToNavigation
};
