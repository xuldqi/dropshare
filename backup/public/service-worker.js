var CACHE_NAME = 'dropshare-cache-v1';
var urlsToCache = [
  'index.html',
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
  'images/android-chrome-512x512.png',
  'about.html',
  'faq.html',
  'privacy.html',
  'terms.html',
  'blog.html'
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
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request because it's a one-time use stream
        var fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response because it's a one-time use stream
            var responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(function(cache) {
                // Add the new resource to the cache
                cache.put(event.request, responseToCache);
              });
            
            return response;
          }
      );
    })
  );
});

// Handle messages from clients
self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
