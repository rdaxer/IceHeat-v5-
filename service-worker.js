// IceHeat Service Worker — Offline PWA
const CACHE = 'iceheat-v5-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500;600&display=swap',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      // Nur eigene Assets cachen, externe CDN-Ressourcen werden beim Fetch gecacht
      cache.addAll(['./', './index.html', './manifest.json'])
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Für API-Calls (anthropic.com) → immer Network
  if (e.request.url.includes('api.anthropic.com')) return;
  // Für OpenCV (groß, braucht Network beim ersten Load)
  if (e.request.url.includes('opencv.js')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // Erfolgreiche Responses cachen
        if (resp && resp.status === 200 && resp.type !== 'opaque') {
          const clone = resp.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return resp;
      }).catch(() => {
        // Offline Fallback: index.html
        if (e.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
