const CACHE_NAME = 'calc-pwa-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css'
];

// Install event: cache all static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event: clean up old caches if you update version numbers
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event: Serve from cache first, fallback to network
self.addEventListener('fetch', (event) => {
    // If the user clicks the force update button, we bypass cache for html requests
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached response if found, otherwise fetch from network
                if (cachedResponse) {
                    // Optionally fetch in background to update cache (stale-while-revalidate)
                    fetch(event.request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, networkResponse);
                            });
                        }
                    }).catch(() => {/* Ignore network errors when offline */});
                    
                    return cachedResponse;
                }
                return fetch(event.request);
            })
    );
});
