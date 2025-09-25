// 移动端按钮点击修复 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 移动端按钮修复脚本加载');
    
    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                    || window.innerWidth <= 768;
    
    if (isMobile) {
        console.log('📱 检测到移动设备，应用修复');
        
        // 修复所有按钮的点击事件
        function fixButtonClicks() {
            const buttons = document.querySelectorAll('.btn, .category-card');
            
            buttons.forEach(button => {
                // 移除可能阻止点击的属性
                button.style.pointerEvents = 'auto';
                button.style.touchAction = 'manipulation';
                
                // 添加触摸事件处理
                button.addEventListener('touchstart', function(e) {
                    this.style.transform = 'scale(0.98)';
                }, { passive: true });
                
                button.addEventListener('touchend', function(e) {
                    this.style.transform = 'scale(1)';
                    
                    // 如果是链接，强制跳转
                    if (this.tagName === 'A' && this.href) {
                        setTimeout(() => {
                            window.location.href = this.href;
                        }, 100);
                    }
                }, { passive: true });
                
                button.addEventListener('touchcancel', function(e) {
                    this.style.transform = 'scale(1)';
                }, { passive: true });
                
                // 确保点击事件可以触发
                button.addEventListener('click', function(e) {
                    console.log('🖱️ 按钮被点击:', this.textContent.trim());
                    
                    if (this.tagName === 'A' && this.href) {
                        // 阻止默认行为，手动跳转确保可靠性
                        e.preventDefault();
                        window.location.href = this.href;
                    }
                });
            });
            
            console.log(`✅ 修复了 ${buttons.length} 个按钮`);
        }
        
        // 立即执行修复
        fixButtonClicks();
        
        // 如果页面内容动态加载，延迟执行修复
        setTimeout(fixButtonClicks, 1000);
        
        // 添加调试信息
        console.log('🎯 移动端按钮修复完成');
        
        // 添加全局点击测试
        document.addEventListener('click', function(e) {
            if (e.target.matches('.btn, .category-card')) {
                console.log('🎉 成功点击:', e.target.textContent.trim());
            }
        });
    }
});

// 监听窗口大小变化，重新应用修复
window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) {
        setTimeout(() => {
            const buttons = document.querySelectorAll('.btn, .category-card');
            buttons.forEach(button => {
                button.style.pointerEvents = 'auto';
                button.style.touchAction = 'manipulation';
            });
        }, 100);
    }
});