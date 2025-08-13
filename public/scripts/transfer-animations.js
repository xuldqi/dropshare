// 传输动画增强模块
class TransferAnimations {
    constructor() {
        this.particleSystem = null;
        this.celebrationActive = false;
        this.init();
    }

    init() {
        // 监听传输事件
        Events.on('file-progress', e => this.onTransferProgress(e.detail));
        Events.on('file-received', e => this.onTransferComplete(e.detail));
        Events.on('transfer-complete', e => this.onTransferComplete(e.detail));
        
        // 初始化粒子系统
        this.initParticleSystem();
    }

    initParticleSystem() {
        // 创建粒子容器
        const particleContainer = document.createElement('div');
        particleContainer.id = 'transfer-particles';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
            overflow: hidden;
        `;
        document.body.appendChild(particleContainer);
    }

    onTransferProgress(progress) {
        const peerId = progress.sender || progress.recipient;
        const $peer = document.getElementById(peerId);
        if (!$peer) return;

        // 增强进度条动画
        this.enhanceProgressAnimation($peer, progress.progress);
        
        // 在传输过程中添加粒子效果
        if (progress.progress > 0 && progress.progress < 1) {
            this.createTransferParticles($peer, progress.progress);
        }
    }

    enhanceProgressAnimation($peer, progress) {
        const $progress = $peer.querySelector('.progress');
        const $icon = $peer.querySelector('x-icon');
        
        if (!$progress || !$icon) return;

        // 添加脉冲效果
        if (progress > 0 && progress < 1) {
            $icon.classList.add('transfer-pulse');
            $progress.classList.add('transfer-active');
            
            // 添加进度条发光效果
            const intensity = Math.sin(progress * Math.PI) * 0.5 + 0.5;
            $progress.style.setProperty('--glow-intensity', intensity);
        } else {
            $icon.classList.remove('transfer-pulse');
            $progress.classList.remove('transfer-active');
        }

        // 添加进度变化的缓动效果
        const degrees = `rotate(${360 * progress}deg)`;
        $progress.style.setProperty('--progress', degrees);
        
        // 进度条颜色渐变
        const hue = progress * 120; // 从红色(0)到绿色(120)
        $progress.style.setProperty('--progress-color', `hsl(${hue}, 70%, 50%)`);
    }

    createTransferParticles($peer, progress) {
        const rect = $peer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // 创建数据流粒子
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.createParticle(centerX, centerY, 'data');
            }, i * 100);
        }
    }

    createParticle(x, y, type = 'data') {
        const particle = document.createElement('div');
        particle.className = `transfer-particle ${type}`;
        
        const size = Math.random() * 6 + 4;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100 + 50;
        const duration = Math.random() * 1000 + 1500;
        
        particle.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background: ${this.getParticleColor(type)};
            border-radius: 50%;
            pointer-events: none;
            z-index: 1001;
            box-shadow: 0 0 ${size * 2}px ${this.getParticleColor(type)};
            animation: particle-float ${duration}ms ease-out forwards;
            --end-x: ${Math.cos(angle) * distance}px;
            --end-y: ${Math.sin(angle) * distance}px;
        `;
        
        document.getElementById('transfer-particles').appendChild(particle);
        
        // 移除粒子
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration);
    }

    getParticleColor(type) {
        const colors = {
            data: '#4285f4',
            success: '#34a853',
            celebration: '#fbbc04'
        };
        return colors[type] || colors.data;
    }

    onTransferComplete(data) {
        // 播放完成庆祝动画
        this.playCelebrationAnimation(data);
        
        // 触觉反馈（移动设备）
        this.triggerHapticFeedback();
        
        // 播放完成音效
        if (window.blop) {
            window.blop.play();
        }
    }

    playCelebrationAnimation(data) {
        if (this.celebrationActive) return;
        this.celebrationActive = true;
        
        // 创建庆祝粒子爆炸效果
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // 创建多个庆祝粒子
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createCelebrationParticle(centerX, centerY);
            }, i * 50);
        }
        
        // 屏幕闪烁效果
        this.createScreenFlash();
        
        // 重置庆祝状态
        setTimeout(() => {
            this.celebrationActive = false;
        }, 2000);
    }

    createCelebrationParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'celebration-particle';
        
        const size = Math.random() * 8 + 6;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 200 + 100;
        const duration = Math.random() * 1500 + 1000;
        
        const colors = ['#4285f4', '#34a853', '#fbbc04', '#ea4335', '#9c27b0'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 1002;
            box-shadow: 0 0 ${size * 3}px ${color};
            animation: celebration-burst ${duration}ms ease-out forwards;
            --end-x: ${Math.cos(angle) * distance}px;
            --end-y: ${Math.sin(angle) * distance}px;
        `;
        
        document.getElementById('transfer-particles').appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration);
    }

    createScreenFlash() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.3);
            pointer-events: none;
            z-index: 1003;
            animation: screen-flash 500ms ease-out;
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 500);
    }

    triggerHapticFeedback() {
        // 现代浏览器的触觉反馈
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
        
        // iOS Safari 的触觉反馈
        if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
            // 这里可以添加iOS特定的触觉反馈
        }
    }

    // 清理方法
    cleanup() {
        const particleContainer = document.getElementById('transfer-particles');
        if (particleContainer) {
            particleContainer.remove();
        }
    }
}

// 初始化传输动画系统
window.transferAnimations = new TransferAnimations();