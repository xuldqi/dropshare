const CACHE_NAME = 'dropshare-cache-v3';
const STATIC_CACHE = 'dropshare-static-v3';
const DYNAMIC_CACHE = 'dropshare-dynamic-v3';

// 需要缓存的静态资源
const STATIC_URLS = [
    '/',
    '/index.html',
    '/share.html',
    '/audio-tools.html',
    '/video-tools.html',
    '/image-tools.html',
    '/document-tools.html',
    '/styles.css',
    '/styles/mobile-responsive.css',
    '/scripts/network.js',
    '/scripts/ui.js',
    '/scripts/mobile-navigation.js',
    '/scripts/i18n/core/i18n-core.js',
    '/scripts/i18n/components/language-selector.js',
    '/scripts/i18n/init.js',
    '/scripts/i18n/seo-config.js',
    '/scripts/structured-data.js',
    '/manifest.json',
    '/images/favicon-96x96.png',
    '/images/apple-touch-icon.png',
    '/images/android-chrome-192x192.png',
    '/images/android-chrome-512x512.png'
];

// 动态缓存的资源类型
const DYNAMIC_CACHE_PATTERNS = [
    /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/,
    /^https:\/\/dropshare\.tech\//
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_URLS);
            })
            .then(() => {
                console.log('Service Worker: Static files cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Error caching static files:', error);
            })
    );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// 获取事件 - 网络优先，缓存备用
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // 跳过非GET请求
    if (request.method !== 'GET') {
        return;
    }

    // 跳过Chrome扩展请求
    if (url.protocol === 'chrome-extension:') {
        return;
    }

    // 跳过Firebase Analytics请求
    if (url.hostname.includes('firebase') || url.hostname.includes('google-analytics')) {
        return;
    }

    event.respondWith(
        fetch(request)
            .then(response => {
                // 检查响应是否有效
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // 克隆响应
                const responseToCache = response.clone();

                // 判断是否应该缓存
                if (shouldCache(request)) {
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => {
                            cache.put(request, responseToCache);
                        })
                        .catch(error => {
                            console.error('Service Worker: Error caching response:', error);
                        });
                }

                return response;
            })
            .catch(() => {
                // 网络失败时从缓存获取
                return caches.match(request)
                    .then(response => {
                        if (response) {
                            return response;
                        }

                        // 如果是HTML页面，返回离线页面
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }

                        return new Response('Network error', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// 判断是否应该缓存请求
function shouldCache(request) {
    const url = new URL(request.url);
    
    // 只缓存同源请求
    if (url.origin !== location.origin) {
        return false;
    }

    // 检查是否匹配动态缓存模式
    return DYNAMIC_CACHE_PATTERNS.some(pattern => {
        if (pattern instanceof RegExp) {
            return pattern.test(request.url);
        }
        return request.url.includes(pattern);
    });
}

// 消息处理
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// 推送通知处理
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'DropShare notification',
            icon: '/images/favicon-96x96.png',
            badge: '/images/favicon-96x96.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Open DropShare',
                    icon: '/images/favicon-96x96.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/images/favicon-96x96.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'DropShare', options)
        );
    }
});

// 通知点击处理
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
