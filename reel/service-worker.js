const CACHE_NAME = 'reel-generator-v1';
const STATIC_ASSETS = [
    'index.html',
    'manifest.json',
    '../icon-192.png',
    '../icon-512.png'
];

const CDNS = [
    'https://fonts.googleapis.com',
    'https://docs.opencv.org',
    'https://cdn.jsdelivr.net',
    'https://cdnjs.cloudflare.com',
    'https://wavesurfer-js.org',
    'https://ffmpeg.wasm.io'
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS).catch(err => {
                console.warn('[SW] Some static assets failed to cache:', err);
                // Don't fail installation if some assets fail
                return Promise.resolve();
            });
        })
    );
    self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event - Network-first for dynamic content, cache-first for static
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle API requests (network-first)
    if (url.pathname.includes('/api/')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const cache = caches.open(CACHE_NAME);
                        cache.then(c => c.put(request, response.clone()));
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(request).then(response => {
                        return response || new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
                })
        );
        return;
    }

    // Handle CDN resources (cache-first with network fallback)
    const isCDN = CDNS.some(cdn => url.href.startsWith(cdn));
    if (isCDN) {
        event.respondWith(
            caches.match(request).then(response => {
                if (response) {
                    return response;
                }
                return fetch(request).then(response => {
                    if (!response || response.status !== 200) {
                        return response;
                    }
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    return response;
                }).catch(() => {
                    console.warn('[SW] Failed to fetch:', url.href);
                    return new Response('Resource not available offline', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
        );
        return;
    }

    // Handle local resources (network-first)
    event.respondWith(
        fetch(request)
            .then(response => {
                if (response.ok) {
                    const cache = caches.open(CACHE_NAME);
                    cache.then(c => c.put(request, response.clone()));
                }
                return response;
            })
            .catch(() => {
                return caches.match(request).then(response => {
                    return response || new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});

// Background Sync for auto-uploads
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-uploads') {
        event.waitUntil(
            (async () => {
                try {
                    // Get pending uploads from IndexedDB
                    const db = await openIndexedDB();
                    const pendingUploads = await getPendingUploads(db);

                    for (const upload of pendingUploads) {
                        try {
                            await uploadVideo(upload);
                            await removePendingUpload(db, upload.id);

                            // Notify all clients about successful upload
                            const clients = await self.clients.matchAll();
                            clients.forEach(client => {
                                client.postMessage({
                                    type: 'UPLOAD_SUCCESS',
                                    id: upload.id,
                                    message: `Video "${upload.title}" erfolgreich hochgeladen!`
                                });
                            });
                        } catch (err) {
                            console.error('[SW] Upload failed:', err);
                        }
                    }
                } catch (err) {
                    console.error('[SW] Background sync error:', err);
                }
            })()
        );
    }
});

// Push Notifications for upload status
self.addEventListener('push', (event) => {
    const data = event.data.json();
    const options = {
        body: data.message || 'Reel Generator Update',
        icon: '../icon-192.png',
        badge: '../icon-192.png',
        tag: 'reel-notification',
        requireInteraction: false,
        actions: [
            {
                action: 'open',
                title: 'Öffnen',
                icon: '../icon-192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Reel Generator', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({type: 'window'}).then((clientList) => {
            for (let client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('index.html');
            }
        })
    );
});

// Helper functions for IndexedDB
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('reel-generator-db', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('uploads')) {
                db.createObjectStore('uploads', {keyPath: 'id'});
            }
            if (!db.objectStoreNames.contains('projects')) {
                const store = db.createObjectStore('projects', {keyPath: 'id'});
                store.createIndex('createdAt', 'createdAt');
            }
        };
    });
}

function getPendingUploads(db) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('uploads', 'readonly');
        const store = tx.objectStore('uploads');
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

function removePendingUpload(db, id) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('uploads', 'readwrite');
        const store = tx.objectStore('uploads');
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

async function uploadVideo(upload) {
    const formData = new FormData();
    formData.append('video', new Blob([upload.data]));
    formData.append('title', upload.title);
    formData.append('description', upload.description);
    formData.append('platform', upload.platform);

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
}

console.log('[SW] Service Worker script loaded');
