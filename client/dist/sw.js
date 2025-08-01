// XPSwap Service Worker v3.0.0 - Force Update
const CACHE_NAME = "xpswap-v3-" + new Date().getTime();
const urlsToCache = [
  "/xpswap/",
  "/xpswap/index.html",
  "/xpswap/manifest.json",
];

// Install Service Worker
self.addEventListener("install", event => {
  console.log("Service Worker installing v3...");
  // Force immediate activation
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("Opened cache v3");
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests with network-first strategy
self.addEventListener("fetch", event => {
  // Skip caching for API calls
  if (event.request.url.includes("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Always try network first
  event.respondWith(
    fetch(event.request, {
      cache: "no-cache"
    })
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
self.addEventListener("activate", event => {
  console.log("Service Worker activating v3...");
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete ALL caches
          console.log("Deleting cache:", cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Force update on message
self.addEventListener("message", event => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});
