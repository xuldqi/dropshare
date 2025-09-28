/* Simple SW focused on freshness for development/mobile adaptation rollout */
const VERSION = 'v20250905_1';

self.addEventListener('install', (event) => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of uncontrolled clients ASAP
  event.waitUntil(self.clients.claim());
});

// Network-first to always fetch latest resources during iteration
self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Bypass opaque cross-origin requests default handling
  event.respondWith(fetch(req, { cache: 'no-store' }).catch(() => caches.match(req)));
});

// Expose a message hook to force update from the page if needed
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Bump cache to invalidate old entries when deploying UI changes
var CACHE_NAME = 'dropshare-cache-v5';
var urlsToCache = [
  './',
  'styles.css',
  'scripts/network.js',
  'scripts/ui.js',
  'scripts/clipboard.js',
  'scripts/theme.js',
  'scripts/page-theme.js',
  'sounds/blop.mp3',
  'images/favicon-96x96.png',
  'images/apple-touch-icon.png',
  'images/android-chrome-192x192.png',
  'images/android-chrome-512x512.png'
  // Intentionally omit HTML files here; we will use a network-first strategy for them
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  
  var cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', function(event) {
  const req = event.request;

  // Only handle GET requests for caching. Let others (POST/PUT/DELETE etc.) pass-through.
  if (req.method !== 'GET') {
    event.respondWith(fetch(req));
    return;
  }

  const acceptHeader = req.headers.get('accept') || '';
  const isHTML = req.mode === 'navigate' || acceptHeader.includes('text/html');
  const isCSS = req.destination === 'style' || /\.css(\?|$)/.test(req.url);
  const isBypass = (() => {
    try {
      const u = new URL(req.url);
      const crossOrigin = u.origin !== self.location.origin;
      const heavyBinary = /ffmpeg-core\.(js|wasm)|pdf\.worker|tesseract|\.wasm(\?|$)/i.test(u.pathname);
      return crossOrigin || heavyBinary;
    } catch (e) {
      return true;
    }
  })();

  // Never cache cross-origin or heavy binary engines; use network directly.
  if (isBypass) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  // Network-first for HTML/CSS to ensure UI edits are visible immediately
  if (isHTML || isCSS) {
    event.respondWith(
      fetch(req).then(function(networkRes) {
        if (networkRes && networkRes.ok && networkRes.type === 'basic') {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(req, resClone).catch(() => {});
          });
        }
        return networkRes;
      }).catch(function() {
        return caches.match(req).then(function(cached) { return cached || caches.match('/'); });
      })
    );
    return;
  }

  // Cache-first for other GET requests
  event.respondWith(
    caches.match(req).then(function(res) {
      return res || fetch(req).then(function(networkRes) {
        if (networkRes && networkRes.ok && networkRes.type === 'basic') {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(req, resClone).catch(() => {});
          });
        }
        return networkRes;
      }).catch(function() {
        return caches.match(req);
      });
    })
  );
});

// Handle messages from clients
self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
