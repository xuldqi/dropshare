// 为所有工具页面添加分享功能的集成脚本

// 1. 添加分享按钮到结果区域
function addShareButtons() {
    // 查找下载按钮，在旁边添加分享按钮
    const downloadButtons = document.querySelectorAll('button[onclick*="download"], a[download]');
    
    downloadButtons.forEach(button => {
        // 如果已经有分享按钮，跳过
        if (button.parentNode.querySelector('.share-button')) return;
        
        // 创建分享按钮
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
        
        // 添加点击事件
        shareButton.onclick = () => shareCurrentFile();
        
        // 插入到下载按钮后面
        button.parentNode.insertBefore(shareButton, button.nextSibling);
    });
}

// 2. 分享当前文件的函数
function shareCurrentFile() {
    // 尝试获取当前页面的处理结果
    const resultFile = getCurrentResultFile();
    
    if (resultFile) {
        // 如果有结果文件，显示设备选择器
        if (window.deviceSelector) {
            window.deviceSelector.show(resultFile);
        } else {
            // 备用方案：打开分享页面
            openSharePage(resultFile);
        }
    } else {
        // 如果没有结果文件，打开分享页面让用户上传
        window.open('/share.html', '_blank');
    }
}

// 3. 获取当前页面的结果文件
function getCurrentResultFile() {
    // 尝试从各种可能的位置获取结果文件
    
    // 方法1: 检查是否有下载链接
    const downloadLink = document.querySelector('a[download]');
    if (downloadLink && downloadLink.href && downloadLink.href.startsWith('blob:')) {
        return {
            url: downloadLink.href,
            name: downloadLink.download || 'processed-file',
            type: 'processed'
        };
    }
    
    // 方法2: 检查canvas结果
    const canvas = document.querySelector('canvas');
    if (canvas) {
        return {
            canvas: canvas,
            name: 'image-result.png',
            type: 'canvas'
        };
    }
    
    // 方法3: 检查结果图片
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

// 4. 打开分享页面并传递文件
function openSharePage(file) {
    // 将文件存储到sessionStorage，以便分享页面使用
    if (file.url) {
        sessionStorage.setItem('shareFile', JSON.stringify({
            url: file.url,
            name: file.name,
            type: file.type
        }));
    } else if (file.canvas) {
        // 将canvas转换为blob
        file.canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            sessionStorage.setItem('shareFile', JSON.stringify({
                url: url,
                name: file.name,
                type: 'canvas'
            }));
        });
    }
    
    // 打开分享页面
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
    
    // 检查是否已经有分享链接
    if (nav.querySelector('a[href*="share"]')) return;
    
    // 创建分享链接
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
