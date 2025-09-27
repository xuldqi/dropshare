// 快速创建按钮调试脚本
(function() {
    console.log('🔧 快速创建调试脚本加载');
    
    function debugQuickCreate() {
        console.log('=== 快速创建调试开始 ===');
        
        // 1. 检查按钮是否存在
        const quickBtn = document.getElementById('quickCreateRoomBtn');
        console.log('1. 快速创建按钮:', quickBtn);
        
        if (!quickBtn) {
            console.error('❌ 快速创建按钮不存在');
            return;
        }
        
        // 2. 检查按钮样式
        const computedStyle = window.getComputedStyle(quickBtn);
        console.log('2. 按钮样式:');
        console.log('   - display:', computedStyle.display);
        console.log('   - visibility:', computedStyle.visibility);
        console.log('   - pointer-events:', computedStyle.pointerEvents);
        console.log('   - z-index:', computedStyle.zIndex);
        console.log('   - position:', computedStyle.position);
        
        // 3. 检查onclick属性
        console.log('3. onclick属性:', quickBtn.onclick);
        console.log('4. onclick字符串:', quickBtn.getAttribute('onclick'));
        
        // 4. 检查handleQuickCreateRoom函数
        console.log('5. handleQuickCreateRoom函数:', typeof window.handleQuickCreateRoom);
        
        if (typeof window.handleQuickCreateRoom !== 'function') {
            console.error('❌ handleQuickCreateRoom函数不存在');
            return;
        }
        
        // 5. 检查网络对象
        console.log('6. window.network:', window.network);
        console.log('7. window.network.send:', window.network ? window.network.send : 'network对象不存在');
        
        // 6. 测试直接调用函数
        console.log('8. 测试直接调用handleQuickCreateRoom...');
        try {
            window.handleQuickCreateRoom();
            console.log('✅ 直接调用成功');
        } catch (error) {
            console.error('❌ 直接调用失败:', error);
        }
        
        // 7. 测试模拟点击
        console.log('9. 测试模拟点击...');
        try {
            quickBtn.click();
            console.log('✅ 模拟点击成功');
        } catch (error) {
            console.error('❌ 模拟点击失败:', error);
        }
        
        console.log('=== 快速创建调试结束 ===');
    }
    
    // 添加调试按钮到页面
    function addDebugButton() {
        const debugBtn = document.createElement('button');
        debugBtn.textContent = '🔧 调试快速创建';
        debugBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 9999;
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
        `;
        debugBtn.onclick = debugQuickCreate;
        document.body.appendChild(debugBtn);
        console.log('🔧 调试按钮已添加到页面');
    }
    
    // 监听按钮点击事件
    function addClickListener() {
        const quickBtn = document.getElementById('quickCreateRoomBtn');
        if (quickBtn) {
            quickBtn.addEventListener('click', function(e) {
                console.log('🖱️ 快速创建按钮被点击', e);
                console.log('   - 事件类型:', e.type);
                console.log('   - 目标元素:', e.target);
                console.log('   - 是否阻止默认行为:', e.defaultPrevented);
            }, true); // 使用捕获阶段
            
            console.log('✅ 快速创建按钮点击监听器已添加');
        } else {
            console.error('❌ 无法找到快速创建按钮来添加监听器');
        }
    }
    
    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                addDebugButton();
                addClickListener();
                console.log('🔧 快速创建调试脚本初始化完成');
            }, 1000);
        });
    } else {
        setTimeout(() => {
            addDebugButton();
            addClickListener();
            console.log('🔧 快速创建调试脚本初始化完成');
        }, 1000);
    }
})();