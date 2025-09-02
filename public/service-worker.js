// Bump cache to invalidate old entries when deploying UI changes
var CACHE_NAME = 'dropshare-cache-v3';
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
  const acceptHeader = req.headers.get('accept') || '';
  const isHTML = req.mode === 'navigate' || acceptHeader.includes('text/html');
  const isCSS = req.destination === 'style' || /\.css(\?|$)/.test(req.url);

  // Network-first for HTML and CSS to ensure UI edits are visible immediately
  if (isHTML || isCSS) {
    event.respondWith(
      fetch(req).then(function(networkRes) {
        const resClone = networkRes.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(req, resClone); });
        return networkRes;
      }).catch(function() {
        return caches.match(req).then(function(cached) { return cached || caches.match('/'); });
      })
    );
    return;
  }

  // Default cache-first for other requests
  event.respondWith(
    caches.match(req).then(function(res) {
      return res || fetch(req).then(function(networkRes) {
        const resClone = networkRes.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(req, resClone); });
        return networkRes;
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
