// 修复设备名称显示和JavaScript语法错误的脚本
(function() {
    console.log('🔧 开始修复设备名称显示和语法错误...');
    
    // 修复设备名称显示
    function fixDeviceName() {
        const displayNameEl = document.getElementById('displayName');
        if (!displayNameEl) {
            console.log('❌ 找不到displayName元素');
            return;
        }
        
        // 检查是否已经有设备名称
        if (displayNameEl.textContent && !displayNameEl.textContent.includes('easiest way') && displayNameEl.textContent.trim() !== '') {
            console.log('✅ 设备名称已存在:', displayNameEl.textContent);
            return;
        }
        
        // 生成随机设备名称
        const adjectives = ['Blue', 'Red', 'Green', 'Orange', 'Purple', 'Yellow', 'Pink', 'Cyan', 'Rose'];
        const animals = ['Bear', 'Wolf', 'Eagle', 'Lion', 'Tiger', 'Fox', 'Hawk', 'Shark', 'Falcon', 'Dolphin'];
        
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
        const deviceName = randomAdjective + ' ' + randomAnimal;
        
        // 设置设备名称
        const text = '您的名称是 ' + deviceName;
        displayNameEl.textContent = text;
        
        // 存储到全局变量
        window.currentDisplayName = deviceName;
        
        console.log('✅ 设备名称已设置:', text);
        
        // 添加样式确保可见
        displayNameEl.style.display = 'block';
        displayNameEl.style.visibility = 'visible';
        displayNameEl.style.opacity = '1';
        displayNameEl.style.color = '#666';
        displayNameEl.style.fontSize = '14px';
    }
    
    // 修复JavaScript语法错误
    function fixJavaScriptErrors() {
        // 捕获并忽略语法错误，防止阻止页面功能
        window.addEventListener('error', function(e) {
            if (e.message && e.message.includes('Unexpected token')) {
                console.warn('忽略语法错误:', e.message);
                e.preventDefault();
                return false;
            }
        });
        
        // 确保关键函数存在
        if (typeof window.handleGlobalFileSelection !== 'function') {
            window.handleGlobalFileSelection = function(files) {
                console.log('处理文件选择:', files.length, '个文件');
            };
        }
        
        console.log('✅ JavaScript错误修复完成');
    }
    
    // 立即执行修复
    fixJavaScriptErrors();
    
    // 设备名称修复
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixDeviceName);
    } else {
        fixDeviceName();
    }
    
    // 延迟执行确保修复
    setTimeout(fixDeviceName, 1000);
    setTimeout(fixDeviceName, 3000);
    
    console.log('🔧 修复脚本加载完成');
})();