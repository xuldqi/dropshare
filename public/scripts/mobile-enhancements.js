// 移动端体验增强模块
class MobileEnhancements {
    constructor() {
        this.isMobile = this.detectMobile();
        this.touchStartTime = 0;
        this.touchStartPos = { x: 0, y: 0 };
        this.swipeThreshold = 50;
        this.longPressThreshold = 500;
        
        // 高级手势支持
        this.pinchStartDistance = 0;
        this.pinchScale = 1;
        this.rotationStartAngle = 0;
        this.currentRotation = 0;
        this.isMultiTouch = false;
        
        // 性能优化
        this.lastFrameTime = 0;
        this.animationFrame = null;
        
        this.init();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }

    init() {
        if (!this.isMobile) return;
        
        this.setupViewportHeight();
        this.setupGestureHandlers();
        this.setupAdvancedGestures();
        this.setupHapticFeedback();
        this.optimizeForMobile();
        this.setupSwipeGestures();
        this.setupPullToRefresh();
        this.setupMobileKeyboard();
        this.setupAccessibilityFeatures();
        this.startPerformanceMonitoring();
        this.optimizeForBattery();
        
        // 显示手势提示（仅首次访问）
        this.showGestureHints();
    }

    setupViewportHeight() {
        // 视高回退和节流功能
        const setAppVhVar = () => {
            const vh = window.innerHeight;
            document.documentElement.style.setProperty('--app-vh', vh + 'px');
        };

        const throttle = (fn, wait = 100) => {
            let last = 0; 
            let timer;
            return (...args) => {
                const now = Date.now();
                if (now - last >= wait) { 
                    last = now; 
                    fn.apply(null, args); 
                } else { 
                    clearTimeout(timer); 
                    timer = setTimeout(() => { 
                        last = Date.now(); 
                        fn.apply(null, args); 
                    }, wait - (now - last)); 
                }
            };
        };

        // 初始设置
        setAppVhVar();

        // 节流处理窗口尺寸变化
        window.addEventListener('resize', throttle(setAppVhVar, 120));
        window.addEventListener('orientationchange', () => {
            // 延迟执行，等待浏览器完成方向改变
            setTimeout(setAppVhVar, 200);
        });

        // iOS Safari键盘弹出处理
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
            let initialHeight = window.innerHeight;
            
            window.addEventListener('resize', throttle(() => {
                const currentHeight = window.innerHeight;
                const heightDifference = initialHeight - currentHeight;
                
                // 键盘弹出（高度显著减少）
                if (heightDifference > 150) {
                    document.body.classList.add('keyboard-visible');
                    // 可以在这里调整UI布局
                } else {
                    document.body.classList.remove('keyboard-visible');
                }
            }, 50));
        }
    }

    setupGestureHandlers() {
        // 为所有peer元素添加增强的触摸处理
        document.addEventListener('DOMContentLoaded', () => {
            this.enhancePeerInteractions();
        });
        
        // 监听新peer的添加
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.tagName === 'X-PEER') {
                        this.enhancePeerInteraction(node);
                    }
                });
            });
        });
        
        const targetElement = document.querySelector('x-peers') || document.body;
        if (targetElement) {
            observer.observe(targetElement, {
                childList: true,
                subtree: true
            });
        }
    }

    enhancePeerInteractions() {
        document.querySelectorAll('x-peer').forEach(peer => {
            this.enhancePeerInteraction(peer);
        });
    }

    enhancePeerInteraction(peer) {
        let touchStartTime = 0;
        let touchStartPos = { x: 0, y: 0 };
        let longPressTimer = null;
        let isDragging = false;
        
        // 移除默认的触摸处理
        const existingHandlers = peer.cloneNode(true);
        
        peer.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            const touch = e.touches[0];
            touchStartPos = { x: touch.clientX, y: touch.clientY };
            isDragging = false;
            
            // 添加触摸反馈
            this.addTouchFeedback(peer);
            
            // 设置长按定时器
            longPressTimer = setTimeout(() => {
                if (!isDragging) {
                    this.handleLongPress(peer, e);
                }
            }, this.longPressThreshold);
            
            e.preventDefault();
        }, { passive: false });
        
        peer.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - touchStartPos.x);
            const deltaY = Math.abs(touch.clientY - touchStartPos.y);
            
            if (deltaX > 10 || deltaY > 10) {
                isDragging = true;
                clearTimeout(longPressTimer);
                this.removeTouchFeedback(peer);
            }
        });
        
        peer.addEventListener('touchend', (e) => {
            clearTimeout(longPressTimer);
            this.removeTouchFeedback(peer);
            
            const touchDuration = Date.now() - touchStartTime;
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartPos.x;
            const deltaY = touch.clientY - touchStartPos.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (!isDragging && touchDuration < this.longPressThreshold && distance < 10) {
                // 短按 - 触发文件选择
                this.handleTap(peer, e);
            }
            
            e.preventDefault();
        }, { passive: false });
        
        peer.addEventListener('touchcancel', () => {
            clearTimeout(longPressTimer);
            this.removeTouchFeedback(peer);
        });
    }

    addTouchFeedback(element) {
        element.classList.add('touch-active');
        this.triggerHapticFeedback('light');
    }

    removeTouchFeedback(element) {
        element.classList.remove('touch-active');
    }

    handleTap(peer, event) {
        // 触发文件选择
        const fileInput = peer.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.click();
        }
        this.triggerHapticFeedback('medium');
    }

    handleLongPress(peer, event) {
        // 长按触发文本发送
        Events.fire('text-recipient', peer.id);
        this.triggerHapticFeedback('heavy');
        
        // 显示长按提示
        this.showLongPressIndicator(peer);
    }

    showLongPressIndicator(peer) {
        const indicator = document.createElement('div');
        indicator.className = 'long-press-indicator';
        indicator.textContent = '发送消息';
        
        const rect = peer.getBoundingClientRect();
        indicator.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top - 40}px;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 1000;
            pointer-events: none;
            animation: fade-in-up 0.3s ease-out;
        `;
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.style.animation = 'fade-out 0.3s ease-out';
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.parentNode.removeChild(indicator);
                    }
                }, 300);
            }
        }, 2000);
    }

    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            
            // 检测水平滑动
            if (Math.abs(deltaX) > this.swipeThreshold && Math.abs(deltaY) < this.swipeThreshold) {
                if (deltaX > 0) {
                    this.handleSwipeRight();
                } else {
                    this.handleSwipeLeft();
                }
            }
            
            // 检测垂直滑动
            if (Math.abs(deltaY) > this.swipeThreshold && Math.abs(deltaX) < this.swipeThreshold) {
                if (deltaY > 0) {
                    this.handleSwipeDown();
                } else {
                    this.handleSwipeUp();
                }
            }
        });
    }

    handleSwipeRight() {
        // 右滑显示菜单
        const navLinks = document.getElementById('nav-links');
        if (navLinks) {
            navLinks.classList.add('show');
            this.triggerHapticFeedback('light');
        }
    }

    handleSwipeLeft() {
        // 左滑隐藏菜单
        const navLinks = document.getElementById('nav-links');
        if (navLinks) {
            navLinks.classList.remove('show');
            this.triggerHapticFeedback('light');
        }
    }

    handleSwipeDown() {
        // 下滑刷新
        this.refreshPeers();
    }

    handleSwipeUp() {
        // 上滑显示更多信息或设置
        // 可以在这里添加更多功能
    }

    setupPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let isPulling = false;
        let pullIndicator = null;
        
        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;
            
            currentY = e.touches[0].clientY;
            const pullDistance = currentY - startY;
            
            if (pullDistance > 0 && window.scrollY === 0) {
                e.preventDefault();
                
                if (!pullIndicator) {
                    pullIndicator = this.createPullIndicator();
                }
                
                const progress = Math.min(pullDistance / 100, 1);
                this.updatePullIndicator(pullIndicator, progress);
                
                if (pullDistance > 100) {
                    pullIndicator.classList.add('ready-to-refresh');
                }
            }
        }, { passive: false });
        
        document.addEventListener('touchend', () => {
            if (isPulling && pullIndicator) {
                const pullDistance = currentY - startY;
                
                if (pullDistance > 100) {
                    this.triggerRefresh(pullIndicator);
                } else {
                    this.hidePullIndicator(pullIndicator);
                }
                
                pullIndicator = null;
            }
            isPulling = false;
        });
    }

    createPullIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'pull-to-refresh-indicator';
        indicator.innerHTML = `
            <div class="pull-icon">↓</div>
            <div class="pull-text">下拉刷新</div>
        `;
        
        indicator.style.cssText = `
            position: fixed;
            top: -60px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(66, 133, 244, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 1000;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        document.body.appendChild(indicator);
        return indicator;
    }

    updatePullIndicator(indicator, progress) {
        const translateY = -60 + (progress * 80);
        indicator.style.transform = `translateX(-50%) translateY(${translateY}px)`;
        
        const icon = indicator.querySelector('.pull-icon');
        if (icon) {
            icon.style.transform = `rotate(${progress * 180}deg)`;
        }
        
        if (progress >= 1) {
            indicator.querySelector('.pull-text').textContent = '释放刷新';
        } else {
            indicator.querySelector('.pull-text').textContent = '下拉刷新';
        }
    }

    triggerRefresh(indicator) {
        indicator.querySelector('.pull-text').textContent = '刷新中...';
        indicator.querySelector('.pull-icon').style.animation = 'spin 1s linear infinite';
        
        this.triggerHapticFeedback('medium');
        
        // 执行刷新操作
        this.refreshPeers();
        
        setTimeout(() => {
            this.hidePullIndicator(indicator);
        }, 1500);
    }

    hidePullIndicator(indicator) {
        indicator.style.transform = 'translateX(-50%) translateY(-60px)';
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 300);
    }

    refreshPeers() {
        // 触发peer刷新
        if (window.serverConnection) {
            window.serverConnection.send({ type: 'refresh' });
        }
        
        // 显示刷新提示
        Events.fire('notify-user', '正在刷新设备列表...');
    }

    setupHapticFeedback() {
        // 检测设备支持的触觉反馈类型
        this.hapticSupport = {
            vibrate: 'vibrate' in navigator,
            gamepad: 'getGamepads' in navigator,
            webkit: 'webkitVibrate' in navigator
        };
    }

    triggerHapticFeedback(intensity = 'light') {
        const patterns = {
            light: [10],
            medium: [20],
            heavy: [30],
            success: [10, 50, 10],
            error: [100, 50, 100]
        };
        
        const pattern = patterns[intensity] || patterns.light;
        
        if (this.hapticSupport.vibrate) {
            navigator.vibrate(pattern);
        } else if (this.hapticSupport.webkit) {
            navigator.webkitVibrate(pattern);
        }
        
        // iOS Safari 特殊处理
        if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
            // 这里可以添加iOS特定的触觉反馈
        }
    }

    setupMobileKeyboard() {
        // 处理移动端键盘弹出时的布局调整
        let initialViewportHeight = window.innerHeight;
        
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDiff = initialViewportHeight - currentHeight;
            
            if (heightDiff > 150) {
                // 键盘可能已弹出
                document.body.classList.add('keyboard-open');
            } else {
                // 键盘可能已收起
                document.body.classList.remove('keyboard-open');
            }
        });
        
        // 处理输入框焦点
        document.addEventListener('focusin', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
    }

    optimizeForMobile() {
        // 确保document.body存在
        if (!document.body) {
            console.warn('Document body not available, skipping mobile optimization');
            return;
        }
        
        // 添加移动端特定的CSS类
        document.body.classList.add('mobile-enhanced');
        
        // 优化触摸目标大小
        this.optimizeTouchTargets();
        
        // 防止双击缩放
        this.preventDoubleClickZoom();
        
        // 优化滚动性能
        this.optimizeScrolling();
    }

    optimizeTouchTargets() {
        const style = document.createElement('style');
        style.textContent = `
            .mobile-enhanced x-peer {
                min-height: 44px;
                min-width: 44px;
                padding: 12px;
            }
            
            .mobile-enhanced .icon-button {
                min-height: 44px;
                min-width: 44px;
                padding: 10px;
            }
            
            .mobile-enhanced button {
                min-height: 44px;
                padding: 12px 16px;
            }
        `;
        document.head.appendChild(style);
    }

    preventDoubleClickZoom() {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }

    optimizeScrolling() {
        // 启用硬件加速滚动
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // 优化滚动性能
        const style = document.createElement('style');
        style.textContent = `
            .mobile-enhanced * {
                -webkit-transform: translateZ(0);
                transform: translateZ(0);
            }
        `;
        document.head.appendChild(style);
    }

    setupAdvancedGestures() {
        // 高级手势处理
        document.addEventListener('touchstart', this.handleAdvancedTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleAdvancedTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleAdvancedTouchEnd.bind(this), { passive: false });
    }

    handleAdvancedTouchStart(e) {
        if (e.touches.length === 2) {
            this.isMultiTouch = true;
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            
            // 计算初始距离（用于捏合缩放）
            this.pinchStartDistance = this.getDistance(touch1, touch2);
            
            // 计算初始角度（用于旋转）
            this.rotationStartAngle = this.getAngle(touch1, touch2);
            
            this.triggerHapticFeedback('light');
        }
    }

    handleAdvancedTouchMove(e) {
        if (!this.isMultiTouch || e.touches.length !== 2) return;
        
        e.preventDefault();
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        // 处理捏合缩放
        const currentDistance = this.getDistance(touch1, touch2);
        const scale = currentDistance / this.pinchStartDistance;
        
        // 处理旋转
        const currentAngle = this.getAngle(touch1, touch2);
        const rotation = currentAngle - this.rotationStartAngle;
        
        // 应用变换到目标元素
        this.applyGestureTransform(scale, rotation, touch1, touch2);
    }

    handleAdvancedTouchEnd(e) {
        if (e.touches.length < 2) {
            this.isMultiTouch = false;
            this.resetGestureState();
        }
    }

    getDistance(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getAngle(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.atan2(dy, dx) * 180 / Math.PI;
    }

    applyGestureTransform(scale, rotation, touch1, touch2) {
        // 获取中心点
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        // 查找目标元素
        const target = document.elementFromPoint(centerX, centerY);
        const peer = target?.closest('x-peer');
        
        if (peer && scale > 0.5 && scale < 3) {
            // 应用缩放和旋转变换
            const transform = `scale(${scale}) rotate(${rotation}deg)`;
            peer.style.transform = transform;
            peer.style.transformOrigin = 'center';
            
            // 添加视觉反馈
            peer.classList.add('gesture-active');
        }
    }

    resetGestureState() {
        // 重置所有手势状态
        document.querySelectorAll('.gesture-active').forEach(el => {
            el.classList.remove('gesture-active');
            el.style.transform = '';
            el.style.transformOrigin = '';
        });
        
        this.pinchScale = 1;
        this.currentRotation = 0;
    }

    setupAccessibilityFeatures() {
        // 无障碍功能增强
        this.setupVoiceOver();
        this.setupHighContrast();
        this.setupReducedMotion();
        this.setupFocusManagement();
    }

    setupVoiceOver() {
        // 为移动端屏幕阅读器优化
        document.querySelectorAll('x-peer').forEach(peer => {
            if (!peer.getAttribute('aria-label')) {
                const deviceName = peer.querySelector('.name')?.textContent || '未知设备';
                peer.setAttribute('aria-label', `连接到 ${deviceName}，双击发送文件，长按发送消息`);
                peer.setAttribute('role', 'button');
                peer.setAttribute('tabindex', '0');
            }
        });
    }

    setupHighContrast() {
        // 检测高对比度模式
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
        
        // 监听对比度偏好变化
        window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        });
    }

    setupReducedMotion() {
        // 检测减少动画偏好
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
        
        // 监听动画偏好变化
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('reduced-motion');
            } else {
                document.body.classList.remove('reduced-motion');
            }
        });
    }

    setupFocusManagement() {
        // 改进键盘导航和焦点管理
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
        
        // 为移动端添加焦点指示器
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-navigation *:focus {
                outline: 3px solid #4285f4;
                outline-offset: 2px;
            }
            
            .mobile-enhanced .keyboard-navigation x-peer:focus {
                transform: scale(1.05);
                transition: transform 0.2s ease;
            }
        `;
        document.head.appendChild(style);
    }

    // 性能监控和优化
    startPerformanceMonitoring() {
        if ('performance' in window && 'PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'measure' && entry.duration > 16) {
                        console.warn(`性能警告: ${entry.name} 耗时 ${entry.duration}ms`);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['measure', 'navigation'] });
        }
    }

    // 电池状态优化
    optimizeForBattery() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                const updateBatteryOptimization = () => {
                    if (battery.level < 0.2) {
                        // 低电量模式：减少动画和触觉反馈
                        document.body.classList.add('low-battery-mode');
                        this.hapticSupport.vibrate = false;
                    } else {
                        document.body.classList.remove('low-battery-mode');
                        this.hapticSupport.vibrate = 'vibrate' in navigator;
                    }
                };
                
                battery.addEventListener('levelchange', updateBatteryOptimization);
                updateBatteryOptimization();
            });
         }
     }

    // 手势提示功能
    showGestureHints() {
        // 检查是否是首次访问
        const hasSeenHints = localStorage.getItem('mobile-hints-shown');
        if (hasSeenHints) return;
        
        // 延迟显示提示，让用户先熟悉界面
        setTimeout(() => {
            this.showHint('双指捏合可以缩放设备卡片', 3000);
            
            setTimeout(() => {
                this.showHint('长按设备可以发送消息', 3000);
                
                setTimeout(() => {
                    this.showHint('下拉可以刷新设备列表', 3000);
                    localStorage.setItem('mobile-hints-shown', 'true');
                }, 4000);
            }, 4000);
        }, 2000);
    }
    
    showHint(message, duration = 3000) {
        const hint = document.createElement('div');
        hint.className = 'gesture-hint';
        hint.textContent = message;
        
        document.body.appendChild(hint);
        
        setTimeout(() => {
            if (hint.parentNode) {
                hint.parentNode.removeChild(hint);
            }
        }, duration);
    }
    
    // 手势教程模式
    startGestureTutorial() {
        const tutorial = [
            { gesture: 'tap', message: '点击设备发送文件' },
            { gesture: 'longpress', message: '长按设备发送消息' },
            { gesture: 'pinch', message: '双指捏合缩放设备' },
            { gesture: 'swipe', message: '左右滑动控制菜单' },
            { gesture: 'pulldown', message: '下拉刷新设备列表' }
        ];
        
        let currentStep = 0;
        
        const showNextStep = () => {
            if (currentStep >= tutorial.length) {
                this.showHint('教程完成！开始使用吧', 2000);
                return;
            }
            
            const step = tutorial[currentStep];
            this.showHint(step.message, 4000);
            currentStep++;
            
            setTimeout(showNextStep, 5000);
        };
        
        this.showHint('开始手势教程', 2000);
        setTimeout(showNextStep, 3000);
    }
    
    // 重置手势提示
    resetGestureHints() {
        localStorage.removeItem('mobile-hints-shown');
        this.showHint('手势提示已重置，刷新页面查看教程', 3000);
    }
}

// 初始化移动端增强功能
if (typeof window !== 'undefined') {
    window.mobileEnhancements = new MobileEnhancements();
}