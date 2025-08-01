// XPSwap Service Worker v2.0.0
const CACHE_NAME = 'xpswap-v2';
const urlsToCache = [
  '/xpswap/',
  '/xpswap/index.html',
  '/xpswap/manifest.json',
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker installing v2...');
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache v2');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests with network-first strategy
self.addEventListener('fetch', event => {
  // Skip caching for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Update Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker activating v2...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete all old caches
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});
