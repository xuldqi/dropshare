// 性能优化脚本
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        // 预加载关键资源
        this.preloadCriticalResources();
        
        // 延迟加载非关键资源
        this.lazyLoadNonCriticalResources();
        
        // 优化图片加载
        this.optimizeImageLoading();
        
        // 监控性能指标
        this.monitorPerformance();
        
        // 优化字体加载
        this.optimizeFontLoading();
    }

    // 预加载关键资源
    preloadCriticalResources() {
        const criticalResources = [
            '/styles.css',
            '/scripts/network.js',
            '/scripts/ui.js'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }

    // 延迟加载非关键资源
    lazyLoadNonCriticalResources() {
        // 使用 Intersection Observer 延迟加载图片
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // 优化图片加载
    optimizeImageLoading() {
        // 为图片添加 loading="lazy" 属性
        document.querySelectorAll('img:not([loading])').forEach(img => {
            if (!img.classList.contains('critical')) {
                img.loading = 'lazy';
            }
        });

        // 使用现代图片格式
        this.useModernImageFormats();
    }

    // 使用现代图片格式
    useModernImageFormats() {
        const supportsWebP = this.checkWebPSupport();
        const supportsAVIF = this.checkAVIFSupport();

        document.querySelectorAll('img[data-webp]').forEach(img => {
            if (supportsWebP) {
                img.src = img.dataset.webp;
            }
        });

        document.querySelectorAll('img[data-avif]').forEach(img => {
            if (supportsAVIF) {
                img.src = img.dataset.avif;
            }
        });
    }

    // 检查WebP支持
    checkWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    // 检查AVIF支持
    checkAVIFSupport() {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
        });
    }

    // 优化字体加载
    optimizeFontLoading() {
        // 使用 font-display: swap
        const fontLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
        fontLinks.forEach(link => {
            link.setAttribute('crossorigin', 'anonymous');
        });

        // 监控字体加载
        if ('fonts' in document) {
            document.fonts.ready.then(() => {
                document.documentElement.classList.add('fonts-loaded');
            });
        }
    }

    // 监控性能指标
    monitorPerformance() {
        // 监控 Core Web Vitals
        this.monitorCoreWebVitals();
        
        // 监控资源加载时间
        this.monitorResourceTiming();
        
        // 监控用户交互
        this.monitorUserInteractions();
    }

    // 监控 Core Web Vitals
    monitorCoreWebVitals() {
        // LCP (Largest Contentful Paint)
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
                
                // 发送到分析服务
                this.sendMetric('LCP', lastEntry.startTime);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // FID (First Input Delay)
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                    this.sendMetric('FID', entry.processingStart - entry.startTime);
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // CLS (Cumulative Layout Shift)
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                console.log('CLS:', clsValue);
                this.sendMetric('CLS', clsValue);
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }

    // 监控资源加载时间
    monitorResourceTiming() {
        if ('PerformanceObserver' in window) {
            const resourceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.initiatorType === 'img' || entry.initiatorType === 'css' || entry.initiatorType === 'script') {
                        console.log(`${entry.name} loaded in ${entry.duration}ms`);
                    }
                });
            });
            resourceObserver.observe({ entryTypes: ['resource'] });
        }
    }

    // 监控用户交互
    monitorUserInteractions() {
        let interactionCount = 0;
        const interactionObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                interactionCount++;
                console.log(`Interaction ${interactionCount}:`, entry.duration);
            });
        });
        interactionObserver.observe({ entryTypes: ['interaction'] });
    }

    // 发送性能指标
    sendMetric(name, value) {
        // 这里可以发送到 Google Analytics 或其他分析服务
        if (window.gtag) {
            window.gtag('event', 'performance_metric', {
                metric_name: name,
                metric_value: value
            });
        }
    }

    // 优化滚动性能
    optimizeScrollPerformance() {
        // 使用 passive event listeners
        document.addEventListener('scroll', () => {}, { passive: true });
        document.addEventListener('touchstart', () => {}, { passive: true });
        document.addEventListener('touchmove', () => {}, { passive: true });
    }

    // 优化动画性能
    optimizeAnimationPerformance() {
        // 为动画元素添加 will-change 属性
        document.querySelectorAll('.animate, .transition').forEach(element => {
            element.style.willChange = 'transform, opacity';
        });
    }
}

// 页面加载完成后初始化性能优化
document.addEventListener('DOMContentLoaded', () => {
    new PerformanceOptimizer();
});

// 导出类供其他脚本使用
window.PerformanceOptimizer = PerformanceOptimizer;
